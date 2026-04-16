import { useState, useEffect, useCallback, useRef } from 'react';
import { Copy, Check, ExternalLink, Maximize2, Palette, MessageSquare, Link, X, BookOpen } from 'lucide-react';
import { createPortal } from 'react-dom';
import { WidgetPreview } from '../../components/widget/WidgetPreview';
import { getMyConfig, updateMyConfig, getWidgetSnippet } from '../../lib/api';
import { env } from '../../lib/env';

/** URL de réservation dérivée du token public — évite un appel réseau supplémentaire. */
function buildReserveUrl(publicToken: string): string {
  return `${env.apiUrl}/reserve/${publicToken}`;
}

/** Copie dans le clipboard avec fallback gracieux en contexte non-HTTPS. */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback document.execCommand pour HTTP en dev
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  }
}

const ACCENT_PRESETS = ['#ED73A9', '#7CC0E8', '#C6546D', '#00B4D8', '#FF6B35', '#F59E0B'] as const;

/**
 * Dashboard — Page Widget
 *
 * Approche simplifiée : la page de réservation auto-générée est le produit.
 * Le restaurateur partage son lien direct (bio Instagram, Google Maps, site web…).
 * Le widget iframe / web component est masqué pour l'instant.
 */
export default function Widget() {
  const [publicToken, setPublicToken] = useState('');
  // Lazy initializer : évite d'accéder à localStorage à chaque re-render
  const [restaurantName, setRestaurantName] = useState<string>(
    () => localStorage.getItem('lk_restaurant_name') ?? 'Mon Restaurant'
  );
  const [reserveUrl, setReserveUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Apparence
  const [accentColor, setAccentColor] = useState('#ED73A9');
  const [messageFr, setMessageFr] = useState('');
  const [messageEn, setMessageEn] = useState('');
  const [savingStyle, setSavingStyle] = useState(false);

  // Annuaire
  const [showOnDirectory, setShowOnDirectory] = useState(false);
  const [loadingToggle, setLoadingToggle] = useState(false);

  // Modal test
  const [testModalOpen, setTestModalOpen] = useState(false);

  // Ref pour éviter les setState après démontage
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Ref pour le timeout "Copié !"
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    getMyConfig().then(cfg => {
      if (cancelled) return;
      setShowOnDirectory(cfg.show_on_directory ?? false);
      setAccentColor(cfg.accent_color || '#ED73A9');
      setMessageFr(cfg.welcome_message_fr || '');
      setMessageEn(cfg.welcome_message_en || '');

      if (cfg.restaurant_name) {
        setRestaurantName(cfg.restaurant_name);
        localStorage.setItem('lk_restaurant_name', cfg.restaurant_name);
      }
      if (cfg.public_token) {
        setPublicToken(cfg.public_token);
        // Construit l'URL localement — évite un round-trip réseau supplémentaire
        setReserveUrl(buildReserveUrl(cfg.public_token));
      }

      // Fallback : le snippet endpoint est la source de vérité si l'URL diffère
      if (cfg.restaurant_id) {
        getWidgetSnippet(cfg.restaurant_id)
          .then(snip => {
            if (!cancelled && snip.reserve_url) setReserveUrl(snip.reserve_url);
          })
          .catch(() => { /* non critique — URL locale déjà définie */ });
      }
    }).catch(() => { /* silencieux si non connecté en dev */ });

    return () => { cancelled = true; };
  }, []);

  // Cleanup timeout "Copié !" au démontage
  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const handleToggleDirectory = useCallback(async (checked: boolean) => {
    setLoadingToggle(true);
    setShowOnDirectory(checked);
    try {
      await updateMyConfig({ show_on_directory: checked });
    } catch {
      // Rollback optimiste
      if (mountedRef.current) setShowOnDirectory(!checked);
    } finally {
      if (mountedRef.current) setLoadingToggle(false);
    }
  }, []);

  const handleSaveStyle = useCallback(async () => {
    setSavingStyle(true);
    setSaveError('');
    try {
      await updateMyConfig({
        accent_color: accentColor,
        welcome_message_fr: messageFr || undefined,
        welcome_message_en: messageEn || undefined,
      });
    } catch {
      if (mountedRef.current) setSaveError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      if (mountedRef.current) setSavingStyle(false);
    }
  }, [accentColor, messageFr, messageEn]);

  const copyLink = useCallback(async () => {
    if (!reserveUrl) return;
    const ok = await copyToClipboard(reserveUrl);
    if (!ok || !mountedRef.current) return;
    setCopiedLink(true);
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = setTimeout(() => {
      if (mountedRef.current) setCopiedLink(false);
    }, 2000);
  }, [reserveUrl]);

  return (
    <div className="animate-slide-up">
      {/* Modal test expérience client */}
      {testModalOpen && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tester l'expérience client"
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setTestModalOpen(false); }}
        >
          <div className="card animate-slide-up" style={{
            width: '100%', maxWidth: '500px', maxHeight: '90vh',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            position: 'relative', padding: 0,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          }}>
            <div className="flex items-center justify-between" style={{
              padding: '16px 20px', borderBottom: '1px solid var(--lk-border)',
            }}>
              <span style={{ fontWeight: 700, fontSize: '15px' }}>
                👤 Expérience client — {restaurantName}
              </span>
              <button
                onClick={() => setTestModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lk-text-muted)' }}
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              {publicToken && (
                <WidgetPreview
                  restaurantId={publicToken}
                  lang="fr"
                  preview={false}
                  showControls
                  minHeight={520}
                />
              )}
            </div>
          </div>
        </div>, document.body
      )}

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
              Ma page de réservation
            </h1>
            <p className="text-muted text-sm">
              Partagez votre lien — les clients réservent en quelques secondes.
            </p>
          </div>
          {publicToken && (
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '680px' }}>

        {/* ── 1. Page de réservation ─────────────────────────── */}
        <div className="card" style={{ padding: '24px', border: '2px solid var(--lk-border-focus)' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
            <BookOpen size={18} style={{ color: 'var(--lk-purple-light)' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Votre page de réservation</h2>
          </div>
          <p className="text-sm text-muted" style={{ marginBottom: '16px' }}>
            Mettez ce lien dans votre bio Instagram, Google Maps, votre site web —
            ou créez simplement un bouton "Réserver" qui pointe dessus.
          </p>

          {reserveUrl ? (
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: '12px' }}>
                <input
                  className="form-input"
                  value={reserveUrl}
                  readOnly
                  onClick={e => (e.target as HTMLInputElement).select()}
                  style={{ flex: 1, fontSize: '13px', fontFamily: 'monospace', color: 'var(--lk-purple-light)' }}
                  aria-label="URL de réservation"
                />
                <button
                  className="btn btn-primary"
                  onClick={copyLink}
                  style={{ whiteSpace: 'nowrap', gap: '6px' }}
                  aria-label={copiedLink ? 'Lien copié' : 'Copier le lien'}
                >
                  {copiedLink
                    ? <><Check size={14} /> Copié !</>
                    : <><Copy size={14} /> Copier</>}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={reserveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ gap: '6px', fontSize: '13px' }}
                >
                  <ExternalLink size={13} /> Ouvrir la page
                </a>
                <span className="text-xs text-muted">
                  <Link size={11} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Partageable sur tous les canaux
                </span>
              </div>
            </div>
          ) : (
            <div style={{
              padding: '16px', borderRadius: '8px',
              background: 'var(--lk-surface-2)', color: 'var(--lk-text-muted)',
              fontSize: '13px', textAlign: 'center',
            }}>
              Complétez l'onboarding pour obtenir votre lien.
            </div>
          )}
        </div>

        {/* ── 2. Apparence ──────────────────────────────────────*/}
        <div className="card" style={{ padding: '24px' }}>
          <h3 className="section-title" style={{ marginBottom: '16px' }}>
            <Palette size={15} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            Apparence de la page
          </h3>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontSize: '13px' }}>Couleur principale</label>
            <div className="flex items-center gap-3" style={{ flexWrap: 'wrap', marginTop: '8px' }}>
              {ACCENT_PRESETS.map(color => (
                <button
                  key={color}
                  onClick={() => setAccentColor(color)}
                  style={{
                    width: '28px', height: '28px', borderRadius: '50%', background: color,
                    border: `2px solid ${accentColor === color ? 'white' : 'transparent'}`,
                    boxShadow: accentColor === color ? `0 0 0 2px ${color}` : 'none',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  aria-label={`Couleur ${color}`}
                  aria-pressed={accentColor === color}
                />
              ))}
              <input
                type="color"
                value={accentColor}
                onChange={e => setAccentColor(e.target.value)}
                style={{ width: '28px', height: '28px', border: 'none', borderRadius: '50%', cursor: 'pointer', background: 'none' }}
                aria-label="Couleur personnalisée"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontSize: '13px' }}>
              <MessageSquare size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
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
              <MessageSquare size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
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

          {saveError && (
            <p className="text-sm" style={{ color: 'var(--lk-error, #e53e3e)', marginBottom: '8px' }}>
              {saveError}
            </p>
          )}

          <button
            className="btn btn-primary mt-2"
            onClick={handleSaveStyle}
            disabled={savingStyle}
          >
            {savingStyle ? 'Sauvegarde...' : "Appliquer l'apparence"}
          </button>
        </div>

        {/* ── 3. Annuaire La Krème ──────────────────────────────*/}
        <div className="card" style={{ padding: '20px', border: '1px solid var(--lk-border-focus)' }}>
          <h3 className="section-title" style={{ marginBottom: '12px' }}>
            Annuaire La Krème
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold mb-1">Afficher sur lakreme.fr</p>
              <p className="text-xs text-muted" style={{ maxWidth: '400px' }}>
                Permet aux visiteurs de réserver directement depuis votre fiche annuaire.
              </p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={showOnDirectory}
                onChange={(e) => handleToggleDirectory(e.target.checked)}
                disabled={loadingToggle}
                aria-label="Afficher sur l'annuaire La Krème"
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
