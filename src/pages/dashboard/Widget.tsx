import { useState, useEffect, useCallback, useRef } from 'react';
import { Copy, Check, ExternalLink, Link2, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { WidgetPreview } from '../../components/widget/WidgetPreview';
import { getMyConfig, updateMyConfig } from '../../lib/api';
import { env } from '../../lib/env';
import { PageHeader, Card, Button, IconBtn } from '../../components/ui';

function buildReserveUrl(publicToken: string): string {
  return `${env.apiUrl}/reserve/${publicToken}`;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
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

const ACCENT_PRESETS = ['#ED73A9', '#7CC0E8', '#C6546D', '#5BADE0', '#F59E0B', '#22C55E', '#A855F7'] as const;

export default function Widget() {
  const [publicToken, setPublicToken] = useState('');
  const [restaurantName, setRestaurantName] = useState<string>(
    () => localStorage.getItem('lk_restaurant_name') ?? 'Mon Restaurant'
  );
  const [reserveUrl, setReserveUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [accentColor, setAccentColor] = useState('#ED73A9');
  const [messageFr, setMessageFr] = useState('');
  const [messageEn, setMessageEn] = useState('');
  const [savingStyle, setSavingStyle] = useState(false);
  const [showOnDirectory, setShowOnDirectory] = useState(false);
  const [loadingToggle, setLoadingToggle] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);

  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current); }, []);

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
        setReserveUrl(buildReserveUrl(cfg.public_token));
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const handleToggleDirectory = useCallback(async (checked: boolean) => {
    setLoadingToggle(true);
    setShowOnDirectory(checked);
    try { await updateMyConfig({ show_on_directory: checked }); }
    catch { if (mountedRef.current) setShowOnDirectory(!checked); }
    finally { if (mountedRef.current) setLoadingToggle(false); }
  }, []);

  const handleSaveStyle = useCallback(async () => {
    setSavingStyle(true); setSaveError('');
    try {
      await updateMyConfig({
        accent_color: accentColor,
        welcome_message_fr: messageFr || undefined,
        welcome_message_en: messageEn || undefined,
      });
    } catch { if (mountedRef.current) setSaveError('Une erreur est survenue.'); }
    finally { if (mountedRef.current) setSavingStyle(false); }
  }, [accentColor, messageFr, messageEn]);

  const copyLink = useCallback(async () => {
    if (!reserveUrl) return;
    const ok = await copyToClipboard(reserveUrl);
    if (!ok || !mountedRef.current) return;
    setCopiedLink(true);
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = setTimeout(() => { if (mountedRef.current) setCopiedLink(false); }, 2000);
  }, [reserveUrl]);

  return (
    <div className="lk-animate-up lk-page-container">
      {/* Test modal */}
      {testModalOpen && <TestModal
        restaurantName={restaurantName}
        publicToken={publicToken}
        onClose={() => setTestModalOpen(false)}
      />}

      <PageHeader
        title="Ma page de reservation"
        subtitle="Partagez votre lien — les clients reservent en quelques secondes."
        right={
          publicToken ? (
            <Button variant="secondary" size="md" icon={<ExternalLink size={14} strokeWidth={2} />} onClick={() => setTestModalOpen(true)}>
              Tester comme client
            </Button>
          ) : undefined
        }
      />

      <div className="lk-widget-grid">
        {/* Left */}
        <div className="lk-widget-left-col">
          <ShareLinkCard
            reserveUrl={reserveUrl}
            copiedLink={copiedLink}
            onCopy={copyLink}
          />

          <AppearanceCard
            accentColor={accentColor}
            onColorChange={setAccentColor}
            messageFr={messageFr}
            messageEn={messageEn}
            onMessageFrChange={setMessageFr}
            onMessageEnChange={setMessageEn}
            onSave={handleSaveStyle}
            saving={savingStyle}
            error={saveError}
          />
        </div>

        {/* Right */}
        <Card padded={false} className="lk-widget-directory-card">
          <div className="lk-widget-directory-title">
            Annuaire La Kreme
          </div>
          <div className="lk-widget-directory-desc">
            Afficher sur lakreme.fr pour que les visiteurs reservent depuis votre fiche.
          </div>
          <label className="toggle">
            <input type="checkbox" checked={showOnDirectory} onChange={e => handleToggleDirectory(e.target.checked)} disabled={loadingToggle} />
            <span className="toggle-slider" />
          </label>
        </Card>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ShareLinkCard({ reserveUrl, copiedLink, onCopy }: {
  reserveUrl: string; copiedLink: boolean; onCopy: () => void;
}) {
  return (
    <Card padded={false} className="lk-widget-share-card">
      <div className="lk-widget-share-header">
        <Link2 size={15} className="lk-widget-share-icon" />
        <span className="lk-widget-share-title">
          Votre page de reservation
        </span>
      </div>
      <p className="lk-widget-share-desc">
        Mettez ce lien dans votre bio Instagram, Google Maps, votre site web — ou creez un bouton "Reserver" qui pointe dessus.
      </p>
      {reserveUrl ? (
        <>
          <div className="lk-widget-share-url-row">
            <input
              value={reserveUrl}
              readOnly
              onClick={e => (e.target as HTMLInputElement).select()}
              className="lk-widget-share-url-input"
            />
            <Button variant="primary" size="md" icon={copiedLink ? <Check size={13} /> : <Copy size={13} />} onClick={onCopy}>
              {copiedLink ? 'Copie' : 'Copier'}
            </Button>
          </div>
          <div className="lk-widget-share-actions">
            <Button variant="sky" size="sm" icon={<ExternalLink size={12} />} onClick={() => window.open(reserveUrl, '_blank')}>
              Ouvrir la page
            </Button>
            <span>· Partageable sur tous les canaux</span>
          </div>
        </>
      ) : (
        <div className="lk-widget-share-placeholder">
          Completez l'onboarding pour obtenir votre lien.
        </div>
      )}
    </Card>
  );
}

function AppearanceCard({ accentColor, onColorChange, messageFr, messageEn, onMessageFrChange, onMessageEnChange, onSave, saving, error }: {
  accentColor: string; onColorChange: (c: string) => void;
  messageFr: string; messageEn: string;
  onMessageFrChange: (v: string) => void; onMessageEnChange: (v: string) => void;
  onSave: () => void; saving: boolean; error: string;
}) {
  return (
    <Card padded={false} className="lk-widget-appearance-card">
      <div className="lk-widget-appearance-title">
        Apparence
      </div>

      <FieldLabel label="Couleur principale">
        <div className="lk-widget-color-swatches">
          {ACCENT_PRESETS.map(c => (
            <button
              key={c}
              onClick={() => onColorChange(c)}
              className={accentColor === c ? 'lk-widget-color-swatch lk-widget-color-swatch--selected' : 'lk-widget-color-swatch lk-widget-color-swatch--unselected'}
              style={{
                background: c,
                boxShadow: accentColor === c ? `0 0 0 2px ${c}` : undefined,
              }}
            />
          ))}
        </div>
      </FieldLabel>

      <div className="lk-widget-msg-section">
        <FieldLabel label="Message de bienvenue (FR)">
          <textarea
            value={messageFr}
            onChange={e => onMessageFrChange(e.target.value)}
            rows={2}
            maxLength={200}
            placeholder="Bienvenue ! Reservez votre table..."
            className="lk-hours-input lk-widget-textarea"
          />
        </FieldLabel>
      </div>
      <div className="lk-widget-msg-section--sm">
        <FieldLabel label="Message de bienvenue (EN)">
          <textarea
            value={messageEn}
            onChange={e => onMessageEnChange(e.target.value)}
            rows={2}
            maxLength={200}
            placeholder="Welcome! Book your table..."
            className="lk-hours-input lk-widget-textarea"
          />
        </FieldLabel>
      </div>

      {error && <p className="lk-widget-error">{error}</p>}

      <div className="lk-widget-save-wrap">
        <Button variant="primary" size="sm" onClick={onSave} disabled={saving}>
          {saving ? 'Sauvegarde...' : "Appliquer l'apparence"}
        </Button>
      </div>
    </Card>
  );
}



function TestModal({ restaurantName, publicToken, onClose }: {
  restaurantName: string; publicToken: string; onClose: () => void;
}) {
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="lk-widget-modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <Card className="lk-widget-modal-card">
        <div className="lk-widget-modal-header">
          <span className="lk-widget-modal-title">
            Experience client — {restaurantName}
          </span>
          <IconBtn onClick={onClose}><X size={16} /></IconBtn>
        </div>
        <div className="lk-widget-modal-body">
          <WidgetPreview restaurantId={publicToken} lang="fr" preview={false} showControls minHeight={520} />
        </div>
      </Card>
    </div>,
    document.body,
  );
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="lk-field-label">
      <span className="lk-field-label-text">
        {label}
      </span>
      {children}
    </label>
  );
}
