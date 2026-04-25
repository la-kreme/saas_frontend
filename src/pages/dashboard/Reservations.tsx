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
    <div className="lk-animate-up" style={{ maxWidth: 1440, margin: '0 auto' }}>
      <PageHeader
        title="Reservations"
        subtitle="Historique et gestion de toutes vos reservations."
        right={
          <Button variant="primary" size="md" icon={<Plus size={14} strokeWidth={2.4} />} onClick={() => setModalOpen(true)}>
            Nouvelle resa
          </Button>
        }
      />

      {error && <p className="form-error" style={{ margin: '12px 0' }}>{error}</p>}

      {/* Filters */}
      <Card padded={false} style={{ padding: '12px 14px', margin: '20px 0 14px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <SearchInput value={search} onChange={setSearch} />
        <div style={{ display: 'flex', gap: 6 }}>
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
        <div style={{ marginLeft: 'auto' }}>
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            style={{
              height: 34, padding: '0 10px', fontSize: 'var(--fs-sm)',
              border: '1px solid var(--lk-border)', borderRadius: 'var(--radius)',
              color: 'var(--lk-text-secondary)', background: 'var(--lk-bg-card)',
            }}
          />
        </div>
      </Card>

      {/* Table */}
      <Card padded={false} style={{ overflow: 'hidden' }}>
        {loading ? (
          <LoadingPlaceholder />
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48 }}>
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
    <div style={{
      flex: '1 1 280px', display: 'flex', alignItems: 'center', gap: 8,
      padding: '0 12px', height: 36,
      background: 'var(--lk-surface-2)', border: '1px solid var(--lk-border)',
      borderRadius: 'var(--radius)',
    }}>
      <Search size={14} style={{ color: 'var(--lk-text-muted)', flexShrink: 0 }} />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Nom, telephone..."
        style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontSize: 'var(--fs-sm)', color: 'var(--lk-text-primary)',
        }}
      />
    </div>
  );
}

function LoadingPlaceholder() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 12 }}>
      <Loader2 size={20} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--lk-primary)' }} />
      <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--lk-text-muted)' }}>Chargement...</span>
    </div>
  );
}

function TableHeader() {
  const cols = ['Heure', 'Client', 'Pers.', 'Notes', 'Statut', ''];
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: RESA_GRID,
      padding: '10px 18px', background: 'var(--lk-surface-1)',
      borderBottom: '1px solid var(--lk-border)', gap: 14,
    }}>
      {cols.map(c => (
        <div key={c} style={{
          fontSize: 'var(--fs-xs)', fontWeight: 600,
          color: 'var(--lk-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>
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
      style={{
        display: 'grid', gridTemplateColumns: RESA_GRID,
        padding: '14px 18px', gap: 14, alignItems: 'center',
        borderBottom: isLast ? 'none' : '1px solid var(--lk-border)',
        transition: 'background var(--transition-fast)', cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--lk-surface-1)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{
        fontWeight: 700, fontSize: 'var(--fs-sm)',
        fontVariantNumeric: 'tabular-nums', color: 'var(--lk-primary-strong)',
      }}>
        {resa.reservation_time.slice(0, 5)}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <Avatar name={fullName || 'A'} size={28} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {fullName || 'Sans nom'}
          </div>
          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--lk-text-muted)' }}>{resa.guest_email}</div>
        </div>
      </div>

      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--lk-text-secondary)' }}>
        <Users size={12} strokeWidth={2} style={{ color: 'var(--lk-text-muted)' }} />{resa.party_size}
      </span>

      <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--lk-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {resa.notes || '—'}
      </div>

      <StatusPill status={resa.status} />

      <div>
        {actionLoading ? (
          <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--lk-text-muted)' }} />
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
      <div style={{ display: 'flex', gap: 4 }}>
        <IconBtn size={26} title="Confirmer" onClick={() => onStatusChange(resa.id, 'confirmed')}>
          <Check size={13} style={{ color: 'var(--lk-success)' }} />
        </IconBtn>
        <IconBtn size={26} title="Annuler" onClick={() => onStatusChange(resa.id, 'cancelled')}>
          <X size={13} style={{ color: 'var(--lk-error)' }} />
        </IconBtn>
      </div>
    );
  }
  if (resa.status === 'confirmed') {
    return (
      <IconBtn size={26} title="Annuler" onClick={() => onStatusChange(resa.id, 'cancelled')}>
        <X size={13} style={{ color: 'var(--lk-error)' }} />
      </IconBtn>
    );
  }
  return <MoreHorizontal size={16} style={{ color: 'var(--lk-text-muted)' }} />;
}

function MobileResaCard({ resa, isLast, actionLoading, onStatusChange }: {
  resa: ReservationItem; isLast: boolean; actionLoading: boolean;
  onStatusChange: (id: string, s: 'confirmed' | 'cancelled') => void;
}) {
  const fullName = `${resa.guest_first_name} ${resa.guest_last_name}`.trim();
  return (
    <div style={{
      padding: 16, display: 'flex', flexDirection: 'column', gap: 8,
      borderBottom: isLast ? 'none' : '1px solid var(--lk-border)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Avatar name={fullName || 'A'} size={32} />
          <div>
            <div style={{ fontSize: 'var(--fs-md)', fontWeight: 600 }}>{fullName || 'Sans nom'}</div>
            <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--lk-text-muted)' }}>
              {resa.party_size} pers. · {new Date(resa.reservation_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} a {resa.reservation_time.slice(0, 5)}
            </div>
          </div>
        </div>
        <StatusPill status={resa.status} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--fs-xs)', fontFamily: 'var(--font-mono)', color: 'var(--lk-text-muted)' }}>
          #{resa.confirmation_code}
        </span>
        {actionLoading ? (
          <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--lk-text-muted)' }} />
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
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Card style={{ width: '90%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 600, margin: 0 }}>
            Ajouter une reservation
          </h2>
          <IconBtn onClick={onClose}><X size={16} /></IconBtn>
        </div>

        {createError && <p className="form-error" style={{ marginBottom: 16 }}>{createError}</p>}

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" required className="form-input" value={newResa.date} onChange={e => setNewResa({ ...newResa, date: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Heure</label>
              <input type="time" required className="form-input" value={newResa.time} onChange={e => setNewResa({ ...newResa, time: e.target.value })} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
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

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
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
