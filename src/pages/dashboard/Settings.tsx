import { useState } from 'react';
import { Save, Mail, Phone, Clock, CalendarDays } from 'lucide-react';

/**
 * Dashboard — Paramètres
 * Configuration avancée du widget.
 */
export default function Settings() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [minCancelHours, setMinCancelHours] = useState(2);
  const [advanceBookingDays, setAdvanceBookingDays] = useState(30);

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO Sprint 4 : PATCH /api/v1/restaurant/me
      await new Promise(r => setTimeout(r, 600));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
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
            </div>
          </div>

          {/* Save */}
          <button
            id="btn-settings-save"
            className="btn btn-primary"
            style={{ alignSelf: 'flex-start' }}
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? <><div className="spinner" style={{ width: '14px', height: '14px' }} /> Enregistrement...</>
              : saved ? <>✅ Enregistré</>
              : <><Save size={14} /> Enregistrer les modifications</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
