import React, { useState } from 'react';
import { Task, TeamMember, TaskStatus, TaskPriority } from '../types';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  LayoutGrid,
  List as ListIcon,
  Download,
  User,
  Search,
  MessageSquare,
  History,
  Send,
  X,
  Grid2X2,
  Edit2,
  Trash2,
} from 'lucide-react';
import { downloadTaskIcs } from '../utils/calendar';
import { EisenhowerMatrix } from './EisenhowerMatrix';
import { EditTaskModal } from './EditTaskModal';

interface TaskBoardProps {
  tasks: Task[];
  team: TeamMember[];
  activeUser: TeamMember;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateTaskOwner: (taskId: string, newOwnerId: string | null) => void;
  onAddTaskComment: (taskId: string, commentText: string) => void;
  onOpenMeeting: (meetingId: string) => void;
  onUpdateTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  initialTaskId?: string | null;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  team,
  activeUser,
  onUpdateTaskStatus,
  onUpdateTaskOwner,
  onAddTaskComment,
  onOpenMeeting,
  onUpdateTask,
  onDeleteTask,
  initialTaskId,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'matrix'>('kanban');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [myTasksOnly, setMyTasksOnly] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(() => {
    if (initialTaskId) {
      return tasks.find((t) => t.id === initialTaskId) || null;
    }
    return null;
  });

  // Watch for external initialTaskId changes (e.g. from notification clicks)
  React.useEffect(() => {
    if (initialTaskId) {
      const match = tasks.find((t) => t.id === initialTaskId);
      if (match) setSelectedTask(match);
    }
  }, [initialTaskId, tasks]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = tasks.filter((t) => {
    if (myTasksOnly && t.ownerId !== activeUser.id) return false;
    if (assigneeFilter !== 'all') {
      if (assigneeFilter === 'unassigned' && t.ownerId) return false;
      if (assigneeFilter !== 'unassigned' && t.ownerId !== assigneeFilter) return false;
    }
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchOwner = t.ownerName?.toLowerCase().includes(q);
      const matchMeeting = t.meetingTitle.toLowerCase().includes(q);
      if (!matchDesc && !matchOwner && !matchMeeting) return false;
    }
    return true;
  });

  const columns: Array<{ status: TaskStatus; label: string }> = [
    { status: 'pending', label: 'Backlog / Pending' },
    { status: 'in_progress', label: 'In Progress' },
    { status: 'review', label: 'Under Review' },
    { status: 'done', label: 'Completed' },
  ];

  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'text-rose-400 font-semibold';
      case 'high':
        return 'text-amber-400 font-medium';
      case 'medium':
        return 'text-sky-400';
      case 'low':
        return 'text-slate-400';
    }
  };

  const isOverdue = (task: Task) => {
    return task.status !== 'done' && task.deadline && task.deadline < todayStr;
  };

  const completedCount = tasks.filter((t) => t.status === 'done').length;
  const progressRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newComment.trim()) return;

    onAddTaskComment(selectedTask.id, newComment.trim());
    setNewComment('');

    // Keep drawer updated
    const current = tasks.find((t) => t.id === selectedTask.id);
    if (current) {
      setSelectedTask({
        ...current,
        comments: [
          ...(current.comments || []),
          {
            id: `c_${Date.now()}`,
            authorId: activeUser.id,
            authorName: activeUser.name,
            text: newComment.trim(),
            createdAt: new Date().toISOString(),
          },
        ],
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action / filter bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'matrix'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid2X2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Matrix</span>
            </button>
          </div>

          {/* Quick toggle: My Tasks */}
          <button
            onClick={() => setMyTasksOnly(!myTasksOnly)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              myTasksOnly
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            My Deliverables Only
          </button>

          {/* Assignee filter */}
          {!myTasksOnly && (
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="all">All Assignees</option>
              <option value="unassigned">Unassigned Only</option>
              {team.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          )}

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter tasks..."
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Velocity stats */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Progress:</span>
            <span className="font-mono font-semibold text-emerald-400 tabular-nums">
              {completedCount} / {tasks.length} ({progressRate}%)
            </span>
          </div>
          <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${progressRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.status);
            return (
              <div
                key={col.status}
                className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col min-h-[500px]"
              >
                {/* Column header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {col.label}
                  </h3>
                  <span className="text-xs font-mono text-slate-500 tabular-nums bg-slate-800/80 px-2 py-0.5 rounded">
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards container */}
                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="h-32 border border-dashed border-slate-800/60 rounded-lg flex items-center justify-center text-xs text-slate-600">
                      No tasks in {col.label.toLowerCase()}
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const overdue = isOverdue(task);
                      const isTargetTask = initialTaskId === task.id;
                      return (
                        <div
                          key={task.id}
                          className={`rounded-lg p-3.5 transition-all shadow-sm cursor-pointer ${
                            isTargetTask
                              ? 'bg-emerald-950/40 border-2 border-emerald-400 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/20'
                              : overdue
                              ? 'border border-rose-900/50 bg-rose-950/10 hover:border-slate-700/80'
                              : 'bg-slate-900 border border-slate-800 hover:border-slate-700/80'
                          }`}
                          onClick={() => setSelectedTask(task)}
                        >
                          {/* Priority and meeting info */}
                          <div className="flex items-center justify-between text-[11px] mb-2 text-slate-400">
                            <div className="flex items-center gap-1.5">
                              {isTargetTask && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-400 text-slate-950 uppercase tracking-wider animate-pulse">
                                  ★ Recent
                                </span>
                              )}
                              <span className={getPriorityStyle(task.priority)}>
                                {task.priority.toUpperCase()}
                              </span>
                            </div>
                            <span
                              className="text-slate-500 hover:text-slate-300 truncate max-w-[140px] text-right underline underline-offset-2 transition-colors"
                              title={task.meetingTitle}
                            >
                              {task.meetingTitle}
                            </span>
                          </div>

                          {/* Task title */}
                          <p className="text-xs font-medium text-slate-100 mb-2 leading-relaxed">
                            {task.description}
                          </p>

                          {/* Footer: Assignee & Deadline */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-slate-300 truncate max-w-[110px]">
                              {task.ownerName || 'Unassigned'}
                            </span>

                            <div className="flex items-center gap-2">
                              {task.comments && task.comments.length > 0 && (
                                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                  <MessageSquare className="w-3 h-3" />
                                  <span>{task.comments.length}</span>
                                </span>
                              )}

                              {task.deadline && (
                                <span
                                  className={`text-[11px] flex items-center gap-1 font-mono tabular-nums ${
                                    overdue ? 'text-rose-400 font-semibold' : 'text-slate-400'
                                  }`}
                                >
                                  <Clock className="w-3 h-3" />
                                  {task.deadlineDisplay || task.deadline}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick stage selector */}
                          <div
                            className="mt-2.5 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[11px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-slate-500">Stage:</span>
                            <select
                              value={task.status}
                              onChange={(e) =>
                                onUpdateTaskStatus(task.id, e.target.value as TaskStatus)
                              }
                              className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-300 text-[11px] focus:outline-none"
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="review">Review</option>
                              <option value="done">Done</option>
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table / List View */}
      {viewMode === 'list' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Task Description</th>
                  <th className="py-3 px-4">Origin Meeting</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Target Deadline</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-200">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No tasks match current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const overdue = isOverdue(task);
                    return (
                      <tr
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-4 font-medium text-white max-w-sm">
                          <p>{task.description}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-400 truncate max-w-[160px]">
                          {task.meetingTitle}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {task.ownerName || 'Unassigned'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={getPriorityStyle(task.priority)}>
                            {task.priority.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums">
                          <span className={overdue ? 'text-rose-400 font-semibold' : 'text-slate-300'}>
                            {task.deadlineDisplay || task.deadline || '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={task.status}
                            onChange={(e) =>
                              onUpdateTaskStatus(task.id, e.target.value as TaskStatus)
                            }
                            className={`border rounded px-2.5 py-1 text-xs font-medium focus:outline-none ${
                              task.status === 'done'
                                ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400'
                                : task.status === 'in_progress'
                                ? 'bg-sky-950/30 border-sky-800 text-sky-400'
                                : task.status === 'review'
                                ? 'bg-purple-950/30 border-purple-800 text-purple-400'
                                : 'bg-slate-950 border-slate-800 text-slate-300'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="done">Done</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadTaskIcs(task);
                            }}
                            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors mr-1"
                            title="Export Calendar Reminder"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Eisenhower Matrix View */}
      {viewMode === 'matrix' && (
        <EisenhowerMatrix
          tasks={filteredTasks}
          onSelectTask={(task) => setSelectedTask(task)}
        />
      )}

      {/* Task Detail Drawer / Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                  Task Specification &amp; Activity
                </span>
                <h3 className="text-base font-bold text-white leading-snug">
                  {selectedTask.description}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                    Assignee
                  </span>
                  <select
                    value={selectedTask.ownerId || ''}
                    onChange={(e) => {
                      onUpdateTaskOwner(selectedTask.id, e.target.value || null);
                      const member = team.find((m) => m.id === e.target.value);
                      setSelectedTask({
                        ...selectedTask,
                        ownerId: e.target.value || null,
                        ownerName: member?.name || null,
                      });
                    }}
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none w-full"
                  >
                    <option value="">Unassigned</option>
                    {team.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                    Priority
                  </span>
                  <span className={getPriorityStyle(selectedTask.priority)}>
                    {selectedTask.priority.toUpperCase()}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                    Target Deadline
                  </span>
                  <span className="font-mono tabular-nums text-slate-200">
                    {selectedTask.deadlineDisplay || selectedTask.deadline || 'TBD'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                    Execution Stage
                  </span>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => {
                      const next = e.target.value as TaskStatus;
                      onUpdateTaskStatus(selectedTask.id, next);
                      setSelectedTask({ ...selectedTask, status: next });
                    }}
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-emerald-400 font-medium focus:outline-none w-full"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              {/* Source Quote */}
              {selectedTask.sourceQuote && (
                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                    Origin Utterance from Meeting
                  </span>
                  <p className="text-slate-300 italic">"{selectedTask.sourceQuote}"</p>
                </div>
              )}

              {/* Comments & Discussion */}
              <div className="space-y-3">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Discussion &amp; Workload Notes ({selectedTask.comments?.length || 0})</span>
                </span>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {(!selectedTask.comments || selectedTask.comments.length === 0) ? (
                    <p className="text-slate-500 text-xs italic">No comments yet. Leave a status note below.</p>
                  ) : (
                    selectedTask.comments.map((c) => (
                      <div key={c.id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span className="font-semibold text-white">{c.authorName}</span>
                          <span className="font-mono text-[10px] tabular-nums">
                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{c.text}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handlePostComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={`Comment as ${activeUser.name}...`}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-lg font-semibold flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Post</span>
                  </button>
                </form>
              </div>

              {/* Audit Log */}
              {selectedTask.auditLog && selectedTask.auditLog.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    <span>Change Audit Log</span>
                  </span>
                  <div className="space-y-1">
                    {selectedTask.auditLog.map((entry) => (
                      <div key={entry.id} className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span>{entry.action} by <strong>{entry.performedBy}</strong></span>
                        <span className="font-mono tabular-nums">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Task Edit / Delete Quick Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete task "${selectedTask.description}"?`)) {
                      onDeleteTask?.(selectedTask.id);
                      setSelectedTask(null);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors border border-rose-900/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Task</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditingTask(selectedTask)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                >
                  <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Edit Details</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          team={team}
          onClose={() => setEditingTask(null)}
          onSave={(updated) => {
            onUpdateTask?.(updated);
            setSelectedTask(updated);
            setEditingTask(null);
          }}
          onDelete={(id) => {
            onDeleteTask?.(id);
            setSelectedTask(null);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};
