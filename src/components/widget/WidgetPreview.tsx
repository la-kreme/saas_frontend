import { useEffect, useMemo, useRef, useState } from 'react';
import { env } from '../../lib/env';

interface WidgetPreviewProps {
  restaurantId: string;
  lang?: 'fr' | 'en';
  preview?: boolean;
  showControls?: boolean;
  minHeight?: number;
  liveAccentColor?: string;
  liveWelcomeFr?: string;
  liveWelcomeEn?: string;
}

const API_BASE = env.apiUrl;

/** Compute the origin from an absolute URL for secure postMessage. */
function getApiOrigin(): string {
  try {
    return new URL(API_BASE).origin;
  } catch {
    return window.location.origin;
  }
}

/**
 * WidgetPreview — iframe avec ajustement dynamique de hauteur via postMessage.
 * Écoute les messages `{ type: 'lk-resize', height: N }` du widget.
 *
 * Sécurité :
 * - Les messages entrants sont filtrés par `e.origin` (seul le domaine API est accepté).
 * - Les messages sortants utilisent un `targetOrigin` explicite (jamais `*`).
 */
export function WidgetPreview({
  restaurantId,
  lang = 'fr',
  preview = true,
  showControls = false,
  minHeight = 480,
  liveAccentColor,
  liveWelcomeFr,
  liveWelcomeEn,
}: WidgetPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(minHeight);
  const [activeLang, setActiveLang] = useState<'fr' | 'en'>(lang);
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0);

  const trustedOrigin = useMemo(() => getApiOrigin(), []);
  const src = `${API_BASE}/widget/${restaurantId}?lang=${activeLang}${preview ? '&preview=true' : ''}`;

  // Écouter les postMessage de hauteur — validation origin
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.origin !== trustedOrigin) return;
      if (e.data && e.data.type === 'lk-resize' && typeof e.data.height === 'number') {
        setHeight(Math.max(minHeight, e.data.height));
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [minHeight, trustedOrigin]);

  const postConfig = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'lk-preview-config',
        payload: {
          accent_color: liveAccentColor,
          welcome_message_fr: liveWelcomeFr,
          welcome_message_en: liveWelcomeEn,
        },
      }, trustedOrigin);
    }
  };

  const reload = () => {
    setKey(k => k + 1);
    setIsLoading(true);
    setHeight(minHeight);
  };

  // Push new config when props change (while iframe is already loaded)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!isLoading) postConfig(); }, [liveAccentColor, liveWelcomeFr, liveWelcomeEn, isLoading]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {showControls && (
        <div className="flex items-center gap-2" style={{ justifyContent: 'flex-end' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { setActiveLang(l => l === 'fr' ? 'en' : 'fr'); reload(); }}
            title="Changer la langue"
          >
            {activeLang === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={reload}
            title="Rafraîchir"
          >
            ↺
          </button>
        </div>
      )}

      <div style={{
        position: 'relative',
        background: '#ffffff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,.12)',
        minHeight: `${minHeight}px`,
        transition: 'min-height 300ms ease',
      }}>
        {isLoading && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg,#f8f7fc 25%, #e5e2f0 50%, #f8f7fc 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s ease-in-out infinite',
            zIndex: 1,
          }} />
        )}

        <iframe
          ref={iframeRef}
          key={key}
          src={src}
          title={`Prévisualisation widget — ${restaurantId}`}
          style={{
            width: '100%',
            height: `${height}px`,
            border: 'none',
            display: 'block',
            transition: 'height 200ms ease',
          }}
          onLoad={() => setIsLoading(false)}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>

      {preview && (
        <p style={{ fontSize: '11px', color: 'var(--lk-text-muted)', textAlign: 'center' }}>
          Mode prévisualisation — les réservations ne sont pas enregistrées
        </p>
      )}
    </div>
  );
}
