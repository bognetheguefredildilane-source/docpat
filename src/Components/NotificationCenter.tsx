'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Bell } from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const { currentUser, notifications, markNotificationAsRead } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentUser) return null;

  const userNotifications = notifications.filter(
    (n) => n.userType === currentUser.role && n.userId === currentUser.id
  );

  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-md">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-teal-100 p-4 z-50">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
            <span className="text-xs text-teal-600 font-semibold">{unreadCount} non lue(s)</span>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 my-2">
            {userNotifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <p className="text-xs font-semibold">Aucune notification</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Les alertes apparaîtront lors d&apos;une réservation ou d&apos;un message.
                </p>
              </div>
            ) : (
              userNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  className={`p-3 rounded-xl cursor-pointer text-xs my-1 ${
                    notif.isRead ? 'bg-slate-50 text-slate-500' : 'bg-teal-50/70 text-slate-800 font-medium'
                  }`}
                >
                  <div className="flex justify-between font-semibold mb-1">
                    <span>{notif.title}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};