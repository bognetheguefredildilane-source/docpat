'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';

export const DoctorValidationCard: React.FC = () => {
  return (
    <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm">
            Validation du Profil Partenaire
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Statut de vérification de votre compte professionnel Docpat.
          </p>
        </div>
        <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          3/3 validé
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-900">Informations personnelles</p>
            <p className="text-[10px] text-slate-500">Profil et coordonnées enregistrés</p>
          </div>
        </div>

        <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-900">Vérification du diplôme</p>
            <p className="text-[10px] text-slate-500">Document validé par Docpat</p>
          </div>
        </div>

        <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-900">Définition des disponibilités</p>
            <p className="text-[10px] text-slate-500">Créneaux activés pour les consultations</p>
          </div>
        </div>
      </div>
    </div>
  );
};
