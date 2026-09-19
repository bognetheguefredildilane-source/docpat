'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Grid } from 'lucide-react';
import { AppointmentItem } from './AppointmentListView';

interface AppointmentCalendarViewProps {
  appointments: AppointmentItem[];
  onOpenPatientFile: (item: AppointmentItem) => void;
}

export const AppointmentCalendarView: React.FC<AppointmentCalendarViewProps> = ({
  appointments,
  onOpenPatientFile,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // Septembre 2026

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 8, 1));
  };

  // Nombre de jours dans le mois
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Jour de la semaine du 1er jour (0 = Dimanche, 1 = Lundi, ...)
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Décalage pour démarrer Lundi (0 pour Lundi, 6 pour Dimanche)
  const paddingDays = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
      {/* En-tête du Calendrier */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              {monthNames[month]} {year}
            </h3>
            <p className="text-xs text-slate-400">
              {appointments.length} consultations au planning
            </p>
          </div>
        </div>

        {/* Boutons de navigation mois */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Aujourd'hui
          </button>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white text-slate-700 rounded-lg transition-colors"
              title="Mois précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white text-slate-700 rounded-lg transition-colors"
              title="Mois suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* En-tête des jours de la semaine */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-2">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d, i) => (
          <div key={i} className="py-1.5 bg-slate-50 rounded-xl">
            {d}
          </div>
        ))}
      </div>

      {/* Grille des jours du mois */}
      <div className="grid grid-cols-7 gap-2">
        {/* Cases vides précédant le 1er du mois */}
        {[...Array(paddingDays)].map((_, i) => (
          <div key={`pad-${i}`} className="min-h-[95px] p-2 bg-slate-50/40 rounded-2xl border border-slate-100 opacity-30" />
        ))}

        {/* Jours réels du mois */}
        {[...Array(daysInMonth)].map((_, i) => {
          const dayNum = i + 1;
          const monthStr = month + 1 < 10 ? `0${month + 1}` : `${month + 1}`;
          const dayStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
          const dateFormatted = `${year}-${monthStr}-${dayStr}`;

          // Filtrer les RDV de cette journée
          const dayApts = appointments.filter((a) => a.date === dateFormatted);

          return (
            <div
              key={dayNum}
              className={`min-h-[95px] p-2 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                dayApts.length > 0
                  ? 'bg-teal-50/60 border-teal-200 hover:shadow-md'
                  : 'bg-slate-50/70 border-slate-100 hover:border-slate-200'
              }`}
            >
              <span className={`text-xs font-extrabold ${dayApts.length > 0 ? 'text-teal-800' : 'text-slate-500'}`}>
                {dayNum}
              </span>

              {dayApts.length > 0 ? (
                <div className="space-y-1.5 mt-1">
                  {dayApts.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => onOpenPatientFile(a)}
                      className="bg-teal-600 hover:bg-teal-700 text-white p-1.5 rounded-lg text-[10px] font-extrabold truncate cursor-pointer transition-colors shadow-sm"
                      title={`${a.patientName} (${a.time}) - Cliquez pour voir le dossier`}
                    >
                      {a.time} {a.patientName.split(' ')[0]}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-[10px] text-slate-300 font-medium">Libre</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};