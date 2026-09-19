'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Plus,
  Trash2,
  CheckCircle,
  Save,
  ToggleLeft,
  ToggleRight,
  X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { NotificationCenter } from '@/Components/NotificationCenter';

interface DaySchedule {
  day: string;
  active: boolean;
  morningStart: string;
  morningEnd: string;
  afternoonStart: string;
  afternoonEnd: string;
  type: string;
}

interface SlotItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  type: string;
}

export default function DoctorAvailabilitiesPage() {
  const { currentUser, doctors, timeSlots, addTimeSlot, login } = useApp();

  // 1. Déterminer le médecin actif
  const activeDoctor = useMemo(() => {
    if (currentUser && currentUser.role === 'doctor') {
      return doctors.find((d) => d.id === currentUser.id) || doctors[0];
    }
    return doctors[0];
  }, [currentUser, doctors]);

  useEffect(() => {
    if (!currentUser && activeDoctor) {
      login('doctor', activeDoctor.id);
    }
  }, [currentUser, activeDoctor, login]);

  // 2. Planning Hebdomadaire Récurrent
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([
    { day: 'Lundi', active: true, morningStart: '09:00', morningEnd: '12:00', afternoonStart: '14:00', afternoonEnd: '18:00', type: 'Cabinet & En ligne' },
    { day: 'Mardi', active: true, morningStart: '09:00', morningEnd: '12:00', afternoonStart: '14:00', afternoonEnd: '18:00', type: 'En ligne (Téléconsultation)' },
    { day: 'Mercredi', active: true, morningStart: '09:00', morningEnd: '12:00', afternoonStart: '14:00', afternoonEnd: '17:00', type: 'Cabinet Douala (Akwa)' },
    { day: 'Jeudi', active: true, morningStart: '09:00', morningEnd: '12:00', afternoonStart: '14:00', afternoonEnd: '18:00', type: 'En ligne (Téléconsultation)' },
    { day: 'Vendredi', active: true, morningStart: '09:00', morningEnd: '12:00', afternoonStart: '14:00', afternoonEnd: '16:00', type: 'Cabinet & En ligne' },
    { day: 'Samedi', active: false, morningStart: '09:00', morningEnd: '12:00', afternoonStart: '14:00', afternoonEnd: '16:00', type: 'Cabinet Douala (Akwa)' },
    { day: 'Dimanche', active: false, morningStart: '09:00', morningEnd: '12:00', afternoonStart: '14:00', afternoonEnd: '16:00', type: 'En ligne (Téléconsultation)' },
  ]);

  // 3. Créneaux réels / ponctuels de la semaine
  const [customSlots, setCustomSlots] = useState<SlotItem[]>([
    { id: 'slot_1', date: '2026-09-20', startTime: '09:00', endTime: '09:30', isAvailable: true, type: 'En ligne' },
    { id: 'slot_2', date: '2026-09-20', startTime: '10:00', endTime: '10:30', isAvailable: false, type: 'Cabinet' },
    { id: 'slot_3', date: '2026-09-20', startTime: '14:00', endTime: '14:30', isAvailable: true, type: 'En ligne' },
    { id: 'slot_4', date: '2026-09-21', startTime: '11:00', endTime: '11:30', isAvailable: true, type: 'Cabinet' },
    { id: 'slot_5', date: '2026-09-22', startTime: '16:00', endTime: '16:30', isAvailable: true, type: 'En ligne' },
  ]);

  // Synchroniser avec AppContext
  useEffect(() => {
    if (activeDoctor && timeSlots) {
      const doctorSlots = timeSlots.filter((s) => s.doctorId === activeDoctor.id);
      if (doctorSlots.length > 0) {
        const formatted: SlotItem[] = doctorSlots.map((s) => ({
          id: s.id,
          date: s.date,
          startTime: s.startTime,
          endTime: s.endTime,
          isAvailable: s.isAvailable,
          type: 'En ligne',
        }));
        setCustomSlots((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newItems = formatted.filter((f) => !existingIds.has(f.id));
          return [...newItems, ...prev];
        });
      }
    }
  }, [timeSlots, activeDoctor]);

  // Modale d'ajout
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [newSlotForm, setNewSlotForm] = useState({
    date: '2026-09-25',
    startTime: '09:30',
    endTime: '10:00',
    type: 'En ligne (Téléconsultation)',
  });

  const [isSavedAlert, setIsSavedAlert] = useState(false);

  const toggleDayActive = (index: number) => {
    setWeeklySchedule((prev) =>
      prev.map((item, i) => (i === index ? { ...item, active: !item.active } : item))
    );
  };

  const updateDaySchedule = (index: number, field: keyof DaySchedule, value: string) => {
    setWeeklySchedule((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSaveWeeklySchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  const handleAddSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotForm.date || !newSlotForm.startTime) return;

    if (activeDoctor && addTimeSlot) {
      addTimeSlot(activeDoctor.id, newSlotForm.date, newSlotForm.startTime, newSlotForm.endTime);
    }

    const newSlotObj: SlotItem = {
      id: `slot_${Date.now()}`,
      date: newSlotForm.date,
      startTime: newSlotForm.startTime,
      endTime: newSlotForm.endTime,
      isAvailable: true,
      type: newSlotForm.type.includes('ligne') ? 'En ligne' : 'Cabinet',
    };

    setCustomSlots((prev) => [newSlotObj, ...prev]);
    setIsAddSlotOpen(false);
  };

  const handleDeleteSlot = (id: string) => {
    setCustomSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleSlotAvailability = (id: string) => {
    setCustomSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isAvailable: !s.isAvailable } : s))
    );
  };

  const stats = useMemo(() => {
    const total = customSlots.length;
    const available = customSlots.filter((s) => s.isAvailable).length;
    const booked = customSlots.filter((s) => !s.isAvailable).length;
    return { total, available, booked };
  }, [customSlots]);

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* EN-TÊTE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900">
            Gestion des Disponibilités
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Définissez vos horaires d'ouverture hebdomadaires et vos créneaux de consultation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddSlotOpen(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition-all shadow-md shadow-teal-200"
          >
            <Plus className="w-4 h-4" />
             Ajouter un Créneau
          </button>
          <NotificationCenter />
        </div>
      </div>

      {/* ALERTE */}
      {isSavedAlert && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Votre planning hebdomadaire de disponibilité a été mis à jour avec succès !</span>
        </div>
      )}

      {/* STATISTIQUES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-extrabold text-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
            <p className="text-xs font-semibold text-slate-500">Créneaux configurés</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-700">{stats.available}</p>
            <p className="text-xs font-semibold text-emerald-800">Créneaux Libres (Réservables)</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-extrabold text-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-amber-700">{stats.booked}</p>
            <p className="text-xs font-semibold text-amber-800">Créneaux Occupés par des RDV</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PLANNING HEBDOMADAIRE */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                Planning Hebdomadaire Récurrent
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configurez les heures où vous recevez des consultations chaque jour.
              </p>
            </div>

            <button
              onClick={handleSaveWeeklySchedule}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-teal-200"
            >
              <Save className="w-4 h-4" />
              Sauvegarder
            </button>
          </div>

          <form onSubmit={handleSaveWeeklySchedule} className="space-y-4">
            {weeklySchedule.map((dayItem, index) => (
              <div
                key={dayItem.day}
                className={`p-4 rounded-2xl border transition-all ${
                  dayItem.active
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-slate-100/60 border-slate-200/60 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleDayActive(index)}
                      className="text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      {dayItem.active ? (
                        <ToggleRight className="w-8 h-8 text-teal-600" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-400" />
                      )}
                    </button>
                    <span className="font-extrabold text-slate-900 text-sm w-24">
                      {dayItem.day}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        dayItem.active ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {dayItem.active ? 'Ouvert' : 'Fermé'}
                    </span>
                  </div>

                  {dayItem.active ? (
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Matin:</span>
                        <input
                          type="time"
                          value={dayItem.morningStart}
                          onChange={(e) => updateDaySchedule(index, 'morningStart', e.target.value)}
                          className="bg-transparent text-slate-800 font-semibold focus:outline-none"
                        />
                        <span>-</span>
                        <input
                          type="time"
                          value={dayItem.morningEnd}
                          onChange={(e) => updateDaySchedule(index, 'morningEnd', e.target.value)}
                          className="bg-transparent text-slate-800 font-semibold focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">A.-M.:</span>
                        <input
                          type="time"
                          value={dayItem.afternoonStart}
                          onChange={(e) => updateDaySchedule(index, 'afternoonStart', e.target.value)}
                          className="bg-transparent text-slate-800 font-semibold focus:outline-none"
                        />
                        <span>-</span>
                        <input
                          type="time"
                          value={dayItem.afternoonEnd}
                          onChange={(e) => updateDaySchedule(index, 'afternoonEnd', e.target.value)}
                          className="bg-transparent text-slate-800 font-semibold focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium italic">
                      Journée de repos (aucun créneau)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </form>
        </div>

        {/* LISTE DES CRÉNEAUX */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                Créneaux de la Semaine
              </h3>
              <span className="text-xs font-semibold text-slate-400">
                {customSlots.length} créneaux
              </span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {customSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    slot.isAvailable
                      ? 'bg-slate-50 border-slate-200 hover:border-teal-200'
                      : 'bg-amber-50/70 border-amber-200/70'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      {slot.date}
                    </p>
                    <p className="text-xs text-slate-600 font-semibold mt-0.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {slot.startTime} - {slot.endTime} •{' '}
                      <span className="text-teal-700">{slot.type}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSlotAvailability(slot.id)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                        slot.isAvailable
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      }`}
                    >
                      {slot.isAvailable ? 'Libre' : 'Occupé'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Supprimer ce créneau"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODALE AJOUT DE CRÉNEAU */}
      {isAddSlotOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-teal-100 relative">
            <button
              onClick={() => setIsAddSlotOpen(false)}
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
                  Ouvrir un Créneau Horodaté
                </h3>
                <p className="text-xs text-slate-500">
                  Rendre un horaire disponible pour la réservation patient.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddSlotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date </label>
                <input
                  type="date"
                  value={newSlotForm.date}
                  onChange={(e) => setNewSlotForm({ ...newSlotForm, date: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Heure début 
                  </label>
                  <input
                    type="time"
                    value={newSlotForm.startTime}
                    onChange={(e) => setNewSlotForm({ ...newSlotForm, startTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Heure fin *
                  </label>
                  <input
                    type="time"
                    value={newSlotForm.endTime}
                    onChange={(e) => setNewSlotForm({ ...newSlotForm, endTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Type de consultation *
                </label>
                <select
                  value={newSlotForm.type}
                  onChange={(e) => setNewSlotForm({ ...newSlotForm, type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="En ligne (Téléconsultation)">En ligne (Téléconsultation)</option>
                  <option value="Cabinet Douala (Akwa)">Cabinet Douala (Akwa)</option>
                  <option value="Cabinet & En ligne">Cabinet & En ligne</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddSlotOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors shadow-md"
                >
                  Ajouter le Créneau
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}