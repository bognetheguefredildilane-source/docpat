'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';

// Composants refactorisés
import { DoctorHeader } from '@/Components/dashboard/doctor/DoctorHeader';
import { DoctorBanner } from '@/Components/dashboard/doctor/DoctorBanner';
import { TodayAppointmentsWidget, TodayAppointment } from '@/Components/dashboard/doctor/TodayAppointmentsWidget';
import { DoctorKeyInfoCard } from '@/Components/dashboard/doctor/DoctorKeyInfoCard';
import { DoctorValidationCard } from '@/Components/dashboard/doctor/DoctorValidationCard';

export default function DoctorDashboardPage() {
  const {
    currentUser,
    appointments: contextAppointments,
    timeSlots,
    patients,
    doctors,
    updateAppointmentStatus,
    login,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  // 1. Déterminer le médecin actuellement connecté
  const activeDoctor = useMemo(() => {
    if (currentUser && currentUser.role === 'doctor') {
      return doctors.find((d) => d.id === currentUser.id) || doctors[0];
    }
    return doctors[0];
  }, [currentUser, doctors]);

  React.useEffect(() => {
    if (!currentUser && activeDoctor) {
      login('doctor', activeDoctor.id);
    }
  }, [currentUser, activeDoctor, login]);

  // 2. Liste de démo initiale
  const [appointmentsState, setAppointmentsState] = useState<TodayAppointment[]>([
    {
      id: 'demo_apt_1',
      patientName: 'Paul Atangana',
      type: 'Consultation Suivi',
      time: '14h00',
      date: 'Aujourd\'hui',
      mode: 'En ligne (Téléconsultation)',
      status: 'confirmed',
      avatar: 'PA',
    },
    {
      id: 'demo_apt_2',
      patientName: 'Dorine Nguema',
      type: 'Première séance',
      time: '16h30',
      date: 'Aujourd\'hui',
      mode: 'Cabinet Douala (Akwa)',
      status: 'pending',
      avatar: 'DN',
    },
  ]);

  // Synchroniser avec contextAppointments
  React.useEffect(() => {
    if (!activeDoctor) return;

    const doctorSlotIds = timeSlots
      .filter((slot) => slot.doctorId === activeDoctor.id)
      .map((slot) => slot.id);

    const fromContext = contextAppointments
      .filter((apt) => doctorSlotIds.includes(apt.slotId))
      .map((apt) => {
        const slot = timeSlots.find((s) => s.id === apt.slotId);
        const patient = patients.find((p) => p.id === apt.patientId);

        const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Patient MindCare';
        const initials = patient ? `${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}` : 'P';
        const mappedStatus: TodayAppointment['status'] =
          apt.status === 'confirmed' ? 'confirmed' : 'pending';

        return {
          id: apt.id,
          patientName,
          type: apt.reason || 'Consultation médicale',
          time: slot ? `${slot.startTime}` : '10h00',
          date: slot ? slot.date : 'Aujourd\'hui',
          mode: 'En ligne (Téléconsultation)',
          status: mappedStatus,
          avatar: initials.toUpperCase(),
        } satisfies TodayAppointment;
      });

    if (fromContext.length > 0) {
      setAppointmentsState((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newItems = fromContext.filter((fc) => !existingIds.has(fc.id));
        return [...newItems, ...prev];
      });
    }
  }, [contextAppointments, timeSlots, patients, activeDoctor]);

  // 3. Filtrage dynamique par la barre de recherche
  const filteredAppointments = useMemo(() => {
    if (!searchQuery.trim()) return appointmentsState;
    const q = searchQuery.toLowerCase().trim();
    return appointmentsState.filter(
      (apt) =>
        apt.patientName.toLowerCase().includes(q) ||
        apt.type.toLowerCase().includes(q) ||
        apt.mode.toLowerCase().includes(q)
    );
  }, [appointmentsState, searchQuery]);

  // Actions
  const handleConfirm = (aptId: string) => {
    setAppointmentsState((prev) =>
      prev.map((apt) => (apt.id === aptId ? { ...apt, status: 'confirmed' } : apt))
    );
    if (contextAppointments.some((a) => a.id === aptId)) {
      updateAppointmentStatus(aptId, 'confirmed');
    }
  };

  const handleCancel = (aptId: string) => {
    setAppointmentsState((prev) =>
      prev.map((apt) => (apt.id === aptId ? { ...apt, status: 'pending' } : apt))
    );
    if (contextAppointments.some((a) => a.id === aptId)) {
      updateAppointmentStatus(aptId, 'cancelled');
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* 1. En-tête et recherche */}
      <DoctorHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* 2. Bannière de profil médecin */}
      <DoctorBanner doctor={activeDoctor} />

      {/* 3. Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widget des RDV du jour */}
        <TodayAppointmentsWidget
          appointments={filteredAppointments}
          searchQuery={searchQuery}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onClearSearch={() => setSearchQuery('')}
        />

        {/* Carte des Informations Clés */}
        <DoctorKeyInfoCard />

        {/* Carte Validation du Profil */}
        <DoctorValidationCard />
      </div>
    </div>
  );
}