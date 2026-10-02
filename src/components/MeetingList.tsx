import React, { useState } from 'react';
import { Meeting, Task, TeamMember, MeetingModality } from '../types';
import {
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle2,
  FileAudio,
  ArrowRight,
  Plus,
  Lock,
  Building,
  Globe,
  Radio,
  DollarSign,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { calculateMeetingCost } from '../utils/costCalculator';

interface MeetingListProps {
  meetings: Meeting[];
  tasks: Task[];
  team: TeamMember[];
  activeUser: TeamMember;
  onSelectMeeting: (meeting: Meeting) => void;
  onOpenNewMeeting: () => void;
  searchQuery: string;
  onAskCadenceAboutMeeting?: (meetingId: string) => void;
}

export const MeetingList: React.FC<MeetingListProps> = ({
  meetings,
  tasks,
  team,
  activeUser,
  onSelectMeeting,
  onOpenNewMeeting,
  searchQuery,
  onAskCadenceAboutMeeting,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'mine'>('all');
  const [modalityFilter, setModalityFilter] = useState<'all' | MeetingModality>('all');

  // Permission & Modality aware filtering
  const visibleMeetings = meetings.filter((m) => {
    if (m.privacyLevel === 'confidential') {
      const isAttendee = m.attendeeIds.includes(activeUser.id);
      const isHost = m.hostId === activeUser.id;
      if (!isAttendee && !isHost && !activeUser.isAdmin) {
        return false;
      }
    }

    if (filterMode === 'mine') {
      const isAttendee = m.attendeeIds.includes(activeUser.id);
      const isHost = m.hostId === activeUser.id;
      if (!isAttendee && !isHost) return false;
    }

    if (modalityFilter !== 'all' && m.modality !== modalityFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchAgenda = m.agenda.toLowerCase().includes(q);
      const matchHost = m.hostName.toLowerCase().includes(q);
      const matchLoc = m.locationOrLink?.toLowerCase().includes(q);
      const attendeeNames = team
        .filter((tm) => m.attendeeIds.includes(tm.id))
        .map((tm) => tm.name.toLowerCase());
      const matchAttendee = attendeeNames.some((name) => name.includes(q));
      const matchDecisions = m.keyDecisions.some((d) => d.decision.toLowerCase().includes(q));

      if (!matchTitle && !matchAgenda && !matchHost && !matchLoc && !matchAttendee && !matchDecisions) {
        return false;
      }
    }

    return true;
  });

  const getModalityBadge = (modality: MeetingModality) => {
    switch (modality) {
      case 'hybrid':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
            <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
            <span>HYBRID</span>
          </span>
        );
      case 'in_person':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
            <Building className="w-2.5 h-2.5 text-amber-400" />
            <span>IN-PERSON</span>
          </span>
        );
      case 'online':
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-800/40">
            <Globe className="w-2.5 h-2.5 text-sky-400" />
            <span>ONLINE</span>
          </span>
        );
    }
  };

  const getPrivacyBadge = (level: Meeting['privacyLevel']) => {
    switch (level) {
      case 'confidential':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
            <Lock className="w-2.5 h-2.5" />
            <span>CONFIDENTIAL</span>
          </span>
        );
      case 'department':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/40">
            <span>DEPARTMENT</span>
          </span>
        );
      case 'company':
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
            <span>COMPANY</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Meeting Intelligence Hub</span>
            {!activeUser.isAdmin && (
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-normal">
                Filtered for {activeUser.name.split(' ')[0]}
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Hybrid conference rooms, remote video calls, payroll ROI audits, and tracked action items.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Modality Filter Pills */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            {(
              [
                { id: 'all', label: 'All Setups' },
                { id: 'hybrid', label: '📡 Hybrid' },
                { id: 'online', label: '🌐 Online' },
                { id: 'in_person', label: '🏛️ In-Person' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setModalityFilter(item.id)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  modalityFilter === item.id
                    ? 'bg-slate-800 text-white font-medium shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Segmented Filter */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded transition-colors ${
                filterMode === 'all'
                  ? 'bg-slate-800 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Visible
            </button>
            <button
              onClick={() => setFilterMode('mine')}
              className={`px-3 py-1 rounded transition-colors ${
                filterMode === 'mine'
                  ? 'bg-slate-800 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              My Sessions
            </button>
          </div>

          <button
            onClick={onOpenNewMeeting}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold rounded-lg shadow-sm transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Meeting</span>
          </button>
        </div>
      </div>

      {/* Grid of Meeting Cards */}
      {visibleMeetings.length === 0 ? (
        <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-3">
          <FileAudio className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No accessible sessions found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? `No sessions match "${searchQuery}".`
              : 'You do not have access to any meetings under this filter view.'}
          </p>
          <button
            onClick={onOpenNewMeeting}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-400 text-slate-950 text-xs font-semibold rounded-lg mt-2 hover:bg-emerald-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Host New Meeting</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleMeetings.map((meeting) => {
            const meetingTasks = tasks.filter((t) => t.meetingId === meeting.id);
            const completedTasks = meetingTasks.filter((t) => t.status === 'done');
            const attendees = team.filter((m) => meeting.attendeeIds.includes(m.id));
            const costDetails = calculateMeetingCost(meeting, tasks, team);

            return (
              <div
                key={meeting.id}
                onClick={() => onSelectMeeting(meeting)}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700/80 transition-all cursor-pointer group flex flex-col justify-between shadow-sm relative overflow-hidden"
              >
                <div>
                  {/* Meta header */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                    <div className="flex items-center gap-2 font-mono tabular-nums">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{meeting.date}</span>
                      <span aria-hidden="true">·</span>
                      <span>{meeting.time}</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {(meeting.detectedLanguage || (meeting.spokenLanguage && meeting.spokenLanguage !== 'English' && meeting.spokenLanguage !== 'Auto-Detect Any Language')) && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/20" title="Translated to English by Cadence AI">
                          <span>🌐 {meeting.detectedLanguage || meeting.spokenLanguage} → EN</span>
                        </span>
                      )}
                      {getModalityBadge(meeting.modality || 'online')}
                      {getPrivacyBadge(meeting.privacyLevel)}
                    </div>
                  </div>

                  {/* Title and agenda */}
                  <h3 className="text-base font-semibold text-white group-hover:text-emerald-300 transition-colors leading-snug mb-1.5">
                    {meeting.title}
                  </h3>

                  {meeting.locationOrLink && (
                    <p className="text-[11px] font-mono text-emerald-400/80 mb-2 truncate">
                      📍 {meeting.locationOrLink}
                    </p>
                  )}

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {meeting.agenda}
                  </p>

                  {/* Executive highlights preview */}
                  {meeting.executiveSummary.length > 0 && (
                    <div className="bg-slate-950/60 rounded-lg p-2.5 mb-3 border border-slate-800/80">
                      <p className="text-[11px] text-slate-300 line-clamp-2">
                        <strong className="text-emerald-400 font-medium">TL;DR: </strong>
                        {meeting.executiveSummary[0]}
                      </p>
                    </div>
                  )}

                  {/* Payroll Cost & ROI Badge */}
                  <div className="flex items-center justify-between text-[11px] font-mono py-1.5 px-2 bg-slate-950/40 rounded border border-slate-800/60 mb-3">
                    <span className="text-slate-400">
                      Est. Cost: <strong className="text-white">${costDetails.totalCost}</strong> ({meeting.durationMinutes}m)
                    </span>
                    <span
                      className={`font-semibold uppercase text-[10px] px-1.5 py-0.2 rounded ${
                        costDetails.roiRating === 'high'
                          ? 'text-emerald-400 bg-emerald-950/50'
                          : costDetails.roiRating === 'moderate'
                          ? 'text-sky-400 bg-sky-950/50'
                          : 'text-amber-400 bg-amber-950/50'
                      }`}
                    >
                      {costDetails.roiRating} ROI
                    </span>
                  </div>
                </div>

                {/* Card footer: Attendees, Tasks progress, Arrow */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  {/* Attendee avatars */}
                  <div className="flex items-center -space-x-1.5">
                    {attendees.slice(0, 4).map((att) =>
                      att.avatarUrl ? (
                        <img
                          key={att.id}
                          src={att.avatarUrl}
                          alt={att.name}
                          className="w-6 h-6 rounded-full ring-2 ring-slate-900 object-cover"
                          title={att.name}
                        />
                      ) : (
                        <div
                          key={att.id}
                          className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-bold ring-2 ring-slate-900"
                          title={att.name}
                        >
                          {att.name.charAt(0)}
                        </div>
                      )
                    )}
                    {attendees.length > 4 && (
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-mono ring-2 ring-slate-900">
                        +{attendees.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Deliverables stats & quick Ask action */}
                  <div className="flex items-center gap-2">
                    {onAskCadenceAboutMeeting && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAskCadenceAboutMeeting(meeting.id);
                        }}
                        className="px-2 py-1 rounded bg-slate-800/80 hover:bg-emerald-950/40 text-slate-400 hover:text-emerald-300 border border-slate-700/60 hover:border-emerald-500/40 text-[10px] font-medium flex items-center gap-1 transition-colors"
                        title="Query AI intelligence about this session"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>Query</span>
                      </button>
                    )}

                    <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                      <strong className="text-white">{completedTasks.length}</strong>/
                      {meetingTasks.length} tasks
                    </span>
                    <span className="text-slate-500 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
