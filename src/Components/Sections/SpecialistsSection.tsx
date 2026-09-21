'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const INITIAL_COUNT = 4;

const DoctorAvatar: React.FC<{ avatar?: string; firstName: string; className?: string }> = ({
  avatar,
  firstName,
  className = 'w-20 h-20',
}) => {
  const [failed, setFailed] = useState(false);
  const showImage = !!avatar && !failed;

  return (
    <div className={`rounded-full overflow-hidden bg-teal-400 flex items-center justify-center  shadow-md ${className}`}>
      {showImage ? (
        <Image
          src={avatar}
          alt={`Dr. ${firstName}`}
          width={80}
          height={80}
          className="w-full h-full  object-cover"
          onError={() => setFailed(true)}
          unoptimized
        />
      ) : (
        <span className="text-white font-extrabold text-2xl">
          {firstName.charAt(0)}
        </span>
      )}
    </div>
  );
};

export const SpecialistsSection: React.FC = () => {
  const { doctors, specialties } = useApp();
  const [showAll, setShowAll] = useState(false);

  const demoExtras = [
    { id: 'demo_1', firstName: 'Robert', lastName: 'Wilson', specialtyId: 'spec_1', bio: 'Médecin généraliste senior, plus de 15 ans de pratique clinique.', avatar: '/Women_of_Strength_️__Ambassadors_of_Hope-removebg-preview.png' },
    { id: 'demo_2', firstName: 'Emily', lastName: 'Davis', specialtyId: 'spec_2', bio: 'Psychologue clinicienne spécialisée dans la gestion du stress.', avatar: '/download (13).jpeg' },
    { id: 'demo_3', firstName: 'Sarah', lastName: 'Parker', specialtyId: 'spec_2', bio: "Psychiatre, spécialiste des troubles anxieux et de l'humeur.", avatar: '/download.jpeg' },
    { id: 'demo_4', firstName: 'Michael', lastName: 'Anderson', specialtyId: 'spec_1', bio: "Professeur certifié avec 20 ans d'expérience clinique.", avatar: '/download (11).jpeg' },
    { id: 'demo_5', firstName: 'Laura', lastName: 'Bennett', specialtyId: 'spec_3', bio: 'Cardiologue, suivi préventif et réhabilitation cardiaque.', avatar: '/12.jpeg' },
    { id: 'demo_6', firstName: 'David', lastName: 'Kim', specialtyId: 'spec_1', bio: 'Médecin généraliste, médecine familiale et suivi pédiatrique.', avatar: '/00.jpeg' },
    { id: 'demo_7', firstName: 'Nadia', lastName: 'Haddad', specialtyId: 'spec_2', bio: 'Thérapeute comportementale et cognitive (TCC).', avatar: '/Home (6_29).jpeg' },
    { id: 'demo_8', firstName: 'Thomas', lastName: 'Novak', specialtyId: 'spec_3', bio: 'Spécialiste en cardiologie interventionnelle.', avatar: '/15.jpeg' },
    { id: 'demo_9', firstName: 'Amara', lastName: 'Okafor', specialtyId: 'spec_2', bio: 'Psychologue, accompagnement des adolescents et des familles.', avatar: '/13.jpeg' },
  ];

  const allDoctors = [...doctors, ...demoExtras].slice(0, 10);
  const [featured, ...rest] = allDoctors;
  const visibleRest = showAll ? rest : rest.slice(0, INITIAL_COUNT - 1);

  return (
    <section id="specialists" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <p className="text-teal-500 font-semibold text-sm mb-1">Meet Our</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Expert Specialists
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured && (
            <div className="rounded-3xl p-6 bg-white shadow-md border border-slate-100 flex flex-col items-center text-center">
              <DoctorAvatar avatar={featured.avatar} firstName={featured.firstName} />
              <h3 className="font-extrabold text-slate-900 text-base mt-4">
                Dr. {featured.firstName} {featured.lastName}
              </h3>
              <p className="text-teal-500 text-xs font-semibold mt-0.5">
                Chief Doctor
              </p>
              <p className="text-slate-400 text-[11px] leading-relaxed mt-3">
                {featured.bio}
              </p>
              <button onClick={() => setShowAll((v) => !v)} className="mt-5 inline-flex items-center justify-center gap-1.5 bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs px-5 py-2.5 rounded-full transition-colors shadow-md w-full">
                See All Doctors
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {visibleRest.map((doc) => {
            const specialty = specialties.find((s) => s.id === doc.specialtyId);
            return (
              <div
                key={doc.id}
                className="rounded-3xl p-6  text-center bg-white border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex justify-center mb-4">
                  <DoctorAvatar avatar={doc.avatar} firstName={doc.firstName} className="w-24 h-24" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Dr. {doc.firstName} {doc.lastName}
                </h3>
                <p className="text-teal-500 text-xs font-semibold mt-0.5">
                  {specialty?.name ?? 'Spécialiste'}
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed mt-3 line-clamp-3">
                  {doc.bio}
                </p>
              </div>
            );
          })}
        </div>

        {allDoctors.length > INITIAL_COUNT && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowAll((v) => !v)}
              className="inline-flex items-center gap-1.5 border border-teal-300 text-teal-600 font-bold text-sm px-6 py-2.5 rounded-full hover:bg-teal-50 transition-colors"
            >
              {showAll ? 'Voir moins' : `Voir les ${allDoctors.length - INITIAL_COUNT} autres spécialistes`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};