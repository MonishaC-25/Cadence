export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type PrivacyLevel = 'company' | 'department' | 'confidential';
export type MeetingModality = 'online' | 'in_person' | 'hybrid';
export type RoiRating = 'high' | 'moderate' | 'low';

export interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
}

export interface TaskAuditEntry {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
}

export interface TeamMember {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  department: string;
  roleTitle: string;
  avatarUrl?: string;
  hourlyRate?: number; // For ROI cost calculation
  isAdmin?: boolean;
  isActive?: boolean;
}

export interface Task {
  id: string;
  meetingId: string;
  meetingTitle: string;
  description: string;
  ownerId: string | null;
  ownerName: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string | null; // ISO YYYY-MM-DD
  deadlineDisplay: string | null;
  sourceQuote?: string;
  comments?: TaskComment[];
  auditLog?: TaskAuditEntry[];
  createdAt: string;
}

export interface KeyDecision {
  id: string;
  decision: string;
  impact: string;
  context?: string;
}

export interface Blocker {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  mitigation?: string;
}

export interface TranscriptSegment {
  speaker: string;
  timestamp: string;
  text: string;
}

export interface Meeting {
  id: string;
  title: string;
  agenda: string;
  hostId: string;
  hostName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMinutes: number;
  status: 'draft' | 'analyzed' | 'confirmed';
  privacyLevel: PrivacyLevel;
  modality: MeetingModality; // Hybrid, In-Person, or Online
  locationOrLink?: string; // Conference room name or Meet/Zoom link
  spokenLanguage?: string;
  detectedLanguage?: string;
  department?: string;
  attendeeIds: string[];
  transcriptText: string;
  diarizedSegments: TranscriptSegment[];
  executiveSummary: string[];
  keyDecisions: KeyDecision[];
  blockers: Blocker[];
  audioFileName?: string;
  audioDurationSeconds?: number;
  slackBroadcastSent?: boolean;
  meetingCostEstimate?: number;
  roiRating?: RoiRating;
  createdAt: string;
}

export interface MeetingAnalysisResult {
  detectedLanguage?: string;
  executiveSummary: string[];
  keyDecisions: KeyDecision[];
  actionItems: Array<{
    id: string;
    description: string;
    ownerId: string | null;
    ownerName: string | null;
    priority: TaskPriority;
    deadline: string | null;
    deadlineToDisplay: string | null;
    sourceQuote: string;
  }>;
  blockersAndRisks: Blocker[];
  diarizedSegments: TranscriptSegment[];
}

export interface AppNotification {
  id: string;
  recipientId: string; // TeamMember ID
  recipientEmail: string;
  title: string;
  message: string;
  taskId?: string;
  meetingId?: string;
  meetingTitle?: string;
  type: 'task_assigned' | 'task_updated' | 'meeting_scheduled' | 'mention';
  isRead: boolean;
  createdAt: string;
  emailSent?: boolean;
}

export interface WorkspaceSettings {
  companyName: string;
  audioRetentionDays: number;
  autoSlackBroadcast: boolean;
  slackWebhookUrl: string;
  slackChannel: string;
  teamsWebhookUrl: string;
  enforceSSO: boolean;
  allowGuestAccess: boolean;
  defaultHourlyRate?: number;
}
