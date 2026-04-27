/** Format date longue : "samedi 26 avril 2026" */
export function fmtDateLong(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

/** Format date courte : "26 avr." */
export function fmtDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

/** Tronque "HH:MM:SS" en "HH:MM" */
export function fmtTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}

/** Extrait l'heure entiere d'un "HH:MM" */
export function parseHour(timeStr: string): number {
  return parseInt(timeStr.split(':')[0]) || 0;
}
