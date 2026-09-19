'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  MoreVertical,
  FileText,
  Send,
  Eye,
  Phone,
  MapPin,
  CalendarPlus,
  User,
  Sparkles
} from 'lucide-react';

export interface AppointmentItem {
  id: string;
  patientName: string;
  phone: string;
  city: string;
  type: string;
  time: string;
  date: string;
  mode: string;
  status: 'pending' | 'accepted' | 'reprogram';
  avatar: string;
  notes?: string[];
}

interface AppointmentListViewProps {
  appointments: AppointmentItem[];
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onOpenReprogramModal: (id: string, name: string) => void;
  onOpenPatientFile: (item: AppointmentItem) => void;
  onOpenNoteModal: (name: string) => void;
  onSendReminder: (name: string, phone: string) => void;
  onResetFilters: () => void;
}

export const AppointmentListView: React.FC<AppointmentListViewProps> = ({
  appointments,
  onConfirm,
  onCancel,
  onOpenReprogramModal,
  onOpenPatientFile,
  onOpenNoteModal,
  onSendReminder,
  onResetFilters,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4 text-teal-600" />
          Liste des séances ({appointments.length})
        </h3>
      </div>

      <div className="space-y-3">
        {appointments.length > 0 ? (
          appointments.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-100 hover:border-teal-200 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:shadow-md"
            >
              {/* Infos Patient */}
              <div className="flex items-center gap-4">
                <div
                  onClick={() => onOpenPatientFile(item)}
                  className="w-12 h-12 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0 cursor-pointer transition-colors"
                  title="Voir le dossier patient"
                >
                  {item.avatar}
                </div>
                <div>
                  <button
                    onClick={() => onOpenPatientFile(item)}
                    className="font-extrabold text-slate-900 text-sm hover:text-teal-600 transition-colors text-left flex items-center gap-1 group/name"
                  >
                    <span>{item.patientName}</span>
                    <Eye className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover/name:opacity-100 transition-opacity" />
                  </button>

                  <p className="text-xs font-bold text-teal-700">{item.type}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" /> {item.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {item.city}
                    </span>
                  </div>
                </div>
              </div>

              {/* Date & Heure */}
              <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/70 text-xs space-y-0.5 min-w-[170px]">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  {item.date}
                </p>
                <p className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {item.time} • {item.mode}
                </p>
              </div>

              {/* Boutons d'Action & Menu 3 points */}
              <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end flex-wrap relative">
                {item.status === 'pending' && (
                  <>
                    <button
                      onClick={() => onConfirm(item.id)}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                    >
                      Confirmer
                    </button>
                    <button
                      onClick={() => onCancel(item.id)}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-colors"
                    >
                      Annuler
                    </button>
                  </>
                )}

                {item.status === 'accepted' && (
                  <>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/90 px-3.5 py-2 rounded-full flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" />
                      Accepté
                    </span>
                    <button
                      onClick={() => onCancel(item.id)}
                      className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-full transition-colors"
                    >
                      Annuler
                    </button>
                  </>
                )}

                {item.status === 'reprogram' && (
                  <button
                    onClick={() => onOpenReprogramModal(item.id, item.patientName)}
                    className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl  shadow-md flex items-center gap-1.5 "
                  >
                    <CalendarPlus className="w-4 h-4" />
                    Programmer
                  </button>
                )}

                {item.mode.includes('ligne') && (
                  <button
                    onClick={() => alert(`Lancement de la téléconsultation vidéo avec ${item.patientName}...`)}
                    className="p-2.5 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-xl transition-colors shadow-sm"
                    title="Démarrer la consultation vidéo"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                )}

                {/* Menu contextuel */}
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {openMenuId === item.id && (
                    <div className="absolute right-0 top-10 z-30 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1 text-xs text-slate-700 animate-in fade-in">
                      <button
                        onClick={() => {
                          onOpenPatientFile(item);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2 font-medium"
                      >
                        <FileText className="w-3.5 h-3.5 text-teal-600" />
                        Voir le dossier patient
                      </button>

                      <button
                        onClick={() => {
                          onOpenNoteModal(item.patientName);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2 font-medium"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Ajouter une note de séance
                      </button>

                      <button
                        onClick={() => {
                          onSendReminder(item.patientName, item.phone);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2 font-medium border-t border-slate-100"
                      >
                        <Send className="w-3.5 h-3.5 text-blue-500" />
                        Envoyer un rappel SMS / Email
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Aucun rendez-vous trouvé</p>
            <p className="text-xs text-slate-400 mt-1">
              Aucun résultat ne correspond à vos filtres actuels.
            </p>
            <button
              onClick={onResetFilters}
              className="mt-4 px-4 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-700 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
