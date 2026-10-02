import React, { useState } from 'react';
import { Task } from '../types';
import { X, Copy, Check, Terminal, Code2, ExternalLink } from 'lucide-react';
import { copyToClipboard } from '../utils/calendar';

interface DeveloperSyncModalProps {
  task: Task;
  onClose: () => void;
}

export const DeveloperSyncModal: React.FC<DeveloperSyncModalProps> = ({ task, onClose }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const ghCliCommand = `gh issue create --title "${task.description.replace(/"/g, '\\"')}" --body "### Origin Meeting\\n${task.meetingTitle}\\n\\n### Context from Transcript\\n> ${task.sourceQuote || 'Action item extracted from Cadence.'}\\n\\n### Target Deadline\\n${task.deadlineDisplay || task.deadline || 'Next sprint'}" --label "${task.priority.toUpperCase()}"`;

  const linearMarkdown = `### Task
${task.description}

### Context & Transcribed Requirement
> "${task.sourceQuote || 'Recorded during Cadence meeting session'}"

- **Meeting Origin:** ${task.meetingTitle}
- **Assigned:** @${task.ownerName ? task.ownerName.toLowerCase().replace(/\s+/g, '') : 'unassigned'}
- **Priority:** ${task.priority.toUpperCase()}
- **Due Date:** ${task.deadlineDisplay || task.deadline || 'TBD'}
`;

  const handleCopy = async (text: string, type: string) => {
    await copyToClipboard(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>Sync to GitHub / Linear / Jira</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Instantly convert meeting action items into developer issue tracker tickets.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* GitHub CLI option */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>GitHub CLI (`gh issue create`)</span>
              </span>
              <button
                onClick={() => handleCopy(ghCliCommand, 'gh')}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
              >
                {copiedType === 'gh' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === 'gh' ? 'Copied' : 'Copy Command'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {ghCliCommand}
            </pre>
          </div>

          {/* Linear / Jira Markdown */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">
                Linear / Jira Ticket Markdown
              </span>
              <button
                onClick={() => handleCopy(linearMarkdown, 'linear')}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
              >
                {copiedType === 'linear' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === 'linear' ? 'Copied' : 'Copy Markdown'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {linearMarkdown}
            </pre>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
