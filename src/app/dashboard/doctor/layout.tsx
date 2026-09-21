'use client';

import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { DoctorSidebar } from '@/Components/dashboard/DoctorSidebar';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-dvh w-full bg-slate-50 overflow-hidden">
      <DoctorSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col h-full overflow-y-auto">
        {/* Barre mobile avec bouton menu */}
        <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white/90 backdrop-blur border-b border-slate-200">
          <button
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Ouvrir le menu"
            className="p-1.5 rounded-lg text-teal-700 hover:bg-teal-50"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-teal-700">Docpat</span>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          <main className="w-full pb-10">{children}</main>
        </div>
      </div>
    </div>
  );
}