'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

export const PopularServicesSection: React.FC = () => {
  return (
    <section className="py-16 md:py-20 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* En-tête */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-100/80 px-3 py-1 rounded-full">
              Équipements & Matériels
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Produits populaires aujourd'hui
            </h2>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <a href="#" className="text-teal-600 text-sm font-bold hover:underline flex items-center gap-1 group">
              <span>Tout voir</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <span className="text-slate-400 text-sm font-medium">6 sur 18</span>
          </div>
        </div>

        {/* Grille Bento Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-4 lg:h-[500px]">

          {/* Carte 1 : Gants médicaux */}
          <div className="lg:col-span-2 lg:row-span-1 bg-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between group hover:shadow-lg transition-all border border-slate-100 min-h-[220px] lg:min-h-0">
            <div className="z-10 max-w-[55%]">
              <h3 className="text-lg font-extrabold text-slate-800 leading-tight">
                Gants médicaux
              </h3>
              <a href="#" className="text-slate-400 text-xs mt-2 inline-block hover:text-teal-600 transition-colors font-medium">
                Tout voir →
              </a>
            </div>

            <div className="z-10 flex items-center justify-between mt-auto">
              <p className="text-slate-500 text-xs font-medium">
                dès <span className="text-xl font-extrabold text-slate-900">5 000 FCFA</span>
              </p>
            </div>

            <div className="absolute right-0 bottom-0 top-0 w-1/2 pointer-events-none flex items-center justify-end">
              <img
                src="/embra.png"
                alt="Gants médicaux"
                className="w-full h-full object-cover rounded-r-3xl group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Carte 2 : Analyseur H-100 */}
          <div className="lg:col-start-3 lg:row-span-2 bg-slate-50 rounded-3xl p-6 relative overflow-hidden flex flex-col group hover:shadow-lg transition-all border border-slate-200/60 min-h-[380px] lg:min-h-0">
            <div className="z-10 h-1/2 flex items-center justify-center my-2">
              <img
                src="/second.png"
                alt="Analyseur H-100"
                className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="z-10 flex flex-col justify-end h-1/2 mt-auto">
              <h3 className="text-base font-extrabold text-slate-800 leading-tight mb-1">
                Analyseur H-100
              </h3>
              <p className="text-teal-600 text-xs mb-4 font-semibold">
                Détermine jusqu'à 12 paramètres
              </p>

              <div className="flex items-center justify-between mt-auto">
                <p className="text-lg sm:text-xl font-extrabold text-slate-900">1 500 000 FCFA</p>
              </div>
            </div>
          </div>

          {/* Carte 3 : Kits chirurgicaux */}
          <div className="lg:col-start-4 lg:row-start-1 bg-teal-500 rounded-3xl p-6 relative flex flex-col justify-between group hover:shadow-lg transition-all min-h-[200px] lg:min-h-0">
            <h3 className="text-base font-extrabold text-white leading-tight">
              Kits de tenues<br />pour chirurgiens
            </h3>

            <div className="flex items-center justify-between mt-6">
              <p className="text-teal-100 text-xs font-medium">
                dès <span className="text-xl font-extrabold text-white">15 000 FCFA</span>
              </p>
            </div>
          </div>

          {/* Carte 4 : Aiguilles à usage unique */}
          <div className="lg:col-start-1 lg:row-start-2 bg-slate-900 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-end group hover:shadow-lg transition-all text-white min-h-[200px] lg:min-h-0">
            <div className="absolute inset-0 z-0">
              <img
                src="/medical.png"
                alt="Aiguilles"
                className="w-full h-full object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500"
              />
            </div>
            <div className="relative z-10 mb-2">
              <h3 className="text-base font-extrabold leading-tight">
                Aiguilles à<br />usage unique
              </h3>
            </div>

            <div className="relative z-10 flex items-center justify-between mt-auto">
              <p className="text-slate-300 text-xs font-medium">
                dès <span className="text-xl font-extrabold text-white">2 500 FCFA</span>
              </p>
            </div>
          </div>

          {/* Carte 5 : Projecteur de signes */}
          <div className="lg:col-start-2 lg:row-start-2 bg-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between group hover:shadow-lg transition-all border border-slate-100 min-h-[200px] lg:min-h-0">
            <div className="z-10 relative">
              <h3 className="text-base font-extrabold text-slate-800 leading-tight">
                Projecteur de signes<br />ACP-700 Unicos
              </h3>
            </div>

            <div className="absolute right-[-20px] bottom-2 w-[55%] pointer-events-none">
              <img
                src="/micro.png"
                alt="Projecteur"
                className="w-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="z-10 flex items-center justify-between mt-auto">
              <p className="text-sm sm:text-xl font-extrabold text-slate-900">450 000 FCFA</p>
            </div>
          </div>

          {/* Carte 6 : Trousse de secours */}
          <div className="lg:col-start-4 lg:row-start-2 bg-rose-500 rounded-3xl p-6 relative overflow-hidden group hover:shadow-lg transition-all flex flex-col justify-between text-white min-h-[200px] lg:min-h-0">
            <div className="z-10 relative">
              <h3 className="text-base font-extrabold leading-tight">
                Trousse de secours<br />d'urgence
              </h3>
            </div>

            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-80 group-hover:scale-105 transition-transform duration-500">
              <img
                src="/first.png"
                alt="Trousse de secours"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="relative z-10 flex items-center justify-between mt-auto">
              <p className="text-rose-100 text-xs font-medium">
                dès <span className="text-xl font-extrabold text-white">25 000 FCFA</span>
              </p>
            </div>
          </div>

        </div>

        {/* Mobile "Voir tout" */}
        <div className="mt-8 text-center sm:hidden">
          <a href="#" className="inline-flex items-center gap-2 text-teal-600 text-sm font-bold hover:underline">
            <span>Voir tous les produits (18)</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
};