'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const authInputClass =
  'w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-base sm:text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none';

export const authButtonClass =
  'w-full flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-colors shadow-md';

/** Cadre commun : logo Docpat + carte blanche. */
export function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-slate-50 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            ✚
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">
            Mind<span className="text-teal-600">Care</span>
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-5">
          {children}
        </div>
      </div>
    </main>
  );
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-3.5 py-2.5"
    >
      {message}
    </p>
  );
}

/** Champ mot de passe avec bouton "afficher / masquer". */
export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  minLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: 'current-password' | 'new-password';
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-slate-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${authInputClass} pr-11`}
          required
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

/**
 * Après une connexion Clerk réussie, on attend que la session locale de l'appli
 * (AppContext) soit prête, puis on redirige selon le rôle du compte :
 * médecin -> /dashboard/doctor, sinon -> /dashboard/patient.
 */
export function useAuthRedirect() {
  const { currentUser } = useApp();
  const router = useRouter();
  const [decorate, setDecorate] = useState<((url: string) => string) | null>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    if (!decorate || !currentUser) return;
    const path = currentUser.role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient';
    const url = decorate(path);
    if (url.startsWith('http')) window.location.href = url;
    else router.push(url);
  }, [decorate, currentUser, router]);

  useEffect(() => {
    if (!decorate) return;
    const timer = window.setTimeout(() => setStuck(true), 10000);
    return () => window.clearTimeout(timer);
  }, [decorate]);

  const startRedirect = (decorateUrl: (url: string) => string) => setDecorate(() => decorateUrl);

  return { redirecting: decorate !== null, stuck, startRedirect };
}