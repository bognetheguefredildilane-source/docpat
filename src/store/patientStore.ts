'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type Gender = 'femme' | 'homme' | 'autre';
export type ConsultationMode = 'online' | 'presential';
export type MessageAuthor = 'doctor' | 'patient';

export interface PatientNote {
  id: string;
  date: string; // AAAA-MM-JJ
  text: string;
  doctorId: string;
  sharedWithPatient: boolean;
}

export interface Consultation {
  id: string;
  date: string; // AAAA-MM-JJ
  mode: ConsultationMode;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  gender: Gender;
  dateOfBirth?: string; // AAAA-MM-JJ
  antecedents: string;
  notes: PatientNote[];
  consultations: Consultation[];
}

export interface PatientMessage {
  id: string;
  patientId: string;
  from: MessageAuthor;
  text: string;
  sentAt: string; // ISO complet
  read: boolean;
}

export interface NewPatientInput {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  gender: Gender;
  dateOfBirth?: string;
  antecedents?: string;
}

export type ImportedPatient = Pick<
  Patient,
  'id' | 'firstName' | 'lastName' | 'phone' | 'city' | 'gender'
> & { dateOfBirth?: string; antecedents?: string };

/* ------------------------------------------------------------------ */
/* Helpers (utilisables des deux côtés)                                */
/* ------------------------------------------------------------------ */

export const DEMO_DOCTOR_ID = 'doc_1';

export const GENDER_LABELS: Record<Gender, string> = {
  femme: 'Femme',
  homme: 'Homme',
  autre: 'Autre',
};

export function toGender(value: unknown): Gender {
  const g = String(value);
  if (g === 'femme') return 'femme';
  if (g === 'autre') return 'autre';
  return 'homme';
}

export function fullName(p: Pick<Patient, 'firstName' | 'lastName'>): string {
  return `${p.firstName} ${p.lastName}`.trim();
}

export function getInitials(p: Pick<Patient, 'firstName' | 'lastName'>): string {
  return `${p.firstName.charAt(0)}${p.lastName.charAt(0)}`.toUpperCase();
}

export function getAge(dateOfBirth?: string): number | null {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

/** "2026-09-14" -> "14/09/2026" */
export function formatDate(isoDate: string): string {
  return isoDate.slice(0, 10).split('-').reverse().join('/');
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const todayISO = () => new Date().toISOString().slice(0, 10);
const newId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const consultationsFrom = (dates: string[], mode: ConsultationMode): Consultation[] =>
  dates.map((date, i) => ({ id: `c_${mode}_${date}_${i}`, date, mode }));

/* ------------------------------------------------------------------ */
/* Données de démonstration                                            */
/* ------------------------------------------------------------------ */

const SEED_PATIENTS: Patient[] = [
  {
    id: 'pat_1',
    firstName: 'Paul',
    lastName: 'Atangana',
    phone: '06 12 34 56 78',
    city: 'Douala',
    gender: 'homme',
    dateOfBirth: '1988-03-12',
    antecedents:
      'Hypertension artérielle modérée, suivi cardiologique et gestion du stress professionnel.',
    notes: [
      {
        id: 'n_1a',
        date: '2026-09-14',
        text: 'Très bonne évolution. Réduction de la pression artérielle.',
        doctorId: DEMO_DOCTOR_ID,
        sharedWithPatient: false,
      },
      {
        id: 'n_1b',
        date: '2026-08-01',
        text: 'Début du suivi en gestion du stress.',
        doctorId: DEMO_DOCTOR_ID,
        sharedWithPatient: false,
      },
    ],
    consultations: consultationsFrom(
      ['2026-09-14', '2026-08-31', '2026-08-17', '2026-08-01', '2026-07-15', '2026-07-01'],
      'online'
    ),
  },
  {
    id: 'pat_2',
    firstName: 'Dorine',
    lastName: 'Nguema',
    phone: '06 98 76 54 32',
    city: 'Yaoundé',
    gender: 'femme',
    dateOfBirth: '1997-06-20',
    antecedents: 'Anxiété sociale, insomnie récurrente.',
    notes: [
      {
        id: 'n_2a',
        date: '2026-09-10',
        text: 'Exercices de relaxation respiratoire conseillés.',
        doctorId: DEMO_DOCTOR_ID,
        sharedWithPatient: false,
      },
    ],
    consultations: consultationsFrom(['2026-09-10', '2026-08-27', '2026-08-13'], 'presential'),
  },
  {
    id: 'pat_3',
    firstName: 'Alice',
    lastName: 'Morel',
    phone: '06 44 55 66 77',
    city: 'Paris',
    gender: 'femme',
    dateOfBirth: '1994-01-15',
    antecedents: 'Thérapie de couple et suivi émotionnel.',
    notes: [
      {
        id: 'n_3a',
        date: '2026-09-02',
        text: 'Progrès significatifs dans la communication.',
        doctorId: DEMO_DOCTOR_ID,
        sharedWithPatient: false,
      },
    ],
    consultations: consultationsFrom(
      [
        '2026-09-02',
        '2026-08-19',
        '2026-08-05',
        '2026-07-22',
        '2026-07-08',
        '2026-06-24',
        '2026-06-10',
        '2026-05-27',
      ],
      'online'
    ),
  },
  {
    id: 'pat_4',
    firstName: 'Thomas',
    lastName: 'Bernard',
    phone: '06 11 22 33 44',
    city: 'Lyon',
    gender: 'homme',
    dateOfBirth: '1981-05-03',
    antecedents: 'Burnout professionnel et fatigue chronique.',
    notes: [
      {
        id: 'n_4a',
        date: '2026-08-25',
        text: 'Première séance bilan effectuée.',
        doctorId: DEMO_DOCTOR_ID,
        sharedWithPatient: false,
      },
    ],
    consultations: consultationsFrom(['2026-08-25', '2026-08-18'], 'online'),
  },
];

const SEED_MESSAGES: PatientMessage[] = [
  {
    id: 'm_seed_1',
    patientId: 'pat_1',
    from: 'patient',
    text: 'Bonjour docteur, ma tension est stable cette semaine.',
    sentAt: '2026-09-18T09:30:00.000Z',
    read: false,
  },
];

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

interface PatientState {
  patients: Patient[];
  messages: PatientMessage[];
  /** Patient "connecté" côté patient (démo sans authentification). */
  currentPatientId: string | null;

  addPatient: (input: NewPatientInput) => string;
  /** Ajoute uniquement les patients inconnus (pont avec AppContext). */
  importPatients: (list: ImportedPatient[]) => void;
  updatePatient: (
    id: string,
    changes: Partial<Omit<Patient, 'id' | 'notes' | 'consultations'>>
  ) => void;
  addNote: (
    patientId: string,
    text: string,
    doctorId: string,
    sharedWithPatient: boolean
  ) => void;
  addConsultation: (patientId: string, date: string, mode: ConsultationMode) => void;
  sendMessage: (patientId: string, from: MessageAuthor, text: string) => void;
  /** Marque comme lus les messages envoyés par l'autre partie. */
  markMessagesRead: (patientId: string, reader: MessageAuthor) => void;
  setCurrentPatient: (id: string | null) => void;
}

const STORAGE_KEY = 'docpat-patients';

export const usePatientStore = create<PatientState>()(
  persist(
    (set) => ({
      patients: SEED_PATIENTS,
      messages: SEED_MESSAGES,
      currentPatientId: 'pat_1',

      addPatient: (input) => {
        const id = newId('pat');
        const patient: Patient = {
          id,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          city: input.city,
          gender: input.gender,
          dateOfBirth: input.dateOfBirth || undefined,
          antecedents: input.antecedents?.trim() || 'Nouveau patient ajouté par le médecin.',
          notes: [
            {
              id: newId('n'),
              date: todayISO(),
              text: 'Dossier initial créé.',
              doctorId: DEMO_DOCTOR_ID,
              sharedWithPatient: false,
            },
          ],
          consultations: [],
        };
        set((state) => ({ patients: [patient, ...state.patients] }));
        return id;
      },

      importPatients: (list) =>
        set((state) => {
          const known = new Set(state.patients.map((p) => p.id));
          const fresh: Patient[] = list
            .filter((p) => !known.has(p.id))
            .map((p) => ({
              ...p,
              antecedents: p.antecedents ?? "Patient inscrit via l'application Docpat.",
              notes: [],
              consultations: [],
            }));
          return fresh.length > 0 ? { patients: [...fresh, ...state.patients] } : state;
        }),

      updatePatient: (id, changes) =>
        set((state) => ({
          patients: state.patients.map((p) => (p.id === id ? { ...p, ...changes } : p)),
        })),

      addNote: (patientId, text, doctorId, sharedWithPatient) =>
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  notes: [
                    { id: newId('n'), date: todayISO(), text, doctorId, sharedWithPatient },
                    ...p.notes,
                  ],
                }
              : p
          ),
        })),

      addConsultation: (patientId, date, mode) =>
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? { ...p, consultations: [...p.consultations, { id: newId('c'), date, mode }] }
              : p
          ),
        })),

      sendMessage: (patientId, from, text) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: newId('m'),
              patientId,
              from,
              text,
              sentAt: new Date().toISOString(),
              read: false,
            },
          ],
        })),

      markMessagesRead: (patientId, reader) =>
        set((state) => {
          const needsUpdate = state.messages.some(
            (m) => m.patientId === patientId && m.from !== reader && !m.read
          );
          if (!needsUpdate) return state;
          return {
            messages: state.messages.map((m) =>
              m.patientId === patientId && m.from !== reader ? { ...m, read: true } : m
            ),
          };
        }),

      setCurrentPatient: (id) => set({ currentPatientId: id }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        patients: state.patients,
        messages: state.messages,
        currentPatientId: state.currentPatientId,
      }),
    }
  )
);

/* ------------------------------------------------------------------ */
/* Next.js : éviter les erreurs d'hydratation + synchro entre onglets  */
/* ------------------------------------------------------------------ */

/** À utiliser dans les pages : n'affichez les données qu'une fois true. */
export function useStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsubscribe = usePatientStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(usePatientStore.persist.hasHydrated());
    return unsubscribe;
  }, []);

  return hydrated;
}

// Deux onglets ouverts (un médecin, un patient) restent synchronisés.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      usePatientStore.persist.rehydrate();
    }
  });
}