'use client';

import React from 'react';
import { Search, X, Menu } from 'lucide-react';
import { NotificationCenter } from '@/Components/NotificationCenter';

interface DoctorHeaderProps {
  title?: string;
  subtitle?: string;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  onOpenMenu?: () => void; // Permet de cliquer sur le burger mobile
}

export const DoctorHeader: React.FC<DoctorHeaderProps> = ({
  title = "Espace Spécialiste",
  subtitle = "Gérez votre activité et vos consultations.",
  searchQuery,
  setSearchQuery,
  onOpenMenu,
}) => {
  return (
    <header className="flex flex-col gap-4 w-full mb-6">
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-3">
          {/* Bouton burger mobile : Ouvre la sidebar quand on clique dessus */}
          {onOpenMenu && (
            <button
              type="button"
              onClick={onOpenMenu}
              aria-label="Ouvrir le menu"
              className="md:hidden flex items-center justify-center p-2.5 bg-teal-700 text-white rounded-xl shadow-md hover:bg-teal-800 transition-all flex-shrink-0 cursor-pointer active:scale-95"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Titre et Sous-titre spécifiques à la page */}
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 hidden sm:block mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <NotificationCenter />
      </div>

      {subtitle && (
        <p className="text-xs text-slate-500 sm:hidden">{subtitle}</p>
      )}

      {/* Barre de recherche optionnelle selon la page */}
      {setSearchQuery && (
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </header>
  );
};