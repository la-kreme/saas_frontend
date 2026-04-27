/* Cmd+K palette */

function CmdK({ open, onClose, onJump }) {
  const [q, setQ] = React.useState("");
  if (!open) return null;
  const items = [
    { kind:"page", label:"Aujourd'hui", icon:I.Home, id:"today" },
    { kind:"page", label:"Réservations", icon:I.Calendar, id:"reservations" },
    { kind:"page", label:"Plan de salle", icon:I.Grid, id:"floor" },
    { kind:"page", label:"Horaires", icon:I.Clock, id:"hours" },
    { kind:"page", label:"Mon widget", icon:I.Code, id:"widget" },
    { kind:"page", label:"Paramètres", icon:I.Settings, id:"settings" },
    ...RESERVATIONS_TODAY.slice(0,5).map(r => ({ kind:"resa", label:`${r.first} ${r.last}`, sub:`${r.time} · ${r.party} pers.`, icon:I.User, id:r.id })),
  ];
  const filtered = q ? items.filter(i => i.label.toLowerCase().includes(q.toLowerCase())) : items;

  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, background:"rgba(20,40,35,0.32)",
      backdropFilter:"blur(2px)", zIndex:200,
      display:"flex", alignItems:"flex-start", justifyContent:"center",
      paddingTop:"15vh", animation:"lk-fade-in 0.15s ease",
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:560, maxWidth:"calc(100% - 40px)",
        background:"var(--lk-bg-card)", border:"1px solid var(--lk-border)",
        borderRadius:"var(--radius-lg)", boxShadow:"var(--shadow-xl)",
        overflow:"hidden", animation:"lk-fade-up 0.2s ease",
      }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid var(--lk-border)", display:"flex", alignItems:"center", gap:12 }}>
          <I.Search size={16} stroke="var(--lk-text-muted)" sw={2}/>
          <input autoFocus value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Rechercher une page, un client, une réservation…"
            style={{ flex:1, border:"none", outline:"none", fontSize:15, background:"transparent" }}/>
          <Kbd>esc</Kbd>
        </div>
        <div className="lk-scroll" style={{ maxHeight:380, overflowY:"auto", padding:6 }}>
          {filtered.map(it => (
            <button key={it.kind+it.id} onClick={()=>{ if(it.kind==="page") onJump(it.id); onClose(); }} style={{
              width:"100%", display:"flex", alignItems:"center", gap:12,
              padding:"10px 12px", borderRadius:"var(--radius)", textAlign:"left",
              background:"transparent",
            }}
            onMouseEnter={(e)=>{ e.currentTarget.style.background="var(--lk-surface-2)"; }}
            onMouseLeave={(e)=>{ e.currentTarget.style.background="transparent"; }}>
              <div style={{
                width:30, height:30, borderRadius:8, background:"var(--lk-surface-2)",
                display:"flex", alignItems:"center", justifyContent:"center",
                color:"var(--lk-text-secondary)",
              }}><it.icon size={14} sw={2}/></div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13.5, fontWeight:500 }}>{it.label}</div>
                {it.sub && <div style={{ fontSize:11.5, color:"var(--lk-text-muted)" }}>{it.sub}</div>}
              </div>
              <span style={{ fontSize:10.5, color:"var(--lk-text-muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>{it.kind === "page" ? "Page" : "Résa"}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding:"32px", textAlign:"center", color:"var(--lk-text-muted)", fontSize:13 }}>Aucun résultat</div>
          )}
        </div>
        <div style={{ padding:"10px 16px", borderTop:"1px solid var(--lk-border)", background:"var(--lk-surface-1)", display:"flex", alignItems:"center", gap:14, fontSize:11, color:"var(--lk-text-muted)" }}>
          <span style={{ display:"inline-flex", alignItems:"center", gap:5 }}><Kbd>↵</Kbd> Ouvrir</span>
          <span style={{ display:"inline-flex", alignItems:"center", gap:5 }}><Kbd>↑</Kbd><Kbd>↓</Kbd> Naviguer</span>
          <div style={{ flex:1 }}/>
          <LkLogo size={11}/>
        </div>
      </div>
    </div>
  );
}

window.CmdK = CmdK;
