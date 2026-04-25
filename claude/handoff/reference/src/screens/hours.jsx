/* Hours — calendar-style week overview, edit per day */

function ScreenHours() {
  const [activeDay, setActiveDay] = React.useState("Samedi");

  return (
    <div style={{ padding:"28px 32px 80px", maxWidth:1440, margin:"0 auto" }} className="lk-animate-up">
      <PageHeader
        title="Horaires d'ouverture"
        subtitle="Définissez quand vos clients peuvent réserver. Les changements s'appliquent à la prochaine semaine."
        actions={
          <>
            <Button variant="secondary" size="md" icon={<I.Repeat size={14} sw={2}/>}>Appliquer à toute la semaine</Button>
            <Button variant="primary" size="md" icon={<I.Save size={14} sw={2}/>}>Enregistrer</Button>
          </>
        }
      />

      {/* Week strip */}
      <Card padded={false} style={{ padding:0, overflow:"hidden", marginBottom:14 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)" }}>
          {DAYS.map((day, i) => {
            const config = HOURS[day];
            const isActive = day === activeDay;
            return (
              <button key={day} onClick={()=>setActiveDay(day)}
                style={{
                  padding:"14px 12px",
                  textAlign:"left",
                  borderRight: i < 6 ? "1px solid var(--lk-border)" : "none",
                  background: isActive ? "var(--lk-primary-tint)" : "white",
                  borderTop: isActive ? "2px solid var(--lk-primary)" : "2px solid transparent",
                  position:"relative",
                  transition:"all var(--t-fast)",
                }}>
                <div style={{ fontSize:11, fontWeight:600, letterSpacing:"0.04em", textTransform:"uppercase", color: isActive ? "var(--lk-primary-strong)" : "var(--lk-text-muted)", marginBottom:5 }}>{day.slice(0,3)}</div>
                {config.open ? (
                  <>
                    <div style={{ fontSize:13, fontWeight:600 }}>{config.services.length} service{config.services.length>1?"s":""}</div>
                    <div style={{ fontSize:11, color:"var(--lk-text-muted)", marginTop:3, fontVariantNumeric:"tabular-nums" }}>
                      {config.services[0].from}–{config.services[config.services.length-1].to}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize:12.5, color:"var(--lk-text-muted)", display:"inline-flex", alignItems:"center", gap:4 }}>
                    <I.Lock size={11} sw={2}/>Fermé
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Day editor */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16 }}>
        <Card padded={false} style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--lk-border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <h2 style={{ fontSize:17, fontWeight:600 }}>{activeDay}</h2>
              <Toggle checked={HOURS[activeDay].open} />
              <span style={{ fontSize:12, color:"var(--lk-text-muted)" }}>{HOURS[activeDay].open ? "Ouvert" : "Fermé"}</span>
            </div>
            <button style={{ fontSize:12, color:"var(--lk-text-muted)", display:"inline-flex", alignItems:"center", gap:4 }}>
              <I.Copy size={12}/> Copier vers…
            </button>
          </div>

          {HOURS[activeDay].open && HOURS[activeDay].services.map((svc, i) => (
            <div key={i} style={{ padding:"18px 20px", borderTop: i>0 ? "1px solid var(--lk-border)" : "none" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <input defaultValue={svc.name} placeholder="Nom du service" style={{
                  fontSize:14, fontWeight:600, padding:"4px 8px", marginLeft:-8,
                  border:"1px solid transparent", borderRadius:6,
                  background:"transparent", outline:"none",
                }}/>
                <button style={{ color:"var(--lk-text-muted)", fontSize:12, display:"inline-flex", alignItems:"center", gap:4 }}>
                  <I.Trash size={12}/> Supprimer
                </button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10 }}>
                <Field label="Ouverture"><input type="time" defaultValue={svc.from} style={inputStyle}/></Field>
                <Field label="Fermeture"><input type="time" defaultValue={svc.to} style={inputStyle}/></Field>
                <Field label="Durée repas">
                  <select defaultValue={svc.duration} style={inputStyle}>
                    <option value={60}>60 min</option><option value={90}>90 min</option><option value={120}>120 min</option>
                  </select>
                </Field>
                <Field label="Intervalle">
                  <select defaultValue={svc.interval} style={inputStyle}>
                    <option value={15}>15 min</option><option value={30}>30 min</option>
                  </select>
                </Field>
              </div>
              {/* Visual hour bar */}
              <div style={{ marginTop:14, position:"relative", height:30, background:"var(--lk-surface-1)", borderRadius:"var(--radius)", overflow:"hidden" }}>
                {Array.from({length:24}).map((_,h) => (
                  <div key={h} style={{ position:"absolute", left:`${(h/24)*100}%`, top:0, bottom:0, width:1, background:"var(--lk-border)" }}/>
                ))}
                <div style={{
                  position:"absolute",
                  left:`${(parseInt(svc.from.slice(0,2)) + parseInt(svc.from.slice(3,5))/60) / 24 * 100}%`,
                  width:`${((parseInt(svc.to.slice(0,2)) + parseInt(svc.to.slice(3,5))/60) - (parseInt(svc.from.slice(0,2)) + parseInt(svc.from.slice(3,5))/60)) / 24 * 100}%`,
                  top:5, bottom:5,
                  background:"linear-gradient(90deg, var(--lk-primary-soft), var(--lk-primary))",
                  borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:11, fontWeight:600, color:"white", textShadow:"0 1px 2px rgba(0,0,0,0.15)",
                  fontVariantNumeric:"tabular-nums",
                }}>{svc.from}–{svc.to}</div>
              </div>
            </div>
          ))}

          {HOURS[activeDay].open && (
            <div style={{ padding:"14px 20px", borderTop:"1px solid var(--lk-border)" }}>
              <button style={{
                width:"100%", padding:"10px", borderRadius:"var(--radius)",
                border:"1px dashed var(--lk-border-strong)", background:"transparent",
                fontSize:13, fontWeight:500, color:"var(--lk-text-secondary)",
                display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6,
              }}><I.Plus size={13} sw={2.4}/>Ajouter un service</button>
            </div>
          )}
        </Card>

        <Card padded={false} style={{ padding:"16px 18px" }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>Aperçu de la semaine</div>
          <p style={{ fontSize:12, color:"var(--lk-text-muted)", marginBottom:14 }}>
            Chaque ligne = un jour, chaque bloc = un service. Cette vue est partagée avec votre widget.
          </p>
          {DAYS.map(d => {
            const c = HOURS[d];
            return (
              <div key={d} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <div style={{ width:38, fontSize:11, fontWeight:500, color:"var(--lk-text-muted)" }}>{d.slice(0,3)}</div>
                <div style={{ flex:1, height:14, background:"var(--lk-surface-2)", borderRadius:4, position:"relative", overflow:"hidden" }}>
                  {c.open && c.services.map((s, i) => {
                    const start = (parseInt(s.from.slice(0,2)) + parseInt(s.from.slice(3,5))/60) / 24 * 100;
                    const end = (parseInt(s.to.slice(0,2)) + parseInt(s.to.slice(3,5))/60) / 24 * 100;
                    return <div key={i} style={{ position:"absolute", left:`${start}%`, width:`${end-start}%`, top:2, bottom:2, background:"var(--lk-primary)", borderRadius:3, opacity:0.85 }}/>;
                  })}
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

function Toggle({ checked }) {
  return (
    <span style={{
      position:"relative", display:"inline-block", width:36, height:20,
      background: checked ? "var(--lk-primary)" : "var(--lk-surface-3)",
      borderRadius:"var(--radius-full)",
      transition:"background var(--t)",
    }}>
      <span style={{
        position:"absolute", top:2, left: checked ? 18 : 2,
        width:16, height:16, borderRadius:"50%",
        background:"white", boxShadow:"var(--shadow-xs)", transition:"left var(--t)",
      }}/>
    </span>
  );
}

window.ScreenHours = ScreenHours;
