/* Topbar — breadcrumb + global search + actions */

function Topbar({ pageTitle, onSearch, onNew, onCmdK }) {
  return (
    <header style={{
      height:"var(--topbar-h)",
      borderBottom:"1px solid var(--lk-border)",
      background:"rgba(255,251,245,0.85)",
      backdropFilter:"blur(8px)",
      WebkitBackdropFilter:"blur(8px)",
      display:"flex", alignItems:"center",
      padding:"0 24px", gap:16,
      flexShrink:0, position:"sticky", top:0, zIndex:5,
    }}>
      {/* Breadcrumb */}
      <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"var(--lk-text-muted)", flexShrink:0 }}>
        <span>{RESTAURANT.name}</span>
        <I.ChevronRight size={12} sw={2} />
        <span style={{ color:"var(--lk-text-primary)", fontWeight:500 }}>{pageTitle}</span>
      </div>

      {/* Search (cmd+k) */}
      <button onClick={onCmdK} style={{
        flex:1, maxWidth:480, marginLeft:24,
        height:36, padding:"0 12px",
        display:"flex", alignItems:"center", gap:10,
        background:"var(--lk-surface-2)",
        border:"1px solid var(--lk-border)",
        borderRadius:"var(--radius)",
        color:"var(--lk-text-muted)", fontSize:13,
        textAlign:"left",
      }}>
        <I.Search size={14} sw={2} />
        <span style={{ flex:1 }}>Rechercher un client, une réservation…</span>
        <Kbd>⌘</Kbd><Kbd>K</Kbd>
      </button>

      {/* Right cluster */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:"auto", flexShrink:0 }}>
        <Badge tone="beta" icon={<I.Bolt size={10} fill="currentColor" />}>Beta</Badge>
        <button title="Notifications" style={{
          width:36, height:36, borderRadius:"var(--radius)",
          display:"flex", alignItems:"center", justifyContent:"center",
          color:"var(--lk-text-secondary)", background:"transparent",
          border:"1px solid transparent", position:"relative",
        }}
        onMouseEnter={(e)=>{ e.currentTarget.style.background="var(--lk-surface-2)"; }}
        onMouseLeave={(e)=>{ e.currentTarget.style.background="transparent"; }}>
          <I.Bell size={16} sw={1.8} />
          <span style={{ position:"absolute", top:8, right:8, width:7, height:7, borderRadius:"50%", background:"var(--lk-primary)", border:"2px solid var(--lk-bg-main)" }} />
        </button>
        <Button variant="primary" size="md" icon={<I.Plus size={14} sw={2.4} />} onClick={onNew}>
          Nouvelle résa
        </Button>
      </div>
    </header>
  );
}

window.Topbar = Topbar;
