const TABLE_UNIT = 80;

/**
 * Taille visuelle d'une table en fonction du nombre de couverts.
 * 2 couverts = 80×80. 4 = 160×80 (2 unités collées sur la largeur).
 * 6 = 240×80, etc. Retourne { w, h }.
 */
export function tableDisplaySize(seats: number): { w: number; h: number } {
  const units = Math.max(1, Math.ceil(seats / 2));
  return { w: TABLE_UNIT * units, h: TABLE_UNIT };
}

/** Snap-to-grid à 10px */
export const GRID_SIZE = 10;

export function snapToGrid(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

/**
 * Trouve une position libre sur le canvas en scannant une grille.
 * Parcourt colonne par colonne (spacing de 100px) puis ligne par ligne,
 * et retourne la première case qui ne chevauche aucune table existante.
 */
export function findFreePosition(
  existing: { pos_x: number; pos_y: number; seats: number }[],
  canvasWidth: number,
  canvasHeight: number,
  newSeats = 4,
): { x: number; y: number } {
  const newSize = tableDisplaySize(newSeats);
  const pad = 20;
  const step = TABLE_UNIT + pad;

  for (let y = 40; y + newSize.h <= canvasHeight; y += step) {
    for (let x = 40; x + newSize.w <= canvasWidth; x += step) {
      const overlaps = existing.some(t => {
        const ts = tableDisplaySize(t.seats);
        return (
          x < t.pos_x + ts.w &&
          x + newSize.w > t.pos_x &&
          y < t.pos_y + ts.h &&
          y + newSize.h > t.pos_y
        );
      });
      if (!overlaps) return { x, y };
    }
  }
  const maxY = existing.reduce((m, t) => Math.max(m, t.pos_y + tableDisplaySize(t.seats).h), 0);
  return { x: 40, y: maxY + pad };
}

export function boundingBox(
  positions: { pos_x: number; pos_y: number; width: number; height: number }[]
): { x: number; y: number; width: number; height: number } {
  if (positions.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of positions) {
    minX = Math.min(minX, p.pos_x);
    minY = Math.min(minY, p.pos_y);
    maxX = Math.max(maxX, p.pos_x + p.width);
    maxY = Math.max(maxY, p.pos_y + p.height);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
