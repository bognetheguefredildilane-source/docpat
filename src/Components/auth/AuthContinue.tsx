'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { AuthFrame } from './AuthShell';

/**
 * Étape finale après Google : on attend que ClerkBridge ouvre la session locale,
 * puis on redirige selon le rôle (médecin ou patient).
 */
export function AuthContinue() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const { ready, currentUser } = useApp();
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    if (!isLoaded || !ready) return;
    if (!isSignedIn) {
      router.replace('/connexion');
      return;
    }
    if (currentUser) {
      router.replace(currentUser.role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient');
    }
  }, [isLoaded, isSignedIn, ready, currentUser, router]);

  useEffect(() => {
    const timer = window.setTimeout(() => setStuck(true), 10000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AuthFrame>
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-700">Connexion réussie, ouverture de votre espace…</p>
        {stuck && (
          <p className="text-xs text-rose-700">
            Cela prend plus de temps que prévu. Actualisez la page pour continuer.
          </p>
        )}
      </div>
    </AuthFrame>
  );
}