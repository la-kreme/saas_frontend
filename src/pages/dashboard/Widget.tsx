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
    <div className="lk-animate-up" style={{ maxWidth: 1440, margin: '0 auto' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18, alignItems: 'flex-start' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
        <Card padded={false} style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 'var(--fs-base)', fontWeight: 600, marginBottom: 4 }}>
            Annuaire La Kreme
          </div>
          <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--lk-text-muted)', marginBottom: 14 }}>
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
    <Card padded={false} style={{
      padding: '18px 20px',
      background: 'linear-gradient(135deg, white 0%, var(--lk-primary-soft) 130%)',
      border: '1px solid rgba(237, 115, 169, 0.25)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Link2 size={15} style={{ color: 'var(--lk-primary-strong)' }} />
        <span style={{ fontSize: 'var(--fs-base)', fontWeight: 600 }}>
          Votre page de reservation
        </span>
      </div>
      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--lk-text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
        Mettez ce lien dans votre bio Instagram, Google Maps, votre site web — ou creez un bouton "Reserver" qui pointe dessus.
      </p>
      {reserveUrl ? (
        <>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <input
              value={reserveUrl}
              readOnly
              onClick={e => (e.target as HTMLInputElement).select()}
              style={{
                flex: 1, height: 38, padding: '0 12px',
                fontSize: 'var(--fs-sm)', fontFamily: 'var(--font-mono)',
                border: '1px solid var(--lk-border)', borderRadius: 'var(--radius)',
                background: 'white', color: 'var(--lk-primary-strong)', outline: 'none',
              }}
            />
            <Button variant="primary" size="md" icon={copiedLink ? <Check size={13} /> : <Copy size={13} />} onClick={onCopy}>
              {copiedLink ? 'Copie' : 'Copier'}
            </Button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--fs-sm)', color: 'var(--lk-text-muted)' }}>
            <Button variant="sky" size="sm" icon={<ExternalLink size={12} />} onClick={() => window.open(reserveUrl, '_blank')}>
              Ouvrir la page
            </Button>
            <span>· Partageable sur tous les canaux</span>
          </div>
        </>
      ) : (
        <div style={{
          padding: 16, borderRadius: 'var(--radius)',
          background: 'var(--lk-surface-2)', color: 'var(--lk-text-muted)',
          fontSize: 'var(--fs-sm)', textAlign: 'center',
        }}>
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
    <Card padded={false} style={{ padding: '18px 20px' }}>
      <div style={{ fontSize: 'var(--fs-base)', fontWeight: 600, marginBottom: 14 }}>
        Apparence
      </div>

      <FieldLabel label="Couleur principale">
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {ACCENT_PRESETS.map(c => (
            <button
              key={c}
              onClick={() => onColorChange(c)}
              style={{
                width: 30, height: 30, borderRadius: '50%', background: c,
                border: accentColor === c ? '3px solid white' : '3px solid transparent',
                boxShadow: accentColor === c ? `0 0 0 2px ${c}` : 'var(--shadow-xs)',
                cursor: 'pointer', transition: 'all var(--transition-fast)',
              }}
            />
          ))}
        </div>
      </FieldLabel>

      <div style={{ marginTop: 14 }}>
        <FieldLabel label="Message de bienvenue (FR)">
          <textarea
            value={messageFr}
            onChange={e => onMessageFrChange(e.target.value)}
            rows={2}
            maxLength={200}
            placeholder="Bienvenue ! Reservez votre table..."
            style={{ ...inputStyle, height: 'auto', padding: '8px 10px', resize: 'none' }}
          />
        </FieldLabel>
      </div>
      <div style={{ marginTop: 10 }}>
        <FieldLabel label="Message de bienvenue (EN)">
          <textarea
            value={messageEn}
            onChange={e => onMessageEnChange(e.target.value)}
            rows={2}
            maxLength={200}
            placeholder="Welcome! Book your table..."
            style={{ ...inputStyle, height: 'auto', padding: '8px 10px', resize: 'none' }}
          />
        </FieldLabel>
      </div>

      {error && <p style={{ color: 'var(--lk-error)', fontSize: 'var(--fs-sm)', marginTop: 8 }}>{error}</p>}

      <div style={{ marginTop: 14 }}>
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
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <Card style={{
        width: '100%', maxWidth: 500, maxHeight: '90vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        padding: 0, boxShadow: 'var(--shadow-xl)',
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--lk-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontWeight: 700, fontSize: 'var(--fs-md)' }}>
            Experience client — {restaurantName}
          </span>
          <IconBtn onClick={onClose}><X size={16} /></IconBtn>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          <WidgetPreview restaurantId={publicToken} lang="fr" preview={false} showControls minHeight={520} />
        </div>
      </Card>
    </div>,
    document.body,
  );
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 500, color: 'var(--lk-text-secondary)' }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  height: 34, padding: '0 10px', fontSize: 'var(--fs-sm)',
  border: '1px solid var(--lk-border)', borderRadius: 'var(--radius-sm)',
  background: 'var(--lk-bg-card)', outline: 'none', color: 'var(--lk-text-primary)',
  width: '100%', fontFamily: 'inherit',
};
