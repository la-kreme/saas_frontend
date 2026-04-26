import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  CalendarDays, Loader2, Check, X, Plus, Search, Users, MoreHorizontal,
} from 'lucide-react';
import {
  getMyReservations, updateReservationStatus, createAdminReservation,
  getErrorMessage, type ReservationItem,
} from '../../lib/api';
import {
  PageHeader, Card, Button, StatusPill, Avatar, EmptyState, FilterPill, IconBtn,
} from '../../components/ui';

const RESA_GRID = '80px 1.6fr 80px 1fr 110px 40px';

const STATUS_FILTERS = [
  { value: '', label: 'Toutes' },
  { value: 'confirmed', label: 'Confirmees' },
  { value: 'pending', label: 'En attente' },
  { value: 'cancelled', label: 'Annulees' },
] as const;

export default function Reservations() {
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newResa, setNewResa] = useState({
    date: '', time: '', guests: 2, lastName: '', email: '', phone: '', notes: '',
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
      setCreateError(getErrorMessage(err, 'Impossible de creer la reservation.'));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: 'confirmed' | 'cancelled') => {
    if (status === 'cancelled' && !window.confirm('Annuler cette reservation ? Le client sera notifie.')) return;
    setActionLoading(id);
    setError('');
    try {
      await updateReservationStatus(id, status);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erreur lors de la mise a jour.'));
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => { loadReservations(); }, [filterStatus, filterDate]);

  const filtered = reservations.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${r.guest_first_name} ${r.guest_last_name}`.toLowerCase().includes(q)
      || r.guest_phone?.toLowerCase().includes(q);
  });

  const countByStatus = (s: string) =>
    s === '' ? reservations.length : reservations.filter(r => r.status === s).length;

  return (
    <div className="lk-animate-up lk-page-container">
      <PageHeader
        title="Reservations"
        subtitle="Historique et gestion de toutes vos reservations."
        right={
          <Button variant="primary" size="md" icon={<Plus size={14} strokeWidth={2.4} />} onClick={() => setModalOpen(true)}>
            Nouvelle resa
          </Button>
        }
      />

      {error && <p className="form-error lk-margin-y-sm">{error}</p>}

      {/* Filters */}
      <Card padded={false} className="lk-resa-filter-card">
        <SearchInput value={search} onChange={setSearch} />
        <div className="lk-resa-filter-pills">
          {STATUS_FILTERS.map(f => (
            <FilterPill
              key={f.value}
              active={filterStatus === f.value}
              count={countByStatus(f.value)}
              onClick={() => setFilterStatus(f.value)}
            >
              {f.label}
            </FilterPill>
          ))}
        </div>
        <div className="lk-resa-filter-date-wrap">
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="lk-resa-date-input"
          />
        </div>
      </Card>

      {/* Table */}
      <Card padded={false} className="lk-resa-table-card">
        {loading ? (
          <LoadingPlaceholder />
        ) : filtered.length === 0 ? (
          <div className="lk-resa-empty-wrap">
            <EmptyState
              icon={<CalendarDays size={32} />}
              title="Aucune reservation"
              description="Les reservations apparaitront ici des qu'un client reserve."
            />
          </div>
        ) : (
          <>
            {/* Desktop grid */}
            <div className="hide-on-mobile">
              <TableHeader />
              {filtered.map((resa, i) => (
                <ReservationGridRow
                  key={resa.id}
                  resa={resa}
                  isLast={i === filtered.length - 1}
                  actionLoading={actionLoading === resa.id}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>

            {/* Mobile cards */}
            <div className="show-on-mobile-flex flex-col">
              {filtered.map((resa, i) => (
                <MobileResaCard
                  key={resa.id}
                  resa={resa}
                  isLast={i === filtered.length - 1}
                  actionLoading={actionLoading === resa.id}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Creation modal */}
      {modalOpen && <CreateModal
        newResa={newResa}
        setNewResa={setNewResa}
        createLoading={createLoading}
        createError={createError}
        onSubmit={handleCreate}
        onClose={() => setModalOpen(false)}
      />}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="lk-resa-search">
      <Search size={14} className="lk-resa-search-icon" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Nom, telephone..."
        className="lk-resa-search-input"
      />
    </div>
  );
}

function LoadingPlaceholder() {
  return (
    <div className="lk-loading-center">
      <Loader2 size={20} className="lk-spinner" />
      <span className="lk-text-loading">Chargement...</span>
    </div>
  );
}

function TableHeader() {
  const cols = ['Heure', 'Client', 'Pers.', 'Notes', 'Statut', ''];
  return (
    <div className="lk-resa-table-header" style={{ gridTemplateColumns: RESA_GRID }}>
      {cols.map(c => (
        <div key={c} className="lk-resa-col-label">
          {c}
        </div>
      ))}
    </div>
  );
}

function ReservationGridRow({ resa, isLast, actionLoading, onStatusChange }: {
  resa: ReservationItem; isLast: boolean; actionLoading: boolean;
  onStatusChange: (id: string, s: 'confirmed' | 'cancelled') => void;
}) {
  const fullName = `${resa.guest_first_name} ${resa.guest_last_name}`.trim();
  return (
    <div
      className="lk-resa-grid-row"
      style={{
        gridTemplateColumns: RESA_GRID,
        borderBottom: isLast ? 'none' : '1px solid var(--lk-border)',
      }}
    >
      <span className="lk-resa-grid-time">
        {resa.reservation_time.slice(0, 5)}
      </span>

      <div className="lk-resa-grid-client">
        <Avatar name={fullName || 'A'} size={28} />
        <div className="lk-resa-grid-client-info">
          <div className="lk-resa-grid-client-name">
            {fullName || 'Sans nom'}
          </div>
          <div className="lk-resa-grid-client-email">{resa.guest_email}</div>
        </div>
      </div>

      <span className="lk-resa-grid-pax">
        <Users size={12} strokeWidth={2} className="lk-icon-muted" />{resa.party_size}
      </span>

      <div className="lk-resa-grid-notes">
        {resa.notes || '—'}
      </div>

      <StatusPill status={resa.status} />

      <div>
        {actionLoading ? (
          <Loader2 size={14} className="lk-spinner--muted" />
        ) : (
          <RowActions resa={resa} onStatusChange={onStatusChange} />
        )}
      </div>
    </div>
  );
}

function RowActions({ resa, onStatusChange }: {
  resa: ReservationItem; onStatusChange: (id: string, s: 'confirmed' | 'cancelled') => void;
}) {
  if (resa.status === 'pending') {
    return (
      <div className="lk-resa-row-actions">
        <IconBtn size={26} title="Confirmer" onClick={() => onStatusChange(resa.id, 'confirmed')}>
          <Check size={13} className="lk-icon-success" />
        </IconBtn>
        <IconBtn size={26} title="Annuler" onClick={() => onStatusChange(resa.id, 'cancelled')}>
          <X size={13} className="lk-icon-error" />
        </IconBtn>
      </div>
    );
  }
  if (resa.status === 'confirmed') {
    return (
      <IconBtn size={26} title="Annuler" onClick={() => onStatusChange(resa.id, 'cancelled')}>
        <X size={13} className="lk-icon-error" />
      </IconBtn>
    );
  }
  return <MoreHorizontal size={16} className="lk-icon-muted" />;
}

function MobileResaCard({ resa, isLast, actionLoading, onStatusChange }: {
  resa: ReservationItem; isLast: boolean; actionLoading: boolean;
  onStatusChange: (id: string, s: 'confirmed' | 'cancelled') => void;
}) {
  const fullName = `${resa.guest_first_name} ${resa.guest_last_name}`.trim();
  return (
    <div
      className="lk-resa-mobile-card"
      style={{ borderBottom: isLast ? 'none' : '1px solid var(--lk-border)' }}
    >
      <div className="lk-resa-mobile-top">
        <div className="lk-resa-mobile-left">
          <Avatar name={fullName || 'A'} size={32} />
          <div>
            <div className="lk-resa-mobile-name">{fullName || 'Sans nom'}</div>
            <div className="lk-resa-mobile-meta">
              {resa.party_size} pers. · {new Date(resa.reservation_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} a {resa.reservation_time.slice(0, 5)}
            </div>
          </div>
        </div>
        <StatusPill status={resa.status} />
      </div>
      <div className="lk-resa-mobile-bottom">
        <span className="lk-resa-mobile-code">
          #{resa.confirmation_code}
        </span>
        {actionLoading ? (
          <Loader2 size={14} className="lk-spinner--muted" />
        ) : (
          <RowActions resa={resa} onStatusChange={onStatusChange} />
        )}
      </div>
    </div>
  );
}

function CreateModal({ newResa, setNewResa, createLoading, createError, onSubmit, onClose }: {
  newResa: { date: string; time: string; guests: number; lastName: string; email: string; phone: string; notes: string };
  setNewResa: (v: typeof newResa) => void;
  createLoading: boolean; createError: string;
  onSubmit: (e: React.FormEvent) => void; onClose: () => void;
}) {
  return createPortal(
    <div className="lk-resa-modal-overlay">
      <Card className="lk-resa-modal-card">
        <div className="lk-resa-modal-header">
          <h2 className="lk-resa-modal-title">
            Ajouter une reservation
          </h2>
          <IconBtn onClick={onClose}><X size={16} /></IconBtn>
        </div>

        {createError && <p className="form-error lk-resa-modal-error">{createError}</p>}

        <form onSubmit={onSubmit} className="lk-resa-modal-form">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" required className="form-input" value={newResa.date} onChange={e => setNewResa({ ...newResa, date: e.target.value })} />
          </div>
          <div className="lk-flex-row">
            <div className="form-group lk-flex-1">
              <label className="form-label">Heure</label>
              <input type="time" required className="form-input" value={newResa.time} onChange={e => setNewResa({ ...newResa, time: e.target.value })} />
            </div>
            <div className="form-group lk-flex-1">
              <label className="form-label">Couverts</label>
              <input type="number" required min={1} max={50} className="form-input" value={newResa.guests} onChange={e => setNewResa({ ...newResa, guests: parseInt(e.target.value) || 2 })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Nom du client</label>
            <input type="text" required className="form-input" placeholder="ex: Dupont" value={newResa.lastName} onChange={e => setNewResa({ ...newResa, lastName: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Email (optionnel)</label>
            <input type="email" className="form-input" placeholder="Confirmation par email" value={newResa.email} onChange={e => setNewResa({ ...newResa, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Telephone (optionnel)</label>
            <input type="tel" className="form-input" placeholder="ex: 06 12..." value={newResa.phone} onChange={e => setNewResa({ ...newResa, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Notes (optionnel)</label>
            <textarea className="form-input" rows={2} placeholder="Allergies, chaise bebe..." value={newResa.notes} onChange={e => setNewResa({ ...newResa, notes: e.target.value })} />
          </div>

          <div className="lk-actions-row--end">
            <Button variant="ghost" type="button" onClick={onClose} disabled={createLoading}>Annuler</Button>
            <Button variant="primary" type="submit" icon={createLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} disabled={createLoading}>
              Creer
            </Button>
          </div>
        </form>
      </Card>
    </div>,
    document.body,
  );
}
