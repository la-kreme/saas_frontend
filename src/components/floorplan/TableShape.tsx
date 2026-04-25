import { useRef } from 'react';
import type { TableItem } from '../../lib/types';
import { tableDisplaySize } from '../../lib/floorplan/geometry';

const PRIMARY = '#ED73A9';
const BG_CARD = '#FFFFFF';

interface Props {
  table: TableItem;
  selected: boolean;
  onSelect: (id: string, additive: boolean) => void;
  onDrag: (id: string, x: number, y: number) => void;
  onDragEnd: (id: string) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
}

/** Convert a screen point to SVG user-space coordinates via getScreenCTM. */
function clientToSvg(svg: SVGSVGElement, clientX: number, clientY: number) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: clientX, y: clientY };
  return pt.matrixTransform(ctm.inverse());
}

export function TableShape({ table, selected, onSelect, onDrag, onDragEnd, svgRef }: Props) {
  const dragState = useRef<{ offsetX: number; offsetY: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const svg = svgRef.current;
    if (svg) {
      const pt = clientToSvg(svg, e.clientX, e.clientY);
      dragState.current = { offsetX: pt.x - table.pos_x, offsetY: pt.y - table.pos_y };
    }
    onSelect(table.id, e.shiftKey);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState.current) return;
    const svg = svgRef.current;
    if (!svg) return;
    const pt = clientToSvg(svg, e.clientX, e.clientY);
    onDrag(table.id, pt.x - dragState.current.offsetX, pt.y - dragState.current.offsetY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (dragState.current) {
      onDragEnd(table.id);
      dragState.current = null;
    }
  };

  const { w, h } = tableDisplaySize(table.seats);
  const cx = table.pos_x + w / 2;
  const cy = table.pos_y + h / 2;

  return (
    <g
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ cursor: 'grab', touchAction: 'none' }}
      transform={table.rotation ? `rotate(${table.rotation} ${cx} ${cy})` : undefined}
    >
      {table.shape === 'circle' ? (
        <ellipse
          cx={cx}
          cy={cy}
          rx={w / 2}
          ry={h / 2}
          fill={selected ? PRIMARY : BG_CARD}
          stroke={PRIMARY}
          strokeWidth={2}
          opacity={table.is_active ? 1 : 0.4}
        />
      ) : (
        <rect
          x={table.pos_x}
          y={table.pos_y}
          width={w}
          height={h}
          rx={8}
          fill={selected ? PRIMARY : BG_CARD}
          stroke={PRIMARY}
          strokeWidth={2}
          opacity={table.is_active ? 1 : 0.4}
        />
      )}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fontSize={12}
        fontWeight={600}
        fill={selected ? '#fff' : 'var(--lk-text-base)'}
      >
        {table.name}
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        fontSize={10}
        fill={selected ? 'rgba(255,255,255,0.9)' : 'var(--lk-text-muted)'}
      >
        {table.seats} pl.
      </text>
    </g>
  );
}
