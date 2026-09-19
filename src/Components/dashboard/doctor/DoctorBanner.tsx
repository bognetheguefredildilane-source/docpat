'use client';

import React from 'react';
import Link from 'next/link';
import { Doctor } from '@/types';

interface DoctorBannerProps {
  doctor: Doctor | null;
}

export const DoctorBanner: React.FC<DoctorBannerProps> = ({ doctor }) => {
  const doctorName = doctor
    ? `Dr. ${doctor.firstName} ${doctor.lastName}`
    : 'Dr. Sarah Mbarga';

  const doctorInitials = doctor
    ? `${doctor.firstName.charAt(0)}${doctor.lastName.charAt(0)}`
    : 'SM';

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-5">
        {doctor?.avatar ? (
          <img
            src={doctor.avatar}
            alt={doctorName}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-teal-200 shadow-md"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-teal-100 text-teal-800 font-extrabold flex items-center justify-center text-2xl border-2 border-teal-200 shadow-inner">
            {doctorInitials}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-900">{doctorName}</h2>
            
          </div>
          <p className="text-xs font-semibold text-teal-700 mt-0.5">
            Psychologue & Thérapeute de couple
          </p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
             {doctor?.clinicName || 'Cabinet à Douala (Akwa)'}  Consultation en ligne
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <Link
          href="/dashboard/doctor/profile"
          className="w-full md:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors text-center"
        >
          Éditer le profil
        </Link>
      </div>
    </div>
  );
};
