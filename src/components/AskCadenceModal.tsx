import React, { useState, useMemo } from 'react';
import { Meeting, Task } from '../types';
import {
  Sparkles,
  Search,
  X,
  ArrowRight,
  CornerDownLeft,
  BookOpen,
  Calendar,
  Layers,
  Check,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Target,
  FileText,
  UserCheck,
  ChevronDown,
} from 'lucide-react';
import { requestAskCadence } from '../services/api';

interface AskCadenceModalProps {
  meetings: Meeting[];
  tasks: Task[];
  onClose: () => void;
  onOpenMeeting: (meetingId: string) => void;
  initialMeetingId?: string;
}

export type QueryScope = 'all' | string; // 'all' or specific meetingId
export type QueryPresetType = 'all' | 'decisions' | 'tasks' | 'blockers' | 'summary';

interface PresetPrompt {
  id: string;
  category: QueryPresetType;
  label: string;
  promptTemplate: (meetingTitle?: string) => string;
}

export const AskCadenceModal: React.FC<AskCadenceModalProps> = ({
  meetings,
  tasks,
  onClose,
  onOpenMeeting,
  initialMeetingId,
}) => {
  const [selectedMeetingId, setSelectedMeetingId] = useState<QueryScope>(
    initialMeetingId || 'all'
  );
  const [activeCategory, setActiveCategory] = useState<QueryPresetType>('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ answer: string; citedMeetingIds: string[] } | null>(null);

  // The specific meeting object if targeted
  const targetMeeting = useMemo(() => {
    if (selectedMeetingId === 'all') return null;
    return meetings.find((m) => m.id === selectedMeetingId) || null;
  }, [selectedMeetingId, meetings]);

  // Tasks associated with target meeting (or all if scope is 'all')
  const scopedTasks = useMemo(() => {
    if (selectedMeetingId === 'all') return tasks;
    return tasks.filter((t) => t.meetingId === selectedMeetingId);
  }, [selectedMeetingId, tasks]);

  // Dynamic context-aware query presets
  const presets: PresetPrompt[] = useMemo(() => {
    const title = targetMeeting ? `"${targetMeeting.title}"` : 'our meetings';
    return [
      {
        id: 'p_decisions',
        category: 'decisions',
        label: 'Key Decisions & Consensus',
        promptTemplate: () => `What critical decisions and architectural consensus were finalized in ${title}?`,
      },
      {
        id: 'p_tasks',
        category: 'tasks',
        label: 'Action Items & Deadlines',
        promptTemplate: () => `What deliverables, assignees, and target deadlines were established in ${title}?`,
      },
      {
        id: 'p_blockers',
        category: 'blockers',
        label: 'Blockers, Risks & Mitigations',
        promptTemplate: () => `What technical blockers, security risks, or timeline dependencies were highlighted in ${title}?`,
      },
      {
        id: 'p_summary',
        category: 'summary',
        label: 'Executive Brief & Takeaways',
        promptTemplate: () => `Give me a concise 3-bullet executive brief of the outcomes from ${title}.`,
      },
      {
        id: 'p_specific_db',
        category: 'decisions',
        label: 'Database & Caching Plan',
        promptTemplate: () => `What was agreed upon regarding query optimization, indexes, and Redis caching?`,
      },
      {
        id: 'p_specific_assignee',
        category: 'tasks',
        label: 'Ownership Breakdown',
        promptTemplate: () => `Who is responsible for the top deliverables from ${title}?`,
      },
    ];
  }, [targetMeeting]);

  const filteredPresets = useMemo(() => {
    if (activeCategory === 'all') return presets;
    return presets.filter((p) => p.category === activeCategory);
  }, [presets, activeCategory]);

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

  const handleSearch = async (textToQuery?: string) => {
    const q = textToQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setResult(null);

    // Filter meeting context passed to AI if a specific meeting is picked
    const meetingsToQuery =
      selectedMeetingId === 'all'
        ? meetings
        : meetings.filter((m) => m.id === selectedMeetingId);

    const res = await requestAskCadence(q.trim(), meetingsToQuery, scopedTasks);
    setResult(res);
    setLoading(false);
  };

  const citedMeetings = result
    ? meetings.filter((m) => result.citedMeetingIds.includes(m.id))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-10 sm:pt-14 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
        {/* Top Header Bar */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Ask Cadence Intelligence</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Targeted Query Engine
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Select a specific meeting or query across organizational memory.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Meeting Targeter & Scope Selector */}
        <div className="p-4 sm:p-5 bg-slate-950/40 border-b border-slate-800 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Target Meeting Source:</span>
            </label>

            <span className="text-[11px] text-slate-400 font-mono">
              {selectedMeetingId === 'all'
                ? `Scanning all ${meetings.length} company sessions`
                : `Focused on 1 session (${scopedTasks.length} action items)`}
            </span>
          </div>

          {/* Meeting Selection Dropdown / Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Option 1: All Meetings */}
            <button
              onClick={() => {
                setSelectedMeetingId('all');
                setResult(null);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                selectedMeetingId === 'all'
                  ? 'bg-emerald-950/40 border-emerald-500/60 shadow-sm'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              <Layers className={`w-4 h-4 mt-0.5 shrink-0 ${
                selectedMeetingId === 'all' ? 'text-emerald-400' : 'text-slate-400'
              }`} />
              <div className="truncate min-w-0">
                <p className={`text-xs font-semibold truncate ${
                  selectedMeetingId === 'all' ? 'text-white' : 'text-slate-300'
                }`}>
                  All Meetings &amp; Transcripts
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  Global knowledge across all sessions
                </p>
              </div>
            </button>

            {/* Option 2: Dropdown for Specific Meeting Selection */}
            <div className="sm:col-span-2 relative">
              <select
                value={selectedMeetingId}
                onChange={(e) => {
                  setSelectedMeetingId(e.target.value);
                  setResult(null);
                }}
                className={`w-full p-2.5 rounded-xl border text-xs bg-slate-900 text-slate-200 transition-all appearance-none cursor-pointer pr-8 ${
                  selectedMeetingId !== 'all'
                    ? 'border-emerald-500/60 bg-emerald-950/20 text-white font-medium'
                    : 'border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <option value="all">Or select specific meeting to query...</option>
                {meetings.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.date}) — {m.hostName}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Active Target Banner */}
          {targetMeeting && (
            <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <div className="truncate">
                  <span className="font-semibold text-white">Targeted Session: </span>
                  <span className="text-emerald-300">{targetMeeting.title}</span>
                  <span className="text-slate-400 font-mono ml-2 text-[11px]">
                    ({targetMeeting.date} · {targetMeeting.durationMinutes} mins · {targetMeeting.diarizedSegments?.length || 0} transcript lines)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMeetingId('all')}
                className="text-[11px] text-slate-400 hover:text-white underline shrink-0 ml-3"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            placeholder={
              targetMeeting
                ? `Ask anything about "${targetMeeting.title}"...`
                : "Ask anything across all company meetings and transcripts..."
            }
            className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="px-3.5 py-2 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <span>Ask</span>
            <CornerDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Query Presets & Suggestions */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto max-h-[50vh]">
          {/* Query Category Pills */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-400" />
              <span>Query Templates:</span>
            </span>

            <div className="flex items-center gap-1">
              {(['all', 'decisions', 'tasks', 'blockers', 'summary'] as QueryPresetType[]).map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                      activeCategory === cat
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Quick Click Query Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {filteredPresets.map((preset) => {
              const promptText = preset.promptTemplate();
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    setQuery(promptText);
                    handleSearch(promptText);
                  }}
                  className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-emerald-500/40 text-left text-xs transition-all group flex items-start justify-between gap-2"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="font-semibold text-white group-hover:text-emerald-300 transition-colors">
                      {preset.label}
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                      "{promptText}"
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 shrink-0 mt-0.5 transition-colors" />
                </button>
              );
            })}
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">
                {targetMeeting
                  ? `Analyzing "${targetMeeting.title}" transcript and deliverables...`
                  : 'Scanning organizational memory across meetings and action items...'}
              </p>
            </div>
          )}

          {/* Answer Display */}
          {result && !loading && (
            <div className="space-y-5 pt-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Cadence Intelligence Answer</span>
                  </div>
                  {targetMeeting && (
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      Scoped to: {targetMeeting.title}
                    </span>
                  )}
                </div>

                <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {result.answer}
                </div>
              </div>

              {/* Cited Meetings Section */}
              {citedMeetings.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Referenced Meeting Sessions ({citedMeetings.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {citedMeetings.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          onClose();
                          onOpenMeeting(m.id);
                        }}
                        className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 rounded-xl cursor-pointer transition-colors group flex items-center justify-between"
                      >
                        <div className="truncate pr-2">
                          <p className="text-xs font-semibold text-white truncate group-hover:text-emerald-300">
                            {m.title}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono tabular-nums">
                            {m.date} · Hosted by {m.hostName} · {m.diarizedSegments?.length || 0} transcript lines
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:px-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Multi-Tier Gemini Cascade Active</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">
            Press ESC to exit · CMD+K to toggle
          </span>
        </div>
      </div>
    </div>
  );
};
