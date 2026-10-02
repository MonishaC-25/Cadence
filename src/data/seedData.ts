import { TeamMember, Meeting, Task, WorkspaceSettings } from '../types';
import camilleAvatar from '../assets/images/avatar_french_camille_1790919115096.jpg';
import minjunAvatar from '../assets/images/avatar_korean_minjun_1790919132641.jpg';
import kenjiAvatar from '../assets/images/avatar_japanese_kenji_1790919145219.jpg';
import lucasAvatar from '../assets/images/avatar_french_lucas_1790919171277.jpg';
import jiwooAvatar from '../assets/images/avatar_korean_jiwoo_1790919160307.jpg';
import aoiAvatar from '../assets/images/avatar_japanese_aoi_1790919187177.jpg';
import antoineAvatar from '../assets/images/avatar_french_antoine_1790919201561.jpg';
import seoyeonAvatar from '../assets/images/avatar_korean_seoyeon_1790919213800.jpg';

export const INITIAL_SETTINGS: WorkspaceSettings = {
  companyName: 'Acme Technologies',
  audioRetentionDays: 60,
  autoSlackBroadcast: true,
  slackWebhookUrl: 'https://hooks.slack.com/services/T00/B00/CadenceSync',
  slackChannel: '#engineering-sync',
  teamsWebhookUrl: 'https://outlook.office.com/webhook/cadence',
  enforceSSO: true,
  allowGuestAccess: false,
};

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'emp_01',
    employeeCode: 'EMP-001',
    name: 'Camille Laurent', // France
    email: 'camille@company.com',
    department: 'Engineering',
    roleTitle: 'VP of Engineering & Tech Lead',
    avatarUrl: camilleAvatar,
    hourlyRate: 130,
    isAdmin: true,
    isActive: true,
  },
  {
    id: 'emp_02',
    employeeCode: 'EMP-002',
    name: 'Min-Jun Park', // Korea
    email: 'minjun@company.com',
    department: 'Engineering',
    roleTitle: 'Senior Backend Architect',
    avatarUrl: minjunAvatar,
    hourlyRate: 105,
    isAdmin: false,
    isActive: true,
  },
  {
    id: 'emp_03',
    employeeCode: 'EMP-003',
    name: 'Kenji Takahashi', // Japan
    email: 'kenji@company.com',
    department: 'Engineering',
    roleTitle: 'Staff Frontend Engineer',
    avatarUrl: kenjiAvatar,
    hourlyRate: 100,
    isAdmin: false,
    isActive: true,
  },
  {
    id: 'emp_04',
    employeeCode: 'EMP-004',
    name: 'Lucas Dubois', // France
    email: 'lucas@company.com',
    department: 'Product',
    roleTitle: 'Principal Product Manager',
    avatarUrl: lucasAvatar,
    hourlyRate: 110,
    isAdmin: false,
    isActive: true,
  },
  {
    id: 'emp_05',
    employeeCode: 'EMP-005',
    name: 'Ji-Woo Kim', // Korea
    email: 'jiwoo@company.com',
    department: 'Design',
    roleTitle: 'Lead Product Designer',
    avatarUrl: jiwooAvatar,
    hourlyRate: 95,
    isAdmin: false,
    isActive: true,
  },
  {
    id: 'emp_06',
    employeeCode: 'EMP-006',
    name: 'Aoi Sato', // Japan
    email: 'aoi@company.com',
    department: 'Engineering',
    roleTitle: 'DevOps & SRE Specialist',
    avatarUrl: aoiAvatar,
    hourlyRate: 105,
    isAdmin: false,
    isActive: true,
  },
  {
    id: 'emp_07',
    employeeCode: 'EMP-007',
    name: 'Antoine Moreau', // France
    email: 'antoine@company.com',
    department: 'Operations',
    roleTitle: 'Head of Business Strategy',
    avatarUrl: antoineAvatar,
    hourlyRate: 115,
    isAdmin: false,
    isActive: true,
  },
  {
    id: 'emp_08',
    employeeCode: 'EMP-008',
    name: 'Seo-Yeon Choi', // Korea
    email: 'seoyeon@company.com',
    department: 'Sales',
    roleTitle: 'Enterprise Solutions Director',
    avatarUrl: seoyeonAvatar,
    hourlyRate: 100,
    isAdmin: false,
    isActive: true,
  },
];

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'meet_01',
    title: 'Q3 Database Architecture & Performance Scaling',
    agenda: 'Review query bottleneck mitigation, index restructuring, and Redis caching migration plan for client telemetry.',
    hostId: 'emp_01',
    hostName: 'Camille Laurent',
    date: '2026-09-28',
    time: '14:00',
    durationMinutes: 42,
    status: 'confirmed',
    privacyLevel: 'department',
    modality: 'hybrid',
    locationOrLink: 'Boardroom Alpha + Google Meet',
    department: 'Engineering',
    attendeeIds: ['emp_01', 'emp_02', 'emp_03', 'emp_04'],
    audioFileName: 'architecture_scaling_sync_rec.mp3',
    audioDurationSeconds: 2520,
    transcriptText: `Camille: Welcome everyone. Today we need to resolve the database bottleneck issues on our core telemetry API before Friday's traffic surge.
Min-Jun: I benchmarked the slow query log yesterday. The audit log joins are degrading p99 response times to 820ms. We should add composite indexes on organization_id and created_at.
Kenji: From the frontend side, the dashboard stalls when fetching 90-day time-series data. Can we paginate or pre-aggregate telemetry summaries on the server?
Lucas: Customers in the enterprise tier requested custom retention periods. We must make sure whatever caching strategy we pick respects tenant privacy policies.
Min-Jun: I will write the composite migration script and test it on staging by Thursday EOD.
Kenji: I can implement virtualized table scrolling and lightweight chart decimation on the frontend by Friday.
Camille: Excellent. Let's make sure Min-Jun runs the benchmark comparison before Friday noon so we have hard metrics for the executive review.`,
    diarizedSegments: [
      {
        speaker: 'Camille Laurent',
        timestamp: '00:00',
        text: 'Welcome everyone. Today we need to resolve the database bottleneck issues on our core telemetry API before Friday\'s traffic surge.',
      },
      {
        speaker: 'Min-Jun Park',
        timestamp: '00:45',
        text: 'I benchmarked the slow query log yesterday. The audit log joins are degrading p99 response times to 820ms. We should add composite indexes on organization_id and created_at.',
      },
      {
        speaker: 'Kenji Takahashi',
        timestamp: '02:10',
        text: 'From the frontend side, the dashboard stalls when fetching 90-day time-series data. Can we paginate or pre-aggregate telemetry summaries on the server?',
      },
      {
        speaker: 'Lucas Dubois',
        timestamp: '03:40',
        text: 'Customers in the enterprise tier requested custom retention periods. We must make sure whatever caching strategy we pick respects tenant privacy policies.',
      },
      {
        speaker: 'Min-Jun Park',
        timestamp: '05:15',
        text: 'I will write the composite migration script and test it on staging by Thursday EOD.',
      },
      {
        speaker: 'Kenji Takahashi',
        timestamp: '06:30',
        text: 'I can implement virtualized table scrolling and lightweight chart decimation on the frontend by Friday.',
      },
      {
        speaker: 'Camille Laurent',
        timestamp: '07:20',
        text: 'Excellent. Let\'s make sure Min-Jun runs the benchmark comparison before Friday noon so we have hard metrics for the executive review.',
      },
    ],
    executiveSummary: [
      'Identified critical telemetry API p99 latency degradation (820ms) rooted in unindexed audit log joins.',
      'Approved immediate deployment of composite database indexes on staging environment.',
      'Committed to frontend virtualized table scrolling and telemetry data decimation to reduce client memory load.',
      'Full performance benchmark sign-off scheduled prior to Friday release cutoff.',
    ],
    keyDecisions: [
      {
        id: 'dec_101',
        decision: 'Implement composite index on (organization_id, created_at) across audit logs',
        impact: 'Projects p99 query latency drop from 820ms to under 65ms',
        context: 'Staging verification required before production migration',
      },
      {
        id: 'dec_102',
        decision: 'Frontend client-side time-series decimation for intervals exceeding 30 days',
        impact: 'Cuts payload size by 74% without losing critical peak telemetry trends',
      },
    ],
    blockers: [
      {
        id: 'blk_101',
        title: 'Staging migration requires 15-minute maintenance window',
        severity: 'medium',
        mitigation: 'Schedule maintenance run at 02:00 UTC with automated rollback backup',
      },
    ],
    createdAt: '2026-09-28T14:45:00Z',
  },
  {
    id: 'meet_02',
    title: 'Sprint 24 Planning: Customer Onboarding Portal',
    agenda: 'Scope onboarding redesign, team workspace invitation flows, and review UX prototypes with Ji-Woo.',
    hostId: 'emp_04',
    hostName: 'Lucas Dubois',
    date: '2026-09-29',
    time: '11:00',
    durationMinutes: 35,
    status: 'confirmed',
    privacyLevel: 'company',
    modality: 'online',
    locationOrLink: 'https://meet.google.com/sprint-24-plan',
    attendeeIds: ['emp_04', 'emp_03', 'emp_05', 'emp_02'],
    transcriptText: `Lucas: Thanks for jumping on. The main objective for Sprint 24 is reducing onboarding friction from 7 steps to 3. Ji-Woo, can you walk us through the revised Figma layout?
Ji-Woo: Sure. We simplified the invitation step into a bulk comma-separated email input. Also, we removed the mandatory billing prompt during initial signup.
Kenji: I reviewed the new modal animations. They look crisp. I will build the reusable invite-token flow component by Wednesday next week.
Ji-Woo: I will finalize the responsive mobile drawer views and upload finalized design tokens to the repo by tomorrow.
Min-Jun: On the backend, we need an idempotency check on workspace invite tokens so people clicking an invite link twice don't create duplicate seats. I'll implement that before Friday.`,
    diarizedSegments: [
      {
        speaker: 'Lucas Dubois',
        timestamp: '00:00',
        text: 'Thanks for jumping on. The main objective for Sprint 24 is reducing onboarding friction from 7 steps to 3. Ji-Woo, can you walk us through the revised Figma layout?',
      },
      {
        speaker: 'Ji-Woo Kim',
        timestamp: '01:10',
        text: 'Sure. We simplified the invitation step into a bulk comma-separated email input. Also, we removed the mandatory billing prompt during initial signup.',
      },
      {
        speaker: 'Kenji Takahashi',
        timestamp: '02:50',
        text: 'I reviewed the new modal animations. They look crisp. I will build the reusable invite-token flow component by Wednesday next week.',
      },
      {
        speaker: 'Ji-Woo Kim',
        timestamp: '04:15',
        text: 'I will finalize the responsive mobile drawer views and upload finalized design tokens to the repo by tomorrow.',
      },
      {
        speaker: 'Min-Jun Park',
        timestamp: '05:30',
        text: 'On the backend, we need an idempotency check on workspace invite tokens so people clicking an invite link twice don\'t create duplicate seats. I\'ll implement that before Friday.',
      },
    ],
    executiveSummary: [
      'Streamlined onboarding process from 7 steps down to 3, deferring payment entry until team activation.',
      'Added bulk workspace invite capability with idempotency guards on token claims.',
      'Established design token handoff deadline for tomorrow and frontend component release for Wednesday next week.',
    ],
    keyDecisions: [
      {
        id: 'dec_201',
        decision: 'Remove mandatory credit card entry from initial workspace setup',
        impact: 'Expected to lift registration completion conversion by +22%',
      },
      {
        id: 'dec_202',
        decision: 'Standardize invite link expiry to 7 calendar days',
        impact: 'Enhances workspace security and minimizes stale registration sessions',
      },
    ],
    blockers: [],
    createdAt: '2026-09-29T11:40:00Z',
  },
  {
    id: 'meet_03',
    title: 'Q3 Executive Promotion & Compensation Review',
    agenda: 'Confidential executive meeting reviewing annual engineering compensation banding, promotion evaluations, and equity vesting.',
    hostId: 'emp_01',
    hostName: 'Camille Laurent',
    date: '2026-09-30',
    time: '15:30',
    durationMinutes: 30,
    status: 'confirmed',
    privacyLevel: 'confidential',
    modality: 'in_person',
    locationOrLink: 'Executive Suite 501',
    attendeeIds: ['emp_01', 'emp_02'],
    transcriptText: `Camille: Min-Jun, thank you for joining this 1-on-1 performance calibration. We reviewed your technical leadership across our Q3 database re-architecture.
Min-Jun: Thank you Camille. The team made huge strides on indexing and latency metrics.
Camille: The leadership committee approved your promotion to Senior Staff Backend Architect, effective October 1st. I will finalize the paperwork with HR by Friday.
Min-Jun: That is incredible news! I will put together the Q4 system architecture vision document before next week.`,
    diarizedSegments: [
      {
        speaker: 'Camille Laurent',
        timestamp: '00:00',
        text: 'Min-Jun, thank you for joining this 1-on-1 performance calibration. We reviewed your technical leadership across our Q3 database re-architecture.',
      },
      {
        speaker: 'Min-Jun Park',
        timestamp: '01:20',
        text: 'Thank you Camille. The team made huge strides on indexing and latency metrics.',
      },
      {
        speaker: 'Camille Laurent',
        timestamp: '02:45',
        text: 'The leadership committee approved your promotion to Senior Staff Backend Architect, effective October 1st. I will finalize the paperwork with HR by Friday.',
      },
      {
        speaker: 'Min-Jun Park',
        timestamp: '04:10',
        text: 'That is incredible news! I will put together the Q4 system architecture vision document before next week.',
      },
    ],
    executiveSummary: [
      'Approved senior staff promotion and compensation band calibration for technical lead.',
      'Sign-off on HR equity vesting schedule adjustments.',
      'Next step: Q4 architecture vision document delivery.',
    ],
    keyDecisions: [
      {
        id: 'dec_301',
        decision: 'Promotion to Senior Staff Backend Architect ratified',
        impact: 'Formalizes technical leadership role over platform infrastructure',
      },
    ],
    blockers: [],
    createdAt: '2026-09-30T15:30:00Z',
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task_01',
    meetingId: 'meet_01',
    meetingTitle: 'Q3 Database Architecture & Performance Scaling',
    description: 'Write composite index migration script and execute benchmark on staging',
    ownerId: 'emp_02',
    ownerName: 'Min-Jun Park',
    priority: 'urgent',
    status: 'in_progress',
    deadline: '2026-10-02',
    deadlineDisplay: 'By Thursday EOD',
    sourceQuote: 'Min-Jun: I will write the composite migration script and test it on staging by Thursday EOD.',
    comments: [
      {
        id: 'c1',
        authorId: 'emp_02',
        authorName: 'Min-Jun Park',
        text: 'Migration script draft completed. Running initial dry run on read-replica.',
        createdAt: '2026-09-29T10:15:00Z',
      },
    ],
    auditLog: [
      {
        id: 'a1',
        action: 'Task extracted from transcript and assigned to Min-Jun Park',
        performedBy: 'Cadence AI',
        timestamp: '2026-09-28T14:45:00Z',
      },
      {
        id: 'a2',
        action: 'Status changed from Pending to In Progress',
        performedBy: 'Min-Jun Park',
        timestamp: '2026-09-29T09:00:00Z',
      },
    ],
    createdAt: '2026-09-28T14:45:00Z',
  },
  {
    id: 'task_02',
    meetingId: 'meet_01',
    meetingTitle: 'Q3 Database Architecture & Performance Scaling',
    description: 'Implement virtualized table scrolling and chart decimation on telemetry dashboard',
    ownerId: 'emp_03',
    ownerName: 'Kenji Takahashi',
    priority: 'high',
    status: 'pending',
    deadline: '2026-10-03',
    deadlineDisplay: 'By Friday',
    sourceQuote: 'Kenji: I can implement virtualized table scrolling and lightweight chart decimation on the frontend by Friday.',
    comments: [],
    auditLog: [
      {
        id: 'a3',
        action: 'Task created and assigned to Kenji Takahashi',
        performedBy: 'Cadence AI',
        timestamp: '2026-09-28T14:45:00Z',
      },
    ],
    createdAt: '2026-09-28T14:45:00Z',
  },
  {
    id: 'task_03',
    meetingId: 'meet_01',
    meetingTitle: 'Q3 Database Architecture & Performance Scaling',
    description: 'Review staging benchmark metrics and sign off on production maintenance window',
    ownerId: 'emp_01',
    ownerName: 'Camille Laurent',
    priority: 'high',
    status: 'pending',
    deadline: '2026-10-03',
    deadlineDisplay: 'Friday noon',
    sourceQuote: 'Camille: Let\'s make sure Min-Jun runs the benchmark comparison before Friday noon so we have hard metrics for the executive review.',
    comments: [],
    auditLog: [
      {
        id: 'a4',
        action: 'Task created and assigned to Camille Laurent',
        performedBy: 'Cadence AI',
        timestamp: '2026-09-28T14:45:00Z',
      },
    ],
    createdAt: '2026-09-28T14:45:00Z',
  },
  {
    id: 'task_04',
    meetingId: 'meet_02',
    meetingTitle: 'Sprint 24 Planning: Customer Onboarding Portal',
    description: 'Upload finalized responsive onboarding design tokens and mobile drawer specs',
    ownerId: 'emp_05',
    ownerName: 'Ji-Woo Kim',
    priority: 'medium',
    status: 'done',
    deadline: '2026-10-01',
    deadlineDisplay: 'Tomorrow EOD',
    sourceQuote: 'Ji-Woo: I will finalize the responsive mobile drawer views and upload finalized design tokens to the repo by tomorrow.',
    comments: [
      {
        id: 'c2',
        authorId: 'emp_05',
        authorName: 'Ji-Woo Kim',
        text: 'Tokens uploaded and verified in Figma plugin!',
        createdAt: '2026-09-30T09:30:00Z',
      },
    ],
    auditLog: [
      {
        id: 'a5',
        action: 'Status changed from In Progress to Done',
        performedBy: 'Ji-Woo Kim',
        timestamp: '2026-09-30T09:31:00Z',
      },
    ],
    createdAt: '2026-09-29T11:40:00Z',
  },
  {
    id: 'task_05',
    meetingId: 'meet_02',
    meetingTitle: 'Sprint 24 Planning: Customer Onboarding Portal',
    description: 'Implement backend idempotency and seat validation for workspace invite tokens',
    ownerId: 'emp_02',
    ownerName: 'Min-Jun Park',
    priority: 'high',
    status: 'in_progress',
    deadline: '2026-10-03',
    deadlineDisplay: 'By Friday',
    sourceQuote: 'Min-Jun: On the backend, we need an idempotency check on workspace invite tokens... I\'ll implement that before Friday.',
    comments: [],
    auditLog: [],
    createdAt: '2026-09-29T11:40:00Z',
  },
  {
    id: 'task_06',
    meetingId: 'meet_02',
    meetingTitle: 'Sprint 24 Planning: Customer Onboarding Portal',
    description: 'Build reusable token claim flow component for new workspace members',
    ownerId: 'emp_03',
    ownerName: 'Kenji Takahashi',
    priority: 'medium',
    status: 'pending',
    deadline: '2026-10-07',
    deadlineDisplay: 'Wednesday next week',
    sourceQuote: 'Kenji: I will build the reusable invite-token flow component by Wednesday next week.',
    comments: [],
    auditLog: [],
    createdAt: '2026-09-29T11:40:00Z',
  },
];
