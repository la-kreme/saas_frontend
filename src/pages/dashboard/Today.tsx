import { useEffect, useState } from 'react';
import {
  Calendar, Users, Clock, CheckCircle2, Loader2, Sparkles, ArrowRight, ChevronDown,
} from 'lucide-react';
import { getMyReservations, getMyTables, getMyHours, type ReservationItem, type TableItem, type OpeningHoursItem } from '../../lib/api';
import { PageHeader, KpiCard, Card, Badge, StatusPill, Avatar, EmptyState, Button } from '../../components/ui';
import { fmtDateLong, fmtTime, parseHour } from '../../lib/format';

export default function Today() {
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [hours, setHours] = useState<OpeningHoursItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getMyReservations({ date: today });
        setReservations(data.items || []);
      } catch {
        setError('Impossible de charger les reservations.');
        setReservations([]);
      } finally {
        setLoading(false);
      }
      // Tables + horaires : best-effort, ne bloque pas le rendu
      try { setTables(await getMyTables() || []); } catch { /* fallback */ }
      try { setHours(await getMyHours() || []); } catch { /* fallback */ }
    };
    load();
  }, [today]);

  const confirmed = reservations.filter(r => r.status === 'confirmed').length;
  const pending = reservations.filter(r => r.status === 'pending').length;
  const totalCovers = reservations
    .filter(r => r.status !== 'cancelled')
    .reduce((sum, r) => sum + r.party_size, 0);

  const fmtDate = fmtDateLong;

  return (
    <div className="lk-animate-up lk-page-container">
      <PageHeader
        eyebrow={fmtDate(today)}
        title="Aujourd'hui"
        subtitle={
          reservations.length > 0
            ? `${reservations.length} reservations · ${totalCovers} couverts attendus`
            : undefined
        }
      />

      {/* KPI strip */}
      <div className="lk-today-kpi-grid">
        <KpiCard
          label="Reservations"
          value={reservations.length}
          icon={<Calendar size={16} strokeWidth={2} className="lk-icon-info" />}
          tint="var(--lk-info-tint)"
        />
        <KpiCard
          label="Confirmees"
          value={confirmed}
          icon={<CheckCircle2 size={16} strokeWidth={2} className="lk-icon-success" />}
          tint="var(--lk-success-tint)"
        />
        <KpiCard
          label="En attente"
          value={pending}
          icon={<Clock size={16} strokeWidth={2} className="lk-icon-warning" />}
          tint="var(--lk-warning-tint)"
          hot={pending > 0}
        />
        <KpiCard
          label="Couverts"
          value={totalCovers}
          icon={<Users size={16} strokeWidth={2} className="lk-icon-primary" />}
          tint="var(--lk-primary-soft)"
        />
      </div>

      {/* Main content: planning + sidebar */}
      <div className="lk-today-main-grid">
        {/* Planning du jour */}
        <PlanningCard
          reservations={reservations}
          tables={tables}
          hours={hours}
          today={today}
          loading={loading}
          error={error}
        />

        {/* Sidebar column */}
        <div className="lk-today-sidebar-col">
          <UpsellCard />
        </div>
      </div>
    </div>
  );
}

// ─── Planning Card ───────────────────────────────────────────────────────────

type ViewMode = 'timeline' | 'liste' | 'table';

const VIEW_TABS: { id: ViewMode; label: string }[] = [
  { id: 'timeline', label: 'Timeline' },
  { id: 'liste', label: 'Liste' },
  { id: 'table', label: 'Par table' },
];

function TabBtn({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={active ? 'lk-today-tab lk-today-tab--active' : 'lk-today-tab'}
    >
      {children}
    </button>
  );
}

function PlanningCard({
  reservations,
  tables,
  hours,
  today,
  loading,
  error,
}: {
  reservations: ReservationItem[];
  tables: TableItem[];
  hours: OpeningHoursItem[];
  today: string;
  loading: boolean;
  error: string;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');

  if (loading) {
    return (
      <Card className="lk-loading-center">
        <Loader2 size={20} className="lk-spinner" />
        <span className="lk-text-loading">Chargement...</span>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <p className="lk-text-error">{error}</p>
      </Card>
    );
  }

  if (reservations.length === 0) {
    return (
      <EmptyState
        icon={<Calendar size={32} />}
        title="Le calme avant le service"
        description="Aucune reservation pour aujourd'hui. Des qu'un client reserve sur votre widget, ca apparaitra ici en direct."
        actionLabel="Voir mon widget"
      />
    );
  }

  const sorted = [...reservations].sort((a, b) =>
    a.reservation_time.localeCompare(b.reservation_time)
  );

  return (
    <Card padded={false} className="lk-today-planning-card">
      <div className="lk-today-planning-header">
        <h2 className="lk-today-planning-title">
          Planning du jour
        </h2>
        <div className="lk-today-planning-tabs">
          {VIEW_TABS.map(t => (
            <TabBtn key={t.id} active={viewMode === t.id} onClick={() => setViewMode(t.id)}>
              {t.label}
            </TabBtn>
          ))}
        </div>
      </div>

      {viewMode === 'timeline' && <TimelineView reservations={sorted} hours={hours} today={today} />}
      {viewMode === 'liste' && (
        <div>
          {sorted.map(resa => <ReservationRow key={resa.id} resa={resa} />)}
        </div>
      )}
      {viewMode === 'table' && <TableView reservations={sorted} tables={tables} />}
    </Card>
  );
}

// ─── Timeline View ───────────────────────────────────────────────────────────


function TimelineView({ reservations, hours, today }: { reservations: ReservationItem[]; hours: OpeningHoursItem[]; today: string }) {
  // Filtrer les services actifs du jour
  const dayOfWeek = new Date(today).getDay();
  // JS getDay: 0=dimanche, backend day_of_week: 0=lundi → convertir
  const backendDow = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const todayServices = hours
    .filter(h => h.day_of_week === backendDow && h.is_active)
    .map(h => ({
      name: h.service_name || 'Service',
      from: parseHour(h.open_time),
      to: parseHour(h.close_time),
      fromLabel: fmtTime(h.open_time),
      toLabel: fmtTime(h.close_time),
      icon: parseHour(h.open_time) < 16 ? '\u2600' : '\u263E',
    }));

  if (todayServices.length === 0) {
    return (
      <div className="lk-today-timeline-empty">
        Aucun service configure pour aujourd'hui.
      </div>
    );
  }

  return (
    <div>
      {todayServices.map(svc => (
        <CollapsibleService key={svc.name} svc={svc} reservations={reservations} />
      ))}
    </div>
  );
}

interface ServiceBlock { name: string; from: number; to: number; fromLabel: string; toLabel: string; icon: string }

function CollapsibleService({ svc, reservations }: { svc: ServiceBlock; reservations: ReservationItem[] }) {
  const now = new Date();
  const isFinished = now.getHours() >= svc.to;
  const [collapsed, setCollapsed] = useState(isFinished);

  const svcResas = reservations.filter(r => {
    const h = parseInt(r.reservation_time.slice(0, 2));
    return h >= svc.from && h < svc.to;
  });
  const svcCovers = svcResas.filter(r => r.status !== 'cancelled').reduce((s, r) => s + r.party_size, 0);

  return (
    <div>
      <button
        className="lk-today-svc-header"
        onClick={() => setCollapsed(c => !c)}
        type="button"
      >
        <div className="lk-today-svc-header-left">
          <ChevronDown
            size={14}
            strokeWidth={2}
            className={`lk-today-svc-chevron${collapsed ? ' lk-today-svc-chevron--collapsed' : ''}`}
          />
          <span className="lk-today-svc-icon">{svc.icon}</span>
          <span className="lk-today-svc-name">{svc.name}</span>
          <span className="lk-today-svc-hours">· {svc.fromLabel} – {svc.toLabel}</span>
          {isFinished && <span className="lk-today-svc-finished">Termine</span>}
        </div>
        <span className="lk-today-svc-stats">
          {svcResas.length} resa · {svcCovers} couv.
        </span>
      </button>
      {!collapsed && <TimelineTrack svc={svc} reservations={svcResas} />}
    </div>
  );
}

function TimelineTrack({ svc, reservations }: { svc: ServiceBlock; reservations: ReservationItem[] }) {
  // Echelle : heures entieres de from a to+1 (pour couvrir les minutes de fin)
  const scaleEnd = svc.to + 1;
  const hourMarks: number[] = [];
  for (let h = svc.from; h <= scaleEnd; h++) hourMarks.push(h);
  const totalHours = scaleEnd - svc.from;

  // Position en % sur la barre : (heure - from) / totalHours * 100
  const pct = (hour: number, minute = 0) => ((hour - svc.from) + minute / 60) / totalHours * 100;

  return (
    <div className="lk-today-track-wrap">
      {/* Hour scale */}
      <div className="lk-today-track-scale">
        {hourMarks.map(h => (
          <div key={h} className="lk-today-track-hour" style={{ left: `${pct(h)}%` }}>
            {h}h
          </div>
        ))}
      </div>

      {/* Track */}
      <div
        className="lk-today-track"
        style={{ height: reservations.length === 0 ? 60 : Math.max(60, reservations.length * 38 + 12) }}
      >
        {hourMarks.map(h => h > svc.from && (
          <div key={h} className="lk-today-track-divider" style={{ left: `${pct(h)}%` }} />
        ))}

        {reservations.length === 0 ? (
          <div className="lk-today-track-empty">
            Aucune reservation sur ce service
          </div>
        ) : (
          reservations.map((r, idx) => {
            const [hh, mm] = r.reservation_time.split(':').map(Number);
            const left = pct(hh, mm);
            const width = (r.party_size >= 5 ? 1.5 : r.party_size >= 3 ? 1.25 : 1) / totalHours * 100;
            const top = 6 + idx * 38;
            const fullName = `${r.guest_first_name} ${r.guest_last_name}`.trim();
            const tone = r.status === 'confirmed'
              ? { bg: 'white', border: '1px solid var(--lk-border)', accent: 'var(--lk-primary)' }
              : r.status === 'pending'
              ? { bg: 'var(--lk-warning-tint)', border: '1px solid rgba(245,158,11,0.3)', accent: 'var(--lk-warning)' }
              : { bg: '#fff', border: '1px dashed var(--lk-border)', accent: 'var(--lk-text-muted)' };

            return (
              <div
                key={r.id}
                className="lk-today-track-chip"
                style={{
                  left: `${left}%`,
                  top,
                  width: `max(160px, ${width}%)`,
                  background: tone.bg,
                  border: tone.border,
                }}
              >
                <div className="lk-today-track-chip-accent" style={{ background: tone.accent }} />
                <span className="lk-today-track-chip-time">
                  {r.reservation_time.slice(0, 5)}
                </span>
                <span className="lk-today-track-chip-name">
                  {fullName || 'Sans nom'}
                </span>
                <span className="lk-today-track-chip-pax">
                  <Users size={10} strokeWidth={2} />{r.party_size}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Table View (mini floorplan) ─────────────────────────────────────────────

function TableView({ reservations, tables }: { reservations: ReservationItem[]; tables: TableItem[] }) {
  const activeTables = tables.filter(t => t.is_active);

  // Map reservations to their assigned table
  const resasByTable = new Map<string, ReservationItem[]>();
  for (const r of reservations) {
    if (r.table_id) {
      const list = resasByTable.get(r.table_id) ?? [];
      list.push(r);
      resasByTable.set(r.table_id, list);
    }
  }
  // Unassigned reservations
  const unassigned = reservations.filter(r => !r.table_id);

  if (activeTables.length === 0) {
    return (
      <div className="lk-today-timeline-empty">
        Aucune table configuree. Rendez-vous dans le plan de salle.
      </div>
    );
  }

  return (
    <div className="lk-today-tableview-wrap">
      {/* Mini grid of tables */}
      <div className="lk-today-tableview-grid">
        {activeTables.map(table => {
          const tableResas = resasByTable.get(table.id) ?? [];
          const hasResa = tableResas.length > 0;
          const nextResa = tableResas[0];
          const statusColor = nextResa
            ? nextResa.status === 'confirmed' ? 'var(--lk-success)'
              : nextResa.status === 'pending' ? 'var(--lk-warning)'
              : 'var(--lk-text-muted)'
            : 'var(--lk-success)';

          return (
            <div
              key={table.id}
              className={hasResa ? 'lk-today-table-card lk-today-table-card--booked' : 'lk-today-table-card lk-today-table-card--free'}
            >
              {/* Table header */}
              <div className="lk-today-table-header">
                <div className="lk-today-table-header-left">
                  <span className="lk-today-table-status-dot" style={{ background: statusColor }} />
                  <span className="lk-today-table-name">
                    {table.name}
                  </span>
                </div>
                <span className="lk-today-table-seats">
                  {table.seats} pl.
                </span>
              </div>

              {/* Reservations on this table */}
              {tableResas.length === 0 ? (
                <span className="lk-today-table-free">
                  Libre
                </span>
              ) : (
                <div className="lk-today-table-resas">
                  {tableResas.map(r => {
                    const name = `${r.guest_first_name} ${r.guest_last_name}`.trim();
                    return (
                      <div key={r.id} className="lk-today-table-resa-row">
                        <span className="lk-today-table-resa-time">
                          {r.reservation_time.slice(0, 5)}
                        </span>
                        <span className="lk-today-table-resa-name">
                          {name || 'Sans nom'}
                        </span>
                        <span className="lk-today-table-resa-pax">
                          {r.party_size}p
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Unassigned reservations */}
      {unassigned.length > 0 && (
        <div className="lk-today-unassigned">
          <div className="lk-today-unassigned-label">
            Non assignees · {unassigned.length}
          </div>
          {unassigned.map(resa => <ReservationRow key={resa.id} resa={resa} />)}
        </div>
      )}
    </div>
  );
}

// ─── Reservation Row ─────────────────────────────────────────────────────────

function ReservationRow({ resa }: { resa: ReservationItem }) {
  const fullName = `${resa.guest_first_name} ${resa.guest_last_name}`.trim();

  return (
    <div className="lk-today-resa-row">
      {/* Time */}
      <span className="lk-today-resa-time">
        {resa.reservation_time.slice(0, 5)}
      </span>

      {/* Avatar + name */}
      <Avatar name={fullName || 'A'} size={32} />
      <div className="lk-today-resa-info">
        <div className="lk-today-resa-name">
          {fullName || 'Sans nom'}
        </div>
        {resa.notes && (
          <div className="lk-today-resa-notes">
            {resa.notes}
          </div>
        )}
      </div>

      {/* Party size */}
      <span className="lk-today-resa-pax">
        <Users size={12} strokeWidth={2} />
        {resa.party_size}
      </span>

      {/* Status */}
      <StatusPill status={resa.status} />
    </div>
  );
}

// ─── Upsell Card ─────────────────────────────────────────────────────────────

function UpsellCard() {
  return (
    <Card className="lk-today-upsell-card">
      <Badge tone="primary" icon={<Sparkles size={11} strokeWidth={2} />} className="lk-today-upsell-badge">
        Premium
      </Badge>
      <h4 className="lk-today-upsell-title">
        Activez l'agent IA telephonique
      </h4>
      <p className="lk-today-upsell-desc">
        Un agent decroche les appels 24/7 et confirme les reservations a votre place.
      </p>
      <Button variant="primary" size="sm" iconRight={<ArrowRight size={12} strokeWidth={2.4} />}>
        Decouvrir
      </Button>
    </Card>
  );
}
