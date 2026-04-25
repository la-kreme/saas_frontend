import { useReducer } from 'react';
import type { Room, TableItem, Merge, ReservationItem } from '../types';

export interface FloorplanState {
  rooms: Room[];
  tables: TableItem[];
  merges: Merge[];
  reservations: ReservationItem[];
  activeRoomId: string;
  selectedIds: Set<string>;
  inspectorOpen: boolean;
  dirty: boolean;
  pickerDate: string | null;
  pickerServiceId: string | null;
  permanentUnlocked: boolean;
  mergeDialog: { scope: string; tableIds: string[] } | null;
  relocationDialog: unknown | null;
  newResaDrawer: { mergeId: string; capacity: number } | null;
}

type Action =
  | { type: 'SET_DATA'; rooms: Room[]; tables: TableItem[]; merges: Merge[]; reservations: ReservationItem[] }
  | { type: 'SET_ACTIVE_ROOM'; roomId: string }
  | { type: 'SELECT_TABLE'; id: string }
  | { type: 'ADD_TO_SELECTION'; id: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'DRAG_TABLE'; id: string; pos_x: number; pos_y: number }
  | { type: 'ADD_TABLE'; table: TableItem }
  | { type: 'UPDATE_TABLE'; id: string; updates: Partial<TableItem> }
  | { type: 'REMOVE_TABLE'; id: string }
  | { type: 'ADD_ROOM'; room: Room }
  | { type: 'UPDATE_ROOM'; id: string; updates: Partial<Room> }
  | { type: 'REMOVE_ROOM'; id: string }
  | { type: 'SET_DIRTY'; dirty: boolean }
  | { type: 'SET_INSPECTOR'; open: boolean }
  | { type: 'SET_PICKER_DATE'; date: string | null }
  | { type: 'OPEN_MERGE_DIALOG'; scope: string; tableIds: string[] }
  | { type: 'CLOSE_MERGE_DIALOG' }
  | { type: 'ADD_MERGE'; merge: Merge }
  | { type: 'REMOVE_MERGE'; id: string }
  | { type: 'SET_PERMANENT_UNLOCKED'; unlocked: boolean }
  | { type: 'OPEN_NEW_RESA_DRAWER'; mergeId: string; capacity: number }
  | { type: 'CLOSE_NEW_RESA_DRAWER' };

function reducer(state: FloorplanState, action: Action): FloorplanState {
  switch (action.type) {
    case 'SET_DATA':
      return {
        ...state,
        rooms: action.rooms,
        tables: action.tables,
        merges: action.merges,
        reservations: action.reservations,
        activeRoomId: state.activeRoomId || (action.rooms[0]?.id ?? ''),
        dirty: false,
      };
    case 'SET_ACTIVE_ROOM':
      return { ...state, activeRoomId: action.roomId, selectedIds: new Set() };
    case 'SELECT_TABLE':
      return { ...state, selectedIds: new Set([action.id]), inspectorOpen: true };
    case 'ADD_TO_SELECTION':
      return { ...state, selectedIds: new Set([...state.selectedIds, action.id]) };
    case 'CLEAR_SELECTION':
      return { ...state, selectedIds: new Set(), inspectorOpen: false };
    case 'DRAG_TABLE':
      return {
        ...state,
        tables: state.tables.map(t =>
          t.id === action.id ? { ...t, pos_x: action.pos_x, pos_y: action.pos_y } : t
        ),
        dirty: true,
      };
    case 'ADD_TABLE':
      return { ...state, tables: [...state.tables, action.table], dirty: true };
    case 'UPDATE_TABLE':
      return {
        ...state,
        tables: state.tables.map(t =>
          t.id === action.id ? { ...t, ...action.updates } : t
        ),
        dirty: true,
      };
    case 'REMOVE_TABLE':
      return {
        ...state,
        tables: state.tables.filter(t => t.id !== action.id),
        selectedIds: new Set([...state.selectedIds].filter(id => id !== action.id)),
        dirty: true,
      };
    case 'ADD_ROOM':
      return { ...state, rooms: [...state.rooms, action.room] };
    case 'UPDATE_ROOM':
      return {
        ...state,
        rooms: state.rooms.map(r =>
          r.id === action.id ? { ...r, ...action.updates } : r
        ),
      };
    case 'REMOVE_ROOM':
      return {
        ...state,
        rooms: state.rooms.filter(r => r.id !== action.id),
        activeRoomId: state.activeRoomId === action.id
          ? (state.rooms.find(r => r.id !== action.id)?.id ?? '')
          : state.activeRoomId,
      };
    case 'SET_DIRTY':
      return { ...state, dirty: action.dirty };
    case 'SET_INSPECTOR':
      return { ...state, inspectorOpen: action.open };
    case 'SET_PICKER_DATE':
      return { ...state, pickerDate: action.date, permanentUnlocked: false };
    case 'OPEN_MERGE_DIALOG':
      return { ...state, mergeDialog: { scope: action.scope, tableIds: action.tableIds } };
    case 'CLOSE_MERGE_DIALOG':
      return { ...state, mergeDialog: null };
    case 'ADD_MERGE':
      return { ...state, merges: [...state.merges, action.merge] };
    case 'REMOVE_MERGE':
      return { ...state, merges: state.merges.filter(m => m.id !== action.id) };
    case 'SET_PERMANENT_UNLOCKED':
      return { ...state, permanentUnlocked: action.unlocked };
    case 'OPEN_NEW_RESA_DRAWER':
      return { ...state, newResaDrawer: { mergeId: action.mergeId, capacity: action.capacity } };
    case 'CLOSE_NEW_RESA_DRAWER':
      return { ...state, newResaDrawer: null };
    default:
      return state;
  }
}

const initialState: FloorplanState = {
  rooms: [],
  tables: [],
  merges: [],
  reservations: [],
  activeRoomId: '',
  selectedIds: new Set(),
  inspectorOpen: false,
  dirty: false,
  pickerDate: null,
  pickerServiceId: null,
  permanentUnlocked: false,
  mergeDialog: null,
  relocationDialog: null,
  newResaDrawer: null,
};

export function useFloorplanState() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const mode = state.pickerDate ? 'service' : 'plan';
  return { state, dispatch, mode } as const;
}
