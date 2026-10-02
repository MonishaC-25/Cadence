import React, { useState } from 'react';
import { Meeting, Task, TeamMember } from '../types';
import { X, Copy, Check, Calendar, TrendingUp, AlertTriangle, ShieldCheck, Mail } from 'lucide-react';
import { copyToClipboard } from '../utils/calendar';

interface WeeklyDigestModalProps {
  meetings: Meeting[];
  tasks: Task[];
  team: TeamMember[];
  onClose: () => void;
}

export const WeeklyDigestModal: React.FC<WeeklyDigestModalProps> = ({
  meetings,
  tasks,
  team,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const completedTasks = tasks.filter((t) => t.status === 'done');
  const openTasks = tasks.filter((t) => t.status !== 'done');
  const urgentTasks = openTasks.filter((t) => t.priority === 'urgent' || t.priority === 'high');

  const allBlockers = meetings.flatMap((m) =>
    m.blockers.map((b) => ({ ...b, meetingTitle: m.title }))
  );

  const digestMarkdown = `# 📋 Cadence Monday Executive Briefing
*Prepared on: ${new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}*

## 🎯 Executive Summary
- **Total Active Meetings Tracked:** ${meetings.length} sessions
- **Sprint Completion Velocity:** ${completedTasks.length} / ${tasks.length} deliverables resolved (${Math.round((completedTasks.length / Math.max(1, tasks.length)) * 100)}%)
- **Active Open Deliverables:** ${openTasks.length} tasks

---

## ⚡ High-Priority Deliverables Due This Week (${urgentTasks.length})
${urgentTasks.map((t) => `- **[${t.priority.toUpperCase()}]** ${t.description} — *Owner: ${t.ownerName || 'Unassigned'}* (Due: ${t.deadlineDisplay || t.deadline || 'This Week'})`).join('\n')}

---

## 🛡️ Critical Blockers & Dependencies (${allBlockers.length})
${allBlockers.length === 0 ? '- *No active blockers flagged across projects.*' : allBlockers.map((b) => `- **${b.title}** (${b.severity.toUpperCase()} Severity) — *Mitigation: ${b.mitigation || 'Pending team alignment'}*`).join('\n')}

---

## ✅ Milestones Completed Last Week (${completedTasks.length})
${completedTasks.map((t) => `- ${t.description} (Resolved by ${t.ownerName || 'Team'})`).join('\n')}
`;

  const handleCopy = async () => {
    await copyToClipboard(digestMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Keyboard shortcut: Escape closes modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl my-auto max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Monday Morning Executive Digest
              </h2>
              <p className="text-xs text-slate-400">
                Automated weekly synthesis of milestones, upcoming deadlines, and unresolved blockers.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Due This Week</span>
              <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">{urgentTasks.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Completed Milestones</span>
              <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">{completedTasks.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Active Blockers</span>
              <span className="text-xl font-bold font-mono text-rose-400 tabular-nums">{allBlockers.length}</span>
            </div>
          </div>

          {/* Formatted Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Briefing Output (Markdown)</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Briefing'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">
              {digestMarkdown}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/70 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white"
          >
            Close
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Copy Executive Digest'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
