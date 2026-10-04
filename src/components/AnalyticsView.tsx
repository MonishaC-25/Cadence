import React from 'react';
import { Meeting, Task, TeamMember } from '../types';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  Award,
  Users,
  Layers,
  DollarSign,
  Radio,
  Building,
  Globe,
  Sparkles,
} from 'lucide-react';
import { calculateMeetingCost } from '../utils/costCalculator';

interface AnalyticsViewProps {
  meetings: Meeting[];
  tasks: Task[];
  team: TeamMember[];
  activeUser: TeamMember;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  meetings,
  tasks,
  team,
  activeUser,
}) => {
  const completedTasks = tasks.filter((t) => t.status === 'done');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'done' && t.deadline && t.deadline < todayStr
  );

  const completionRate =
    tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const totalMeetingMinutes = meetings.reduce((acc, m) => acc + (m.durationMinutes || 30), 0);
  const totalMeetingHours = (totalMeetingMinutes / 60).toFixed(1);

  const totalDecisions = meetings.reduce((acc, m) => acc + m.keyDecisions.length, 0);

  // Calculate meeting payroll costs across all meetings
  const allMeetingCosts = meetings.map((m) => calculateMeetingCost(m, tasks, team));
  const totalPayrollInvestment = allMeetingCosts.reduce((acc, c) => acc + c.totalCost, 0);
  const avgCostPerMeeting =
    meetings.length > 0 ? Math.round(totalPayrollInvestment / meetings.length) : 0;

  const highRoiCount = allMeetingCosts.filter((c) => c.roiRating === 'high').length;
  const moderateRoiCount = allMeetingCosts.filter((c) => c.roiRating === 'moderate').length;
  const lowRoiCount = allMeetingCosts.filter((c) => c.roiRating === 'low').length;

  // Modality stats
  const hybridCount = meetings.filter((m) => m.modality === 'hybrid').length;
  const onlineCount = meetings.filter((m) => m.modality === 'online' || !m.modality).length;
  const inPersonCount = meetings.filter((m) => m.modality === 'in_person').length;

  // Potential savings if meetings are trimmed by 15 mins
  const estimatedSavings = Math.round(
    allMeetingCosts.reduce((acc, c) => acc + (c.avgHourlyRate * c.attendeeCount * 0.25), 0)
  );

  // Group tasks by priority
  const priorityBreakdown = {
    urgent: tasks.filter((t) => t.priority === 'urgent').length,
    high: tasks.filter((t) => t.priority === 'high').length,
    medium: tasks.filter((t) => t.priority === 'medium').length,
    low: tasks.filter((t) => t.priority === 'low').length,
  };

  // Group tasks by team member
  const memberPerformance = team.map((member) => {
    const memberTasks = tasks.filter((t) => t.ownerId === member.id);
    const completed = memberTasks.filter((t) => t.status === 'done').length;
    const rate = memberTasks.length > 0 ? Math.round((completed / memberTasks.length) * 100) : 0;
    return {
      member,
      total: memberTasks.length,
      completed,
      rate,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Executive Velocity &amp; Meeting ROI
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Corporate execution velocity, payroll expenditure analysis, and hybrid meeting distribution.
        </p>
      </div>

      {/* Top Stat Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            Execution Velocity
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono mt-1 tabular-nums">
            {completionRate}%
          </p>
          <span className="text-[11px] text-slate-500 font-mono mt-0.5 block tabular-nums">
            {completedTasks.length} of {tasks.length} resolved
          </span>
        </div>

        {/* Stat 2: Admin sees Payroll Invested, Employee sees Total Collaboration Hours */}
        {activeUser.isAdmin ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Payroll Invested
              </span>
              <span className="text-[9px] font-mono uppercase bg-emerald-950 px-1 py-0.2 rounded text-emerald-400 border border-emerald-500/20">
                Admin
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white font-mono mt-1 tabular-nums">
              ${totalPayrollInvestment}
            </p>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5 block tabular-nums">
              Avg ${avgCostPerMeeting} per meeting
            </span>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              Total Meeting Time
            </span>
            <p className="text-2xl sm:text-3xl font-bold text-white font-mono mt-1 tabular-nums">
              {totalMeetingHours}h
            </p>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5 block tabular-nums">
              Across {meetings.length} company sessions
            </span>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            Decisions Sealed
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-sky-400 font-mono mt-1 tabular-nums">
            {totalDecisions}
          </p>
          <span className="text-[11px] text-slate-500 font-mono mt-0.5 block tabular-nums">
            {(totalDecisions / Math.max(1, meetings.length)).toFixed(1)} decisions/meeting
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            Overdue Flagged
          </span>
          <p
            className={`text-2xl sm:text-3xl font-bold font-mono mt-1 tabular-nums ${
              overdueTasks.length > 0 ? 'text-rose-400' : 'text-slate-400'
            }`}
          >
            {overdueTasks.length}
          </p>
          <span className="text-[11px] text-slate-500 font-mono mt-0.5 block tabular-nums">
            Target deadlines breached
          </span>
        </div>
      </div>

      {/* Financial ROI & Modality Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ROI Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Meeting ROI Health
            </h3>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-emerald-400 font-medium">High ROI Yield</span>
              <span className="font-mono text-slate-200">{highRoiCount} meetings</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-sky-400 font-medium">Moderate Balance</span>
              <span className="font-mono text-slate-200">{moderateRoiCount} meetings</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-amber-400 font-medium">Low Return Warning</span>
              <span className="font-mono text-slate-200">{lowRoiCount} meetings</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-800">
            {Math.round(((highRoiCount + moderateRoiCount) / Math.max(1, meetings.length)) * 100)}% of corporate meetings produced verified business outcomes.
          </p>
        </div>

        {/* Hybrid vs Remote Setup */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Workspace Modality
            </h3>
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Radio className="w-3 h-3" />
                <span>Hybrid (Room + Remote)</span>
              </span>
              <span className="font-mono text-slate-200">{hybridCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1.5 text-sky-400">
                <Globe className="w-3 h-3" />
                <span>Fully Remote (Meet/Zoom)</span>
              </span>
              <span className="font-mono text-slate-200">{onlineCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Building className="w-3 h-3" />
                <span>In-Person Boardroom</span>
              </span>
              <span className="font-mono text-slate-200">{inPersonCount}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-800">
            Cadence AI captures audio equally across conference phones and webcams.
          </p>
        </div>

        {/* Cost Optimization Recommendation */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Optimization Recommendation</span>
          </div>
          {activeUser.isAdmin ? (
            <p className="text-xs text-slate-200 leading-relaxed">
              Shortening standard syncs by <strong>15 minutes</strong> across the organization could save approximately{' '}
              <strong className="text-emerald-400 font-mono">${estimatedSavings}</strong> in engineering payroll weekly.
            </p>
          ) : (
            <p className="text-xs text-slate-200 leading-relaxed">
              Limiting updates to <strong>15 minutes</strong> keeps focus sharp, protects deep work hours, and accelerates team delivery.
            </p>
          )}
          <div className="pt-1">
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/20">
              Recommended: 30-min standard caps
            </span>
          </div>
        </div>
      </div>

      {/* Two column metrics breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">
            Deliverable Priority Distribution
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Urgent Priority', count: priorityBreakdown.urgent, color: 'bg-rose-500', text: 'text-rose-400' },
              { label: 'High Priority', count: priorityBreakdown.high, color: 'bg-amber-500', text: 'text-amber-400' },
              { label: 'Medium Priority', count: priorityBreakdown.medium, color: 'bg-sky-500', text: 'text-sky-400' },
              { label: 'Low Priority', count: priorityBreakdown.low, color: 'bg-slate-500', text: 'text-slate-400' },
            ].map((p, idx) => {
              const pct = tasks.length > 0 ? Math.round((p.count / tasks.length) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${p.text}`}>{p.label}</span>
                    <span className="font-mono text-slate-400 tabular-nums">
                      {p.count} tasks ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div className={`h-full ${p.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Task Completion Velocity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">
            Team Member Execution Velocity
          </h3>
          <div className="space-y-3">
            {memberPerformance.map((item) => (
              <div key={item.member.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-200">{item.member.name}</span>
                    <span className="text-[11px] text-slate-500">({item.member.department})</span>
                  </div>
                  <span className="font-mono text-emerald-400 tabular-nums">
                    {item.completed}/{item.total} completed ({item.rate}%)
                  </span>
                </div>
                <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400"
                    style={{ width: `${item.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
