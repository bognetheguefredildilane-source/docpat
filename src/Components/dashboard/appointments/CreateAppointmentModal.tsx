'use client';

import React from 'react';
import { X, Plus } from 'lucide-react';

interface CreateAppointmentModalProps {
  isOpen: boolean;
  addForm: {
    patientName: string;
    phone: string;
    date: string;
    time: string;
    type: 'Suivi' | 'Première séance' | 'Bilan complet';
    location: 'En ligne (Téléconsultation)' | 'Cabinet Douala (Akwa)';
  };
  setAddForm: React.Dispatch<
    React.SetStateAction<{
      patientName: string;
      phone: string;
      date: string;
      time: string;
      type: 'Suivi' | 'Première séance' | 'Bilan complet';
      location: 'En ligne (Téléconsultation)' | 'Cabinet Douala (Akwa)';
    }>
  >;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({
  isOpen,
  addForm,
  setAddForm,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-teal-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Nouveau Rendez-vous
            </h3>
            <p className="text-xs text-slate-500">Inscrire un patient manuellement</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nom du patient *
            </label>
            <input
              type="text"
              placeholder="ex: Jean Dupont"
              value={addForm.patientName}
              onChange={(e) => setAddForm({ ...addForm, patientName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Téléphone du patient 
            </label>
            <input
              type="tel"
              placeholder="ex: 06 12 34 56 78"
              value={addForm.phone}
              onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date </label>
              <input
                type="date"
                value={addForm.date}
                onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Heure </label>
              <input
                type="time"
                value={addForm.time}
                onChange={(e) => setAddForm({ ...addForm, time: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Type de consultation *
            </label>
            <select
              value={addForm.type}
              onChange={(e) => setAddForm({ ...addForm, type: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="Suivi">Suivi régulier</option>
              <option value="Première séance">Première séance d'évaluation</option>
              <option value="Bilan complet">Bilan complet</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Lieu / Mode *
            </label>
            <select
              value={addForm.location}
              onChange={(e) => setAddForm({ ...addForm, location: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="En ligne (Téléconsultation)">En ligne (Téléconsultation)</option>
              <option value="Cabinet Douala (Akwa)">Cabinet Douala (Akwa)</option>
            </select>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors shadow-md"
            >
              Créer le RDV
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
