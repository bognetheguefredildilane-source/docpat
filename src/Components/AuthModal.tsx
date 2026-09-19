'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserType } from '@/types';
import { Stethoscope, User, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultTab = 'login' }) => {
  const { registerPatient, registerDoctor } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [selectedRole, setSelectedRole] = useState<UserType>('patient');

  // Champs de connexion
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Formulaire Patient
  const [patForm, setPatForm] = useState({
    lastName: '',
    firstName: '',
    city: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: 'homme' as 'homme' | 'femme' | 'autre',
  });

  // Formulaire Docteur
  const [docForm, setDocForm] = useState({
    lastName: '',
    firstName: '',
    city: '',
    email: '',
    password: '',
    phone: '',
    specialtyId: 'spec_1',
    clinicName: '',
    bio: '',
  });

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    
    // Logique de connexion avec email et mot de passe
    console.log('Connexion :', { role: selectedRole, email: loginEmail, password: loginPassword });
    
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'patient') {
      if (!patForm.email || !patForm.password || !patForm.firstName || !patForm.lastName) return;
      registerPatient(patForm);
    } else {
      if (!docForm.email || !docForm.password || !docForm.firstName || !docForm.lastName || !docForm.city) return;
      registerDoctor(docForm);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full p-4 sm:p-6 border border-teal-100 relative max-h-[92vh] overflow-y-auto">
        
        {/* BOUTON FERMER */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ONGLETS CONNEXION / INSCRIPTION */}
        <div className="flex bg-slate-100 p-1 rounded-xl sm:rounded-2xl mb-4">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-1.5 sm:py-2 text-xs font-bold rounded-lg sm:rounded-xl transition-all ${
              activeTab === 'login' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'
            }`}
          >
            Se connecter
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-1.5 sm:py-2 text-xs font-bold rounded-lg sm:rounded-xl transition-all ${
              activeTab === 'register' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'
            }`}
          >
            Créer un compte
          </button>
        </div>

        {/* CHOIX DE L'ESPACE (PATIENT / MÉDECIN) */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Choisir mon espace :</label>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setSelectedRole('patient')}
              className={`py-2 rounded-xl border-2 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
                selectedRole === 'patient'
                  ? 'border-teal-500 bg-teal-50 text-teal-800'
                  : 'border-slate-100 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Patient</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('doctor')}
              className={`py-2 rounded-xl border-2 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
                selectedRole === 'doctor'
                  ? 'border-teal-500 bg-teal-50 text-teal-800'
                  : 'border-slate-100 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Médecin</span>
            </button>
          </div>
        </div>

        {/* 1. ONGLET CONNEXION (EMAIL ET MOT DE PASSE) */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Adresse Email *
              </label>
              <input
                type="email"
                placeholder="votre.email@exemple.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Mot de passe *
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 sm:py-3 rounded-xl text-xs transition-colors shadow-md mt-2"
            >
              Se connecter
            </button>
          </form>
        ) : (
          /* 2. ONGLET INSCRIPTION - GRILLE RESPONSIVE */
          <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
            {selectedRole === 'patient' ? (
              // FORMULAIRE PATIENT
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Nom *"
                    value={patForm.lastName}
                    onChange={(e) => setPatForm({ ...patForm, lastName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Prénom *"
                    value={patForm.firstName}
                    onChange={(e) => setPatForm({ ...patForm, firstName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="email"
                    placeholder="Adresse Email *"
                    value={patForm.email}
                    onChange={(e) => setPatForm({ ...patForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Mot de passe *"
                    value={patForm.password}
                    onChange={(e) => setPatForm({ ...patForm, password: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Adresse / Ville *"
                    value={patForm.city}
                    onChange={(e) => setPatForm({ ...patForm, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Numéro de Téléphone"
                    value={patForm.phone}
                    onChange={(e) => setPatForm({ ...patForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </>
            ) : (
              // FORMULAIRE DOCTEUR
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Nom *"
                    value={docForm.lastName}
                    onChange={(e) => setDocForm({ ...docForm, lastName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Prénom *"
                    value={docForm.firstName}
                    onChange={(e) => setDocForm({ ...docForm, firstName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="email"
                    placeholder="Adresse Email *"
                    value={docForm.email}
                    onChange={(e) => setDocForm({ ...docForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Mot de passe *"
                    value={docForm.password}
                    onChange={(e) => setDocForm({ ...docForm, password: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Cabinet / Hôpital *"
                    value={docForm.clinicName}
                    onChange={(e) => setDocForm({ ...docForm, clinicName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Adresse / Ville *"
                    value={docForm.city}
                    onChange={(e) => setDocForm({ ...docForm, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="tel"
                    placeholder="Téléphone"
                    value={docForm.phone}
                    onChange={(e) => setDocForm({ ...docForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 sm:py-3 rounded-xl text-xs transition-colors shadow-md mt-2"
            >
              Créer mon compte
            </button>
          </form>
        )}

      </div>
    </div>
  );
};