import { useEffect, useState } from 'react';
import {
  Calendar, Users, Clock, CheckCircle2, Loader2, Sparkles, ArrowRight,
} from 'lucide-react';
import { getMyReservations, getMyTables, getMyHours, type ReservationItem, type TableItem, type OpeningHoursItem } from '../../lib/api';
import { PageHeader, KpiCard, Card, Badge, StatusPill, Avatar, EmptyState, Button } from '../../components/ui';

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

  const fmtDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

  return (
    <div className="lk-animate-up" style={{ maxWidth: 1440, margin: '0 auto' }}>
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 14,
        margin: '24px 0',
      }}>
        <KpiCard
          label="Reservations"
          value={reservations.length}
          icon={<Calendar size={16} strokeWidth={2} style={{ color: 'var(--lk-info)' }} />}
          tint="var(--lk-info-tint)"
        />
        <KpiCard
          label="Confirmees"
          value={confirmed}
          icon={<CheckCircle2 size={16} strokeWidth={2} style={{ color: 'var(--lk-success)' }} />}
          tint="var(--lk-success-tint)"
        />
        <KpiCard
          label="En attente"
          value={pending}
          icon={<Clock size={16} strokeWidth={2} style={{ color: 'var(--lk-warning)' }} />}
          tint="var(--lk-warning-tint)"
          hot={pending > 0}
        />
        <KpiCard
          label="Couverts"
          value={totalCovers}
          icon={<Users size={16} strokeWidth={2} style={{ color: 'var(--lk-primary-strong)' }} />}
          tint="var(--lk-primary-soft)"
        />
      </div>

      {/* Main content: planning + sidebar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: 20,
        alignItems: 'flex-start',
      }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
    <button onClick={onClick} style={{
      padding: '5px 11px',
      fontSize: 'var(--fs-sm)',
      fontWeight: 500,
      borderRadius: 'var(--radius-full)',
      background: active ? 'var(--lk-primary-tint)' : 'transparent',
      color: active ? 'var(--lk-primary-strong)' : 'var(--lk-text-muted)',
      border: '1px solid',
      borderColor: active ? 'rgba(237, 115, 169, 0.18)' : 'transparent',
      cursor: 'pointer',
      transition: 'all var(--transition-fast)',
    }}>
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
      <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 12 }}>
        <Loader2 size={20} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--lk-primary)' }} />
        <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--lk-text-muted)' }}>Chargement...</span>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <p style={{ color: 'var(--lk-error)', fontSize: 'var(--fs-sm)' }}>{error}</p>
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
    <Card padded={false} style={{ overflow: 'hidden' }}>
      <div style={{
        padding: '18px 24px',
        borderBottom: '1px solid var(--lk-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h2 style={{ fontSize: 'var(--fs-md)', fontWeight: 600, margin: 0 }}>
          Planning du jour
        </h2>
        <div style={{ display: 'flex', gap: 6 }}>
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

function parseHour(timeStr: string): number {
  return parseInt(timeStr.split(':')[0]);
}

function TimelineView({ reservations, hours, today }: { reservations: ReservationItem[]; hours: OpeningHoursItem[]; today: string }) {
  // Filtrer les services actifs du jour
  const dayOfWeek = new Date(today).getDay();
  // JS getDay: 0=dimanche, backend day_of_week: 0=lundi → convertir
  const backendDow = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const todayServices = hours
    .filter(h => h.day_of_week === backendDow && h.is_active)
    .map(h => ({
      name: h.service_name || `Service ${h.open_time}–${h.close_time}`,
      from: parseHour(h.open_time),
      to: parseHour(h.close_time),
      icon: parseHour(h.open_time) < 16 ? '\u2600' : '\u263E',
    }));

  if (todayServices.length === 0) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--lk-text-muted)', fontSize: 'var(--fs-sm)' }}>
        Aucun service configure pour aujourd'hui.
      </div>
    );
  }

  return (
    <div>
      {todayServices.map(svc => {
        const svcResas = reservations.filter(r => {
          const h = parseInt(r.reservation_time.slice(0, 2));
          return h >= svc.from && h < svc.to;
        });
        const svcCovers = svcResas.filter(r => r.status !== 'cancelled').reduce((s, r) => s + r.party_size, 0);

        return (
          <div key={svc.name}>
            <div style={{
              padding: '12px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--lk-surface-1)', borderTop: '1px solid var(--lk-border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 'var(--fs-base)' }}>{svc.icon}</span>
                <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>{svc.name}</span>
                <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--lk-text-muted)' }}>· {svc.from}h – {svc.to}h</span>
              </div>
              <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--lk-text-muted)' }}>
                {svcResas.length} resa · {svcCovers} couv.
              </span>
            </div>
            <TimelineTrack svc={svc} reservations={svcResas} />
          </div>
        );
      })}
    </div>
  );
}

interface ServiceBlock { name: string; from: number; to: number; icon: string }

function TimelineTrack({ svc, reservations }: { svc: ServiceBlock; reservations: ReservationItem[] }) {
  const hours: number[] = [];
  for (let h = svc.from; h < svc.to; h++) hours.push(h);

  return (
    <div style={{ padding: '16px 24px 22px' }}>
      {/* Hour scale */}
      <div style={{ position: 'relative', height: 18, marginBottom: 8 }}>
        {hours.map((h, i) => (
          <div key={h} style={{
            position: 'absolute', left: `${(i / hours.length) * 100}%`, top: 0,
            fontSize: 'var(--fs-xs)', color: 'var(--lk-text-muted)', fontVariantNumeric: 'tabular-nums',
          }}>
            {h}h
          </div>
        ))}
      </div>

      {/* Track */}
      <div style={{
        position: 'relative',
        height: reservations.length === 0 ? 60 : Math.max(60, reservations.length * 38 + 12),
        background: 'var(--lk-surface-1)',
        border: '1px dashed var(--lk-border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
      }}>
        {hours.map((h, i) => i > 0 && (
          <div key={h} style={{
            position: 'absolute', left: `${(i / hours.length) * 100}%`,
            top: 0, bottom: 0, width: 1, background: 'var(--lk-border)',
          }} />
        ))}

        {reservations.length === 0 ? (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'var(--fs-sm)', color: 'var(--lk-text-muted)',
          }}>
            Aucune reservation sur ce service
          </div>
        ) : (
          reservations.map((r, idx) => {
            const [hh, mm] = r.reservation_time.split(':').map(Number);
            const left = ((hh - svc.from) + mm / 60) / hours.length * 100;
            const width = (r.party_size >= 5 ? 1.5 : r.party_size >= 3 ? 1.25 : 1) / hours.length * 100;
            const top = 6 + idx * 38;
            const fullName = `${r.guest_first_name} ${r.guest_last_name}`.trim();
            const tone = r.status === 'confirmed'
              ? { bg: 'white', border: '1px solid var(--lk-border)', accent: 'var(--lk-primary)' }
              : r.status === 'pending'
              ? { bg: 'var(--lk-warning-tint)', border: '1px solid rgba(245,158,11,0.3)', accent: 'var(--lk-warning)' }
              : { bg: '#fff', border: '1px dashed var(--lk-border)', accent: 'var(--lk-text-muted)' };

            return (
              <div key={r.id} style={{
                position: 'absolute',
                left: `${left}%`,
                top,
                width: `max(160px, ${width}%)`,
                height: 30,
                background: tone.bg,
                border: tone.border,
                borderRadius: 'var(--radius)',
                paddingLeft: 10, paddingRight: 10,
                display: 'flex', alignItems: 'center', gap: 8,
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xs)',
              }}>
                <div style={{ width: 3, height: 18, background: tone.accent, borderRadius: 2, flexShrink: 0 }} />
                <span style={{
                  fontSize: 'var(--fs-xs)', fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums', color: 'var(--lk-text-primary)', flexShrink: 0,
                }}>
                  {r.reservation_time.slice(0, 5)}
                </span>
                <span style={{
                  fontSize: 'var(--fs-xs)', fontWeight: 500,
                  color: 'var(--lk-text-secondary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                }}>
                  {fullName || 'Sans nom'}
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  fontSize: 'var(--fs-xs)', color: 'var(--lk-text-muted)',
                  fontWeight: 600, flexShrink: 0,
                }}>
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
      <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--lk-text-muted)', fontSize: 'var(--fs-sm)' }}>
        Aucune table configuree. Rendez-vous dans le plan de salle.
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 24px' }}>
      {/* Mini grid of tables */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 12,
      }}>
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
            <div key={table.id} style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius)',
              border: '1px solid',
              borderColor: hasResa ? 'rgba(237, 115, 169, 0.25)' : 'var(--lk-border)',
              background: hasResa ? 'var(--lk-primary-tint)' : 'var(--lk-bg-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}>
              {/* Table header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: statusColor,
                  }} />
                  <span style={{
                    fontSize: 'var(--fs-base)',
                    fontWeight: 600,
                  }}>
                    {table.name}
                  </span>
                </div>
                <span style={{
                  fontSize: 'var(--fs-xs)', color: 'var(--lk-text-muted)',
                  fontWeight: 500,
                }}>
                  {table.seats} pl.
                </span>
              </div>

              {/* Reservations on this table */}
              {tableResas.length === 0 ? (
                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--lk-text-muted)' }}>
                  Libre
                </span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {tableResas.map(r => {
                    const name = `${r.guest_first_name} ${r.guest_last_name}`.trim();
                    return (
                      <div key={r.id} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '4px 8px',
                        background: 'var(--lk-bg-card)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--fs-xs)',
                      }}>
                        <span style={{
                          fontWeight: 700,
                          fontVariantNumeric: 'tabular-nums',
                          color: 'var(--lk-primary-strong)',
                          flexShrink: 0,
                        }}>
                          {r.reservation_time.slice(0, 5)}
                        </span>
                        <span style={{
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          flex: 1, color: 'var(--lk-text-secondary)',
                        }}>
                          {name || 'Sans nom'}
                        </span>
                        <span style={{ color: 'var(--lk-text-muted)', flexShrink: 0 }}>
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
        <div style={{ marginTop: 16 }}>
          <div style={{
            fontSize: 'var(--fs-xs)', fontWeight: 600,
            color: 'var(--lk-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
            marginBottom: 8,
          }}>
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
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '12px 24px',
      borderBottom: '1px solid var(--lk-border)',
      transition: 'background var(--transition-fast)',
      cursor: 'pointer',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--lk-surface-2)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      {/* Time */}
      <span style={{
        minWidth: 48,
        fontSize: 'var(--fs-sm)',
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        color: 'var(--lk-primary-strong)',
      }}>
        {resa.reservation_time.slice(0, 5)}
      </span>

      {/* Avatar + name */}
      <Avatar name={fullName || 'A'} size={32} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 'var(--fs-base)',
          fontWeight: 500,
          color: 'var(--lk-text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {fullName || 'Sans nom'}
        </div>
        {resa.notes && (
          <div style={{
            fontSize: 'var(--fs-xs)',
            color: 'var(--lk-text-muted)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {resa.notes}
          </div>
        )}
      </div>

      {/* Party size */}
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 'var(--fs-sm)',
        color: 'var(--lk-text-muted)',
        fontWeight: 600,
        flexShrink: 0,
      }}>
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
    <Card
      style={{
        background: 'linear-gradient(160deg, var(--lk-primary-soft) 0%, #FFFFFF 65%)',
        border: '1px solid rgba(237, 115, 169, 0.25)',
        overflow: 'hidden',
      }}
    >
      <Badge tone="primary" icon={<Sparkles size={11} strokeWidth={2} />} style={{ marginBottom: 10 }}>
        Premium
      </Badge>
      <h4 style={{
        fontSize: 'var(--fs-base)',
        fontWeight: 600,
        marginBottom: 6,
        lineHeight: 1.3,
      }}>
        Activez l'agent IA telephonique
      </h4>
      <p style={{
        fontSize: 'var(--fs-sm)',
        color: 'var(--lk-text-secondary)',
        marginBottom: 12,
        lineHeight: 1.5,
      }}>
        Un agent decroche les appels 24/7 et confirme les reservations a votre place.
      </p>
      <Button variant="primary" size="sm" iconRight={<ArrowRight size={12} strokeWidth={2.4} />}>
        Decouvrir
      </Button>
    </Card>
  );
}
