'use client';

import React from 'react';
import { PatientSidebar } from '@/Components/dashboard/PatientSidebar';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <PatientSidebar />
      <div className="flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}
