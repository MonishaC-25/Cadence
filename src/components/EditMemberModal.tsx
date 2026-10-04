import React, { useState } from 'react';
import { TeamMember } from '../types';
import { X, Save, Trash2 } from 'lucide-react';

interface EditMemberModalProps {
  member: TeamMember;
  activeUser?: TeamMember;
  onClose: () => void;
  onSave: (updatedMember: TeamMember) => void;
  onDelete: (memberId: string) => void;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  member,
  activeUser,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email);
  const [department, setDepartment] = useState(member.department);
  const [roleTitle, setRoleTitle] = useState(member.roleTitle);
  const [hourlyRate, setHourlyRate] = useState(member.hourlyRate || 95);
  const [isAdmin, setIsAdmin] = useState(member.isAdmin || false);

  const canEditSensitive = activeUser ? activeUser.isAdmin : true;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const updated: TeamMember = {
      ...member,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      roleTitle: roleTitle.trim() || 'Contributor',
      hourlyRate: Number(hourlyRate) || 95,
      isAdmin,
    };

    onSave(updated);
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Remove "${member.name}" from the company workspace? All historical records will be preserved.`)) {
      onDelete(member.id);
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
              Edit Team Member Profile
            </h3>
            <p className="text-xs text-slate-400">
              Update collaborator details, compensation tier, or administrative permissions.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Operations">Operations</option>
                <option value="Executive">Executive</option>
                <option value="Sales">Sales</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1 flex items-center justify-between">
                <span>Hourly Payroll Rate ($/hr)</span>
                {!canEditSensitive && (
                  <span className="text-[10px] text-slate-500 font-normal">Admin Locked</span>
                )}
              </label>
              <input
                type="number"
                min={20}
                max={500}
                disabled={!canEditSensitive}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Role Title
            </label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          {canEditSensitive ? (
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="editAdminCheckbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="accent-emerald-400 rounded"
              />
              <label htmlFor="editAdminCheckbox" className="text-xs text-slate-300 font-medium">
                Grant administrator and governance permissions
              </label>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 italic pt-2">
              Administrative role assignment can only be configured by workspace administrators.
            </p>
          )}

          <div className="p-4 border-t border-slate-800 bg-slate-950/70 -mx-5 -mb-5 mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg border border-rose-900/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Member</span>
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
                <span>Save Profile</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
