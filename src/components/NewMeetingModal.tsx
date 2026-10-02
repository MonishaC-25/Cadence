import React, { useState } from 'react';
import { Meeting, Task, TeamMember, MeetingAnalysisResult, PrivacyLevel, MeetingModality } from '../types';
import {
  X,
  Upload,
  Mic,
  FileText,
  Sparkles,
  Check,
  Calendar,
  Clock,
  User,
  Users,
  AlertCircle,
  Trash2,
  Plus,
  Lock,
  Building,
  Globe,
} from 'lucide-react';
import { AudioRecorder } from './AudioRecorder';
import { requestMeetingAnalysis } from '../services/api';

interface NewMeetingModalProps {
  team: TeamMember[];
  onClose: () => void;
  onSaveMeeting: (meeting: Meeting, tasks: Task[]) => void;
}

export const NewMeetingModal: React.FC<NewMeetingModalProps> = ({
  team,
  onClose,
  onSaveMeeting,
}) => {
  const [step, setStep] = useState<'input' | 'processing' | 'review'>('input');
  const [inputMode, setInputMode] = useState<'text' | 'record' | 'upload'>('text');

  // Form states
  const [title, setTitle] = useState('');
  const [agenda, setAgenda] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('11:00');
  const [hostId, setHostId] = useState(team[0]?.id || '');
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>('department');
  const [department, setDepartment] = useState('Engineering');
  const [meetingLanguage, setMeetingLanguage] = useState('Auto-Detect Any Language');
  const [modality, setModality] = useState<MeetingModality>('hybrid');
  const [locationOrLink, setLocationOrLink] = useState('Boardroom Alpha + Google Meet');
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<string[]>(
    team.map((m) => m.id)
  );
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState('');
  const [attendeeDeptFilter, setAttendeeDeptFilter] = useState('All');

  // Content states
  const [transcriptText, setTranscriptText] = useState('');
  const [audioFileName, setAudioFileName] = useState<string | undefined>();
  const [audioDurationSeconds, setAudioDurationSeconds] = useState<number>(360);
  const [analysisResult, setAnalysisResult] = useState<MeetingAnalysisResult | null>(null);

  // Review candidates state
  const [editableTasks, setEditableTasks] = useState<
    Array<{
      id: string;
      description: string;
      ownerId: string | null;
      priority: 'urgent' | 'high' | 'medium' | 'low';
      deadline: string | null;
      deadlineToDisplay: string | null;
      sourceQuote: string;
    }>
  >([]);

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

  const sampleTemplates = [
    {
      label: 'Sprint Standup & Bug Triage',
      title: 'Engineering Bug Triage & Release Gate',
      agenda: 'Review critical p0 production exceptions, assign backend owners, and plan deployment rollout.',
      privacyLevel: 'department' as PrivacyLevel,
      text: `Camille: Let's start the bug triage. We have three urgent issues from last night's release.
Min-Jun: The webhook signature validation is failing for Stripe events. I will investigate and deploy a hotfix by 3 PM today.
Kenji: On the frontend, mobile users cannot dismiss the cookie banner. I will fix that and push an update by end of day.
Lucas: The billing team also noted enterprise invoices are missing tax identification numbers. We need someone to update the PDF generation template by Thursday.
Camille: Min-Jun, please take that invoice PDF task as well once the webhook hotfix is verified.
Min-Jun: Understood, I'll update the PDF generator template by Thursday afternoon.`,
    },
    {
      label: 'Product Feature Kickoff',
      title: 'Q4 AI Search & Workspace Knowledge Sync',
      agenda: 'Scope vector embeddings pipeline, UX search bar interaction, and customer privacy compliance.',
      privacyLevel: 'company' as PrivacyLevel,
      text: `Lucas: Welcome team. Today we kick off Q4 Semantic Search. Ji-Woo, can you present the search overlay mockups by Friday?
Ji-Woo: Yes, I will deliver the interactive Figma prototype with keyboard shortcuts by Friday morning.
Kenji: I will prototype the CMD+K global command palette on the web client this week.
Min-Jun: I need to evaluate the pgvector extension on Cloud SQL and run a benchmark test before next Wednesday.
Camille: Excellent. Let's make sure everyone updates their progress on Friday before the all-hands.`,
    },
    {
      label: 'Confidential 1-on-1 Review',
      title: 'Quarterly Executive Calibration & Equity Vesting',
      agenda: 'Confidential performance evaluation, leveling alignment, and executive compensation review.',
      privacyLevel: 'confidential' as PrivacyLevel,
      text: `Asha: Priya, let's review your Q3 deliverables. The migration to composite indexing reduced latency by 90%.
Priya: Thank you Asha. We also stabilized the Redis cache fallbacks.
Asha: The leadership committee approved the staff compensation step-up and equity grant. I will send the HR confirmation by Friday.
Priya: I will compile the infrastructure roadmap for next half by next Monday.`,
    },
  ];

  const handleApplySample = (template: (typeof sampleTemplates)[0]) => {
    setTitle(template.title);
    setAgenda(template.agenda);
    setTranscriptText(template.text);
    setPrivacyLevel(template.privacyLevel);
    setAudioFileName('session_recording_sample.mp3');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFileName(file.name);
      if (!transcriptText.trim()) {
        setTranscriptText(
          `Asha: Thanks for joining the review for ${file.name.replace(/\.[^/.]+$/, '')}.
Priya: I will review the architecture proposal and submit feedback by tomorrow.
Arjun: I can prepare the client frontend demo by Friday afternoon.
Karthik: I will confirm the client requirements before end of day today.`
        );
      }
    }
  };

  const handleRecordingComplete = (_blob: Blob, durationSec: number) => {
    setAudioFileName(`live_recording_${Date.now()}.webm`);
    setAudioDurationSeconds(durationSec);
    if (!transcriptText.trim()) {
      setTranscriptText(
        `Recorded Session: Team discussed ${title || 'key priorities'}.
Priya: I will take responsibility for reviewing the technical blockers by Friday.
Arjun: I will coordinate the deployment checklist with QA by tomorrow.
Karthik: Please make sure the release notes are circulated by end of week.`
      );
    }
    setInputMode('text');
  };

  const toggleAttendee = (id: string) => {
    setSelectedAttendeeIds((prev) =>
      prev.includes(id) ? prev.filter((aId) => aId !== id) : [...prev, id]
    );
  };

  const handleStartAnalysis = async () => {
    if (!transcriptText.trim()) {
      alert('Please enter or record meeting content to analyze.');
      return;
    }
    if (!title.trim()) {
      alert('Please provide a meeting title.');
      return;
    }

    setStep('processing');

    const attendees = team.filter((m) => selectedAttendeeIds.includes(m.id));
    const result = await requestMeetingAnalysis(transcriptText, attendees, title, meetingLanguage);

    setAnalysisResult(result);
    setEditableTasks(result.actionItems || []);
    setStep('review');
  };

  const handleConfirmAndSave = () => {
    if (!analysisResult) return;

    const host = team.find((m) => m.id === hostId) || team[0];
    const meetingId = `meet_${Date.now()}`;

    const newMeeting: Meeting = {
      id: meetingId,
      title: title.trim(),
      agenda: agenda.trim() || 'Meeting sync',
      hostId: host.id,
      hostName: host.name,
      date,
      time,
      durationMinutes: Math.round(audioDurationSeconds / 60) || 30,
      status: 'confirmed',
      privacyLevel,
      modality,
      locationOrLink: locationOrLink.trim() || undefined,
      spokenLanguage: meetingLanguage,
      detectedLanguage: analysisResult.detectedLanguage,
      department: privacyLevel === 'department' ? department : undefined,
      attendeeIds: selectedAttendeeIds,
      transcriptText,
      diarizedSegments: analysisResult.diarizedSegments || [],
      executiveSummary: analysisResult.executiveSummary || [],
      keyDecisions: analysisResult.keyDecisions || [],
      blockers: analysisResult.blockersAndRisks || [],
      audioFileName,
      audioDurationSeconds,
      createdAt: new Date().toISOString(),
    };

    const newTasks: Task[] = editableTasks.map((t, idx) => {
      const owner = team.find((m) => m.id === t.ownerId);
      return {
        id: `task_${Date.now()}_${idx}`,
        meetingId,
        meetingTitle: newMeeting.title,
        description: t.description,
        ownerId: t.ownerId,
        ownerName: owner?.name || null,
        priority: t.priority,
        status: 'pending',
        deadline: t.deadline,
        deadlineDisplay: t.deadlineToDisplay || t.deadline || 'TBD',
        sourceQuote: t.sourceQuote,
        createdAt: new Date().toISOString(),
      };
    });

    onSaveMeeting(newMeeting, newTasks);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl my-auto max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {step === 'input' && 'Create & Analyze New Meeting'}
              {step === 'processing' && 'Synthesizing Meeting Intelligence...'}
              {step === 'review' && 'Review & Confirm Action Items'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {step === 'input' && 'Record, upload audio, or paste transcript text.'}
              {step === 'processing' && 'Extracting deliverables, owners, and decisions.'}
              {step === 'review' && 'Verify extracted deliverables before assigning to team.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-6">
          {/* STEP 1: INPUT */}
          {step === 'input' && (
            <div className="space-y-6">
              {/* Sample Templates Helper */}
              <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                <span className="text-xs text-slate-400 font-medium">Quick Test Templates:</span>
                {sampleTemplates.map((t, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplySample(t)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 bg-slate-900 hover:bg-slate-800 border border-emerald-500/20 px-2.5 py-1 rounded transition-colors"
                  >
                    + {t.label}
                  </button>
                ))}
              </div>

              {/* Title & Agenda */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Meeting Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Q3 Architecture & Scalability Review"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Agenda &amp; Context
                  </label>
                  <input
                    type="text"
                    value={agenda}
                    onChange={(e) => setAgenda(e.target.value)}
                    placeholder="Brief summary of discussion purpose and goals"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                {/* Privacy, Modality & Governance */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Confidentiality Level
                    </label>
                    <select
                      value={privacyLevel}
                      onChange={(e) => setPrivacyLevel(e.target.value as PrivacyLevel)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="department">Department Only</option>
                      <option value="company">Company-Wide</option>
                      <option value="confidential">Confidential</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Setup / Modality
                    </label>
                    <select
                      value={modality}
                      onChange={(e) => setModality(e.target.value as MeetingModality)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-emerald-400 font-medium focus:outline-none"
                    >
                      <option value="hybrid">🔀 Hybrid (Room + Remote)</option>
                      <option value="online">🌐 Online / Remote Video</option>
                      <option value="in_person">🏢 In-Person Conference Room</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                      <span>Audio Spoken Language</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-normal">Auto-translates to English</span>
                    </label>
                    <select
                      value={meetingLanguage}
                      onChange={(e) => setMeetingLanguage(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="Auto-Detect Any Language">✨ Auto-Detect Any Language</option>
                      <option value="English">English</option>
                      <option value="Spanish">Spanish (Español)</option>
                      <option value="Mandarin">Mandarin Chinese (中文)</option>
                      <option value="Hindi">Hindi (हिन्दी)</option>
                      <option value="Arabic">Arabic (العربية)</option>
                      <option value="Bengali">Bengali (বাংলা)</option>
                      <option value="Portuguese">Portuguese (Português)</option>
                      <option value="Russian">Russian (Русский)</option>
                      <option value="Japanese">Japanese (日本語)</option>
                      <option value="German">German (Deutsch)</option>
                      <option value="French">French (Français)</option>
                      <option value="Korean">Korean (한국어)</option>
                      <option value="Italian">Italian (Italiano)</option>
                      <option value="Turkish">Turkish (Türkçe)</option>
                      <option value="Vietnamese">Vietnamese (Tiếng Việt)</option>
                      <option value="Dutch">Dutch (Nederlands)</option>
                      <option value="Polish">Polish (Polski)</option>
                      <option value="Swedish">Swedish (Svenska)</option>
                      <option value="Indonesian">Indonesian (Bahasa Indonesia)</option>
                      <option value="Tagalog">Tagalog (Filipino)</option>
                      <option value="Ukrainian">Ukrainian (Українська)</option>
                      <option value="Hebrew">Hebrew (עברית)</option>
                      <option value="Thai">Thai (ไทย)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Location / Conference Endpoint
                  </label>
                  <input
                    type="text"
                    value={locationOrLink}
                    onChange={(e) => setLocationOrLink(e.target.value)}
                    placeholder="e.g. Boardroom Alpha + Google Meet or https://meet.google.com/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                {/* Date, Time, Host */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Time
                    </label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Meeting Host
                    </label>
                    <select
                      value={hostId}
                      onChange={(e) => setHostId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      {team.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.roleTitle})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Searchable Attendees Selector */}
                <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Attendees ({selectedAttendeeIds.length} of {team.length} selected)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedAttendeeIds(team.map((m) => m.id))}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        Select All
                      </button>
                      <span className="text-slate-600">·</span>
                      <button
                        type="button"
                        onClick={() => setSelectedAttendeeIds([])}
                        className="text-[11px] text-slate-400 hover:text-white transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Search Bar for Attendees */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={attendeeSearchQuery}
                        onChange={(e) => setAttendeeSearchQuery(e.target.value)}
                        placeholder="Type to search attendees by name, role, email, or department..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-3 pr-8 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                      {attendeeSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setAttendeeSearchQuery('')}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Department Quick Filter */}
                    <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
                      {['All', 'Engineering', 'Product', 'Design'].map((dept) => (
                        <button
                          key={dept}
                          type="button"
                          onClick={() => setAttendeeDeptFilter(dept)}
                          className={`px-2.5 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${
                            attendeeDeptFilter === dept
                              ? 'bg-slate-800 border-slate-700 text-white font-medium'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {dept}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filtered Attendees List */}
                  <div className="max-h-44 overflow-y-auto space-y-1.5 p-1">
                    {team
                      .filter((m) => {
                        const matchesDept =
                          attendeeDeptFilter === 'All' || m.department === attendeeDeptFilter;
                        const q = attendeeSearchQuery.toLowerCase().trim();
                        const matchesSearch =
                          !q ||
                          m.name.toLowerCase().includes(q) ||
                          m.roleTitle.toLowerCase().includes(q) ||
                          m.email.toLowerCase().includes(q) ||
                          m.department.toLowerCase().includes(q);
                        return matchesDept && matchesSearch;
                      })
                      .map((m) => {
                        const isSelected = selectedAttendeeIds.includes(m.id);
                        return (
                          <div
                            key={m.id}
                            onClick={() => toggleAttendee(m.id)}
                            className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                                : 'bg-slate-900 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className={`text-xs font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`}>
                                {isSelected ? '✓' : '+'}
                              </span>
                              {m.avatarUrl ? (
                                <img
                                  src={m.avatarUrl}
                                  alt={m.name}
                                  className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-800"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                                  {m.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <span className="text-xs font-medium text-white">{m.name}</span>
                                <span className="text-[10px] text-slate-500 ml-2">
                                  {m.roleTitle}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              {m.department}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Mode Selector for Audio / Transcript Input */}
              <div className="pt-2 border-t border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInputMode('text')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                      inputMode === 'text'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Paste Transcript</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInputMode('record')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                      inputMode === 'record'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Live Mic Recording</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInputMode('upload')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                      inputMode === 'upload'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Audio File</span>
                  </button>
                </div>

                {inputMode === 'record' && (
                  <AudioRecorder
                    onRecordingComplete={handleRecordingComplete}
                    onCancel={() => setInputMode('text')}
                  />
                )}

                {inputMode === 'upload' && (
                  <div className="border border-dashed border-slate-800 rounded-xl p-6 text-center bg-slate-950/40">
                    <Upload className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-300 font-medium mb-1">
                      Choose an audio file (.mp3, .wav, .m4a, .webm)
                    </p>
                    <p className="text-[11px] text-slate-500 mb-3">
                      Audio files will be automatically transcribed by Cadence AI.
                    </p>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/20 file:text-emerald-300 hover:file:bg-emerald-500/30 cursor-pointer"
                    />
                    {audioFileName ? (
                      <div className="mt-3 flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2 max-w-md mx-auto">
                        <span className="text-xs text-emerald-400 font-mono truncate">
                          Selected: {audioFileName}
                        </span>
                        <button
                          type="button"
                          onClick={() => setAudioFileName(undefined)}
                          className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition-colors"
                          title="Remove audio file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Transcript Text area */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Transcript Dialogue
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Include speaker prefixes (e.g. "Priya: I will...") for highest accuracy
                    </span>
                  </div>
                  <textarea
                    rows={7}
                    value={transcriptText}
                    onChange={(e) => setTranscriptText(e.target.value)}
                    placeholder="Paste meeting transcript or speaker utterances here..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60 font-mono leading-relaxed"
                  />
                </div>
              </div>

              {/* Bottom Submit */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold rounded-lg shadow-sm transition-all"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Extract Action Items &amp; Brief</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PROCESSING SKELETON */}
          {step === 'processing' && (
            <div className="py-20 text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-3 border-emerald-500/30 border-t-emerald-400 animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">
                  Cadence AI is analyzing your session...
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Parsing speaker utterances, resolving deadlines, matching attendee rosters, and generating executive takeaways.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW CANDIDATES */}
          {step === 'review' && analysisResult && (
            <div className="space-y-6">
              {/* Executive Summary Preview */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-emerald-400 mb-2">
                  Generated Executive Takeaways
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {analysisResult.executiveSummary.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action items verification list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Extracted Action Items ({editableTasks.length})
                  </h4>
                  <span className="text-xs text-slate-500">
                    Verify owner assignments and deadlines before confirming
                  </span>
                </div>

                {editableTasks.length === 0 ? (
                  <p className="text-xs text-slate-500">No action items detected.</p>
                ) : (
                  editableTasks.map((item, idx) => (
                    <div
                      key={item.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...editableTasks];
                            updated[idx].description = e.target.value;
                            setEditableTasks(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            setEditableTasks(editableTasks.filter((_, i) => i !== idx));
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {/* Assignee */}
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">
                            Assignee
                          </label>
                          <select
                            value={item.ownerId || ''}
                            onChange={(e) => {
                              const updated = [...editableTasks];
                              updated[idx].ownerId = e.target.value || null;
                              setEditableTasks(updated);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none"
                          >
                            <option value="">Unassigned</option>
                            {team.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Priority */}
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">
                            Priority
                          </label>
                          <select
                            value={item.priority}
                            onChange={(e) => {
                              const updated = [...editableTasks];
                              updated[idx].priority = e.target.value as any;
                              setEditableTasks(updated);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none"
                          >
                            <option value="urgent">Urgent</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </div>

                        {/* Deadline */}
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">
                            Target Deadline
                          </label>
                          <input
                            type="date"
                            value={item.deadline || ''}
                            onChange={(e) => {
                              const updated = [...editableTasks];
                              updated[idx].deadline = e.target.value || null;
                              updated[idx].deadlineToDisplay = e.target.value;
                              setEditableTasks(updated);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Confirm Actions */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ← Back to Transcript
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAndSave}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold rounded-lg shadow-sm transition-all"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Confirm &amp; Publish Meeting</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
