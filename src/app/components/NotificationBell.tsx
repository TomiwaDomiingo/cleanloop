import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, BellRing } from 'lucide-react';
import {
  AppNotification,
  getNotifications,
  markAllNotificationsRead,
  requestBrowserNotificationPermission,
} from '../types';

interface NotificationBellProps {
  userId: string;
}

const typeIcon: Record<AppNotification['type'], string> = {
  pickup: '🚛',
  report: '📍',
  reward: '🎉',
  system: '📢',
};

const typeBg: Record<AppNotification['type'], string> = {
  pickup: 'bg-green-50',
  report: 'bg-yellow-50',
  reward: 'bg-blue-50',
  system: 'bg-gray-50',
};

export function NotificationBell({ userId }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission === 'granted'
      : false
  );
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const refresh = () => {
    setNotifications(getNotifications(userId));
  };

  useEffect(() => {
    refresh();
    // Poll every 5 seconds for new notifications (simulates real-time)
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleOpen = () => {
    setOpen((v) => !v);
    refresh();
  };

  const handleMarkRead = () => {
    markAllNotificationsRead(userId);
    refresh();
  };

  const handleRequestPermission = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setPermissionGranted(permission === 'granted');
  };

  const timeAgo = (ts: number): string => {
    const diff = (Date.now() - ts) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5 text-gray-700 animate-[wiggle_0.5s_ease-in-out]" />
        ) : (
          <Bell className="w-5 h-5 text-gray-600" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#DC2626] text-white rounded-full text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-700" />
              <span className="font-bold text-gray-900 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-[#DC2626] text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkRead}
                  className="text-[10px] text-[#16A34A] font-semibold hover:underline px-1"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Permission prompt */}
          {!permissionGranted && 'Notification' in window && (
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-start gap-3">
              <Bell className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-800 mb-1">Enable push alerts</p>
                <p className="text-xs text-gray-600 mb-2">
                  Get notified about pickup status updates even when the tab is in the background.
                </p>
                <button
                  onClick={handleRequestPermission}
                  className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full font-semibold hover:bg-blue-600 transition-colors"
                >
                  Allow Notifications
                </button>
              </div>
            </div>
          )}

          {/* List */}
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-400">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Request a pickup to get started!
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 items-start ${
                    !n.read ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base ${typeBg[n.type]}`}
                  >
                    {typeIcon[n.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-xs font-bold text-gray-900 leading-tight">{n.title}</p>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 leading-snug">{n.body}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.timestamp)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 text-center">
              <button
                onClick={handleMarkRead}
                className="flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 mx-auto"
              >
                <Check className="w-3 h-3" />
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
