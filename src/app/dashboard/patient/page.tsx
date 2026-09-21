'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Search,
  CheckCircle,
  MapPin,
  ShieldCheck,
  CalendarPlus,
  Stethoscope,
  X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { NotificationCenter } from '@/Components/NotificationCenter';

// Normalise une chaîne : minuscules + suppression des accents
const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Avatar avec repli sur l'initiale si l'image ne charge pas
const Avatar: React.FC<{ src?: string; name: string; className?: string }> = ({
  src,
  name,
  className = 'w-16 h-16',
}) => {
  const [failed, setFailed] = useState(false);
  const initial = name.replace(/^Dr\.\s*/, '').charAt(0);

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

export default function PatientDashboardPage() {
  const {
    currentUser,
    patients,
    doctors,
    specialties,
    appointments,
    timeSlots,
    login
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  // 1. Déterminer le patient actif
  const activePatient = useMemo(() => {
    if (currentUser && currentUser.role === 'patient') {
      return patients.find((p) => p.id === currentUser.id) || patients[0];
    }
    return patients[0];
  }, [currentUser, patients]);

  React.useEffect(() => {
    if (!currentUser && activePatient) {
      login('patient', activePatient.id);
    }
  }, [currentUser, activePatient, login]);

  // Nom du patient
  const patientName = activePatient ? `${activePatient.firstName} ${activePatient.lastName}` : 'Alice Morel';

  // 2. Extraire les rendez-vous réels du patient
  const patientAppointments = useMemo(() => {
    if (!activePatient) return [];

    return appointments
      .filter((apt) => apt.patientId === activePatient.id)
      .map((apt) => {
        const slot = timeSlots.find((s) => s.id === apt.slotId);
        const doctor = slot ? doctors.find((d) => d.id === slot.doctorId) : doctors[0];

        return {
          id: apt.id,
          doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Dr. Marie Curie',
          specialty: 'Cardiologie & Suivi général',
          date: slot ? slot.date : '2026-09-20',
          time: slot ? `${slot.startTime} - ${slot.endTime}` : '10:30',
          mode: 'En ligne (Téléconsultation)',
          status: apt.status,
          doctorAvatar: doctor?.avatar || 'https://images.unsplash.com/photo-1594824813566-7885a39644d6?w=150&auto=format&fit=crop&q=80',
          city: doctor?.city || 'Paris',
          clinic: doctor?.clinicName || 'Clinique Docpat',
        };
      });
  }, [appointments, timeSlots, doctors, activePatient]);

  // 3. Prochain rendez-vous actif (ou démo si aucun n'est réservé)
  const nextAppointment = useMemo(() => {
    if (patientAppointments.length > 0) {
      return patientAppointments[0];
    }
    return {
      id: 'demo_next_1',
      doctorName: 'Dr. Marie Curie',
      specialty: 'Cardiologie préventive',
      date: '2026-09-20',
      time: '10:30',
      mode: 'En ligne (Téléconsultation)',
      status: 'confirmed' as const,
      doctorAvatar: 'https://images.unsplash.com/photo-1594824813566-7885a39644d6?w=150&auto=format&fit=crop&q=80',
      city: 'Lyon',
      clinic: 'Centre de Cardiologie de Lyon',
    };
  }, [patientAppointments]);

  // 4. Médecins : filtrés par la recherche (nom, spécialité, bio, clinique, ville)
  //    Sans recherche, on affiche les 6 premiers (mets `doctors` pour tous les voir)
  const filteredDoctors = useMemo(() => {
    // on retire le "s" final : "généralistes" trouve aussi "généraliste"
    const q = normalize(searchQuery.trim()).replace(/s$/, '');
    if (!q) return doctors.slice(0, 6);

    return doctors.filter((d) => {
      const specialtyName = specialties.find((s) => s.id === d.specialtyId)?.name;
      return [`${d.firstName} ${d.lastName}`, specialtyName, d.bio, d.clinicName, d.city]
        .filter(Boolean)
        .some((v) => normalize(v as string).includes(q));
    });
  }, [doctors, specialties, searchQuery]);

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 w-full max-w-[1600px] mx-auto">
      {/* ── EN-TÊTE ET NOTIFICATION CENTER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900">
            Bonjour, {patientName} 
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bienvenue sur votre espace santé Docpat. Gérez vos consultations et vos ordonnances.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Barre de recherche */}
          <div className="relative flex-1 md:flex-none">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un médecin, spécialité..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                document
                  .getElementById('specialists')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="pl-9 pr-8 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-full md:w-72 shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <NotificationCenter />
        </div>
      </div>

      {/* ── BANNIÈRE BIENVENUE & ACTION RAPIDE ── */}
      <div className="bg-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl text-center md:text-left z-10 relative">
          <span className="bg-teal-700 text-teal-200 border border-teal-400/30 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Votre santé en toute sérénité
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">
            Besoin d'une consultation médicale ?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Prenez rendez-vous en quelques clics avec l'un de nos médecins spécialisés, en cabinet ou en vidéo depuis chez vous.
          </p>
        </div>

        <div className="z-10 shrink-0 w-full md:w-auto">
          <a
            href="#specialists"
            className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs px-6 py-3.5 rounded-2xl transition-all shadow-lg hover:shadow-teal-300 hover:-translate-y-0.5"
          >
            <CalendarPlus className="w-4 h-4" />
             Prendre un Rendez-vous
          </a>
        </div>
      </div>

      {/* ── CARTE PROCHAIN RENDEZ-VOUS (pleine largeur, agrandie) ── */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-sm space-y-5 sm:space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Prochain Rendez-vous</h3>
              <p className="text-xs text-slate-400">Votre séance médicale programmée</p>
            </div>
          </div>

          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            Confirmé
          </span>
        </div>

        {/* Infos Médecin du Prochain RDV */}
        <div className="p-6 bg-teal-50/60 border border-teal-100/80 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar
              src={nextAppointment.doctorAvatar}
              name={nextAppointment.doctorName}
              className="w-20 h-20 sm:w-24 sm:h-24"
            />
            <div>
              <h4 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                {nextAppointment.doctorName}
              </h4>
              <p className="text-sm font-bold text-teal-700 mt-1">
                {nextAppointment.specialty}
              </p>
              <p className="text-sm text-slate-500 mt-1.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                {nextAppointment.clinic} • {nextAppointment.city}
              </p>
            </div>
          </div>

          {/* Date & Heure */}
          <div className="bg-white px-6 py-4 rounded-2xl border border-teal-100 shadow-sm text-sm space-y-2 w-full md:w-auto md:min-w-[200px]">
            <p className="font-extrabold text-slate-900 flex items-center gap-2.5 text-base">
              <Calendar className="w-5 h-5 text-teal-600" />
              {nextAppointment.date}
            </p>
            <p className="text-slate-600 font-semibold flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-teal-600" />
              {nextAppointment.time}
            </p>
          </div>
        </div>

        {/* Boutons d'Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            onClick={() => alert(`Lancement de la téléconsultation vidéo avec ${nextAppointment.doctorName}...`)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md shadow-teal-200"
          >
            <Video className="w-5 h-5" />
            Rejoindre la Téléconsultation Vidéo
          </button>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => alert('Demande de reprogrammation envoyée à votre médecin.')}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors"
            >
              Reprogrammer
            </button>
            <button
              onClick={() => alert('Votre rendez-vous a été annulé.')}
              className="px-5 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-bold rounded-xl transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>

      {/* ── MÉDECINS & SPÉCIALISTES (pleine largeur, grandes cartes) ── */}
      <div id="specialists" className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-4">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2.5">
            <Stethoscope className="w-5 h-5 text-teal-600" />
            Médecins & Spécialistes Recommandés
          </h3>
          <span className="text-sm text-slate-400 font-semibold">
            {searchQuery.trim()
              ? `${filteredDoctors.length} résultat(s)`
              : "Disponibles aujourd'hui"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDoctors.length === 0 ? (
            <p className="text-sm text-slate-400 col-span-full text-center py-10">
              Aucun médecin trouvé pour « {searchQuery} ».
            </p>
          ) : (
            filteredDoctors.map((doc) => {
              const specialtyName = specialties.find((s) => s.id === doc.specialtyId)?.name;
              return (
                <div
                  key={doc.id}
                  className="p-6 bg-slate-50 hover:bg-white rounded-3xl border border-slate-100 hover:border-teal-200 transition-all flex flex-col justify-between gap-5 hover:shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={doc.avatar}
                      name={`${doc.firstName} ${doc.lastName}`}
                      className="w-20 h-20"
                    />
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-slate-900 text-base">
                        Dr. {doc.firstName} {doc.lastName}
                      </h4>
                      <span className="inline-block mt-1 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-full">
                        {specialtyName || 'Spécialiste Docpat'}
                      </span>
                      <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{doc.clinicName ? `${doc.clinicName} • ` : ''}{doc.city}</span>
                      </p>
                    </div>
                  </div>

                  {doc.bio && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {doc.bio}
                    </p>
                  )}

                  <button
                    onClick={() => alert(`Demande de rendez-vous ouverte avec le Dr. ${doc.lastName}.`)}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Prendre Rendez-vous
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── SÉCURITÉ & CONFIDENTIALITÉ ── */}
      <div className="bg-white rounded-3xl px-5 sm:px-8 py-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm">Vos données sont protégées</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Toutes vos consultations, ordonnances et échanges avec vos médecins sont strictement confidentiels et chiffrés.
          </p>
        </div>
      </div>
    </div>
  );
}