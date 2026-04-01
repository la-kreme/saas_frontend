import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, Zap, ExternalLink } from 'lucide-react';
import { WidgetPreview } from '../../components/widget/WidgetPreview';

/**
 * Step 5 — Mon Widget
 * Prévisualisation live via WidgetPreview, snippets à copier, activation.
 */
export default function Step5Widget() {
  const navigate = useNavigate();
  const restaurantId = localStorage.getItem('lk_restaurant_id') || '';
  const restaurantName = localStorage.getItem('lk_restaurant_name') || 'Mon Restaurant';

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8001';
  const widgetSrc = `${apiBase}/widget/${restaurantId}`;

  const [copiedIframe, setCopiedIframe] = useState(false);
  const [copiedWC, setCopiedWC] = useState(false);
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);

  const iframeSnippet = `<iframe\n  src="${widgetSrc}"\n  width="100%"\n  height="540"\n  frameborder="0"\n  style="border:none; border-radius:12px;"\n  title="Réserver — ${restaurantName}"\n  loading="lazy"\n></iframe>\n<script>\n  window.addEventListener('message', function(e) {\n    if (e.data && e.data.type === 'lk-resize') {\n      document.querySelector('iframe[src*="${restaurantId}"]').style.height = e.data.height + 'px';\n    }\n  });\n</script>`;

  const webComponentSnippet = `<script src="https://cdn.lakreme.fr/widget/v1/lakreme-widget.js" defer></script>\n<lakreme-widget\n  restaurant-id="${restaurantId}"\n  lang="fr"\n></lakreme-widget>`;

  const copy = async (text: string, which: 'iframe' | 'wc') => {
    await navigator.clipboard.writeText(text);
    if (which === 'iframe') {
      setCopiedIframe(true);
      setTimeout(() => setCopiedIframe(false), 2000);
    } else {
      setCopiedWC(true);
      setTimeout(() => setCopiedWC(false), 2000);
    }
  };

  const handleActivate = async () => {
    if (!restaurantId) return;
    setActivating(true);
    try {
      // TODO Sprint 4 : POST /api/v1/restaurant/me/activate
      await new Promise(r => setTimeout(r, 800));
      setActivated(true);
      setTimeout(() => navigate('/dashboard/widget'), 1500);
    } finally {
      setActivating(false);
    }
  };

  return (
    <>
      <div className="onboarding-step-header">
        <div className="onboarding-step-number">Étape 5 sur 5</div>
        <h1 className="onboarding-step-title">Mon Widget</h1>
        <p className="onboarding-step-desc">
          Voici votre widget de réservation en direct. Copiez le code sur votre site
          puis activez-le pour qu'il soit visible sur La Krème.
        </p>
      </div>

      {/* Live preview */}
      {restaurantId ? (
        <div style={{ marginBottom: '20px' }}>
          <WidgetPreview
            restaurantId={restaurantId}
            lang="fr"
            preview
            showControls
            minHeight={420}
          />
        </div>
      ) : (
        <div style={{
          padding: '24px', textAlign: 'center', background: 'var(--lk-surface-2)',
          borderRadius: 'var(--radius-lg)', marginBottom: '20px',
          color: 'var(--lk-text-muted)', fontSize: '13px',
        }}>
          Aperçu indisponible — compléter les étapes précédentes
        </div>
      )}

      {/* Iframe Snippet */}
      <div style={{ marginBottom: '12px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
          <span className="text-sm font-semibold">Option A — Iframe</span>
          <button className="btn btn-secondary btn-sm" onClick={() => copy(iframeSnippet, 'iframe')}>
            {copiedIframe ? <><Check size={12} /> Copié !</> : <><Copy size={12} /> Copier</>}
          </button>
        </div>
        <div className="code-block" style={{ fontSize: '10px', lineHeight: 1.5 }}>
          {iframeSnippet}
        </div>
        <p className="text-xs text-muted" style={{ marginTop: '4px' }}>
          Compatible WordPress, Wix, Squarespace, Webflow — tout site.
        </p>
      </div>

      {/* Web Component Snippet */}
      <div style={{ marginBottom: '20px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
          <span className="text-sm font-semibold">Option B — Web Component</span>
          <button className="btn btn-secondary btn-sm" onClick={() => copy(webComponentSnippet, 'wc')}>
            {copiedWC ? <><Check size={12} /> Copié !</> : <><Copy size={12} /> Copier</>}
          </button>
        </div>
        <div className="code-block" style={{ fontSize: '10px', lineHeight: 1.5 }}>
          {webComponentSnippet}
        </div>
      </div>

      {/* Activate */}
      {activated ? (
        <div style={{
          padding: '16px', background: 'var(--lk-success-muted)',
          border: '1px solid rgba(34,197,94,.25)', borderRadius: 'var(--radius)',
          textAlign: 'center', color: 'var(--lk-success)', fontWeight: 600,
        }} className="animate-pulse-glow">
          ✅ Widget activé ! Redirection vers votre dashboard…
        </div>
      ) : (
        <button
          id="btn-activate-widget"
          className="btn btn-primary btn-lg"
          style={{ width: '100%' }}
          disabled={activating || !restaurantId}
          onClick={handleActivate}
        >
          {activating
            ? <><div className="spinner" style={{ width: '16px', height: '16px' }} /> Activation…</>
            : <><Zap size={16} /> Activer mon widget</>}
        </button>
      )}

      <div className="onboarding-actions" style={{ justifyContent: 'flex-start', marginTop: '12px' }}>
        <button className="btn btn-ghost" onClick={() => navigate('/onboarding/customize')}>
          ← Retour
        </button>
        {restaurantId && (
          <a
            href={widgetSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm flex items-center gap-2"
          >
            <ExternalLink size={12} /> Ouvrir dans un nouvel onglet
          </a>
        )}
      </div>
    </>
  );
}
