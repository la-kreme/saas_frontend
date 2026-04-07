import { useEffect, useRef, useState } from 'react';
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

/**
 * WidgetPreview — iframe avec ajustement dynamique de hauteur via postMessage.
 * Écoute les messages `{ type: 'lk-resize', height: N }` du widget.
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
  const [key, setKey] = useState(0); // force iframe reload

  const src = `${API_BASE}/widget/${restaurantId}?lang=${activeLang}${preview ? '&preview=true' : ''}`;

  // Écouter les postMessage de hauteur
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data && e.data.type === 'lk-resize' && typeof e.data.height === 'number') {
        setHeight(Math.max(minHeight, e.data.height));
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [minHeight]);

  const postConfig = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'lk-preview-config',
        payload: {
          accent_color: liveAccentColor,
          welcome_message_fr: liveWelcomeFr,
          welcome_message_en: liveWelcomeEn
        }
      }, '*');
    }
  };

  // Re-sync after language toggle or manual reload
  const reload = () => {
    setKey(k => k + 1);
    setIsLoading(true);
    setHeight(minHeight);
  };

  // Push new config when props change (while iframe is already loaded)
  useEffect(() => {
    if (!isLoading) postConfig();
  }, [liveAccentColor, liveWelcomeFr, liveWelcomeEn, isLoading]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Contrôles optionnels */}
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

      {/* Wrapper frame */}
      <div style={{
        position: 'relative',
        background: '#ffffff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,.12)',
        minHeight: `${minHeight}px`,
        transition: 'min-height 300ms ease',
      }}>
        {/* Loading overlay */}
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
          onLoad={() => {
            setIsLoading(false);
            // Let the useEffect catch isLoading transition, or call directly
          }}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>

      {/* Note preview */}
      {preview && (
        <p style={{ fontSize: '11px', color: 'var(--lk-text-muted)', textAlign: 'center' }}>
          Mode prévisualisation — les réservations ne sont pas enregistrées
        </p>
      )}
    </div>
  );
}
