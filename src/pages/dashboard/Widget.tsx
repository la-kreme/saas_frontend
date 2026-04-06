import { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, Maximize2, Palette, MessageSquare, Link } from 'lucide-react';
import { WidgetPreview } from '../../components/widget/WidgetPreview';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8005';

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
  const [restaurantId, setRestaurantId] = useState(localStorage.getItem('lk_restaurant_id') || '');
  const [restaurantName, setRestaurantName] = useState(localStorage.getItem('lk_restaurant_name') || 'Mon Restaurant');
  const [publicToken, setPublicToken] = useState('');
  const widgetSrc = publicToken ? `${API_BASE}/widget/${publicToken}` : '';

  const [copiedIframe, setCopiedIframe] = useState(false);
  const [copiedWC, setCopiedWC] = useState(false);
  const [activeTab, setActiveTab] = useState<'iframe' | 'webcomponent'>('iframe');
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [reserveUrl, setReserveUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  
  // States
  const [showOnDirectory, setShowOnDirectory] = useState(false);
  const [loadingToggle, setLoadingToggle] = useState(false);
  const [accentColor, setAccentColor] = useState('#ED73A9');
  const [messageFr, setMessageFr] = useState('');
  const [messageEn, setMessageEn] = useState('');
  const [savingStyle, setSavingStyle] = useState(false);

  useEffect(() => {
    import('../../lib/api').then(({ getMyConfig }) => {
      getMyConfig().then(cfg => {
        setShowOnDirectory(cfg.show_on_directory ?? false);
        setAccentColor(cfg.accent_color || '#ED73A9');
        setMessageFr(cfg.welcome_message_fr || '');
        setMessageEn(cfg.welcome_message_en || '');
        
        if (cfg.restaurant_id) {
          setRestaurantId(cfg.restaurant_id);
          localStorage.setItem('lk_restaurant_id', cfg.restaurant_id);
        }
        if (cfg.public_token) {
          setPublicToken(cfg.public_token);
        }
        if (cfg.restaurant_name) {
          setRestaurantName(cfg.restaurant_name);
          localStorage.setItem('lk_restaurant_name', cfg.restaurant_name);
        }
        // Fetch reserve URL
        if (cfg.restaurant_id) {
          import('../../lib/api').then(({ getWidgetSnippet }) => {
            getWidgetSnippet(cfg.restaurant_id).then(snip => {
              if (snip.reserve_url) setReserveUrl(snip.reserve_url);
            }).catch(() => {});
          });
        }
      });
    });
  }, []);

  const handleToggleDirectory = async (checked: boolean) => {
    setLoadingToggle(true);
    setShowOnDirectory(checked);
    try {
      const { updateMyConfig } = await import('../../lib/api');
      await updateMyConfig({ show_on_directory: checked });
    } catch {
      setShowOnDirectory(!checked);
    } finally {
      setLoadingToggle(false);
    }
  };

  const handleSaveStyle = async () => {
    setSavingStyle(true);
    try {
      const { updateMyConfig } = await import('../../lib/api');
      await updateMyConfig({
        accent_color: accentColor,
        welcome_message_fr: messageFr || undefined,
        welcome_message_en: messageEn || undefined,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingStyle(false);
    }
  };

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
        <div className="flex-col gap-6 flex-1">
          {/* Option Annuaire La Krème */}
          <div className="card" style={{ padding: '20px', border: '1px solid var(--lk-border-focus)' }}>
            <h3 className="section-title" style={{ marginBottom: '12px' }}>
              Intégration Annuaire La Krème
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold mb-1">
                  Afficher sur meilleurbrunch.com
                </p>
                <p className="text-xs text-muted" style={{ maxWidth: '400px' }}>
                  Permet aux visiteurs de réserver directement depuis votre fiche annuaire. 
                  Désactivez cette option si vous souhaitez être masqué temporairement de l'annuaire.
                </p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={showOnDirectory}
                  onChange={(e) => handleToggleDirectory(e.target.checked)}
                  disabled={loadingToggle}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          {/* Lien de réservation */}
          {reserveUrl && (
            <div className="card" style={{ padding: '20px', border: '1px solid var(--lk-border)' }}>
              <h3 className="section-title" style={{ marginBottom: '12px' }}>
                <Link size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                Lien de réservation
              </h3>
              <p className="text-xs text-muted" style={{ marginBottom: '12px' }}>
                Partagez ce lien sur vos réseaux sociaux, votre bio Instagram, Google Maps, etc.
              </p>
              <div className="flex items-center gap-2">
                <input
                  className="form-input"
                  value={reserveUrl}
                  readOnly
                  onClick={e => (e.target as HTMLInputElement).select()}
                  style={{ flex: 1, fontSize: '12px', fontFamily: 'monospace', color: 'var(--lk-purple-light)' }}
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={async () => {
                    await navigator.clipboard.writeText(reserveUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {copiedLink ? <><Check size={14} /> Copié</> : <><Copy size={14} /> Copier</>}
                </button>
              </div>
            </div>
          )}

          {/* Personnalisation */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 className="section-title" style={{ marginBottom: '16px' }}>
              Apparence
            </h3>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '13px' }}>
                <Palette size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                Couleur principale
              </label>
              <div className="flex items-center gap-3" style={{ flexWrap: 'wrap', marginTop: '8px' }}>
                {['#ED73A9', '#7CC0E8', '#C6546D', '#00B4D8', '#FF6B35', '#F59E0B'].map(color => (
                  <button
                    key={color}
                    onClick={() => setAccentColor(color)}
                    style={{
                      width: '28px', height: '28px', borderRadius: '50%', background: color,
                      border: `2px solid ${accentColor === color ? 'white' : 'transparent'}`,
                      boxShadow: accentColor === color ? `0 0 0 2px ${color}` : 'none',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    title={color}
                  />
                ))}
                <input
                  type="color"
                  value={accentColor}
                  onChange={e => setAccentColor(e.target.value)}
                  style={{ width: '28px', height: '28px', border: 'none', borderRadius: '50%', cursor: 'pointer', background: 'none' }}
                  title="Couleur personnalisée"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '13px' }}>
                <MessageSquare size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                Message de bienvenue (Français)
              </label>
              <textarea
                className="form-input mt-1"
                style={{ height: '70px', padding: '8px 12px', resize: 'vertical', fontSize: '13px', width: '100%' }}
                placeholder="Bienvenue ! Réservez votre table..."
                maxLength={200}
                value={messageFr}
                onChange={e => setMessageFr(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '13px' }}>
                <MessageSquare size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                Message de bienvenue (Anglais)
              </label>
              <textarea
                className="form-input mt-1"
                style={{ height: '70px', padding: '8px 12px', resize: 'vertical', fontSize: '13px', width: '100%' }}
                placeholder="Welcome! Book your table..."
                maxLength={200}
                value={messageEn}
                onChange={e => setMessageEn(e.target.value)}
              />
            </div>
            
            <button 
              className="btn btn-primary mt-2" 
              onClick={handleSaveStyle} 
              disabled={savingStyle}
            >
              {savingStyle ? 'Sauvegarde...' : 'Appliquer l\'apparence'}
            </button>
          </div>

          {/* Snippets Installation */}
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
            background: 'var(--lk-surface-2)',
            border: '1px solid var(--lk-border)', borderRadius: 'var(--radius-xl)',
            padding: '16px',
          }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
              <span className="text-sm font-semibold">Prévisualisation</span>
            </div>
            {publicToken ? (
              <WidgetPreview
                restaurantId={publicToken}
                lang="fr"
                preview
                showControls
                minHeight={500}
                liveAccentColor={accentColor}
                liveWelcomeFr={messageFr}
                liveWelcomeEn={messageEn}
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
