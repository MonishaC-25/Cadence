import React, { useState, useEffect } from 'react';
import { Meeting, Task, TeamMember, TaskStatus, WorkspaceSettings, AppNotification } from './types';
import { storage } from './services/storage';
import { TopNav } from './components/TopNav';
import { MeetingList } from './components/MeetingList';
import { TaskBoard } from './components/TaskBoard';
import { TeamDirectory } from './components/TeamDirectory';
import { AnalyticsView } from './components/AnalyticsView';
import { MeetingDetailModal } from './components/MeetingDetailModal';
import { NewMeetingModal } from './components/NewMeetingModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AskCadenceModal } from './components/AskCadenceModal';
import { WeeklyDigestModal } from './components/WeeklyDigestModal';
import { DispatchBotModal } from './components/DispatchBotModal';
import { MemberProfileModal } from './components/MemberProfileModal';
import { OpeningPage } from './components/OpeningPage';
import { RotateCcw, Shield } from 'lucide-react';
import { soundFx } from './utils/soundEffects';

export default function App() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [settings, setSettings] = useState<WorkspaceSettings>(storage.getSettings());
  const [activeUser, setActiveUser] = useState<TeamMember>(() => storage.getActiveUser([]));
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [currentTab, setCurrentTab] = useState<'meetings' | 'tasks' | 'team' | 'analytics'>('meetings');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAskCadenceOpen, setIsAskCadenceOpen] = useState(false);
  const [askCadenceMeetingId, setAskCadenceMeetingId] = useState<string | undefined>(undefined);
  const [isWeeklyDigestOpen, setIsWeeklyDigestOpen] = useState(false);
  const [isDispatchBotOpen, setIsDispatchBotOpen] = useState(false);
  const [isMyProfileOpen, setIsMyProfileOpen] = useState(false);

  // Authentication & Opening Page State
  const [authSession, setAuthSession] = useState<{ isAuthenticated: boolean; userEmail?: string }>(() =>
    storage.getAuthSession()
  );

  // Load from local storage on mount
  useEffect(() => {
    const loadedMeetings = storage.getMeetings();
    const loadedTasks = storage.getTasks();
    const loadedTeam = storage.getTeam();
    const loadedSettings = storage.getSettings();
    const loadedActiveUser = storage.getActiveUser(loadedTeam);
    const loadedNotifs = storage.getNotifications();

    setMeetings(loadedMeetings);
    setTasks(loadedTasks);
    setTeam(loadedTeam);
    setSettings(loadedSettings);
    setActiveUser(loadedActiveUser);
    setNotifications(loadedNotifs);
  }, []);

  // Keyboard shortcut: CMD+K or Ctrl+K opens Ask Cadence
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsAskCadenceOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sign In handler from Opening Page
  const handleSignIn = (user: TeamMember) => {
    setActiveUser(user);
    storage.setActiveUser(user);
    const session = { isAuthenticated: true, userEmail: user.email };
    setAuthSession(session);
    storage.setAuthSession(session);
  };

  // Sign Out handler
  const handleSignOut = () => {
    const session = { isAuthenticated: false };
    setAuthSession(session);
    storage.setAuthSession(session);
  };

  // Switch persona user
  const handleSwitchUser = (user: TeamMember) => {
    setActiveUser(user);
    storage.setActiveUser(user);
  };

  // Dispatch in-app notification + simulated email relay
  const triggerNotification = (
    recipientId: string,
    title: string,
    message: string,
    extra?: { taskId?: string; meetingId?: string; meetingTitle?: string }
  ) => {
    const recipient = team.find((m) => m.id === recipientId);
    if (!recipient) return;

    const newNotif: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      recipientId: recipient.id,
      recipientEmail: recipient.email,
      title,
      message,
      taskId: extra?.taskId,
      meetingId: extra?.meetingId,
      meetingTitle: extra?.meetingTitle,
      type: 'task_assigned',
      isRead: false,
      createdAt: new Date().toISOString(),
      emailSent: true,
    };

    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    storage.saveNotifications(updated);

    // Play chime sound
    soundFx.playBellChime();
  };

  // Mark single notification read
  const handleMarkNotificationAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    setNotifications(updated);
    storage.saveNotifications(updated);
  };

  // Mark all notifications read
  const handleMarkAllNotificationsAsRead = () => {
    const updated = notifications.map((n) =>
      n.recipientId === activeUser.id || n.recipientEmail === activeUser.email
        ? { ...n, isRead: true }
        : n
    );
    setNotifications(updated);
    storage.saveNotifications(updated);
  };

  // Update tasks status with audit trail
  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const auditLog = [
          ...(t.auditLog || []),
          {
            id: `audit_${Date.now()}`,
            action: `Status updated to ${newStatus.replace('_', ' ').toUpperCase()}`,
            performedBy: activeUser.name,
            timestamp: new Date().toISOString(),
          },
        ];
        return { ...t, status: newStatus, auditLog };
      }
      return t;
    });
    setTasks(updated);
    storage.saveTasks(updated);
  };

  // Update task owner with audit trail and notification dispatch
  const handleUpdateTaskOwner = (taskId: string, newOwnerId: string | null) => {
    const owner = team.find((m) => m.id === newOwnerId);
    let targetTask: Task | undefined;

    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        targetTask = t;
        const auditLog = [
          ...(t.auditLog || []),
          {
            id: `audit_${Date.now()}`,
            action: `Reassigned to ${owner ? owner.name : 'Unassigned'}`,
            performedBy: activeUser.name,
            timestamp: new Date().toISOString(),
          },
        ];
        return {
          ...t,
          ownerId: newOwnerId,
          ownerName: owner ? owner.name : null,
          auditLog,
        };
      }
      return t;
    });

    setTasks(updated);
    storage.saveTasks(updated);

    // Notify assigned employee if new owner is set
    if (newOwnerId && owner && targetTask) {
      triggerNotification(
        newOwnerId,
        'Action item assigned to you',
        `"${targetTask.description}" from ${targetTask.meetingTitle || 'workspace session'}.`,
        {
          taskId: targetTask.id,
          meetingId: targetTask.meetingId,
          meetingTitle: targetTask.meetingTitle,
        }
      );
    }
  };

  // Add comment to task
  const handleAddTaskComment = (taskId: string, commentText: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const comments = [
          ...(t.comments || []),
          {
            id: `c_${Date.now()}`,
            authorId: activeUser.id,
            authorName: activeUser.name,
            authorAvatar: activeUser.avatarUrl,
            text: commentText,
            createdAt: new Date().toISOString(),
          },
        ];
        return { ...t, comments };
      }
      return t;
    });
    setTasks(updated);
    storage.saveTasks(updated);
  };

  // Add new task
  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task_${Date.now()}`,
      createdAt: new Date().toISOString(),
      auditLog: [
        {
          id: `audit_${Date.now()}`,
          action: 'Task logged from meeting review',
          performedBy: activeUser.name,
          timestamp: new Date().toISOString(),
        },
      ],
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    storage.saveTasks(updated);

    // Dispatch notification + email to assigned employee
    if (newTask.ownerId) {
      triggerNotification(
        newTask.ownerId,
        'New action item assigned',
        `"${newTask.description}" (Due: ${newTask.deadlineDisplay || newTask.deadline || 'Upcoming sprint'})`,
        {
          taskId: newTask.id,
          meetingId: newTask.meetingId,
          meetingTitle: newTask.meetingTitle,
        }
      );
    }
  };

  // Save new meeting + tasks
  const handleSaveNewMeeting = (newMeeting: Meeting, newTasks: Task[]) => {
    const updatedMeetings = [newMeeting, ...meetings];
    const updatedTasks = [...newTasks, ...tasks];

    setMeetings(updatedMeetings);
    setTasks(updatedTasks);

    storage.saveMeetings(updatedMeetings);
    storage.saveTasks(updatedTasks);

    // Notify all assigned owners from this meeting
    newTasks.forEach((t) => {
      if (t.ownerId) {
        triggerNotification(
          t.ownerId,
          'Deliverable assigned from new session',
          `"${t.description}" from ${newMeeting.title}.`,
          {
            taskId: t.id,
            meetingId: newMeeting.id,
            meetingTitle: newMeeting.title,
          }
        );
      }
    });

    setSelectedMeeting(newMeeting);
  };

  // Delete meeting
  const handleDeleteMeeting = (meetingId: string) => {
    const updatedMeetings = meetings.filter((m) => m.id !== meetingId);
    const updatedTasks = tasks.filter((t) => t.meetingId !== meetingId);

    setMeetings(updatedMeetings);
    setTasks(updatedTasks);

    storage.saveMeetings(updatedMeetings);
    storage.saveTasks(updatedTasks);
  };

  // Update whole meeting details
  const handleUpdateMeeting = (updatedMeeting: Meeting) => {
    const updated = meetings.map((m) => (m.id === updatedMeeting.id ? updatedMeeting : m));
    setMeetings(updated);
    storage.saveMeetings(updated);
    if (selectedMeeting?.id === updatedMeeting.id) {
      setSelectedMeeting(updatedMeeting);
    }
  };

  // Update existing task
  const handleUpdateTask = (updatedTask: Task) => {
    const updated = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    setTasks(updated);
    storage.saveTasks(updated);
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    storage.saveTasks(updated);
  };

  // Add single team member
  const handleAddTeamMember = (newMember: TeamMember) => {
    const updated = [...team, newMember];
    setTeam(updated);
    storage.saveTeam(updated);
  };

  // Update single team member
  const handleUpdateMember = (updatedMember: TeamMember) => {
    const updated = team.map((m) => (m.id === updatedMember.id ? updatedMember : m));
    setTeam(updated);
    storage.saveTeam(updated);
    if (activeUser.id === updatedMember.id) {
      setActiveUser(updatedMember);
      storage.setActiveUser(updatedMember);
    }
  };

  // Delete single team member
  const handleDeleteMember = (memberId: string) => {
    const updated = team.filter((m) => m.id !== memberId);
    setTeam(updated);
    storage.saveTeam(updated);
  };

  // Update workspace settings
  const handleUpdateSettings = (newSettings: WorkspaceSettings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  // Bulk update team
  const handleUpdateTeam = (newTeam: TeamMember[]) => {
    setTeam(newTeam);
    storage.saveTeam(newTeam);
  };

  // Reset to demo defaults
  const handleResetData = () => {
    if (confirm('Reset workspace database to initial seed dataset?')) {
      const reset = storage.resetDefaults();
      setMeetings(reset.meetings);
      setTasks(reset.tasks);
      setTeam(reset.team);
      setSettings(reset.settings);
      setActiveUser(reset.team[0]);
      setNotifications(reset.notifications);
      setAuthSession({ isAuthenticated: true, userEmail: reset.team[0].email });
    }
  };

  const openTaskCount = tasks.filter((t) => t.status !== 'done').length;

  // If user is not signed in, show Opening Page with Google sign in
  if (!authSession.isAuthenticated && team.length > 0) {
    return (
      <OpeningPage
        team={team}
        onSignIn={handleSignIn}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Bar with Navigation, Notification Bell & Persona switcher */}
      <TopNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewMeeting={() => setIsNewMeetingOpen(true)}
        onOpenDispatchBot={() => setIsDispatchBotOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onOpenAskCadence={() => setIsAskCadenceOpen(true)}
        onOpenWeeklyDigest={() => setIsWeeklyDigestOpen(true)}
        onOpenMyProfile={() => setIsMyProfileOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        openTaskCount={openTaskCount}
        activeUser={activeUser}
        allMembers={team}
        onSwitchUser={handleSwitchUser}
        notifications={notifications}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
        onSelectTaskFromNotification={(taskId) => {
          setCurrentTab('tasks');
        }}
        onSelectMeetingFromNotification={(mId) => {
          const m = meetings.find((item) => item.id === mId);
          if (m) setSelectedMeeting(m);
        }}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-8 py-6">
        {currentTab === 'meetings' && (
          <MeetingList
            meetings={meetings}
            tasks={tasks}
            team={team}
            activeUser={activeUser}
            onSelectMeeting={setSelectedMeeting}
            onOpenNewMeeting={() => setIsNewMeetingOpen(true)}
            searchQuery={searchQuery}
            onAskCadenceAboutMeeting={(meetingId) => {
              setAskCadenceMeetingId(meetingId);
              setIsAskCadenceOpen(true);
            }}
          />
        )}

        {currentTab === 'tasks' && (
          <TaskBoard
            tasks={tasks}
            team={team}
            activeUser={activeUser}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onUpdateTaskOwner={handleUpdateTaskOwner}
            onAddTaskComment={handleAddTaskComment}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onOpenMeeting={(mId) => {
              const m = meetings.find((item) => item.id === mId);
              if (m) setSelectedMeeting(m);
            }}
          />
        )}

        {currentTab === 'team' && (
          <TeamDirectory
            team={team}
            tasks={tasks}
            meetings={meetings}
            activeUser={activeUser}
            onAddTeamMember={handleAddTeamMember}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
            onFilterTasksByMember={(memberId) => {
              setCurrentTab('tasks');
            }}
            onOpenMeeting={(mId) => {
              const m = meetings.find((item) => item.id === mId);
              if (m) setSelectedMeeting(m);
            }}
            onSwitchUser={handleSwitchUser}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView meetings={meetings} tasks={tasks} team={team} />
        )}
      </main>

      {/* Modals */}
      {selectedMeeting && (
        <MeetingDetailModal
          meeting={selectedMeeting}
          tasks={tasks}
          team={team}
          activeUser={activeUser}
          onClose={() => setSelectedMeeting(null)}
          onUpdateMeeting={handleUpdateMeeting}
          onUpdateTaskStatus={handleUpdateTaskStatus}
          onUpdateTaskOwner={handleUpdateTaskOwner}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onAddTask={handleAddTask}
          onDeleteMeeting={handleDeleteMeeting}
          onAskCadenceAboutThisMeeting={(meetingId) => {
            setAskCadenceMeetingId(meetingId);
            setIsAskCadenceOpen(true);
          }}
        />
      )}

      {isNewMeetingOpen && (
        <NewMeetingModal
          team={team}
          onClose={() => setIsNewMeetingOpen(false)}
          onSaveMeeting={handleSaveNewMeeting}
        />
      )}

      {isDispatchBotOpen && (
        <DispatchBotModal
          team={team}
          onClose={() => setIsDispatchBotOpen(false)}
          onMeetingCaptured={handleSaveNewMeeting}
        />
      )}

      {isAdminPanelOpen && activeUser.isAdmin && (
        <AdminPanelModal
          settings={settings}
          team={team}
          onClose={() => setIsAdminPanelOpen(false)}
          onUpdateSettings={handleUpdateSettings}
          onUpdateTeam={handleUpdateTeam}
        />
      )}

      {isAskCadenceOpen && (
        <AskCadenceModal
          meetings={meetings}
          tasks={tasks}
          initialMeetingId={askCadenceMeetingId}
          onClose={() => {
            setIsAskCadenceOpen(false);
            setAskCadenceMeetingId(undefined);
          }}
          onOpenMeeting={(mId) => {
            const m = meetings.find((item) => item.id === mId);
            if (m) setSelectedMeeting(m);
          }}
        />
      )}

      {isWeeklyDigestOpen && (
        <WeeklyDigestModal
          meetings={meetings}
          tasks={tasks}
          team={team}
          onClose={() => setIsWeeklyDigestOpen(false)}
        />
      )}

      {/* Current User Individual Profile Dashboard */}
      {isMyProfileOpen && (
        <MemberProfileModal
          member={activeUser}
          allMembers={team}
          tasks={tasks}
          meetings={meetings}
          activeUser={activeUser}
          onClose={() => setIsMyProfileOpen(false)}
          onOpenMeeting={(mId) => {
            const m = meetings.find((item) => item.id === mId);
            if (m) setSelectedMeeting(m);
          }}
        />
      )}

      {/* Subtle, restrained footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 px-4 sm:px-8 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Cadence</span>
            <span aria-hidden="true">·</span>
            <span>Enterprise Hybrid Meeting Intelligence &amp; Task Governance</span>
            <span aria-hidden="true">·</span>
            <span className="text-[11px] font-mono text-slate-500">Press CMD+K to Ask Cadence</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSignOut}
              className="text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
              title="Return to Cadence home page"
            >
              <span>Log Out &amp; Return Home</span>
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleResetData}
              className="text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
