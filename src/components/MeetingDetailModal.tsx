import React, { useState } from 'react';
import { Meeting, Task, TeamMember, TaskStatus } from '../types';
import {
  X,
  Calendar,
  Clock,
  User,
  Users,
  Download,
  Copy,
  Check,
  FileText,
  Mail,
  ListTodo,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Plus,
  Send,
  Trash2,
  Lock,
  Building,
  Globe,
  PieChart,
  Code2,
  DollarSign,
  TrendingUp,
  Radio,
  Printer,
  Edit3,
  Edit2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { AudioPlayerBar } from './AudioPlayerBar';
import { downloadMeetingIcs, downloadTaskIcs, copyToClipboard } from '../utils/calendar';
import { requestFollowUpEmail, requestCatchMeUp } from '../services/api';
import { DeveloperSyncModal } from './DeveloperSyncModal';
import { SlackPreviewModal } from './SlackPreviewModal';
import { ExecutivePdfReport } from './ExecutivePdfReport';
import { EditMeetingModal } from './EditMeetingModal';
import { EditTaskModal } from './EditTaskModal';
import { calculateMeetingCost } from '../utils/costCalculator';

interface MeetingDetailModalProps {
  meeting: Meeting;
  tasks: Task[];
  team: TeamMember[];
  activeUser: TeamMember;
  onClose: () => void;
  onUpdateMeeting: (updatedMeeting: Meeting) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateTaskOwner: (taskId: string, newOwnerId: string | null) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onDeleteMeeting: (meetingId: string) => void;
  onAskCadenceAboutThisMeeting?: (meetingId: string) => void;
  initialTab?: 'overview' | 'tasks' | 'transcript' | 'analytics' | 'roi' | 'mom';
  highlightedTaskId?: string;
}

export const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({
  meeting,
  tasks,
  team,
  activeUser,
  onClose,
  onUpdateMeeting,
  onUpdateTaskStatus,
  onUpdateTaskOwner,
  onUpdateTask,
  onDeleteTask,
  onAddTask,
  onDeleteMeeting,
  onAskCadenceAboutThisMeeting,
  initialTab,
  highlightedTaskId,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'transcript' | 'analytics' | 'roi' | 'mom'>(
    initialTab || (highlightedTaskId ? 'tasks' : 'overview')
  );
  const [isMaximized, setIsMaximized] = useState(true);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [emailDraft, setEmailDraft] = useState<string | null>(null);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [seekTime, setSeekTime] = useState<number | null>(null);

  // Catch Me Up state
  const [showCatchMeUp, setShowCatchMeUp] = useState(false);
  const [catchMeUpLoading, setCatchMeUpLoading] = useState(false);
  const [catchMeUpBullets, setCatchMeUpBullets] = useState<string[]>([]);

  // Modals state
  const [isEditingMeeting, setIsEditingMeeting] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [syncingTask, setSyncingTask] = useState<Task | null>(null);
  const [showSlackPreview, setShowSlackPreview] = useState(false);
  const [showPdfReport, setShowPdfReport] = useState(false);

  // Keyboard shortcut: Escape closes modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showPdfReport) {
          setShowPdfReport(false);
        } else if (showSlackPreview) {
          setShowSlackPreview(false);
        } else if (showCatchMeUp) {
          setShowCatchMeUp(false);
        } else if (isEditingMeeting) {
          setIsEditingMeeting(false);
        } else if (editingTask) {
          setEditingTask(null);
        } else if (syncingTask) {
          setSyncingTask(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPdfReport, showSlackPreview, showCatchMeUp, isEditingMeeting, editingTask, syncingTask, onClose]);

  // New task form state
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskOwner, setNewTaskOwner] = useState<string>('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');

  const meetingTasks = tasks.filter((t) => t.meetingId === meeting.id);
  const attendees = team.filter((m) => meeting.attendeeIds.includes(m.id));
  const costDetails = calculateMeetingCost(meeting, tasks, team);

  const canDelete = activeUser.isAdmin || meeting.hostId === activeUser.id;

  // Speaker talk time calculations
  const speakerStats = React.useMemo(() => {
    const stats: Record<string, number> = {};
    let totalWords = 0;

    meeting.diarizedSegments.forEach((seg) => {
      const words = seg.text.trim().split(/\s+/).length;
      stats[seg.speaker] = (stats[seg.speaker] || 0) + words;
      totalWords += words;
    });

    const breakdown = Object.entries(stats).map(([speaker, words]) => {
      const pct = totalWords > 0 ? Math.round((words / totalWords) * 100) : 0;
      return { speaker, words, pct };
    });

    breakdown.sort((a, b) => b.pct - a.pct);
    return { breakdown, totalWords };
  }, [meeting.diarizedSegments]);

  const handleCopyEmail = async () => {
    let text = emailDraft;
    if (!text) {
      setIsGeneratingEmail(true);
      text = await requestFollowUpEmail(
        meeting.title,
        meeting.executiveSummary,
        meeting.keyDecisions.map((d) => d.decision),
        meetingTasks.map((t) => ({
          description: t.description,
          ownerName: t.ownerName || undefined,
          deadline: t.deadlineDisplay || t.deadline || undefined,
        }))
      );
      setEmailDraft(text);
      setIsGeneratingEmail(false);
    }

    if (text) {
      await copyToClipboard(text);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleCatchMeUp = async () => {
    setShowCatchMeUp(true);
    setCatchMeUpLoading(true);
    const bullets = await requestCatchMeUp(
      meeting.title,
      Math.round(meeting.durationMinutes / 2) || 15,
      meeting.transcriptText.slice(0, 1500)
    );
    setCatchMeUpBullets(bullets);
    setCatchMeUpLoading(false);
  };

  const handleCopyMarkdown = async () => {
    const md = `# ${meeting.title}
**Date:** ${meeting.date} ${meeting.time || '10:00'} | **Modality:** ${meeting.modality?.toUpperCase() || 'ONLINE'} | **Host:** ${meeting.hostName}
**Duration:** ${meeting.durationMinutes} mins | **Meeting Investment:** $${costDetails.totalCost}

## Executive Summary
${meeting.executiveSummary.map((s) => `- ${s}`).join('\n')}

## Key Decisions
${meeting.keyDecisions.map((d) => `- **${d.decision}**: ${d.impact}${d.context ? ` *(${d.context})*` : ''}`).join('\n')}

## Action Items (${meetingTasks.length})
${meetingTasks.map((t) => `- [${t.status === 'done' ? 'x' : ' '}] **${t.description}** — Owner: ${t.ownerName || 'Unassigned'} | Due: ${t.deadlineDisplay || t.deadline || 'TBD'} | Priority: ${t.priority.toUpperCase()}`).join('\n')}

${meeting.blockers && meeting.blockers.length > 0 ? `## Blockers & Risks\n${meeting.blockers.map((b) => `- **[${b.severity.toUpperCase()}]** ${b.title}${b.mitigation ? ` (Mitigation: ${b.mitigation})` : ''}`).join('\n')}\n` : ''}
---
*Exported from Cadence Meeting Intelligence*`;

    await copyToClipboard(md);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskDesc.trim()) return;

    const matchedMember = team.find((m) => m.id === newTaskOwner);

    onAddTask({
      meetingId: meeting.id,
      meetingTitle: meeting.title,
      description: newTaskDesc.trim(),
      ownerId: newTaskOwner || null,
      ownerName: matchedMember?.name || null,
      priority: 'high',
      status: 'pending',
      deadline: newTaskDeadline || null,
      deadlineDisplay: newTaskDeadline || 'Next sprint',
    });

    setNewTaskDesc('');
    setNewTaskOwner('');
    setNewTaskDeadline('');
    setIsAddingTask(false);
  };

  const parseTimestampSeconds = (timeStr: string) => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return 0;
  };

  const handleJumpToTimestamp = (timeStr: string) => {
    const seconds = parseTimestampSeconds(timeStr);
    setSeekTime(seconds);
  };

  const handleDelete = () => {
    if (confirm(`Permanently delete "${meeting.title}" and purge all audio and transcript records?`)) {
      onDeleteMeeting(meeting.id);
      onClose();
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isMaximized ? 'p-0' : 'p-2 sm:p-4 md:p-6'} bg-slate-950/90 backdrop-blur-md overflow-hidden transition-all duration-200`}>
      <div className={`bg-slate-900 border border-slate-800 ${isMaximized ? 'w-full h-full rounded-none' : 'rounded-2xl w-full max-w-[1500px] h-[96vh] my-auto'} flex flex-col shadow-2xl overflow-hidden transition-all duration-200`}>
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/75 shrink-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0 pr-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-mono">{meeting.date}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{meeting.time || '10:00'}</span>
              <span aria-hidden="true">·</span>
              <span>Hosted by {meeting.hostName}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-mono text-[11px] font-semibold">
                {meeting.modality?.toUpperCase() || 'ONLINE'}
              </span>
              {meeting.locationOrLink && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-300 font-mono truncate max-w-[260px]">
                    📍 {meeting.locationOrLink}
                  </span>
                </>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
              {meeting.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-4xl">
              {meeting.agenda}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Edit Meeting Details (Host / Admin only) */}
            {(activeUser.isAdmin || meeting.hostId === activeUser.id) && (
              <button
                onClick={() => setIsEditingMeeting(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
                title="Edit meeting title, agenda, and settings"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Edit Details</span>
              </button>
            )}

            {/* Export Markdown Brief */}
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
              title="Copy clean formatted Markdown brief for Notion, Jira, or Obsidian"
            >
              {copiedMarkdown ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Brief Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-sky-400" />
                  <span>Export .md</span>
                </>
              )}
            </button>

            {/* Executive PDF Report Button */}
            <button
              onClick={() => setShowPdfReport(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
              title="Download or Print Executive PDF Report"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Executive PDF</span>
            </button>

            {/* Ask Cadence about this meeting */}
            {onAskCadenceAboutThisMeeting && (
              <button
                onClick={() => onAskCadenceAboutThisMeeting(meeting.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-500/40 transition-colors"
                title="Query AI intelligence scoped specifically to this meeting"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ask Cadence</span>
              </button>
            )}

            {/* Catch Me Up for late joiners */}
            <button
              onClick={handleCatchMeUp}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
              title="Get a 3-bullet briefing of what happened so far"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Catch Me Up</span>
            </button>

            {/* Slack broadcast button */}
            <button
              onClick={() => setShowSlackPreview(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-amber-500/30 bg-amber-950/20 hover:bg-amber-950/40 text-amber-300 transition-colors"
              title="Preview and broadcast to Slack"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Slack Webhook</span>
            </button>

            <button
              onClick={() => downloadMeetingIcs(meeting)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>.ics</span>
            </button>

            <button
              onClick={handleCopyEmail}
              disabled={isGeneratingEmail}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-medium rounded-lg border border-emerald-500/30 transition-colors"
            >
              {copiedEmail ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Recap</span>
                </>
              )}
            </button>

            {canDelete && (
              <button
                onClick={handleDelete}
                className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                title="Permanently erase meeting"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition-colors ml-1"
              title={isMaximized ? "Restore window size" : "Expand to full screen"}
            >
              {isMaximized ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800 bg-slate-900 shrink-0 flex items-center gap-1 sm:gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Executive Brief
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Action Items</span>
            <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400 tabular-nums">
              {meetingTasks.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('transcript')}
            className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'transcript'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Synchronized Transcript
          </button>
          <button
            onClick={() => setActiveTab('roi')}
            className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'roi'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Meeting ROI &amp; Payroll Cost</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChart className="w-3.5 h-3.5 text-sky-400" />
            <span>Voice &amp; Engagement</span>
          </button>
          <button
            onClick={() => setActiveTab('mom')}
            className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'mom'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Formal Minutes (MoM)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-7">
          {/* Catch Me Up Slide-in Card */}
          {showCatchMeUp && (
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl space-y-2 relative">
              <button
                onClick={() => setShowCatchMeUp(false)}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>Catch Me Up Briefing (Late Joiner Summary)</span>
              </div>
              {catchMeUpLoading ? (
                <p className="text-xs text-slate-400">Synthesizing opening discussion points...</p>
              ) : (
                <ul className="space-y-1.5 text-xs text-slate-300 pt-1">
                  {catchMeUpBullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Audio Player Widget */}
          <AudioPlayerBar
            fileName={meeting.audioFileName || `${meeting.title.toLowerCase().replace(/\s+/g, '_')}_audio.mp3`}
            totalDurationSeconds={meeting.audioDurationSeconds || meeting.durationMinutes * 60}
            seekTime={seekTime}
            onSeekHandled={() => setSeekTime(null)}
          />

          {/* TAB 1: EXECUTIVE BRIEF */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    Executive TL;DR Summary
                  </h3>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  {meeting.executiveSummary.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Decisions */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    Key Decisions Log
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {meeting.keyDecisions.length} recorded
                  </span>
                </div>
                {meeting.keyDecisions.length === 0 ? (
                  <p className="text-xs text-slate-500">No official decisions logged for this session.</p>
                ) : (
                  <div className="space-y-3">
                    {meeting.keyDecisions.map((dec) => (
                      <div
                        key={dec.id}
                        className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs"
                      >
                        <p className="font-semibold text-white mb-1">{dec.decision}</p>
                        <p className="text-slate-400">
                          <span className="text-slate-500 font-medium">Impact:</span> {dec.impact}
                        </p>
                        {dec.context && (
                          <p className="text-slate-500 mt-1 italic">Context: {dec.context}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Blockers & Risks Radar */}
              {meeting.blockers.length > 0 && (
                <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3 text-rose-400">
                    <ShieldAlert className="w-4 h-4" />
                    <h3 className="text-sm font-semibold tracking-tight">
                      Flagged Blockers &amp; Dependencies
                    </h3>
                  </div>
                  <div className="space-y-2.5">
                    {meeting.blockers.map((blk) => (
                      <div
                        key={blk.id}
                        className="bg-slate-900/80 border border-rose-900/30 rounded-lg p-3 text-xs"
                      >
                        <div className="flex items-center justify-between text-slate-200 font-medium mb-1">
                          <span>{blk.title}</span>
                          <span className="font-mono uppercase text-[10px] text-rose-400 font-semibold">
                            {blk.severity} Severity
                          </span>
                        </div>
                        {blk.mitigation && (
                          <p className="text-slate-400 text-[11px]">
                            <span className="text-slate-500">Mitigation:</span> {blk.mitigation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: MEETING ROI & PAYROLL COST */}
          {activeTab === 'roi' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Meeting Financial Investment &amp; ROI Yield</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time corporate payroll expenditure calculated against concrete decisions &amp; deliverables.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
                      Total Payroll Cost
                    </span>
                    <span className="text-2xl font-bold font-mono text-white tabular-nums">
                      ${costDetails.totalCost}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                      {meeting.durationMinutes} mins · {attendees.length} attendees
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
                      Blended Hourly Rate
                    </span>
                    <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                      ${costDetails.avgHourlyRate}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                      per hour / participant
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
                      Output Generated
                    </span>
                    <span className="text-2xl font-bold font-mono text-sky-400 tabular-nums">
                      {costDetails.decisionsCount + costDetails.tasksCount}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                      {costDetails.decisionsCount} decisions + {costDetails.tasksCount} tasks
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
                      ROI Rating
                    </span>
                    <span
                      className={`text-xl font-bold font-mono uppercase block ${
                        costDetails.roiRating === 'high'
                          ? 'text-emerald-400'
                          : costDetails.roiRating === 'moderate'
                          ? 'text-sky-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {costDetails.roiRating}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                      Efficiency Score
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-xs font-semibold text-white">Cadence ROI Assessment:</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {costDetails.roiExplanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACTION ITEMS */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Action Items Extracted</h3>
                  <p className="text-xs text-slate-400">
                    Deliverables mapped against meeting attendees with developer export.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingTask(!isAddingTask)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Action Item</span>
                </button>
              </div>

              {/* Inline Add Task Form */}
              {isAddingTask && (
                <form
                  onSubmit={handleCreateTask}
                  className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 space-y-3"
                >
                  <h4 className="text-xs font-semibold text-emerald-400">New Action Item</h4>
                  <input
                    type="text"
                    required
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    placeholder="Describe task requirement..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={newTaskOwner}
                      onChange={(e) => setNewTaskOwner(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="">Assign to attendee...</option>
                      {attendees.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.roleTitle})
                        </option>
                      ))}
                    </select>

                    <input
                      type="date"
                      value={newTaskDeadline}
                      onChange={(e) => setNewTaskDeadline(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingTask(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold rounded-lg"
                    >
                      Save Task
                    </button>
                  </div>
                </form>
              )}

              {/* Task list */}
              <div className="space-y-2.5">
                {meetingTasks.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                    No action items created yet.
                  </div>
                ) : (
                  meetingTasks.map((task) => {
                    const isTargetTask = highlightedTaskId === task.id;
                    return (
                      <div
                        key={task.id}
                        id={`meeting-task-${task.id}`}
                        className={`border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                          isTargetTask
                            ? 'bg-emerald-950/30 border-emerald-500/70 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/10'
                            : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1 max-w-xl">
                          <div className="flex items-center gap-2 text-[11px] flex-wrap">
                            {isTargetTask && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400 text-slate-950 flex items-center gap-1 animate-pulse">
                                ★ Recent Notification Item
                              </span>
                            )}
                            <span
                              className={
                                task.priority === 'urgent'
                                  ? 'text-rose-400 font-semibold'
                                  : 'text-sky-400 font-medium'
                              }
                            >
                              {task.priority.toUpperCase()}
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="text-slate-400 font-mono tabular-nums">
                              Due: {task.deadlineDisplay || task.deadline || 'TBD'}
                            </span>
                          </div>
                          <p className={`text-xs font-medium ${isTargetTask ? 'text-emerald-200' : 'text-white'}`}>
                            {task.description}
                          </p>
                        </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Assignee dropdown */}
                        <select
                          value={task.ownerId || ''}
                          onChange={(e) =>
                            onUpdateTaskOwner(task.id, e.target.value || null)
                          }
                          className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                        >
                          <option value="">Unassigned</option>
                          {team.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>

                        {/* Status dropdown */}
                        <select
                          value={task.status}
                          onChange={(e) =>
                            onUpdateTaskStatus(task.id, e.target.value as TaskStatus)
                          }
                          className={`border rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none ${
                            task.status === 'done'
                              ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400'
                              : task.status === 'in_progress'
                              ? 'bg-sky-950/30 border-sky-800 text-sky-400'
                              : 'bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="done">Done</option>
                        </select>

                        {/* Sync to GitHub / Linear button */}
                        <button
                          onClick={() => setSyncingTask(task)}
                          className="p-2 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Sync to GitHub / Linear / Jira ticket"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => downloadTaskIcs(task)}
                          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                          title="Download calendar reminder"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit task */}
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-2 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Edit action item details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete task */}
                        <button
                          onClick={() => {
                            if (confirm(`Delete task "${task.description}"?`)) {
                              onDeleteTask(task.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Delete action item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SYNCHRONIZED TRANSCRIPT */}
          {activeTab === 'transcript' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                <span>Click any timestamp to jump the audio player to that dialogue point.</span>
                <span className="font-mono tabular-nums">
                  {meeting.diarizedSegments.length} utterances
                </span>
              </div>

              <div className="space-y-3">
                {meeting.diarizedSegments.map((seg, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg hover:border-slate-700 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-emerald-400">
                        {seg.speaker}
                      </span>
                      <button
                        onClick={() => handleJumpToTimestamp(seg.timestamp)}
                        className="text-[11px] font-mono text-slate-500 group-hover:text-emerald-300 bg-slate-900 hover:bg-slate-800 px-2 py-0.5 rounded border border-slate-800 transition-colors tabular-nums"
                        title="Jump audio to this timestamp"
                      >
                        ▶ {seg.timestamp}
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{seg.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SPEAKER VOICE & ENGAGEMENT ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Speaker Talk-Time Distribution</h3>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    {speakerStats.totalWords} words spoken
                  </span>
                </div>

                {/* Progress bar showing multi-speaker share */}
                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex">
                  {speakerStats.breakdown.map((s, idx) => {
                    const colors = ['bg-emerald-400', 'bg-sky-400', 'bg-purple-400', 'bg-amber-400'];
                    return (
                      <div
                        key={s.speaker}
                        className={`${colors[idx % colors.length]}`}
                        style={{ width: `${s.pct}%` }}
                        title={`${s.speaker}: ${s.pct}%`}
                      />
                    );
                  })}
                </div>

                {/* Breakdown cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {speakerStats.breakdown.map((s, idx) => {
                    const dots = ['bg-emerald-400', 'bg-sky-400', 'bg-purple-400', 'bg-amber-400'];
                    return (
                      <div
                        key={s.speaker}
                        className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${dots[idx % dots.length]}`} />
                          <span className="text-xs font-medium text-white">{s.speaker}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-semibold text-slate-200 tabular-nums">
                            {s.pct}%
                          </span>
                          <span className="text-[10px] text-slate-500 block font-mono">
                            {s.words} words
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FORMAL MINUTES (MoM) */}
          {activeTab === 'mom' && (
            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-slate-200 space-y-6 font-sans">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                    Minutes of Meeting (MoM)
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">{meeting.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2 font-mono tabular-nums">
                    <span>Date: {meeting.date}</span>
                    <span>|</span>
                    <span>Time: {meeting.time}</span>
                    <span>|</span>
                    <span>Host: {meeting.hostName}</span>
                    <span>|</span>
                    <span>Modality: {meeting.modality?.toUpperCase()}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
                    1. Agenda &amp; Purpose
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{meeting.agenda}</p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
                    2. Key Decisions Approved
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {meeting.keyDecisions.map((d) => (
                      <li key={d.id} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>
                          <strong>{d.decision}</strong> — {d.impact}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
                    3. Assigned Deliverables &amp; Targets
                  </h4>
                  <table className="w-full text-left text-xs border border-slate-800">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                      <tr>
                        <th className="p-2">Deliverable</th>
                        <th className="p-2">Owner</th>
                        <th className="p-2">Deadline</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {meetingTasks.map((t) => (
                        <tr key={t.id}>
                          <td className="p-2 font-medium text-white">{t.description}</td>
                          <td className="p-2 text-slate-300">{t.ownerName || 'Unassigned'}</td>
                          <td className="p-2 font-mono tabular-nums">{t.deadlineDisplay || t.deadline || '—'}</td>
                          <td className="p-2 capitalize">{t.status.replace('_', ' ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Developer Sync Modal */}
      {syncingTask && (
        <DeveloperSyncModal
          task={syncingTask}
          onClose={() => setSyncingTask(null)}
        />
      )}

      {/* Slack Preview Modal */}
      {showSlackPreview && (
        <SlackPreviewModal
          meeting={meeting}
          tasks={tasks}
          slackChannel="#engineering-sync"
          onClose={() => setShowSlackPreview(false)}
        />
      )}

      {/* Executive PDF Report */}
      {showPdfReport && (
        <ExecutivePdfReport
          meeting={meeting}
          tasks={tasks}
          team={team}
          companyName="Acme Technologies"
          onClose={() => setShowPdfReport(false)}
        />
      )}

      {/* Edit Meeting Details Modal */}
      {isEditingMeeting && (
        <EditMeetingModal
          meeting={meeting}
          team={team}
          onClose={() => setIsEditingMeeting(false)}
          onSave={onUpdateMeeting}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          team={team}
          onClose={() => setEditingTask(null)}
          onSave={onUpdateTask}
          onDelete={onDeleteTask}
        />
      )}
    </div>
  );
};
