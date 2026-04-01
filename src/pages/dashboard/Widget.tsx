import { useState } from 'react';
import { Copy, Check, ExternalLink, Zap } from 'lucide-react';

/**
 * Dashboard — Page Widget
 * Snippets embed + prévisualisation iframe live.
 */
export default function Widget() {
  const restaurantId = localStorage.getItem('lk_restaurant_id') || '';
  const restaurantName = localStorage.getItem('lk_restaurant_name') || 'Mon Restaurant';
  const widgetBase = import.meta.env.VITE_WIDGET_BASE_URL || 'http://localhost:8001';
  const widgetUrl = `${widgetBase}/widget/${restaurantId}`;

  const [copiedIframe, setCopiedIframe] = useState(false);
  const [copiedWC, setCopiedWC] = useState(false);
  const [activeTab, setActiveTab] = useState<'iframe' | 'webcomponent'>('iframe');

  const iframeSnippet = `<iframe\n  src="${widgetUrl}"\n  width="100%"\n  height="540"\n  frameborder="0"\n  style="border:none; border-radius:12px;"\n  title="Réserver — ${restaurantName}"\n  loading="lazy"\n></iframe>\n<script>\n  window.addEventListener('message', function(e) {\n    if (e.data && e.data.type === 'lk-resize') {\n      document.querySelector('iframe[src*="${restaurantId}"]').style.height = e.data.height + 'px';\n    }\n  });\n</script>`;

  const webComponentSnippet = `<script src="https://cdn.lakreme.fr/widget/v1/lakreme-widget.js" defer></script>\n<lakreme-widget\n  restaurant-id="${restaurantId}"\n  lang="fr"\n></lakreme-widget>`;

  const copy = async (text: string, which: 'iframe' | 'wc') => {
    await navigator.clipboard.writeText(text);
    if (which === 'iframe') { setCopiedIframe(true); setTimeout(() => setCopiedIframe(false), 2000); }
    else { setCopiedWC(true); setTimeout(() => setCopiedWC(false), 2000); }
  };

  return (
    <div className="animate-slide-up">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Mon Widget
        </h1>
        <p className="text-muted text-sm">Intégrez votre widget de réservation sur votre site.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Snippets */}
        <div className="flex-col gap-4">
          {/* Tabs */}
          <div className="flex gap-2">
            {(['iframe', 'webcomponent'] as const).map(tab => (
              <button
                key={tab}
                className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'iframe' ? 'Iframe' : 'Web Component'}
              </button>
            ))}
          </div>

          {activeTab === 'iframe' ? (
            <div className="card">
              <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                <h2 className="text-sm font-semibold">Option A — Iframe</h2>
                <button className="btn btn-secondary btn-sm" onClick={() => copy(iframeSnippet, 'iframe')}>
                  {copiedIframe ? <><Check size={12} /> Copié</> : <><Copy size={12} /> Copier</>}
                </button>
              </div>
              <p className="text-xs text-muted" style={{ marginBottom: '12px' }}>
                Compatible WordPress, Wix, Squarespace, Webflow — n'importe quel site.
              </p>
              <div className="code-block" style={{ fontSize: '10px' }}>
                {iframeSnippet}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                <h2 className="text-sm font-semibold">Option B — Web Component</h2>
                <button className="btn btn-secondary btn-sm" onClick={() => copy(webComponentSnippet, 'wc')}>
                  {copiedWC ? <><Check size={12} /> Copié</> : <><Copy size={12} /> Copier</>}
                </button>
              </div>
              <p className="text-xs text-muted" style={{ marginBottom: '12px' }}>
                Pour les sites avec accès direct au code HTML.
              </p>
              <div className="code-block" style={{ fontSize: '10px' }}>
                {webComponentSnippet}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="card" style={{ padding: '16px' }}>
            <h3 className="text-sm font-semibold" style={{ marginBottom: '12px' }}>
              📋 Instructions d'installation
            </h3>
            {[
              { platform: 'WordPress', steps: 'Éditeur de blocs → Bloc "HTML personnalisé" → coller le code' },
              { platform: 'Wix', steps: 'Ajouter → Créer » HTML/iFrame → Coller le code' },
              { platform: 'Squarespace', steps: 'Bloc de code → Coller le code iframe' },
            ].map(({ platform, steps }) => (
              <div key={platform} style={{ marginBottom: '8px', fontSize: '12px' }}>
                <span style={{ fontWeight: 600, color: 'var(--lk-text-primary)' }}>{platform}</span>
                <span className="text-muted"> — {steps}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div>
          <div className="widget-preview-container">
            <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
              <span className="text-sm font-semibold">Prévisualisation live</span>
              <a href={widgetUrl} target="_blank" rel="noopener" className="btn btn-ghost btn-sm">
                <ExternalLink size={12} /> Ouvrir
              </a>
            </div>
            <iframe
              src={`${widgetUrl}?preview=true`}
              className="widget-preview-frame"
              title="Prévisualisation widget"
              style={{ minHeight: '500px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
