import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import type { Room } from '../../lib/types';

interface Props {
  room: Room | null;
  isNew: boolean;
  onSave: (data: { name: string; canvas_width: number; canvas_height: number }) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function RoomConfigDrawer({ room, isNew, onSave, onDelete, onClose }: Props) {
  const [name, setName] = useState(room?.name ?? 'Nouvelle salle');
  const [width, setWidth] = useState(room?.canvas_width ?? 1200);
  const [height, setHeight] = useState(room?.canvas_height ?? 800);

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0,
      width: '320px', background: 'var(--lk-bg-base)',
      borderLeft: '1px solid var(--lk-border)',
      boxShadow: '-4px 0 12px rgba(0,0,0,0.08)',
      zIndex: 50, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>
          {isNew ? 'Nouvelle salle' : 'Modifier la salle'}
        </h3>
        <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
      </div>

      <div className="form-group">
        <label>Nom</label>
        <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Largeur</label>
          <input className="form-input" type="number" value={width} onChange={(e) => setWidth(+e.target.value)} />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Hauteur</label>
          <input className="form-input" type="number" value={height} onChange={(e) => setHeight(+e.target.value)} />
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={() => onSave({ name, canvas_width: width, canvas_height: height })}
      >
        {isNew ? 'Créer' : 'Enregistrer'}
      </button>

      {!isNew && (
        <button
          className="btn btn-ghost"
          style={{ color: 'var(--lk-error)' }}
          onClick={onDelete}
        >
          <Trash2 size={14} /> Supprimer la salle
        </button>
      )}
    </div>
  );
}
