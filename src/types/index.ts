
// 1. Table Utilisateur de Base (User)

export type UserRole = 'patient' | 'doctor';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

// 2. Table Spécialités (Specialty)

export interface Specialty {
  id: string;
  name: string;
}

// 3. Table Patient (avec userId -> User)

export interface Patient {
  id: string;
  userId: string; // Clé étrangère vers User
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string; // Format YYYY-MM-DD
  gender: 'homme' | 'femme' | 'autre';
  city: string;
  password?: string; // Mot de passe pour le patient (optionnel)
}

// 4. Table Doctor (avec userId -> User)

export interface Doctor {
  id: string;
  userId: string; // Clé étrangère vers User
  firstName: string;
  lastName: string;
  specialtyId: string; // Clé étrangère vers Specialty
  phone: string;
  city: string;
  clinicName: string; // Hôpital ou Nom du cabinet
  bio: string;
  password?: string; // Mot de passe pour le médecin (optionnel)
  isAvailable: boolean;
  avatar?: string;
}

// 5. Table Créneaux Horaires (TimeSlot)

export interface TimeSlot {
  id: string;
  doctorId: string; // Clé étrangère vers Doctor
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// 6. Table Rendez-vous (Appointment)

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Appointment {
  id: string;
  patientId: string; // Clé étrangère vers Patient
  slotId: string;    // Clé étrangère vers TimeSlot
  reason: string;
  status: AppointmentStatus;
}

// 7. Table Messages (Message)

export type SenderType = 'patient' | 'doctor';

export interface Message {
  id: string;
  appointmentId: string;
  senderType: SenderType;
  content: string;
  isRead: boolean;
  createdAt: string;
}

// 8. Table Notifications (Notification)

export type UserType = 'patient' | 'doctor';

export interface Notification {
  id: string;
  userType: UserType;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}