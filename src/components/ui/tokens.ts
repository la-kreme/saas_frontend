/**
 * CSS token values typees pour usage inline en React CSSProperties.
 * Evite le hack `as unknown as number` sur fontWeight.
 */

export const fw = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/** Tokens couleur repetes en inline qui ne sont pas dans :root */
export const colors = {
  primaryBorderTint: 'rgba(237, 115, 169, 0.18)',
  primaryBgTint: 'rgba(237, 115, 169, 0.25)',
  errorBorderTint: 'rgba(239, 68, 68, 0.25)',
  warningBorderTint: 'rgba(245, 158, 11, 0.3)',
} as const;

export const zIndex = {
  modal: 9999,
  drawer: 60,
  topbar: 50,
} as const;
