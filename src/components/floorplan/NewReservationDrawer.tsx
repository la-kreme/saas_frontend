import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface Props {
  mergeId: string;
  capacity: number;
  onSubmit: (data: {
    reservation_date: string;
    reservation_time: string;
    guests: number;
    guest_first_name: string;
    guest_last_name: string;
    guest_email?: string;
    guest_phone?: string;
    notes?: string;
  }) => Promise<void>;
  onClose: () => void;
}

export function NewReservationDrawer({ capacity, onSubmit, onClose }: Props) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('12:00');
  const [guests, setGuests] = useState(2);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSubmit({
        reservation_date: date,
        reservation_time: time,
        guests,
        guest_first_name: firstName,
        guest_last_name: lastName,
        guest_email: email || undefined,
        guest_phone: phone || undefined,
        notes: notes || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0,
      width: '360px', background: 'var(--lk-bg-base)',
      borderLeft: '1px solid var(--lk-border)',
      boxShadow: '-4px 0 12px rgba(0,0,0,0.08)',
      zIndex: 60, padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px',
      overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>Nouvelle reservation</h3>
        <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--lk-text-muted)', margin: 0 }}>
        Capacite merge : {capacity} places
      </p>

      <div style={{ display: 'flex', gap: '12px' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Date</label>
          <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Heure</label>
          <input type="time" className="form-input" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label>Couverts</label>
        <div className="stepper">
          <button onClick={() => setGuests(Math.max(1, guests - 1))}>-</button>
          <span>{guests}</span>
          <button onClick={() => setGuests(Math.min(capacity, guests + 1))}>+</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Prenom</label>
          <input className="form-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Nom</label>
          <input className="form-input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label>Email</label>
        <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Telephone</label>
        <input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Notes</label>
        <textarea className="form-input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <button className="btn btn-primary w-full" onClick={handleSubmit} disabled={saving || !lastName}>
        {saving ? <Loader2 size={14} className="animate-spin" /> : null}
        Creer la reservation
      </button>
    </div>
  );
}
