import React, { useState } from 'react';
import { Meeting, TeamMember, PrivacyLevel, MeetingModality } from '../types';
import { X, Save, Building, Radio, Globe, Lock, Users, Calendar, Clock } from 'lucide-react';

interface EditMeetingModalProps {
  meeting: Meeting;
  team: TeamMember[];
  onClose: () => void;
  onSave: (updatedMeeting: Meeting) => void;
}

export const EditMeetingModal: React.FC<EditMeetingModalProps> = ({
  meeting,
  team,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(meeting.title);
  const [agenda, setAgenda] = useState(meeting.agenda);
  const [date, setDate] = useState(meeting.date);
  const [time, setTime] = useState(meeting.time || '10:00');
  const [durationMinutes, setDurationMinutes] = useState(meeting.durationMinutes || 30);
  const [modality, setModality] = useState<MeetingModality>(meeting.modality || 'online');
  const [locationOrLink, setLocationOrLink] = useState(meeting.locationOrLink || '');
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>(meeting.privacyLevel);
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<string[]>(meeting.attendeeIds);
  const [attendeeSearch, setAttendeeSearch] = useState('');

  const toggleAttendee = (id: string) => {
    if (selectedAttendeeIds.includes(id)) {
      setSelectedAttendeeIds(selectedAttendeeIds.filter((item) => item !== id));
    } else {
      setSelectedAttendeeIds([...selectedAttendeeIds, id]);
    }
  };

  const filteredTeam = team.filter(
    (m) =>
      m.name.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
      m.roleTitle.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
      m.department.toLowerCase().includes(attendeeSearch.toLowerCase())
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const updated: Meeting = {
      ...meeting,
      title: title.trim(),
      agenda: agenda.trim(),
      date,
      time,
      durationMinutes: Number(durationMinutes) || 30,
      modality,
      locationOrLink: locationOrLink.trim() || undefined,
      privacyLevel,
      attendeeIds: selectedAttendeeIds,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl my-auto shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Edit Meeting Details
            </h3>
            <p className="text-xs text-slate-400">
              Update session subject, agenda, modality, location, and attendee list.
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
        <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-4 flex-1 overflow-y-auto text-xs">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Meeting Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Agenda &amp; Context
            </label>
            <textarea
              rows={3}
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Date, Time, Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Duration (Mins)
              </label>
              <input
                type="number"
                min={5}
                max={480}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Modality, Location & Confidentiality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Modality
              </label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value as MeetingModality)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="hybrid">🔀 Hybrid (Room + Remote)</option>
                <option value="online">🌐 Online / Remote Video</option>
                <option value="in_person">🏢 In-Person Conference Room</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Confidentiality Level
              </label>
              <select
                value={privacyLevel}
                onChange={(e) => setPrivacyLevel(e.target.value as PrivacyLevel)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="department">Department Only</option>
                <option value="company">Company-Wide</option>
                <option value="confidential">Confidential</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Location / Conference Endpoint
            </label>
            <input
              type="text"
              value={locationOrLink}
              onChange={(e) => setLocationOrLink(e.target.value)}
              placeholder="e.g. Boardroom Alpha + Google Meet or https://meet.google.com/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
            />
          </div>

          {/* Searchable Attendees Selection */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase text-slate-400">
                Attendees ({selectedAttendeeIds.length} of {team.length} selected)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAttendeeIds(team.map((m) => m.id))}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300"
                >
                  Select All
                </button>
                <span className="text-slate-600">·</span>
                <button
                  type="button"
                  onClick={() => setSelectedAttendeeIds([])}
                  className="text-[11px] text-slate-400 hover:text-white"
                >
                  Clear All
                </button>
              </div>
            </div>

            <input
              type="text"
              value={attendeeSearch}
              onChange={(e) => setAttendeeSearch(e.target.value)}
              placeholder="Search attendees by name, role, or department..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none"
            />

            <div className="max-h-36 overflow-y-auto space-y-1 bg-slate-950 p-2 rounded-lg border border-slate-800">
              {filteredTeam.map((m) => {
                const isSelected = selectedAttendeeIds.includes(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => toggleAttendee(m.id)}
                    className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-emerald-500/15 text-emerald-300 font-medium'
                        : 'hover:bg-slate-900 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{isSelected ? '✓' : '+'}</span>
                      <span className="text-xs text-slate-200">{m.name}</span>
                      <span className="text-[10px] text-slate-500">({m.roleTitle})</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{m.department}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-950/70 -mx-6 -mb-6 mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
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
        </form>
      </div>
    </div>
  );
};
