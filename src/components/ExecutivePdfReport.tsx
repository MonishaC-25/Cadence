import React from 'react';
import { Meeting, Task, TeamMember } from '../types';
import { calculateMeetingCost } from '../utils/costCalculator';
import { X, Printer, Download } from 'lucide-react';

interface ExecutivePdfReportProps {
  meeting: Meeting;
  tasks: Task[];
  team: TeamMember[];
  companyName: string;
  onClose: () => void;
}

export const ExecutivePdfReport: React.FC<ExecutivePdfReportProps> = ({
  meeting,
  tasks,
  team,
  companyName,
  onClose,
}) => {
  const meetingTasks = tasks.filter((t) => t.meetingId === meeting.id);
  const attendees = team.filter((m) => meeting.attendeeIds.includes(m.id));
  const costDetails = calculateMeetingCost(meeting, tasks, team);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl my-auto max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Controls (Hidden when printed) */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white">Executive Formal PDF Report</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/20">
              Print / Save as PDF
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print or Save to PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="p-8 sm:p-12 flex-1 overflow-y-auto bg-white text-slate-900 font-sans print:p-0 print:m-0 print:overflow-visible">
          {/* Company Letterhead */}
          <div className="border-b-2 border-slate-900 pb-6 mb-6 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-xs">
                  Cd
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  {companyName || 'Acme Technologies'}
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
                Official Executive Minutes of Meeting (MoM)
              </p>
            </div>
            <div className="text-right text-xs text-slate-600 font-mono">
              <p>Reference: {meeting.id.toUpperCase()}</p>
              <p>Date: {meeting.date}</p>
              <p>Time: {meeting.time || '10:00'}</p>
            </div>
          </div>

          {/* Meeting Title & Modality Header */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase font-bold bg-slate-100 text-slate-800 border border-slate-300 rounded">
                Modality: {meeting.modality.toUpperCase()}
              </span>
              {meeting.locationOrLink && (
                <span className="text-xs text-slate-600 font-mono">
                  Location: {meeting.locationOrLink}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-950 leading-tight">
              {meeting.title}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              Agenda: {meeting.agenda}
            </p>
          </div>

          {/* Payroll Cost & ROI Rating Box */}
          <div className="mb-6 p-4 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-4 gap-4 text-center">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                Estimated Meeting Cost
              </span>
              <span className="text-base font-bold font-mono text-slate-900">
                ${costDetails.totalCost}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                Duration &amp; Attendance
              </span>
              <span className="text-base font-bold font-mono text-slate-900">
                {meeting.durationMinutes}m · {attendees.length} people
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                Deliverables Yield
              </span>
              <span className="text-base font-bold font-mono text-slate-900">
                {costDetails.decisionsCount + costDetails.tasksCount} outcomes
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                ROI Productivity
              </span>
              <span className="text-base font-bold uppercase text-emerald-700">
                {costDetails.roiRating} ROI
              </span>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="mb-6 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              1. Executive Summary &amp; Key Takeaways
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-700 leading-relaxed">
              {meeting.executiveSummary.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-bold text-slate-900">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 2: Key Decisions Approved */}
          <div className="mb-6 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              2. Key Decisions Ratified
            </h3>
            <div className="space-y-2 text-xs">
              {meeting.keyDecisions.map((d) => (
                <div key={d.id} className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <p className="font-bold text-slate-900">{d.decision}</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    <strong>Impact:</strong> {d.impact}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Action Items */}
          <div className="mb-6 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              3. Action Items &amp; Assigned Deliverables
            </h3>
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-300">
                <tr>
                  <th className="p-2">Deliverable</th>
                  <th className="p-2">Owner</th>
                  <th className="p-2">Priority</th>
                  <th className="p-2">Target Deadline</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {meetingTasks.map((t) => (
                  <tr key={t.id}>
                    <td className="p-2 font-medium">{t.description}</td>
                    <td className="p-2">{t.ownerName || 'Unassigned'}</td>
                    <td className="p-2 uppercase font-mono text-[10px]">{t.priority}</td>
                    <td className="p-2 font-mono">{t.deadlineDisplay || t.deadline || 'TBD'}</td>
                    <td className="p-2 capitalize">{t.status.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 4: Attendees */}
          <div className="mb-6 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              4. Certified Attendees
            </h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {attendees.map((a) => (
                <span
                  key={a.id}
                  className="px-2.5 py-1 bg-slate-100 rounded border border-slate-200 text-slate-800"
                >
                  {a.name} ({a.roleTitle} · {a.department})
                </span>
              ))}
            </div>
          </div>

          {/* Signoff Footer */}
          <div className="border-t border-slate-300 pt-6 mt-8 flex justify-between text-[11px] text-slate-500 font-mono">
            <span>Prepared automatically by Cadence Meeting Intelligence System</span>
            <span>Host Signature: __________________________</span>
          </div>
        </div>
      </div>
    </div>
  );
};
