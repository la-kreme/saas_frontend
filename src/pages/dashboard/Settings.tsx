import { useState, useEffect } from 'react';
import { Save, Mail, Phone, Clock, CalendarDays, CheckCircle2 } from 'lucide-react';
import { getMyConfig, updateMyConfig, getErrorMessage } from '../../lib/api';

/**
 * Dashboard — Paramètres
 * Configuration avancée du widget.
 */
export default function Settings() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [minCancelHours, setMinCancelHours] = useState(2);
  const [advanceBookingDays, setAdvanceBookingDays] = useState(30);
  const [confirmMode, setConfirmMode] = useState<'auto' | 'manual'>('auto');

  // Charger les valeurs actuelles au montage
  useEffect(() => {
    getMyConfig().then(cfg => {
      setEmail(cfg.notification_email ?? '');
      setPhone(cfg.notification_phone ?? '');
      setMinCancelHours(cfg.min_cancel_hours ?? 2);
      setAdvanceBookingDays(cfg.advance_booking_days ?? 30);
      setConfirmMode(cfg.confirmation_mode as 'auto' | 'manual' || 'auto');
    }).catch(() => {
      // Silencieux si non connecté (mode dev)
    });
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
    <div className="animate-slide-up">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Paramètres
        </h1>
        <p className="text-muted text-sm">Configuration avancée de votre widget de réservation.</p>
      </div>

      <div style={{ maxWidth: '560px' }}>
        <div className="card flex-col gap-6">

          {/* Notifications */}
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>
              📧 Notifications
            </h2>
            <div className="flex-col gap-4">
              <div className="form-group">
                <label className="form-label">
                  <Mail size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                  Email de notification
                </label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="restaurant@exemple.fr"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <span className="text-xs text-muted">Reçoit les alertes de nouvelles réservations.</span>
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Phone size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                  Téléphone (SMS)
                </label>
                <input
                  className="form-input"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* Réservation */}
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>
              📅 Règles de réservation
            </h2>
            <div className="flex-col gap-4">
              <div className="form-group">
                <label className="form-label">
                  <Clock size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                  Délai minimal d'annulation (heures)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="range"
                    min={0}
                    max={48}
                    step={1}
                    value={minCancelHours}
                    onChange={e => setMinCancelHours(Number(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--lk-purple)' }}
                  />
                  <span style={{
                    minWidth: '60px',
                    fontWeight: 600,
                    fontSize: '14px',
                    textAlign: 'center',
                    color: 'var(--lk-purple-light)',
                  }}>
                    {minCancelHours}h
                  </span>
                </div>
                <span className="text-xs text-muted">
                  Un client peut annuler jusqu'à {minCancelHours}h avant sa réservation.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <CalendarDays size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                  Horizon de réservation (jours)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="range"
                    min={7}
                    max={180}
                    step={1}
                    value={advanceBookingDays}
                    onChange={e => setAdvanceBookingDays(Number(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--lk-purple)' }}
                  />
                  <span style={{
                    minWidth: '60px',
                    fontWeight: 600,
                    fontSize: '14px',
                    textAlign: 'center',
                    color: 'var(--lk-purple-light)',
                  }}>
                    {advanceBookingDays}j
                  </span>
                </div>
                <span className="text-xs text-muted">
                  Les clients peuvent réserver jusqu'à {advanceBookingDays} jours à l'avance.
                </span>
              </div>

              {/* Mode de confirmation */}
              <div className="form-group" style={{ marginTop: '8px' }}>
                <label className="form-label">
                  <CheckCircle2 size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                  Mode de confirmation
                </label>
                <div className="flex-col gap-2 mt-2">
                  {[
                    {
                      value: 'auto' as const,
                      label: '⚡ Automatique',
                      desc: 'La réservation est confirmée instantanément. Idéal pour les restaurants très organisés.',
                    },
                    {
                      value: 'manual' as const,
                      label: '✋ Manuelle (avec modération)',
                      desc: 'Vous validez manuellement chaque réservation dans votre dashboard. Plus de contrôle.',
                    },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setConfirmMode(opt.value)}
                      style={{
                        padding: '14px 16px',
                        background: confirmMode === opt.value ? 'var(--lk-purple-muted)' : 'var(--lk-surface-2)',
                        border: `1px solid ${confirmMode === opt.value ? 'rgba(83,52,131,0.4)' : 'var(--lk-border)'}`,
                        borderRadius: 'var(--radius)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                      }}
                    >
                      <CheckCircle2
                        size={16}
                        style={{
                          color: confirmMode === opt.value ? 'var(--lk-purple-light)' : 'var(--lk-text-muted)',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--lk-text-primary)' }}>
                          {opt.label}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--lk-text-secondary)', marginTop: '2px' }}>
                          {opt.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {error && <p className="form-error" style={{ marginTop: '8px' }}>{error}</p>}

          {/* Save */}
          <button
            id="btn-settings-save"
            className="btn btn-primary"
            style={{ alignSelf: 'flex-start' }}
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? <><div className="spinner" style={{ width: '14px', height: '14px' }} /> Enregistrement...</>
              : saved ? <>&#x2705; Enregistré</>
              : <><Save size={14} /> Enregistrer les modifications</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
