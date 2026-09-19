'use client';

import React from 'react';
import { X, Check } from 'lucide-react';

interface PatientFileModalProps {
  isOpen: boolean;
  patient: {
    name: string;
    phone: string;
    city: string;
    age: string;
    antecedents: string;
    notes: string[];
  } | null;
  onClose: () => void;
  onAddNotePrompt: () => void;
}

export const PatientFileModal: React.FC<PatientFileModalProps> = ({
  isOpen,
  patient,
  onClose,
  onAddNotePrompt,
}) => {
  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-teal-100 relative max-h-[90vh] overflow-y-auto space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white font-black text-xl flex items-center justify-center shadow-md">
            {patient.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">
              {patient.name}
            </h3>
            <p className="text-xs text-teal-700 font-bold">
              {patient.age} • {patient.city}
            </p>
            <p className="text-xs text-slate-500">
              📞 {patient.phone}
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-extrabold text-xs text-slate-700 mb-1">Antécédents & Remarques :</h4>
          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl leading-relaxed">
            {patient.antecedents}
          </p>
        </div>

        <div>
          <h4 className="font-extrabold text-xs text-slate-700 mb-2">Notes de consultations précédentes :</h4>
          <div className="space-y-2">
            {patient.notes.map((n, i) => (
              <div key={i} className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl text-xs text-teal-900 flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span>{n}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          <button
            onClick={onAddNotePrompt}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            + Ajouter une note
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors shadow-md"
          >
            Fermer le dossier
          </button>
        </div>
      </div>
    </div>
  );
};
