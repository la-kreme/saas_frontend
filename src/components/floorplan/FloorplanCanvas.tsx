import { useRef, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import type { TableItem, Room, Merge } from '../../lib/types';
import { TableShape } from './TableShape';
import { tableDisplaySize } from '../../lib/floorplan/geometry';

interface Props {
  room: Room;
  tables: TableItem[];
  merges: Merge[];
  selectedIds: Set<string>;
  onSelect: (id: string, additive: boolean) => void;
  onDrag: (id: string, x: number, y: number) => void;
  onDragEnd: (id: string) => void;
  onClearSelection: () => void;
}

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.15;

/** Tourne un point (px, py) autour du centre (cx, cy) de `deg` degrés. */
function rotatePoint(px: number, py: number, cx: number, cy: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = px - cx;
  const dy = py - cy;
  return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
}

/** Calcule la bounding box d'un merge en tenant compte de la rotation des tables. */
function mergeBBox(merge: Merge, tables: TableItem[]) {
  const members = tables.filter(t => merge.member_table_ids.includes(t.id));
  if (members.length === 0) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const t of members) {
    const { w, h } = tableDisplaySize(t.seats);
    const cx = t.pos_x + w / 2;
    const cy = t.pos_y + h / 2;
    // Les 4 coins du rectangle avant rotation
    const corners = [
      { x: t.pos_x, y: t.pos_y },
      { x: t.pos_x + w, y: t.pos_y },
      { x: t.pos_x + w, y: t.pos_y + h },
      { x: t.pos_x, y: t.pos_y + h },
    ];
    // Tourner chaque coin et étendre la bbox
    for (const c of corners) {
      const r = t.rotation ? rotatePoint(c.x, c.y, cx, cy, t.rotation) : c;
      minX = Math.min(minX, r.x);
      minY = Math.min(minY, r.y);
      maxX = Math.max(maxX, r.x);
      maxY = Math.max(maxY, r.y);
    }
  }
  const pad = 10;
  return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
}

const SCOPE_COLORS: Record<string, string> = {
  permanent: '#ED73A9',
  service: '#7CC0E8',
  meal: '#F59E0B',
};

export function FloorplanCanvas({
  room,
  tables,
  merges,
  selectedIds,
  onSelect,
  onDrag,
  onDragEnd,
  onClearSelection,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const panState = useRef<{ startX: number; startY: number; basePanX: number; basePanY: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);

  const vbW = room.canvas_width / zoom;
  const vbH = room.canvas_height / zoom;
  const viewBox = `${panX} ${panY} ${vbW} ${vbH}`;

  const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    // Mouse position as fraction of the SVG element
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;

    const oldZoom = zoom;
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    const newZoom = clampZoom(oldZoom + delta);
    if (newZoom === oldZoom) return;

    // Adjust pan so the point under the mouse stays fixed
    const oldW = room.canvas_width / oldZoom;
    const oldH = room.canvas_height / oldZoom;
    const newW = room.canvas_width / newZoom;
    const newH = room.canvas_height / newZoom;

    setPanX(prev => prev + (oldW - newW) * mx);
    setPanY(prev => prev + (oldH - newH) * my);
    setZoom(newZoom);
  }, [zoom, room.canvas_width, room.canvas_height]);

  const zoomIn = () => {
    const newZoom = clampZoom(zoom + ZOOM_STEP);
    const dw = room.canvas_width / zoom - room.canvas_width / newZoom;
    const dh = room.canvas_height / zoom - room.canvas_height / newZoom;
    setPanX(p => p + dw / 2);
    setPanY(p => p + dh / 2);
    setZoom(newZoom);
  };

  const zoomOut = () => {
    const newZoom = clampZoom(zoom - ZOOM_STEP);
    const dw = room.canvas_width / zoom - room.canvas_width / newZoom;
    const dh = room.canvas_height / zoom - room.canvas_height / newZoom;
    setPanX(p => p + dw / 2);
    setPanY(p => p + dh / 2);
    setZoom(newZoom);
  };

  const resetZoom = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  // Pan : clic gauche sur le fond du canvas + déplacement
  // Les tables interceptent le pointer (stopPropagation), donc seul le fond arrive ici.
  const handleBgPointerDown = (e: React.PointerEvent) => {
    // Laisser passer uniquement les clics sur le fond SVG ou la grille rect
    const tag = (e.target as Element).tagName;
    const isBackground = e.target === e.currentTarget || tag === 'rect';
    if (!isBackground) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    panState.current = {
      startX: e.clientX, startY: e.clientY,
      basePanX: panX, basePanY: panY,
    };
    setIsPanning(true);
    onClearSelection();
  };

  const handleBgPointerMove = (e: React.PointerEvent) => {
    if (!panState.current) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = vbW / rect.width;
    const scaleY = vbH / rect.height;
    const dx = (e.clientX - panState.current.startX) * scaleX;
    const dy = (e.clientY - panState.current.startY) * scaleY;
    setPanX(panState.current.basePanX - dx);
    setPanY(panState.current.basePanY - dy);
  };

  const handleBgPointerUp = (e: React.PointerEvent) => {
    if (panState.current) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      panState.current = null;
      setIsPanning(false);
    }
  };

  return (
    <div className="lk-fp-canvas-wrap">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={viewBox}
        className={`lk-fp-canvas-svg ${isPanning ? 'lk-fp-canvas-svg--grabbing' : 'lk-fp-canvas-svg--grab'}`}
        onWheel={handleWheel}
        onPointerDown={handleBgPointerDown}
        onPointerMove={handleBgPointerMove}
        onPointerUp={handleBgPointerUp}
      >
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="var(--lk-border)" strokeWidth="0.3" opacity="0.5" />
          </pattern>
        </defs>
        <rect width={room.canvas_width} height={room.canvas_height} fill="url(#grid)" />

        {/* Contours des merges */}
        {merges.map((merge) => {
          const bb = mergeBBox(merge, tables);
          if (!bb) return null;
          const color = SCOPE_COLORS[merge.scope] ?? '#ED73A9';
          return (
            <g key={merge.id}>
              <rect
                x={bb.x}
                y={bb.y}
                width={bb.w}
                height={bb.h}
                rx={14}
                fill={color}
                fillOpacity={0.08}
                stroke={color}
                strokeWidth={2}
                strokeDasharray={merge.scope === 'permanent' ? 'none' : '8 4'}
              />
              <text
                x={bb.x + 8}
                y={bb.y - 4}
                fontSize={11}
                fontWeight={600}
                fill={color}
              >
                {merge.label || `Merge · ${merge.capacity} pl.`}
                {merge.scope !== 'permanent' && ` (${merge.scope})`}
              </text>
            </g>
          );
        })}

        {tables.map((table) => (
          <TableShape
            key={table.id}
            table={table}
            selected={selectedIds.has(table.id)}
            onSelect={onSelect}
            onDrag={onDrag}
            onDragEnd={onDragEnd}
            svgRef={svgRef}
          />
        ))}
      </svg>

      {/* Zoom controls */}
      <div className="lk-fp-zoom-controls">
        <button className="btn btn-ghost btn-sm lk-fp-zoom-btn" onClick={zoomOut} title="Dezoomer">
          <ZoomOut size={14} />
        </button>
        <button
          className="btn btn-ghost btn-sm lk-fp-zoom-label"
          onClick={resetZoom}
          title="Reinitialiser"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button className="btn btn-ghost btn-sm lk-fp-zoom-btn" onClick={zoomIn} title="Zoomer">
          <ZoomIn size={14} />
        </button>
        <button className="btn btn-ghost btn-sm lk-fp-zoom-btn" onClick={resetZoom} title="Recentrer">
          <Maximize size={14} />
        </button>
      </div>
    </div>
  );
}
