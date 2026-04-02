import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, MessageSquare, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { updateMyConfig } from '../../lib/api';

/**
 * Step 4 — Personnalisation (tout optionnel)
 * Couleur, message de bienvenue FR/EN, mode de confirmation.
 * Sauvegarde via PATCH /api/v1/restaurant/me.
 */
export default function Step4Customize() {
  const navigate = useNavigate();
  const [accentColor, setAccentColor] = useState('#ED73A9');
  const [messageFr, setMessageFr] = useState('');
  const [messageEn, setMessageEn] = useState('');
  const [confirmMode, setConfirmMode] = useState<'auto' | 'manual'>('auto');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleNext = async () => {
    setSaving(true);
    setError('');
    try {
      await updateMyConfig({
        accent_color: accentColor,
        welcome_message_fr: messageFr || undefined,
        welcome_message_en: messageEn || undefined,
        confirmation_mode: confirmMode,
      });
      navigate('/onboarding/widget');
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const PRESETS = ['#ED73A9', '#7CC0E8', '#C6546D', '#00B4D8', '#FF6B35', '#F59E0B'];

  return (
    <>
      <div className="onboarding-step-header">
        <div className="onboarding-step-number">Étape 4 sur 5</div>
        <h1 className="onboarding-step-title">Personnalisation</h1>
        <p className="onboarding-step-desc">
          Tout est optionnel. Vous pourrez modifier ces paramètres à tout moment
          depuis votre dashboard.
        </p>
      </div>

      {/* Couleur principale */}
      <div className="form-group" style={{ marginBottom: '24px' }}>
        <label className="form-label">
          <Palette size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
          Couleur principale
        </label>
        <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
          {PRESETS.map(color => (
            <button
              key={color}
              onClick={() => setAccentColor(color)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: color,
                border: `3px solid ${accentColor === color ? 'white' : 'transparent'}`,
                boxShadow: accentColor === color ? `0 0 0 2px ${color}` : 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              aria-label={color}
            />
          ))}
          <input
            type="color"
            value={accentColor}
            onChange={e => setAccentColor(e.target.value)}
            style={{ width: '32px', height: '32px', border: 'none', borderRadius: '50%', cursor: 'pointer', background: 'none' }}
            title="Couleur personnalisée"
          />
          <span style={{ fontSize: '12px', color: 'var(--lk-text-muted)', fontFamily: 'monospace' }}>
            {accentColor}
          </span>
        </div>
      </div>

      {/* Message de bienvenue */}
      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label className="form-label">
          <MessageSquare size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
          Message de bienvenue · FR
        </label>
        <textarea
          className="form-input"
          style={{ height: '80px', padding: '10px 14px', resize: 'vertical', fontSize: '13px' }}
          placeholder="Bienvenue ! Réservez votre table en quelques clics..."
          maxLength={200}
          value={messageFr}
          onChange={e => setMessageFr(e.target.value)}
        />
        <span className="text-xs text-muted" style={{ alignSelf: 'flex-end' }}>
          {messageFr.length}/200
        </span>
      </div>

      <div className="form-group" style={{ marginBottom: '24px' }}>
        <label className="form-label">
          <MessageSquare size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
          Message de bienvenue · EN
        </label>
        <textarea
          className="form-input"
          style={{ height: '80px', padding: '10px 14px', resize: 'vertical', fontSize: '13px' }}
          placeholder="Welcome! Book your table in just a few clicks..."
          maxLength={200}
          value={messageEn}
          onChange={e => setMessageEn(e.target.value)}
        />
        <span className="text-xs text-muted" style={{ alignSelf: 'flex-end' }}>
          {messageEn.length}/200
        </span>
      </div>

      {/* Mode de confirmation */}
      <div className="form-group">
        <label className="form-label">
          <Clock size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
          Mode de confirmation
        </label>
        <div className="flex-col gap-2">
          {[
            {
              value: 'auto' as const,
              label: '⚡ Automatique',
              desc: 'La réservation est confirmée instantanément. Idéal pour les restaurants très organisés.',
            },
            {
              value: 'manual' as const,
              label: '✋ Manuelle',
              desc: 'Vous validez chaque réservation depuis votre dashboard. Plus de contrôle.',
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
                  color: confirmMode === opt.value ? 'var(--lk-purple-light)' : 'var(--lk-border)',
                  flexShrink: 0,
                  marginTop: '1px',
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

      {error && <p className="form-error" style={{ marginTop: '12px' }}>{error}</p>}

      <div className="onboarding-actions">
        <button className="btn btn-ghost" onClick={() => navigate('/onboarding/hours')}>
          ← Retour
        </button>
        <button
          id="btn-step4-next"
          className="btn btn-primary btn-lg"
          disabled={saving}
          onClick={handleNext}
        >
          {saving
            ? <><Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> Sauvegarde...</>
            : 'Continuer →'
          }
        </button>
      </div>
    </>
  );
}
