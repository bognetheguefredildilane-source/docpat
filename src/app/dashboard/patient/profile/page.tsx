'use client';

import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { useApp, useCurrentPatient } from '@/context/AppContext';
import { PageLoading, SessionMissing } from '@/Components/dashboard/patient/PatientShared';
import { getAge, initialsOf, todayISO } from '@/lib/patientUtils';

type CurrentPatient = NonNullable<ReturnType<typeof useCurrentPatient>>;

const inputBase =
  'w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none';

function ProfileForm({ patient }: { patient: CurrentPatient }) {
  const { currentUser, getMedicalRecord, updatePatient, updateAntecedents } = useApp();
  const record = getMedicalRecord(patient.id);

  // Valeurs enregistrées (elles se mettent à jour après chaque sauvegarde)
  const initial = {
    firstName: patient.firstName,
    lastName: patient.lastName,
    phone: patient.phone ?? '',
    city: patient.city ?? '',
    dateOfBirth: patient.dateOfBirth ?? '',
    gender: patient.gender,
    antecedents: record.antecedents,
  };

  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) return;

    updatePatient(patient.id, {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
    });
    updateAntecedents(patient.id, form.antecedents.trim());
    setSaved(true);
  };

  const handleReset = () => {
    setForm(initial);
    setSaved(false);
  };

  // Niveau de complétion du dossier
  const checks = [
    patient.firstName,
    patient.lastName,
    patient.phone,
    patient.city,
    patient.dateOfBirth,
  ];
  const completion = Math.round((checks.filter((v) => v && v.trim() !== '').length / checks.length) * 100);
  const age = getAge(patient.dateOfBirth);

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl lg:text-3xl font-black text-slate-900">Mon Profil</h1>
        <p className="text-xs text-slate-500 mt-1">
          Gérez vos informations personnelles et votre dossier de santé.
        </p>
      </div>

      {/* BANDEAU */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-white/15 border border-white/30 text-3xl font-black flex items-center justify-center shrink-0">
          {initialsOf(patient.firstName, patient.lastName)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-2xl font-black truncate">
              {patient.firstName} {patient.lastName}
            </h2>
            <span className="text-[11px] font-bold bg-white/15 border border-white/25 px-2.5 py-0.5 rounded-full">
              Patient
            </span>
          </div>
          <p className="text-sm font-semibold text-teal-100 mt-1">
            {age !== null ? `${age} ans` : 'Âge non renseigné'}
          </p>
          {patient.city && (
            <p className="text-sm text-teal-100/90 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {patient.city}
            </p>
          )}
        </div>

        
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* INFORMATIONS PERSONNELLES */}
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-extrabold text-base text-slate-800">Informations personnelles</h2>
            <span className="text-[11px] font-semibold text-slate-400">Champs éditables</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="firstName" className="block text-xs font-bold text-slate-700 mb-1.5">
                Prénom <span className="text-rose-500">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)}
                className={`${inputBase} px-3.5`}
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-xs font-bold text-slate-700 mb-1.5">
                Nom de famille <span className="text-rose-500">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                value={form.lastName}
                onChange={(e) => set('lastName', e.target.value)}
                className={`${inputBase} px-3.5`}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1.5">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  value={currentUser?.email ?? ''}
                  readOnly
                  disabled
                  className={`${inputBase} pl-10 pr-3.5 opacity-70 cursor-not-allowed`}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Liée à votre compte : non modifiable ici.</p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-slate-700 mb-1.5">
                Téléphone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="phone"
                  type="tel"
                  placeholder="+237 6 00 00 00 00"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  className={`${inputBase} pl-10 pr-3.5`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="dob" className="block text-xs font-bold text-slate-700 mb-1.5">
                Date de naissance
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="dob"
                  type="date"
                  max={todayISO()}
                  value={form.dateOfBirth}
                  onChange={(e) => set('dateOfBirth', e.target.value)}
                  className={`${inputBase} pl-10 pr-3.5`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="gender" className="block text-xs font-bold text-slate-700 mb-1.5">
                Sexe
              </label>
              <select
                id="gender"
                value={form.gender}
                onChange={(e) => set('gender', e.target.value as typeof form.gender)}
                className={`${inputBase} px-3.5`}
              >
                <option value="femme">Femme</option>
                <option value="homme">Homme</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="city" className="block text-xs font-bold text-slate-700 mb-1.5">
                Ville de résidence
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="city"
                  type="text"
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  className={`${inputBase} pl-10 pr-3.5`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ANTÉCÉDENTS */}
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-3">
          <h2 className="font-extrabold text-base text-slate-800">Antécédents et suivi en cours</h2>
          <textarea
            rows={4}
            placeholder="Ex. : traitements en cours, suivi particulier, difficultés rencontrées..."
            value={form.antecedents}
            onChange={(e) => set('antecedents', e.target.value)}
            className={`${inputBase} px-3.5 font-medium`}
          />
          <p className="text-[11px] text-slate-500 flex items-start gap-1.5 leading-relaxed">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
            Ces informations sont visibles par vos médecins. Il s'agit d'une démonstration :
            n'entrez pas de vraies informations de santé.
          </p>
        </section>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            type="submit"
            disabled={!dirty}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-colors shadow-md"
          >
            <Save className="w-4 h-4" />
            Enregistrer les modifications
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={!dirty}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-bold text-sm rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Annuler
          </button>
          {saved && !dirty && (
            <p role="status" className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <CheckCircle className="w-4 h-4" />
              Profil enregistré : votre médecin voit les changements.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

export default function PatientProfilePage() {
  const { ready } = useApp();
  const patient = useCurrentPatient();

  if (!ready) return <PageLoading />;
  if (!patient) return <SessionMissing />;

  // key : le formulaire repart des bonnes valeurs si un autre patient se connecte
  return <ProfileForm key={patient.id} patient={patient} />;
}