'use client';

import React, { useEffect, useState } from 'react';
import { useSignUp } from '@clerk/nextjs/legacy';
import { Loader2, MailCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { clerkErrorMessage } from '@/lib/clerkErrors';
import { todayISO } from '@/lib/patientUtils';
import {
  AuthError,
  PasswordField,
  authButtonClass,
  authInputClass,
  useAuthRedirect,
} from './AuthShell';

export type FlowStep = 'form' | 'verify' | 'code' | 'redirecting';

type Gender = '' | 'femme' | 'homme' | 'autre';

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  dateOfBirth: '',
  gender: '' as Gender,
  city: '',
  phone: '',
  accepted: false,
};

export function SignUpForm({ onStepChange }: { onStepChange: (step: FlowStep) => void }) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { currentUser, logout } = useApp();
  const { redirecting, stuck, startRedirect } = useAuthRedirect();

  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [form, setForm] = useState(EMPTY_FORM);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    onStepChange(redirecting ? 'redirecting' : step);
  }, [redirecting, step, onStepChange]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Compte Clerk créé : on ouvre la session (la session locale est créée par ClerkBridge)
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

 
    if (!form.gender) return setError('Veuillez indiquer votre sexe.');
    if (!form.accepted) return setError("Veuillez accepter les conditions d'utilisation.");

    setBusy(true);
    try {
      const attempt = await signUp.create({
        emailAddress: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        // Champs supplémentaires : copiés sur le compte Clerk une fois l'inscription terminée
        unsafeMetadata: {
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          city: form.city.trim(),
          phone: form.phone.trim(),
        },
      });

      // Si la vérification e-mail est désactivée dans Clerk, l'inscription est déjà terminée
      if (attempt.status === 'complete') {
        await finish(attempt.createdSessionId);
        return;
      }

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setStep('verify');
    } catch (err) {
      setError(clerkErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code: code.trim() });
      if (attempt.status === 'complete') {
        await finish(attempt.createdSessionId);
      } else {
        setError("La vérification n'est pas terminée. Réessayez ou recommencez l'inscription.");
      }
    } catch (err) {
      setError(clerkErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const resendCode = async () => {
    if (!isLoaded) return;
    setError(null);
    setInfo(null);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setInfo("Un nouveau code vient d'être envoyé.");
    } catch (err) {
      setError(clerkErrorMessage(err));
    }
  };

  /* ---------------------- Création de l'espace en cours ---------------------- */
  if (redirecting) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-700">Compte créé, ouverture de votre espace…</p>
        {stuck && (
          <p className="text-xs text-rose-700">
            Cela prend plus de temps que prévu. Actualisez la page pour continuer.
          </p>
        )}
      </div>
    );
  }

  /* ------------------------- Étape 2 : code par e-mail ------------------------- */
  if (step === 'verify') {
    return (
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="text-center space-y-2">
          <MailCheck className="w-10 h-10 text-teal-600 mx-auto" />
          <h1 className="text-xl font-black text-slate-900">Vérifiez votre e-mail</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Nous avons envoyé un code de vérification à <span className="font-bold">{form.email}</span>.
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
        {info && <p className="text-xs font-semibold text-emerald-700">{info}</p>}

        <button type="submit" disabled={busy || !code.trim()} className={authButtonClass}>
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}
          Vérifier et créer mon compte
        </button>

        <div className="flex items-center justify-between text-xs">
          <button type="button" onClick={resendCode} className="font-bold text-teal-700 hover:underline">
            Renvoyer le code
          </button>
          <button
            type="button"
            onClick={() => {
              setStep('form');
              setCode('');
              setError(null);
              setInfo(null);
            }}
            className="font-semibold text-slate-500 hover:underline"
          >
            Modifier mes informations
          </button>
        </div>
      </form>
    );
  }

  /* --------------------------- Étape 1 : formulaire --------------------------- */
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="lastName" className="block text-xs font-bold text-slate-700 mb-1">
            Nom
          </label>
          <input
            id="lastName"
            type="text"
            autoComplete="family-name"
            value={form.lastName}
            onChange={(e) => set('lastName', e.target.value)}
            className={authInputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="firstName" className="block text-xs font-bold text-slate-700 mb-1">
            Prénom
          </label>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            value={form.firstName}
            onChange={(e) => set('firstName', e.target.value)}
            className={authInputClass}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">
          Adresse e-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          className={authInputClass}
          required
        />
      </div>

      <PasswordField
        id="password"
        label="Mot de passe "
        value={form.password}
        onChange={(v) => set('password', v)}
        autoComplete="new-password"
        minLength={8}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="dob" className="block text-xs font-bold text-slate-700 mb-1">
            Date de naissance
          </label>
          <input
            id="dob"
            type="date"
            max={todayISO()}
            autoComplete="bday"
            value={form.dateOfBirth}
            onChange={(e) => set('dateOfBirth', e.target.value)}
            className={authInputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="gender" className="block text-xs font-bold text-slate-700 mb-1">
            Sexe
          </label>
          <select
            id="gender"
            value={form.gender}
            onChange={(e) => set('gender', e.target.value as Gender)}
            className={authInputClass}
            required
          >
           
            <option value="femme">Femme</option>
            <option value="homme">Homme</option>
           
          </select>
        </div>
        <div>
          <label htmlFor="city" className="block text-xs font-bold text-slate-700 mb-1">
            Ville <span className="font-normal text-slate-400">(facultatif)</span>
          </label>
          <input
            id="city"
            type="text"
            autoComplete="address-level2"
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
            className={authInputClass}
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-xs font-bold text-slate-700 mb-1">
            Téléphone <span className="font-normal text-slate-400">(facultatif)</span>
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+237 6 00 00 00 00"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            className={authInputClass}
          />
        </div>
      </div>

      <label className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
        <input
          type="checkbox"
          checked={form.accepted}
          onChange={(e) => set('accepted', e.target.checked)}
          className="accent-teal-600 mt-0.5"
        />
        <span>
          J'accepte les conditions d'utilisation de Docpat. Il s'agit d'une démonstration : je
          n'entrerai pas de vraies informations de santé.
        </span>
      </label>

      {/* Emplacement de la protection anti-robots de Clerk (obligatoire) */}
      <div id="clerk-captcha" />

      <AuthError message={error} />

      <button type="submit" disabled={busy || !isLoaded} className={authButtonClass}>
        {busy && <Loader2 className="w-4 h-4 animate-spin" />}
        Créer mon compte
      </button>
    </form>
  );
}