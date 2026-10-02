import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, X, User, CheckCircle2, ArrowRight } from 'lucide-react';
import { Meeting, Task } from '../types';

interface FloatingCalendarWidgetProps {
  meetings: Meeting[];
  tasks: Task[];
  onOpenMeeting: (meeting: Meeting) => void;
}

export const FloatingCalendarWidget: React.FC<FloatingCalendarWidgetProps> = ({
  meetings,
  tasks,
  onOpenMeeting,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in month calculation
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Selected date inside popup (defaults to today)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  // Group meetings and tasks by date YYYY-MM-DD
  const meetingsForSelected = meetings.filter((m) => m.date === selectedDateStr);
  const tasksForSelected = tasks.filter((t) => t.deadline === selectedDateStr);

  const getDayStatus = (dayNum: number) => {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dayMeetings = meetings.filter((m) => m.date === dStr);
    const dayTasks = tasks.filter((t) => t.deadline === dStr);

    return {
      hasMeetings: dayMeetings.length > 0,
      meetingCount: dayMeetings.length,
      hasTasks: dayTasks.length > 0,
      taskCount: dayTasks.length,
      dateStr: dStr,
    };
  };

  return (
    <>
      {/* Floating Action Button (Lower Right Screen) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl transition-all duration-200 border ${
            isOpen
              ? 'bg-slate-800 text-white border-slate-700 shadow-slate-900/50 scale-105'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-400/80 shadow-emerald-500/30 hover:scale-105 active:scale-95'
          }`}
          title="Open Floating Calendar Schedule"
        >
          <CalendarIcon className="w-5 h-5 fill-current" />
          <span className="text-xs font-bold tracking-wide uppercase font-mono">
            Calendar
          </span>
          {meetings.length > 0 && !isOpen && (
            <span className="w-5 h-5 rounded-full bg-slate-950 text-emerald-400 text-[10px] font-mono flex items-center justify-center font-bold">
              {meetings.length}
            </span>
          )}
        </button>
      </div>

      {/* Floating Calendar Flyout Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white tracking-wide">
                {monthNames[month]} {year}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 ml-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Month Grid */}
          <div className="p-3">
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono font-medium text-slate-500 mb-1">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-xs">
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const status = getDayStatus(dayNum);
                const isSelected = selectedDateStr === status.dateStr;
                const isToday = status.dateStr === todayStr;

                return (
                  <button
                    key={`day-${dayNum}`}
                    onClick={() => setSelectedDateStr(status.dateStr)}
                    className={`h-8 rounded-lg flex flex-col items-center justify-center relative font-mono transition-all text-[11px] ${
                      isSelected
                        ? 'bg-emerald-400 text-slate-950 font-bold shadow-sm'
                        : isToday
                        ? 'border border-emerald-500/50 text-white font-semibold bg-emerald-950/20'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{dayNum}</span>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {status.hasMeetings && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-slate-950' : 'bg-emerald-400'
                          }`}
                        />
                      )}
                      {status.hasTasks && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-slate-800' : 'bg-sky-400'
                          }`}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule for Selected Date */}
          <div className="border-t border-slate-800 bg-slate-950/80 p-3 max-h-56 overflow-y-auto space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="text-white font-medium">Schedule for {selectedDateStr}:</span>
              <span>
                {meetingsForSelected.length} sessions · {tasksForSelected.length} tasks
              </span>
            </div>

            {meetingsForSelected.length === 0 && tasksForSelected.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic py-2 text-center">
                No meetings or task deliverables scheduled for this day.
              </p>
            ) : (
              <div className="space-y-1.5">
                {meetingsForSelected.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      onOpenMeeting(m);
                      setIsOpen(false);
                    }}
                    className="p-2 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-lg text-xs cursor-pointer transition-colors group flex items-start justify-between"
                  >
                    <div className="truncate pr-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{m.time}</span>
                        <span>·</span>
                        <span className="truncate">{m.modality?.toUpperCase()}</span>
                      </div>
                      <h5 className="font-semibold text-white group-hover:text-emerald-300 truncate mt-0.5">
                        {m.title}
                      </h5>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0 mt-1" />
                  </div>
                ))}

                {tasksForSelected.map((t) => (
                  <div
                    key={t.id}
                    className="p-2 bg-slate-900/60 border border-slate-800/60 rounded-lg text-xs flex items-center justify-between"
                  >
                    <div className="truncate pr-2">
                      <span className="text-[10px] font-mono text-sky-400 block">Deliverable Due</span>
                      <p className="text-slate-300 truncate text-[11px] font-medium">{t.description}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      {t.ownerName?.split(' ')[0] || 'Unassigned'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
