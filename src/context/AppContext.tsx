'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
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

export interface AuthUser {
  id: string;
  userId: string;
  role: UserType;
  name: string;
  email: string;
  avatar?: string;
}

interface AppContextType {
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
  logout: () => void;
  
  registerPatient: (data: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth: string;
    gender: 'homme' | 'femme' | 'autre';
    city: string;
  }) => void;

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
  sendMessage: (appointmentId: string, senderType: SenderType, content: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  addTimeSlot: (doctorId: string, date: string, startTime: string, endTime: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [specialties] = useState<Specialty[]>(initialSpecialties);
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(initialTimeSlots);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

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

  const logout = () => {
    setCurrentUser(null);
  };

  // ➕ AJOUT COMPATIBLE TABLE USER & TABLE PATIENT
  const registerPatient = (data: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth: string;
    gender: 'homme' | 'femme' | 'autre';
    city: string;
  }) => {
    const newUserId = `usr_${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      email: data.email,
      role: 'patient',
      createdAt: new Date().toISOString(),
    };

    const newPatient: Patient = {
      id: `pat_${Date.now()}`,
      userId: newUserId,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      city: data.city,
    };

    setUsers((prev) => [...prev, newUser]);
    setPatients((prev) => [...prev, newPatient]);

    setCurrentUser({
      id: newPatient.id,
      userId: newUserId,
      role: 'patient',
      name: `${newPatient.firstName} ${newPatient.lastName}`,
      email: data.email,
    });
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

  const updateAppointmentStatus = (appointmentId: string, status: AppointmentStatus) => {
    let targetAppointment: Appointment | undefined;

    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === appointmentId) {
          targetAppointment = { ...apt, status };
          return targetAppointment;
        }
        return apt;
      })
    );

    if (!targetAppointment) return;

    const slot = timeSlots.find((s) => s.id === targetAppointment?.slotId);
    const patient = patients.find((p) => p.id === targetAppointment?.patientId);
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

  return (
    <AppContext.Provider
      value={{
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
        logout,
        registerPatient,
        registerDoctor,
        bookAppointment,
        updateAppointmentStatus,
        sendMessage,
        markNotificationAsRead,
        addTimeSlot,
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