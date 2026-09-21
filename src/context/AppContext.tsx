'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';
import {
  User,
  Specialty,
  Doctor,
  Patient,
  TimeSlot,
  Appointment,
  AppointmentStatus,
  Message,
  Notification,
  SenderType,
  UserType,
} from '../types';
import {
  initialUsers,
  initialSpecialties,
  initialDoctors,
  initialPatients,
  initialTimeSlots,
  initialAppointments,
  initialMessages,
  initialNotifications,
} from '../data/mockData';
import { todayISO } from '../lib/patientUtils';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface AuthUser {
  id: string;
  userId: string;
  role: UserType;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
}

export type NoteKind = 'suivi' | 'ordonnance';

export interface PatientNote {
  id: string;
  date: string; // AAAA-MM-JJ
  text: string;
  kind: NoteKind;
  doctorId: string;
  doctorName: string;
  sharedWithPatient: boolean;
}

export interface PastConsultation {
  id: string;
  date: string; // AAAA-MM-JJ
  doctorName: string;
  title: string;
  summary: string;
  mode: 'online' | 'presential';
}

export interface MedicalRecord {
  antecedents: string;
  notes: PatientNote[];
  history: PastConsultation[];
}

export type PatientEditable = Partial<
  Pick<Patient, 'firstName' | 'lastName' | 'phone' | 'city' | 'dateOfBirth' | 'gender'>
>;

// ⚠️ DÉMO UNIQUEMENT : mots de passe gardés côté navigateur, en clair.
// Pour un vrai projet : base de données + mots de passe hachés côté serveur.
const DEMO_PASSWORD = 'patient123';
const initialPasswords: Record<string, string> = {
  'alice.morel@email.com': DEMO_PASSWORD,
  'thomas.bernard@email.com': DEMO_PASSWORD,
};

interface AppContextType {
  /** true quand les données sauvegardées et la session sont chargées. */
  ready: boolean;

  users: User[];
  specialties: Specialty[];
  doctors: Doctor[];
  patients: Patient[];
  timeSlots: TimeSlot[];
  appointments: Appointment[];
  messages: Message[];
  notifications: Notification[];

  currentUser: AuthUser | null;
  login: (role: UserType, entityId: string) => void;
  loginWithPassword: (email: string, password: string) => AuthResult;
  logout: () => void;

  registerPatient: (data: {
    email: string;
    firstName: string;
    lastName: string;
    password?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'homme' | 'femme' | 'autre';
    city?: string;
  }) => AuthResult;

  registerDoctor: (data: {
    email: string;
    firstName: string;
    lastName: string;
    specialtyId: string;
    phone: string;
    city: string;
    clinicName: string;
    bio: string;
    avatar?: string;
  }) => void;

  bookAppointment: (slotId: string, patientId: string, reason: string) => void;
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => void;
  cancelAppointment: (appointmentId: string) => void;
  sendMessage: (appointmentId: string, senderType: SenderType, content: string) => void;
  /** Marque comme lus les messages envoyés par l'autre partie. */
  markMessagesRead: (appointmentIds: string[], reader: SenderType) => void;
  markNotificationAsRead: (notificationId: string) => void;
  addTimeSlot: (doctorId: string, date: string, startTime: string, endTime: string) => void;

  /* Dossier patient */
  getMedicalRecord: (patientId: string) => MedicalRecord;
  /** Création d'un patient par le médecin (sans connexion automatique). */
  addPatient: (data: {
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    gender: 'homme' | 'femme' | 'autre';
    dateOfBirth: string;
    antecedents?: string;
  }) => string;
  updatePatient: (patientId: string, changes: PatientEditable) => void;
  updateAntecedents: (patientId: string, text: string) => void;
  addPatientNote: (
    patientId: string,
    note: {
      text: string;
      kind: NoteKind;
      sharedWithPatient: boolean;
      doctorId: string;
      doctorName: string;
    }
  ) => void;

  /** Remet toutes les données de démonstration à zéro (tous les onglets). */
  resetDemo: () => void;
}

/* ------------------------------------------------------------------ */
/* Données de démonstration des dossiers médicaux                      */
/* (associées aux patients par leur nom, quels que soient leurs id)    */
/* ------------------------------------------------------------------ */

const SEED_DOCTOR = 'Dr. Jean Dupont';

function sessions(
  dates: string[],
  title: string,
  mode: PastConsultation['mode'],
  summary = ''
): PastConsultation[] {
  return dates.map((date, i) => ({
    id: `h_${date}_${i}`,
    date,
    doctorName: SEED_DOCTOR,
    title,
    summary,
    mode,
  }));
}

function seedNote(
  id: string,
  date: string,
  text: string,
  opts: Partial<Pick<PatientNote, 'kind' | 'sharedWithPatient' | 'doctorName'>> = {}
): PatientNote {
  return {
    id,
    date,
    text,
    kind: opts.kind ?? 'suivi',
    doctorId: 'seed',
    doctorName: opts.doctorName ?? SEED_DOCTOR,
    sharedWithPatient: opts.sharedWithPatient ?? false,
  };
}

const SEED_RECORDS: Record<string, MedicalRecord> = {
  'paul atangana': {
    antecedents:
      'Hypertension artérielle modérée, suivi cardiologique et gestion du stress professionnel.',
    notes: [
      seedNote('n_paul_1', '2026-09-14', 'Très bonne évolution. Réduction de la pression artérielle.'),
      seedNote('n_paul_2', '2026-08-01', 'Début du suivi en gestion du stress.'),
    ],
    history: sessions(
      ['2026-09-14', '2026-08-31', '2026-08-17', '2026-08-01', '2026-07-15', '2026-07-01'],
      'Consultation de suivi',
      'online'
    ),
  },
  'dorine nguema': {
    antecedents: 'Anxiété sociale, insomnie récurrente.',
    notes: [seedNote('n_dorine_1', '2026-09-10', 'Exercices de relaxation respiratoire conseillés.')],
    history: sessions(['2026-09-10', '2026-08-27', '2026-08-13'], 'Consultation de suivi', 'presential'),
  },
  'alice morel': {
    antecedents: 'Thérapie de couple et suivi émotionnel.',
    notes: [
      seedNote('n_alice_1', '2026-09-02', 'Progrès significatifs dans la communication.', {
        sharedWithPatient: true,
      }),
      seedNote(
        'n_alice_2',
        '2026-08-14',
        'Bilan sanguin de contrôle (glycémie, cholestérol) à réaliser à jeun avant la prochaine consultation.',
        { kind: 'ordonnance', sharedWithPatient: true }
      ),
    ],
    history: [
      {
        id: 'h_alice_1',
        date: '2026-08-14',
        doctorName: 'Dr. Jean Dupont',
        title: 'Consultation Suivi Général',
        summary: 'Bilan de santé annuel parfait. Tension artérielle normale.',
        mode: 'online',
      },
      {
        id: 'h_alice_2',
        date: '2026-07-02',
        doctorName: 'Dr. Marie Curie',
        title: 'Bilan Cardiaque',
        summary: 'Électrocardiogramme satisfaisant. Prochain contrôle dans 3 mois.',
        mode: 'presential',
      },
    ],
  },
  'thomas bernard': {
    antecedents: 'Burnout professionnel et fatigue chronique.',
    notes: [seedNote('n_thomas_1', '2026-08-25', 'Première séance bilan effectuée.')],
    history: sessions(['2026-08-25', '2026-08-18'], 'Consultation de suivi', 'online'),
  },
};

function normalizeName(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function emptyRecord(): MedicalRecord {
  return { antecedents: "Patient inscrit via l'application Docpat.", notes: [], history: [] };
}

function buildRecordFor(p: { firstName: string; lastName: string }): MedicalRecord {
  const seed = SEED_RECORDS[normalizeName(`${p.firstName} ${p.lastName}`)];
  return seed ? clone(seed) : emptyRecord();
}

const INITIAL_RECORDS: Record<string, MedicalRecord> = Object.fromEntries(
  initialPatients.map((p) => [p.id, buildRecordFor(p)])
);

const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/* ------------------------------------------------------------------ */
/* Sauvegarde dans le navigateur + synchro entre onglets               */
/* (à remplacer plus tard par Supabase pour partager entre appareils)  */
/* ------------------------------------------------------------------ */

const STORAGE_PREFIX = 'docpat-demo:v1:';
const SESSION_KEY = `${STORAGE_PREFIX}session`;

function usePersistedState<T>(
  key: string,
  initial: T
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const storageKey = STORAGE_PREFIX + key;
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  // Chargement après le premier rendu (évite les erreurs d'hydratation de Next.js)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      /* stockage indisponible : on garde les données de démo */
    }
    setLoaded(true);
  }, [storageKey]);

  // Sauvegarde à chaque changement
  useEffect(() => {
    if (!loaded) return;
    try {
      const json = JSON.stringify(value);
      if (window.localStorage.getItem(storageKey) !== json) {
        window.localStorage.setItem(storageKey, json);
      }
    } catch {
      /* ignoré */
    }
  }, [value, loaded, storageKey]);

  // Un autre onglet a modifié les données
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== storageKey || e.newValue === null) return;
      try {
        setValue(JSON.parse(e.newValue) as T);
      } catch {
        /* ignoré */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [storageKey]);

  return [value, setValue, loaded];
}

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers, usersLoaded] = usePersistedState<User[]>('users', initialUsers);
  const [specialties] = useState<Specialty[]>(initialSpecialties);
  const [doctors, setDoctors, doctorsLoaded] = usePersistedState<Doctor[]>('doctors', initialDoctors);
  const [patients, setPatients, patientsLoaded] = usePersistedState<Patient[]>('patients', initialPatients);
  const [timeSlots, setTimeSlots, slotsLoaded] = usePersistedState<TimeSlot[]>('slots', initialTimeSlots);
  const [appointments, setAppointments, appointmentsLoaded] = usePersistedState<Appointment[]>(
    'appointments',
    initialAppointments
  );
  const [messages, setMessages, messagesLoaded] = usePersistedState<Message[]>('messages', initialMessages);
  const [notifications, setNotifications, notificationsLoaded] = usePersistedState<Notification[]>(
    'notifications',
    initialNotifications
  );
  const [passwords, setPasswords, passwordsLoaded] = usePersistedState<Record<string, string>>(
    'passwords',
    initialPasswords
  );
  const [medicalRecords, setMedicalRecords, recordsLoaded] = usePersistedState<Record<string, MedicalRecord>>(
    'records',
    INITIAL_RECORDS
  );

  // La session est propre à chaque onglet (un onglet patient et un onglet médecin en même temps)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(SESSION_KEY);
      if (raw) setCurrentUser(JSON.parse(raw) as AuthUser);
    } catch {
      /* ignoré */
    }
    setSessionLoaded(true);
  }, []);

  useEffect(() => {
    if (!sessionLoaded) return;
    try {
      if (currentUser) window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
      else window.sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignoré */
    }
  }, [currentUser, sessionLoaded]);

  const ready =
    sessionLoaded &&
    usersLoaded &&
    doctorsLoaded &&
    patientsLoaded &&
    slotsLoaded &&
    appointmentsLoaded &&
    messagesLoaded &&
    notificationsLoaded &&
    passwordsLoaded &&
    recordsLoaded;

  /* ----------------------------- Auth ----------------------------- */

  const login = (role: UserType, entityId: string) => {
    if (role === 'patient') {
      const p = patients.find((pat) => pat.id === entityId);
      const u = users.find((usr) => usr.id === p?.userId);
      if (p && u) {
        setCurrentUser({ id: p.id, userId: u.id, role: 'patient', name: `${p.firstName} ${p.lastName}`, email: u.email });
      }
    } else {
      const d = doctors.find((doc) => doc.id === entityId);
      const u = users.find((usr) => usr.id === d?.userId);
      if (d && u) {
        setCurrentUser({ id: d.id, userId: u.id, role: 'doctor', name: `Dr. ${d.firstName} ${d.lastName}`, email: u.email, avatar: d.avatar });
      }
    }
  };

  // Connexion par e-mail + mot de passe : réservée aux comptes PATIENT.
  // Même message d'erreur si l'e-mail n'existe pas ou si le mot de passe est faux.
  const loginWithPassword = (email: string, password: string): AuthResult => {
    const key = email.trim().toLowerCase();
    const u = users.find((usr) => usr.email.toLowerCase() === key && usr.role === 'patient');

    if (!u || passwords[key] !== password) {
      return { ok: false, error: 'E-mail ou mot de passe incorrect.' };
    }

    const p = patients.find((pat) => pat.userId === u.id);
    if (!p) {
      return { ok: false, error: 'Compte patient introuvable.' };
    }

    setCurrentUser({
      id: p.id,
      userId: u.id,
      role: 'patient',
      name: `${p.firstName} ${p.lastName}`,
      email: u.email,
    });
    return { ok: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // ➕ INSCRIPTION : le rôle est toujours "patient" (jamais choisi par l'utilisateur)
  const registerPatient = (data: {
    email: string;
    firstName: string;
    lastName: string;
    password?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'homme' | 'femme' | 'autre';
    city?: string;
  }): AuthResult => {
    const email = data.email.trim().toLowerCase();

    if (users.some((usr) => usr.email.toLowerCase() === email)) {
      return { ok: false, error: 'Un compte existe déjà avec cet e-mail.' };
    }

    const stamp = Date.now();
    const newUserId = `usr_${stamp}`;
    const newUser: User = {
      id: newUserId,
      email,
      role: 'patient',
      createdAt: new Date().toISOString(),
    };

    const newPatient: Patient = {
      id: `pat_${stamp}`,
      userId: newUserId,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone ?? '',
      dateOfBirth: data.dateOfBirth ?? '',
      gender: data.gender ?? 'autre',
      city: data.city ?? '',
    };

    setUsers((prev) => [...prev, newUser]);
    setPatients((prev) => [...prev, newPatient]);
    setMedicalRecords((prev) => ({ ...prev, [newPatient.id]: emptyRecord() }));
    if (data.password) {
      setPasswords((prev) => ({ ...prev, [email]: data.password as string }));
    }

    setCurrentUser({
      id: newPatient.id,
      userId: newUserId,
      role: 'patient',
      name: `${newPatient.firstName} ${newPatient.lastName}`,
      email,
    });
    return { ok: true };
  };

  // ➕ AJOUT COMPATIBLE TABLE USER & TABLE DOCTOR
  const registerDoctor = (data: {
    email: string;
    firstName: string;
    lastName: string;
    specialtyId: string;
    phone: string;
    city: string;
    clinicName: string;
    bio: string;
    avatar?: string;
  }) => {
    const newUserId = `usr_${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      email: data.email,
      role: 'doctor',
      createdAt: new Date().toISOString(),
    };

    const newDoctor: Doctor = {
      id: `doc_${Date.now()}`,
      userId: newUserId,
      firstName: data.firstName,
      lastName: data.lastName,
      specialtyId: data.specialtyId,
      phone: data.phone,
      city: data.city,
      clinicName: data.clinicName,
      bio: data.bio,
      isAvailable: true,
      avatar: data.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    };

    setUsers((prev) => [...prev, newUser]);
    setDoctors((prev) => [...prev, newDoctor]);

    setCurrentUser({
      id: newDoctor.id,
      userId: newUserId,
      role: 'doctor',
      name: `Dr. ${newDoctor.firstName} ${newDoctor.lastName}`,
      email: data.email,
      avatar: newDoctor.avatar,
    });
  };

  /* ------------------- Rendez-vous, messages, notifs ------------------- */

  // TRIGGERS (Réservation, Changement Statut, Message)
  const bookAppointment = (slotId: string, patientId: string, reason: string) => {
    const slot = timeSlots.find((s) => s.id === slotId);
    if (!slot || !slot.isAvailable) return;

    setTimeSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, isAvailable: false } : s)));

    const newAppointment: Appointment = {
      id: `apt_${Date.now()}`,
      patientId,
      slotId,
      reason,
      status: 'pending',
    };
    setAppointments((prev) => [...prev, newAppointment]);

    const doctor = doctors.find((d) => d.id === slot.doctorId);
    const patient = patients.find((p) => p.id === patientId);

    if (doctor && patient) {
      const newNotification: Notification = {
        id: `notif_${Date.now()}`,
        userType: 'doctor',
        userId: doctor.id,
        title: 'Nouveau rendez-vous en attente',
        message: `${patient.firstName} ${patient.lastName} a demandé un RDV pour le ${slot.date} à ${slot.startTime}.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotification, ...prev]);
    }
  };

  // Changement de statut par le médecin (confirmer / annuler)
  const updateAppointmentStatus = (appointmentId: string, status: AppointmentStatus) => {
    const target = appointments.find((apt) => apt.id === appointmentId);
    if (!target) return;

    setAppointments((prev) =>
      prev.map((apt) => (apt.id === appointmentId ? { ...apt, status } : apt))
    );

    // Un rendez-vous annulé libère son créneau
    if (status === 'cancelled') {
      setTimeSlots((prev) =>
        prev.map((s) => (s.id === target.slotId ? { ...s, isAvailable: true } : s))
      );
    }

    if (status !== 'confirmed' && status !== 'cancelled') return;

    const slot = timeSlots.find((s) => s.id === target.slotId);
    const patient = patients.find((p) => p.id === target.patientId);
    const doctor = slot ? doctors.find((d) => d.id === slot.doctorId) : undefined;

    if (patient && doctor && slot) {
      const statusLabel = status === 'confirmed' ? 'confirmé' : 'annulé';
      const newNotification: Notification = {
        id: `notif_${Date.now()}`,
        userType: 'patient',
        userId: patient.id,
        title: `Rendez-vous ${statusLabel}`,
        message: `Votre rendez-vous avec le Dr. ${doctor.lastName} le ${slot.date} à ${slot.startTime} a été ${statusLabel}.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotification, ...prev]);
    }
  };

  // Annulation par le PATIENT : libère le créneau et prévient le médecin
  const cancelAppointment = (appointmentId: string) => {
    const target = appointments.find((apt) => apt.id === appointmentId);
    if (!target || target.status === 'cancelled') return;

    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentId ? { ...apt, status: 'cancelled' as AppointmentStatus } : apt
      )
    );
    setTimeSlots((prev) =>
      prev.map((s) => (s.id === target.slotId ? { ...s, isAvailable: true } : s))
    );

    const slot = timeSlots.find((s) => s.id === target.slotId);
    const patient = patients.find((p) => p.id === target.patientId);
    const doctor = slot ? doctors.find((d) => d.id === slot.doctorId) : undefined;

    if (patient && doctor && slot) {
      const newNotification: Notification = {
        id: `notif_${Date.now()}`,
        userType: 'doctor',
        userId: doctor.id,
        title: 'Rendez-vous annulé',
        message: `${patient.firstName} ${patient.lastName} a annulé son rendez-vous du ${slot.date} à ${slot.startTime}.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotification, ...prev]);
    }
  };

  const sendMessage = (appointmentId: string, senderType: SenderType, content: string) => {
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      appointmentId,
      senderType,
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);

    const appointment = appointments.find((a) => a.id === appointmentId);
    if (!appointment) return;

    const slot = timeSlots.find((s) => s.id === appointment.slotId);
    if (!slot) return;

    const recipientUserType: UserType = senderType === 'patient' ? 'doctor' : 'patient';
    const recipientUserId = senderType === 'patient' ? slot.doctorId : appointment.patientId;

    const senderName =
      senderType === 'patient'
        ? patients.find((p) => p.id === appointment.patientId)?.firstName ?? 'Le patient'
        : `Dr. ${doctors.find((d) => d.id === slot.doctorId)?.lastName ?? 'Le médecin'}`;

    const newNotification: Notification = {
      id: `notif_${Date.now()}`,
      userType: recipientUserType,
      userId: recipientUserId,
      title: 'Nouveau message reçu',
      message: `${senderName} : "${content.slice(0, 30)}${content.length > 30 ? '...' : ''}"`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markMessagesRead = (appointmentIds: string[], reader: SenderType) => {
    const ids = new Set(appointmentIds);
    setMessages((prev) => {
      let changed = false;
      const next = prev.map((m) => {
        if (ids.has(m.appointmentId) && m.senderType !== reader && !m.isRead) {
          changed = true;
          return { ...m, isRead: true };
        }
        return m;
      });
      return changed ? next : prev;
    });
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  };

  const addTimeSlot = (doctorId: string, date: string, startTime: string, endTime: string) => {
    const newSlot: TimeSlot = {
      id: `slot_${Date.now()}`,
      doctorId,
      date,
      startTime,
      endTime,
      isAvailable: true,
    };
    setTimeSlots((prev) => [...prev, newSlot]);
  };

  /* --------------------------- Dossier patient --------------------------- */

  const getMedicalRecord = (patientId: string): MedicalRecord => {
    const stored = medicalRecords[patientId];
    if (stored) return stored;
    const p = patients.find((x) => x.id === patientId);
    return p ? buildRecordFor(p) : emptyRecord();
  };

  const updateRecord = (patientId: string, change: (record: MedicalRecord) => MedicalRecord) => {
    setMedicalRecords((prev) => {
      const p = patients.find((x) => x.id === patientId);
      const current = prev[patientId] ?? (p ? buildRecordFor(p) : emptyRecord());
      return { ...prev, [patientId]: change(current) };
    });
  };

  const addPatient: AppContextType['addPatient'] = (data) => {
    const newUserId = uid('usr');
    const slug = normalizeName(`${data.firstName}.${data.lastName}`).replace(/[^a-z0-9.]/g, '');
    const newUser: User = {
      id: newUserId,
      email: `${slug || 'patient'}.${Date.now().toString(36)}@demo.docpat`,
      role: 'patient',
      createdAt: new Date().toISOString(),
    };
    const newPatient: Patient = {
      id: uid('pat'),
      userId: newUserId,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      city: data.city,
    };

    setUsers((prev) => [...prev, newUser]);
    setPatients((prev) => [newPatient, ...prev]);
    setMedicalRecords((prev) => ({
      ...prev,
      [newPatient.id]: {
        antecedents: data.antecedents?.trim() || 'Nouveau patient ajouté par le médecin.',
        notes: [
          {
            id: uid('n'),
            date: todayISO(),
            text: 'Dossier initial créé.',
            kind: 'suivi',
            doctorId: 'system',
            doctorName: 'Docpat',
            sharedWithPatient: false,
          },
        ],
        history: [],
      },
    }));
    return newPatient.id;
  };

  const updatePatient = (patientId: string, changes: PatientEditable) => {
    setPatients((prev) => prev.map((p) => (p.id === patientId ? { ...p, ...changes } : p)));

    // Garde le nom affiché dans l'en-tête à jour
    setCurrentUser((prev) => {
      if (!prev || prev.role !== 'patient' || prev.id !== patientId) return prev;
      const current = patients.find((p) => p.id === patientId);
      const first = changes.firstName ?? current?.firstName ?? '';
      const last = changes.lastName ?? current?.lastName ?? '';
      const name = `${first} ${last}`.trim();
      return name ? { ...prev, name } : prev;
    });
  };

  const updateAntecedents = (patientId: string, text: string) => {
    updateRecord(patientId, (r) => ({ ...r, antecedents: text }));
  };

  const addPatientNote: AppContextType['addPatientNote'] = (patientId, note) => {
    updateRecord(patientId, (r) => ({
      ...r,
      notes: [
        {
          id: uid('n'),
          date: todayISO(),
          text: note.text,
          kind: note.kind,
          doctorId: note.doctorId,
          doctorName: note.doctorName,
          // Une ordonnance est toujours destinée au patient
          sharedWithPatient: note.kind === 'ordonnance' ? true : note.sharedWithPatient,
        },
        ...r.notes,
      ],
    }));
  };

  const resetDemo = () => {
    setUsers(initialUsers);
    setDoctors(initialDoctors);
    setPatients(initialPatients);
    setTimeSlots(initialTimeSlots);
    setAppointments(initialAppointments);
    setMessages(initialMessages);
    setNotifications(initialNotifications);
    setPasswords(initialPasswords);
    setMedicalRecords(INITIAL_RECORDS);
  };

  return (
    <AppContext.Provider
      value={{
        ready,
        users,
        specialties,
        doctors,
        patients,
        timeSlots,
        appointments,
        messages,
        notifications,
        currentUser,
        login,
        loginWithPassword,
        logout,
        registerPatient,
        registerDoctor,
        bookAppointment,
        updateAppointmentStatus,
        cancelAppointment,
        sendMessage,
        markMessagesRead,
        markNotificationAsRead,
        addTimeSlot,
        getMedicalRecord,
        addPatient,
        updatePatient,
        updateAntecedents,
        addPatientNote,
        resetDemo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp doit être utilisé à l'intérieur d'un AppProvider");
  }
  return context;
};

/** Le patient connecté dans cet onglet (undefined si personne, ou si c'est un médecin). */
export const useCurrentPatient = (): Patient | undefined => {
  const { currentUser, patients } = useApp();
  if (!currentUser || currentUser.role !== 'patient') return undefined;
  return patients.find((p) => p.id === currentUser.id);
};