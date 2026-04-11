/**
 * Client API FastAPI — La Krème Reservation Service
 * Wrapper fetch avec injection automatique JWT Supabase
 */
import { supabase } from './supabase';
import { env } from './env';
import type {
  ApiError,
  WidgetConfigPublic,
  SlotItem,
  TableItem,
  TableCreate,
  OpeningHoursItem,
  ReservationItem,
  SnippetResponse,
  BrunchPlaceSearch,
} from './types';

// Re-export all types so existing `import { X } from './api'` still work.
export type {
  ApiError,
  WidgetConfigPublic,
  SlotItem,
  TableItem,
  TableCreate,
  OpeningHoursItem,
  ReservationItem,
  SnippetResponse,
  BrunchPlaceSearch,
} from './types';

const API_BASE = env.apiUrl;
const WIDGET_BASE = env.widgetBaseUrl;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract a human-readable message from an unknown catch error. */
export function getErrorMessage(err: unknown, fallback = 'Une erreur est survenue.'): string {
  if (err && typeof err === 'object' && 'message' in err) {
    return (err as ApiError).message || fallback;
  }
  return fallback;
}



async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  authRequired = false,
): Promise<T> {
  const headers: HeadersInit = authRequired
    ? await getAuthHeaders()
    : { 'Content-Type': 'application/json' };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error: ApiError = {
      status: res.status,
      message: body.detail || body.message || `Erreur ${res.status}`,
      code: body.error,
    };
    throw error;
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

/** Helper public pour les appels authentifiés génériques (onboarding, etc.) */
export async function apiFetchAuth<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  return apiFetch<T>(path, options, true);
}


// ─── Endpoints publics widget ─────────────────────────────────────────────────

export const getWidgetConfig = (publicToken: string, lang = 'fr') =>
  apiFetch<WidgetConfigPublic>(`/api/v1/widget/${publicToken}/config?lang=${lang}`);

export const getAvailability = (publicToken: string, month: string, guests: number) =>
  apiFetch<{ month: string; guests: number; dates: { date: string; available: boolean }[] }>(
    `/api/v1/widget/${publicToken}/availability?month=${month}&guests=${guests}`
  );

export const getSlots = (publicToken: string, date: string, guests: number) =>
  apiFetch<{ date: string; guests: number; slots: SlotItem[] }>(
    `/api/v1/widget/${publicToken}/slots?date=${date}&guests=${guests}`
  );

export const lockSlot = (publicToken: string, body: {
  date: string; time: string; guests: number; lang?: string;
}) =>
  apiFetch<{ lock_token: string; expires_at: string; table_id: string }>(
    `/api/v1/widget/${publicToken}/reservations/lock`,
    { method: 'POST', body: JSON.stringify(body) }
  );

export const createReservation = (publicToken: string, body: object) =>
  apiFetch<{
    reservation_id: string; confirmation_code: string; status: string;
    restaurant_name: string; date: string; time: string; guests: number; message: string;
  }>(
    `/api/v1/widget/${publicToken}/reservations`,
    { method: 'POST', body: JSON.stringify(body) }
  );

// ─── Endpoints restaurateur (JWT requis) ─────────────────────────────────────

export const getMyConfig = () =>
  apiFetch<WidgetConfigPublic>('/api/v1/restaurant/me', {}, true);

export const updateMyConfig = (body: Partial<WidgetConfigPublic>) =>
  apiFetch('/api/v1/restaurant/me', { method: 'PATCH', body: JSON.stringify(body) }, true);

export const activateWidget = () =>
  apiFetch('/api/v1/restaurant/me/activate', { method: 'POST' }, true);

export const getMyTables = () =>
  apiFetch<TableItem[]>('/api/v1/restaurant/me/tables', {}, true);

export const createTable = (body: TableCreate) =>
  apiFetch<TableItem>('/api/v1/restaurant/me/tables', { method: 'POST', body: JSON.stringify(body) }, true);

export const updateTable = (id: string, body: Partial<TableItem>) =>
  apiFetch<TableItem>(`/api/v1/restaurant/me/tables/${id}`, { method: 'PATCH', body: JSON.stringify(body) }, true);

export const deleteTable = (id: string) =>
  apiFetch(`/api/v1/restaurant/me/tables/${id}`, { method: 'DELETE' }, true);

export const getMyHours = () =>
  apiFetch<OpeningHoursItem[]>('/api/v1/restaurant/me/hours', {}, true);

export const createHour = (body: Partial<OpeningHoursItem>) =>
  apiFetch<OpeningHoursItem>('/api/v1/restaurant/me/hours', { method: 'POST', body: JSON.stringify(body) }, true);

export const updateHour = (id: string, body: Partial<OpeningHoursItem>) =>
  apiFetch<OpeningHoursItem>(`/api/v1/restaurant/me/hours/${id}`, { method: 'PATCH', body: JSON.stringify(body) }, true);

export const deleteHour = (id: string) =>
  apiFetch(`/api/v1/restaurant/me/hours/${id}`, { method: 'DELETE' }, true);

export const getMyReservations = (params?: { date?: string; status?: string; page?: number }) =>
  apiFetch<{ items: ReservationItem[]; total: number }>(
    `/api/v1/restaurant/me/reservations?${new URLSearchParams(params as Record<string, string> || {}).toString()}`,
    {},
    true
  );

export const updateReservationStatus = (id: string, status: 'confirmed' | 'cancelled') =>
  apiFetch<{ id: string; status: string; message: string }>(
    `/api/v1/restaurant/me/reservations/${id}`,
    { method: 'PATCH', body: JSON.stringify({ status }) },
    true
  );

export const getWidgetSnippet = (restaurantId: string) =>
  apiFetchAuth<SnippetResponse>(`/api/v1/restaurant/me/snippet?restaurant_id=${restaurantId}`);


export const searchBrunchPlaces = (query: string) =>
  apiFetchAuth<BrunchPlaceSearch[]>(
    `/api/v1/restaurant/search?q=${encodeURIComponent(query)}&limit=10`
  );

export const createBrunchPlace = (body: { name: string; address?: string; city_name: string; phone?: string }) =>
  apiFetchAuth<BrunchPlaceSearch>(
    `/api/v1/restaurant/create`,
    { method: 'POST', body: JSON.stringify(body) }
  );

export { WIDGET_BASE };
