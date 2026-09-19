'use client';

import React from 'react';
import { Bell } from 'lucide-react';

export const DoctorKeyInfoCard: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-2">
      <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3">
        Informations Clés
      </h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
          <span className="text-slate-500 font-medium">Honoraires :</span>
          <span className="font-extrabold text-slate-900">15 000 FCFA / séance</span>
        </div>

        <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
          <span className="text-slate-500 font-medium">Ordre des Médecins :</span>
          <span className="font-extrabold text-slate-900">N° 4892-CM</span>
        </div>

        <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
          <span className="text-slate-500 font-medium">Langues parlées :</span>
          <span className="font-bold text-slate-800">Français, Anglais</span>
        </div>
      </div>

     
    </div>
  );
};
