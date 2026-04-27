import { useRef } from 'react';
import type { TableItem } from '../../lib/types';
import { tableDisplaySize } from '../../lib/floorplan/geometry';

const PRIMARY = '#ED73A9';
const BG_CARD = '#FFFFFF';

interface Props {
  table: TableItem;
  selected: boolean;
  showEditBtn?: boolean;
  onSelect: (id: string, additive: boolean) => void;
  onDrag: (id: string, x: number, y: number) => void;
  onDragEnd: (id: string) => void;
  onEdit?: (id: string) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
  mobile?: boolean;
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

export function TableShape({ table, selected, showEditBtn = false, onSelect, onDrag, onDragEnd, onEdit, svgRef, mobile }: Props) {
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
        y={cy - (mobile ? 8 : 6)}
        textAnchor="middle"
        fontSize={mobile ? 18 : 12}
        fontWeight={600}
        fill={selected ? '#fff' : 'var(--lk-text-base)'}
      >
        {table.name}
      </text>
      <text
        x={cx}
        y={cy + (mobile ? 14 : 10)}
        textAnchor="middle"
        fontSize={mobile ? 14 : 10}
        fill={selected ? 'rgba(255,255,255,0.9)' : 'var(--lk-text-muted)'}
      >
        {table.seats} pl.
      </text>

      {/* Edit button — visible when selected */}
      {selected && showEditBtn && onEdit && (() => {
        const bx = table.pos_x + w - 24;
        const by = table.pos_y - 4;
        return (
          <g
            onClick={(e) => { e.stopPropagation(); onEdit(table.id); }}
            style={{ cursor: 'pointer' }}
          >
            <rect
              x={bx}
              y={by}
              width={26}
              height={26}
              rx={7}
              fill={BG_CARD}
              stroke={PRIMARY}
              strokeWidth={1.5}
            />
            {/* Lucide Pencil icon — 24x24 viewBox, scaled to 14x14 */}
            <g transform={`translate(${bx + 6}, ${by + 6}) scale(0.583)`}>
              <path
                d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"
                fill="none"
                stroke={PRIMARY}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="m15 5 4 4"
                fill="none"
                stroke={PRIMARY}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </g>
        );
      })()}
    </g>
  );
}
