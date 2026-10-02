import React, { useState } from 'react';
import { Plus, Search, Shield, ChevronDown, User, Check, Users, LogOut, Home } from 'lucide-react';
import { TeamMember, AppNotification } from '../types';
import { NotificationDropdown } from './NotificationDropdown';

interface TopNavProps {
  currentTab: 'meetings' | 'tasks' | 'team' | 'analytics';
  onSelectTab: (tab: 'meetings' | 'tasks' | 'team' | 'analytics') => void;
  onOpenNewMeeting: () => void;
  onOpenDispatchBot: () => void;
  onOpenAdminPanel: () => void;
  onOpenAskCadence: () => void;
  onOpenWeeklyDigest: () => void;
  onOpenMyProfile?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  openTaskCount: number;
  activeUser: TeamMember;
  allMembers: TeamMember[];
  onSwitchUser: (user: TeamMember) => void;
  notifications: AppNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onSelectTaskFromNotification?: (taskId: string, meetingId?: string) => void;
  onSelectMeetingFromNotification?: (meetingId: string) => void;
  onSignOut: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewMeeting,
  onOpenDispatchBot,
  onOpenAdminPanel,
  onOpenAskCadence,
  onOpenWeeklyDigest,
  onOpenMyProfile,
  searchQuery,
  onSearchChange,
  openTaskCount,
  activeUser,
  allMembers,
  onSwitchUser,
  notifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onSelectTaskFromNotification,
  onSelectMeetingFromNotification,
  onSignOut,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Brand wordmark & Homepage link */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('meetings')}
            className="flex items-center gap-2.5 text-left group"
            title="Cadence Meeting Intelligence"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/25 transition-colors">
              <span className="font-mono font-bold text-sm tracking-tighter">Cd</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-sans group-hover:text-emerald-300 transition-colors">
              Cadence
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('meetings')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              currentTab === 'meetings'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Meetings
          </button>

          <button
            onClick={() => onSelectTab('tasks')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              currentTab === 'tasks'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>Action Items</span>
            {openTaskCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-mono bg-slate-700 text-slate-200 rounded-full">
                {openTaskCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('team')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              currentTab === 'team'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Team Directory
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              currentTab === 'analytics'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Executive Analytics
          </button>
        </nav>

        {/* Search Input */}
        <div className="hidden lg:flex items-center flex-1 max-w-xs relative mx-2">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search transcripts, decisions..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Ask Cadence AI Trigger */}
          <button
            onClick={onOpenAskCadence}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-300 transition-colors"
            title="Ask anything across all company transcripts (CMD+K)"
          >
            <span className="font-mono text-emerald-400">✨ Ask Cadence</span>
            <kbd className="hidden lg:inline-block px-1 py-0.2 text-[9px] font-mono bg-slate-900 border border-slate-800 rounded text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Notification Bell Dropdown with Chime Sound */}
          <NotificationDropdown
            notifications={notifications}
            activeUser={activeUser}
            onMarkAsRead={onMarkNotificationAsRead}
            onMarkAllAsRead={onMarkAllNotificationsAsRead}
            onSelectTask={onSelectTaskFromNotification}
            onSelectMeeting={onSelectMeetingFromNotification}
          />

          {/* Monday Weekly Digest */}
          <button
            onClick={onOpenWeeklyDigest}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-lg border border-slate-800 transition-colors"
            title="Open Monday Executive Summary & Velocity Digest"
          >
            <span>Weekly Digest</span>
          </button>

          {/* Dispatch Live Bot */}
          <button
            onClick={onOpenDispatchBot}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-lg border border-slate-800 transition-colors"
            title="Dispatch AI Bot to Google Meet, Zoom, or Teams room"
          >
            <span>📡 Dispatch Bot</span>
          </button>

          {/* Admin Console shortcut for admin users */}
          {activeUser.isAdmin && (
            <button
              onClick={onOpenAdminPanel}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-lg border border-slate-700/80 transition-colors"
              title="Open Workspace Administration Panel"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Console</span>
            </button>
          )}

          {/* New meeting CTA */}
          <button
            onClick={onOpenNewMeeting}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] rounded-lg shadow-sm transition-all whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New Meeting</span>
          </button>

          {/* Role / Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-900 hover:bg-slate-850 rounded-lg border border-slate-800 text-left transition-colors"
              title="Switch user perspective (Admin vs. Employee)"
            >
              {activeUser.avatarUrl ? (
                <img
                  src={activeUser.avatarUrl}
                  alt={activeUser.name}
                  className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-slate-700"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                  {activeUser.name.charAt(0)}
                </div>
              )}
              <div className="hidden xl:block text-left leading-tight truncate max-w-[110px]">
                <p className="text-xs font-medium text-white truncate">{activeUser.name.split(' ')[0]}</p>
                <p className="text-[10px] font-mono text-emerald-400 truncate">
                  {activeUser.isAdmin ? 'Admin' : 'Member'}
                </p>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-40 space-y-1">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-white">Switch Role Perspective</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Test permissions between Administrator and Employees.
                    </p>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-0.5 py-1">
                    {allMembers.map((member) => {
                      const isCurrent = member.id === activeUser.id;
                      return (
                        <button
                          key={member.id}
                          onClick={() => {
                            onSwitchUser(member);
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                            isCurrent
                              ? 'bg-slate-800 text-white'
                              : 'text-slate-300 hover:bg-slate-850 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            {member.avatarUrl ? (
                              <img
                                src={member.avatarUrl}
                                alt={member.name}
                                className="w-7 h-7 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                                {member.name.charAt(0)}
                              </div>
                            )}
                            <div className="truncate">
                              <p className="font-medium truncate flex items-center gap-1.5">
                                <span>{member.name}</span>
                                {member.isAdmin && (
                                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 px-1 py-0.2 rounded border border-emerald-500/20">
                                    ADMIN
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">{member.roleTitle}</p>
                            </div>
                          </div>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-1 border-t border-slate-800 space-y-0.5">
                    {onOpenMyProfile && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenMyProfile();
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-sky-400" />
                        <span>My Employee Profile &amp; ROI</span>
                      </button>
                    )}

                    {activeUser.isAdmin && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenAdminPanel();
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-emerald-400 hover:bg-slate-800 transition-colors"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Open Admin Console</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Sign out and return to the Cadence home page"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out &amp; Return to Home</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Exit / Return to Homepage Icon Button */}
          <button
            onClick={onSignOut}
            className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 transition-colors focus:outline-none"
            title="Log Out & Return to Home"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
