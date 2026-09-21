'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useApp } from '@/context/AppContext';

// Repère les sessions ouvertes via Clerk (les comptes de démo classiques ne sont pas touchés)
const FLAG_KEY = 'docpat-demo:v1:clerk-managed';

/**
 * Composant invisible, à placer dans le layout, À L'INTÉRIEUR de <ClerkProvider> et <AppProvider>.
 * - Clerk connecté  -> ouvre la session locale : médecin si le compte a le rôle "doctor"
 *                      (défini dans Clerk), sinon patient (fiche créée au besoin).
 * - Clerk déconnecté -> ferme la session locale ouverte via Clerk.
 */
export function ClerkBridge() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { ready, currentUser, users, doctors, patients, login, logout, registerPatient } = useApp();
  const handledFor = useRef<string | null>(null);

  useEffect(() => {
    if (!ready || !isLoaded) return;

    // 1) Clerk n'est plus connecté
    if (!isSignedIn) {
      handledFor.current = null;
      if (window.sessionStorage.getItem(FLAG_KEY) === '1') {
        window.sessionStorage.removeItem(FLAG_KEY);
        if (currentUser) logout();
      }
      return;
    }

    // 2) Clerk connecté, mais l'appli n'a pas encore de session locale
    if (!user || currentUser || handledFor.current === user.id) return;
    handledFor.current = user.id;

    // Le rôle médecin ne peut être donné que depuis le tableau de bord Clerk (public metadata)
    const publicMeta = (user.publicMetadata ?? {}) as Record<string, unknown>;
    if (publicMeta.role === 'doctor') {
      const doctorId = typeof publicMeta.doctorId === 'string' ? publicMeta.doctorId : doctors[0]?.id;
      if (doctorId) {
        login('doctor', doctorId);
        window.sessionStorage.setItem(FLAG_KEY, '1');
      }
      return;
    }

    const email = user.primaryEmailAddress?.emailAddress?.toLowerCase();
    if (!email) return;

    const localUser = users.find((u) => u.email.toLowerCase() === email && u.role === 'patient');
    const localPatient = localUser ? patients.find((p) => p.userId === localUser.id) : undefined;

    if (localPatient) {
      login('patient', localPatient.id);
    } else {
      // Première connexion sur cet appareil : on crée la fiche à partir des infos du formulaire
      const meta = (user.unsafeMetadata ?? {}) as Record<string, unknown>;
      const gender =
        meta.gender === 'femme' || meta.gender === 'homme' || meta.gender === 'autre'
          ? meta.gender
          : undefined;

      registerPatient({
        email,
        firstName: user.firstName || email.split('@')[0],
        lastName: user.lastName || '',
        phone: typeof meta.phone === 'string' ? meta.phone : undefined,
        dateOfBirth: typeof meta.dateOfBirth === 'string' ? meta.dateOfBirth : undefined,
        gender,
        city: typeof meta.city === 'string' ? meta.city : undefined,
      });
    }

    window.sessionStorage.setItem(FLAG_KEY, '1');
  }, [ready, isLoaded, isSignedIn, user, currentUser, users, doctors, patients, login, logout, registerPatient]);

  return null;
}