import { isClerkAPIResponseError } from '@clerk/nextjs/errors';

const DEFAULT_MESSAGE = 'Une erreur est survenue. Veuillez réessayer.';

const MESSAGES: Record<string, string> = {
  form_identifier_exists: 'Un compte existe déjà avec cet e-mail.',
  form_identifier_not_found: 'E-mail ou mot de passe incorrect.',
  form_password_incorrect: 'E-mail ou mot de passe incorrect.',
  form_password_pwned:
    "Ce mot de passe est apparu dans une fuite de données publique. Choisissez-en un autre.",
  form_password_length_too_short: 'Le mot de passe est trop court (8 caractères minimum).',
  form_password_not_strong_enough: 'Le mot de passe n\'est pas assez fort.',
  form_param_format_invalid: 'Un des champs n\'a pas un format valide.',
  form_param_unknown:
    "Un champ n'est pas activé dans Clerk (vérifiez que le prénom et le nom sont activés dans le tableau de bord).",
  form_code_incorrect: 'Code incorrect. Vérifiez le code reçu par e-mail.',
  verification_expired: 'Ce code a expiré. Demandez-en un nouveau.',
  verification_failed: 'La vérification a échoué. Demandez un nouveau code.',
  session_exists: 'Vous êtes déjà connecté.',
  too_many_requests: 'Trop de tentatives. Patientez un instant avant de réessayer.',
};

/** Transforme une erreur Clerk en message lisible en français. */
export function clerkErrorMessage(err: unknown): string {
  if (isClerkAPIResponseError(err)) {
    const first = err.errors[0];
    if (first) {
      return MESSAGES[first.code] ?? first.longMessage ?? first.message ?? DEFAULT_MESSAGE;
    }
  }
  return DEFAULT_MESSAGE;
}