'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ConsultationNoteModalProps {
  isOpen: boolean;
  patientName: string;
  noteText: string;
  setNoteText: (text: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ConsultationNoteModal: React.FC<ConsultationNoteModalProps> = ({
  isOpen,
  patientName,
  noteText,
  setNoteText,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-teal-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-extrabold text-slate-900 text-base mb-1">
          Ajouter une Note de Consultation
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Patient : <span className="font-bold text-teal-700">{patientName}</span>
        </p>

        <form onSubmit={onSubmit} className="space-y-3">
          <textarea
            placeholder="Rédigez vos observations (ex: état psychologique, traitement conseillé...)"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none min-h-[100px]"
            required
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Enregistrer la note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
