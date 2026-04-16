/**
 * Client API meilleurbrunch-backend — La Krème SaaS
 * Wrapper fetch avec injection automatique JWT Supabase,
 * pointant vers le backend principal (brunch_places, admin, SEO).
 */
import { supabase } from './supabase';
import { env } from './env';
import type { RestaurantDetail, RestaurantUpdate } from './types';

const MB_API = env.meilleurbrunchApiUrl;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

async function mbApiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = await getAuthHeaders();

  const res = await fetch(`${MB_API}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw {
      status: res.status,
      message: body.detail || body.message || `Erreur ${res.status}`,
      code: body.error,
    };
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

async function mbApiUpload<T>(
  path: string,
  formData: FormData,
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: HeadersInit = {};
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  // Note: Content-Type is NOT set — browser sets multipart/form-data boundary automatically

  const res = await fetch(`${MB_API}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw {
      status: res.status,
      message: body.detail || body.message || `Erreur ${res.status}`,
    };
  }

  return res.json();
}

// ─── Restaurateur Place Endpoints ─────────────────────────────────────────────

export const getMyPlace = () =>
  mbApiFetch<RestaurantDetail>('/api/v1/restaurateur/me/place');

export const updateMyPlace = (body: Partial<RestaurantUpdate>) =>
  mbApiFetch<RestaurantDetail>('/api/v1/restaurateur/me/place', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

export const uploadPlaceImage = (file: File): Promise<{ url: string }> => {
  const fd = new FormData();
  fd.append('file', file);
  return mbApiUpload('/api/v1/restaurateur/me/place/upload', fd);
};

export const uploadPlaceImages = (files: File[]): Promise<{ urls: string[] }> => {
  const fd = new FormData();
  files.forEach(f => fd.append('files[]', f));
  return mbApiUpload('/api/v1/restaurateur/me/place/upload/batch', fd);
};
