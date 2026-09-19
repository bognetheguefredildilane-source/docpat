'use client';

import React, { useState, useMemo } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Award,
  DollarSign,
  FileText,
  Lock,
  CheckCircle,
  Camera,
  Save,
  ShieldCheck,
  Globe,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { NotificationCenter } from '@/Components/NotificationCenter';

export default function DoctorProfilePage() {
  const { currentUser, doctors, specialties, login } = useApp();

  // 1. Déterminer le médecin actif
  const activeDoctor = useMemo(() => {
    if (currentUser && currentUser.role === 'doctor') {
      return doctors.find((d) => d.id === currentUser.id) || doctors[0];
    }
    return doctors[0];
  }, [currentUser, doctors]);

  React.useEffect(() => {
    if (!currentUser && activeDoctor) {
      login('doctor', activeDoctor.id);
    }
  }, [currentUser, activeDoctor, login]);

  // 2. État du formulaire profil
  const [profileForm, setProfileForm] = useState({
    firstName: activeDoctor?.firstName || 'Sarah',
    lastName: activeDoctor?.lastName || 'Mbarga',
    email: currentUser?.email || 'sarah.mbarga@mindcare.cm',
    phone: activeDoctor?.phone || '+237 6 98 76 54 32',
    city: activeDoctor?.city || 'Douala',
    clinicName: activeDoctor?.clinicName || 'Cabinet MindCare (Akwa)',
    specialtyId: activeDoctor?.specialtyId || 'spec_1',
    medicalOrderNo: 'N° 4892-CM',
    consultationFee: '15 000 FCFA',
    bio:
      activeDoctor?.bio ||
      'Psychologue clinicienne certifiée et thérapeute de couple avec plus de 10 ans d\'expérience dans l\'accompagnement des familles, le traitement de l\'anxiété et le suivi personnalisé.',
    isAvailable: activeDoctor?.isAvailable ?? true,
    languages: ['Français', 'Anglais'],
    avatar:
      activeDoctor?.avatar ||
      'https://images.unsplash.com/photo-1594824813566-7885a39644d6?w=200&auto=format&fit=crop&q=80',
  });

  // Mettre à jour l'état quand activeDoctor change
  React.useEffect(() => {
    if (activeDoctor) {
      setProfileForm((prev) => ({
        ...prev,
        firstName: activeDoctor.firstName,
        lastName: activeDoctor.lastName,
        phone: activeDoctor.phone,
        city: activeDoctor.city,
        clinicName: activeDoctor.clinicName,
        bio: activeDoctor.bio,
        avatar: activeDoctor.avatar || prev.avatar,
      }));
    }
  }, [activeDoctor]);

  // État de sauvegarde
  const [isSaved, setIsSaved] = useState(false);

  // État formulaire sécurité
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      alert('Les mots de passe ne correspondent pas.');
      return;
    }
    alert('Mot de passe mis à jour avec succès !');
    setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const toggleAvailability = () => {
    setProfileForm((prev) => ({ ...prev, isAvailable: !prev.isAvailable }));
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* ── EN-TÊTE DE LA PAGE ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900">
            Mon Profil Professionnel
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez vos informations personnelles, vos tarifs et vos documents d'exercice.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NotificationCenter />
        </div>
      </div>

      {/* ── BANNIÈRE PROFIL MÉDECIN AVEC PHOTO ET TOGGLE DISPONIBILITÉ ── */}
      <div className="bg-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Bulle décorative */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            {/* Avatar avec bouton édition */}
            <div className="relative group">
              <img
                src={profileForm.avatar}
                alt={`Dr. ${profileForm.lastName}`}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white/20 shadow-2xl"
              />
              <button
                type="button"
                onClick={() => {
                  const url = prompt('Entrez l\'URL de votre nouvelle photo de profil :', profileForm.avatar);
                  if (url) setProfileForm({ ...profileForm, avatar: url });
                }}
                className="absolute bottom-1 right-1 bg-teal-500 hover:bg-teal-600 text-white p-2 rounded-xl shadow-lg transition-transform hover:scale-110"
                title="Changer la photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-black">
                  Dr. {profileForm.firstName} {profileForm.lastName}
                </h2>
                <span className="bg-teal-500/30 text-teal-200 border border-teal-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {profileForm.medicalOrderNo}
                </span>
              </div>
              <p className="text-teal-200 text-xs font-semibold mt-1">
                Psychologue & Thérapeute de couple
              </p>
              <p className="text-slate-300 text-xs mt-1.5 flex items-center justify-center sm:justify-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-400" /> {profileForm.clinicName} • {profileForm.city}
              </p>
            </div>
          </div>

          {/* Interrupteur Disponibilité pour les consultations */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center justify-between gap-4 w-full md:w-auto">
            <div>
              <p className="text-xs font-bold text-white">Statut Consultation</p>
              <p className="text-[11px] text-teal-200">
                {profileForm.isAvailable ? 'Disponible pour RDV' : 'Occupé / En congé'}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleAvailability}
              className="text-teal-300 hover:text-white transition-colors"
            >
              {profileForm.isAvailable ? (
                <ToggleRight className="w-9 h-9 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-9 h-9 text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── FEEDBACK ALERTE SAUVEGARDE ── */}
      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Vos modifications de profil ont été enregistrées avec succès !</span>
        </div>
      )}

      {/* ── FORMULAIRES DE PROFIL EN DEUX COLONNES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE (2 COLS) : FORMULAIRE PRINCIPAL */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              Informations Personnelles & Professionnelles
            </h3>
            <span className="text-xs text-slate-400 font-semibold">Champs éditables</span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nom de famille *
                </label>
                <input
                  type="text"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Adresse Email Pro *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Téléphone Professionnel *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Spécialité Médicale *
                </label>
                <select
                  value={profileForm.specialtyId}
                  onChange={(e) => setProfileForm({ ...profileForm, specialtyId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {specialties.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  N° Ordre des Médecins *
                </label>
                <input
                  type="text"
                  value={profileForm.medicalOrderNo}
                  onChange={(e) => setProfileForm({ ...profileForm, medicalOrderNo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nom du Cabinet / Hôpital *
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profileForm.clinicName}
                    onChange={(e) => setProfileForm({ ...profileForm, clinicName: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ville d'exercice *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Honoraires par consultation *
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profileForm.consultationFee}
                    onChange={(e) => setProfileForm({ ...profileForm, consultationFee: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Langues parlées
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profileForm.languages.join(', ')}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        languages: e.target.value.split(',').map((l) => l.trim()),
                      })
                    }
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Présentation professionnelle (Bio) *
              </label>
              <textarea
                rows={4}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none leading-relaxed"
                required
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md shadow-teal-200"
              >
                <Save className="w-4 h-4" />
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>

   
        

      </div>
    </div>
  );
}
