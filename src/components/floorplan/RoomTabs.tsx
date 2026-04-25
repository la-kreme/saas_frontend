import { Plus } from 'lucide-react';
import type { Room } from '../../lib/types';

interface Props {
  rooms: Room[];
  activeRoomId: string;
  onSwitch: (roomId: string) => void;
  onAdd: () => void;
}

export function RoomTabs({ rooms, activeRoomId, onSwitch, onAdd }: Props) {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {rooms.map((room) => (
        <button
          key={room.id}
          className={`btn btn-sm ${room.id === activeRoomId ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => onSwitch(room.id)}
        >
          {room.name}
        </button>
      ))}
      <button className="btn btn-sm btn-ghost" onClick={onAdd} title="Nouvelle salle">
        <Plus size={14} />
      </button>
    </div>
  );
}
