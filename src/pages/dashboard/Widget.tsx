import { useState } from 'react';
import { Copy, Check, ExternalLink, Maximize2 } from 'lucide-react';
import { WidgetPreview } from '../../components/widget/WidgetPreview';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const PLATFORMS = [
  {
    name: 'WordPress',
    icon: '🟦',
    steps: 'Éditeur de blocs → Ajouter un bloc → « HTML personnalisé » → Coller le code',
  },
  {
    name: 'Wix',
    icon: '🟪',
    steps: 'Ajouter → Plus → HTML/iFrame → Coller le code dans la fenêtre',
  },
  {
    name: 'Squarespace',
    icon: '⬛',
    steps: 'Modifier une page → Insérer un bloc → Code → Coller le code',
  },
  {
    name: 'Webflow',
    icon: '🔵',
    steps: 'Composants → Embed → Coller le code → Publier',
  },
  {
    name: 'HTML pur',
    icon: '🟠',
    steps: 'Coller le snippet juste avant </body> dans votre fichier HTML',
  },
];

/**
 * Dashboard — Page Widget (Sprint 2 update)
 * Utilise WidgetPreview avec postMessage, modal fullscreen test, guide plateformes.
 */
export default function Widget() {
  const restaurantId = localStorage.getItem('lk_restaurant_id') || '';
  const restaurantName = localStorage.getItem('lk_restaurant_name') || 'Mon Restaurant';
  const widgetSrc = `${API_BASE}/widget/${restaurantId}`;

  const [copiedIframe, setCopiedIframe] = useState(false);
  const [copiedWC, setCopiedWC] = useState(false);
  const [activeTab, setActiveTab] = useState<'iframe' | 'webcomponent'>('iframe');
  const [testModalOpen, setTestModalOpen] = useState(false);

  const iframeSnippet = `<iframe\n  src="${widgetSrc}"\n  width="100%"\n  height="540"\n  frameborder="0"\n  style="border:none; border-radius:12px;"\n  title="Réserver — ${restaurantName}"\n  loading="lazy"\n></iframe>\n<script>\n  window.addEventListener('message', function(e) {\n    if (e.data && e.data.type === 'lk-resize') {\n      document.querySelector('iframe[src*="${restaurantId}"]').style.height = e.data.height + 'px';\n    }\n  });\n</script>`;

  const webComponentSnippet = `<script src="https://cdn.lakreme.fr/widget/v1/lakreme-widget.js" defer></script>\n<lakreme-widget\n  restaurant-id="${restaurantId}"\n  lang="fr"\n></lakreme-widget>`;

  const copy = async (text: string, which: 'iframe' | 'wc') => {
    await navigator.clipboard.writeText(text);
    if (which === 'iframe') { setCopiedIframe(true); setTimeout(() => setCopiedIframe(false), 2000); }
    else { setCopiedWC(true); setTimeout(() => setCopiedWC(false), 2000); }
  };

  return (
    <div className="animate-slide-up">
      {/* Test modal fullscreen */}
      {testModalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(8px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '24px 16px',
            overflowY: 'auto',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setTestModalOpen(false); }}
        >
          <div style={{ width: '100%', maxWidth: '480px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '16px', color: 'white' }}>
              <span style={{ fontWeight: 700, fontSize: '16px' }}>
                👤 Expérience client
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setTestModalOpen(false)}
              >
                Fermer ✕
              </button>
            </div>
            {restaurantId && (
              <WidgetPreview
                restaurantId={restaurantId}
                lang="fr"
                preview={false}
                showControls
                minHeight={520}
              />
            )}
          </div>
        </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
              Mon Widget
            </h1>
            <p className="text-muted text-sm">Intégrez et testez votre widget de réservation.</p>
          </div>
          {restaurantId && (
            <button
              className="btn btn-primary"
              onClick={() => setTestModalOpen(true)}
              style={{ gap: '8px' }}
            >
              <Maximize2 size={14} /> Tester comme client
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* ── Colonne gauche : snippets + guide ── */}
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

          {/* Snippet */}
          <div className="card">
            <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
              <h2 className="text-sm font-semibold">
                {activeTab === 'iframe' ? 'Option A — Iframe' : 'Option B — Web Component'}
              </h2>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => copy(activeTab === 'iframe' ? iframeSnippet : webComponentSnippet, activeTab === 'iframe' ? 'iframe' : 'wc')}
              >
                {(activeTab === 'iframe' ? copiedIframe : copiedWC)
                  ? <><Check size={12} /> Copié !</>
                  : <><Copy size={12} /> Copier</>}
              </button>
            </div>
            <p className="text-xs text-muted" style={{ marginBottom: '10px' }}>
              {activeTab === 'iframe'
                ? 'Compatible avec tous les sites web. Recommandé pour commencer.'
                : 'Pour les sites avec accès direct au HTML. Plus léger.'}
            </p>
            <div className="code-block" style={{ fontSize: '10px', lineHeight: 1.5 }}>
              {activeTab === 'iframe' ? iframeSnippet : webComponentSnippet}
            </div>
          </div>

          {/* Guide plateformes */}
          <div className="card" style={{ padding: '16px' }}>
            <h3 className="text-sm font-semibold" style={{ marginBottom: '12px' }}>
              📋 Guide d'installation
            </h3>
            <div className="flex-col gap-3">
              {PLATFORMS.map(({ name, icon, steps }) => (
                <div key={name}>
                  <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>
                    {icon} {name}
                  </div>
                  <div className="text-xs text-muted">{steps}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Ouvrir */}
          <a
            href={widgetSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary flex items-center gap-2"
          >
            <ExternalLink size={14} /> Ouvrir dans un onglet
          </a>
        </div>

        {/* ── Colonne droite : preview live ── */}
        <div>
          <div style={{
            background: 'linear-gradient(135deg, #1a1726, #221e35)',
            border: '1px solid var(--lk-border)', borderRadius: 'var(--radius-xl)',
            padding: '16px',
          }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
              <span className="text-sm font-semibold">Prévisualisation</span>
            </div>
            {restaurantId ? (
              <WidgetPreview
                restaurantId={restaurantId}
                lang="fr"
                preview
                showControls
                minHeight={500}
              />
            ) : (
              <div style={{
                minHeight: '480px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'var(--lk-text-muted)', fontSize: '13px',
              }}>
                Complétez l'onboarding pour voir l'aperçu
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
