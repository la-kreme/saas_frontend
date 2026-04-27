/* Reservation detail — slide-over drawer */

function ResaDrawer({ resa, onClose }) {
  if (!resa) return null;
  return (
    <>
      <div onClick={onClose} style={{
        position:"fixed", inset:0, background:"rgba(20,40,35,0.32)",
        backdropFilter:"blur(2px)", zIndex:90, animation:"lk-fade-in 0.2s ease"
      }}/>
      <aside style={{
        position:"fixed", top:0, right:0, bottom:0, width:480,
        background:"var(--lk-bg-card)", boxShadow:"var(--shadow-xl)", zIndex:100,
        display:"flex", flexDirection:"column", animation:"lk-fade-up 0.3s cubic-bezier(0.22,1,0.36,1)",
      }}>
        <div style={{ padding:"18px 22px", borderBottom:"1px solid var(--lk-border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <Avatar name={`${resa.first} ${resa.last}`} size={36}/>
            <div>
              <div style={{ fontSize:15, fontWeight:600 }}>{resa.first} {resa.last}</div>
              <div style={{ fontSize:12, color:"var(--lk-text-muted)" }}>Client · 1ère visite</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, color:"var(--lk-text-muted)" }}><I.X size={16}/></button>
        </div>

        <div className="lk-scroll" style={{ flex:1, overflowY:"auto", padding:"22px" }}>
          <div style={{ display:"flex", gap:8, marginBottom:18 }}>
            <StatusPill status={resa.status}/>
            <SourceTag source={resa.source}/>
          </div>

          <Card padded={false} style={{ padding:"18px 20px", marginBottom:14 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <Detail label="Date" value="Samedi 25 avril 2026"/>
              <Detail label="Heure" value={resa.time}/>
              <Detail label="Personnes" value={`${resa.party} couverts`}/>
              <Detail label="Table assignée" value={`Table ${resa.table}`}/>
            </div>
            {resa.notes && (
              <div style={{ marginTop:16, padding:"12px 14px", background:"var(--lk-warning-tint)", borderRadius:"var(--radius)", border:"1px solid rgba(245,158,11,0.2)" }}>
                <div style={{ fontSize:11, fontWeight:600, color:"var(--lk-warning)", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.04em" }}>Note du client</div>
                <div style={{ fontSize:13, color:"var(--lk-text-primary)" }}>{resa.notes}</div>
              </div>
            )}
          </Card>

          <Card padded={false} style={{ padding:"18px 20px", marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:600, color:"var(--lk-text-muted)", marginBottom:12, textTransform:"uppercase", letterSpacing:"0.04em" }}>Contact</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <ContactRow icon={<I.Mail size={14} stroke="var(--lk-text-muted)" sw={2}/>} value={`${resa.first.toLowerCase()}.${resa.last.toLowerCase()}@example.com`}/>
              <ContactRow icon={<I.Phone size={14} stroke="var(--lk-text-muted)" sw={2}/>} value={resa.phone || "06 XX XX XX XX"}/>
            </div>
          </Card>

          <Card padded={false} style={{ padding:"18px 20px" }}>
            <div style={{ fontSize:12, fontWeight:600, color:"var(--lk-text-muted)", marginBottom:12, textTransform:"uppercase", letterSpacing:"0.04em" }}>Historique</div>
            <div style={{ fontSize:13, color:"var(--lk-text-muted)", textAlign:"center", padding:"12px 0" }}>
              Première visite chez vous 🌱
            </div>
          </Card>
        </div>

        <div style={{ padding:"14px 22px", borderTop:"1px solid var(--lk-border)", display:"flex", gap:8 }}>
          <Button variant="ghost" size="md" style={{ color:"var(--lk-error)" }}>Annuler</Button>
          <div style={{ flex:1 }}/>
          <Button variant="secondary" size="md" icon={<I.Mail size={13} sw={2}/>}>Contacter</Button>
          <Button variant="primary" size="md" icon={<I.Check size={13} sw={2.4}/>}>Confirmer</Button>
        </div>
      </aside>
    </>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <div style={{ fontSize:11, color:"var(--lk-text-muted)", marginBottom:3, textTransform:"uppercase", letterSpacing:"0.04em", fontWeight:600 }}>{label}</div>
      <div style={{ fontSize:13.5, fontWeight:500 }}>{value}</div>
    </div>
  );
}

function ContactRow({ icon, value }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:"var(--radius)", background:"var(--lk-surface-1)" }}>
      {icon}<span style={{ fontSize:13, color:"var(--lk-text-primary)", flex:1 }}>{value}</span>
      <button style={{ color:"var(--lk-text-muted)", padding:4 }}><I.Copy size={13}/></button>
    </div>
  );
}

window.ResaDrawer = ResaDrawer;
