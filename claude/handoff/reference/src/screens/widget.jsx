/* Widget — share link + live preview + customisation */

function ScreenWidget() {
  const [color, setColor] = React.useState("#ED73A9");
  const colors = ["#ED73A9","#7CC0E8","#C6546D","#5BADE0","#F59E0B","#22C55E","#A855F7"];
  const url = "https://book.koulis.app/agrum";

  return (
    <div style={{ padding:"28px 32px 80px", maxWidth:1440, margin:"0 auto" }} className="lk-animate-up">
      <PageHeader
        title="Mon widget de réservation"
        subtitle="Votre page publique de réservation. Partagez le lien, ou intégrez-le dans votre site."
        actions={
          <Button variant="secondary" size="md" icon={<I.Open size={14} sw={2}/>}>Tester comme un client</Button>
        }
      />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.05fr", gap:18, alignItems:"flex-start" }}>
        {/* Left: config */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Card padded={false} style={{
            padding:"18px 20px",
            background:"linear-gradient(135deg, white 0%, var(--lk-primary-soft) 130%)",
            border:"1px solid rgba(237,115,169,0.25)",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <I.Bookmark size={15} stroke="var(--lk-primary-strong)" sw={2}/>
              <span style={{ fontSize:13.5, fontWeight:600 }}>Votre page de réservation</span>
            </div>
            <p style={{ fontSize:12.5, color:"var(--lk-text-secondary)", marginBottom:14, lineHeight:1.5 }}>
              Mettez ce lien dans votre bio Instagram, Google Maps, votre site web — ou créez un bouton "Réserver" qui pointe dessus.
            </p>
            <div style={{ display:"flex", gap:6, marginBottom:10 }}>
              <input value={url} readOnly style={{
                flex:1, height:38, padding:"0 12px", fontSize:13,
                fontFamily:"'JetBrains Mono', monospace",
                border:"1px solid var(--lk-border)", borderRadius:"var(--radius)",
                background:"white", color:"var(--lk-primary-strong)",
              }}/>
              <Button variant="primary" size="md" icon={<I.Copy size={13} sw={2}/>}>Copier</Button>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:"var(--lk-text-muted)" }}>
              <Button variant="sky" size="sm" icon={<I.Open size={12} sw={2}/>}>Ouvrir la page</Button>
              <span>· Partageable sur tous les canaux</span>
            </div>
          </Card>

          <Card padded={false} style={{ padding:"18px 20px" }}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:14, display:"inline-flex", alignItems:"center", gap:8 }}>
              <span>Apparence</span>
            </div>
            <Field label="Couleur principale">
              <div style={{ display:"flex", gap:8, marginTop:4 }}>
                {colors.map(c => (
                  <button key={c} onClick={()=>setColor(c)} style={{
                    width:30, height:30, borderRadius:"50%", background:c,
                    border: color===c ? "3px solid white" : "3px solid transparent",
                    boxShadow: color===c ? `0 0 0 2px ${c}` : "var(--shadow-xs)",
                    transition:"all var(--t-fast)",
                  }}/>
                ))}
              </div>
            </Field>
            <div style={{ marginTop:14 }}><Field label="Message de bienvenue (FR)">
              <textarea defaultValue="Bienvenue ! Réservez votre table chez Agrùm." rows={2}
                style={{ ...inputStyle, height:"auto", padding:"8px 10px", resize:"none" }}/>
            </Field></div>
            <div style={{ marginTop:10 }}><Field label="Message de bienvenue (EN)">
              <textarea defaultValue="Welcome! Book your table at Agrùm." rows={2}
                style={{ ...inputStyle, height:"auto", padding:"8px 10px", resize:"none" }}/>
            </Field></div>
          </Card>

          <Card padded={false} style={{ padding:"18px 20px" }}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:8 }}>Intégrer dans mon site</div>
            <p style={{ fontSize:12.5, color:"var(--lk-text-muted)", marginBottom:12 }}>
              Collez ce code juste avant la balise <code style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:11.5, padding:"1px 5px", background:"var(--lk-surface-2)", borderRadius:4 }}>{`</body>`}</code> de votre site.
            </p>
            <div style={{
              fontFamily:"'JetBrains Mono', monospace", fontSize:11.5, lineHeight:1.65,
              background:"#152823", color:"#E8EDED", padding:"14px 16px",
              borderRadius:"var(--radius)", overflow:"auto", whiteSpace:"pre",
              position:"relative",
            }}>{`<script src="https://cdn.koulis.app/widget.js"
        data-restaurant="agrum"
        data-color="${color}"
        defer></script>`}
              <button style={{
                position:"absolute", top:10, right:10,
                padding:"4px 8px", fontSize:11, color:"#E8EDED",
                background:"rgba(255,255,255,0.08)", borderRadius:5,
                display:"inline-flex", alignItems:"center", gap:4,
              }}><I.Copy size={11}/>Copier</button>
            </div>
          </Card>
        </div>

        {/* Right: live preview phone */}
        <div style={{ position:"sticky", top:90 }}>
          <div style={{
            background:"var(--lk-surface-2)", border:"1px solid var(--lk-border)",
            borderRadius:"var(--radius-xl)", padding:24,
          }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <span style={{ fontSize:11.5, fontWeight:600, color:"var(--lk-text-muted)", letterSpacing:"0.06em", textTransform:"uppercase" }}>Aperçu en direct</span>
              <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11, color:"var(--lk-success)", fontWeight:600 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--lk-success)" }}/>Synchronisé
              </span>
            </div>
            {/* fake widget */}
            <div style={{
              background:"white", borderRadius:"var(--radius-lg)",
              border:"1px solid var(--lk-border)", padding:"22px 22px",
              boxShadow:"var(--shadow)",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:`linear-gradient(135deg, ${color}, var(--lk-secondary))`, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontStyle:"italic" }}>Ag</div>
                <div>
                  <div style={{ fontSize:15, fontWeight:700 }}>{RESTAURANT.name}</div>
                  <div style={{ fontSize:12, color:"var(--lk-text-muted)" }}>{RESTAURANT.type} · {RESTAURANT.city}</div>
                </div>
              </div>
              <div style={{ fontSize:13, color:"var(--lk-text-secondary)", marginBottom:18, lineHeight:1.5 }}>
                Bienvenue ! Réservez votre table chez Agrùm.
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
                <FakeField label="Date" value="Sam. 25 avr."/>
                <FakeField label="Heure" value="20:00"/>
                <FakeField label="Pers." value="2"/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:6, marginBottom:14 }}>
                {["19:30","19:45","20:00","20:15","20:30","20:45","21:00","21:15"].map((t,i) => (
                  <div key={t} style={{
                    padding:"8px 0", textAlign:"center", fontSize:12.5, fontWeight:500,
                    background: i===2 ? color : "white",
                    color: i===2 ? "white" : "var(--lk-text-secondary)",
                    border:"1px solid", borderColor: i===2 ? color : "var(--lk-border)",
                    borderRadius:"var(--radius-sm)",
                    fontVariantNumeric:"tabular-nums",
                  }}>{t}</div>
                ))}
              </div>
              <button style={{
                width:"100%", height:42, borderRadius:"var(--radius)",
                background:color, color:"white", fontSize:14, fontWeight:600,
                display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6,
              }}>Réserver <I.ArrowRight size={14} sw={2.4}/></button>
              <div style={{ marginTop:14, fontSize:11, color:"var(--lk-text-muted)", textAlign:"center" }}>
                Propulsé par <span style={{ fontStyle:"italic", fontWeight:600, color:"var(--lk-primary)" }}>le koulis</span> · 0 commission
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FakeField({ label, value }) {
  return (
    <div style={{ padding:"8px 10px", border:"1px solid var(--lk-border)", borderRadius:"var(--radius-sm)" }}>
      <div style={{ fontSize:10, color:"var(--lk-text-muted)", marginBottom:2 }}>{label}</div>
      <div style={{ fontSize:12.5, fontWeight:500 }}>{value}</div>
    </div>
  );
}

window.ScreenWidget = ScreenWidget;
