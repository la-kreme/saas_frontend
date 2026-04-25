import { useRef } from 'react';
import type { Merge, TableItem } from '../../lib/types';
import { boundingBox } from '../../lib/floorplan/geometry';

interface Props {
  merge: Merge;
  memberTables: TableItem[];
  selected: boolean;
  onSelect: (id: string) => void;
  onDragBlob: (mergeId: string, dx: number, dy: number) => void;
  onDragBlobEnd: (mergeId: string) => void;
}

export function MergeBlob({ merge, memberTables, selected, onSelect, onDragBlob, onDragBlobEnd }: Props) {
  const dragState = useRef<{ startX: number; startY: number } | null>(null);
  const bbox = boundingBox(memberTables);

  const padding = 12;
  const x = bbox.x - padding;
  const y = bbox.y - padding;
  const w = bbox.width + padding * 2;
  const h = bbox.height + padding * 2;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY };
    onSelect(merge.id);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    onDragBlob(merge.id, dx, dy);
    dragState.current = { startX: e.clientX, startY: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (dragState.current) {
      onDragBlobEnd(merge.id);
      dragState.current = null;
    }
  };

  return (
    <g
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ cursor: 'grab', touchAction: 'none' }}
    >
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={14}
        fill={selected ? 'rgba(124, 192, 232, 0.15)' : 'rgba(237, 115, 169, 0.08)'}
        stroke={selected ? 'var(--lk-secondary)' : 'var(--lk-primary)'}
        strokeWidth={2}
        strokeDasharray={merge.scope === 'permanent' ? 'none' : '6 3'}
      />
      <text
        x={x + 8}
        y={y + 14}
        fontSize={10}
        fontWeight={600}
        fill="var(--lk-primary)"
      >
        {merge.label || `Merge (${merge.capacity}pl.)`}
      </text>
    </g>
  );
}
