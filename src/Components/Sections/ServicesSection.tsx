'use client';

import React, { useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const initialSteps = [
  {
    num: 1,
    title: 'Créez votre compte spécialiste',
    desc: 'Remplissez vos informations personnelles et professionnelles en quelques clics.',
    done: false,
  },
  {
    num: 2,
    title: 'Vérification de vos diplômes',
    desc: 'Soumettez vos justificatifs (diplômes, attestation) pour garantir la qualité de nos soins.',
    done: false,
  },
  {
    num: 3,
    title: 'Configuration de vos disponibilités',
    desc: 'Définissez vos horaires pour les consultations en cabinet à Douala ou en ligne.',
    done: false,
  },
  {
    num: 4,
    title: 'Votre profil est actif !',
    desc: 'Commencez à recevoir des demandes de rendez-vous de patients partout au Cameroun.',
    done: true,
  },
];

export const ServicesSection: React.FC = () => {
  // Gestion dynamique de l'état des étapes
  const [steps, setSteps] = useState(initialSteps);

  const toggleStep = (stepNum: number) => {
    setSteps((prevSteps) =>
      prevSteps.map((s) =>
        s.num === stepNum ? { ...s, done: !s.done } : s
      )
    );
  };

  return (
    <section className="py-16 md:py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-10 lg:gap-16">

          {/* ── GAUCHE */}
          <div className="w-full md:w-1/2 flex justify-center items-end min-h-[360px] sm:min-h-[420px] relative">
            <div className="absolute bottom-0 w-[260px] sm:w-[320px] lg:w-[360px] h-[320px] sm:h-[380px] bg-teal-100/70 rounded-t-full -z-0" />
            <img
              src="/Women_of_Strength_️__Ambassadors_of_Hope-removebg-preview.png"
              alt="Docteur Docpat"
              className="relative z-10 w-[260px] sm:w-[340px] lg:w-[460px] object-contain drop-shadow-xl"
            />
          </div>

          {/* ── DROITE */}
          <div className="w-full md:w-1/2 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-100/80 px-3 py-1 rounded-full">
                Rejoignez notre réseau
              </span>
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mt-3 leading-tight">
                Vous êtes médecin ou psychologue ? <br />
                Rejoindre Docpat est{' '}
                <span className="underline decoration-teal-500 decoration-4">très simple</span> !
              </h2>
            </div>
            <div className="relative space-y-5 pl-2 pt-2">
              <div className="absolute left-[15px] top-3 bottom-6 border-l-2 border-dashed border-teal-300" />

              {steps.map((s) => (
                <div key={s.num} className="relative flex items-start gap-4 group">
                  <button
                    type="button"
                    onClick={() => toggleStep(s.num)}
                    aria-label={`Étape ${s.num}`}
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-200 group-hover:scale-110 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      s.done
                        ? 'bg-teal-600 shadow-md shadow-teal-600/30'
                        : 'bg-white border-2 border-teal-500 text-teal-600 hover:bg-teal-50'
                    }`}
                  >
                    {s.done ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <span className="font-bold text-xs">{s.num}</span>
                    )}
                  </button>

                  <div className="cursor-pointer" onClick={() => toggleStep(s.num)}>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base select-none">{s.title}</h3>
                    <p className="text-slate-500 text-xs sm:text-sm mt-0.5 leading-relaxed select-none">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bouton d'action */}
            <div className="pt-2">
              <button className="bg-teal-600 hover:bg-teal-700 transition-all text-white font-bold px-8 py-3.5 rounded-full shadow-lg shadow-teal-600/20 flex items-center space-x-2 text-sm group">
                <span>Devenir spécialiste partenaire</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};