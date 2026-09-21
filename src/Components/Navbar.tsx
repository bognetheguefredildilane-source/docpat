'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { useApp } from '@/context/AppContext';
import { NotificationCenter } from './NotificationCenter';

export const Navbar: React.FC = () => {
  const { currentUser, logout } = useApp();
  const { signOut } = useClerk();
  const router = useRouter();

  const dashboardPath = currentUser?.role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient';

  // On ferme d'abord la session Clerk, puis la session locale
  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      logout();
      router.push('/');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-teal-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* LOGO DOCPAT */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-2xl bg-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-teal-200 group-hover:scale-105 transition-transform">
            ✚
          </div>
          <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
            DOC<span className="text-teal-600">PAT</span>
          </span>
        </Link>

        {/* LIENS NAVIGATION PUBLIQUES */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
          <a href="#specialists" className="hover:text-teal-600 transition-colors">Spécialistes</a>
          <a href="#services" className="hover:text-teal-600 transition-colors">Services</a>
          <a href="#about" className="hover:text-teal-600 transition-colors">À propos</a>
          {currentUser && (
            <Link
              href={dashboardPath}
              className="text-teal-700 font-bold hover:text-teal-800 transition-colors bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-200 shadow-sm flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              Mon Dashboard ({currentUser.role === 'doctor' ? 'Médecin' : 'Patient'})
            </Link>
          )}
        </nav>

        {/* ESPACE UTILISATEUR OU BOUTONS DÉCONNECTÉ */}
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <div className="flex items-center space-x-4">
              <NotificationCenter />

              {/* Profil utilisateur cliquable -> Redirige vers le Dashboard */}
              <Link
                href={dashboardPath}
                className="flex items-center space-x-3 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-1.5 rounded-full border border-slate-200 transition-colors"
                title="Accéder à mon tableau de bord"
              >
                <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</p>
                  <span className="text-[10px] text-teal-600 font-semibold capitalize">
                    {currentUser.role === 'doctor' ? 'Médecin' : 'Patient'}
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-semibold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-1.5 rounded-full transition-colors"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/connexion"
                className="text-slate-700 hover:bg-slate-100 font-bold text-xs px-4 py-2.5 rounded-full transition-colors"
              >
                Se connecter
              </Link>
              <Link
                href="/Inscription"
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all shadow-md shadow-teal-200"
              >
                Créer un compte
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};