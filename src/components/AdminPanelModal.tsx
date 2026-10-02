import React, { useState, useEffect } from 'react';
import { TeamMember, WorkspaceSettings } from '../types';
import {
  X,
  Shield,
  Users,
  Upload,
  Webhook,
  Sliders,
  Check,
  AlertTriangle,
  Lock,
  Plus,
  RefreshCw,
  Send,
} from 'lucide-react';

interface AdminPanelModalProps {
  settings: WorkspaceSettings;
  team: TeamMember[];
  onClose: () => void;
  onUpdateSettings: (settings: WorkspaceSettings) => void;
  onUpdateTeam: (team: TeamMember[]) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  settings,
  team,
  onClose,
  onUpdateSettings,
  onUpdateTeam,
}) => {
  const [activeTab, setActiveTab] = useState<'employees' | 'bulk' | 'webhooks' | 'security'>('employees');
  const [localSettings, setLocalSettings] = useState<WorkspaceSettings>(settings);

  // Bulk CSV state
  const [bulkCsvText, setBulkCsvText] = useState(
    `Maya Patel, maya@company.com, Engineering, Senior QA Engineer\nVikram Seth, vikram@company.com, Product, Product Operations Lead\nElena Rostova, elena@company.com, Design, Design Systems Specialist`
  );
  const [bulkResult, setBulkResult] = useState<string | null>(null);

  // Webhook test state
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookSuccess, setWebhookSuccess] = useState(false);

  // Keyboard shortcut: Escape closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Add individual employee form
  const [singleName, setSingleName] = useState('');
  const [singleEmail, setSingleEmail] = useState('');
  const [singleDept, setSingleDept] = useState('Engineering');
  const [singleRole, setSingleRole] = useState('');
  const [singleAdmin, setSingleAdmin] = useState(false);

  const handleToggleActive = (memberId: string) => {
    const updated = team.map((m) =>
      m.id === memberId ? { ...m, isActive: m.isActive === false ? true : false } : m
    );
    onUpdateTeam(updated);
  };

  const handleToggleAdmin = (memberId: string) => {
    const updated = team.map((m) =>
      m.id === memberId ? { ...m, isAdmin: !m.isAdmin } : m
    );
    onUpdateTeam(updated);
  };

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleName.trim() || !singleEmail.trim()) return;

    const newMember: TeamMember = {
      id: `emp_${Date.now()}`,
      employeeCode: `EMP-${String(team.length + 1).padStart(3, '0')}`,
      name: singleName.trim(),
      email: singleEmail.trim().toLowerCase(),
      department: singleDept,
      roleTitle: singleRole.trim() || 'Contributor',
      isAdmin: singleAdmin,
      isActive: true,
    };

    onUpdateTeam([...team, newMember]);
    setSingleName('');
    setSingleEmail('');
    setSingleRole('');
  };

  const handleProcessBulkCsv = () => {
    if (!bulkCsvText.trim()) return;

    const lines = bulkCsvText.split('\n').map((l) => l.trim()).filter(Boolean);
    const added: TeamMember[] = [];
    let skipped = 0;

    lines.forEach((line, i) => {
      // Handle comma-separated fields: Name, Email, Dept, Role
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        const [name, email, dept, role] = parts;
        // Check duplicate email
        const exists = team.some((t) => t.email.toLowerCase() === email.toLowerCase()) ||
          added.some((a) => a.email.toLowerCase() === email.toLowerCase());

        if (exists) {
          skipped++;
        } else {
          added.push({
            id: `emp_bulk_${Date.now()}_${i}`,
            employeeCode: `EMP-${String(team.length + added.length + 1).padStart(3, '0')}`,
            name,
            email: email.toLowerCase(),
            department: dept || 'Engineering',
            roleTitle: role || 'Team Member',
            isAdmin: false,
            isActive: true,
          });
        }
      }
    });

    if (added.length > 0) {
      onUpdateTeam([...team, ...added]);
      setBulkResult(`Successfully provisioned ${added.length} accounts. (${skipped} duplicates skipped)`);
      setBulkCsvText('');
    } else {
      setBulkResult(`No new accounts added. (${skipped} duplicate emails found)`);
    }
  };

  const handleTestWebhook = () => {
    setTestingWebhook(true);
    setWebhookSuccess(false);
    setTimeout(() => {
      setTestingWebhook(false);
      setWebhookSuccess(true);
      setTimeout(() => setWebhookSuccess(false), 3500);
    }, 900);
  };

  const handleSaveSettings = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl my-auto max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Workspace Administration Console</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                  Enterprise
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Manage organizational directory, identity provisioning, webhook alerts, and security policies.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800 bg-slate-900 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('employees')}
            className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'employees'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Directory ({team.length})
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'bulk'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Bulk CSV Upload
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'webhooks'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Slack &amp; Webhooks
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'security'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Security &amp; Retention
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* TAB 1: EMPLOYEES */}
          {activeTab === 'employees' && (
            <div className="space-y-6">
              {/* Quick Add Form */}
              <form
                onSubmit={handleAddSingle}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3"
              >
                <h4 className="text-xs font-semibold text-slate-300">Invite New Employee</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <input
                    type="text"
                    required
                    value={singleName}
                    onChange={(e) => setSingleName(e.target.value)}
                    placeholder="Full name"
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                  <input
                    type="email"
                    required
                    value={singleEmail}
                    onChange={(e) => setSingleEmail(e.target.value)}
                    placeholder="Email address"
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    value={singleRole}
                    onChange={(e) => setSingleRole(e.target.value)}
                    placeholder="Role (e.g. Lead QA)"
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold rounded flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Invite</span>
                  </button>
                </div>
              </form>

              {/* Roster Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3.5">Employee</th>
                      <th className="py-2.5 px-3.5">Department</th>
                      <th className="py-2.5 px-3.5">Role</th>
                      <th className="py-2.5 px-3.5">Permissions</th>
                      <th className="py-2.5 px-3.5">Status</th>
                      <th className="py-2.5 px-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {team.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-900/50">
                        <td className="py-2.5 px-3.5 font-medium text-white">
                          <p>{m.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{m.email}</p>
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-300">{m.department}</td>
                        <td className="py-2.5 px-3.5 text-slate-300">{m.roleTitle}</td>
                        <td className="py-2.5 px-3.5">
                          <button
                            type="button"
                            onClick={() => handleToggleAdmin(m.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                              m.isAdmin
                                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            {m.isAdmin ? 'Admin' : 'Member'}
                          </button>
                        </td>
                        <td className="py-2.5 px-3.5">
                          <span
                            className={`text-[11px] font-medium ${
                              m.isActive === false ? 'text-slate-500' : 'text-emerald-400'
                            }`}
                          >
                            {m.isActive === false ? 'Deactivated' : 'Active'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(m.id)}
                            className="text-xs text-slate-400 hover:text-white underline underline-offset-2"
                          >
                            {m.isActive === false ? 'Reactivate' : 'Deactivate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: BULK CSV UPLOAD */}
          {activeTab === 'bulk' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Bulk Provision Team Accounts</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Paste rows or CSV export from BambooHR, Workday, or Google Workspace:
                  <span className="font-mono text-emerald-400 block mt-1">
                    Format: Full Name, Email, Department, Job Title
                  </span>
                </p>
              </div>

              {bulkResult && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{bulkResult}</span>
                </div>
              )}

              <textarea
                rows={8}
                value={bulkCsvText}
                onChange={(e) => setBulkCsvText(e.target.value)}
                placeholder="Maya Patel, maya@company.com, Engineering, Senior QA Engineer..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-emerald-500"
              />

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-slate-500">
                  Duplicate emails are automatically de-duplicated.
                </span>
                <button
                  type="button"
                  onClick={handleProcessBulkCsv}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import &amp; Provision Accounts</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: WEBHOOKS & NOTIFICATIONS */}
          {activeTab === 'webhooks' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-white">Collaboration Integrations</h3>
                <p className="text-xs text-slate-400">
                  Configure real-time broadcasts for newly extracted action items and executive meeting briefs.
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs">
                      #
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Slack Webhook Broadcast</h4>
                      <p className="text-[11px] text-slate-400">
                        Post confirmed meeting recaps &amp; assigned deliverables automatically
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.autoSlackBroadcast}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, autoSlackBroadcast: e.target.checked })
                      }
                      className="accent-emerald-400"
                    />
                    <span className="text-xs text-slate-300">Enabled</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] uppercase text-slate-400 font-semibold mb-1">
                      Target Slack Channel
                    </label>
                    <input
                      type="text"
                      value={localSettings.slackChannel}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, slackChannel: e.target.value })
                      }
                      placeholder="#engineering-sync"
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase text-slate-400 font-semibold mb-1">
                      Incoming Webhook URL
                    </label>
                    <input
                      type="text"
                      value={localSettings.slackWebhookUrl}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, slackWebhookUrl: e.target.value })
                      }
                      placeholder="https://hooks.slack.com/services/..."
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Payload test sends simulated executive briefing card to channel.
                  </span>
                  <button
                    type="button"
                    onClick={handleTestWebhook}
                    disabled={testingWebhook}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors"
                  >
                    {testingWebhook ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : webhookSuccess ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{webhookSuccess ? 'Test Sent (200 OK)' : 'Send Test Ping'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY & RETENTION */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-white">Compliance &amp; Data Lifecycle</h3>
                <p className="text-xs text-slate-400">
                  Manage GDPR, SOC 2 audio retention windows and enterprise SSO controls.
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Audio Retention Window</h4>
                    <p className="text-[11px] text-slate-400">
                      Automatically purge raw voice recordings from cloud buckets after set days.
                    </p>
                  </div>
                  <select
                    value={localSettings.audioRetentionDays}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        audioRetentionDays: Number(e.target.value),
                      })
                    }
                    className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded px-3 py-1.5"
                  >
                    <option value={30}>30 Days (Recommended)</option>
                    <option value={60}>60 Days</option>
                    <option value={90}>90 Days</option>
                    <option value={365}>1 Year</option>
                  </select>
                </div>

                <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Enforce Corporate SSO Login</h4>
                    <p className="text-[11px] text-slate-400">
                      Require Google Workspace or Microsoft 365 SAML authentication.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.enforceSSO}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, enforceSSO: e.target.checked })
                    }
                    className="accent-emerald-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/70 flex justify-between items-center">
          <span className="text-xs text-slate-500 font-mono">
            {localSettings.companyName} · Admin Policy v2.4
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold rounded-lg shadow-sm"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
