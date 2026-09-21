'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Calendar, Users, Clock, FileText, LayoutDashboard, X } from 'lucide-react';

interface DoctorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DoctorSidebar: React.FC<DoctorSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Tableau de bord', href: '/dashboard/doctor', icon: LayoutDashboard },
    { label: 'Mon Profil', href: '/dashboard/doctor/profile', icon: User },
    { label: 'Rendez-vous', href: '/dashboard/doctor/appointments', icon: Calendar },
    { label: 'Mes Patients', href: '/dashboard/doctor/patients', icon: Users },
    { label: 'Disponibilités', href: '/dashboard/doctor/availabilities', icon: Clock },
    { label: 'Documents & Diplômes', href: '/dashboard/doctor/documents', icon: FileText },
  ];

  return (
    <>
      {/* Overlay sombre sur Mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="md:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Drawer Mobile & Sidebar Desktop */}
      <aside
        className={`fixed md:static top-0 left-0 z-50 h-screen w-64 bg-teal-700 text-white p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out flex-shrink-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo & Bouton Fermer sur Mobile */}
          <div className="flex items-center justify-between mb-8 px-2 pt-2">
            <div className="flex items-center gap-3">
               <div className="w-9 h-9 rounded-2xl bg-teal-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
              ✚
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              Doc<span className="text-teal-400">pat</span>
            </span>
            </div>
            {/* Bouton de fermeture mobile */}
            <button
              onClick={onClose}
              aria-label="Fermer le menu"
              className="md:hidden text-teal-200 hover:text-white p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-teal-700 shadow-md'
                      : 'text-teal-100 hover:bg-teal-600/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-3 bg-teal-800/50 rounded-2xl text-xs border border-teal-600/30">
          <p className="font-bold text-white">Mode Démo</p>
          <p className="text-teal-200 text-[11px]">100% Client-Side (Sans Backend)</p>
        </div>
      </aside>
    </>
  );
};