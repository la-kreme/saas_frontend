import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Save, Loader2, Info } from 'lucide-react';
import {
  getFloorplan, createTable, updateTable, deleteTable,
  bulkUpdateTablePositions, createRoom, updateRoom, deleteRoom,
  previewMerge, createMerge, createMergeWithReservation,
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
import { PageHeader, Card, Button, Kbd } from '../../components/ui';

function useIsMobile(breakpoint = 850) {
  const [mobile, setMobile] = useState(() => window.innerWidth <= breakpoint);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);
  return mobile;
}

export default function Floorplan() {
  const { state, dispatch } = useFloorplanState();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [roomDrawer, setRoomDrawer] = useState<{ room: Room | null; isNew: boolean } | null>(null);
  const [mergePreview, setMergePreview] = useState<MergePreview | null>(null);
  const [pendingMergeData, setPendingMergeData] = useState<{ scope: string; valid_from?: string; valid_until?: string; label?: string } | null>(null);
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);
  const [editTableId, setEditTableId] = useState<string | null>(null);
  const editTable = editTableId ? state.tables.find(t => t.id === editTableId) : undefined;

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
      <div className="lk-loading-center--sm">
        <Loader2 size={24} className="lk-spinner" />
        <span className="lk-text-loading">Chargement du plan de salle...</span>
      </div>
    );
  }

  return (
    <div className="lk-animate-up lk-floorplan-container">
      <PageHeader
        title="Plan de salle"
        subtitle="Glissez les tables pour les positionner. Scroll pour zoomer."
        right={
          <div className="lk-floorplan-header-actions">
            <ServiceModePicker date={state.pickerDate} onChange={handleDateChange} />
            <Button variant="primary" size="md" icon={<Plus size={14} strokeWidth={2.4} />} onClick={handleAddTable}>
              Table
            </Button>
            {state.dirty && (
              <Button variant="secondary" size="md" icon={saving ? <Loader2 size={14} className="lk-spinner" /> : <Save size={14} />} onClick={handleSave} disabled={saving}>
                Enregistrer
              </Button>
            )}
          </div>
        }
      />

      {error && (
        <div className="lk-floorplan-error">
          {error}
        </div>
      )}

      {state.selectedIds.size >= 2 && (
        <MergeQuickToolbar
          selectedCount={state.selectedIds.size}
          permanentUnlocked={state.permanentUnlocked}
          isServiceMode={state.pickerDate !== null}
          onMerge={handleRequestMerge}
          onUnlockPermanent={() => dispatch({ type: 'SET_PERMANENT_UNLOCKED', unlocked: true })}
        />
      )}

      {/* Canvas + side panel */}
      <div className="lk-floorplan-main-grid">
        <Card padded={false} className="lk-floorplan-canvas-card">
          {/* Zone tabs inside card header */}
          <div className="lk-floorplan-room-tabs-bar">
            <RoomTabs
              rooms={state.rooms}
              activeRoomId={state.activeRoomId}
              onSwitch={(id) => dispatch({ type: 'SET_ACTIVE_ROOM', roomId: id })}
              onAdd={handleAddRoom}
            />
          </div>

          {/* Canvas */}
          <div className="lk-floorplan-canvas-area">
            {activeRoom && (
              <FloorplanCanvas
                room={activeRoom}
                tables={roomTables}
                merges={state.merges.filter(m => m.room_id === state.activeRoomId)}
                selectedIds={state.selectedIds}
                onSelect={handleSelect}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                onEdit={(id) => setEditTableId(id)}
                mobile={isMobile}
                onClearSelection={() => dispatch({ type: 'CLEAR_SELECTION' })}
              />
            )}

            {/* Save button overlay — visible when dirty */}
            {state.dirty && (
              <button
                className="lk-floorplan-save-overlay"
                onClick={handleSave}
                disabled={saving}
                title="Enregistrer"
              >
                {saving ? <Loader2 size={16} className="lk-spinner" /> : <Save size={16} />}
              </button>
            )}

            {/* Mobile info button */}
            <button
              className="lk-floorplan-info-toggle"
              onClick={() => setInfoPanelOpen(o => !o)}
              title="Informations"
            >
              <Info size={16} />
            </button>
          </div>
        </Card>

        {/* Side panel — desktop */}
        <div className="lk-floorplan-side-col lk-floorplan-side-desktop">
          <FloorplanSideContent
            roomTables={roomTables}
            activeRoomName={activeRoom?.name ?? ''}
            selectedTable={selectedTable ?? undefined}
            inspectorOpen={state.inspectorOpen}
            onUpdateTable={handleUpdateTable}
            onDeleteTable={handleDeleteTable}
            onCloseInspector={() => dispatch({ type: 'CLEAR_SELECTION' })}
          />
        </div>
      </div>

      {/* Mobile info panel overlay — portal sur body pour couvrir tout le screen */}
      {infoPanelOpen && createPortal(
        <div className="lk-floorplan-info-overlay" onClick={() => setInfoPanelOpen(false)}>
          <div className="lk-floorplan-info-panel" onClick={e => e.stopPropagation()}>
            <FloorplanSideContent
              roomTables={roomTables}
              activeRoomName={activeRoom?.name ?? ''}
              selectedTable={selectedTable ?? undefined}
              inspectorOpen={state.inspectorOpen}
              onUpdateTable={handleUpdateTable}
              onDeleteTable={handleDeleteTable}
              onCloseInspector={() => dispatch({ type: 'CLEAR_SELECTION' })}
            />
          </div>
        </div>,
        document.body,
      )}

      {/* Table editor modal — portal, independant de la modale info */}
      {editTable && createPortal(
        <div className="lk-floorplan-edit-overlay" onClick={() => setEditTableId(null)}>
          <div className="lk-floorplan-edit-panel" onClick={e => e.stopPropagation()}>
            <TableInspector
              table={editTable}
              onUpdate={handleUpdateTable}
              onDelete={(id) => { handleDeleteTable(id); setEditTableId(null); }}
              onClose={() => setEditTableId(null)}
            />
          </div>
        </div>,
        document.body,
      )}

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

function FloorplanSideContent({ roomTables, activeRoomName, selectedTable, inspectorOpen, onUpdateTable, onDeleteTable, onCloseInspector }: {
  roomTables: TableItem[];
  activeRoomName: string;
  selectedTable: TableItem | undefined;
  inspectorOpen: boolean;
  onUpdateTable: (id: string, updates: Partial<TableItem>) => void;
  onDeleteTable: (id: string) => void;
  onCloseInspector: () => void;
}) {
  return (
    <>
      <ZoneCapacityCard tables={roomTables} roomName={activeRoomName} />

      {inspectorOpen && selectedTable ? (
        <TableInspector
          table={selectedTable}
          onUpdate={onUpdateTable}
          onDelete={onDeleteTable}
          onClose={onCloseInspector}
        />
      ) : (
        <Card padded={false} className="lk-floorplan-hint-card">
          <div className="lk-floorplan-hint-inner">
            <Info size={16} className="lk-floorplan-hint-icon" />
            <div className="lk-floorplan-hint-text">
              Cliquez sur une table pour la modifier. Glissez-la pour la repositionner. <Kbd>Shift</Kbd>+clic pour selectionner plusieurs tables.
            </div>
          </div>
        </Card>
      )}

      <Card padded={false} className="lk-floorplan-shortcuts-card">
        <div className="lk-floorplan-shortcuts-title">Raccourcis</div>
        <div className="lk-floorplan-shortcuts-list">
          <KbdRow label="Zoom"><Kbd>Scroll</Kbd></KbdRow>
          <KbdRow label="Deplacer le plan"><Kbd>Clic</Kbd>+<Kbd>Drag</Kbd></KbdRow>
          <KbdRow label="Multi-selection"><Kbd>Shift</Kbd>+<Kbd>Clic</Kbd></KbdRow>
        </div>
      </Card>
    </>
  );
}

function ZoneCapacityCard({ tables, roomName }: { tables: TableItem[]; roomName: string }) {
  const activeTables = tables.filter(t => t.is_active);
  const totalSeats = activeTables.reduce((s, t) => s + t.seats, 0);

  return (
    <Card padded={false} className="lk-floorplan-capacity-card">
      <div className="lk-floorplan-capacity-label">
        Capacite de la zone
      </div>
      <div className="lk-floorplan-capacity-value-row">
        <span className="lk-floorplan-capacity-number">
          {totalSeats}
        </span>
        <span className="lk-floorplan-capacity-unit">
          couverts
        </span>
      </div>
      <div className="lk-floorplan-capacity-meta">
        {activeTables.length} table{activeTables.length > 1 ? 's' : ''} · {roomName}
      </div>
    </Card>
  );
}

function KbdRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="lk-floorplan-kbd-row">
      <span>{label}</span>
      <span className="lk-floorplan-kbd-keys">{children}</span>
    </div>
  );
}
