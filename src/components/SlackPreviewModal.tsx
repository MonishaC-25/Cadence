import React, { useState } from 'react';
import { Meeting, Task } from '../types';
import { X, Send, Check, Hash, MessageSquare, ExternalLink, Copy } from 'lucide-react';
import { copyToClipboard } from '../utils/calendar';

interface SlackPreviewModalProps {
  meeting: Meeting;
  tasks: Task[];
  slackChannel: string;
  onClose: () => void;
}

export const SlackPreviewModal: React.FC<SlackPreviewModalProps> = ({
  meeting,
  tasks,
  slackChannel,
  onClose,
}) => {
  const [sent, setSent] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const meetingTasks = tasks.filter((t) => t.meetingId === meeting.id);

  const webhookPayload = {
    channel: slackChannel || '#engineering-sync',
    username: 'Cadence Meeting Intelligence',
    icon_emoji: ':robot_face:',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `📋 Meeting Brief: ${meeting.title}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Host:* ${meeting.hostName}  |  *Date:* ${meeting.date} at ${meeting.time}\n*Agenda:* ${meeting.agenda}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Executive TL;DR:*\n${meeting.executiveSummary.map((s) => `• ${s}`).join('\n')}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Key Decisions Approved:*\n${meeting.keyDecisions.map((d) => `• *${d.decision}* (${d.impact})`).join('\n')}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Action Items (${meetingTasks.length}):*\n${meetingTasks.map((t) => `• [${t.priority.toUpperCase()}] *${t.ownerName || 'Unassigned'}*: ${t.description} _(Due: ${t.deadlineDisplay || t.deadline || 'TBD'})_`).join('\n')}`,
        },
      },
    ],
  };

  const handleSend = () => {
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 1800);
  };

  const handleCopyJson = async () => {
    await copyToClipboard(JSON.stringify(webhookPayload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl my-auto max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
              #
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Slack Live Webhook Broadcast Preview
              </h3>
              <p className="text-xs text-slate-400">
                Visual preview of the message card sent to your company Slack workspace.
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
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-mono text-emerald-400">
              <Hash className="w-3.5 h-3.5" />
              <span>Target: {slackChannel || '#engineering-sync'}</span>
            </span>
            <button
              onClick={handleCopyJson}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedPayload ? 'JSON Copied' : 'Copy Raw Webhook JSON'}</span>
            </button>
          </div>

          {/* Realistic Slack Card UI */}
          <div className="bg-[#1A1D21] border border-[#2C3136] rounded-xl p-4 text-[#D1D2D3] font-sans text-xs space-y-3 shadow-lg">
            {/* Bot message header */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                Cd
              </div>
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">Cadence</span>
                  <span className="bg-[#2C3136] text-[10px] px-1 py-0.2 rounded text-[#ABACAD] font-mono">
                    APP
                  </span>
                  <span className="text-[10px] text-[#ABACAD] font-mono">Today at {meeting.time || '10:00 AM'}</span>
                </div>

                <div className="border-l-4 border-emerald-400 pl-3 py-1 space-y-2.5 mt-2 bg-[#222529]/60 rounded-r-lg p-2.5">
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <span>📋</span>
                    <span>Meeting Brief: {meeting.title}</span>
                  </h4>

                  <p className="text-[11px] text-[#ABACAD]">
                    <strong className="text-white">Host:</strong> {meeting.hostName} ·{' '}
                    <strong className="text-white">Date:</strong> {meeting.date} ·{' '}
                    <strong className="text-white">Duration:</strong> {meeting.durationMinutes} mins
                  </p>

                  {/* Summary */}
                  <div>
                    <p className="font-semibold text-white mb-1">Executive Summary:</p>
                    <ul className="space-y-1 text-[11px] text-[#D1D2D3]">
                      {meeting.executiveSummary.map((s, idx) => (
                        <li key={idx}>• {s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Decisions */}
                  {meeting.keyDecisions.length > 0 && (
                    <div>
                      <p className="font-semibold text-white mb-1">Key Decisions Approved:</p>
                      <ul className="space-y-1 text-[11px] text-[#D1D2D3]">
                        {meeting.keyDecisions.map((d) => (
                          <li key={d.id}>• <strong>{d.decision}</strong> ({d.impact})</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tasks */}
                  <div>
                    <p className="font-semibold text-white mb-1">
                      Action Items ({meetingTasks.length}):
                    </p>
                    <div className="space-y-1 text-[11px]">
                      {meetingTasks.map((t) => (
                        <div key={t.id} className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>
                            <strong className="text-white">@{t.ownerName || 'unassigned'}</strong>: {t.description}{' '}
                            <span className="text-[#ABACAD] font-mono">({t.deadlineDisplay || t.deadline || 'TBD'})</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Button Preview */}
                  <div className="pt-2 flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#2C3136] hover:bg-[#383F45] text-white rounded text-[11px] font-medium border border-[#3E444B] cursor-default">
                      View Full MoM in Cadence →
                    </span>
                    <span className="px-3 py-1 bg-[#2C3136] hover:bg-[#383F45] text-white rounded text-[11px] font-medium border border-[#3E444B] cursor-default">
                      Add to Calendar
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/70 flex justify-between items-center">
          <span className="text-xs text-slate-500">
            Powered by Cadence Incoming Webhook API
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sent}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              {sent ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
              <span>{sent ? 'Dispatched to Slack!' : 'Broadcast to Slack Channel'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
