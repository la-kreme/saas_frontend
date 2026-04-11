// ─── API Response & Entity Types ──────────────────────────────────────────────
// Extracted from api.ts for single-responsibility and reusability.

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
  welcome_message?: string;
  welcome_message_fr?: string;
  welcome_message_en?: string;
  accent_color: string;
  show_branding: boolean;
  show_on_directory: boolean;
  confirmation_mode: string;
  max_party_size: number;
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

export interface BrunchPlaceSearch {
  id: string;
  name: string;
  address: string;
  city_name: string;
  slug: string;
}
