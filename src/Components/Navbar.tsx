'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { NotificationCenter } from './NotificationCenter';
import { AuthModal } from './AuthModal';

export const Navbar: React.FC = () => {
  const { currentUser, logout } = useApp();
  const router = useRouter();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const openLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    setAuthModalTab('login');
    setIsAuthModalOpen(true);
  };

  const openRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    setAuthModalTab('register');
    setIsAuthModalOpen(true);
  };

  const dashboardPath = currentUser?.role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-teal-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* LOGO MINDCARE */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-teal-200 group-hover:scale-105 transition-transform">
              ✚
            </div>
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Mind<span className="text-teal-600">Care</span>
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
                  onClick={logout}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-1.5 rounded-full transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={openLogin}
                  className="text-xs font-bold text-slate-700 hover:text-teal-600 px-4 py-2 rounded-full transition-colors"
                >
                  Se connecter
                </button>
                <button
                  type="button"
                  onClick={openRegister}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all shadow-md shadow-teal-200"
                >
                  Créer un compte
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* MODAL AUTHENTIFICATION */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </>
  );
};