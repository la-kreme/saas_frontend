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
    <div className="lk-fp-room-tabs">
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
        className="lk-fp-room-add-btn"
      >
        <Plus size={13} /> Zone
      </button>
    </div>
  );
}
