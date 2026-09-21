'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  CalendarPlus,
  MapPin,
  Video,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

// ── Utilitaires ──────────────────────────────────────────────

// Date du jour au format YYYY-MM-DD (heure locale)
const todayISO = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

const formatLong = (iso: string) =>
  iso
    ? new Date(`${iso}T00:00:00`).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—';

// Avatar avec repli sur l'initiale si l'image ne charge pas
const Avatar: React.FC<{ src?: string; name: string; className?: string }> = ({
  src,
  name,
  className = 'w-16 h-16',
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`${className} rounded-2xl bg-teal-600 text-white font-extrabold flex items-center justify-center text-xl shadow-md shrink-0`}
      >
        {name.charAt(0)}
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

// Apparence de chaque statut
const STATUS_UI = {
  pending: {
    label: 'En attente',
    className: 'text-amber-700 bg-amber-50 border-amber-200',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmé',
    className: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Annulé',
    className: 'text-rose-700 bg-rose-50 border-rose-200',
    icon: XCircle,
  },
} as const;

type Status = keyof typeof STATUS_UI;
type Tab = 'upcoming' | 'past' | 'cancelled';

interface Row {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  clinic: string;
  city: string;
  avatar?: string;
  date: string;
  time: string;
  reason: string;
  status: Status;
  category: Tab;
}

// ── Page ─────────────────────────────────────────────────────

export default function PatientAppointmentsPage() {
  const router = useRouter();
  const { currentUser, appointments, timeSlots, doctors, specialties, cancelAppointment } =
    useApp();

  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  // Confirmation en 2 temps (annuler / reprogrammer) sans popup
  const [confirming, setConfirming] = useState<{ id: string; mode: 'cancel' | 'reschedule' } | null>(
    null
  );

  // Pas connecté → page de connexion
  useEffect(() => {
    if (!currentUser) router.replace('/login');
  }, [currentUser, router]);

  // 1. Rendez-vous du patient connecté, enrichis avec créneau + médecin
  const rows = useMemo<Row[]>(() => {
    if (!currentUser || currentUser.role !== 'patient') return [];
    const today = todayISO();

    return appointments
      .filter((a) => a.patientId === currentUser.id)
      .map((a) => {
        const slot = timeSlots.find((s) => s.id === a.slotId);
        const doctor = slot ? doctors.find((d) => d.id === slot.doctorId) : undefined;
        const specialty = doctor
          ? specialties.find((s) => s.id === doctor.specialtyId)?.name
          : undefined;

        const status: Status =
          a.status === 'confirmed' || a.status === 'cancelled' ? a.status : 'pending';
        const date = slot?.date ?? '';
        const category: Tab =
          status === 'cancelled' ? 'cancelled' : date >= today ? 'upcoming' : 'past';

        return {
          id: a.id,
          doctorId: doctor?.id ?? '',
          doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Médecin Docpat',
          specialty: specialty ?? 'Spécialiste Docpat',
          clinic: doctor?.clinicName ?? 'Clinique Docpat',
          city: doctor?.city ?? '',
          avatar: doctor?.avatar,
          date,
          time: slot ? `${slot.startTime} - ${slot.endTime}` : '',
          reason: a.reason,
          status,
          category,
        };
      });
  }, [appointments, timeSlots, doctors, specialties, currentUser]);

  // 2. Statistiques
  const stats = useMemo(
    () => ({
      total: rows.length,
      pending: rows.filter((r) => r.status === 'pending').length,
      confirmed: rows.filter((r) => r.status === 'confirmed').length,
      cancelled: rows.filter((r) => r.status === 'cancelled').length,
    }),
    [rows]
  );

  const counts = useMemo(
    () => ({
      upcoming: rows.filter((r) => r.category === 'upcoming').length,
      past: rows.filter((r) => r.category === 'past').length,
      cancelled: rows.filter((r) => r.category === 'cancelled').length,
    }),
    [rows]
  );

  // 3. Liste de l'onglet actif (à venir : du plus proche au plus lointain, sinon l'inverse)
  const visibleRows = useMemo(() => {
    const list = rows.filter((r) => r.category === activeTab);
    const sorted = [...list].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    return activeTab === 'upcoming' ? sorted : sorted.reverse();
  }, [rows, activeTab]);

  const today = todayISO();

  // ── Actions ──
  const handleCancel = (id: string) => {
    cancelAppointment(id);
    setConfirming(null);
  };

  // Reprogrammer = annuler ce rendez-vous puis choisir un nouveau créneau avec le même médecin
  const handleReschedule = (row: Row) => {
    cancelAppointment(row.id);
    setConfirming(null);
    router.push(`/dashboard/patient/book?doctor=${row.doctorId}`);
  };

  const handleJoin = (row: Row) => {
    alert(`Lancement de la téléconsultation vidéo avec ${row.doctorName}...`);
  };

  // Évite d'afficher la page pendant la redirection
  if (!currentUser) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'upcoming', label: 'À venir' },
    { id: 'past', label: 'Passés' },
    { id: 'cancelled', label: 'Annulés' },
  ];

  const emptyMessages: Record<Tab, string> = {
    upcoming: "Vous n'avez aucun rendez-vous à venir.",
    past: "Vous n'avez aucun rendez-vous passé.",
    cancelled: "Vous n'avez aucun rendez-vous annulé.",
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 w-full max-w-[1600px] mx-auto">
      {/* ── EN-TÊTE ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 flex items-center gap-3">
            <Calendar className="w-7 h-7 text-teal-600" />
            Mes rendez-vous
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Suivez vos consultations, annulez ou reprogrammez un rendez-vous.
          </p>
        </div>

        <Link
          href="/dashboard/patient/book"
          className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow-md shadow-teal-200"
        >
          <CalendarPlus className="w-4 h-4" />
          Prendre un rendez-vous
        </Link>
      </div>

      {/* ── STATISTIQUES ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
            <p className="text-xs font-semibold text-slate-500">Total</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-amber-700">{stats.pending}</p>
            <p className="text-xs font-semibold text-amber-800">En attente</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-700">{stats.confirmed}</p>
            <p className="text-xs font-semibold text-emerald-800">Confirmés</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-rose-700">{stats.cancelled}</p>
            <p className="text-xs font-semibold text-rose-800">Annulés</p>
          </div>
        </div>
      </div>

      {/* ── ONGLETS ── */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-2xl sm:max-w-md">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setConfirming(null);
            }}
            className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label} <span className="text-slate-400 font-semibold">({counts[tab.id]})</span>
          </button>
        ))}
      </div>

      {/* ── LISTE ── */}
      {visibleRows.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm py-14 px-6 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Calendar className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-slate-700">{emptyMessages[activeTab]}</p>
          <Link
            href="/dashboard/patient/book"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-colors shadow-md shadow-teal-200"
          >
            <CalendarPlus className="w-4 h-4" />
            Prendre un rendez-vous
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {visibleRows.map((row) => {
            const ui = STATUS_UI[row.status];
            const StatusIcon = ui.icon;
            const isUpcoming = row.category === 'upcoming';
            const canJoin = row.status === 'confirmed' && row.date === today;
            const isConfirming = confirming?.id === row.id;

            return (
              <div
                key={row.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4"
              >
                {/* Médecin + statut */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-4 min-w-0">
                    <Avatar src={row.avatar} name={row.doctorName.replace('Dr. ', '')} />
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {row.doctorName}
                      </h3>
                      <p className="text-xs font-bold text-teal-700 mt-0.5">{row.specialty}</p>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {row.clinic}
                          {row.city ? ` • ${row.city}` : ''}
                        </span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 text-[11px] font-bold px-3 py-1 rounded-full border flex items-center gap-1 ${ui.className}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    {ui.label}
                  </span>
                </div>

                {/* Date, heure, motif */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 text-xs sm:text-sm">
                  <p className="font-extrabold text-slate-900 flex items-center gap-2 capitalize">
                    <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
                    {formatLong(row.date)}
                  </p>
                  <p className="text-slate-600 font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                    {row.time}
                  </p>
                  {row.reason && (
                    <p className="text-slate-500 text-xs pt-1">
                      <span className="font-bold text-slate-600">Motif :</span> {row.reason}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {isUpcoming && !isConfirming && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    {canJoin ? (
                      <button
                        onClick={() => handleJoin(row)}
                        className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-3 rounded-xl transition-colors shadow-md shadow-teal-200"
                      >
                        <Video className="w-4 h-4" />
                        Rejoindre la téléconsultation
                      </button>
                    ) : (
                      <p className="flex-1 flex items-center text-[11px] text-slate-400">
                        {row.status === 'pending'
                          ? "En attente de la confirmation du médecin."
                          : 'La téléconsultation sera disponible le jour du rendez-vous.'}
                      </p>
                    )}
                    <div className="grid grid-cols-2 sm:flex gap-2">
                      <button
                        onClick={() => setConfirming({ id: row.id, mode: 'reschedule' })}
                        className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                      >
                        Reprogrammer
                      </button>
                      <button
                        onClick={() => setConfirming({ id: row.id, mode: 'cancel' })}
                        className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirmation en 2 temps */}
                {isUpcoming && isConfirming && confirming && (
                  <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-700">
                      {confirming.mode === 'cancel'
                        ? 'Voulez-vous vraiment annuler ce rendez-vous ? Le créneau sera libéré.'
                        : 'Ce rendez-vous sera annulé, puis vous choisirez un nouveau créneau avec le même médecin.'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() =>
                          confirming.mode === 'cancel' ? handleCancel(row.id) : handleReschedule(row)
                        }
                        className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors"
                      >
                        {confirming.mode === 'cancel' ? "Oui, annuler" : 'Oui, reprogrammer'}
                      </button>
                      <button
                        onClick={() => setConfirming(null)}
                        className="flex-1 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition-colors"
                      >
                        Non, garder
                      </button>
                    </div>
                  </div>
                )}

                {/* Passés / annulés : reprendre rendez-vous */}
                {!isUpcoming && row.doctorId && (
                  <Link
                    href={`/dashboard/patient/book?doctor=${row.doctorId}`}
                    className="flex items-center justify-center gap-2 py-3 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    Reprendre rendez-vous avec ce médecin
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}