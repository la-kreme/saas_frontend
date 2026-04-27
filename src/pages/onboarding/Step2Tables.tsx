import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, Users } from 'lucide-react';
import {
  getFloorplan, getRooms, createRoom, createTable, updateTable,
  deleteTable, bulkUpdateTablePositions, getErrorMessage,
} from '../../lib/api';
import type { TableItem } from '../../lib/types';
import { useFloorplanState } from '../../lib/floorplan/useFloorplanState';
import { snapToGrid, findFreePosition } from '../../lib/floorplan/geometry';
import { FloorplanCanvas } from '../../components/floorplan/FloorplanCanvas';
import { TableInspector } from '../../components/floorplan/TableInspector';

interface Step2Props {
  onNext?: () => void;
  hideBack?: boolean;
}

export default function Step2Tables({ onNext, hideBack }: Step2Props = {}) {
  const navigate = useNavigate();
  const { state, dispatch } = useFloorplanState();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Assurer qu'une room existe
      let rooms = await getRooms();
      if (rooms.length === 0) {
        const room = await createRoom({ name: 'Salle principale' });
        rooms = [room];
      }
      const data = await getFloorplan();
      dispatch({
        type: 'SET_DATA',
        rooms: data.rooms.length > 0 ? data.rooms : rooms,
        tables: data.tables,
        merges: [],
        reservations: [],
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => { loadData(); }, [loadData]);

  const activeRoom = state.rooms.find(r => r.id === state.activeRoomId);
  const roomTables = state.tables.filter(t => t.room_id === state.activeRoomId);
  const selectedTable = state.selectedIds.size === 1
    ? state.tables.find(t => t.id === [...state.selectedIds][0])
    : null;

  const totalCapacity = state.tables.reduce((sum, t) => sum + t.seats, 0);
  const isValid = state.tables.length > 0 && state.tables.every(t => t.seats > 0);

  const handleSelect = (id: string, additive: boolean) => {
    if (additive) dispatch({ type: 'ADD_TO_SELECTION', id });
    else dispatch({ type: 'SELECT_TABLE', id });
  };

  const handleDrag = (id: string, x: number, y: number) => {
    dispatch({ type: 'DRAG_TABLE', id, pos_x: x, pos_y: y });
  };

  const handleDragEnd = (id: string) => {
    const table = state.tables.find(t => t.id === id);
    if (table) {
      dispatch({ type: 'DRAG_TABLE', id, pos_x: snapToGrid(table.pos_x), pos_y: snapToGrid(table.pos_y) });
    }
  };

  const handleAddTable = async () => {
    if (!activeRoom) return;
    const pos = findFreePosition(roomTables, activeRoom.canvas_width, activeRoom.canvas_height);
    try {
      const newTable = await createTable({
        name: `Table ${state.tables.length + 1}`,
        seats: 2,
        room_id: activeRoom.id,
        pos_x: pos.x,
        pos_y: pos.y,
        shape: 'rect',
      });
      dispatch({ type: 'ADD_TABLE', table: newTable });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleUpdateTable = async (id: string, updates: Partial<TableItem>) => {
    dispatch({ type: 'UPDATE_TABLE', id, updates });
    try {
      await updateTable(id, updates);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteTable = async (id: string) => {
    try {
      await deleteTable(id);
      dispatch({ type: 'REMOVE_TABLE', id });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleNext = async () => {
    setSaving(true);
    setError('');
    try {
      // Sauvegarder les positions
      const updates = state.tables.map(t => ({
        id: t.id,
        pos_x: t.pos_x,
        pos_y: t.pos_y,
        room_id: t.room_id,
        rotation: t.rotation,
      }));
      if (updates.length > 0) {
        await bulkUpdateTablePositions(updates);
      }
      if (onNext) onNext();
      else navigate('/onboarding/hours');
    } catch (err) {
      setError(getErrorMessage(err, 'Erreur lors de la sauvegarde.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '12px' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--lk-purple-light)' }} />
      </div>
    );
  }

  return (
    <>
      <div className="onboarding-step-header">
        <div className="onboarding-step-number">Etape 2 sur 5</div>
        <h1 className="onboarding-step-title">Plan de salle</h1>
        <p className="onboarding-step-desc">
          Positionnez vos tables sur le plan. Cliquez sur une table pour modifier
          ses proprietes (nom, places, forme).
        </p>
      </div>

      <button className="btn btn-secondary" style={{ marginBottom: '12px' }} onClick={handleAddTable}>
        <Plus size={14} /> Ajouter une table
      </button>

      <div style={{ position: 'relative', minHeight: '400px', border: '1px solid var(--lk-border)', borderRadius: 'var(--radius)' }}>
        {activeRoom && (
          <FloorplanCanvas
            room={activeRoom}
            tables={roomTables}
            merges={[]}
            selectedIds={state.selectedIds}
            onSelect={handleSelect}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onClearSelection={() => dispatch({ type: 'CLEAR_SELECTION' })}
          />
        )}
        {state.inspectorOpen && selectedTable && (
          <TableInspector
            table={selectedTable}
            onUpdate={handleUpdateTable}
            onDelete={handleDeleteTable}
            onClose={() => dispatch({ type: 'CLEAR_SELECTION' })}
          />
        )}
      </div>

      <div style={{
        marginTop: '16px', padding: '12px 16px',
        background: 'var(--lk-purple-muted)', borderRadius: 'var(--radius)',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <Users size={14} style={{ color: 'var(--lk-purple-light)' }} />
        <span className="text-sm" style={{ color: 'var(--lk-purple-light)', fontWeight: 600 }}>
          Capacite totale : {totalCapacity} couverts — {state.tables.length} table{state.tables.length > 1 ? 's' : ''}
        </span>
      </div>

      {error && <p className="form-error" style={{ marginTop: '12px' }}>{error}</p>}

      <div className="onboarding-actions">
        {!hideBack && (
          <button className="btn btn-ghost" onClick={() => navigate('/onboarding/link')}>
            Retour
          </button>
        )}
        <button
          id="btn-step2-next"
          className="btn btn-primary btn-lg"
          disabled={!isValid || saving}
          onClick={handleNext}
        >
          {saving
            ? <><Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> Sauvegarde...</>
            : 'Continuer'
          }
        </button>
      </div>
    </>
  );
}
