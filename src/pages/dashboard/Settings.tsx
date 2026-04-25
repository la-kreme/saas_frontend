import { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle2, Trash2 } from 'lucide-react';
import { getMyConfig, updateMyConfig, getErrorMessage } from '../../lib/api';
import { PageHeader, Card, Button } from '../../components/ui';

export default function Settings() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [minCancelHours, setMinCancelHours] = useState(2);
  const [advanceBookingDays, setAdvanceBookingDays] = useState(30);
  const [confirmMode, setConfirmMode] = useState<'auto' | 'manual'>('auto');

  useEffect(() => {
    getMyConfig().then(cfg => {
      setEmail(cfg.notification_email ?? '');
      setPhone(cfg.notification_phone ?? '');
      setMinCancelHours(cfg.min_cancel_hours ?? 2);
      setAdvanceBookingDays(cfg.advance_booking_days ?? 30);
      setConfirmMode(cfg.confirmation_mode as 'auto' | 'manual' || 'auto');
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await updateMyConfig({
        notification_email: email,
        notification_phone: phone || undefined,
        min_cancel_hours: minCancelHours,
        advance_booking_days: advanceBookingDays,
        confirmation_mode: confirmMode,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erreur lors de la sauvegarde.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="lk-animate-up" style={{ maxWidth: 880, margin: '0 auto' }}>
      <PageHeader
        title="Parametres"
        subtitle="Configuration avancee de votre widget de reservation."
        right={
          <Button
            variant="primary"
            size="md"
            icon={saving ? <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> : saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Enregistrement...' : saved ? 'Enregistre' : 'Enregistrer'}
          </Button>
        }
      />

      {error && <p className="form-error" style={{ margin: '12px 0' }}>{error}</p>}

      {/* Notifications */}
      <SettingGroup title="Notifications" subtitle="Recevez les alertes de nouvelles reservations.">
        <FieldLabel label="Email de notification">
          <input className="form-input" type="email" placeholder="restaurant@exemple.fr" value={email} onChange={e => setEmail(e.target.value)} />
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--lk-text-muted)', marginTop: 4, display: 'block' }}>
            Recoit les alertes de nouvelles reservations.
          </span>
        </FieldLabel>
        <FieldLabel label="Telephone (SMS)">
          <input className="form-input" type="tel" placeholder="+33 6 12 34 56 78" value={phone} onChange={e => setPhone(e.target.value)} />
        </FieldLabel>
      </SettingGroup>

      {/* Regles de reservation */}
      <SettingGroup title="Regles de reservation" subtitle="Definissez les contraintes pour vos clients.">
        <SliderRow
          label="Delai minimum d'annulation"
          value={`${minCancelHours}h`}
          hint={`Un client peut annuler jusqu'a ${minCancelHours}h avant sa reservation.`}
          min={0} max={48} step={1}
          current={minCancelHours}
          onChange={setMinCancelHours}
        />
        <SliderRow
          label="Horizon de reservation"
          value={`${advanceBookingDays} j`}
          hint={`Les clients peuvent reserver jusqu'a ${advanceBookingDays} jours a l'avance.`}
          min={7} max={180} step={1}
          current={advanceBookingDays}
          onChange={setAdvanceBookingDays}
        />
        <FieldLabel label="Mode de confirmation">
          <select
            className="form-input"
            value={confirmMode}
            onChange={e => setConfirmMode(e.target.value as 'auto' | 'manual')}
          >
            <option value="auto">Automatique</option>
            <option value="manual">Manuel — je valide chaque resa</option>
          </select>
        </FieldLabel>
      </SettingGroup>

      {/* Zone dangereuse */}
      <SettingGroup title="Zone dangereuse" subtitle="Actions irreversibles." danger>
        <div>
          <Button variant="danger" size="md" icon={<Trash2 size={13} strokeWidth={2} />}>
            Supprimer mon compte
          </Button>
        </div>
      </SettingGroup>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SettingGroup({ title, subtitle, danger, children }: {
  title: string; subtitle?: string; danger?: boolean; children: React.ReactNode;
}) {
  return (
    <Card
      padded={false}
      style={{
        padding: '22px 24px',
        marginBottom: 14,
        borderColor: danger ? 'rgba(239, 68, 68, 0.2)' : undefined,
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <h2 style={{
          fontSize: 'var(--fs-md)',
          fontWeight: 600,
          marginBottom: 3,
          color: danger ? 'var(--lk-error)' : 'var(--lk-text-primary)',
        }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--lk-text-muted)', margin: 0 }}>
            {subtitle}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {children}
      </div>
    </Card>
  );
}

function SliderRow({ label, value, hint, min, max, step, current, onChange }: {
  label: string; value: string; hint: string;
  min: number; max: number; step: number; current: number;
  onChange: (v: number) => void;
}) {
  const pct = ((current - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 'var(--fs-base)', fontWeight: 500 }}>
          {label}
        </span>
        <span style={{
          fontSize: 'var(--fs-sm)', fontWeight: 600,
          color: 'var(--lk-primary-strong)', fontVariantNumeric: 'tabular-nums',
        }}>
          {value}
        </span>
      </div>
      <div style={{ position: 'relative', height: 6, background: 'var(--lk-surface-3)', borderRadius: 3 }}>
        <div style={{
          position: 'absolute', left: 0, width: `${pct}%`, height: '100%',
          background: 'linear-gradient(90deg, var(--lk-primary-soft), var(--lk-primary))',
          borderRadius: 3,
        }} />
        <div style={{
          position: 'absolute', left: `${pct}%`, top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 14, height: 14, borderRadius: '50%',
          background: 'white', border: '2px solid var(--lk-primary)',
          boxShadow: 'var(--shadow-xs)',
        }} />
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={current}
        onChange={e => onChange(+e.target.value)}
        style={{
          width: '100%', opacity: 0, position: 'relative', marginTop: -10, height: 20,
          cursor: 'pointer',
        }}
      />
      <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--lk-text-muted)', marginTop: 2 }}>
        {hint}
      </div>
    </div>
  );
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{
        fontSize: 'var(--fs-xs)',
        fontWeight: 500,
        color: 'var(--lk-text-secondary)',
      }}>
        {label}
      </span>
      {children}
    </label>
  );
}
