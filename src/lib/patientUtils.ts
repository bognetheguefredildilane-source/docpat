export const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];
export const WEEKDAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

export const GENDER_LABELS: Record<string, string> = {
  homme: 'Homme',
  femme: 'Femme',
  autre: 'Autre',
};

const pad = (n: number) => String(n).padStart(2, '0');

/** Date du jour au format AAAA-MM-JJ (heure locale). */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return [y, m, d];
}

/** "2026-09-14" -> "14/09/2026" */
export function formatDate(iso: string): string {
  const [y, m, d] = parts(iso);
  if (!y || !m || !d) return iso;
  return `${pad(d)}/${pad(m)}/${y}`;
}

/** "2026-08-14" -> "14 août 2026" */
export function formatShortDate(iso: string): string {
  const [y, m, d] = parts(iso);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS_FR[m - 1]} ${y}`;
}

/** "2026-09-20" -> "dimanche 20 septembre 2026" */
export function formatLongDate(iso: string): string {
  const [y, m, d] = parts(iso);
  if (!y || !m || !d) return iso;
  const weekday = WEEKDAYS_FR[new Date(y, m - 1, d).getDay()];
  return `${weekday} ${d} ${MONTHS_FR[m - 1]} ${y}`;
}

/** "Aujourd'hui", "Demain", "Hier" ou la date longue. */
export function relativeDay(iso: string): string {
  const [y, m, d] = parts(iso);
  if (!y || !m || !d) return iso;
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((Date.UTC(y, m - 1, d) - today) / 86_400_000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Demain';
  if (diff === -1) return 'Hier';
  return formatLongDate(iso);
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getAge(dateOfBirth?: string): number | null {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

export function initialsOf(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function doctorFullName(d: { firstName: string; lastName: string }): string {
  return `Dr. ${d.firstName} ${d.lastName}`;
}

/** Lit le nom d'une spécialité sans dépendre du nom exact du champ. */
export function specialtyLabel(specialty: unknown): string {
  if (!specialty || typeof specialty !== 'object') return '';
  const rec = specialty as Record<string, unknown>;
  return String(rec.name ?? rec.label ?? rec.title ?? '');
}

/** Tri chronologique de créneaux (date puis heure). */
export function compareSlots(
  a: { date: string; startTime: string },
  b: { date: string; startTime: string }
): number {
  return a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime);
}