import React, { useState } from 'react';
import { TeamMember, Task, Meeting } from '../types';
import {
  User,
  Mail,
  Plus,
  X,
  Briefcase,
  Building,
  Check,
  Edit2,
  Trash2,
  Search,
  Mic,
  MicOff,
  HeartCrack,
  AlertTriangle,
} from 'lucide-react';
import { EditMemberModal } from './EditMemberModal';
import { MemberProfileModal } from './MemberProfileModal';
import { OffboardingModal } from './OffboardingModal';

interface TeamDirectoryProps {
  team: TeamMember[];
  tasks: Task[];
  meetings?: Meeting[];
  activeUser: TeamMember;
  onAddTeamMember: (member: TeamMember) => void;
  onUpdateMember: (member: TeamMember) => void;
  onDeleteMember: (memberId: string) => void;
  onFilterTasksByMember: (memberId: string) => void;
  onOpenMeeting?: (meetingId: string) => void;
  onSwitchUser?: (member: TeamMember) => void;
  onOpenVoiceRegistration?: (member: TeamMember) => void;
  onConfirmQuittingNotice?: (memberId: string, daysNotice: number, notes: string) => void;
  onRemoveVoiceProfile?: (memberId: string) => void;
  onRestoreVoiceProfile?: (memberId: string) => void;
}

export const TeamDirectory: React.FC<TeamDirectoryProps> = ({
  team,
  tasks,
  meetings = [],
  activeUser,
  onAddTeamMember,
  onUpdateMember,
  onDeleteMember,
  onFilterTasksByMember,
  onOpenMeeting = () => {},
  onSwitchUser,
  onOpenVoiceRegistration,
  onConfirmQuittingNotice,
  onRemoveVoiceProfile,
  onRestoreVoiceProfile,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [viewingProfileMember, setViewingProfileMember] = useState<TeamMember | null>(null);
  const [offboardingMember, setOffboardingMember] = useState<TeamMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  // Add Member Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [roleTitle, setRoleTitle] = useState('');
  const [hourlyRate, setHourlyRate] = useState(95);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newMember: TeamMember = {
      id: `emp_${Date.now()}`,
      employeeCode: `EMP-${String(team.length + 1).padStart(3, '0')}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      roleTitle: roleTitle.trim() || 'Contributor',
      hourlyRate: Number(hourlyRate) || 95,
      isAdmin,
    };

    onAddTeamMember(newMember);
    setName('');
    setEmail('');
    setRoleTitle('');
    setIsAdding(false);
  };

  const filteredMembers = team.filter((m) => {
    const matchesDept = deptFilter === 'All' || m.department === deptFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.roleTitle.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.department.toLowerCase().includes(q);
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Team Directory &amp; Member Profiles</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/20 font-normal">
              {team.length} Members
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Team member profiles, personal meeting ROI footprints, and task ownership.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Add member button (Admin only) */}
          {activeUser.isAdmin ? (
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Team Member</span>
            </button>
          ) : (
            <span className="text-xs text-slate-500 font-mono">
              Signed in as {activeUser.name.split(' ')[0]}
            </span>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, email, or department..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          {['All', 'Engineering', 'Product', 'Design', 'Operations', 'Sales'].map((dept) => (
            <button
              key={dept}
              onClick={() => setDeptFilter(dept)}
              className={`px-3 py-1 rounded-lg border transition-colors whitespace-nowrap ${
                deptFilter === dept
                  ? 'bg-slate-800 border-slate-700 text-white font-medium'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Add team member modal/form */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-emerald-500/30 rounded-xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Add New Team Member</h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kenji Takahashi"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kenji@company.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Operations">Operations</option>
                <option value="Sales">Sales</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Role Title
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Lead QA Automation Engineer"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Hourly Payroll Rate ($/hr)
              </label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isAdminCheckbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="accent-emerald-400 rounded"
              />
              <label htmlFor="isAdminCheckbox" className="text-xs text-slate-300">
                Grant Administrator access
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold rounded-lg"
            >
              Save Member
            </button>
          </div>
        </form>
      )}

      {/* Team grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => {
          const memberTasks = tasks.filter((t) => t.ownerId === member.id);
          const completedTasks = memberTasks.filter((t) => t.status === 'done');
          const openTasks = memberTasks.filter((t) => t.status !== 'done');

          return (
            <div
              key={member.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div
                    onClick={() => setViewingProfileMember(member)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover shrink-0 ring-1 ring-slate-800 group-hover:ring-emerald-400/50 transition-all"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0 group-hover:ring-1 group-hover:ring-emerald-400">
                        {member.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5 group-hover:text-emerald-300 transition-colors">
                        <span>{member.name}</span>
                        {member.isAdmin && (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-500/20">
                            Admin
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400">{member.roleTitle}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                    {member.employeeCode}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 mb-4 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{member.department}</span>
                    </div>

                    {/* Voice registration badge */}
                    {member.voiceProfile?.status === 'removed' ? (
                      <span className="text-[10px] font-mono text-rose-400 bg-rose-950/40 px-1.5 py-0.2 rounded border border-rose-800/40 font-semibold flex items-center gap-1">
                        <MicOff className="w-2.5 h-2.5" />
                        <span>Voice Purged</span>
                      </span>
                    ) : member.voiceProfile?.isRegistered ? (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-800/40 font-semibold flex items-center gap-1">
                        <Mic className="w-2.5 h-2.5" />
                        <span>Voice Active</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-800/40 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>Voice Pending</span>
                      </span>
                    )}
                  </div>

                  {/* Quitting notice indicator */}
                  {member.offboarding?.isQuitting && (
                    <div className="mt-2 p-1.5 bg-rose-950/30 border border-rose-500/30 rounded text-[11px] text-rose-300 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <HeartCrack className="w-3 h-3 text-rose-400" />
                        <span>Departure Notice</span>
                      </span>
                      <span className="font-mono text-[10px] font-bold">
                        {member.offboarding.daysRemaining ?? member.offboarding.noticePeriodDays}d left
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Task metrics & Profile action button */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-mono tabular-nums text-[11px]">
                  <span className="text-slate-400">
                    <strong className="text-white">{openTasks.length}</strong> open
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-emerald-400">
                    <strong>{completedTasks.length}</strong> done
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* View Individual Profile Dashboard Button */}
                  <button
                    onClick={() => setViewingProfileMember(member)}
                    className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded border border-slate-700 transition-colors"
                    title="View individual employee profile & performance metrics"
                  >
                    Profile
                  </button>

                  {/* Departure / Offboarding management for Admins */}
                  {activeUser.isAdmin && member.id !== activeUser.id && (
                    <button
                      onClick={() => setOffboardingMember(member)}
                      className={`p-1.5 transition-colors rounded hover:bg-slate-800 ${
                        member.offboarding?.isQuitting
                          ? 'text-rose-400 hover:text-rose-300'
                          : 'text-slate-400 hover:text-rose-400'
                      }`}
                      title={member.offboarding?.isQuitting ? "Manage departure & voice removal notice" : "Issue employee quitting notice"}
                    >
                      <HeartCrack className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {(activeUser.isAdmin || activeUser.id === member.id) && (
                    <button
                      onClick={() => setEditingMember(member)}
                      className="p-1.5 text-slate-400 hover:text-emerald-400 transition-colors rounded hover:bg-slate-800"
                      title="Edit member details & role"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {activeUser.isAdmin && team.length > 1 && member.id !== activeUser.id && (
                    <button
                      onClick={() => {
                        if (confirm(`Remove "${member.name}" from workspace?`)) {
                          onDeleteMember(member.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors rounded hover:bg-slate-800"
                      title="Remove member from workspace"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Offboarding Modal */}
      {offboardingMember && (
        <OffboardingModal
          member={offboardingMember}
          isOpen={!!offboardingMember}
          onClose={() => setOffboardingMember(null)}
          onConfirmQuittingNotice={(id, days, notes) => {
            if (onConfirmQuittingNotice) onConfirmQuittingNotice(id, days, notes);
            setOffboardingMember(null);
          }}
          onRemoveVoiceProfile={(id) => {
            if (onRemoveVoiceProfile) onRemoveVoiceProfile(id);
          }}
          onRestoreVoiceProfile={(id) => {
            if (onRestoreVoiceProfile) onRestoreVoiceProfile(id);
          }}
          onFinalizeTermination={(id) => {
            onDeleteMember(id);
            setOffboardingMember(null);
          }}
        />
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <EditMemberModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSave={(updated) => {
            onUpdateMember(updated);
            setEditingMember(null);
          }}
          onDelete={(id) => {
            onDeleteMember(id);
            setEditingMember(null);
          }}
        />
      )}

      {/* Individual Employee Profile Dashboard Modal */}
      {viewingProfileMember && (
        <MemberProfileModal
          member={viewingProfileMember}
          allMembers={team}
          tasks={tasks}
          meetings={meetings}
          activeUser={activeUser}
          onClose={() => setViewingProfileMember(null)}
          onOpenMeeting={onOpenMeeting}
          onSwitchToThisMember={onSwitchUser}
          onOpenVoiceRegistration={onOpenVoiceRegistration}
          onRemoveVoiceProfile={onRemoveVoiceProfile}
        />
      )}
    </div>
  );
};
