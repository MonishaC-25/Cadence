import { TeamMember, Meeting, Task, RoiRating } from '../types';

export interface MeetingCostDetails {
  totalCost: number;
  durationHours: number;
  attendeeCount: number;
  avgHourlyRate: number;
  decisionsCount: number;
  tasksCount: number;
  roiRating: RoiRating;
  roiExplanation: string;
  costPerDecision: number;
}

const DEFAULT_BLENDED_HOURLY_RATE = 95; // Industry average tech engineering blended rate

export function calculateMeetingCost(
  meeting: Meeting,
  tasks: Task[],
  team: TeamMember[]
): MeetingCostDetails {
  const durationHours = (meeting.durationMinutes || 30) / 60;
  const attendees = team.filter((m) => meeting.attendeeIds.includes(m.id));
  const attendeeCount = Math.max(1, attendees.length || meeting.attendeeIds.length || 1);

  // Sum up hourly rates or default to blended rate
  let totalHourlySum = 0;
  if (attendees.length > 0) {
    totalHourlySum = attendees.reduce(
      (sum, m) => sum + (m.hourlyRate || DEFAULT_BLENDED_HOURLY_RATE),
      0
    );
  } else {
    totalHourlySum = attendeeCount * DEFAULT_BLENDED_HOURLY_RATE;
  }

  const avgHourlyRate = Math.round(totalHourlySum / attendeeCount);
  const totalCost = Math.round(totalHourlySum * durationHours);

  const decisionsCount = meeting.keyDecisions.length;
  const meetingTasks = tasks.filter((t) => t.meetingId === meeting.id);
  const tasksCount = meetingTasks.length;

  const totalOutput = decisionsCount + tasksCount;

  let roiRating: RoiRating = 'moderate';
  let roiExplanation = '';

  if (totalOutput >= 4 || (totalOutput >= 2 && totalCost < 200)) {
    roiRating = 'high';
    roiExplanation = `High Productivity: Produced ${totalOutput} concrete outcomes (${decisionsCount} decisions, ${tasksCount} tasks) for $${totalCost} investment.`;
  } else if (totalOutput >= 2) {
    roiRating = 'moderate';
    roiExplanation = `Balanced Return: Produced ${totalOutput} deliverables across ${attendeeCount} participants.`;
  } else {
    roiRating = 'low';
    roiExplanation = `Low Velocity Warning: High payroll expenditure ($${totalCost}) with only ${totalOutput} recorded decision/task. Consider shortening next sync or reducing attendee count.`;
  }

  const costPerDecision =
    decisionsCount > 0 ? Math.round(totalCost / decisionsCount) : totalCost;

  return {
    totalCost,
    durationHours,
    attendeeCount,
    avgHourlyRate,
    decisionsCount,
    tasksCount,
    roiRating,
    roiExplanation,
    costPerDecision,
  };
}
