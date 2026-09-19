'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Search,
  Plus,
  Heart,
  CheckCircle,
  FileText,
  MessageSquare,
  ChevronRight,
  User,
  MapPin,
  Phone,
  ShieldCheck,
  CalendarPlus,
  Stethoscope,
  X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { NotificationCenter } from '@/Components/NotificationCenter';

export default function PatientDashboardPage() {
  const {
    currentUser,
    patients,
    doctors,
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
          clinic: doctor?.clinicName || 'Clinique MindCare',
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

  // 4. Liste des médecins enregistrés / favoris
  const featuredDoctors = useMemo(() => {
    return doctors.slice(0, 3);
  }, [doctors]);

  // 5. Historique récapitulatif des séances passées
  const history = [
    {
      id: 'h_1',
      doctor: 'Dr. Jean Dupont',
      type: 'Consultation Suivi Général',
      date: '14 Août 2026',
      notes: 'Bilan de santé annuel parfait. Tension artérielle normale.',
    },
    {
      id: 'h_2',
      doctor: 'Dr. Marie Curie',
      type: 'Bilan Cardiaque',
      date: '02 Juillet 2026',
      notes: 'Electrocardiogramme satisfaisant. Prochain contrôle dans 3 mois.',
    },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* ── EN-TÊTE ET NOTIFICATION CENTER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900">
            Bonjour, {patientName} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bienvenue sur votre espace santé MindCare. Gérez vos consultations et vos ordonnances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un médecin, spécialité..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-64 md:w-72 shadow-sm transition-all"
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
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl text-center md:text-left z-10 relative">
          <span className="bg-teal-500/30 text-teal-200 border border-teal-400/30 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Votre santé en toute sérénité
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">
            Besoin d'une consultation médicale ?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Prenez rendez-vous en quelques clics avec l'un de nos médecins spécialisés, en cabinet ou en vidéo depuis chez vous.
          </p>
        </div>

        <div className="z-10 shrink-0">
          <a
            href="#specialists"
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs px-6 py-3.5 rounded-2xl transition-all shadow-lg hover:shadow-teal-300 hover:-translate-y-0.5"
          >
            <CalendarPlus className="w-4 h-4" />
            + Prendre un Rendez-vous
          </a>
        </div>
      </div>

      {/* ── SECTIONS EN 2 COLONNES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE (2 COLS) : PROCHAIN RDV & SÉANCES ── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CARTE PROCHAIN RENDEZ-VOUS */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Prochain Rendez-vous</h3>
                  <p className="text-[11px] text-slate-400">Votre séance médicale programmée</p>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Confirmé
              </span>
            </div>

            {/* Infos Médecin du Prochain RDV */}
            <div className="p-5 bg-teal-50/60 border border-teal-100/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <img
                  src={nextAppointment.doctorAvatar}
                  alt={nextAppointment.doctorName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md shrink-0"
                />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">
                    {nextAppointment.doctorName}
                  </h4>
                  <p className="text-xs font-bold text-teal-700 mt-0.5">
                    {nextAppointment.specialty}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {nextAppointment.clinic} • {nextAppointment.city}
                  </p>
                </div>
              </div>

              {/* Date & Heure */}
              <div className="bg-white px-4 py-3 rounded-2xl border border-teal-100 shadow-sm text-xs space-y-1 w-full sm:w-auto">
                <p className="font-extrabold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  {nextAppointment.date}
                </p>
                <p className="text-slate-600 font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  {nextAppointment.time}
                </p>
              </div>
            </div>

            {/* Boutons d'Action */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={() => alert(`Lancement de la téléconsultation vidéo avec ${nextAppointment.doctorName}...`)}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-teal-200"
              >
                <Video className="w-4 h-4" />
                Rejoindre la Téléconsultation Vidéo
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert('Demande de reprogrammation envoyée à votre médecin.')}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Reprogrammer
                </button>
                <button
                  onClick={() => alert('Votre rendez-vous a été annulé.')}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>

          {/* MES MÉDECINS TRAITANTS */}
          <div id="specialists" className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-teal-600" />
                Médecins & Spécialistes Recommandés
              </h3>
              <span className="text-xs text-slate-400 font-semibold">Disponibles aujourd'hui</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-100 hover:border-teal-200 transition-all flex flex-col justify-between space-y-4 hover:shadow-md"
                >
                  <div className="flex items-center gap-3.5">
                    {doc.avatar ? (
                      <img
                        src={doc.avatar}
                        alt={`Dr. ${doc.lastName}`}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white font-extrabold flex items-center justify-center text-base shadow-sm shrink-0">
                        {doc.firstName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs">
                        Dr. {doc.firstName} {doc.lastName}
                      </h4>
                      <p className="text-[11px] font-semibold text-teal-700 mt-0.5">
                        {doc.clinicName || 'Spécialiste MindCare'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {doc.city}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => alert(`Demande de rendez-vous ouverte avec le Dr. ${doc.lastName}.`)}
                    className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Prendre Rendez-vous
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* COLONNE DROITE (1 COL) : HISTORIQUE MÉDICAL & ORDONNANCES ── */}
        <div className="space-y-6">
          
          {/* SÉANCES PASSÉES & HISTORIQUE */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              Historique des Consultations
            </h3>

            <div className="space-y-3">
              {history.map((h) => (
                <div key={h.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-slate-900">{h.doctor}</p>
                    <span className="text-[10px] font-semibold text-slate-400">{h.date}</span>
                  </div>
                  <p className="text-[11px] font-bold text-teal-700">{h.type}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                    "{h.notes}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* SÉCURITÉ & CONFIDENTIALITÉ */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Vos données sont protégées
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Toutes vos consultations, ordonnances et échanges avec vos médecins sont strictement confidentiels et chiffrés.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
