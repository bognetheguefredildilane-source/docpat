'use client';

import React from 'react';
import { Search, X, List, Grid } from 'lucide-react';

interface AppointmentFiltersProps {
  activeTab: 'all' | 'pending' | 'accepted' | 'reprogram';
  setActiveTab: (tab: 'all' | 'pending' | 'accepted' | 'reprogram') => void;
  viewMode: 'list' | 'calendar';
  setViewMode: (mode: 'list' | 'calendar') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  dateFilter: string;
  setDateFilter: (d: string) => void;
  stats: {
    total: number;
    accepted: number;
    pending: number;
    reprogram: number;
  };
}

export const AppointmentFilters: React.FC<AppointmentFiltersProps> = ({
  activeTab,
  setActiveTab,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  dateFilter,
  setDateFilter,
  stats,
}) => {
  return (
    <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Onglets de tri par statut */}
        <div className="flex bg-slate-100 p-1 rounded-2xl overflow-x-auto">
          {[
            { key: 'all', label: 'Tous', count: stats.total },
            { key: 'pending', label: 'En attente', count: stats.pending },
            { key: 'accepted', label: 'Acceptés', count: stats.accepted },
            { key: 'reprogram', label: 'À reprogrammer', count: stats.reprogram },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Bascule Vue Liste vs Vue Calendrier */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline">Affichage :</span>
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Vue Liste</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Vue Calendrier</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barre de recherche & Sélecteur de date */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher patient par nom / motif..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            Filtrer par date :
          </label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-rose-500 font-bold hover:underline"
            >
              Effacer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
