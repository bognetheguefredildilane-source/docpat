'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useApp } from '@/context/AppContext';
import { AuthError, AuthFrame } from './AuthShell';
import { GoogleButton } from './GoogleButton';
import { SignInForm } from './SignInForm';
import { SignUpForm, type FlowStep } from './SignUpForm';

type Mode = 'signin' | 'signup';

/** Page unique : deux onglets "Se connecter" / "Créer un compte". Aucun choix médecin ou patient. */
export function AuthPage({ initialMode = 'signin' }: { initialMode?: Mode }) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const { ready, currentUser } = useApp();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [step, setStep] = useState<FlowStep>('form');
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Déjà connecté (ou connexion qui vient de réussir) : direction le bon dashboard
  useEffect(() => {
    if (!isLoaded || !ready || !isSignedIn || !currentUser) return;
    router.replace(currentUser.role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient');
  }, [isLoaded, ready, isSignedIn, currentUser, router]);

  const tabClass = (active: boolean) =>
    `flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
      active ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
    }`;

  return (
    <AuthFrame>
      {step === 'form' && (
        <>
          <div role="tablist" className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              role="tab"
              aria-selected={mode === 'signin'}
              onClick={() => setMode('signin')}
              className={tabClass(mode === 'signin')}
            >
              Se connecter
            </button>
            <button
              role="tab"
              aria-selected={mode === 'signup'}
              onClick={() => setMode('signup')}
              className={tabClass(mode === 'signup')}
            >
              Créer un compte
            </button>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            {mode === 'signin'
              ? 'Bon retour ! Connectez-vous avec Google ou avec votre e-mail.'
              : 'Créez votre espace en un clic avec Google, ou remplissez le formulaire.'}
          </p>

          <GoogleButton onError={setGoogleError} />
          <AuthError message={googleError} />

          <div className="flex items-center gap-3">
            <span className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] font-semibold text-slate-400">ou avec votre e-mail</span>
            <span className="flex-1 h-px bg-slate-200" />
          </div>
        </>
      )}

      {mode === 'signin' ? (
        <SignInForm onStepChange={setStep} />
      ) : (
        <SignUpForm onStepChange={setStep} />
      )}
    </AuthFrame>
  );
}