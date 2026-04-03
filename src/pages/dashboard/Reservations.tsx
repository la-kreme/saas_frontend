import { useEffect, useState } from 'react';
import { CalendarDays, Loader2, Check, X } from 'lucide-react';
import { getMyReservations, updateReservationStatus, type ReservationItem } from '../../lib/api';

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

  const handleStatusChange = async (id: string, status: 'confirmed' | 'cancelled') => {
    if (status === 'cancelled' && !window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ? Le client sera notifié.')) {
      return;
    }
    setActionLoading(id);
    try {
      await updateReservationStatus(id, status);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la mise à jour.');
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getMyReservations({
          status: filterStatus || undefined,
          date: filterDate || undefined,
        });
        setReservations(data.items || []);
      } catch {
        setReservations([]); // Sprint 4 : API auth requise
      } finally {
        setLoading(false);
      }
    };
    load();
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
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3" style={{ marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <CalendarDays size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--lk-text-muted)' }} />
          <input
            type="date"
            className="form-input"
            style={{ paddingLeft: '36px', height: '36px', fontSize: '13px', width: '180px' }}
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
          />
        </div>
        <select
          className="form-input"
          style={{ height: '36px', fontSize: '13px', width: '160px' }}
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
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
        )}
      </div>
    </div>
  );
}
