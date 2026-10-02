import React from 'react';
import { Task, TeamMember } from '../types';
import { Clock, User, AlertCircle, ArrowUpRight } from 'lucide-react';

interface EisenhowerMatrixProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

export const EisenhowerMatrix: React.FC<EisenhowerMatrixProps> = ({ tasks, onSelectTask }) => {
  // Quadrants logic
  const doFirst = tasks.filter(
    (t) => t.status !== 'done' && (t.priority === 'urgent' || (t.priority === 'high' && t.deadline))
  );

  const schedule = tasks.filter(
    (t) => t.status !== 'done' && t.priority === 'high' && !doFirst.includes(t)
  );

  const fastTrack = tasks.filter(
    (t) => t.status !== 'done' && t.priority === 'medium'
  );

  const lowPriority = tasks.filter(
    (t) => t.status !== 'done' && t.priority === 'low'
  );

  const renderCard = (task: Task, accentColor: string) => (
    <div
      key={task.id}
      onClick={() => onSelectTask(task)}
      className="p-3 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 rounded-lg cursor-pointer transition-all hover:border-slate-700 shadow-sm space-y-1.5 group"
    >
      <div className="flex items-center justify-between text-[10px] text-slate-400">
        <span className={`font-semibold uppercase tracking-wider ${accentColor}`}>
          {task.priority}
        </span>
        <span className="font-mono text-slate-500 tabular-nums">
          {task.deadlineDisplay || task.deadline || 'TBD'}
        </span>
      </div>
      <p className="text-xs font-medium text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-2">
        {task.description}
      </p>
      <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="truncate max-w-[120px]">{task.ownerName || 'Unassigned'}</span>
        <span className="capitalize text-slate-500">{task.status.replace('_', ' ')}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
        <span>Eisenhower Decision Matrix: Strategic Prioritization of Open Deliverables</span>
        <span className="font-mono">{tasks.filter((t) => t.status !== 'done').length} open tasks plotted</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quadrant 1: Urgent & Critical */}
        <div className="bg-slate-900/50 border border-rose-900/40 rounded-xl p-4 flex flex-col min-h-[280px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-rose-900/30">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                Q1: Immediate Action (Urgent &amp; High Impact)
              </h4>
            </div>
            <span className="text-xs font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40 tabular-nums">
              {doFirst.length}
            </span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto">
            {doFirst.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-6 text-center">No urgent P0 blockers.</p>
            ) : (
              doFirst.map((t) => renderCard(t, 'text-rose-400'))
            )}
          </div>
        </div>

        {/* Quadrant 2: High Value Strategy */}
        <div className="bg-slate-900/50 border border-emerald-900/40 rounded-xl p-4 flex flex-col min-h-[280px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-900/30">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Q2: Strategic Planning (High Value &amp; Scheduled)
              </h4>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 tabular-nums">
              {schedule.length}
            </span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto">
            {schedule.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-6 text-center">No strategic roadmap items pending.</p>
            ) : (
              schedule.map((t) => renderCard(t, 'text-emerald-400'))
            )}
          </div>
        </div>

        {/* Quadrant 3: Fast-Track / Tactical */}
        <div className="bg-slate-900/50 border border-sky-900/40 rounded-xl p-4 flex flex-col min-h-[280px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-sky-900/30">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                Q3: Tactical Execution (Standard Sprint Work)
              </h4>
            </div>
            <span className="text-xs font-mono text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/40 tabular-nums">
              {fastTrack.length}
            </span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto">
            {fastTrack.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-6 text-center">No tactical deliverables.</p>
            ) : (
              fastTrack.map((t) => renderCard(t, 'text-sky-400'))
            )}
          </div>
        </div>

        {/* Quadrant 4: Backlog / Low Priority */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col min-h-[280px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Q4: Backlog &amp; Continuous Improvement
              </h4>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 tabular-nums">
              {lowPriority.length}
            </span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto">
            {lowPriority.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-6 text-center">No backlog items.</p>
            ) : (
              lowPriority.map((t) => renderCard(t, 'text-slate-400'))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
