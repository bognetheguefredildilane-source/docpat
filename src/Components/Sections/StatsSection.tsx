'use client';

import React from 'react';
import { Star, Users, Clock, Lock } from 'lucide-react';

const stats = [
  { value: '98%',  label: 'Taux de satisfaction',  icon: Star  },
  { value: '120+', label: 'Praticiens certifiés',   icon: Users },
  { value: '24/7', label: 'Disponibilité',           icon: Clock },
  { value: '100%', label: 'Données sécurisées',      icon: Lock  },
];

export const StatsSection: React.FC = () => {
  return (
    <section className="bg-teal-600 py-10 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 text-center">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i}>
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-3xl font-extrabold text-white mb-1">{s.value}</p>
                <p className="text-sm text-teal-100 font-medium">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};