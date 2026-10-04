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

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citedMeetingIds?: string[];
  timestamp: string;
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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `👋 **Hello! I'm Cadence AI**, your organizational copilot and company knowledge assistant.

I can answer **anything** you'd like to ask:
- 🔍 **Meeting Transcripts & Decisions**: *"What was decided in the Architecture Review?"*
- 📋 **Deliverables & Tasks**: *"What action items are due this sprint?"*
- 💼 **Strategy & Workplace Advice**: *"How can we reduce meeting fatigue?"*, *"What are agile best practices?"*
- ✍️ **Drafting & Summaries**: *"Draft a follow-up recap to the engineering team"*

Feel free to type any question below or choose a template!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

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

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: q.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    // Filter meeting context passed to AI if a specific meeting is picked
    const meetingsToQuery =
      selectedMeetingId === 'all'
        ? meetings
        : meetings.filter((m) => m.id === selectedMeetingId);

    const res = await requestAskCadence(q.trim(), meetingsToQuery, scopedTasks);

    const botMsg: ChatMessage = {
      id: `assistant_${Date.now()}`,
      sender: 'assistant',
      text: res.answer,
      citedMeetingIds: res.citedMeetingIds,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, botMsg]);
    setLoading(false);
  };

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
                <span>Ask Cadence Copilot</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Universal AI Chatbot
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Ask anything: general knowledge, strategy, fun chit-chat, or deep meeting records.
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
                ? `Ask anything about "${targetMeeting.title}" or any general topic...`
                : "Ask me anything... (e.g. 'I am bored', 'what are you doing', meeting decisions, tech questions)"
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

        {/* Chat Message History & Dialogue Stream */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 max-h-[55vh] flex flex-col bg-slate-900/60">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const cited = msg.citedMeetingIds && msg.citedMeetingIds.length > 0
              ? meetings.filter((m) => msg.citedMeetingIds!.includes(m.id))
              : [];

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[92%] sm:max-w-[85%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-emerald-400 text-slate-950 shadow-md'
                      : 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shadow-sm'
                  }`}
                >
                  {isUser ? 'You' : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-2 min-w-0">
                  <div
                    className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none shadow-md'
                        : 'bg-slate-950 border border-slate-800 text-slate-100 rounded-tl-none shadow-xl'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Cited Meetings Chips underneath assistant response */}
                  {!isUser && cited.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Referenced Meetings ({cited.length}):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {cited.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => {
                              onClose();
                              onOpenMeeting(m.id);
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 rounded-lg text-xs text-slate-300 hover:text-white transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="font-medium truncate max-w-[180px]">{m.title}</span>
                            <span className="text-[10px] text-slate-500 font-mono">({m.date})</span>
                            <ArrowRight className="w-3 h-3 text-slate-500" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className="text-[10px] text-slate-500 font-mono block px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing / Loading indicator bubble */}
          {loading && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Thinking &amp; querying organizational memory...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Click Prompts Carousel */}
        <div className="px-4 py-2.5 bg-slate-950/50 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Suggestions:</span>
          </span>
          {filteredPresets.slice(0, 4).map((preset) => {
            const promptText = preset.promptTemplate();
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setQuery(promptText);
                  handleSearch(promptText);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-white text-[11px] whitespace-nowrap transition-colors shrink-0"
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Modal Footer with Multi-Provider Fallback Status */}
        <div className="p-3 sm:px-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Multi-Provider Resilient AI:</span>
            </span>
            <span className="font-mono text-[10px] text-emerald-300 bg-slate-900 px-1.5 py-0.5 rounded border border-emerald-500/30">
              Tier 1: Gemini
            </span>
            <span className="text-slate-600">→</span>
            <span className="font-mono text-[10px] text-sky-300 bg-slate-900 px-1.5 py-0.5 rounded border border-sky-500/30">
              Tier 2: OpenAI
            </span>
            <span className="text-slate-600">→</span>
            <span className="font-mono text-[10px] text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded border border-amber-500/30">
              Tier 3: Groq Llama (Free)
            </span>
            <span className="text-slate-600">→</span>
            <span className="font-mono text-[10px] text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
              Tier 4: OpenRouter (Free)
            </span>
            <span className="text-slate-600">→</span>
            <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
              Tier 5: Local NLP
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">
            ESC to exit · CMD+K to toggle
          </span>
        </div>
      </div>
    </div>
  );
};
