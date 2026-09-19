'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, Video, ChevronRight, User } from 'lucide-react';

export interface TodayAppointment {
  id: string;
  patientName: string;
  type: string;
  time: string;
  date: string;
  mode: string;
  status: 'pending' | 'accepted' | 'reprogram' | 'confirmed';
  avatar: string;
}

interface TodayAppointmentsWidgetProps {
  appointments: TodayAppointment[];
  searchQuery: string;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onClearSearch: () => void;
}

export const TodayAppointmentsWidget: React.FC<TodayAppointmentsWidgetProps> = ({
  appointments,
  searchQuery,
  onConfirm,
  onCancel,
  onClearSearch,
}) => {
  return (
    <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
            <Calendar className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">
            Prochains RDV {searchQuery ? `(Résultats pour "${searchQuery}")` : 'du jour'}
          </h3>
        </div>

        <Link
          href="/dashboard/doctor/appointments"
          className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-0.5"
        >
          Voir tout <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3">
        {appointments.length > 0 ? (
          appointments.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-teal-200 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                  {item.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{item.patientName}</h4>
                  <p className="text-[11px] font-semibold text-teal-700">{item.type}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> {item.time}  {item.mode}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {item.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => onConfirm(item.id)}
                      className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                    >
                      Confirmer
                    </button>
                    <button
                      onClick={() => onCancel(item.id)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-colors"
                    >
                      Annuler
                    </button>
                  </>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-3 py-1 rounded-full">
                    Confirmé
                  </span>
                )}

                {item.mode.includes('ligne') && (
                  <button
                    className="p-2 bg-teal-50 text-teal-700 rounded-xl hover:bg-teal-100 transition-colors"
                    title="Lancer la téléconsultation"
                    
                  >
                    <Video className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">Aucun patient trouvé</p>
            <button
              onClick={onClearSearch}
              className="mt-3 text-xs text-teal-600 font-bold hover:underline"
            >
              Effacer la recherche
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
