'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Loader2, LogIn } from 'lucide-react';

/** Photo du médecin ; si l'image ne charge pas, on affiche ses initiales. */
export function DoctorAvatar({
  src,
  firstName,
  lastName,
  className = 'w-14 h-14',
}: {
  src?: string;
  firstName: string;
  lastName: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // L'image a pu échouer avant que React ne soit prêt
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (!src || failed) {
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    return (
      <div
        className={`${className} rounded-2xl bg-teal-600 text-white font-black flex items-center justify-center shrink-0`}
        aria-label={`Dr. ${firstName} ${lastName}`}
      >
        {initials}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={src}
      alt={`Dr. ${firstName} ${lastName}`}
      onError={() => setFailed(true)}
      className={`${className} rounded-2xl object-cover shrink-0`}
    />
  );
}

export function PageLoading() {
  return (
    <div className="p-10 flex items-center justify-center gap-2 text-xs text-slate-400">
      <Loader2 className="w-4 h-4 animate-spin" />
      Chargement…
    </div>
  );
}

export function SessionMissing() {
  return (
    <div className="p-6 lg:p-10 max-w-lg mx-auto">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 text-center space-y-3">
        <LogIn className="w-8 h-8 text-teal-600 mx-auto" />
        <h1 className="text-lg font-extrabold text-slate-900">Vous n'êtes pas connecté</h1>
        <p className="text-xs text-slate-500">
          Connectez-vous à votre espace patient pour accéder à cette page.
        </p>
        <Link
          href="/"
          className="inline-block mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

export const patientInputClass =
  'w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none';