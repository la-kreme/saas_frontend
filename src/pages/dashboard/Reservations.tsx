import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, Loader2, Check, X, Plus } from 'lucide-react';
import { getMyReservations, updateReservationStatus, createAdminReservation, getErrorMessage, type ReservationItem } from '../../lib/api';

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'pending', label: 'En attente' },
  { value: 'cancelled', label: 'Annulé' },
  { value: 'no_show', label: 'No-show' },
];

export default function Reservations() {
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Creation State
  const [modalOpen, setModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newResa, setNewResa] = useState({
    date: '', time: '', guests: 2, lastName: '', email: '', phone: '', notes: ''
  });

  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await getMyReservations({
        status: filterStatus || undefined,
        date: filterDate || undefined,
      });
      setReservations(data.items || []);
    } catch {
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);
    try {
      await createAdminReservation({
        reservation_date: newResa.date,
        reservation_time: newResa.time,
        guests: newResa.guests,
        guest_first_name: '',
        guest_last_name: newResa.lastName,
        guest_email: newResa.email || undefined,
        guest_phone: newResa.phone || undefined,
        notes: newResa.notes || undefined,
      });
      setModalOpen(false);
      setNewResa({ date: '', time: '', guests: 2, lastName: '', email: '', phone: '', notes: '' });
      await loadReservations();
    } catch (err: unknown) {
      setCreateError(getErrorMessage(err, 'Impossible de créer la réservation. Vérifiez vos tables actives.'));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: 'confirmed' | 'cancelled') => {
    if (status === 'cancelled' && !window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ? Le client sera notifié.')) {
      return;
    }
    setActionLoading(id);
    setError('');
    try {
      await updateReservationStatus(id, status);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erreur lors de la mise à jour.'));
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [filterStatus, filterDate]);

  const statusLabel = (s: string) => ({
    confirmed: 'Confirmé', pending: 'En attente',
    cancelled: 'Annulé', no_show: 'No-show',
  }[s] || s);

  return (
    <div className="animate-slide-up">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Réservations
        </h1>
        <p className="text-muted text-sm">Historique et gestion de toutes vos réservations.</p>
        {error && <p className="form-error" style={{ marginTop: '8px' }}>{error}</p>}
      </div>

      {/* Filters */}
      <div className="flex mobile-flex-col" style={{ marginBottom: '20px', justifyContent: 'space-between', gap: '12px' }}>
        <div className="flex items-center gap-3 w-full" style={{ flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 min-content' }}>
            <CalendarDays size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--lk-text-muted)' }} />
            <input
              type="date"
              className="form-input form-input-responsive"
              style={{ paddingLeft: '36px', height: '36px', fontSize: '13px', width: '100%', minWidth: '150px' }}
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
            />
          </div>
          <select
            className="form-input form-input-responsive"
            style={{ height: '36px', fontSize: '13px', flex: '1 1 min-content', minWidth: '150px' }}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <button 
          className="btn btn-primary flex items-center justify-center gap-2 mobile-actions-row" 
          style={{ width: 'auto' }}
          onClick={() => setModalOpen(true)}
        >
          <Plus size={16} />
          Nouvelle réservation
        </button>
      </div>

      {/* Table & Mobile Cards */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="flex items-center justify-center" style={{ padding: '48px', gap: '12px' }}>
            <Loader2 size={20} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--lk-purple-light)' }} />
            <span className="text-sm text-muted">Chargement...</span>
          </div>
        ) : reservations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--lk-text-muted)' }}>
            <CalendarDays size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontWeight: 500 }}>Aucune réservation</p>
          </div>
        ) : (
          <>
          {/* Desktop Table */}
          <div className="hide-on-mobile">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--lk-border)', background: 'var(--lk-surface-2)' }}>
                {['Code', 'Client', 'Date', 'Heure', 'Pers.', 'Statut', 'Actions'].map(col => (
                  <th key={col} style={{
                    padding: '10px 16px',
                    textAlign: col === 'Actions' ? 'right' : 'left',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--lk-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reservations.map((resa, i) => (
                <tr key={resa.id} style={{
                  borderBottom: i < reservations.length - 1 ? '1px solid var(--lk-border)' : 'none',
                  transition: 'background var(--transition-fast)',
                }}>
                  <td style={{ padding: '12px 16px', fontSize: '12px', fontFamily: 'monospace', color: 'var(--lk-purple-light)' }}>
                    {resa.confirmation_code}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{resa.guest_first_name} {resa.guest_last_name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--lk-text-muted)' }}>{resa.guest_email}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--lk-text-secondary)' }}>
                    {new Date(resa.reservation_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    {resa.reservation_time.slice(0, 5)}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', textAlign: 'center' }}>{resa.party_size}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge badge-${resa.status === 'confirmed' ? 'confirmed' : resa.status === 'pending' ? 'pending' : resa.status === 'no_show' ? 'no-show' : 'cancelled'}`}>
                      {statusLabel(resa.status)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    {actionLoading === resa.id ? (
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', margin: '0 auto', color: 'var(--lk-text-muted)' }} />
                    ) : (
                      <div className="flex items-center gap-2" style={{ justifyContent: 'flex-end' }}>
                        {resa.status === 'pending' && (
                          <>
                            <button
                              className="btn btn-sm"
                              style={{ padding: '6px', background: 'var(--lk-surface-2)', border: '1px solid var(--lk-success)', color: 'var(--lk-success)' }}
                              onClick={() => handleStatusChange(resa.id, 'confirmed')}
                              title="Confirmer la réservation"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{ padding: '6px', background: 'var(--lk-surface-2)', border: '1px solid var(--lk-error)', color: 'var(--lk-error)' }}
                              onClick={() => handleStatusChange(resa.id, 'cancelled')}
                              title="Refuser et annuler"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                        {resa.status === 'confirmed' && (
                          <button
                            className="btn btn-sm"
                            style={{ padding: '4px 8px', fontSize: '11px', background: 'transparent', color: 'var(--lk-error)' }}
                            onClick={() => handleStatusChange(resa.id, 'cancelled')}
                          >
                            Annuler
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {/* Mobile Cards View */}
          <div className="show-on-mobile-flex flex-col" style={{ gap: '0' }}>
            {reservations.map((resa, i) => (
              <div key={resa.id} style={{
                padding: '16px',
                borderBottom: i < reservations.length - 1 ? '1px solid var(--lk-border)' : 'none',
                display: 'flex', flexDirection: 'column', gap: '8px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600 }}>{resa.guest_first_name} {resa.guest_last_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--lk-text-muted)' }}>{resa.party_size} pers. · {new Date(resa.reservation_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} à {resa.reservation_time.slice(0, 5)}</div>
                  </div>
                  <span className={`badge badge-${resa.status === 'confirmed' ? 'confirmed' : resa.status === 'pending' ? 'pending' : resa.status === 'no_show' ? 'no-show' : 'cancelled'}`}>
                    {statusLabel(resa.status)}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--lk-purple-muted)', fontWeight: 600 }}>
                    #{resa.confirmation_code}
                  </div>
                  
                  {/* Actions mobile */}
                  <div className="flex items-center gap-2">
                    {actionLoading === resa.id ? (
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: 'var(--lk-text-muted)' }} />
                    ) : (
                      <>
                        {resa.status === 'pending' && (
                          <>
                            <button
                              className="btn btn-sm"
                              style={{ padding: '6px', background: 'var(--lk-surface-2)', border: '1px solid var(--lk-error)', color: 'var(--lk-error)' }}
                              onClick={() => handleStatusChange(resa.id, 'cancelled')}
                            >
                              <X size={14} /> Refuser
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{ padding: '6px', background: 'var(--lk-surface-2)', border: '1px solid var(--lk-success)', color: 'var(--lk-success)' }}
                              onClick={() => handleStatusChange(resa.id, 'confirmed')}
                            >
                              <Check size={14} /> Confirmer
                            </button>
                          </>
                        )}
                        {resa.status === 'confirmed' && (
                          <button
                            className="btn btn-sm"
                            style={{ padding: '4px 8px', fontSize: '12px', background: 'transparent', color: 'var(--lk-error)', border: '1px solid var(--lk-error-muted)' }}
                            onClick={() => handleStatusChange(resa.id, 'cancelled')}
                          >
                            Annuler
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </div>

      {/* Creation Modal */}
      {modalOpen && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{ width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center" style={{ justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Ajouter une réservation</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lk-text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            
            {createError && <p className="form-error" style={{ marginBottom: '16px' }}>{createError}</p>}
            
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" required className="form-input" value={newResa.date} onChange={e => setNewResa({...newResa, date: e.target.value})} />
              </div>
              <div className="flex gap-3" style={{ marginBottom: '16px' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Heure (HH:MM)</label>
                  <input type="time" required className="form-input" value={newResa.time} onChange={e => setNewResa({...newResa, time: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Couverts</label>
                  <input type="number" required min="1" max="50" className="form-input" value={newResa.guests} onChange={e => setNewResa({...newResa, guests: parseInt(e.target.value) || 2})} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Nom du client</label>
                <input type="text" required className="form-input" placeholder="ex: Dupont" value={newResa.lastName} onChange={e => setNewResa({...newResa, lastName: e.target.value})} />
              </div>

              <div className="form-group">
                <label className="form-label">Email (Optionnel)</label>
                <input type="email" className="form-input" placeholder="Si renseigné, un email de confirmation sera envoyé" value={newResa.email} onChange={e => setNewResa({...newResa, email: e.target.value})} />
              </div>
              
              <div className="form-group">
                <label className="form-label">Téléphone (Optionnel)</label>
                <input type="tel" className="form-input" placeholder="ex: 06 12..." value={newResa.phone} onChange={e => setNewResa({...newResa, phone: e.target.value})} />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Notes (Optionnel)</label>
                <textarea className="form-input" rows={2} placeholder="Allergies, chaise bébé..." value={newResa.notes} onChange={e => setNewResa({...newResa, notes: e.target.value})} />
              </div>

              <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={() => setModalOpen(false)} disabled={createLoading}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary flex items-center gap-2" disabled={createLoading}>
                  {createLoading ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Créer</>}
                </button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}
    </div>
  );
}
