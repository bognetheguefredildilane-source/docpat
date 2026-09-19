'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  CheckCircle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { NotificationCenter } from '@/Components/NotificationCenter';

interface Patient {
  id: string;
  name: string;
  phone: string;
  city: string;
  age: string;
  gender: string;
  antecedents: string;
  totalConsultations: number;
  lastVisit: string;
  isOnline: boolean;
  avatar: string;
  notes: string[];
}

export default function DoctorPatientsPage() {
  const { patients: contextPatients } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'regular' | 'online' | 'new'>('all');

  // Modale Fiche Médicale
  const [selectedPatientFile, setSelectedPatientFile] = useState<{
    isOpen: boolean;
    patient: Patient | null;
  }>({
    isOpen: false,
    patient: null,
  });

  // Modale Ajouter un Patient
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [addPatientForm, setAddPatientForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    city: 'Douala',
    gender: 'femme' as 'homme' | 'femme' | 'autre',
    dateOfBirth: '1995-04-12',
    notes: '',
  });

  // Modale Envoi de Message Rapide
  const [messageModal, setMessageModal] = useState<{
    isOpen: boolean;
    patientName: string;
    patientId: string;
    text: string;
  }>({
    isOpen: false,
    patientName: '',
    patientId: '',
    text: '',
  });

  // 1. Liste des patients combinant context et démo
  const [patientsList, setPatientsList] = useState<Patient[]>([
    {
      id: 'pat_1',
      name: 'Paul Atangana',
      phone: '06 12 34 56 78',
      city: 'Douala',
      age: '38 ans',
      gender: 'Homme',
      antecedents: 'Hypertension artérielle modérée, suivi cardiologique et gestion du stress professionnel.',
      totalConsultations: 6,
      lastVisit: '2026-09-14',
      isOnline: true,
      avatar: 'PA',
      notes: [
        '14/09/2026 : Très bonne évolution. Réduction de la pression artérielle.',
        '01/08/2026 : Début du suivi en gestion du stress.',
      ],
    },
    {
      id: 'pat_2',
      name: 'Dorine Nguema',
      phone: '06 98 76 54 32',
      city: 'Yaoundé',
      age: '29 ans',
      gender: 'Femme',
      antecedents: 'Anxiété sociale, insomnie récurrente.',
      totalConsultations: 3,
      lastVisit: '2026-09-10',
      isOnline: false,
      avatar: 'DN',
      notes: [
        '10/09/2026 : Exercices de relaxation respiratoire conseillés.',
      ],
    },
    {
      id: 'pat_3',
      name: 'Alice Morel',
      phone: '06 44 55 66 77',
      city: 'Paris',
      age: '32 ans',
      gender: 'Femme',
      antecedents: 'Thérapie de couple et suivi émotionnel.',
      totalConsultations: 8,
      lastVisit: '2026-09-02',
      isOnline: true,
      avatar: 'AM',
      notes: [
        '02/09/2026 : Progrès significatifs dans la communication.',
      ],
    },
    {
      id: 'pat_4',
      name: 'Thomas Bernard',
      phone: '06 11 22 33 44',
      city: 'Lyon',
      age: '45 ans',
      gender: 'Homme',
      antecedents: 'Burnout professionnel et fatigue chronique.',
      totalConsultations: 2,
      lastVisit: '2026-08-25',
      isOnline: true,
      avatar: 'TB',
      notes: [
        '25/08/2026 : Première séance bilan effectuée.',
      ],
    },
  ]);

  // Synchronisation avec le Context
  useEffect(() => {
    if (contextPatients && contextPatients.length > 0) {
      const fromContext: Patient[] = contextPatients.map((p) => {
        const initials = `${p.firstName.charAt(0)}${p.lastName.charAt(0)}`.toUpperCase();
        return {
          id: p.id,
          name: `${p.firstName} ${p.lastName}`,
          phone: p.phone || '06 00 00 00 00',
          city: p.city || 'Douala',
          age: '30 ans',
          gender: p.gender === 'femme' ? 'Femme' : 'Homme',
          antecedents: "Patient inscrit via l'application MindCare.",
          totalConsultations: 1,
          lastVisit: 'Récemment',
          isOnline: true,
          avatar: initials,
          notes: ['Patient inscrit récemment.'],
        };
      });

      setPatientsList((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const newItems = fromContext.filter((fc) => !existingIds.has(fc.id));
        return [...newItems, ...prev];
      });
    }
  }, [contextPatients]);

  // Statistiques
  const stats = useMemo(() => {
    const total = patientsList.length;
    const onlineCount = patientsList.filter((p) => p.isOnline).length;
    const regularCount = patientsList.filter((p) => p.totalConsultations >= 4).length;
    return { total, onlineCount, regularCount };
  }, [patientsList]);

  // Filtrage
  const filteredPatients = useMemo(() => {
    return patientsList.filter((p) => {
      if (activeTab === 'online' && !p.isOnline) return false;
      if (activeTab === 'regular' && p.totalConsultations < 4) return false;
      if (activeTab === 'new' && p.totalConsultations >= 3) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesPhone = p.phone.toLowerCase().includes(q);
        const matchesCity = p.city.toLowerCase().includes(q);
        const matchesNotes = p.notes.some((n) => n.toLowerCase().includes(q));
        if (!matchesName && !matchesPhone && !matchesCity && !matchesNotes) return false;
      }

      return true;
    });
  }, [patientsList, activeTab, searchQuery]);

  // Handlers
  const handleAddPatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addPatientForm.firstName || !addPatientForm.lastName) return;

    const initials = `${addPatientForm.firstName.charAt(0)}${addPatientForm.lastName.charAt(0)}`.toUpperCase();
    const fullName = `${addPatientForm.firstName} ${addPatientForm.lastName}`;

    const newPatientObj: Patient = {
      id: `pat_${Date.now()}`,
      name: fullName,
      phone: addPatientForm.phone || '06 00 00 00 00',
      city: addPatientForm.city,
      age: '30 ans',
      gender: addPatientForm.gender === 'femme' ? 'Femme' : 'Homme',
      antecedents: addPatientForm.notes || 'Nouveau patient ajouté par le médecin.',
      totalConsultations: 1,
      lastVisit: "Aujourd'hui",
      isOnline: true,
      avatar: initials,
      notes: ['Dossier initial créé.'],
    };

    setPatientsList((prev) => [newPatientObj, ...prev]);
    setIsAddPatientOpen(false);
    setAddPatientForm({
      firstName: '',
      lastName: '',
      phone: '',
      city: 'Douala',
      gender: 'femme',
      dateOfBirth: '1995-04-12',
      notes: '',
    });
  };

  const handleSendMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageModal.text.trim()) return;
    setMessageModal({ isOpen: false, patientName: '', patientId: '', text: '' });
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
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
            + Ajouter un Patient
          </button>
          <NotificationCenter />
        </div>
      </div>

      {/* STATISTIQUES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-extrabold text-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
            <p className="text-xs font-semibold text-slate-500">Patients suivis</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-700">{stats.regularCount}</p>
            <p className="text-xs font-semibold text-emerald-800">Patients réguliers (+4 séances)</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-xl">
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
          {[
            { key: 'all', label: 'Tous les patients', count: stats.total },
            { key: 'regular', label: 'Réguliers', count: stats.regularCount },
            { key: 'online', label: 'Téléconsultations', count: stats.onlineCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
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
            placeholder="Rechercher patient par nom, ville, antécédent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* GRILLE PATIENTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-teal-200 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white font-black text-lg flex items-center justify-center shadow-sm shrink-0">
                      {patient.avatar}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                        {patient.name}
                        {patient.isOnline && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Patient en ligne" />
                        )}
                      </h3>
                      <p className="text-xs font-semibold text-teal-700 mt-0.5">
                        {patient.age} • {patient.gender}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {patient.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {patient.city}
                        </span>
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-100 shrink-0">
                    {patient.totalConsultations} séance{patient.totalConsultations > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <p className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-teal-600" /> Résumé Médical & Antécédents :
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {patient.antecedents}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Dernier RDV : {patient.lastVisit}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setMessageModal({
                        isOpen: true,
                        patientName: patient.name,
                        patientId: patient.id,
                        text: '',
                      })
                    }
                    className="p-2.5 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 rounded-xl transition-colors"
                    title="Envoyer un message"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setSelectedPatientFile({ isOpen: true, patient })}
                    className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Voir Fiche
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Aucun patient trouvé</p>
            <p className="text-xs text-slate-400 mt-1">
              Aucun dossier ne correspond à votre recherche "{searchQuery}".
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
      {selectedPatientFile.isOpen && selectedPatientFile.patient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-teal-100 relative max-h-[90vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setSelectedPatientFile({ isOpen: false, patient: null })}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                {selectedPatientFile.patient.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  {selectedPatientFile.patient.name}
                </h3>
                <p className="text-xs text-teal-700 font-bold mt-0.5">
                  {selectedPatientFile.patient.age} • {selectedPatientFile.patient.gender} • {selectedPatientFile.patient.city}
                </p>
                <p className="text-xs text-slate-500 mt-1"> {selectedPatientFile.patient.phone}</p>
              </div>
            </div>

            <div>
              <h4 className="font-extrabold text-xs text-slate-800 mb-1.5">Résumé Médical & Antécédents :</h4>
              <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 leading-relaxed">
                {selectedPatientFile.patient.antecedents}
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-xs text-slate-800 mb-2">Historique des notes de consultation :</h4>
              <div className="space-y-2">
                {selectedPatientFile.patient.notes.map((n, i) => (
                  <div key={i} className="p-3 bg-teal-50/80 border border-teal-100 rounded-2xl text-xs text-teal-900 flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>{n}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setSelectedPatientFile({ isOpen: false, patient: null })}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors shadow-md"
              >
                Fermer la fiche
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE 2 : AJOUTER PATIENT */}
      {isAddPatientOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-teal-100 relative">
            <button
              onClick={() => setIsAddPatientOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Créer une Fiche Patient</h3>
                <p className="text-xs text-slate-500">Ajouter un nouveau patient à votre registre</p>
              </div>
            </div>

            <form onSubmit={handleAddPatientSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prénom </label>
                  <input
                    type="text"
                    placeholder="Prénom"
                    value={addPatientForm.firstName}
                    onChange={(e) => setAddPatientForm({ ...addPatientForm, firstName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nom </label>
                  <input
                    type="text"
                    placeholder="Nom de famille"
                    value={addPatientForm.lastName}
                    onChange={(e) => setAddPatientForm({ ...addPatientForm, lastName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone </label>
                  <input
                    type="tel"
                    placeholder="06 00 00 00 00"
                    value={addPatientForm.phone}
                    onChange={(e) => setAddPatientForm({ ...addPatientForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ville </label>
                  <input
                    type="text"
                    placeholder="Ville"
                    value={addPatientForm.city}
                    onChange={(e) => setAddPatientForm({ ...addPatientForm, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sexe </label>
                <select
                  value={addPatientForm.gender}
                  onChange={(e) => setAddPatientForm({ ...addPatientForm, gender: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="femme">Femme</option>
                  <option value="homme">Homme</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Antécédents / Notes initiales</label>
                <textarea
                  rows={3}
                  placeholder="Remarques médicales initiales..."
                  value={addPatientForm.notes}
                  onChange={(e) => setAddPatientForm({ ...addPatientForm, notes: e.target.value })}
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
                  Enregistrer le Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE 3 : ENVOYER MESSAGE */}
      {messageModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-teal-100 relative">
            <button
              onClick={() => setMessageModal({ isOpen: false, patientName: '', patientId: '', text: '' })}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Envoyer un Message</h3>
                <p className="text-xs text-slate-500">
                  Destinataire : <span className="font-bold text-teal-700">{messageModal.patientName}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleSendMessageSubmit} className="space-y-4">
              <textarea
                rows={4}
                placeholder="Rédigez votre message ou consigne de santé..."
                value={messageModal.text}
                onChange={(e) => setMessageModal({ ...messageModal, text: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setMessageModal({ isOpen: false, patientName: '', patientId: '', text: '' })}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Annuler
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
          </div>
        </div>
      )}
    </div>
  );
}