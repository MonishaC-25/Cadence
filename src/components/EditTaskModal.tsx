import React, { useState } from 'react';
import { Task, TeamMember, TaskPriority, TaskStatus } from '../types';
import { X, Save, Trash2, Calendar, AlertCircle } from 'lucide-react';

interface EditTaskModalProps {
  task: Task;
  team: TeamMember[];
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  team,
  onClose,
  onSave,
  onDelete,
}) => {
  const [description, setDescription] = useState(task.description);
  const [ownerId, setOwnerId] = useState(task.ownerId || '');
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [deadline, setDeadline] = useState(task.deadline || '');
  const [deadlineDisplay, setDeadlineDisplay] = useState(task.deadlineDisplay || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const matchedOwner = team.find((m) => m.id === ownerId);

    const updated: Task = {
      ...task,
      description: description.trim(),
      ownerId: ownerId || null,
      ownerName: matchedOwner ? matchedOwner.name : null,
      priority,
      status,
      deadline: deadline || null,
      deadlineDisplay: deadlineDisplay.trim() || deadline || null,
    };

    onSave(updated);
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Permanently delete action item: "${task.description}"?`)) {
      onDelete(task.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Edit Action Item
            </h3>
            <p className="text-xs text-slate-400">
              Update deliverable requirement, assignee, priority, or deadline.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Deliverable Description *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Assignee
              </label>
              <select
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="">Unassigned</option>
                {team.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.roleTitle})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="urgent">Urgent (P0 Critical)</option>
                <option value="high">High (P1 Priority)</option>
                <option value="medium">Medium (P2 Standard)</option>
                <option value="low">Low (P3 Backlog)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Target Date (ISO)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Display Label
              </label>
              <input
                type="text"
                value={deadlineDisplay}
                onChange={(e) => setDeadlineDisplay(e.target.value)}
                placeholder="e.g. By Friday, Next Sprint"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Workflow Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-950/70 -mx-5 -mb-5 mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg border border-rose-900/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Task</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
