'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  CalendarPlus,
  Stethoscope,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

// FullCalendar v7 : les plugins s'importent depuis @fullcalendar/react/*
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/react/daygrid';
import interactionPlugin from '@fullcalendar/react/interaction';
import themePlugin from '@fullcalendar/react/themes/classic';
import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/react/themes/classic/theme.css';
import '@fullcalendar/react/themes/classic/palette.css';

// ── Utilitaires ──────────────────────────────────────────────

// Minuscules + suppression des accents (pour la recherche)
const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Date du jour au format YYYY-MM-DD (heure locale)
const todayISO = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

const formatLong = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

// Avatar avec repli sur l'initiale si l'image ne charge pas
const Avatar: React.FC<{ src?: string; name: string; className?: string }> = ({
  src,
  name,
  className = 'w-16 h-16',
}) => {
  const [failed, setFailed] = useState(false);
  const initial = name.charAt(0);

  if (!src || failed) {
    return (
      <div
        className={`${className} rounded-2xl bg-teal-600 text-white font-extrabold flex items-center justify-center text-xl shadow-md shrink-0`}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setFailed(true)}
      className={`${className} rounded-2xl object-cover border-2 border-white shadow-md shrink-0`}
    />
  );
};

// ── Page ─────────────────────────────────────────────────────

export default function BookAppointmentPage() {
  const router = useRouter();
  const { currentUser, doctors, specialties, timeSlots, bookAppointment } = useApp();

  const [query, setQuery] = useState('');
  const [specialtyId, setSpecialtyId] = useState<string>('all');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState<{
    doctor: string;
    date: string;
    time: string;
  } | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Pas connecté → page de connexion
  useEffect(() => {
    if (!currentUser) router.replace('/login');
  }, [currentUser, router]);

  // Quand on choisit un médecin, on descend automatiquement vers le panneau de réservation
  useEffect(() => {
    if (selectedDoctorId) {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedDoctorId]);

  // 1. Médecins filtrés (spécialité + recherche)
  const filteredDoctors = useMemo(() => {
    const q = normalize(query.trim()).replace(/s$/, '');

    return doctors.filter((d) => {
      if (specialtyId !== 'all' && d.specialtyId !== specialtyId) return false;
      if (!q) return true;
      const specialtyName = specialties.find((s) => s.id === d.specialtyId)?.name;
      return [`${d.firstName} ${d.lastName}`, specialtyName, d.bio, d.clinicName, d.city]
        .filter(Boolean)
        .some((v) => normalize(v as string).includes(q));
    });
  }, [doctors, specialties, query, specialtyId]);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) ?? null;
  const selectedSpecialty = selectedDoctor
    ? specialties.find((s) => s.id === selectedDoctor.specialtyId)?.name
    : undefined;

  // 2. Créneaux libres du médecin choisi (à partir d'aujourd'hui)
  const doctorSlots = useMemo(() => {
    if (!selectedDoctorId) return [];
    const today = todayISO();
    return timeSlots
      .filter((s) => s.doctorId === selectedDoctorId && s.isAvailable && s.date >= today)
      .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  }, [timeSlots, selectedDoctorId]);

  const dates = useMemo(
    () => Array.from(new Set(doctorSlots.map((s) => s.date))),
    [doctorSlots]
  );

  const activeDate = selectedDate && dates.includes(selectedDate) ? selectedDate : dates[0] ?? null;
  const slotsOfDay = doctorSlots.filter((s) => s.date === activeDate);
  const selectedSlot = doctorSlots.find((s) => s.id === selectedSlotId) ?? null;

  // Pastilles dans le calendrier : "Libre" (vert) et "Choisi" (vert foncé)
  const calendarEvents = useMemo(
    () =>
      dates.map((d) => ({
        id: d,
        start: d,
        allDay: true,
        title: d === activeDate ? 'Choisi' : 'Libre',
        color: d === activeDate ? '#0f766e' : '#10b981',
        contrastColor: '#ffffff',
      })),
    [dates, activeDate]
  );

  // ── Actions ──

  // Ferme le panneau de réservation et remonte à la liste des médecins
  const handleClose = () => {
    setSelectedDoctorId(null);
    setSelectedDate(null);
    setSelectedSlotId(null);
    setReason('');
    setError('');
    setConfirmation(null);
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSelectDoctor = (id: string) => {
    // Un deuxième clic sur le médecin déjà choisi ferme le panneau
    if (id === selectedDoctorId && !confirmation) {
      handleClose();
      return;
    }
    setSelectedDoctorId(id);
    setSelectedDate(null);
    setSelectedSlotId(null);
    setError('');
    setConfirmation(null);
  };

  // Clic sur un jour (case ou pastille) : seuls les jours avec des créneaux libres sont acceptés
  const handleDayPick = (dateStr: string) => {
    if (!dates.includes(dateStr)) return;
    setSelectedDate(dateStr);
    setSelectedSlotId(null);
  };

  const handleConfirm = () => {
    setError('');
    if (!currentUser || currentUser.role !== 'patient') return;

    if (!selectedDoctor || !selectedSlot) {
      setError('Choisissez un créneau.');
      return;
    }
    if (reason.trim().length < 3) {
      setError('Indiquez le motif de la consultation.');
      return;
    }

    // ✅ Crée le rendez-vous (statut "pending") + notifie le médecin
    bookAppointment(selectedSlot.id, currentUser.id, reason.trim());

    setConfirmation({
      doctor: `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`,
      date: formatLong(selectedSlot.date),
      time: `${selectedSlot.startTime} - ${selectedSlot.endTime}`,
    });
    setSelectedSlotId(null);
    setReason('');
  };

  // Évite d'afficher la page pendant la redirection
  if (!currentUser) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 w-full max-w-[1600px] mx-auto">
      {/* ── EN-TÊTE ── */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 flex items-center gap-3">
          <CalendarPlus className="w-7 h-7 text-teal-600" />
          Prendre un rendez-vous
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Choisissez un médecin, puis un jour et un créneau disponible.
        </p>
      </div>

      {/* ── RECHERCHE, FILTRES ET LISTE DES MÉDECINS (pleine largeur) ── */}
      <div ref={listRef} className="space-y-5 scroll-mt-20 lg:scroll-mt-6">
        {/* Recherche */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un médecin, une spécialité, une ville..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-3 bg-white border border-slate-200/80 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              aria-label="Effacer la recherche"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtres par spécialité */}
        <div className="flex flex-wrap gap-2">
          {[{ id: 'all', name: 'Toutes' }, ...specialties].map((sp) => (
            <button
              key={sp.id}
              onClick={() => setSpecialtyId(sp.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${
                specialtyId === sp.id
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-700'
              }`}
            >
              {sp.name}
            </button>
          ))}
        </div>

        {/* Liste des médecins */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filteredDoctors.length === 0 ? (
            <p className="text-sm text-slate-400 col-span-full text-center py-10">
              Aucun médecin trouvé.
            </p>
          ) : (
            filteredDoctors.map((doc) => {
              const specName = specialties.find((s) => s.id === doc.specialtyId)?.name;
              const isSelected = doc.id === selectedDoctorId;
              return (
                <button
                  key={doc.id}
                  onClick={() => handleSelectDoctor(doc.id)}
                  className={`text-left p-5 rounded-3xl border transition-all flex flex-col gap-3 ${
                    isSelected
                      ? 'bg-teal-50/70 border-teal-500 ring-2 ring-teal-500/30 shadow-md'
                      : 'bg-white border-slate-200/80 hover:border-teal-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={doc.avatar}
                      name={`${doc.firstName} ${doc.lastName}`}
                      className="w-16 h-16"
                    />
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        Dr. {doc.firstName} {doc.lastName}
                      </h3>
                      <span className="inline-block mt-1 text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-full">
                        {specName || 'Spécialiste Docpat'}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {doc.clinicName ? `${doc.clinicName} • ` : ''}
                          {doc.city}
                        </span>
                      </p>
                    </div>
                  </div>
                  {doc.bio && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {doc.bio}
                    </p>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── PANNEAU DE RÉSERVATION (en bas, pleine largeur) ── */}
      {(selectedDoctor || confirmation) && (
        <div ref={panelRef} className="scroll-mt-20 lg:scroll-mt-6">
          <div className="relative bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            {/* Croix pour fermer */}
            <button
              onClick={handleClose}
              aria-label="Fermer et revenir à la liste des médecins"
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {confirmation ? (
              /* ✅ Réservation envoyée */
              <div className="max-w-md mx-auto text-center space-y-4 py-2">
                <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-900 text-lg">Demande envoyée !</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Le médecin doit maintenant confirmer votre rendez-vous.
                  </p>
                </div>
                <div className="bg-teal-50/60 border border-teal-100 rounded-2xl p-4 text-sm space-y-1.5 text-left">
                  <p className="font-extrabold text-slate-900">{confirmation.doctor}</p>
                  <p className="text-slate-600 flex items-center gap-2 capitalize">
                    <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
                    {confirmation.date}
                  </p>
                  <p className="text-slate-600 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                    {confirmation.time}
                  </p>
                  <p className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 inline-block mt-1">
                    En attente de confirmation
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link
                    href="/dashboard/patient/appointments"
                    className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm text-center"
                  >
                    Voir mes rendez-vous
                  </Link>
                  <button
                    onClick={handleClose}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                  >
                    Un autre rendez-vous
                  </button>
                </div>
              </div>
            ) : (
              selectedDoctor && (
                <>
                  {/* Médecin choisi */}
                  <div className="flex items-center gap-4 pb-5 border-b border-slate-100 pr-12">
                    <Avatar
                      src={selectedDoctor.avatar}
                      name={`${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
                      className="w-16 h-16"
                    />
                    <div className="min-w-0">
                      <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
                        Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                      </h2>
                      <p className="text-xs sm:text-sm font-semibold text-teal-700">
                        {selectedSpecialty || 'Spécialiste Docpat'}
                      </p>
                      <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {selectedDoctor.clinicName ? `${selectedDoctor.clinicName} • ` : ''}
                          {selectedDoctor.city}
                        </span>
                      </p>
                    </div>
                  </div>

                  {dates.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">
                      Aucun créneau disponible pour ce médecin.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                      {/* Colonne gauche : calendrier */}
                      <div>
                        <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-teal-600" /> Choisissez un jour
                        </p>
                        <div className="rounded-2xl border border-slate-100 bg-white p-2 overflow-hidden text-xs">
                          <FullCalendar
                            key={selectedDoctorId}
                            plugins={[themePlugin, dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            initialDate={dates[0]}
                            locale="fr"
                            firstDay={1}
                            height="auto"
                            fixedWeekCount={false}
                            headerToolbar={{ start: 'title', end: 'prev,next' }}
                            events={calendarEvents}
                            dateClick={(info: { dateStr: string }) => handleDayPick(info.dateStr)}
                            eventClick={(info: { event: { id: string } }) =>
                              handleDayPick(info.event.id)
                            }
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2">
                          Les jours marqués « Libre » ont des créneaux disponibles.
                        </p>
                      </div>

                      {/* Colonne droite : heures, motif, confirmation */}
                      <div className="space-y-5">
                        <div>
                          <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-teal-600" /> Heure
                            <span className="font-semibold text-slate-400 capitalize">
                              · {activeDate ? formatLong(activeDate) : ''}
                            </span>
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
                            {slotsOfDay.map((slot) => (
                              <button
                                key={slot.id}
                                onClick={() => setSelectedSlotId(slot.id)}
                                className={`py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                                  slot.id === selectedSlotId
                                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:text-teal-700'
                                }`}
                              >
                                {slot.startTime} - {slot.endTime}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600 mb-2 block">
                            Motif de la consultation
                          </label>
                          <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            placeholder="Ex : bilan de santé, douleurs, suivi..."
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none transition-all"
                          />
                        </div>

                        {error && (
                          <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">
                            {error}
                          </p>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={handleConfirm}
                            className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-teal-200 flex items-center justify-center gap-2"
                          >
                            <CalendarPlus className="w-4 h-4" />
                            Confirmer le rendez-vous
                          </button>
                          <button
                            onClick={handleClose}
                            className="sm:w-auto py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )
            )}
          </div>
        </div>
      )}

      {/* Aucun médecin choisi : rappel discret */}
      {!selectedDoctor && !confirmation && filteredDoctors.length > 0 && (
        <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Stethoscope className="w-4 h-4" />
          Cliquez sur un médecin pour voir ses disponibilités.
        </p>
      )}
    </div>
  );
}