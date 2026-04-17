import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, Zap, ExternalLink } from 'lucide-react';
import { WidgetPreview } from '../../components/widget/WidgetPreview';
import { getMyConfig, activateWidget, getWidgetSnippet, updateMyConfig, getErrorMessage } from '../../lib/api';
import { env } from '../../lib/env';

/**
 * Step 5 — Mon Widget
 * Prévisualisation live via WidgetPreview, snippets à copier, activation.
 */
export default function Step5Widget() {
  const navigate = useNavigate();
  const [restaurantId, setRestaurantId] = useState('');
  const [publicToken, setPublicToken] = useState('');
  const [restaurantName, setRestaurantName] = useState('Mon Restaurant');
  const [iframeSnippet, setIframeSnippet] = useState('');
  const [webComponentSnippet, setWebComponentSnippet] = useState('');

  const apiBase = env.apiUrl;

  const [copiedIframe, setCopiedIframe] = useState(false);
  const [copiedWC, setCopiedWC] = useState(false);
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);
  const [showOnDirectory, setShowOnDirectory] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Charger la config pour récupérer le restaurant_id réel
    getMyConfig().then(cfg => {
      setRestaurantId(cfg.restaurant_id);
      setRestaurantName(cfg.restaurant_name);
      if (cfg.public_token) setPublicToken(cfg.public_token);
      // Charger les snippets
      return getWidgetSnippet(cfg.restaurant_id);
    }).then(snip => {
      setIframeSnippet(snip.iframe_snippet);
      setWebComponentSnippet(snip.webcomponent_snippet);
    }).catch(() => {
      // Fallback si l'API n'est pas disponible en local
    });
  }, []);

  const widgetSrc = publicToken ? `${apiBase}/widget/${publicToken}` : '';

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
    setError('');
    try {
      if (showOnDirectory) {
        await updateMyConfig({ show_on_directory: true });
      }
      await activateWidget();
      setActivated(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erreur lors de l'activation. Assurez-vous d'avoir ajouté des tables et des horaires."));
    } finally {
      setActivating(false);
    }
  };

  return (
    <>
      <div className="onboarding-step-header">
        <div className="onboarding-step-number">Étape 5 sur 5</div>
        <h1 className="onboarding-step-title">Mon Widget</h1>
        {restaurantName && restaurantName !== 'Mon Restaurant' && (
          <p className="text-sm" style={{ color: 'var(--lk-purple-light)', fontWeight: 600, marginBottom: '4px' }}>
            {restaurantName}
          </p>
        )}
        <p className="onboarding-step-desc">
          Voici votre widget de réservation en direct. Copiez le code sur votre site
          puis activez-le pour qu'il soit visible sur Koulis.
        </p>
      </div>

      {/* Options */}
      <div style={{
          padding: '16px', background: 'var(--lk-surface-2)', border: '1px solid var(--lk-border)',
          borderRadius: 'var(--radius)', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px'
        }}>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="showOnDirectory"
            checked={showOnDirectory}
            onChange={(e) => setShowOnDirectory(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--lk-primary)' }}
          />
          <label htmlFor="showOnDirectory" style={{ fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
            Activer la réservation sur l'annuaire Koulis
          </label>
        </div>
        <p className="text-xs text-muted" style={{ marginLeft: '30px' }}>
          Les visiteurs de meilleurbrunch.com pourront réserver directement depuis votre fiche établissement. Fortement recommandé pour booster vos réservations.
        </p>
      </div>

      {/* Live preview */}
      {publicToken ? (
        <div style={{ marginBottom: '20px' }}>
          <WidgetPreview
            restaurantId={publicToken}
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

      {error && (
        <p className="form-error" style={{ marginTop: '12px', textAlign: 'center' }}>{error}</p>
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
