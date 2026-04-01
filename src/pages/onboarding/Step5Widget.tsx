import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, Zap, ExternalLink } from 'lucide-react';
import { getWidgetSnippet } from '../../lib/api';

/**
 * Step 5 — Mon Widget
 * Prévisualisation iframe, snippets à copier, bouton d'activation.
 */
export default function Step5Widget() {
  const navigate = useNavigate();
  const restaurantId = localStorage.getItem('lk_restaurant_id') || '';
  const restaurantName = localStorage.getItem('lk_restaurant_name') || 'Mon Restaurant';

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8001';
  const widgetBase = import.meta.env.VITE_WIDGET_BASE_URL || 'http://localhost:8001';
  const widgetUrl = `${widgetBase}/widget/${restaurantId}`;

  const [copiedIframe, setCopiedIframe] = useState(false);
  const [copiedWC, setCopiedWC] = useState(false);
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);

  const iframeSnippet = `<iframe
  src="${widgetUrl}"
  width="100%"
  height="540"
  frameborder="0"
  style="border:none; border-radius:12px;"
  title="Réserver — ${restaurantName}"
  loading="lazy"
></iframe>
<script>
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'lk-resize') {
      document.querySelector('iframe[src*="${restaurantId}"]').style.height = e.data.height + 'px';
    }
  });
</script>`;

  const webComponentSnippet = `<script src="https://cdn.lakreme.fr/widget/v1/lakreme-widget.js" defer></script>
<lakreme-widget
  restaurant-id="${restaurantId}"
  lang="fr"
></lakreme-widget>`;

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
      await new Promise(r => setTimeout(r, 800)); // simulé
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
          Copiez le code sur votre site, puis activez votre widget pour qu'il apparaisse sur La Krème.
        </p>
      </div>

      {/* Preview iframe */}
      <div className="widget-preview-container" style={{ marginBottom: '24px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
          <span className="text-sm text-muted">Prévisualisation</span>
          <a
            href={widgetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm flex items-center gap-2"
          >
            <ExternalLink size={12} /> Ouvrir
          </a>
        </div>
        <iframe
          src={`${widgetUrl}?preview=true`}
          className="widget-preview-frame"
          title="Prévisualisation widget"
          style={{ minHeight: '400px' }}
        />
      </div>

      {/* Iframe Snippet */}
      <div style={{ marginBottom: '16px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
          <span className="text-sm font-semibold">Option A — Iframe</span>
          <button className="btn btn-secondary btn-sm" onClick={() => copy(iframeSnippet, 'iframe')}>
            {copiedIframe ? <><Check size={12} /> Copié</> : <><Copy size={12} /> Copier</>}
          </button>
        </div>
        <div className="code-block" style={{ fontSize: '11px' }}>
          {iframeSnippet}
        </div>
      </div>

      {/* Web Component Snippet */}
      <div style={{ marginBottom: '24px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
          <span className="text-sm font-semibold">Option B — Web Component</span>
          <button className="btn btn-secondary btn-sm" onClick={() => copy(webComponentSnippet, 'wc')}>
            {copiedWC ? <><Check size={12} /> Copié</> : <><Copy size={12} /> Copier</>}
          </button>
        </div>
        <div className="code-block" style={{ fontSize: '11px' }}>
          {webComponentSnippet}
        </div>
      </div>

      {/* Activate */}
      {activated ? (
        <div style={{
          padding: '16px',
          background: 'var(--lk-success-muted)',
          border: '1px solid rgba(34,197,94,0.25)',
          borderRadius: 'var(--radius)',
          textAlign: 'center',
          color: 'var(--lk-success)',
          fontWeight: 600,
        }}
          className="animate-pulse-glow"
        >
          ✅ Widget activé ! Redirection vers le dashboard...
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
            ? <><div className="spinner" style={{ width: '16px', height: '16px' }} /> Activation...</>
            : <><Zap size={16} /> Activer mon widget</>
          }
        </button>
      )}

      <div className="onboarding-actions" style={{ justifyContent: 'flex-start', marginTop: '12px' }}>
        <button className="btn btn-ghost" onClick={() => navigate('/onboarding/customize')}>
          ← Retour
        </button>
      </div>
    </>
  );
}
