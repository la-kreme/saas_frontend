/* Reservations screen — searchable, filterable list with bulk actions */

function ScreenReservations({ onOpen }) {
  const [filter, setFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [date, setDate] = React.useState("");

  const filtered = RESERVATIONS_TODAY.filter(r => {
    if (filter !== "all" && r.status !== filter) return false;
    if (search && !`${r.first} ${r.last}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ padding:"28px 32px 80px", maxWidth:1440, margin:"0 auto" }} className="lk-animate-up">
      <PageHeader
        title="Réservations"
        subtitle="Historique et gestion de toutes vos réservations."
        actions={
          <>
            <Button variant="secondary" size="md" icon={<I.Open size={14} sw={2}/>}>Exporter</Button>
            <Button variant="primary" size="md" icon={<I.Plus size={14} sw={2.4}/>}>Nouvelle résa</Button>
          </>
        }
      />

      {/* Filters */}
      <Card padded={false} style={{ padding:"12px 14px", marginBottom:14, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
        <div style={{ flex:"1 1 280px", display:"flex", alignItems:"center", gap:8, padding:"0 12px", height:36, background:"var(--lk-surface-2)", border:"1px solid var(--lk-border)", borderRadius:"var(--radius)" }}>
          <I.Search size={14} stroke="var(--lk-text-muted)" sw={2}/>
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Nom, prénom, téléphone…" style={{ flex:1, border:"none", outline:"none", background:"transparent", fontSize:13 }}/>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {[
            { id:"all", label:"Toutes", count: RESERVATIONS_TODAY.length },
            { id:"confirmed", label:"Confirmées", count: RESERVATIONS_TODAY.filter(r=>r.status==="confirmed").length },
            { id:"pending", label:"En attente", count: RESERVATIONS_TODAY.filter(r=>r.status==="pending").length },
            { id:"cancelled", label:"Annulées", count:0 },
          ].map(f => (
            <button key={f.id} onClick={()=>setFilter(f.id)}
              style={{
                padding:"6px 12px", fontSize:12.5, fontWeight:500, borderRadius:"var(--radius-full)",
                background: filter===f.id ? "var(--lk-primary-tint)" : "transparent",
                color: filter===f.id ? "var(--lk-primary-strong)" : "var(--lk-text-secondary)",
                border:"1px solid", borderColor: filter===f.id ? "rgba(237,115,169,0.18)" : "var(--lk-border)",
                display:"inline-flex", alignItems:"center", gap:6,
              }}>
              {f.label}
              <span style={{ fontSize:10.5, opacity:0.7, fontWeight:600 }}>{f.count}</span>
            </button>
          ))}
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
          <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} style={{ height:34, padding:"0 10px", fontSize:13, border:"1px solid var(--lk-border)", borderRadius:"var(--radius)", color:"var(--lk-text-secondary)", background:"white" }}/>
          <button style={{ height:34, width:34, display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid var(--lk-border)", borderRadius:"var(--radius)", background:"white", color:"var(--lk-text-muted)" }}>
            <I.Filter size={14} sw={2}/>
          </button>
        </div>
      </Card>

      {/* Table */}
      <Card padded={false} style={{ padding:0, overflow:"hidden" }}>
        <div style={{
          display:"grid", gridTemplateColumns:"80px 1.6fr 100px 1fr 120px 100px 40px",
          padding:"10px 18px", background:"var(--lk-surface-1)",
          borderBottom:"1px solid var(--lk-border)",
          fontSize:11, fontWeight:600, color:"var(--lk-text-muted)",
          letterSpacing:"0.04em", textTransform:"uppercase", gap:14,
        }}>
          <div>Heure</div>
          <div>Client</div>
          <div>Pers.</div>
          <div>Notes</div>
          <div>Source</div>
          <div>Statut</div>
          <div></div>
        </div>
        {filtered.map((r, i) => (
          <button key={r.id} onClick={()=>onOpen(r)} style={{
            width:"100%", textAlign:"left", display:"grid",
            gridTemplateColumns:"80px 1.6fr 100px 1fr 120px 100px 40px",
            padding:"14px 18px", gap:14, alignItems:"center",
            borderBottom: i < filtered.length-1 ? "1px solid var(--lk-border)" : "none",
            background:"transparent", transition:"background var(--t-fast)",
          }}
          onMouseEnter={(e)=>{ e.currentTarget.style.background="var(--lk-surface-1)"; }}
          onMouseLeave={(e)=>{ e.currentTarget.style.background="transparent"; }}>
            <div style={{ fontWeight:700, fontSize:13.5, fontVariantNumeric:"tabular-nums", color:"var(--lk-primary-strong)" }}>{r.time}</div>
            <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
              <Avatar name={`${r.first} ${r.last}`} size={28} />
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:500, color:"var(--lk-text-primary)" }}>{r.first} {r.last}</div>
                <div style={{ fontSize:11.5, color:"var(--lk-text-muted)" }}>Table {r.table}</div>
              </div>
            </div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:13, fontWeight:600, color:"var(--lk-text-secondary)" }}>
              <I.Users size={12} stroke="var(--lk-text-muted)" sw={2}/>{r.party}
            </div>
            <div style={{ fontSize:12.5, color:"var(--lk-text-muted)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {r.notes || "—"}
            </div>
            <div><SourceTag source={r.source}/></div>
            <div><StatusPill status={r.status}/></div>
            <div style={{ color:"var(--lk-text-muted)" }}><I.More size={16}/></div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding:"60px 24px", textAlign:"center", color:"var(--lk-text-muted)" }}>
            <I.Calendar size={36} style={{ opacity:0.3, marginBottom:10 }}/>
            <div style={{ fontSize:13, fontWeight:500 }}>Aucune réservation ne correspond.</div>
          </div>
        )}
      </Card>
    </div>
  );
}

window.ScreenReservations = ScreenReservations;
