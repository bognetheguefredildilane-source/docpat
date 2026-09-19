import {
  User,
  Specialty,
  Doctor,
  Patient,
  TimeSlot,
  Appointment,
  Message,
  Notification,
} from '../types';

export const initialUsers: User[] = [
  { id: 'usr_1', email: 'jean.dupont@mindcare.fr', role: 'doctor', createdAt: '2026-01-01' },
  { id: 'usr_2', email: 'marie.curie@mindcare.fr', role: 'doctor', createdAt: '2026-01-01' },
  { id: 'usr_3', email: 'alice.morel@email.com', role: 'patient', createdAt: '2026-02-10' },
  { id: 'usr_4', email: 'thomas.bernard@email.com', role: 'patient', createdAt: '2026-03-15' },
];

export const initialSpecialties: Specialty[] = [
  { id: 'spec_1', name: 'Médecine Générale' },
  { id: 'spec_2', name: 'Cardiologie' },
  { id: 'spec_3', name: 'Pédiatrie' },
  { id: 'spec_4', name: 'Dermatologie' },
  { id: 'spec_5', name: 'Ophtalmologie' },
];

export const initialDoctors: Doctor[] = [
  {
    id: 'doc_1',
    userId: 'usr_1',
    firstName: 'Jean',
    lastName: 'Dupont',
    specialtyId: 'spec_1',
    phone: '01 42 68 00 01',
    city: 'Paris',
    clinicName: 'Clinique Pasteur Paris',
    bio: 'Médecin généraliste avec 15 ans d’expérience en suivi personnalisé des familles.',
    isAvailable: true,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'doc_2',
    userId: 'usr_2',
    firstName: 'Marie',
    lastName: 'Curie',
    specialtyId: 'spec_2',
    phone: '04 78 92 11 22',
    city: 'Lyon',
    clinicName: 'Centre de Cardiologie de Lyon',
    bio: 'Spécialiste en cardiologie préventive et suivi d’insuffisances cardiaques.',
    isAvailable: true,
    avatar: 'https://images.unsplash.com/photo-1594824813566-7885a39644d6?w=150&auto=format&fit=crop&q=80',
  },
];

export const initialPatients: Patient[] = [
  {
    id: 'pat_1',
    userId: 'usr_3',
    firstName: 'Alice',
    lastName: 'Morel',
    phone: '06 12 34 56 78',
    dateOfBirth: '1992-05-14',
    gender: 'femme',
    city: 'Paris',
  },
  {
    id: 'pat_2',
    userId: 'usr_4',
    firstName: 'Thomas',
    lastName: 'Bernard',
    phone: '06 98 76 54 32',
    dateOfBirth: '1988-11-20',
    gender: 'homme',
    city: 'Lyon',
  },
];

export const initialTimeSlots: TimeSlot[] = [
  { id: 'slot_1', doctorId: 'doc_1', date: '2026-09-20', startTime: '09:00', endTime: '09:30', isAvailable: true },
  { id: 'slot_2', doctorId: 'doc_1', date: '2026-09-20', startTime: '10:00', endTime: '10:30', isAvailable: true },
  { id: 'slot_3', doctorId: 'doc_1', date: '2026-09-20', startTime: '14:00', endTime: '14:30', isAvailable: true },
];

export const initialAppointments: Appointment[] = [];
export const initialMessages: Message[] = [];
export const initialNotifications: Notification[] = [];