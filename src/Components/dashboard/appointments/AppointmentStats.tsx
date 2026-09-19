'use client';

import React from 'react';
import { Calendar, CheckCircle, Clock, CalendarPlus } from 'lucide-react';

interface AppointmentStatsProps {
  stats: {
    total: number;
    accepted: number;
    pending: number;
    reprogram: number;
  };
}

export const AppointmentStats: React.FC<AppointmentStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <p className="text-2xl font-black text-slate-900">{stats.total}</p>
          <p className="text-xs font-semibold text-slate-500">Total Rendez-vous</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-2xl font-black text-emerald-700">{stats.accepted}</p>
          <p className="text-xs font-semibold text-emerald-800">Confirmés / Acceptés</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <p className="text-2xl font-black text-amber-700">{stats.pending}</p>
          <p className="text-xs font-semibold text-amber-800">En attente</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
          <CalendarPlus className="w-6 h-6" />
        </div>
        <div>
          <p className="text-2xl font-black text-blue-700">{stats.reprogram}</p>
          <p className="text-xs font-semibold text-blue-800">À reprogrammer</p>
        </div>
      </div>
    </div>
  );
};
