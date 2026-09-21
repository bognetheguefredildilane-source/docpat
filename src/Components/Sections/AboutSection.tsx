'use client';

import React from 'react';

const stats = [
  { value: '15+', label: "Années d'expérience au service de la santé" },
  { value: '50+', label: 'Spécialistes et praticiens certifiés disponibles' },
  { value: '10k+', label: 'Patients accompagnés à Douala et au Cameroun' },
];

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Layout Responsive: Vertical sur Mobile, Horizontal sur Tablette/Desktop */}
        <div className="flex flex-col md:flex-row items-stretch gap-8 lg:gap-12">

          {/* ── GAUCHE : Image (Pleine largeur sur mobile, 45% sur Desktop) ── */}
          <div className="w-full md:w-[45%] h-64 sm:h-80 md:h-auto rounded-2xl overflow-hidden shadow-md border border-slate-100 flex-shrink-0">
            <img
              src="/DSC_3850-1024x683.jpg"
              alt="Hôpital et centre médical à Douala"
              className="w-full h-full object-cover"
            />
          </div>

          {/* ── DROITE : Contenu & Stats ── */}
          <div className="w-full md:w-[55%] flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                À propos de nous
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mt-3">
                À Propos de Notre Centre <span className="text-teal-600">Docpat</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-3 font-medium">
                Basé à Douala, Docpat est une plateforme médicale moderne dédiée à faciliter l'accès aux soins de santé et au suivi psychologique au Cameroun. Nous connectons les patients avec des spécialistes qualifiés pour un accompagnement rapide et personnalisé.
              </p>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mt-2">
                Que ce soit pour une prise de rendez-vous en cabinet ou une téléconsultation, notre mission est de vous offrir des soins attentifs, confidentiels et adaptés à vos besoins quotidiens.
              </p>
            </div>

            {/* Grille des 3 statistiques avec effet Hover Teal */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
              {stats.map((s, i) => (
                <div
                  key={i}
                  className="group rounded-2xl p-4 bg-slate-100 border border-slate-100 text-slate-900 transition-all duration-300 hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-600/30 hover:-translate-y-1 cursor-pointer"
                >
                  <p className="text-2xl sm:text-3xl font-extrabold mb-1 text-slate-900 group-hover:text-white transition-colors">
                    {s.value}
                  </p>
                  <p className="text-xs leading-snug font-medium text-slate-500 group-hover:text-white/90 transition-colors">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};