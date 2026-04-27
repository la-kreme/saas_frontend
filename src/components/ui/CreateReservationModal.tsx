import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, Loader2 } from 'lucide-react';
import { createAdminReservation, getErrorMessage } from '../../lib/api';
import { Card } from './Card';
import { Button } from './Button';
import { IconBtn } from './IconBtn';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const INITIAL = { date: '', time: '', guests: 2, lastName: '', email: '', phone: '', notes: '' };

export function CreateReservationModal({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createAdminReservation({
        reservation_date: form.date,
        reservation_time: form.time,
        guests: form.guests,
        guest_first_name: '',
        guest_last_name: form.lastName,
        guest_email: form.email || undefined,
        guest_phone: form.phone || undefined,
        notes: form.notes || undefined,
      });
      setForm(INITIAL);
      onClose();
      onCreated?.();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Impossible de creer la reservation.'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(INITIAL);
    setError('');
    onClose();
  };

  return createPortal(
    <div className="lk-resa-modal-overlay" onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>
      <Card className="lk-resa-modal-card">
        <div className="lk-resa-modal-header">
          <h2 className="lk-resa-modal-title">Nouvelle reservation</h2>
          <IconBtn onClick={handleClose}><X size={16} /></IconBtn>
        </div>

        {error && <p className="form-error lk-resa-modal-error">{error}</p>}

        <form onSubmit={handleSubmit} className="lk-resa-modal-form">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" required className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="lk-flex-row">
            <div className="form-group lk-flex-1">
              <label className="form-label">Heure</label>
              <input type="time" required className="form-input" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
            </div>
            <div className="form-group lk-flex-1">
              <label className="form-label">Couverts</label>
              <input type="number" required min={1} max={50} className="form-input" value={form.guests} onChange={e => setForm({ ...form, guests: parseInt(e.target.value) || 2 })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Nom du client</label>
            <input type="text" required className="form-input" placeholder="ex: Dupont" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Email (optionnel)</label>
            <input type="email" className="form-input" placeholder="Confirmation par email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Telephone (optionnel)</label>
            <input type="tel" className="form-input" placeholder="ex: 06 12..." value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Notes (optionnel)</label>
            <textarea className="form-input" rows={2} placeholder="Allergies, chaise bebe..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="lk-actions-row--end">
            <Button variant="ghost" type="button" onClick={handleClose} disabled={loading}>Annuler</Button>
            <Button variant="primary" type="submit" icon={loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} disabled={loading}>
              Creer
            </Button>
          </div>
        </form>
      </Card>
    </div>,
    document.body,
  );
}
