import { Meeting, Task, TeamMember, WorkspaceSettings, AppNotification } from '../types';
import {
  INITIAL_MEETINGS,
  INITIAL_TASKS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_SETTINGS,
} from '../data/seedData';

const STORAGE_KEYS = {
  MEETINGS: 'cadence_meetings_v4',
  TASKS: 'cadence_tasks_v4',
  TEAM: 'cadence_team_v4',
  SETTINGS: 'cadence_settings_v4',
  ACTIVE_USER: 'cadence_active_user_v4',
  NOTIFICATIONS: 'cadence_notifications_v4',
  AUTH_SESSION: 'cadence_auth_session_v4',
};

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_01',
    recipientId: 'emp_01', // Camille
    recipientEmail: 'camille@company.com',
    title: 'New action item assigned',
    message: 'Coordinate failover test with DevOps (Aoi) and verify zero-downtime write replicas.',
    taskId: 'task_05',
    meetingId: 'meet_01',
    meetingTitle: 'Q3 Database Architecture & Performance Scaling',
    type: 'task_assigned',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    emailSent: true,
  },
  {
    id: 'notif_02',
    recipientId: 'emp_01', // Camille
    recipientEmail: 'camille@company.com',
    title: 'Weekly Monday Executive Digest ready',
    message: '7 action items due this sprint across Engineering and Design.',
    type: 'meeting_scheduled',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    emailSent: true,
  },
  {
    id: 'notif_03',
    recipientId: 'emp_02', // Min-Jun
    recipientEmail: 'minjun@company.com',
    title: 'New action item assigned',
    message: 'Audit top 10 slowest database queries in APM dashboard.',
    taskId: 'task_01',
    meetingId: 'meet_01',
    meetingTitle: 'Q3 Database Architecture & Performance Scaling',
    type: 'task_assigned',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    emailSent: true,
  },
  {
    id: 'notif_04',
    recipientId: 'emp_03', // Kenji
    recipientEmail: 'kenji@company.com',
    title: 'New action item assigned',
    message: 'Profile DOM repaint cost in data grid table component.',
    taskId: 'task_03',
    meetingId: 'meet_01',
    meetingTitle: 'Q3 Database Architecture & Performance Scaling',
    type: 'task_assigned',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    emailSent: true,
  },
];

export const storage = {
  getMeetings(): Meeting[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEETINGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(INITIAL_MEETINGS));
        return INITIAL_MEETINGS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load meetings from storage', e);
      return INITIAL_MEETINGS;
    }
  },

  saveMeetings(meetings: Meeting[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
    } catch (e) {
      console.error('Failed to save meetings to storage', e);
    }
  },

  getTasks(): Task[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
        return INITIAL_TASKS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load tasks from storage', e);
      return INITIAL_TASKS;
    }
  },

  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to storage', e);
    }
  },

  getTeam(): TeamMember[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEAM);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(INITIAL_TEAM_MEMBERS));
        return INITIAL_TEAM_MEMBERS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load team from storage', e);
      return INITIAL_TEAM_MEMBERS;
    }
  },

  saveTeam(team: TeamMember[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(team));
    } catch (e) {
      console.error('Failed to save team to storage', e);
    }
  },

  getSettings(): WorkspaceSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
        return INITIAL_SETTINGS;
      }
      return JSON.parse(data);
    } catch (e) {
      return INITIAL_SETTINGS;
    }
  },

  saveSettings(settings: WorkspaceSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to storage', e);
    }
  },

  getActiveUser(team: TeamMember[]): TeamMember {
    try {
      const savedId = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      if (savedId) {
        const found = team.find((m) => m.id === savedId);
        if (found) return found;
      }
    } catch (e) {}
    // Default to Lead Admin (Camille Laurent)
    return team[0] || INITIAL_TEAM_MEMBERS[0];
  },

  setActiveUser(user: TeamMember): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, user.id);
    } catch (e) {}
  },

  getNotifications(): AppNotification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
        return INITIAL_NOTIFICATIONS;
      }
      return JSON.parse(data);
    } catch (e) {
      return INITIAL_NOTIFICATIONS;
    }
  },

  saveNotifications(notifs: AppNotification[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    } catch (e) {}
  },

  getAuthSession(): { isAuthenticated: boolean; userEmail?: string } {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {}
    // If not explicitly saved, default to authenticated so existing workflow works, or check opening page
    return { isAuthenticated: false };
  },

  setAuthSession(session: { isAuthenticated: boolean; userEmail?: string }): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    } catch (e) {}
  },

  resetDefaults(): {
    meetings: Meeting[];
    tasks: Task[];
    team: TeamMember[];
    settings: WorkspaceSettings;
    notifications: AppNotification[];
  } {
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(INITIAL_MEETINGS));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
    localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(INITIAL_TEAM_MEMBERS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, INITIAL_TEAM_MEMBERS[0].id);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify({ isAuthenticated: true, userEmail: INITIAL_TEAM_MEMBERS[0].email }));
    return {
      meetings: INITIAL_MEETINGS,
      tasks: INITIAL_TASKS,
      team: INITIAL_TEAM_MEMBERS,
      settings: INITIAL_SETTINGS,
      notifications: INITIAL_NOTIFICATIONS,
    };
  },
};
