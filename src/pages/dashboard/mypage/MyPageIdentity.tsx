import { useState, useEffect } from 'react';
import { Save, MapPin, Phone, Globe, Link2, Euro, Clock } from 'lucide-react';
import type { BrunchPlaceDetail, BrunchPlaceUpdate, ActorType } from '../../../lib/types';

const ACTOR_TYPES: { value: ActorType; label: string }[] = [
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'COFFEE_SHOP', label: 'Coffee Shop' },
  { value: 'HOTEL', label: 'Hôtel' },
  { value: 'BAKERY', label: 'Boulangerie / Pâtisserie' },
];

const PRICE_OPTIONS = [
  { value: 1, label: '€' },
  { value: 2, label: '€€' },
  { value: 3, label: '€€€' },
  { value: 4, label: '€€€€' },
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAYS_FR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

interface Props {
  data: BrunchPlaceDetail;
  onSave: (updates: Partial<BrunchPlaceUpdate>) => Promise<void>;
  saving: boolean;
}

export default function MyPageIdentity({ data, onSave, saving }: Props) {
  const [address, setAddress] = useState(data.address || '');
  const [postalCode, setPostalCode] = useState(data.postal_code || '');
  const [phone, setPhone] = useState(data.phone || '');
  const [websiteUrl, setWebsiteUrl] = useState(data.website_url || '');
  const [bookingUrl, setBookingUrl] = useState(data.booking_url || '');
  const [actorType, setActorType] = useState<ActorType>(data.actor_type);
  const [priceRange, setPriceRange] = useState(data.price_range);
  const [hours, setHours] = useState<Record<string, { open: string; close: string }[]>>(
    data.opening_hours || {}
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setAddress(data.address || '');
    setPostalCode(data.postal_code || '');
    setPhone(data.phone || '');
    setWebsiteUrl(data.website_url || '');
    setBookingUrl(data.booking_url || '');
    setActorType(data.actor_type);
    setPriceRange(data.price_range);
    setHours(data.opening_hours || {});
  }, [data]);

  const handleSave = async () => {
    await onSave({
      address,
      postal_code: postalCode || undefined,
      phone: phone || undefined,
      website_url: websiteUrl || undefined,
      booking_url: bookingUrl || undefined,
      actor_type: actorType,
      price_range: priceRange,
      opening_hours: hours,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateHourSlot = (day: string, field: 'open' | 'close', value: string) => {
    setHours(prev => ({
      ...prev,
      [day]: [{ ...(prev[day]?.[0] || { open: '', close: '' }), [field]: value }],
    }));
  };

  const toggleDay = (day: string) => {
    setHours(prev => {
      const copy = { ...prev };
      if (copy[day]) {
        delete copy[day];
      } else {
        copy[day] = [{ open: '09:00', close: '17:00' }];
      }
      return copy;
    });
  };

  return (
    <div className="flex-col gap-6">
      <div className="card flex-col gap-6">
        {/* Type & Prix */}
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>
            🏪 Type d'établissement
          </h2>
          <div className="flex-col gap-4">
            <div className="form-group">
              <label className="form-label">Catégorie</label>
              <select
                className="form-input"
                value={actorType}
                onChange={e => setActorType(e.target.value as ActorType)}
              >
                {ACTOR_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">
                <Euro size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                Gamme de prix
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {PRICE_OPTIONS.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriceRange(p.value)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius)',
                      border: `1px solid ${priceRange === p.value ? 'var(--lk-purple)' : 'var(--lk-border)'}`,
                      background: priceRange === p.value ? 'var(--lk-purple-muted)' : 'var(--lk-surface-2)',
                      color: priceRange === p.value ? 'var(--lk-purple-light)' : 'var(--lk-text-secondary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Coordonnées */}
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>
            📍 Coordonnées
          </h2>
          <div className="flex-col gap-4">
            <div className="form-group">
              <label className="form-label">
                <MapPin size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                Adresse
              </label>
              <input className="form-input" value={address} onChange={e => setAddress(e.target.value)} placeholder="12 rue de la Paix" />
            </div>
            <div className="form-group">
              <label className="form-label">Code postal</label>
              <input className="form-input" value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="75001" maxLength={5} style={{ maxWidth: '160px' }} />
            </div>
            <div className="form-group">
              <label className="form-label">
                <Phone size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                Téléphone
              </label>
              <input className="form-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01 23 45 67 89" />
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* URLs */}
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>
            🔗 Liens
          </h2>
          <div className="flex-col gap-4">
            <div className="form-group">
              <label className="form-label">
                <Globe size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                Site web
              </label>
              <input className="form-input" type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://monrestaurant.fr" />
            </div>
            <div className="form-group">
              <label className="form-label">
                <Link2 size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                Lien de réservation externe
              </label>
              <input className="form-input" type="url" value={bookingUrl} onChange={e => setBookingUrl(e.target.value)} placeholder="https://thefork.com/..." />
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Horaires */}
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>
            <Clock size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            Horaires d'ouverture (lakreme.fr)
          </h2>
          <span className="text-xs text-muted" style={{ display: 'block', marginBottom: '12px' }}>
            Ces horaires sont affichés sur votre page publique. Ils sont indépendants des slots de réservation.
          </span>
          <div className="flex-col gap-2">
            {DAYS.map((day, i) => {
              const isActive = !!hours[day];
              const slot = hours[day]?.[0] || { open: '09:00', close: '17:00' };
              return (
                <div key={day} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '8px 12px', borderRadius: 'var(--radius)',
                  background: isActive ? 'var(--lk-surface-2)' : 'transparent',
                  transition: 'background var(--transition-fast)',
                }}>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    minWidth: '120px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                  }}>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => toggleDay(day)}
                      style={{ accentColor: 'var(--lk-purple)' }}
                    />
                    {DAYS_FR[i]}
                  </label>
                  {isActive && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <input type="time" className="form-input" value={slot.open} onChange={e => updateHourSlot(day, 'open', e.target.value)} style={{ width: '110px', padding: '4px 8px' }} />
                      <span style={{ color: 'var(--lk-text-muted)' }}>→</span>
                      <input type="time" className="form-input" value={slot.close} onChange={e => updateHourSlot(day, 'close', e.target.value)} style={{ width: '110px', padding: '4px 8px' }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Save */}
      <button
        className="btn btn-primary"
        style={{ alignSelf: 'flex-start' }}
        disabled={saving}
        onClick={handleSave}
      >
        {saving ? <><div className="spinner" style={{ width: '14px', height: '14px' }} /> Enregistrement...</>
          : saved ? <>&#x2705; Enregistré</>
          : <><Save size={14} /> Enregistrer</>
        }
      </button>
    </div>
  );
}
