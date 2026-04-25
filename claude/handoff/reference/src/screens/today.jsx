/* Aujourd'hui — Command Center
   - KPI strip with sparkline-ish micro-info
   - Service timeline (lunch + dinner) — visual heatmap by hour
   - Live activity feed (right column)
   - Empty state when 0 reservations: friendly + actionable
*/

function ScreenToday({ density, emptyState, onOpenReservation, onCmdK }) {
  const reservations = emptyState ? [] : RESERVATIONS_TODAY;
  const confirmed = reservations.filter(r => r.status === "confirmed").length;
  const pending = reservations.filter(r => r.status === "pending").length;
  const covers = reservations.filter(r => r.status !== "cancelled").reduce((s, r) => s + r.party, 0);
  // Daily capacity = seats × services per day (mid + soir). 26 seats × 2 services = 52 covers.
  const dailyCapacity = (RESTAURANT.cover || 26) * 2;
  const occupancy = Math.min(100, Math.round((covers / dailyCapacity) * 100));

  const fmtDate = (d) => {
    const days = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
    const months = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div style={{ padding: "28px 32px 80px", maxWidth: 1440, margin:"0 auto" }} className="lk-animate-up">
      <PageHeader
        eyebrow={fmtDate(TODAY_DATE)}
        title="Aujourd'hui"
        subtitle={emptyState
          ? "Aucune réservation prévue. Profitez-en pour peaufiner votre page."
          : `${reservations.length} réservations · ${covers} couverts attendus · ${occupancy}% de remplissage`}
        actions={
          <>
            <Button variant="secondary" size="md" icon={<I.Eye size={14} sw={2} />}>Mode service</Button>
            <Button variant="primary" size="md" icon={<I.Plus size={14} sw={2.4} />}>Nouvelle résa</Button>
          </>
        }
      />

      {/* KPI strip */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(4, 1fr)",
        gap:14, marginBottom:24,
      }}>
        <KpiCard label="Réservations" value={reservations.length} icon={<I.Calendar size={16} stroke="var(--lk-info)" sw={2} />} tint="var(--lk-info-tint)" trend={emptyState ? null : "+3 vs hier"} />
        <KpiCard label="Confirmées" value={confirmed} icon={<I.Check size={16} stroke="var(--lk-success)" sw={2.5} />} tint="var(--lk-success-tint)" />
        <KpiCard label="En attente" value={pending} icon={<I.Clock size={16} stroke="var(--lk-warning)" sw={2} />} tint="var(--lk-warning-tint)" hot={pending > 0} />
        <KpiCard label="Couverts" value={covers} icon={<I.Users size={16} stroke="var(--lk-primary-strong)" sw={2} />} tint="var(--lk-primary-soft)" sub={`/ ${RESTAURANT.cover} capacité`} />
      </div>

      {/* Two-column layout: timeline + activity */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:20, alignItems:"flex-start" }}>
        <ServiceTimeline reservations={reservations} emptyState={emptyState} onOpen={onOpenReservation} />
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <ActivityFeed emptyState={emptyState} />
          <UpsellCard />
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, tint, trend, sub, hot }) {
  return (
    <Card padded={false} style={{ padding:"16px 18px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <div style={{
          width:32, height:32, borderRadius:8, background:tint,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>{icon}</div>
        {hot && <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--lk-warning)", animation:"lk-pulse 2s ease-in-out infinite" }} />}
        {trend && <span style={{ fontSize:11, fontWeight:600, color:"var(--lk-success)" }}>{trend}</span>}
      </div>
      <div style={{ fontSize:11, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--lk-text-muted)", marginBottom:4 }}>{label}</div>
      <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
        <div style={{ fontSize:30, fontWeight:700, lineHeight:1, letterSpacing:"-0.025em", fontVariantNumeric:"tabular-nums" }}>{value}</div>
        {sub && <span style={{ fontSize:12, color:"var(--lk-text-muted)" }}>{sub}</span>}
      </div>
    </Card>
  );
}

function ServiceTimeline({ reservations, emptyState, onOpen }) {
  const services = [
    { name:"Service du midi", from:11, to:15, icon:"☀" },
    { name:"Service du soir", from:19, to:23, icon:"☾" },
  ];

  if (emptyState) {
    return (
      <Card padded={false} style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"20px 24px", borderBottom:"1px solid var(--lk-border)" }}>
          <h2 style={{ fontSize:16, fontWeight:600 }}>Planning du jour</h2>
        </div>
        <div style={{ padding:"60px 32px", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center" }}>
          {/* Friendly illustration placeholder — SVG that matches DA */}
          <div style={{
            width:160, height:120, position:"relative", marginBottom:20,
            background:"linear-gradient(135deg, var(--lk-primary-soft) 0%, var(--lk-secondary-tint) 100%)",
            borderRadius:"var(--radius-xl)", overflow:"hidden",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            {/* simple decorative shapes only — no fake illustration */}
            <div style={{ position:"absolute", top:18, left:18, width:42, height:42, borderRadius:10, background:"white", boxShadow:"var(--shadow-sm)" }} />
            <div style={{ position:"absolute", top:34, left:64, width:56, height:14, borderRadius:7, background:"white", opacity:0.7 }} />
            <div style={{ position:"absolute", top:54, left:64, width:38, height:8, borderRadius:4, background:"white", opacity:0.5 }} />
            <div style={{ position:"absolute", bottom:16, right:22, width:46, height:46, borderRadius:"50%", background:"var(--lk-primary)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <I.Calendar size={20} stroke="white" sw={2} />
            </div>
          </div>
          <h3 style={{ fontSize:18, fontWeight:600, marginBottom:6 }}>Le calme avant le service</h3>
          <p style={{ fontSize:13.5, color:"var(--lk-text-muted)", maxWidth:380, marginBottom:20, textWrap:"pretty" }}>
            Aucune réservation pour aujourd'hui. Dès qu'un client réserve sur votre widget ou via l'agent IA, ça apparaîtra ici en direct.
          </p>
          <div style={{ display:"flex", gap:8 }}>
            <Button variant="primary" size="md" icon={<I.Plus size={14} sw={2.4} />}>Saisir une résa</Button>
            <Button variant="secondary" size="md" icon={<I.Open size={14} sw={2} />}>Voir mon widget</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card padded={false} style={{ padding:0, overflow:"hidden" }}>
      <div style={{ padding:"18px 24px", borderBottom:"1px solid var(--lk-border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <h2 style={{ fontSize:16, fontWeight:600 }}>Planning du jour</h2>
        <div style={{ display:"flex", gap:6 }}>
          <button style={tabBtnStyle(true)}>Timeline</button>
          <button style={tabBtnStyle(false)}>Liste</button>
          <button style={tabBtnStyle(false)}>Par table</button>
        </div>
      </div>

      {services.map(svc => {
        const svcResas = reservations.filter(r => {
          const h = parseInt(r.time.slice(0,2));
          return h >= svc.from && h < svc.to;
        });
        const svcCovers = svcResas.reduce((s,r)=>s+r.party, 0);

        return (
          <div key={svc.name}>
            <div style={{
              padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between",
              background:"var(--lk-surface-1)", borderTop:"1px solid var(--lk-border)",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:14 }}>{svc.icon}</span>
                <span style={{ fontSize:13, fontWeight:600 }}>{svc.name}</span>
                <span style={{ fontSize:12, color:"var(--lk-text-muted)" }}>· {svc.from}h – {svc.to}h</span>
              </div>
              <span style={{ fontSize:12, color:"var(--lk-text-muted)" }}>
                {svcResas.length} résa · {svcCovers} couv.
              </span>
            </div>
            <TimelineRow svc={svc} reservations={svcResas} onOpen={onOpen} />
          </div>
        );
      })}
    </Card>
  );
}

function tabBtnStyle(active) {
  return {
    padding:"5px 11px", fontSize:12, fontWeight:500,
    borderRadius:"var(--radius-full)",
    background: active ? "var(--lk-primary-tint)" : "transparent",
    color: active ? "var(--lk-primary-strong)" : "var(--lk-text-muted)",
    border:"1px solid transparent",
    borderColor: active ? "rgba(237,115,169,0.18)" : "transparent",
  };
}

function TimelineRow({ svc, reservations, onOpen }) {
  // Visual hour scale
  const hours = [];
  for (let h = svc.from; h < svc.to; h++) hours.push(h);

  return (
    <div style={{ padding:"16px 24px 22px" }}>
      {/* Hour scale */}
      <div style={{ position:"relative", height:18, marginBottom:8 }}>
        {hours.map((h, i) => (
          <div key={h} style={{
            position:"absolute", left:`${(i / hours.length) * 100}%`, top:0,
            fontSize:11, color:"var(--lk-text-muted)", fontVariantNumeric:"tabular-nums",
          }}>{h}h</div>
        ))}
      </div>

      {/* Track + reservations */}
      <div style={{
        position:"relative", height:reservations.length === 0 ? 60 : Math.max(60, reservations.length * 38 + 12),
        background:"var(--lk-surface-1)", border:"1px dashed var(--lk-border)", borderRadius:"var(--radius)",
        overflow:"hidden",
      }}>
        {/* Hour grid lines */}
        {hours.map((h, i) => i > 0 && (
          <div key={h} style={{ position:"absolute", left:`${(i / hours.length) * 100}%`, top:0, bottom:0, width:1, background:"var(--lk-border)" }} />
        ))}

        {reservations.length === 0 ? (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"var(--lk-text-muted)" }}>
            Aucune réservation sur ce service
          </div>
        ) : (
          reservations.sort((a,b)=>a.time.localeCompare(b.time)).map((r, idx) => {
            const [hh, mm] = r.time.split(":").map(Number);
            const left = ((hh - svc.from) + mm/60) / hours.length * 100;
            const width = (r.party >= 5 ? 1.5 : r.party >= 3 ? 1.25 : 1) / hours.length * 100;
            const top = 6 + idx * 38;
            const tone = r.status === "confirmed" ? {
              bg: "white", border:"1px solid var(--lk-border)",
              accent:"var(--lk-primary)",
            } : r.status === "pending" ? {
              bg:"var(--lk-warning-tint)", border:"1px solid rgba(245,158,11,0.3)",
              accent:"var(--lk-warning)"
            } : { bg:"#fff", border:"1px dashed var(--lk-border)", accent:"var(--lk-text-muted)" };
            return (
              <button key={r.id} onClick={()=>onOpen(r)} style={{
                position:"absolute", left:`${left}%`, top, width:`max(160px, ${width}%)`, height:30,
                background:tone.bg, border:tone.border, borderRadius:"var(--radius)",
                paddingLeft: 10, paddingRight: 10,
                display:"flex", alignItems:"center", gap:8,
                textAlign:"left", overflow:"hidden",
                boxShadow:"var(--shadow-xs)",
              }}>
                <div style={{ width:3, height:18, background:tone.accent, borderRadius:2, flexShrink:0 }} />
                <span style={{ fontSize:11.5, fontWeight:700, fontVariantNumeric:"tabular-nums", color:"var(--lk-text-primary)", flexShrink:0 }}>{r.time}</span>
                <span style={{ fontSize:11.5, fontWeight:500, color:"var(--lk-text-secondary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>
                  {r.first} {r.last[0]}.
                </span>
                <span style={{ display:"inline-flex", alignItems:"center", gap:3, fontSize:10.5, color:"var(--lk-text-muted)", fontWeight:600, flexShrink:0 }}>
                  <I.Users size={10} sw={2}/>{r.party}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function ActivityFeed({ emptyState }) {
  const items = emptyState ? [] : ACTIVITY;
  return (
    <Card padded={false} style={{ padding:0, overflow:"hidden" }}>
      <div style={{ padding:"14px 18px", borderBottom:"1px solid var(--lk-border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <h3 style={{ fontSize:14, fontWeight:600 }}>Activité en direct</h3>
        <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11, color:"var(--lk-success)", fontWeight:600 }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--lk-success)", animation:"lk-pulse 2s ease-in-out infinite" }} /> Live
        </span>
      </div>
      {items.length === 0 ? (
        <div style={{ padding:"32px 18px", textAlign:"center", color:"var(--lk-text-muted)", fontSize:12.5 }}>
          Aucune activité pour le moment.
        </div>
      ) : (
        <div style={{ padding:"6px 4px 8px" }}>
          {items.map(it => (
            <div key={it.id} style={{
              padding:"10px 14px", display:"flex", gap:10, alignItems:"flex-start",
              borderRadius:"var(--radius)", margin:"2px 4px",
              cursor:"pointer", transition:"background var(--t-fast)"
            }}
            onMouseEnter={(e)=>{ e.currentTarget.style.background="var(--lk-surface-2)"; }}
            onMouseLeave={(e)=>{ e.currentTarget.style.background="transparent"; }}>
              <div style={{
                width:28, height:28, borderRadius:8, flexShrink:0,
                background: it.kind === "cancel" ? "var(--lk-error-tint)" :
                           it.kind === "agent"  ? "#FCE7DD" : "var(--lk-primary-soft)",
                color: it.kind === "cancel" ? "var(--lk-error)" :
                       it.kind === "agent"  ? "#D97757" : "var(--lk-primary-strong)",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                {it.kind === "agent" ? <span style={{ fontSize:14, fontWeight:700 }}>✷</span>
                  : it.kind === "cancel" ? <I.X size={14} sw={2.4}/>
                  : <I.Plus size={14} sw={2.4}/>}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12.5, color:"var(--lk-text-primary)", lineHeight:1.4, textWrap:"pretty" }}>{it.text}</div>
                <div style={{ fontSize:11, color:"var(--lk-text-muted)", marginTop:2 }}>{it.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function UpsellCard() {
  return (
    <Card padded={false} style={{
      padding:"18px",
      background:"linear-gradient(160deg, var(--lk-primary-soft) 0%, #FFFFFF 65%)",
      border:"1px solid rgba(237,115,169,0.25)",
      position:"relative", overflow:"hidden",
    }}>
      <Badge tone="primary" style={{ marginBottom:10 }}>
        <I.Sparkles size={11} sw={2}/> Premium
      </Badge>
      <h4 style={{ fontSize:14, fontWeight:600, marginBottom:6, lineHeight:1.3 }}>
        Activez l'agent IA téléphonique
      </h4>
      <p style={{ fontSize:12.5, color:"var(--lk-text-secondary)", marginBottom:12, lineHeight:1.5 }}>
        Un agent décroche les appels 24/7 et confirme les réservations à votre place.
      </p>
      <Button variant="primary" size="sm" iconRight={<I.ArrowRight size={12} sw={2.4} />}>
        Découvrir
      </Button>
    </Card>
  );
}

window.ScreenToday = ScreenToday;
