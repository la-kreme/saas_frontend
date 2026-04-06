/**
 * Client API FastAPI — La Krème Reservation Service
 * Wrapper fetch avec injection automatique JWT Supabase
 */
import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8005';
const WIDGET_BASE = import.meta.env.VITE_WIDGET_BASE_URL || 'http://localhost:8005';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

export interface WidgetConfigPublic {
  restaurant_id: string;
  public_token?: string;
  is_active: boolean;
  restaurant_name: string;
  restaurant_address?: string;
  restaurant_phone?: string;
  advance_booking_days: number;
  min_cancel_hours: number;
  welcome_message?: string;       // read-only (lang-resolved)
  welcome_message_fr?: string;    // write
  welcome_message_en?: string;    // write
  accent_color: string;
  show_branding: boolean;
  show_on_directory: boolean;
  confirmation_mode: string;
  max_party_size: number;
  // Settings writable fields
  notification_email?: string;
  notification_phone?: string;
}

export interface SlotItem {
  time: string;
  service_name: string;
  duration_min: number;
  available: boolean;
  remaining_capacity: number;
}

export interface TableItem {
  id: string;
  name: string;
  seats: number;
  is_active: boolean;
  display_order: number;
}

export type TableCreate = Pick<TableItem, 'name' | 'seats'> & { display_order?: number };

export interface OpeningHoursItem {
  id: string;
  day_of_week: number;
  service_name: string;
  open_time: string;
  close_time: string;
  slot_duration_min: number;
  slot_interval_min: number;
  is_active: boolean;
}

export interface ReservationItem {
  id: string;
  confirmation_code: string;
  guest_first_name: string;
  guest_last_name: string;
  guest_email: string;
  guest_phone: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  status: string;
  notes?: string;
  occasion?: string;
  created_at: string;
}

export interface SnippetResponse {
  iframe_snippet: string;
  webcomponent_snippet: string;
  widget_url: string;
  reserve_url: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Recherche brunch_places (Step1Link) ────────────────────────────────────

export interface BrunchPlaceSearch {
  id: string;
  name: string;
  address: string;
  city_name: string;
  slug: string;
}

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
