// ─── Application Constants ────────────────────────────────────────────────────
// Centralised constants to avoid magic strings/numbers scattered across components.

/** Days of the week in French, Monday-indexed (0=Lundi). */
export const DAYS_OF_WEEK = [
  'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche',
] as const;

/** Accent color presets for widget customisation. */
export const COLOR_PRESETS = [
  '#ED73A9', '#7CC0E8', '#C6546D', '#00B4D8', '#FF6B35', '#F59E0B',
] as const;

/** Reservation status labels (FR). */
export const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmé',
  pending: 'En attente',
  cancelled: 'Annulé',
  no_show: 'No-show',
};

/** Confirmation mode options for the widget. */
export const CONFIRMATION_MODES = [
  {
    value: 'auto' as const,
    label: '⚡ Automatique',
    desc: 'La réservation est confirmée instantanément. Idéal pour les restaurants très organisés.',
  },
  {
    value: 'manual' as const,
    label: '✋ Manuelle',
    desc: 'Vous validez chaque réservation depuis votre dashboard. Plus de contrôle.',
  },
] as const;

/** Platform installation guides for the widget snippet. */
export const WIDGET_PLATFORMS = [
  {
    name: 'WordPress',
    icon: '🟦',
    steps: 'Éditeur de blocs → Ajouter un bloc → « HTML personnalisé » → Coller le code',
  },
  {
    name: 'Wix',
    icon: '🟪',
    steps: 'Ajouter → Plus → HTML/iFrame → Coller le code dans la fenêtre',
  },
  {
    name: 'Squarespace',
    icon: '⬛',
    steps: 'Modifier une page → Insérer un bloc → Code → Coller le code',
  },
  {
    name: 'Webflow',
    icon: '🔵',
    steps: 'Composants → Embed → Coller le code → Publier',
  },
  {
    name: 'HTML pur',
    icon: '🟠',
    steps: 'Coller le snippet juste avant </body> dans votre fichier HTML',
  },
] as const;

/** Standard UI timing constants (ms). */
export const TIMING = {
  /** Feedback duration for clipboard "Copied!" state */
  CLIPBOARD_FEEDBACK_MS: 2000,
  /** Debounce delay for search inputs */
  SEARCH_DEBOUNCE_MS: 300,
  /** Timeout before showing "loading too long" states */
  LOADING_TIMEOUT_MS: 3000,
  /** Delay before redirect after activation */
  ACTIVATION_REDIRECT_MS: 1500,
} as const;
