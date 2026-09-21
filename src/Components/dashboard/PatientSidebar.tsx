'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  Calendar,
  FileText,
  LayoutDashboard,
  Heart,
  CalendarPlus,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';


export const PatientSidebar = () => {
  const pathname = usePathname();
  const { logout } = useApp();
  const [open, setOpen] = useState(false);

  const menuItems = [
    { label: 'Tableau de bord', href: '/dashboard/patient', icon: LayoutDashboard },
    { label: 'Prendre Rendez-vous', href: '/dashboard/patient/book', icon: CalendarPlus },
    { label: 'Mes Rendez-vous', href: '/dashboard/patient/appointments', icon: Calendar },
    { label: 'Mon Profil', href: '/dashboard/patient/profile', icon: User },
  ];

  // Ferme le menu mobile quand on change de page
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Ferme avec la touche Échap + bloque le scroll de la page quand le menu est ouvert
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      {/* ── Barre du haut (mobile & tablette uniquement) ── */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 bg-teal-800 text-white flex items-center justify-between px-4 shadow-md">
        <button
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          className="p-2 -ml-2 rounded-xl hover:bg-teal-700/50 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="text-lg font-extrabold tracking-tight">
          Doc<span className="text-teal-400">pat</span>
        </span>
        <div className="w-10" />
      </header>

      {/* ── Fond sombre derrière le menu (mobile) ── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar : tiroir sur mobile, fixe à gauche sur grand écran ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 lg:min-h-screen ${
          open ? 'translate-x-0' : '-translate-x-full'
        } bg-teal-800 text-white p-4 flex flex-col justify-between shrink-0 overflow-y-auto`}
      >
        <div>
          {/* Logo + bouton fermer (mobile) */}
          <div className="flex items-center gap-3 mb-8 px-2 pt-2">
            <div className="w-9 h-9 rounded-2xl bg-teal-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
              ✚
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              Doc<span className="text-teal-400">pat</span>
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer le menu"
              className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-teal-700/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dynamic Navigation */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-teal-800 shadow-md font-bold'
                      : 'text-teal-100 hover:bg-teal-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

         
        </div>

        {/* Footer Sidebar info & Logout */}
        <div className="space-y-3 mt-6">
          <div className="p-3 bg-teal-900/40 rounded-2xl text-xs border border-teal-700/40">
            <p className="font-bold text-white flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-teal-400 fill-teal-400" /> Espace Patient
            </p>
            <p className="text-teal-200 text-[11px] mt-0.5">Suivi de santé sécurisé 24/7</p>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-bold text-xs rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
};