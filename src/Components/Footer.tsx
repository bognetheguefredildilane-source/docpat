'use client';

import React from 'react';
import { Camera, Globe, Heart, Mail, MessageCircle } from 'lucide-react';

const links: Record<string, string[]> = {
  Services:  ['Prise de RDV', 'Suivi médical', 'Messagerie', 'Notifications'],
  Médecins:  ['Rejoindre la plateforme', 'Gérer mes créneaux', 'Tableau de bord'],
  Légal:     ['Mentions légales', 'Confidentialité', 'CGU', 'Cookies'],
};

const socials = [
  { icon: Globe },
  { icon: Camera },
  { icon: MessageCircle },
  { icon: Mail },
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500 flex items-center justify-center font-bold text-xl">
                ✚
              </div>
              <span className="text-2xl font-extrabold">
                Doc<span className="text-teal-400">pat</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              La plateforme médicale qui simplifie votre parcours de santé, disponible 24/7.
            </p>
            <div className="flex gap-3">
              {socials.map(({ icon: Icon }, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-teal-600 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Colonnes de liens */}
          {Object.entries(links).map(([cat, items]) => (
            <div key={cat}>
              <h4 className="font-bold text-sm text-white mb-4">{cat}</h4>
              <ul className="space-y-3">
                {items.map((item, i) => (
                  <li key={i}>
                    <a href="#" className="text-slate-400 hover:text-teal-400 text-sm transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bas du footer */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} Docpat. Tous droits réservés.
          </p>
          <p className="text-slate-600 text-xs flex items-center gap-1">
            Conçu avec <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> pour votre santé
          </p>
        </div>
      </div>
    </footer>
  );
};