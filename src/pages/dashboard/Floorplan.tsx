import { useEffect, useState, useCallback } from 'react';
import { Plus, Save, Loader2 } from 'lucide-react';
import {
  getFloorplan, createTable, updateTable, deleteTable,
  bulkUpdateTablePositions, createRoom, updateRoom, deleteRoom,
  previewMerge, createMerge, deleteMerge, createMergeWithReservation,
  getErrorMessage,
} from '../../lib/api';
import type { TableItem, Room, MergePreview } from '../../lib/types';
import { useFloorplanState } from '../../lib/floorplan/useFloorplanState';
import { snapToGrid, findFreePosition } from '../../lib/floorplan/geometry';
import { FloorplanCanvas } from '../../components/floorplan/FloorplanCanvas';
import { RoomTabs } from '../../components/floorplan/RoomTabs';
import { RoomConfigDrawer } from '../../components/floorplan/RoomConfigDrawer';
import { TableInspector } from '../../components/floorplan/TableInspector';
import { ServiceModePicker } from '../../components/floorplan/ServiceModePicker';
import { MergeQuickToolbar } from '../../components/floorplan/MergeQuickToolbar';
import { MergeDialog } from '../../components/floorplan/MergeDialog';
import { RelocationConfirmDialog } from '../../components/floorplan/RelocationConfirmDialog';
import { NewReservationDrawer } from '../../components/floorplan/NewReservationDrawer';

export default function Floorplan() {
  const { state, dispatch } = useFloorplanState();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [roomDrawer, setRoomDrawer] = useState<{ room: Room | null; isNew: boolean } | null>(null);
  const [mergePreview, setMergePreview] = useState<MergePreview | null>(null);
  const [pendingMergeData, setPendingMergeData] = useState<{ scope: string; valid_from?: string; valid_until?: string; label?: string } | null>(null);

  // Charger le floorplan
  const loadData = useCallback(async (date?: string) => {
    try {
      setLoading(true);
      const data = await getFloorplan(date ?? undefined);
      dispatch({
        type: 'SET_DATA',
        rooms: data.rooms,
        tables: data.tables,
        merges: data.merges,
        reservations: data.reservations,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => { loadData(state.pickerDate ?? undefined); }, [loadData, state.pickerDate]);

  const activeRoom = state.rooms.find(r => r.id === state.activeRoomId);
  const roomTables = state.tables.filter(t => t.room_id === state.activeRoomId);
  const selectedTable = state.selectedIds.size === 1
    ? state.tables.find(t => t.id === [...state.selectedIds][0])
    : null;

  // Handlers
  const handleSelect = (id: string, additive: boolean) => {
    if (additive) {
      dispatch({ type: 'ADD_TO_SELECTION', id });
    } else {
      dispatch({ type: 'SELECT_TABLE', id });
    }
  };

  const handleDrag = (id: string, x: number, y: number) => {
    dispatch({ type: 'DRAG_TABLE', id, pos_x: x, pos_y: y });
  };

  const handleDragEnd = (id: string) => {
    const table = state.tables.find(t => t.id === id);
    if (table) {
      dispatch({
        type: 'DRAG_TABLE',
        id,
        pos_x: snapToGrid(table.pos_x),
        pos_y: snapToGrid(table.pos_y),
      });
    }
  };

  const handleAddTable = async () => {
    if (!activeRoom) return;
    const pos = findFreePosition(roomTables, activeRoom.canvas_width, activeRoom.canvas_height);
    try {
      const newTable = await createTable({
        name: `T${state.tables.length + 1}`,
        seats: 4,
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

  const handleSave = async () => {
    try {
      setSaving(true);
      const updates = state.tables
        .filter(t => t.room_id === state.activeRoomId)
        .map(t => ({
          id: t.id,
          pos_x: t.pos_x,
          pos_y: t.pos_y,
          room_id: t.room_id,
          rotation: t.rotation,
        }));
      await bulkUpdateTablePositions(updates);
      dispatch({ type: 'SET_DIRTY', dirty: false });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAddRoom = () => {
    setRoomDrawer({ room: null, isNew: true });
  };

  const handleSaveRoom = async (data: { name: string; canvas_width: number; canvas_height: number }) => {
    try {
      if (roomDrawer?.isNew) {
        const room = await createRoom(data);
        dispatch({ type: 'ADD_ROOM', room });
        dispatch({ type: 'SET_ACTIVE_ROOM', roomId: room.id });
      } else if (roomDrawer?.room) {
        const updated = await updateRoom(roomDrawer.room.id, data);
        dispatch({ type: 'UPDATE_ROOM', id: updated.id, updates: data });
      }
      setRoomDrawer(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomDrawer?.room) return;
    try {
      await deleteRoom(roomDrawer.room.id);
      dispatch({ type: 'REMOVE_ROOM', id: roomDrawer.room.id });
      setRoomDrawer(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Mode Service handlers
  const handleDateChange = (date: string | null) => {
    dispatch({ type: 'SET_PICKER_DATE', date });
  };

  const handleRequestMerge = (scope: 'meal' | 'service' | 'permanent') => {
    const tableIds = [...state.selectedIds];
    dispatch({ type: 'OPEN_MERGE_DIALOG', scope, tableIds });
  };

  const handleMergeDialogConfirm = async (data: { scope: string; valid_from?: string; valid_until?: string; label?: string }) => {
    if (!state.mergeDialog || !state.activeRoomId) return;
    try {
      const preview = await previewMerge({
        room_id: state.activeRoomId,
        member_table_ids: state.mergeDialog.tableIds,
        scope: data.scope as 'meal' | 'service' | 'permanent',
        valid_from: data.valid_from,
        valid_until: data.valid_until,
        label: data.label,
      });
      dispatch({ type: 'CLOSE_MERGE_DIALOG' });

      if (preview.status === 'ok') {
        const merge = await createMerge({
          room_id: state.activeRoomId,
          member_table_ids: state.mergeDialog.tableIds,
          scope: data.scope as 'meal' | 'service' | 'permanent',
          valid_from: data.valid_from,
          valid_until: data.valid_until,
          label: data.label,
        });
        dispatch({ type: 'ADD_MERGE', merge });
        dispatch({ type: 'CLEAR_SELECTION' });
      } else {
        setMergePreview(preview);
        setPendingMergeData(data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
      dispatch({ type: 'CLOSE_MERGE_DIALOG' });
    }
  };

  const handleRelocationConfirm = async () => {
    if (!pendingMergeData || !state.activeRoomId) return;
    try {
      const merge = await createMerge({
        room_id: state.activeRoomId,
        member_table_ids: state.mergeDialog?.tableIds ?? [...state.selectedIds],
        scope: pendingMergeData.scope as 'meal' | 'service' | 'permanent',
        valid_from: pendingMergeData.valid_from,
        valid_until: pendingMergeData.valid_until,
        label: pendingMergeData.label,
        accept_relocations: true,
      });
      dispatch({ type: 'ADD_MERGE', merge });
      dispatch({ type: 'CLEAR_SELECTION' });
      setMergePreview(null);
      setPendingMergeData(null);
      loadData(state.pickerDate ?? undefined);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const _handleDeleteMerge = async (mergeId: string) => {
    try {
      await deleteMerge(mergeId);
      dispatch({ type: 'REMOVE_MERGE', id: mergeId });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };
  void _handleDeleteMerge; // Sera utilisé en Mode Service (context menu sur merge)

  const handleNewResaSubmit = async (data: {
    reservation_date: string; reservation_time: string; guests: number;
    guest_first_name: string; guest_last_name: string;
    guest_email?: string; guest_phone?: string; notes?: string;
  }) => {
    if (!state.newResaDrawer || !state.activeRoomId) return;
    const merge = state.merges.find(m => m.id === state.newResaDrawer!.mergeId);
    if (!merge) return;
    try {
      await createMergeWithReservation({
        merge: {
          room_id: merge.room_id,
          member_table_ids: merge.member_table_ids,
          scope: merge.scope,
          valid_from: merge.valid_from,
          valid_until: merge.valid_until,
          label: merge.label,
        },
        accept_relocations: true,
        reservation: data,
      });
      dispatch({ type: 'CLOSE_NEW_RESA_DRAWER' });
      loadData(state.pickerDate ?? undefined);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '12px' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--lk-purple-light)' }} />
        <span style={{ color: 'var(--lk-text-muted)' }}>Chargement du plan de salle...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{
      display: 'flex', flexDirection: 'column', gap: '16px',
      height: `calc(100vh - var(--topbar-height) - var(--space-8) - var(--space-8))`,
      minHeight: 0,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Plan de salle</h1>
          <p style={{ color: 'var(--lk-text-muted)', fontSize: '13px', margin: '4px 0 0' }}>
            Glissez les tables pour les positionner. Scroll pour zoomer.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleAddTable}>
            <Plus size={14} /> Table
          </button>
          {state.dirty && (
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Enregistrer
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '8px 12px', background: 'var(--lk-error-muted)', borderRadius: 'var(--radius-sm)', color: 'var(--lk-error)', fontSize: '13px', flexShrink: 0 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', flexShrink: 0 }}>
        <RoomTabs
          rooms={state.rooms}
          activeRoomId={state.activeRoomId}
          onSwitch={(id) => dispatch({ type: 'SET_ACTIVE_ROOM', roomId: id })}
          onAdd={handleAddRoom}
        />
        <ServiceModePicker
          date={state.pickerDate}
          onChange={handleDateChange}
        />
      </div>

      {state.selectedIds.size >= 2 && (
        <MergeQuickToolbar
          selectedCount={state.selectedIds.size}
          permanentUnlocked={state.permanentUnlocked}
          isServiceMode={state.pickerDate !== null}
          onMerge={handleRequestMerge}
          onUnlockPermanent={() => dispatch({ type: 'SET_PERMANENT_UNLOCKED', unlocked: true })}
        />
      )}

      <div style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {activeRoom && (
          <FloorplanCanvas
            room={activeRoom}
            tables={roomTables}
            merges={state.merges.filter(m => m.room_id === state.activeRoomId)}
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

      {state.mergeDialog && (
        <MergeDialog
          scope={state.mergeDialog.scope}
          tableIds={state.mergeDialog.tableIds}
          onConfirm={handleMergeDialogConfirm}
          onClose={() => dispatch({ type: 'CLOSE_MERGE_DIALOG' })}
        />
      )}

      {mergePreview && (
        <RelocationConfirmDialog
          preview={mergePreview}
          onConfirm={handleRelocationConfirm}
          onCancel={() => { setMergePreview(null); setPendingMergeData(null); }}
        />
      )}

      {state.newResaDrawer && (
        <NewReservationDrawer
          mergeId={state.newResaDrawer.mergeId}
          capacity={state.newResaDrawer.capacity}
          onSubmit={handleNewResaSubmit}
          onClose={() => dispatch({ type: 'CLOSE_NEW_RESA_DRAWER' })}
        />
      )}

      {roomDrawer && (
        <RoomConfigDrawer
          room={roomDrawer.room}
          isNew={roomDrawer.isNew}
          onSave={handleSaveRoom}
          onDelete={handleDeleteRoom}
          onClose={() => setRoomDrawer(null)}
        />
      )}
    </div>
  );
}
