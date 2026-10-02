import React, { useState } from 'react';
import { TeamMember, Task, Meeting } from '../types';
import {
  User,
  Mail,
  Briefcase,
  Building,
  CheckCircle2,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  Radio,
  FileText,
  Shield,
  ArrowRight,
  ExternalLink,
  Mic,
  MicOff,
  AlertTriangle,
  HeartCrack,
} from 'lucide-react';
import { calculateMeetingCost } from '../utils/costCalculator';

interface MemberProfileModalProps {
  member: TeamMember;
  allMembers: TeamMember[];
  tasks: Task[];
  meetings: Meeting[];
  activeUser: TeamMember;
  onClose: () => void;
  onOpenMeeting: (meetingId: string) => void;
  onSwitchToThisMember?: (member: TeamMember) => void;
  onOpenVoiceRegistration?: (member: TeamMember) => void;
  onRemoveVoiceProfile?: (memberId: string) => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  member,
  allMembers,
  tasks,
  meetings,
  activeUser,
  onClose,
  onOpenMeeting,
  onSwitchToThisMember,
  onOpenVoiceRegistration,
  onRemoveVoiceProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'meetings'>('overview');

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

  // Tasks assigned to this specific member
  const memberTasks = tasks.filter((t) => t.ownerId === member.id);
  const completedTasks = memberTasks.filter((t) => t.status === 'done');
  const inProgressTasks = memberTasks.filter((t) => t.status === 'in_progress');
  const pendingTasks = memberTasks.filter((t) => t.status === 'pending');
  const completionRate =
    memberTasks.length > 0 ? Math.round((completedTasks.length / memberTasks.length) * 100) : 0;

  // Meetings attended by this member
  const memberMeetings = meetings.filter(
    (m) => m.attendeeIds.includes(member.id) || m.hostId === member.id
  );
  const hostedMeetings = meetings.filter((m) => m.hostId === member.id);

  // Calculate meeting hours spent
  const totalMinutesInMeetings = memberMeetings.reduce(
    (acc, m) => acc + (m.durationMinutes || 30),
    0
  );
  const totalHours = (totalMinutesInMeetings / 60).toFixed(1);

  // Calculate personal payroll cost footprint
  const totalCostFootprint = Math.round(
    (member.hourlyRate || 95) * (totalMinutesInMeetings / 60)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl my-auto max-h-[92vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Banner Profile Header */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/30 shadow-lg shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-slate-800 text-emerald-400 font-bold text-2xl flex items-center justify-center ring-2 ring-emerald-500/30 shrink-0">
                  {member.name.charAt(0)}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {member.name}
                  </h2>
                  {member.isAdmin && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                      WORKSPACE ADMIN
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{member.roleTitle}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-emerald-400">{member.department}</span>
                </p>

                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{member.email}</span>
                </p>
              </div>
            </div>

            {/* Quick Switch Persona Action */}
            {onSwitchToThisMember && activeUser.id !== member.id && (
              <button
                onClick={() => {
                  onSwitchToThisMember(member);
                  onClose();
                }}
                className="self-start sm:self-center px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors shrink-0"
                title="View workspace from this employee's perspective"
              >
                <span>Switch to this user</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800 bg-slate-900/90 flex items-center gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Performance &amp; ROI
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Assigned Tasks</span>
            <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400">
              {memberTasks.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('meetings')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'meetings'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Attended Meetings</span>
            <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-sky-400">
              {memberMeetings.length}
            </span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* TAB 1: OVERVIEW & ROI */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
                    Completion Velocity
                  </span>
                  <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                    {completionRate}%
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                    {completedTasks.length} of {memberTasks.length} finished
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
                    Meeting Hours
                  </span>
                  <span className="text-2xl font-bold font-mono text-white tabular-nums">
                    {totalHours}h
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                    across {memberMeetings.length} sessions
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
                    Hourly Payroll Band
                  </span>
                  <span className="text-2xl font-bold font-mono text-sky-400 tabular-nums">
                    ${member.hourlyRate || 95}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                    per hour rate
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
                    Meeting Investment
                  </span>
                  <span className="text-2xl font-bold font-mono text-white tabular-nums">
                    ${totalCostFootprint}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                    payroll consumed
                  </span>
                </div>
              </div>

              {/* Workload Status Bar */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">Active Workload Distribution</span>
                  <span className="font-mono text-slate-400">
                    {memberTasks.length} Total Assigned Deliverables
                  </span>
                </div>

                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-400"
                    style={{
                      width: `${memberTasks.length ? (completedTasks.length / memberTasks.length) * 100 : 0}%`,
                    }}
                    title={`Completed: ${completedTasks.length}`}
                  />
                  <div
                    className="bg-sky-400"
                    style={{
                      width: `${memberTasks.length ? (inProgressTasks.length / memberTasks.length) * 100 : 0}%`,
                    }}
                    title={`In Progress: ${inProgressTasks.length}`}
                  />
                  <div
                    className="bg-slate-600"
                    style={{
                      width: `${memberTasks.length ? (pendingTasks.length / memberTasks.length) * 100 : 0}%`,
                    }}
                    title={`Pending: ${pendingTasks.length}`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1 text-xs">
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-emerald-400 font-bold font-mono">
                      {completedTasks.length}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Completed</span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-sky-400 font-bold font-mono">
                      {inProgressTasks.length}
                    </span>
                    <span className="text-[10px] text-slate-400 block">In Progress</span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400 font-bold font-mono">
                      {pendingTasks.length}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Pending</span>
                  </div>
                </div>
              </div>

              {/* Departure Notice Banner (if Quitting) */}
              {member.offboarding?.isQuitting && (
                <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-5 space-y-2">
                  <div className="flex items-center justify-between text-rose-300 font-semibold text-xs">
                    <span className="flex items-center gap-2">
                      <HeartCrack className="w-4 h-4 text-rose-400" />
                      <span>Departure Notice: We are sorry to know that you are leaving</span>
                    </span>
                    <span className="font-mono text-[10px] bg-rose-900/80 px-2 py-0.5 rounded text-white font-bold">
                      {member.offboarding.daysRemaining ?? member.offboarding.noticePeriodDays} days remaining
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Kindly remove your voice registration from your profile before your final departure date. Once removed, your biometric acoustic vectors are permanently erased from the meeting diarization engine.
                  </p>
                </div>
              )}

              {/* Vocal Biometrics Registration Card */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Cadence Vocal Biometrics &amp; Voiceprint</span>
                        {member.voiceProfile?.status === 'removed' ? (
                          <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 border border-rose-800/40 px-1.5 py-0.5 rounded font-bold">
                            VOICE REMOVED
                          </span>
                        ) : member.voiceProfile?.isRegistered ? (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded font-bold">
                            ENROLLED &amp; TRAINED
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/40 px-1.5 py-0.5 rounded font-bold">
                            REGISTRATION REQUIRED
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {member.voiceProfile?.isRegistered
                          ? `Acoustic vectors calibrated. Voice diarization match precision active across all languages.`
                          : `Not yet enrolled. Train Cadence with your speech patterns to unlock automated speaker diarization.`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {member.voiceProfile?.isRegistered && onRemoveVoiceProfile && (
                      <button
                        onClick={() => onRemoveVoiceProfile(member.id)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 text-xs rounded-lg border border-slate-800 hover:border-rose-800/50 transition-colors flex items-center gap-1.5"
                        title="Remove voice biometric enrollment"
                      >
                        <MicOff className="w-3.5 h-3.5" />
                        <span>Remove Voice</span>
                      </button>
                    )}

                    {onOpenVoiceRegistration && (
                      <button
                        onClick={() => onOpenVoiceRegistration(member)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Mic className="w-3.5 h-3.5 fill-current" />
                        <span>{member.voiceProfile?.isRegistered ? 'Re-calibrate Voice' : 'Register Your Voice'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {member.voiceProfile?.status === 'removed' && (
                  <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-lg text-xs text-amber-300">
                    <p className="font-semibold">⚠️ 48-Hour Grace Window:</p>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      Your voiceprint has been removed. Under company policy, if this was removed by mistake, please re-register within 48 hours, or workspace administrators will be alerted.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ASSIGNED TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              {memberTasks.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                  No deliverables currently assigned to {member.name}.
                </div>
              ) : (
                memberTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold uppercase text-[10px] ${
                            t.priority === 'urgent'
                              ? 'text-rose-400'
                              : t.priority === 'high'
                              ? 'text-amber-400'
                              : 'text-sky-400'
                          }`}
                        >
                          {t.priority}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          Due: {t.deadlineDisplay || t.deadline || 'TBD'}
                        </span>
                      </div>
                      <p className="font-medium text-white">{t.description}</p>
                      <p className="text-[11px] text-slate-500">From: {t.meetingTitle}</p>
                    </div>

                    <span
                      className={`px-2 py-1 rounded text-[10px] font-mono capitalize ${
                        t.status === 'done'
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                          : t.status === 'in_progress'
                          ? 'bg-sky-950/40 text-sky-400 border border-sky-800/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: ATTENDED MEETINGS */}
          {activeTab === 'meetings' && (
            <div className="space-y-3">
              {memberMeetings.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                  No recorded meetings attended yet.
                </div>
              ) : (
                memberMeetings.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      onOpenMeeting(m.id);
                      onClose();
                    }}
                    className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                        <span>{m.date}</span>
                        <span>·</span>
                        <span>{m.durationMinutes}m</span>
                        <span>·</span>
                        <span className="text-emerald-400 uppercase font-semibold">
                          {m.modality || 'ONLINE'}
                        </span>
                      </div>
                      <h4 className="font-semibold text-white group-hover:text-emerald-300 transition-colors">
                        {m.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{m.agenda}</p>
                    </div>

                    <span className="text-slate-500 group-hover:text-emerald-300 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
