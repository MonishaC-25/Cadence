import React, { useState } from 'react';
import {
  Bell,
  Mail,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  Sparkles,
  Inbox,
  AlertCircle,
  X,
  Volume2,
} from 'lucide-react';
import { AppNotification, TeamMember } from '../types';
import { soundFx } from '../utils/soundEffects';

interface NotificationDropdownProps {
  notifications: AppNotification[];
  activeUser: TeamMember;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectTask?: (taskId: string, meetingId?: string) => void;
  onSelectMeeting?: (meetingId: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  activeUser,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectTask,
  onSelectMeeting,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const [emailToast, setEmailToast] = useState<{ title: string; email: string } | null>(null);

  // Filter notifications for active user
  const userNotifications = notifications.filter(
    (n) => n.recipientId === activeUser.id || n.recipientEmail === activeUser.email
  );

  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  const displayed = userNotifications.filter((n) => {
    if (activeFilter === 'unread') return !n.isRead;
    return true;
  });

  const handleSimulateEmail = (notif: AppNotification, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmailToast({
      title: notif.title,
      email: notif.recipientEmail,
    });
    setTimeout(() => {
      setEmailToast(null);
    }, 4000);
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return 'Just now';
    }
  };

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button
        onClick={() => {
          soundFx.playBellChime();
          setIsOpen((prev) => !prev);
        }}
        className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 transition-colors focus:outline-none group active:scale-95"
        title="Notifications & Email Dispatch (Plays chime sound)"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-40 overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 font-mono text-[10px] rounded">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
                <p className="text-[10px] text-slate-400">Synced with {activeUser.email}</p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}

            <button
              onClick={() => soundFx.playBellChime()}
              className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-800 transition-colors"
              title="Test notification bell chime sound"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="px-3.5 py-2 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-0.5 rounded text-[11px] transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-slate-800 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({userNotifications.length})
              </button>
              <button
                onClick={() => setActiveFilter('unread')}
                className={`px-2.5 py-0.5 rounded text-[11px] transition-colors ${
                  activeFilter === 'unread'
                    ? 'bg-slate-800 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
              <Mail className="w-3 h-3 text-sky-400" />
              <span>Email Relay Active</span>
            </div>
          </div>

          {/* List of items */}
          <div className="overflow-y-auto divide-y divide-slate-800/60 max-h-[380px]">
            {displayed.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Inbox className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No {activeFilter === 'unread' ? 'unread' : ''} notifications</p>
                <p className="text-[10px] text-slate-500">
                  When tasks are assigned to you during meeting reviews, you will see alerts here and receive an email copy.
                </p>
              </div>
            ) : (
              displayed.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (!item.isRead) onMarkAsRead(item.id);
                    if (item.taskId && onSelectTask) {
                      onSelectTask(item.taskId, item.meetingId);
                      setIsOpen(false);
                    } else if (item.meetingId && onSelectMeeting) {
                      onSelectMeeting(item.meetingId);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3.5 transition-colors cursor-pointer text-left group ${
                    item.isRead
                      ? 'bg-slate-900/40 hover:bg-slate-800/60 opacity-80 hover:opacity-100'
                      : 'bg-slate-850 hover:bg-slate-800/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {!item.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        )}
                        <span className="text-xs font-semibold text-white truncate">
                          {item.title}
                        </span>
                        {item.meetingTitle && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.2 rounded truncate max-w-[150px]">
                            {item.meetingTitle}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                        {item.message}
                      </p>

                      <div className="flex items-center gap-2 pt-0.5 text-[10px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{formatRelativeTime(item.createdAt)}</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-sky-400">
                          <Mail className="w-2.5 h-2.5" />
                          <span>Dispatched to {item.recipientEmail}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <button
                        onClick={(e) => handleSimulateEmail(item, e)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-sky-300 transition-colors"
                        title="View dispatched email envelope"
                      >
                        <Mail className="w-3 h-3" />
                      </button>
                      {!item.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(item.id);
                          }}
                          className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-0.5 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Email Integration Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Email Webhook Relay: <strong>Connected</strong></span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">SMTP / Resend API</span>
          </div>
        </div>
      )}

      {/* Floating Simulated Email Notification Toast */}
      {emailToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-sky-500/40 rounded-xl shadow-2xl p-4 max-w-sm flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div className="space-y-1 text-left flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-white">Email Dispatched</p>
              <button
                onClick={() => setEmailToast(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-slate-300">
              Notification sent to <span className="font-mono text-sky-400">{emailToast.email}</span>
            </p>
            <p className="text-[10px] text-slate-400 italic font-mono truncate">
              "{emailToast.title}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
