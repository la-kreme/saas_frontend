import { Plus } from 'lucide-react';
import type { Room } from '../../lib/types';
import { FilterPill } from '../ui/FilterPill';

interface Props {
  rooms: Room[];
  activeRoomId: string;
  onSwitch: (roomId: string) => void;
  onAdd: () => void;
}

export function RoomTabs({ rooms, activeRoomId, onSwitch, onAdd }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {rooms.map((room) => (
        <FilterPill
          key={room.id}
          active={room.id === activeRoomId}
          onClick={() => onSwitch(room.id)}
        >
          {room.name}
        </FilterPill>
      ))}
      <button
        onClick={onAdd}
        title="Nouvelle salle"
        style={{
          padding: '6px 10px',
          fontSize: 'var(--fs-sm)',
          color: 'var(--lk-text-muted)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <Plus size={13} /> Zone
      </button>
    </div>
  );
}
