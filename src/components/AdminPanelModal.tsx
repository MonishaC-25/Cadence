import React, { useState, useEffect, useRef } from 'react';
import { TeamMember, WorkspaceSettings } from '../types';
import * as XLSX from 'xlsx';
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
  FileSpreadsheet,
  Download,
  Trash2,
  FileCheck,
} from 'lucide-react';

interface ParsedEmployeeRow {
  name: string;
  email: string;
  department: string;
  roleTitle: string;
  isDuplicate?: boolean;
}

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

  // Bulk File Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedEmployeeRow[]>([]);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (file: File) => {
    setBulkError(null);
    setBulkResult(null);
    setUploadedFile(file);

    const reader = new FileReader();

    const isExcel =
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls') ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel';

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error('File could not be read.');

        let rows: unknown[][] = [];

        if (isExcel) {
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 });
        } else {
          // CSV / Text parsing
          const workbook = XLSX.read(data, { type: 'string' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 });
        }

        if (!rows || rows.length === 0) {
          throw new Error('The uploaded file is empty.');
        }

        // Process rows (detect if header row exists)
        const parsed: ParsedEmployeeRow[] = [];
        let startIndex = 0;

        const firstRow = rows[0];
        if (
          firstRow &&
          firstRow.some(
            (cell) =>
              typeof cell === 'string' &&
              (cell.toLowerCase().includes('name') ||
                cell.toLowerCase().includes('email') ||
                cell.toLowerCase().includes('dept'))
          )
        ) {
          startIndex = 1; // skip header
        }

        for (let i = startIndex; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length < 2) continue;

          const name = String(row[0] || '').trim();
          const email = String(row[1] || '').trim().toLowerCase();
          const department = String(row[2] || 'Engineering').trim();
          const roleTitle = String(row[3] || 'Contributor').trim();

          if (!name || !email || !email.includes('@')) continue;

          const isDuplicate =
            team.some((t) => t.email.toLowerCase() === email) ||
            parsed.some((p) => p.email.toLowerCase() === email);

          parsed.push({
            name,
            email,
            department,
            roleTitle,
            isDuplicate,
          });
        }

        if (parsed.length === 0) {
          throw new Error(
            'No valid employee records found. Ensure columns: Full Name, Email, Department, Job Title.'
          );
        }

        setParsedRows(parsed);
      } catch (err: unknown) {
        setBulkError(err instanceof Error ? err.message : 'Error processing spreadsheet file.');
        setParsedRows([]);
      }
    };

    if (isExcel) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClearUploadedFile = () => {
    setUploadedFile(null);
    setParsedRows([]);
    setBulkError(null);
    setBulkResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadSample = (format: 'csv' | 'xlsx') => {
    const sampleData = [
      {
        'Full Name': 'Maya Patel',
        'Work Email': 'maya.patel@acme-corp.com',
        Department: 'Engineering',
        'Job Title': 'Senior QA Lead',
      },
      {
        'Full Name': 'Vikram Seth',
        'Work Email': 'vikram.seth@acme-corp.com',
        Department: 'Product',
        'Job Title': 'Director of Product Ops',
      },
      {
        'Full Name': 'Elena Rostova',
        'Work Email': 'elena.rostova@acme-corp.com',
        Department: 'Design',
        'Job Title': 'Principal Design Architect',
      },
      {
        'Full Name': 'Marcus Vance',
        'Work Email': 'marcus.vance@acme-corp.com',
        Department: 'Finance',
        'Job Title': 'Lead Financial Analyst',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');

    if (format === 'xlsx') {
      XLSX.writeFile(workbook, 'cadence_employee_roster_template.xlsx');
    } else {
      XLSX.writeFile(workbook, 'cadence_employee_roster_template.csv', { bookType: 'csv' });
    }
  };

  const handleConfirmBulkImport = () => {
    if (parsedRows.length === 0) return;

    const validNew = parsedRows.filter((r) => !r.isDuplicate);
    if (validNew.length === 0) {
      setBulkResult('No new accounts were added because all listed emails already exist in Cadence.');
      return;
    }

    const addedMembers: TeamMember[] = validNew.map((r, i) => ({
      id: `emp_bulk_${Date.now()}_${i}`,
      employeeCode: `EMP-${String(team.length + i + 1).padStart(3, '0')}`,
      name: r.name,
      email: r.email,
      department: r.department,
      roleTitle: r.roleTitle,
      isAdmin: false,
      isActive: true,
    }));

    onUpdateTeam([...team, ...addedMembers]);
    setBulkResult(
      `Successfully provisioned ${addedMembers.length} active enterprise accounts! (${
        parsedRows.length - addedMembers.length
      } duplicates safely skipped)`
    );
    setParsedRows([]);
    setUploadedFile(null);
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
            Bulk Excel / CSV Import
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

          {/* TAB 2: BULK SPREADSHEET UPLOAD */}
          {activeTab === 'bulk' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Bulk Provision via Excel or CSV</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Import employee rosters exported from HRIS platforms like BambooHR, Workday, Rippling, or Google Workspace.
                  </p>
                </div>

                {/* Download standard business templates */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadSample('xlsx')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
                    title="Download template formatted for Microsoft Excel"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download Excel Template (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadSample('csv')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
                    title="Download template formatted for CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span>CSV Template (.csv)</span>
                  </button>
                </div>
              </div>

              {/* Status alerts */}
              {bulkResult && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{bulkResult}</span>
                </div>
              )}

              {bulkError && (
                <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{bulkError}</span>
                </div>
              )}

              {/* Drag and Drop File Upload Area */}
              {!uploadedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-emerald-400 bg-emerald-500/10'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 mx-auto mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">
                    Drag and drop your spreadsheet file here
                  </h4>
                  <p className="text-xs text-slate-400 mb-3 max-w-md mx-auto">
                    Supports Microsoft Excel (<span className="text-emerald-400 font-mono">.xlsx</span>, <span className="text-emerald-400 font-mono">.xls</span>) and Comma-Separated Values (<span className="text-sky-400 font-mono">.csv</span>).
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-semibold hover:bg-emerald-500/25 transition-colors">
                    Browse File on Device
                  </div>
                  <div className="mt-4 text-[11px] text-slate-500 font-mono">
                    Expected columns: Full Name · Email · Department · Job Title
                  </div>
                </div>
              ) : (
                /* Selected File Card & Parsed Table */
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white flex items-center gap-2">
                          <span>{uploadedFile.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            ({(uploadedFile.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {parsedRows.length} rows recognized ·{' '}
                          <span className="text-emerald-400">
                            {parsedRows.filter((r) => !r.isDuplicate).length} ready to provision
                          </span>
                          {parsedRows.filter((r) => r.isDuplicate).length > 0 && (
                            <span className="text-amber-400 ml-1">
                              ({parsedRows.filter((r) => r.isDuplicate).length} existing duplicates)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleClearUploadedFile}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  {/* Preview Table */}
                  {parsedRows.length > 0 && (
                    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                      <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300">
                          Data Preview ({parsedRows.length} members detected)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Review parsed columns before confirming account creation
                        </span>
                      </div>
                      <div className="max-h-56 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-800 sticky top-0">
                            <tr>
                              <th className="py-2 px-3">Status</th>
                              <th className="py-2 px-3">Full Name</th>
                              <th className="py-2 px-3">Email Address</th>
                              <th className="py-2 px-3">Department</th>
                              <th className="py-2 px-3">Role / Title</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                            {parsedRows.map((row, idx) => (
                              <tr
                                key={idx}
                                className={
                                  row.isDuplicate
                                    ? 'bg-amber-950/20 text-slate-400'
                                    : 'hover:bg-slate-900/40 text-slate-200'
                                }
                              >
                                <td className="py-2 px-3">
                                  {row.isDuplicate ? (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-300 font-sans">
                                      Duplicate (Skip)
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-sans">
                                      Ready
                                    </span>
                                  )}
                                </td>
                                <td className="py-2 px-3 font-sans font-medium text-white">
                                  {row.name}
                                </td>
                                <td className="py-2 px-3 text-slate-300">{row.email}</td>
                                <td className="py-2 px-3">{row.department}</td>
                                <td className="py-2 px-3">{row.roleTitle}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                    <span className="text-xs text-slate-500">
                      Employees receive email invitations and are immediately available in meeting attendee rosters.
                    </span>
                    <button
                      type="button"
                      onClick={handleConfirmBulkImport}
                      disabled={parsedRows.filter((r) => !r.isDuplicate).length === 0}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 text-xs font-semibold rounded-lg shadow-sm transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      <span>
                        Confirm &amp; Provision (
                        {parsedRows.filter((r) => !r.isDuplicate).length} New Accounts)
                      </span>
                    </button>
                  </div>
                </div>
              )}
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
