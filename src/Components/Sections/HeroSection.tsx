'use client';

import React from 'react';
import { Phone, Calendar, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onOpenAuth?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenAuth }) => {
  return (
    <section className="relative bg-slate-50 overflow-hidden pt-5 pb-0   lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* ── GAUCHE : Textes & Actions Docpat ── */}
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 bg-teal-100/80 text-teal-800 px-3 py-1 rounded-full text-xs font-semibold">
              <span>Plateforme de santé & téléconsultation</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-teal-600 leading-tight tracking-tight">
              Bienvenue À <br />
              Votre <br />
              Nouvelle Vie.
            </h1>

            <p className="text-slate-600 text-sm sm:text-base max-w-md leading-relaxed font-medium">
              Votre santé mentale et physique représente votre bien le plus précieux. Docpat vous connecte rapidement avec des professionnels qualifiés en toute confidentialité.
            </p>

            <div className="space-y-3 pt-2 max-w-xs sm:max-w-sm">
              {/* Bouton Prendre RDV */}
              <button
                onClick={onOpenAuth}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 px-6 rounded-full shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center space-x-2 text-sm group"
              >
                <Calendar className="w-4 h-4" />
                <span>Prendre rendez-vous</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

    
            </div>
          </div>

          {/* ── DROITE : Arrière-plan Arch + Image Docteur ── */}
           <div className="relative flex justify-center lg:justify-end items-end min-h-[400px]">
            <div className="absolute bottom-0 w-[280px] sm:w-[360px] h-[340px] sm:h-[420px] bg-teal-100/70 rounded-t-full -z-0" />
            <img
              src="/download__8_-removebg-preview.png"
              alt="Docteur Docpat"
              className="relative z-10 w-[280px] sm:w-[440px] object-contain drop-shadow-xl"
            />
          </div>

        

        </div>
      </div>
    </section>
  );
};