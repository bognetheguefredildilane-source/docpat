'use client';

import React, { useEffect, useState } from 'react';
import { useSignIn } from '@clerk/nextjs/legacy';
import type { EmailCodeFactor } from '@clerk/nextjs/types';
import { Loader2, MailCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { clerkErrorMessage } from '@/lib/clerkErrors';
import {
  AuthError,
  PasswordField,
  authButtonClass,
  authInputClass,
  useAuthRedirect,
} from './AuthShell';

    import { FlowStep } from './SignUpForm';

export function SignInForm({ onStepChange }: { onStepChange: (step: FlowStep) => void }) {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { currentUser, logout } = useApp();
  const { redirecting, stuck, startRedirect } = useAuthRedirect();

  const [step, setStep] = useState<'form' | 'code'>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    onStepChange(redirecting ? 'redirecting' : step);
  }, [redirecting, step, onStepChange]);

  const finish = async (sessionId: string | null) => {
    if (!isLoaded) return;
    if (currentUser) logout();
    await setActive({
      session: sessionId,
      navigate: async ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          setError("Une étape supplémentaire est demandée par Clerk. Contactez l'administrateur.");
          return;
        }
        startRedirect(decorateUrl);
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);
    setBusy(true);
    try {
      const attempt = await signIn.create({ identifier: email.trim(), password });

      if (attempt.status === 'complete') {
        await finish(attempt.createdSessionId);
      } else if (attempt.status === 'needs_second_factor') {
        // Nouvel appareil : Clerk demande un code envoyé par e-mail
        const emailCodeFactor = attempt.supportedSecondFactors?.find(
          (factor): factor is EmailCodeFactor => factor.strategy === 'email_code'
        );
        if (emailCodeFactor) {
          await signIn.prepareSecondFactor({
            strategy: 'email_code',
            emailAddressId: emailCodeFactor.emailAddressId,
          });
          setStep('code');
        } else {
          setError("Une vérification supplémentaire est requise, mais elle n'est pas prise en charge ici.");
        }
      } else {
        setError('Connexion impossible pour le moment. Vérifiez vos informations.');
      }
    } catch (err) {
      setError(clerkErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);
    setBusy(true);
    try {
      const attempt = await signIn.attemptSecondFactor({ strategy: 'email_code', code: code.trim() });
      if (attempt.status === 'complete') {
        await finish(attempt.createdSessionId);
      } else {
        setError("La vérification n'est pas terminée. Réessayez.");
      }
    } catch (err) {
      setError(clerkErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (redirecting) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-700">Connexion réussie, ouverture de votre espace…</p>
        {stuck && (
          <p className="text-xs text-rose-700">
            Cela prend plus de temps que prévu. Actualisez la page pour continuer.
          </p>
        )}
      </div>
    );
  }

  if (step === 'code') {
    return (
      <form onSubmit={handleCode} className="space-y-4">
        <div className="text-center space-y-2">
          <MailCheck className="w-10 h-10 text-teal-600 mx-auto" />
          <h1 className="text-xl font-black text-slate-900">Vérification de sécurité</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Pour protéger votre compte, saisissez le code envoyé à <span className="font-bold">{email}</span>.
          </p>
        </div>
        <div>
          <label htmlFor="code" className="block text-xs font-bold text-slate-700 mb-1">
            Code de vérification
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={`${authInputClass} tracking-widest text-center`}
            required
          />
        </div>
        <AuthError message={error} />
        <button type="submit" disabled={busy || !code.trim()} className={authButtonClass}>
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}
          Valider
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">
          Adresse e-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={authInputClass}
          required
        />
      </div>

      <PasswordField
        id="password"
        label="Mot de passe"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
      />

      <AuthError message={error} />

      <button type="submit" disabled={busy || !isLoaded} className={authButtonClass}>
        {busy && <Loader2 className="w-4 h-4 animate-spin" />}
        Se connecter
      </button>
    </form>
  );
}