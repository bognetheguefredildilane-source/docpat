'use client';

import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { NotificationCenter } from '@/Components/NotificationCenter';

// Sous-composants refactorisés
import { AppointmentStats } from '@/Components/dashboard/appointments/AppointmentStats';
import { AppointmentFilters } from '@/Components/dashboard/appointments/AppointmentFilters';
import { AppointmentListView, AppointmentItem } from '@/Components/dashboard/appointments/AppointmentListView';
import { AppointmentCalendarView } from '@/Components/dashboard/appointments/AppointmentCalendarView';
import { ReprogramModal } from '@/Components/dashboard/appointments/ReprogramModal';
import { CreateAppointmentModal } from '@/Components/dashboard/appointments/CreateAppointmentModal';
import { PatientFileModal } from '@/Components/dashboard/appointments/PatientFileModal';
import { ConsultationNoteModal } from '@/Components/dashboard/appointments/ConsultationNoteModal';

export default function DoctorAppointmentsPage() {
  const {
    currentUser,
    appointments: contextAppointments,
    timeSlots,
    patients,
    doctors,
    updateAppointmentStatus,
    login,
  } = useApp();

  // ── ÉTATS DE NAVIGATION ET FILTRES ──
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'reprogram'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // ── ÉTATS DES MODALES ──
  const [reprogramModal, setReprogramModal] = useState({ isOpen: false, aptId: '', patientName: '' });
  const [newDate, setNewDate] = useState('2026-09-25');
  const [newTime, setNewTime] = useState('14:00');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    patientName: '',
    phone: '',
    date: '2026-09-26',
    time: '10:30',
    type: 'Première séance' as 'Suivi' | 'Première séance' | 'Bilan complet',
    location: 'En ligne (Téléconsultation)' as 'En ligne (Téléconsultation)' | 'Cabinet Douala (Akwa)',
  });

  const [patientFileModal, setPatientFileModal] = useState<{
    isOpen: boolean;
    patient: { name: string; phone: string; city: string; age: string; antecedents: string; notes: string[] } | null;
  }>({ isOpen: false, patient: null });

  const [noteModal, setNoteModal] = useState({ isOpen: false, patientName: '', noteText: '' });

  // ── MÉDECIN ACTIF ──
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

  // ── LISTE DE DONNÉES RDV ──
  const [appointmentsList, setAppointmentsList] = useState<AppointmentItem[]>([
    {
      id: 'demo_apt_1',
      patientName: 'Paul Atangana',
      phone: '06 12 34 56 78',
      city: 'Douala',
      type: 'Consultation Suivi',
      time: '14h00',
      date: '2026-09-20',
      mode: 'En ligne (Téléconsultation)',
      status: 'accepted',
      avatar: 'PA',
      notes: ['Patient régulier, tension stable.', 'Prescription renouvelée.'],
    },
    {
      id: 'demo_apt_2',
      patientName: 'Dorine Nguema',
      phone: '06 98 76 54 32',
      city: 'Yaoundé',
      type: 'Première séance',
      time: '16h30',
      date: '2026-09-20',
      mode: 'Cabinet Douala (Akwa)',
      status: 'pending',
      avatar: 'DN',
      notes: ['Première évaluation psychologique.'],
    },
    {
      id: 'demo_apt_3',
      patientName: 'Alice Morel',
      phone: '06 44 55 66 77',
      city: 'Paris',
      type: 'Thérapie de couple',
      time: '11h00',
      date: '2026-09-22',
      mode: 'En ligne (Téléconsultation)',
      status: 'reprogram',
      avatar: 'AM',
      notes: ['Demandé à changer d\'horaire pour convenance.'],
    },
  ]);

  // Sync avec contextAppointments
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

        let uiStatus: 'pending' | 'accepted' | 'reprogram' = 'pending';
        if (apt.status === 'confirmed') uiStatus = 'accepted';
        if (apt.status === 'cancelled') uiStatus = 'reprogram';

        return {
          id: apt.id,
          patientName,
          phone: patient?.phone || '06 00 00 00 00',
          city: patient?.city || 'Douala',
          type: apt.reason || 'Consultation médicale',
          time: slot ? `${slot.startTime}` : '10h00',
          date: slot ? slot.date : '2026-09-20',
          mode: 'En ligne (Téléconsultation)',
          status: uiStatus,
          avatar: initials.toUpperCase(),
        };
      });

    if (fromContext.length > 0) {
      setAppointmentsList((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newItems = fromContext.filter((fc) => !existingIds.has(fc.id));
        return [...newItems, ...prev];
      });
    }
  }, [contextAppointments, timeSlots, patients, activeDoctor]);

  // ── STATISTIQUES ──
  const stats = useMemo(() => {
    const total = appointmentsList.length;
    const accepted = appointmentsList.filter((a) => a.status === 'accepted').length;
    const pending = appointmentsList.filter((a) => a.status === 'pending').length;
    const reprogram = appointmentsList.filter((a) => a.status === 'reprogram').length;
    return { total, accepted, pending, reprogram };
  }, [appointmentsList]);

  // ── FILTRAGE DYNAMIQUE ──
  const filteredAppointments = useMemo(() => {
    return appointmentsList.filter((item) => {
      if (activeTab === 'pending' && item.status !== 'pending') return false;
      if (activeTab === 'accepted' && item.status !== 'accepted') return false;
      if (activeTab === 'reprogram' && item.status !== 'reprogram') return false;

      if (dateFilter && item.date !== dateFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.patientName.toLowerCase().includes(q);
        const matchesType = item.type.toLowerCase().includes(q);
        const matchesPhone = item.phone.toLowerCase().includes(q);
        const matchesCity = item.city.toLowerCase().includes(q);
        if (!matchesName && !matchesType && !matchesPhone && !matchesCity) return false;
      }

      return true;
    });
  }, [appointmentsList, activeTab, searchQuery, dateFilter]);

  // ── HANDLERS D'ACTIONS ──
  const handleConfirm = (aptId: string) => {
    setAppointmentsList((prev) =>
      prev.map((apt) => (apt.id === aptId ? { ...apt, status: 'accepted' } : apt))
    );
    if (contextAppointments.some((a) => a.id === aptId)) {
      updateAppointmentStatus(aptId, 'confirmed');
    }
  };

  const handleCancel = (aptId: string) => {
    setAppointmentsList((prev) =>
      prev.map((apt) => (apt.id === aptId ? { ...apt, status: 'reprogram' } : apt))
    );
    if (contextAppointments.some((a) => a.id === aptId)) {
      updateAppointmentStatus(aptId, 'cancelled');
    }
  };

  const handleSaveReprogram = (e: React.FormEvent) => {
    e.preventDefault();
    setAppointmentsList((prev) =>
      prev.map((apt) =>
        apt.id === reprogramModal.aptId
          ? { ...apt, status: 'accepted', date: newDate, time: newTime }
          : apt
      )
    );
    if (contextAppointments.some((a) => a.id === reprogramModal.aptId)) {
      updateAppointmentStatus(reprogramModal.aptId, 'confirmed');
    }
    alert(`Rendez-vous reprogrammé avec succès pour ${reprogramModal.patientName} le ${newDate} à ${newTime}.`);
    setReprogramModal({ isOpen: false, aptId: '', patientName: '' });
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.patientName || !addForm.phone) return;

    const initials = addForm.patientName
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const newApt: AppointmentItem = {
      id: `new_apt_${Date.now()}`,
      patientName: addForm.patientName,
      phone: addForm.phone,
      city: 'Douala',
      type: addForm.type,
      time: addForm.time,
      date: addForm.date,
      mode: addForm.location,
      status: 'accepted',
      avatar: initials || 'RD',
      notes: ['Rendez-vous créé directement depuis l\'agenda médecin.'],
    };

    setAppointmentsList((prev) => [newApt, ...prev]);
    setIsAddModalOpen(false);
    setAddForm({
      patientName: '',
      phone: '',
      date: '2026-09-26',
      time: '10:30',
      type: 'Première séance',
      location: 'En ligne (Téléconsultation)',
    });
  };

  const handleOpenPatientFile = (item: AppointmentItem) => {
    setPatientFileModal({
      isOpen: true,
      patient: {
        name: item.patientName,
        phone: item.phone,
        city: item.city,
        age: '34 ans',
        antecedents: 'Aucun antécédent médical lourd répertorié. Suivi régulier sur MindCare.',
        notes: item.notes || ['Consultez l\'historique des séances.'],
      },
    });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteModal.noteText) return;

    setAppointmentsList((prev) =>
      prev.map((apt) =>
        apt.patientName === noteModal.patientName
          ? { ...apt, notes: [...(apt.notes || []), noteModal.noteText] }
          : apt
      )
    );
    alert(`Note ajoutée au dossier de ${noteModal.patientName}.`);
    setNoteModal({ isOpen: false, patientName: '', noteText: '' });
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* ── EN-TÊTE ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900">
            Gestion des Rendez-vous
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez vos séances, basculez en vue calendrier ou créez un RDV direct.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition-all shadow-md shadow-teal-200"
          >
            <Plus className="w-4 h-4" />
            + Nouveau Rendez-vous
          </button>
          <NotificationCenter />
        </div>
      </div>

      {/* 1. BLOC STATISTIQUES */}
      <AppointmentStats stats={stats} />

      {/* 2. BARRE DE FILTRES ET BASCULE DE VUE */}
      <AppointmentFilters
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        stats={stats}
      />

      {/* 3. VUE PRINCIPALE : VUE LISTE OU VUE CALENDRIER */}
      {viewMode === 'list' ? (
        <AppointmentListView
          appointments={filteredAppointments}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onOpenReprogramModal={(aptId, patientName) => setReprogramModal({ isOpen: true, aptId, patientName })}
          onOpenPatientFile={handleOpenPatientFile}
          onOpenNoteModal={(patientName) => setNoteModal({ isOpen: true, patientName, noteText: '' })}
          onSendReminder={(name, phone) => alert(`SMS de rappel envoyé à ${name} (${phone})`)}
          onResetFilters={() => {
            setActiveTab('all');
            setSearchQuery('');
            setDateFilter('');
          }}
        />
      ) : (
        <AppointmentCalendarView
          appointments={filteredAppointments}
          onOpenPatientFile={handleOpenPatientFile}
        />
      )}

      {/* 4. LES MODALES DE L'APPLICATION */}
      <CreateAppointmentModal
        isOpen={isAddModalOpen}
        addForm={addForm}
        setAddForm={setAddForm}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateAppointment}
      />

      <ReprogramModal
        isOpen={reprogramModal.isOpen}
        patientName={reprogramModal.patientName}
        newDate={newDate}
        setNewDate={setNewDate}
        newTime={newTime}
        setNewTime={setNewTime}
        onClose={() => setReprogramModal({ isOpen: false, aptId: '', patientName: '' })}
        onSubmit={handleSaveReprogram}
      />

      <PatientFileModal
        isOpen={patientFileModal.isOpen}
        patient={patientFileModal.patient}
        onClose={() => setPatientFileModal({ isOpen: false, patient: null })}
        onAddNotePrompt={() => {
          const msg = prompt(`Ajouter une note pour ${patientFileModal.patient?.name} :`);
          if (msg && patientFileModal.patient) {
            const updated = [...patientFileModal.patient.notes, msg];
            setPatientFileModal({ ...patientFileModal, patient: { ...patientFileModal.patient, notes: updated } });
          }
        }}
      />

      <ConsultationNoteModal
        isOpen={noteModal.isOpen}
        patientName={noteModal.patientName}
        noteText={noteModal.noteText}
        setNoteText={(text) => setNoteModal({ ...noteModal, noteText: text })}
        onClose={() => setNoteModal({ isOpen: false, patientName: '', noteText: '' })}
        onSubmit={handleAddNote}
      />
    </div>
  );
}