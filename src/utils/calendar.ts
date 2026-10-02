import { Meeting, Task } from '../types';

export function downloadMeetingIcs(meeting: Meeting) {
  // Format start time
  const [year, month, day] = meeting.date.split('-').map(Number);
  const [hours, minutes] = meeting.time ? meeting.time.split(':').map(Number) : [10, 0];

  const startDate = new Date(year, month - 1, day, hours, minutes);
  const endDate = new Date(startDate.getTime() + (meeting.durationMinutes || 30) * 60000);

  const formatIcsDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cadence//Meeting Intelligence//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:cadence-meet-${meeting.id}@cadence.app`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(startDate)}`,
    `DTEND:${formatIcsDate(endDate)}`,
    `SUMMARY:${meeting.title}`,
    `DESCRIPTION:${meeting.agenda}\\n\\nHost: ${meeting.hostName}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${meeting.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadTaskIcs(task: Task) {
  if (!task.deadline) return;

  const [year, month, day] = task.deadline.split('-').map(Number);
  const startDate = new Date(year, month - 1, day, 9, 0);
  const endDate = new Date(startDate.getTime() + 60 * 60000);

  const formatIcsDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cadence//Task Reminder//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:cadence-task-${task.id}@cadence.app`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(startDate)}`,
    `DTEND:${formatIcsDate(endDate)}`,
    `SUMMARY:Due: ${task.description}`,
    `DESCRIPTION:Task from meeting "${task.meetingTitle}"\\nAssignee: ${task.ownerName || 'Unassigned'}\\nPriority: ${task.priority.toUpperCase()}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `task_${task.description.slice(0, 25).toLowerCase().replace(/[^a-z0-9]/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}
