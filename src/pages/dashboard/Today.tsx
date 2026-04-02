import { useEffect, useState } from 'react';
import { Calendar, Users, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { getMyReservations, type ReservationItem } from '../../lib/api';

/**
 * Dashboard — Vue Aujourd'hui
 * KPIs + liste des réservations du jour.
 */
export default function Today() {
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);


  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getMyReservations({ date: today });
        setReservations(data.items || []);
      } catch (e: any) {
        // Sprint 1 : API auth pas encore implémentée (501) → utiliser données mock
        setReservations(MOCK_RESERVATIONS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [today]);

  const confirmed = reservations.filter(r => r.status === 'confirmed').length;
  const pending   = reservations.filter(r => r.status === 'pending').length;
  const totalCovers = reservations
    .filter(r => r.status !== 'cancelled')
    .reduce((sum, r) => sum + r.party_size, 0);

  const fmt = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Aujourd'hui
        </h1>
        <p className="text-muted text-sm" style={{ textTransform: 'capitalize' }}>
          {fmt(today)}
        </p>
      </div>

      {/* KPIs */}
      <div className="kpi-grid" style={{ marginBottom: '32px' }}>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--lk-info-muted)', color: 'var(--lk-info)' }}>
            <Calendar size={18} />
          </div>
          <div className="kpi-label">Réservations</div>
          <div className="kpi-value">{reservations.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--lk-success-muted)', color: 'var(--lk-success)' }}>
            <CheckCircle2 size={18} />
          </div>
          <div className="kpi-label">Confirmées</div>
          <div className="kpi-value">{confirmed}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--lk-warning-muted)', color: 'var(--lk-warning)' }}>
            <Clock size={18} />
          </div>
          <div className="kpi-label">En attente</div>
          <div className="kpi-value">{pending}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">
            <Users size={18} />
          </div>
          <div className="kpi-label">Couverts</div>
          <div className="kpi-value">{totalCovers}</div>
        </div>
      </div>

      {/* Reservation list */}
      <div className="card">
        <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600 }}>Planning du jour</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center" style={{ padding: '40px', gap: '12px' }}>
            <Loader2 size={20} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--lk-purple-light)' }} />
            <span className="text-sm text-muted">Chargement...</span>
          </div>
        ) : reservations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--lk-text-muted)' }}>
            <Calendar size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontWeight: 500, marginBottom: '4px' }}>Aucune réservation aujourd'hui</p>
            <p className="text-xs">Les nouvelles réservations apparaîtront ici.</p>
          </div>
        ) : (
          <div className="flex-col gap-2">
            {reservations
              .sort((a, b) => a.reservation_time.localeCompare(b.reservation_time))
              .map(resa => (
                <div
                  key={resa.id}
                  className="table-row"
                  style={{ paddingLeft: '12px' }}
                >
                  {/* Time */}
                  <div style={{
                    minWidth: '52px',
                    fontWeight: 700,
                    fontSize: '14px',
                    color: 'var(--lk-purple-light)',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {resa.reservation_time.slice(0, 5)}
                  </div>

                  {/* Guest */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: '14px' }}>
                      {resa.guest_first_name} {resa.guest_last_name}
                    </div>
                    <div className="text-xs text-muted">
                      {resa.party_size} pers. {resa.notes ? `· ${resa.notes.slice(0, 40)}${resa.notes.length > 40 ? '…' : ''}` : ''}
                    </div>
                  </div>

                  {/* Status */}
                  <span className={`badge badge-${resa.status === 'confirmed' ? 'confirmed' : resa.status === 'pending' ? 'pending' : 'cancelled'}`}>
                    {resa.status === 'confirmed' ? 'Confirmé' :
                     resa.status === 'pending'   ? 'En attente' :
                     resa.status === 'no_show'   ? 'No-show' : 'Annulé'}
                  </span>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Mock data Sprint 1 ──────────────────────────────────────────────────────
const MOCK_RESERVATIONS: ReservationItem[] = [
  {
    id: '1', confirmation_code: 'LK-1234',
    guest_first_name: 'Marie', guest_last_name: 'Dupont',
    guest_email: 'marie@example.com', guest_phone: '+33612345678',
    party_size: 4, reservation_date: new Date().toISOString().split('T')[0],
    reservation_time: '10:00', status: 'confirmed',
    notes: 'Allergie aux noix', created_at: new Date().toISOString(),
  },
  {
    id: '2', confirmation_code: 'LK-5678',
    guest_first_name: 'Paul', guest_last_name: 'Martin',
    guest_email: 'paul@example.com', guest_phone: '+33698765432',
    party_size: 2, reservation_date: new Date().toISOString().split('T')[0],
    reservation_time: '11:30', status: 'confirmed',
    created_at: new Date().toISOString(),
  },
  {
    id: '3', confirmation_code: 'LK-9012',
    guest_first_name: 'Sophie', guest_last_name: 'Leroy',
    guest_email: 'sophie@example.com', guest_phone: '+33677889900',
    party_size: 6, reservation_date: new Date().toISOString().split('T')[0],
    reservation_time: '12:00', status: 'pending',
    notes: 'Anniversaire', created_at: new Date().toISOString(),
  },
];
