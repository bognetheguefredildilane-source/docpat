'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Calendar, Clock, FileText, LayoutDashboard, Heart, CalendarPlus, LogOut } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const PatientSidebar = () => {
  const pathname = usePathname();
  const { logout } = useApp();

  const menuItems = [
    { label: 'Tableau de bord', href: '/dashboard/patient', icon: LayoutDashboard },
    { label: 'Prendre Rendez-vous', href: '/dashboard/patient/book', icon: CalendarPlus },
    { label: 'Mes Rendez-vous', href: '/dashboard/patient/appointments', icon: Calendar },
    { label: 'Suivi & Ordonnances', href: '/dashboard/patient/medical', icon: FileText },
    { label: 'Mon Profil', href: '/dashboard/patient/profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-teal-800 text-white min-h-screen p-4 flex flex-col justify-between shrink-0">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 px-2 pt-2">
          <div className="w-9 h-9 rounded-2xl bg-teal-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
            ✚
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            Mind<span className="text-teal-400">Care</span>
          </span>
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
      <div className="space-y-3">
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
  );
};
