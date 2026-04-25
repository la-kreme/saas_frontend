/* Sidebar — refonte
   - Logo "le koulis" italic + restaurant name + linked badge
   - Grouped sections: Service, Configuration, Marque
   - Bottom: user + logout, system status pill
   - Active state: rose tint + left accent bar
*/

function Sidebar({ current, onNav, collapsed = false, density = "comfortable" }) {
  const groups = [
    { label: "Service", items: [
      { id:"today",  label:"Aujourd'hui",   icon:I.Home,    badge:12 },
      { id:"reservations", label:"Réservations", icon:I.Calendar },
      { id:"floor",  label:"Plan de salle", icon:I.Grid },
    ]},
    { label: "Configuration", items: [
      { id:"hours",   label:"Horaires",      icon:I.Clock },
      { id:"widget",  label:"Mon widget",    icon:I.Code },
      { id:"settings", label:"Paramètres",    icon:I.Settings },
    ]},
    { label: "Marque", items: [
      { id:"mypage",  label:"Ma page LK",    icon:I.Globe, premium:true },
    ]},
  ];

  const padY = density === "compact" ? 6 : 8;

  return (
    <aside style={{
      width: collapsed ? "var(--sidebar-w-collapsed)" : "var(--sidebar-w)",
      background: "var(--lk-bg-card)",
      borderRight: "1px solid var(--lk-border)",
      display:"flex", flexDirection:"column",
      flexShrink:0,
      transition: "width var(--t)",
      height: "100vh",
      position: "relative",
      zIndex: 10,
    }}>
      {/* Header — logo + restaurant */}
      <div style={{
        height:"var(--topbar-h)",
        padding: collapsed ? "0 12px" : "0 18px",
        display:"flex", alignItems:"center", gap:10,
        borderBottom:"1px solid var(--lk-border)",
      }}>
        {collapsed ? (
          <div style={{
            width:32, height:32, borderRadius:8, flexShrink:0,
            background:"var(--lk-primary)", color:"white",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontWeight:700, fontStyle:"italic", fontSize:15
          }}>k</div>
        ) : (
          <LkLogo size={22} />
        )}
      </div>

      {/* Restaurant card */}
      {!collapsed && (
        <div style={{ padding:"14px 12px 6px" }}>
          <button style={{
            width:"100%", display:"flex", alignItems:"center", gap:10,
            padding:"10px 10px", borderRadius:"var(--radius)",
            background:"var(--lk-surface-2)", border:"1px solid var(--lk-border)",
            textAlign:"left",
          }}>
            <div style={{
              width:32, height:32, borderRadius:8, flexShrink:0,
              background:"linear-gradient(135deg, #F4B8C9 0%, #A6D1F1 100%)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontWeight:700, color:"white", fontSize:13, letterSpacing:"-0.02em"
            }}>Ag</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, lineHeight:1.2 }}>{RESTAURANT.name}</div>
              <div style={{ fontSize:11, color:"var(--lk-text-muted)", display:"flex", alignItems:"center", gap:4, marginTop:2 }}>
                <span style={{ width:5, height:5, borderRadius:"50%", background:"var(--lk-success)" }} />
                en ligne · {RESTAURANT.city}
              </div>
            </div>
            <I.ChevronDown size={14} stroke="var(--lk-text-muted)" />
          </button>
        </div>
      )}

      {/* Nav groups */}
      <nav className="lk-scroll" style={{ flex:1, padding:"8px 8px", overflowY:"auto" }}>
        {groups.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 18 }}>
            {!collapsed && (
              <div style={{
                fontSize:10, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase",
                color:"var(--lk-text-muted)", padding:"8px 12px 6px",
              }}>{g.label}</div>
            )}
            {g.items.map(it => {
              const isActive = it.id === current;
              const Ic = it.icon;
              return (
                <button key={it.id} onClick={() => onNav(it.id)}
                  title={collapsed ? it.label : undefined}
                  style={{
                    width:"100%", display:"flex", alignItems:"center", gap:10,
                    padding: collapsed ? `${padY}px 0` : `${padY}px 12px`,
                    justifyContent: collapsed ? "center" : "flex-start",
                    borderRadius:"var(--radius)",
                    background: isActive ? "var(--lk-primary-tint)" : "transparent",
                    color: isActive ? "var(--lk-primary-strong)" : "var(--lk-text-secondary)",
                    fontSize:13.5, fontWeight: isActive ? 600 : 500,
                    border:"1px solid transparent",
                    borderColor: isActive ? "rgba(237,115,169,0.18)" : "transparent",
                    position:"relative",
                    marginBottom:2,
                    transition:"all var(--t-fast)"
                  }}
                  onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background="var(--lk-surface-2)"; e.currentTarget.style.color="var(--lk-text-primary)"; }}}
                  onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="var(--lk-text-secondary)"; }}}
                >
                  <Ic size={16} sw={isActive ? 2 : 1.8} />
                  {!collapsed && (
                    <>
                      <span style={{ flex:1, textAlign:"left" }}>{it.label}</span>
                      {it.badge && (
                        <span style={{
                          fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:"var(--radius-full)",
                          background: isActive ? "var(--lk-primary)" : "var(--lk-surface-3)",
                          color: isActive ? "white" : "var(--lk-text-secondary)"
                        }}>{it.badge}</span>
                      )}
                      {it.premium && (
                        <I.Star size={11} stroke="var(--lk-secondary-strong)" fill="var(--lk-secondary-tint)" sw={1.5} />
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: 10, borderTop:"1px solid var(--lk-border)" }}>
        {!collapsed && (
          <>
            <div style={{
              padding:"10px 12px",
              borderRadius:"var(--radius)",
              background:"linear-gradient(135deg, var(--lk-primary-soft) 0%, var(--lk-secondary-tint) 100%)",
              marginBottom:8, position:"relative", overflow:"hidden",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                <I.Sparkles size={12} stroke="var(--lk-primary-strong)" sw={2} />
                <span style={{ fontSize:10, fontWeight:700, color:"var(--lk-primary-strong)", letterSpacing:"0.04em" }}>AGENT IA · LIVE</span>
              </div>
              <div style={{ fontSize:11, color:"var(--lk-text-secondary)", lineHeight:1.45 }}>
                3 résas prises sur Claude cette semaine
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 4px" }}>
              <Avatar name={RESTAURANT.email} size={28} />
              <div style={{ flex:1, minWidth:0, fontSize:12, color:"var(--lk-text-muted)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {RESTAURANT.email}
              </div>
              <button title="Déconnexion" style={{ padding:6, borderRadius:6, color:"var(--lk-text-muted)" }}>
                <I.Logout size={14} />
              </button>
            </div>
          </>
        )}
        {collapsed && (
          <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"center" }}>
            <Avatar name={RESTAURANT.email} size={28} />
            <button title="Déconnexion" style={{ padding:6, borderRadius:6, color:"var(--lk-text-muted)" }}>
              <I.Logout size={14} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

window.Sidebar = Sidebar;
