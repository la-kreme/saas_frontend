const TABLE_UNIT = 80;

/**
 * Taille visuelle d'une table en fonction du nombre de couverts.
 * 2 couverts = 80x80. 4 = 160x80 (2 unites collees sur la largeur).
 */
export function tableDisplaySize(seats: number): { w: number; h: number } {
  const units = Math.max(1, Math.ceil(seats / 2));
  return { w: TABLE_UNIT * units, h: TABLE_UNIT };
}

/** Bounding box d'une table apres rotation (en SVG user space). */
export function tableRotatedBBox(t: { pos_x: number; pos_y: number; seats: number; rotation?: number }): {
  x: number; y: number; w: number; h: number;
} {
  const { w, h } = tableDisplaySize(t.seats);
  const rot = t.rotation ?? 0;
  if (rot === 0) return { x: t.pos_x, y: t.pos_y, w, h };

  const cx = t.pos_x + w / 2;
  const cy = t.pos_y + h / 2;
  const rad = (rot * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const corners = [
    { x: t.pos_x, y: t.pos_y },
    { x: t.pos_x + w, y: t.pos_y },
    { x: t.pos_x + w, y: t.pos_y + h },
    { x: t.pos_x, y: t.pos_y + h },
  ];

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const c of corners) {
    const dx = c.x - cx;
    const dy = c.y - cy;
    const rx = cx + dx * cos - dy * sin;
    const ry = cy + dx * sin + dy * cos;
    minX = Math.min(minX, rx);
    minY = Math.min(minY, ry);
    maxX = Math.max(maxX, rx);
    maxY = Math.max(maxY, ry);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/** Snap-to-grid a 10px */
export const GRID_SIZE = 10;

export function snapToGrid(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

/** Clamp une position dans les bounds du canvas. */
export function clampPosition(
  x: number, y: number,
  tableW: number, tableH: number,
  canvasW: number, canvasH: number,
): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(x, canvasW - tableW)),
    y: Math.max(0, Math.min(y, canvasH - tableH)),
  };
}

/**
 * Trouve une position libre sur le canvas en scannant une grille.
 * Tient compte de la rotation des tables existantes.
 */
export function findFreePosition(
  existing: { pos_x: number; pos_y: number; seats: number; rotation?: number }[],
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
        const bb = tableRotatedBBox(t);
        return (
          x < bb.x + bb.w &&
          x + newSize.w > bb.x &&
          y < bb.y + bb.h &&
          y + newSize.h > bb.y
        );
      });
      if (!overlaps) return { x, y };
    }
  }
  const maxY = existing.reduce((m, t) => Math.max(m, t.pos_y + tableRotatedBBox(t).h), 0);
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
