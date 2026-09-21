'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
  FileText,
  MessageSquare,
  Video,
  X,
  UserCheck,
  Clock,
  Send,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { NotificationCenter } from '@/Components/NotificationCenter';
import {
  DEMO_DOCTOR_ID,
  GENDER_LABELS,
  fullName,
  formatDate,
  formatDateTime,
  getAge,
  getInitials,
  toGender,
  useStoreHydrated,
  usePatientStore,
  type ConsultationMode,
  type Gender,
  type Patient,
} from '@/store/patientStore';

/* ------------------------------------------------------------------ */
/* Types & constantes locales                                          */
/* ------------------------------------------------------------------ */

type Tab = 'all' | 'regular' | 'online' | 'new';

interface PatientRow {
  patient: Patient;
  name: string;
  initials: string;
  ageLabel: string;
  genderLabel: string;
  total: number;
  lastVisit: string;
  lastMode?: ConsultationMode;
  hasOnline: boolean;
  unread: number;
}

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  phone: '',
  city: 'Douala',
  gender: 'femme' as Gender,
  dateOfBirth: '',
  antecedents: '',
};

const inputClass =
  'w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none';

/* ------------------------------------------------------------------ */
/* Modale réutilisable (Échap, clic sur l'overlay, rôle dialog)        */
/* ------------------------------------------------------------------ */

function Modal({
  title,
  onClose,
  maxWidth = 'max-w-md',
  children,
}: {
  title: string;
  onClose: () => void;
  maxWidth?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-3xl shadow-2xl ${maxWidth} w-full p-6 border border-teal-100 relative max-h-[90vh] overflow-y-auto`}
      >
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function DoctorPatientsPage() {
  const { patients: contextPatients } = useApp();

  // Store partagé (source unique de vérité, lue aussi par le côté patient)
  const hydrated = useStoreHydrated();
  const patients = usePatientStore((s) => s.patients);
  const messages = usePatientStore((s) => s.messages);
  const addPatient = usePatientStore((s) => s.addPatient);
  const importPatients = usePatientStore((s) => s.importPatients);
  const addNote = usePatientStore((s) => s.addNote);
  const sendMessage = usePatientStore((s) => s.sendMessage);
  const markMessagesRead = usePatientStore((s) => s.markMessagesRead);

  // UI
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [noteShared, setNoteShared] = useState(false);

  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [addPatientForm, setAddPatientForm] = useState(EMPTY_FORM);

  const [messageTargetId, setMessageTargetId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  // Pont temporaire : les patients inscrits via AppContext arrivent dans le store
  useEffect(() => {
    if (!contextPatients || contextPatients.length === 0) return;
    importPatients(
      contextPatients.map((p) => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        phone: p.phone || '',
        city: p.city || '',
        gender: toGender(p.gender),
        dateOfBirth: (p as unknown as { dateOfBirth?: string }).dateOfBirth,
      }))
    );
  }, [contextPatients, importPatients]);

  // Lignes affichées : tout est calculé à partir du store
  const rows = useMemo<PatientRow[]>(
    () =>
      patients.map((p) => {
        const sorted = [...p.consultations].sort((a, b) => b.date.localeCompare(a.date));
        const last = sorted[0];
        const age = getAge(p.dateOfBirth);
        return {
          patient: p,
          name: fullName(p),
          initials: getInitials(p),
          ageLabel: age !== null ? `${age} ans` : 'Âge non renseigné',
          genderLabel: GENDER_LABELS[p.gender],
          total: p.consultations.length,
          lastVisit: last ? formatDate(last.date) : 'Aucun RDV',
          lastMode: last?.mode,
          hasOnline: p.consultations.some((c) => c.mode === 'online'),
          unread: messages.filter(
            (m) => m.patientId === p.id && m.from === 'patient' && !m.read
          ).length,
        };
      }),
    [patients, messages]
  );

  const stats = useMemo(
    () => ({
      total: rows.length,
      onlineCount: rows.filter((r) => r.hasOnline).length,
      regularCount: rows.filter((r) => r.total >= 4).length,
      newCount: rows.filter((r) => r.total < 3).length,
    }),
    [rows]
  );

  const filteredRows = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return rows.filter((r) => {
      if (activeTab === 'online' && !r.hasOnline) return false;
      if (activeTab === 'regular' && r.total < 4) return false;
      if (activeTab === 'new' && r.total >= 3) return false;

      if (q) {
        const p = r.patient;
        const matches =
          r.name.toLowerCase().includes(q) ||
          p.phone.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.antecedents.toLowerCase().includes(q) ||
          p.notes.some((n) => n.text.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [rows, activeTab, searchQuery]);

  const selectedRow = rows.find((r) => r.patient.id === selectedPatientId) ?? null;
  const messageTarget = rows.find((r) => r.patient.id === messageTargetId) ?? null;
  const thread = useMemo(
    () =>
      messages
        .filter((m) => m.patientId === messageTargetId)
        .sort((a, b) => a.sentAt.localeCompare(b.sentAt)),
    [messages, messageTargetId]
  );

  /* ---------------------------- Handlers ---------------------------- */

  const closeFile = () => {
    setSelectedPatientId(null);
    setNoteText('');
    setNoteShared(false);
  };

  const openMessages = (patientId: string) => {
    setMessageTargetId(patientId);
    setMessageText('');
    markMessagesRead(patientId, 'doctor');
  };

  const closeMessages = () => {
    setMessageTargetId(null);
    setMessageText('');
  };

  const handleAddPatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const firstName = addPatientForm.firstName.trim();
    const lastName = addPatientForm.lastName.trim();
    if (!firstName || !lastName) return;

    addPatient({
      ...addPatientForm,
      firstName,
      lastName,
      phone: addPatientForm.phone.trim(),
      city: addPatientForm.city.trim(),
    });
    setIsAddPatientOpen(false);
    setAddPatientForm(EMPTY_FORM);
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !noteText.trim()) return;
    addNote(selectedPatientId, noteText.trim(), DEMO_DOCTOR_ID, noteShared);
    setNoteText('');
    setNoteShared(false);
  };

  const handleSendMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageTargetId || !messageText.trim()) return;
    sendMessage(messageTargetId, 'doctor', messageText.trim());
    setMessageText('');
  };

  if (!hydrated) {
    return <div className="py-16 text-center text-xs text-slate-400">Chargement des patients…</div>;
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: 'Tous les patients', count: stats.total },
    { key: 'regular', label: 'Réguliers', count: stats.regularCount },
    { key: 'online', label: 'Téléconsultations', count: stats.onlineCount },
    { key: 'new', label: 'Nouveaux', count: stats.newCount },
  ];

  return (
    <div className="space-y-8">
      {/* EN-TÊTE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900">Mes Patients</h1>
          <p className="text-xs text-slate-500 mt-1">
            Consultez les dossiers médicaux, l'historique et la fiche de vos patients suivis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddPatientOpen(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition-all shadow-md shadow-teal-200"
          >
            <Plus className="w-4 h-4" />
            Ajouter un patient
          </button>
          <NotificationCenter />
        </div>
      </div>

      {/* STATISTIQUES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
            <p className="text-xs font-semibold text-slate-500">Patients suivis</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-700">{stats.regularCount}</p>
            <p className="text-xs font-semibold text-emerald-800">Patients réguliers (+4 séances)</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-blue-700">{stats.onlineCount}</p>
            <p className="text-xs font-semibold text-blue-800">Téléconsultations suivies</p>
          </div>
        </div>
      </div>

      {/* FILTRES & RECHERCHE */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex bg-slate-100 p-1 rounded-2xl w-full md:w-auto overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, ville, antécédent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Effacer la recherche"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* GRILLE PATIENTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRows.length > 0 ? (
          filteredRows.map((row) => (
            <div
              key={row.patient.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-teal-200 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white font-black text-lg flex items-center justify-center shadow-sm shrink-0">
                      {row.initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                        <span className="truncate">{row.name}</span>
                        {row.lastMode === 'online' && (
                          <span title="Dernière séance en téléconsultation" className="shrink-0">
                            <Video className="w-3.5 h-3.5 text-blue-500" />
                          </span>
                        )}
                      </h3>
                      <p className="text-xs font-semibold text-teal-700 mt-0.5">
                        {row.ageLabel} • {row.genderLabel}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />{' '}
                          {row.patient.phone || 'Non renseigné'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />{' '}
                          {row.patient.city || 'Non renseignée'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-100 shrink-0">
                    {row.total} séance{row.total > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <p className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-teal-600" /> Résumé médical et antécédents
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {row.patient.antecedents}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Dernier RDV : {row.lastVisit}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openMessages(row.patient.id)}
                    className="relative p-2.5 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 rounded-xl transition-colors"
                    aria-label={
                      row.unread > 0
                        ? `Messages (${row.unread} non lu${row.unread > 1 ? 's' : ''})`
                        : 'Envoyer un message'
                    }
                    title="Messages"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {row.unread > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {row.unread}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedPatientId(row.patient.id)}
                    className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Voir la fiche
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Aucun patient trouvé</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery
                ? `Aucun dossier ne correspond à « ${searchQuery} ».`
                : 'Aucun dossier dans cette catégorie.'}
            </p>
            <button
              onClick={() => {
                setActiveTab('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-700 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* MODALE 1 : FICHE MÉDICALE */}
      {selectedRow && (
        <Modal title={`Fiche de ${selectedRow.name}`} onClose={closeFile} maxWidth="max-w-lg">
          <div className="space-y-5">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4 pr-8">
              <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
                {selectedRow.initials.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-slate-900 text-lg">{selectedRow.name}</h3>
                <p className="text-xs text-teal-700 font-bold mt-0.5">
                  {selectedRow.ageLabel} • {selectedRow.genderLabel}
                  {selectedRow.patient.city ? ` • ${selectedRow.patient.city}` : ''}
                </p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {selectedRow.patient.phone || 'Non renseigné'}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-extrabold text-sm text-slate-800 mb-1.5">
                Résumé médical et antécédents
              </h4>
              <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 leading-relaxed">
                {selectedRow.patient.antecedents}
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-xs text-slate-800 mb-2">
                Historique des notes de consultation
              </h4>

              <form onSubmit={handleAddNoteSubmit} className="space-y-2 mb-3">
                <textarea
                  rows={2}
                  placeholder="Ajouter une note de consultation..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={noteShared}
                      onChange={(e) => setNoteShared(e.target.checked)}
                      className="accent-teal-600"
                    />
                    Visible par le patient
                  </label>
                  <button
                    type="submit"
                    disabled={!noteText.trim()}
                    className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    Ajouter la note
                  </button>
                </div>
              </form>

              <div className="space-y-2">
                {selectedRow.patient.notes.length === 0 ? (
                  <p className="text-xs text-slate-400">Aucune note pour ce patient.</p>
                ) : (
                  [...selectedRow.patient.notes]
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((n) => (
                      <div
                        key={n.id}
                        className="p-3 bg-teal-50/80 border border-teal-100 rounded-2xl text-xs text-teal-900 flex items-start gap-2.5"
                      >
                        <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p>
                            <span className="font-bold">{formatDate(n.date)}</span> : {n.text}
                          </p>
                          <p className="text-[10px] text-teal-700/70 mt-1">
                            {n.sharedWithPatient ? 'Visible par le patient' : 'Privée'}
                          </p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            <button
              onClick={closeFile}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors shadow-md"
            >
              Fermer la fiche
            </button>
          </div>
        </Modal>
      )}

      {/* MODALE 2 : AJOUTER UN PATIENT */}
      {isAddPatientOpen && (
        <Modal title="Créer une fiche patient" onClose={() => setIsAddPatientOpen(false)}>
          <div className="flex items-center gap-3 mb-4 pr-8">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Créer une fiche patient</h3>
              <p className="text-xs text-slate-500">Ajouter un nouveau patient à votre registre</p>
            </div>
          </div>

          <form onSubmit={handleAddPatientSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Prénom</label>
                <input
                  type="text"
                  placeholder="Prénom"
                  value={addPatientForm.firstName}
                  onChange={(e) =>
                    setAddPatientForm({ ...addPatientForm, firstName: e.target.value })
                  }
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nom</label>
                <input
                  type="text"
                  placeholder="Nom de famille"
                  value={addPatientForm.lastName}
                  onChange={(e) =>
                    setAddPatientForm({ ...addPatientForm, lastName: e.target.value })
                  }
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  placeholder="+237 6 00 00 00 00"
                  value={addPatientForm.phone}
                  onChange={(e) => setAddPatientForm({ ...addPatientForm, phone: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ville</label>
                <input
                  type="text"
                  placeholder="Ville"
                  value={addPatientForm.city}
                  onChange={(e) => setAddPatientForm({ ...addPatientForm, city: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sexe</label>
                <select
                  value={addPatientForm.gender}
                  onChange={(e) =>
                    setAddPatientForm({ ...addPatientForm, gender: e.target.value as Gender })
                  }
                  className={inputClass}
                >
                  <option value="femme">Femme</option>
                  <option value="homme">Homme</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date de naissance
                </label>
                <input
                  type="date"
                  value={addPatientForm.dateOfBirth}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) =>
                    setAddPatientForm({ ...addPatientForm, dateOfBirth: e.target.value })
                  }
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Antécédents / notes initiales
              </label>
              <textarea
                rows={3}
                placeholder="Remarques médicales initiales..."
                value={addPatientForm.antecedents}
                onChange={(e) =>
                  setAddPatientForm({ ...addPatientForm, antecedents: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setIsAddPatientOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors shadow-md"
              >
                Enregistrer le patient
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODALE 3 : MESSAGES AVEC LE PATIENT */}
      {messageTarget && (
        <Modal title={`Messages avec ${messageTarget.name}`} onClose={closeMessages}>
          <div className="flex items-center gap-3 mb-4 pr-8">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Messages</h3>
              <p className="text-xs text-slate-500">
                Patient : <span className="font-bold text-teal-700">{messageTarget.name}</span>
              </p>
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-2 mb-4 pr-1">
            {thread.length === 0 ? (
              <p className="text-xs text-slate-400">Aucun message pour l'instant.</p>
            ) : (
              thread.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.from === 'doctor' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${
                      m.from === 'doctor'
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    <p>{m.text}</p>
                    <p className="text-[10px] opacity-70 mt-1">{formatDateTime(m.sentAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendMessageSubmit} className="space-y-3">
            <textarea
              rows={3}
              placeholder="Rédigez votre message ou consigne de santé..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeMessages}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Fermer
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Envoyer
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}