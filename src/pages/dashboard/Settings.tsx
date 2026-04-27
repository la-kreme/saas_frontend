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
    <div className="lk-animate-up lk-page-container--narrow">
      <PageHeader
        title="Parametres"
        subtitle="Configuration avancee de votre widget de reservation."
        right={
          <Button
            variant="primary"
            size="md"
            icon={saving ? <Loader2 size={14} className="lk-spinner" /> : saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Enregistrement...' : saved ? 'Enregistre' : 'Enregistrer'}
          </Button>
        }
      />

      {error && <p className="form-error lk-margin-y-sm">{error}</p>}

      {/* Notifications */}
      <SettingGroup title="Notifications" subtitle="Recevez les alertes de nouvelles reservations.">
        <FieldLabel label="Email de notification">
          <input className="form-input" type="email" placeholder="restaurant@exemple.fr" value={email} onChange={e => setEmail(e.target.value)} />
          <span className="lk-settings-hint">
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
          <Button
            variant="danger"
            size="md"
            icon={<Trash2 size={13} strokeWidth={2} />}
            onClick={() => window.alert('Contactez le support pour supprimer votre compte.')}
          >
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
      className={`lk-settings-group ${danger ? 'lk-settings-group--danger' : ''}`}
    >
      <div className="lk-settings-group-header">
        <h2 className={`lk-settings-group-title ${danger ? 'lk-settings-group-title--danger' : ''}`}>
          {title}
        </h2>
        {subtitle && (
          <p className="lk-settings-group-subtitle">
            {subtitle}
          </p>
        )}
      </div>
      <div className="lk-settings-group-body">
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
      <div className="lk-settings-slider-header">
        <span className="lk-settings-slider-label">
          {label}
        </span>
        <span className="lk-settings-slider-value">
          {value}
        </span>
      </div>
      <div className="lk-settings-slider-track">
        <div className="lk-settings-slider-fill" style={{ width: `${pct}%` }} />
        <div className="lk-settings-slider-thumb" style={{ left: `${pct}%` }} />
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={current}
        onChange={e => onChange(+e.target.value)}
        className="lk-settings-slider-input"
      />
      <div className="lk-settings-slider-hint">
        {hint}
      </div>
    </div>
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
