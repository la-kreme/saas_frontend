/* Floor plan — pro version: zones grid, table chips, sidebar with stats, edit/service mode */

function ScreenFloor() {
  const [mode, setMode] = React.useState("edit"); // edit | service
  const [zone, setZone] = React.useState("Salle principale");
  const [selected, setSelected] = React.useState(null);

  const zones = [
    { id:"main",  label:"Salle principale", count:5 },
    { id:"terrasse", label:"Terrasse", count:2 },
  ];

  return (
    <div style={{ padding:"28px 32px 40px", maxWidth:1440, margin:"0 auto" }} className="lk-animate-up">
      <PageHeader
        title="Plan de salle"
        subtitle="Composez votre salle. Glissez les tables pour les positionner — chaque zone a son propre plan."
        actions={
          <>
            <div style={{ display:"flex", padding:3, background:"var(--lk-surface-2)", border:"1px solid var(--lk-border)", borderRadius:"var(--radius)" }}>
              {[
                { id:"edit", label:"Édition", icon:I.Pencil },
                { id:"service", label:"Service", icon:I.Eye },
              ].map(m => (
                <button key={m.id} onClick={()=>setMode(m.id)} style={{
                  padding:"6px 12px", display:"inline-flex", alignItems:"center", gap:6,
                  borderRadius:7, fontSize:12.5, fontWeight:500,
                  background: mode===m.id ? "white" : "transparent",
                  color: mode===m.id ? "var(--lk-text-primary)" : "var(--lk-text-muted)",
                  boxShadow: mode===m.id ? "var(--shadow-xs)" : "none",
                }}><m.icon size={13} sw={2}/>{m.label}</button>
              ))}
            </div>
            <Button variant="primary" size="md" icon={<I.Plus size={14} sw={2.4}/>}>Table</Button>
          </>
        }
      />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:16, alignItems:"flex-start" }}>
        {/* Floor canvas */}
        <Card padded={false} style={{ padding:0, overflow:"hidden" }}>
          {/* Zone tabs */}
          <div style={{ display:"flex", alignItems:"center", padding:"12px 16px", borderBottom:"1px solid var(--lk-border)", gap:6, background:"var(--lk-surface-1)" }}>
            {zones.map(z => (
              <button key={z.id} onClick={()=>setZone(z.label)} style={{
                padding:"6px 14px", fontSize:13, fontWeight:500, borderRadius:"var(--radius-full)",
                background: zone===z.label ? "var(--lk-primary-tint)" : "transparent",
                color: zone===z.label ? "var(--lk-primary-strong)" : "var(--lk-text-secondary)",
                border:"1px solid", borderColor: zone===z.label ? "rgba(237,115,169,0.18)" : "transparent",
                display:"inline-flex", alignItems:"center", gap:6,
              }}>{z.label}<span style={{ fontSize:11, opacity:0.6 }}>{z.count}</span></button>
            ))}
            <button style={{ padding:"6px 10px", fontSize:13, color:"var(--lk-text-muted)" }}>+ Zone</button>
          </div>

          {/* Canvas */}
          <div style={{
            position:"relative", height:520, overflow:"hidden",
            background: `
              repeating-linear-gradient(0deg, transparent 0 35px, rgba(20,40,35,0.04) 35px 36px),
              repeating-linear-gradient(90deg, transparent 0 35px, rgba(20,40,35,0.04) 35px 36px),
              var(--lk-bg-card)
            `,
          }}>
            {/* Zone groups */}
            <ZoneGroup label="grande table" color="var(--lk-primary)" x={100} y={40} w={220} h={120} >
              <FloorTable label="T3" seats={2} x={10} y={20} selected={selected==="T3"} onClick={()=>setSelected("T3")}/>
              <FloorTable label="T4" seats={4} x={110} y={20} selected={selected==="T4"} onClick={()=>setSelected("T4")}/>
            </ZoneGroup>
            <ZoneGroup label="pas (terrasse)" color="var(--lk-secondary-strong)" x={250} y={210} w={220} h={120} dashed>
              <FloorTable label="1" seats={7} x={10} y={20} selected={selected==="1"} onClick={()=>setSelected("1")}/>
              <FloorTable label="2" seats={4} x={110} y={20} selected={selected==="2"} onClick={()=>setSelected("2")}/>
            </ZoneGroup>
            <ZoneGroup label="verger (4 pl. mini)" color="#E0A03B" x={520} y={210} w={220} h={120} dashed>
              <FloorTable label="T6" seats={2} x={10} y={20} selected={selected==="T6"} onClick={()=>setSelected("T6")}/>
              <FloorTable label="T7" seats={4} x={110} y={20} selected={selected==="T7"} onClick={()=>setSelected("T7")}/>
            </ZoneGroup>

            {/* Floating zoom controls */}
            <div style={{
              position:"absolute", bottom:16, right:16,
              display:"flex", padding:5, gap:4,
              background:"white", border:"1px solid var(--lk-border)",
              borderRadius:"var(--radius)", boxShadow:"var(--shadow-sm)",
            }}>
              <IconBtn icon={<I.ZoomOut size={14}/>} />
              <span style={{ display:"inline-flex", alignItems:"center", padding:"0 8px", fontSize:12, color:"var(--lk-text-muted)", fontVariantNumeric:"tabular-nums" }}>100%</span>
              <IconBtn icon={<I.Zoom size={14}/>} />
              <span style={{ width:1, background:"var(--lk-border)", margin:"4px 2px" }}/>
              <IconBtn icon={<I.Maximize size={14}/>} />
            </div>

            {/* Service mode overlay info */}
            {mode === "service" && (
              <div style={{
                position:"absolute", top:16, left:16,
                padding:"10px 14px", background:"white",
                border:"1px solid var(--lk-border)", borderRadius:"var(--radius)",
                boxShadow:"var(--shadow)", display:"flex", alignItems:"center", gap:10,
                fontSize:12,
              }}>
                <span style={{ display:"inline-flex", alignItems:"center", gap:5 }}>
                  <span style={{ width:9, height:9, borderRadius:3, background:"var(--lk-success)" }}/>Libre
                </span>
                <span style={{ display:"inline-flex", alignItems:"center", gap:5 }}>
                  <span style={{ width:9, height:9, borderRadius:3, background:"var(--lk-warning)" }}/>Réservée
                </span>
                <span style={{ display:"inline-flex", alignItems:"center", gap:5 }}>
                  <span style={{ width:9, height:9, borderRadius:3, background:"var(--lk-primary)" }}/>Occupée
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Side panel — table inspector / stats */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Card padded={false} style={{ padding:"16px 18px" }}>
            <div style={{ fontSize:11, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--lk-text-muted)", marginBottom:10 }}>
              Capacité de la zone
            </div>
            <div style={{ fontSize:30, fontWeight:700, lineHeight:1, marginBottom:4, fontVariantNumeric:"tabular-nums" }}>23<span style={{ fontSize:14, color:"var(--lk-text-muted)", fontWeight:500, marginLeft:6 }}>couverts</span></div>
            <div style={{ fontSize:12, color:"var(--lk-text-muted)" }}>Réparti sur 6 tables, 3 zones</div>
            <div style={{ height:6, background:"var(--lk-surface-3)", borderRadius:3, marginTop:14, overflow:"hidden" }}>
              <div style={{ width:"68%", height:"100%", background:"linear-gradient(90deg, var(--lk-primary), var(--lk-secondary))", borderRadius:3 }}/>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--lk-text-muted)", marginTop:5 }}>
              <span>Service en cours · 16 / 23</span>
              <span>68%</span>
            </div>
          </Card>

          {selected ? (
            <Card padded={false} style={{ padding:"16px 18px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ fontSize:14, fontWeight:600 }}>Table {selected}</div>
                <button onClick={()=>setSelected(null)} style={{ color:"var(--lk-text-muted)" }}><I.X size={14}/></button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
                <Field label="Nom"><input defaultValue={selected} style={inputStyle}/></Field>
                <Field label="Couverts"><input defaultValue={4} type="number" style={inputStyle}/></Field>
              </div>
              <Field label="Zone">
                <select style={inputStyle} defaultValue="Salle principale">
                  <option>Salle principale</option>
                  <option>Terrasse</option>
                </select>
              </Field>
              <div style={{ display:"flex", gap:6, marginTop:14 }}>
                <Button variant="secondary" size="sm" icon={<I.Trash size={12}/>} style={{ color:"var(--lk-error)", flex:1 }}>Supprimer</Button>
                <Button variant="primary" size="sm" style={{ flex:1 }}>Enregistrer</Button>
              </div>
            </Card>
          ) : (
            <Card padded={false} style={{ padding:"16px 18px", background:"var(--lk-surface-1)" }}>
              <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                <I.Info size={16} stroke="var(--lk-text-muted)" sw={1.8} style={{ flexShrink:0, marginTop:2 }}/>
                <div style={{ fontSize:12, color:"var(--lk-text-secondary)", lineHeight:1.5 }}>
                  Cliquez sur une table pour la modifier. Glissez-la pour la repositionner. Maintenez <Kbd>Shift</Kbd> pour aligner sur la grille.
                </div>
              </div>
            </Card>
          )}

          <Card padded={false} style={{ padding:"14px 18px" }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>Raccourcis</div>
            <div style={{ display:"flex", flexDirection:"column", gap:6, fontSize:12, color:"var(--lk-text-secondary)" }}>
              <KbdRow label="Ajouter table"><Kbd>T</Kbd></KbdRow>
              <KbdRow label="Ajouter zone"><Kbd>Z</Kbd></KbdRow>
              <KbdRow label="Dupliquer"><Kbd>⌘</Kbd><Kbd>D</Kbd></KbdRow>
              <KbdRow label="Supprimer"><Kbd>⌫</Kbd></KbdRow>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ZoneGroup({ label, color, x, y, w, h, children, dashed }) {
  return (
    <div style={{ position:"absolute", left:x, top:y, width:w, height:h }}>
      <div style={{
        position:"absolute", inset:0,
        border: dashed ? `1.5px dashed ${color}` : `1.5px solid ${color}`,
        borderRadius:"var(--radius)",
        background: `${color}10`,
      }}/>
      <div style={{
        position:"absolute", top:-9, left:14, padding:"1px 8px",
        background:"var(--lk-bg-card)", border:`1px solid ${color}`, borderRadius:"var(--radius-full)",
        fontSize:10.5, color, fontWeight:600,
      }}>{label}</div>
      {children}
    </div>
  );
}

function FloorTable({ label, seats, x, y, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      position:"absolute", left:x, top:y,
      width:80, height:60, borderRadius:"var(--radius)",
      background: selected ? "var(--lk-primary-tint)" : "white",
      border: selected ? "2px solid var(--lk-primary)" : "1px solid var(--lk-border-strong)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      gap:2, boxShadow: selected ? "0 0 0 4px var(--lk-primary-glow)" : "var(--shadow-xs)",
      cursor:"grab", transition:"all var(--t-fast)",
    }}>
      <div style={{ fontSize:14, fontWeight:700, letterSpacing:"-0.02em", color: selected ? "var(--lk-primary-strong)" : "var(--lk-text-primary)" }}>{label}</div>
      <div style={{ fontSize:10.5, color:"var(--lk-text-muted)", fontWeight:500 }}>{seats} pl.</div>
    </button>
  );
}

function IconBtn({ icon }) {
  return <button style={{
    width:28, height:28, borderRadius:6, color:"var(--lk-text-muted)",
    display:"inline-flex", alignItems:"center", justifyContent:"center",
  }}>{icon}</button>;
}

function Field({ label, children }) {
  return (
    <label style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <span style={{ fontSize:11.5, fontWeight:500, color:"var(--lk-text-secondary)" }}>{label}</span>
      {children}
    </label>
  );
}

function KbdRow({ label, children }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <span>{label}</span>
      <span style={{ display:"flex", gap:3 }}>{children}</span>
    </div>
  );
}

const inputStyle = {
  height:34, padding:"0 10px", fontSize:13,
  border:"1px solid var(--lk-border)", borderRadius:"var(--radius-sm)",
  background:"white", outline:"none", color:"var(--lk-text-primary)",
};

window.ScreenFloor = ScreenFloor;
