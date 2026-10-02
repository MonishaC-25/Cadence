import React, { useState, useEffect } from 'react';
import { Meeting, Task, TeamMember, MeetingModality } from '../types';
import {
  X,
  Video,
  Bot,
  Radio,
  CheckCircle2,
  Sparkles,
  Building,
  Wifi,
  Users,
  Mic,
  ArrowRight,
  Globe,
  Sliders,
} from 'lucide-react';

interface DispatchBotModalProps {
  team: TeamMember[];
  onClose: () => void;
  onMeetingCaptured: (meeting: Meeting, tasks: Task[]) => void;
}

export const DispatchBotModal: React.FC<DispatchBotModalProps> = ({
  team,
  onClose,
  onMeetingCaptured,
}) => {
  const [meetingUrl, setMeetingUrl] = useState('https://meet.google.com/eng-arch-sync');
  const [meetingTitle, setMeetingTitle] = useState('Platform Infrastructure Scaling & Failover Sync');
  const [modality, setModality] = useState<MeetingModality>('hybrid');
  const [conferenceRoom, setConferenceRoom] = useState('Boardroom Alpha (Room 402) + Google Meet');
  const [botStatus, setBotStatus] = useState<'idle' | 'connecting' | 'admitted' | 'recording'>('idle');
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (botStatus === 'recording') {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [botStatus]);

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

  const handleDispatch = () => {
    if (!meetingUrl.trim()) return;
    setBotStatus('connecting');

    setTimeout(() => {
      setBotStatus('admitted');
      setTimeout(() => {
        setBotStatus('recording');
      }, 1200);
    }, 1500);
  };

  const handleFinishAndProcess = () => {
    const meetingId = `meet_bot_${Date.now()}`;
    const newMeeting: Meeting = {
      id: meetingId,
      title: meetingTitle,
      agenda: 'Real-time multi-tenant database failover and automated read replica promotion testing.',
      hostId: team[0]?.id || 'emp_01',
      hostName: team[0]?.name || 'Asha Rao',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      durationMinutes: Math.max(15, Math.round(timerSeconds / 60) || 35),
      status: 'confirmed',
      privacyLevel: 'department',
      modality,
      locationOrLink: modality === 'hybrid' ? conferenceRoom : meetingUrl,
      department: 'Engineering',
      attendeeIds: team.slice(0, 4).map((m) => m.id),
      transcriptText: `Asha: The bot has joined. Let's begin the hybrid review between Boardroom Alpha and our remote attendees on Google Meet.
Priya: I verified the multi-region failover drill. Latency was under 40 milliseconds across all replicas.
Arjun: I will update our Grafana dashboard to alert on any replica replication lag exceeding 100ms by Thursday.
Karthik: The enterprise SLA requires a monthly uptime guarantee document. Priya, can you send the drill logs to legal by Friday?
Priya: Absolutely, I will package the logs and submit the compliance report by Friday noon.`,
      diarizedSegments: [
        {
          speaker: 'Asha Rao',
          timestamp: '00:00',
          text: "The bot has joined. Let's begin the hybrid review between Boardroom Alpha and our remote attendees on Google Meet.",
        },
        {
          speaker: 'Priya Sharma',
          timestamp: '01:15',
          text: 'I verified the multi-region failover drill. Latency was under 40 milliseconds across all replicas.',
        },
        {
          speaker: 'Arjun Mehta',
          timestamp: '02:40',
          text: 'I will update our Grafana dashboard to alert on any replica replication lag exceeding 100ms by Thursday.',
        },
        {
          speaker: 'Karthik Iyer',
          timestamp: '04:10',
          text: 'The enterprise SLA requires a monthly uptime guarantee document. Priya, can you send the drill logs to legal by Friday?',
        },
        {
          speaker: 'Priya Sharma',
          timestamp: '05:30',
          text: 'Absolutely, I will package the logs and submit the compliance report by Friday noon.',
        },
      ],
      executiveSummary: [
        'Conducted live hybrid failover simulation across Boardroom Alpha and remote team members.',
        'Validated cross-region database replica failover latency of under 40ms, complying with enterprise SLAs.',
        'Assigned Grafana replication lag threshold alerts and legal compliance documentation.',
      ],
      keyDecisions: [
        {
          id: 'dec_bot_1',
          decision: 'Standardize replication lag threshold alert at 100ms on Grafana telemetry',
          impact: 'Prevents undetected data divergence during peak traffic surges',
        },
        {
          id: 'dec_bot_2',
          decision: 'Submit certified uptime verification logs for enterprise customers',
          impact: 'Satisfies contractual SOC 2 and 99.99% availability requirements',
        },
      ],
      blockers: [],
      audioFileName: 'hybrid_bot_stream_rec.mp3',
      audioDurationSeconds: timerSeconds || 2100,
      createdAt: new Date().toISOString(),
    };

    const newTasks: Task[] = [
      {
        id: `task_bot_1_${Date.now()}`,
        meetingId,
        meetingTitle: newMeeting.title,
        description: 'Update Grafana dashboard to alert on replica replication lag exceeding 100ms',
        ownerId: team[2]?.id || 'emp_03',
        ownerName: team[2]?.name || 'Arjun Mehta',
        priority: 'high',
        status: 'pending',
        deadline: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        deadlineDisplay: 'By Thursday',
        sourceQuote: 'Arjun: I will update our Grafana dashboard to alert on any replica replication lag exceeding 100ms by Thursday.',
        createdAt: new Date().toISOString(),
      },
      {
        id: `task_bot_2_${Date.now()}`,
        meetingId,
        meetingTitle: newMeeting.title,
        description: 'Package drill logs and submit monthly uptime compliance report to legal',
        ownerId: team[1]?.id || 'emp_02',
        ownerName: team[1]?.name || 'Priya Sharma',
        priority: 'urgent',
        status: 'pending',
        deadline: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        deadlineDisplay: 'Friday noon',
        sourceQuote: 'Priya: Absolutely, I will package the logs and submit the compliance report by Friday noon.',
        createdAt: new Date().toISOString(),
      },
    ];

    onMeetingCaptured(newMeeting, newTasks);
    onClose();
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl my-auto shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Dispatch Cadence AI Notetaker Bot</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/20">
                  Hybrid &amp; Remote
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Send a silent AI assistant into Google Meet, Zoom, or hybrid conference rooms.
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

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-5 flex-1 overflow-y-auto text-xs">
          {botStatus === 'idle' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Meeting Conference Link (Google Meet / Zoom / Teams)
                </label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2.5">
                  <Video className="w-4 h-4 text-emerald-400 shrink-0" />
                  <input
                    type="url"
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    placeholder="https://meet.google.com/xxx-yyyy-zzz"
                    className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Session Subject
                </label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="e.g. Sprint Sync"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Modality Selector: Online vs. In-Person vs. Hybrid */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase text-slate-400">
                  Meeting Setup &amp; Modality
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModality('hybrid')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      modality === 'hybrid'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 ring-1 ring-emerald-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Radio className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-semibold text-xs">Hybrid Room</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Conference room mic + remote dial-in attendees.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModality('online')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      modality === 'online'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 ring-1 ring-emerald-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-3.5 h-3.5 text-sky-400" />
                      <span className="font-semibold text-xs">Fully Remote</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      All participants joined individually via video call.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModality('in_person')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      modality === 'in_person'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 ring-1 ring-emerald-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Building className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-semibold text-xs">In-Person Only</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Physical room audio capture with room mic.
                    </p>
                  </button>
                </div>
              </div>

              {modality === 'hybrid' && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                    Physical Room &amp; Virtual Endpoint
                  </label>
                  <input
                    type="text"
                    value={conferenceRoom}
                    onChange={(e) => setConferenceRoom(e.target.value)}
                    placeholder="e.g. Boardroom Alpha (Floor 4) + Meet"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* Connection Progress State */}
          {botStatus === 'connecting' && (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-3 border-emerald-500/30 border-t-emerald-400 animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">Knocking on Google Meet Room...</p>
                <p className="text-xs text-slate-400">
                  "Cadence AI Notetaker" is waiting in the lobby to be admitted by the meeting host.
                </p>
              </div>
            </div>
          )}

          {/* Admitted State */}
          {botStatus === 'admitted' && (
            <div className="py-12 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">Admitted to Conference!</p>
                <p className="text-xs text-slate-400">
                  Initializing multichannel speaker diarization and audio pipeline...
                </p>
              </div>
            </div>
          )}

          {/* Live Recording Active State */}
          {botStatus === 'recording' && (
            <div className="bg-slate-950 p-6 rounded-2xl border border-emerald-500/40 space-y-5 text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Live Conference Capture Active
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-2xl font-bold font-mono text-white tabular-nums">
                  {formatTimer(timerSeconds)}
                </p>
                <p className="text-xs text-slate-400">
                  Bot Name: <strong className="text-white">Cadence AI (Silent Assistant)</strong>
                </p>
                <p className="text-[11px] text-emerald-400 font-mono">
                  {modality === 'hybrid' ? `Hybrid: ${conferenceRoom}` : 'Remote Stream Active'}
                </p>
              </div>

              {/* Simulated Waveform Visualizer */}
              <div className="flex items-center justify-center gap-1 h-8">
                {[40, 70, 95, 30, 80, 50, 90, 60, 100, 45, 85, 35, 75, 55, 90, 40].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-emerald-400 rounded-full transition-all duration-300"
                    style={{
                      height: `${Math.max(15, (h * ((timerSeconds % 4) + 1)) / 4)}%`,
                    }}
                  />
                ))}
              </div>

              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Cadence is listening to dialogue, mapping speaker roll call, and extracting deliverables in real time.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/70 flex justify-between items-center">
          <span className="text-xs text-slate-500">
            Supports Google Meet, Zoom, Webex, and Microsoft Teams.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            {botStatus === 'idle' && (
              <button
                onClick={handleDispatch}
                className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Launch Bot into Meeting</span>
              </button>
            )}
            {botStatus === 'recording' && (
              <button
                onClick={handleFinishAndProcess}
                className="px-5 py-2 bg-rose-500 hover:bg-rose-400 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>End Meeting &amp; Synthesize MoM</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
