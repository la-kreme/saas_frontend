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
  room_id?: string;
  pos_x: number;
  pos_y: number;
  width: number;
  height: number;
  shape: 'rect' | 'circle';
  rotation: number;
}

export type TableCreate = Pick<TableItem, 'name' | 'seats'> & {
  display_order?: number;
  room_id?: string;
  pos_x?: number;
  pos_y?: number;
  width?: number;
  height?: number;
  shape?: 'rect' | 'circle';
  rotation?: number;
};

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
  table_id?: string;
  table_merge_id?: string;
}

export interface SnippetResponse {
  iframe_snippet: string;
  webcomponent_snippet: string;
  widget_url: string;
  reserve_url: string;
}

export interface RestaurantSearch {
  id: string;
  name: string;
  address: string;
  city_name: string;
  slug: string;
}

/** @deprecated Use RestaurantSearch */
export type BrunchPlaceSearch = RestaurantSearch;

// ─── Restaurateur Place Types (meilleurbrunch-backend) ────────────────────────

export type ActorType = 'RESTAURANT' | 'COFFEE_SHOP' | 'HOTEL' | 'BAKERY';

export interface RestaurantDetail {
  // Identity (read-only)
  id: string;
  name: string;
  slug: string;
  city_name?: string;

  // Location
  address: string;
  postal_code?: string;
  country_code: string;
  latitude?: number;
  longitude?: number;

  // Practical
  actor_type: ActorType;
  price_range: number;
  opening_hours?: Record<string, { open: string; close: string }[]>;
  website_url?: string;
  booking_url?: string;
  phone?: string;

  // Content
  description_html?: string;
  menu_content_html?: string;
  excerpt?: string;
  editorial_highlight?: string;

  // Media
  main_photo_url?: string;
  photos?: string[];

  // Themes legacy
  is_cheap: boolean;
  vegan_options: boolean;
  terrasse: boolean;
  kids_friendly: boolean;
  is_buffet: boolean;
  is_instagrammable: boolean;

  // Taxonomie v2 — food_tags
  food_fait_maison: boolean;
  food_bio: boolean;
  food_local: boolean;
  food_saison: boolean;
  food_frais: boolean;
  food_healthy: boolean;
  food_comfort_food: boolean;
  food_gastronomique: boolean;
  food_genereux: boolean;
  food_createur: boolean;
  food_traditionnel: boolean;
  food_patisserie: boolean;
  food_specialty_coffee: boolean;
  food_zero_dechet: boolean;

  // Taxonomie v2 — format_tags
  format_buffet: boolean;
  format_a_la_carte: boolean;
  format_formule: boolean;
  format_a_composer: boolean;
  format_all_day: boolean;
  format_dominical: boolean;
  format_a_theme: boolean;
  format_show_cooking: boolean;

  // Taxonomie v2 — cuisine_tags
  cuisine_americaine: boolean;
  cuisine_italienne: boolean;
  cuisine_mediterraneenne: boolean;
  cuisine_orientale: boolean;
  cuisine_asiatique: boolean;
  cuisine_latino: boolean;
  cuisine_brasserie: boolean;
  cuisine_street_food: boolean;
  cuisine_halal: boolean;

  // Taxonomie v2 — dietary_options
  diet_vegan: boolean;
  diet_vegetarian: boolean;
  diet_gluten_free: boolean;
  diet_lactose_free: boolean;
  diet_flexitarien: boolean;

  // Taxonomie v2 — atmosphere_tags
  atmo_cosy: boolean;
  atmo_instagrammable: boolean;
  atmo_family_friendly: boolean;
  atmo_quiet: boolean;
  atmo_trendy: boolean;
  atmo_student_friendly: boolean;

  // Taxonomie v2 — services
  svc_terrace: boolean;
  svc_wifi: boolean;
  svc_reservation: boolean;
  svc_takeaway: boolean;
  svc_dog_friendly: boolean;
  svc_baby_friendly: boolean;
  venue_salon_de_the: boolean;

  // Taxonomie v2 — overflow
  food_tags_overflow: string[];

  // SaaS Identity
  verification_status?: string;
  verification_document_url?: string;

  // Timestamps
  updated_at: string;
}

/** @deprecated Use RestaurantDetail */
export type BrunchPlaceDetail = RestaurantDetail;

export type RestaurantUpdate = Partial<
  Omit<RestaurantDetail, 'id' | 'name' | 'slug' | 'city_name' | 'country_code' | 'updated_at'>
>;

/** @deprecated Use RestaurantUpdate */
export type BrunchPlaceUpdate = RestaurantUpdate;

// ─── Floorplan Types ─────────────────────────────────────────────────────────

export interface Room {
  id: string;
  restaurant_id: string;
  name: string;
  display_order: number;
  canvas_width: number;
  canvas_height: number;
}

export type RoomCreate = Pick<Room, 'name'> & {
  display_order?: number;
  canvas_width?: number;
  canvas_height?: number;
};

export interface Merge {
  id: string;
  room_id: string;
  member_table_ids: string[];
  capacity: number;
  label?: string;
  scope: 'meal' | 'service' | 'permanent';
  valid_from?: string;
  valid_until?: string;
  created_at: string;
}

export interface MergeCreatePayload {
  room_id: string;
  member_table_ids: string[];
  label?: string;
  scope: 'meal' | 'service' | 'permanent';
  valid_from?: string;
  valid_until?: string;
  accept_relocations?: boolean;
}

export interface MergeConflict {
  reservation_id: string;
  from_table_id: string;
  guest_name: string;
  time: string;
}

export interface MergeRelocation {
  reservation_id: string;
  from_table_id: string;
  to_table_id?: string;
  status?: string;
}

export interface MergePreview {
  status: 'ok' | 'ok_with_relocations' | 'blocked';
  capacity: number;
  conflicts: MergeConflict[];
  relocation_plan: MergeRelocation[];
  unrelocatable: MergeRelocation[];
}

export interface FloorplanData {
  rooms: Room[];
  tables: TableItem[];
  merges: Merge[];
  reservations: ReservationItem[];
}

export interface TableBulkPositionItem {
  id: string;
  pos_x: number;
  pos_y: number;
  room_id?: string;
  rotation?: number;
}

