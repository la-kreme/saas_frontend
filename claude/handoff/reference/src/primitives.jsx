/* Primitive components — LkLogo, Button, Card, Badge, Avatar */

function LkLogo({ size = 24, color = "var(--lk-primary)", style }) {
  return (
    <span className="lk-logo" style={{ fontSize: size, color, ...style }}>
      <span className="le">le</span>
      <span>koulis</span>
    </span>
  );
}

function Button({ variant = "primary", size = "md", children, icon, iconRight, style, ...rest }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    fontWeight: 600, letterSpacing: "-0.005em", whiteSpace: "nowrap", border: "1px solid transparent",
    borderRadius: "var(--radius)", transition: "all var(--t-fast)", cursor: "pointer",
  };
  const sizes = {
    sm: { height: 32, padding: "0 12px", fontSize: 12.5 },
    md: { height: 38, padding: "0 16px", fontSize: 13.5 },
    lg: { height: 44, padding: "0 22px", fontSize: 14.5 },
  };
  const variants = {
    primary:   { background:"var(--lk-primary)", color:"white", boxShadow:"0 1px 0 rgba(255,255,255,0.25) inset, var(--shadow-sm)" },
    secondary: { background:"white", color:"var(--lk-text-primary)", borderColor:"var(--lk-border-strong)" },
    ghost:     { background:"transparent", color:"var(--lk-text-secondary)" },
    soft:      { background:"var(--lk-primary-soft)", color:"var(--lk-primary-strong)" },
    sky:       { background:"var(--lk-secondary)", color:"white" },
    danger:    { background:"var(--lk-error-tint)", color:"var(--lk-error)", borderColor:"rgba(239,68,68,0.25)" },
  };
  return (
    <button {...rest}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      onMouseEnter={(e) => {
        if (variant === "primary") { e.currentTarget.style.background = "var(--lk-primary-medium)"; }
        if (variant === "secondary") { e.currentTarget.style.borderColor = "var(--lk-text-primary)"; e.currentTarget.style.background = "var(--lk-surface-1)"; }
        if (variant === "ghost") { e.currentTarget.style.background = "var(--lk-surface-2)"; e.currentTarget.style.color = "var(--lk-text-primary)"; }
        rest.onMouseEnter && rest.onMouseEnter(e);
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, { ...base, ...sizes[size], ...variants[variant], ...style });
        rest.onMouseLeave && rest.onMouseLeave(e);
      }}>
      {icon}
      {children}
      {iconRight}
    </button>
  );
}

function Badge({ tone = "neutral", icon, children, style }) {
  const tones = {
    neutral:  { background:"var(--lk-surface-2)", color:"var(--lk-text-secondary)", border:"1px solid var(--lk-border)" },
    primary:  { background:"var(--lk-primary-soft)", color:"var(--lk-primary-strong)" },
    success:  { background:"var(--lk-success-tint)", color:"var(--lk-success)" },
    warning:  { background:"var(--lk-warning-tint)", color:"var(--lk-warning)" },
    error:    { background:"var(--lk-error-tint)", color:"var(--lk-error)" },
    sky:      { background:"var(--lk-secondary-tint)", color:"var(--lk-secondary-strong)" },
    beta:     { background:"rgba(34,197,94,0.10)", color:"var(--lk-success)", border:"1px solid rgba(34,197,94,0.25)" },
  };
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:6,
      fontSize:11, fontWeight:600, letterSpacing:"0.02em",
      padding:"3px 9px", borderRadius:"var(--radius-full)",
      ...tones[tone], ...style
    }}>
      {icon}
      {children}
    </span>
  );
}

function Card({ children, padded = true, style, hover = false, ...rest }) {
  return (
    <div {...rest} style={{
      background:"var(--lk-bg-card)",
      border:"1px solid var(--lk-border)",
      borderRadius:"var(--radius-lg)",
      padding: padded ? "var(--space-6)" : 0,
      boxShadow:"var(--shadow-xs)",
      transition:"all var(--t)",
      ...(hover ? { cursor:"pointer" } : {}),
      ...style,
    }}>{children}</div>
  );
}

function PageHeader({ title, subtitle, eyebrow, actions, style }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:24, marginBottom:24, ...style }}>
      <div style={{ minWidth:0 }}>
        {eyebrow && <div style={{ fontSize:11, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--lk-text-muted)", marginBottom:6 }}>{eyebrow}</div>}
        <h1 style={{ fontSize:26, fontWeight:700, letterSpacing:"-0.025em", lineHeight:1.1, color:"var(--lk-text-primary)" }}>{title}</h1>
        {subtitle && <p style={{ fontSize:14, color:"var(--lk-text-muted)", marginTop:4, textWrap:"pretty" }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>{actions}</div>}
    </div>
  );
}

function Avatar({ name, size = 32, style }) {
  const initials = (name || "?").split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase();
  // deterministic pastel hue from name
  let h = 0; for (const c of (name || "")) h = (h * 31 + c.charCodeAt(0)) % 360;
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%",
      background:`oklch(0.92 0.04 ${h})`, color:`oklch(0.32 0.05 ${h})`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize: size * 0.38, fontWeight:600, letterSpacing:"-0.01em",
      flexShrink:0,
      ...style
    }}>
      {initials}
    </div>
  );
}

function SourceTag({ source }) {
  // widget / agent / phone
  const map = {
    widget: { label:"Widget", color:"var(--lk-primary-strong)", bg:"var(--lk-primary-soft)" },
    agent:  { label:"Agent IA", color:"#D97757",                 bg:"#FCE7DD" },
    phone:  { label:"Téléphone", color:"var(--lk-text-secondary)", bg:"var(--lk-surface-2)" },
  };
  const m = map[source] || map.widget;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      fontSize:10.5, fontWeight:600, padding:"2px 7px", borderRadius:"var(--radius-full)",
      background:m.bg, color:m.color, letterSpacing:"0.02em"
    }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:m.color }} />
      {m.label}
    </span>
  );
}

function StatusPill({ status }) {
  const map = {
    confirmed: { label:"Confirmée", tone:"success" },
    pending:   { label:"En attente", tone:"warning" },
    cancelled: { label:"Annulée", tone:"error" },
    no_show:   { label:"No-show", tone:"neutral" },
  };
  const m = map[status] || map.confirmed;
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

function Kbd({ children }) {
  return (
    <kbd style={{
      display:"inline-flex", alignItems:"center", justifyContent:"center", minWidth:18, height:18,
      padding:"0 5px", fontSize:10.5, fontFamily:"'JetBrains Mono', monospace",
      background:"white", border:"1px solid var(--lk-border-strong)",
      borderBottomWidth:2, borderRadius:5, color:"var(--lk-text-secondary)",
    }}>{children}</kbd>
  );
}

Object.assign(window, { LkLogo, Button, Badge, Card, PageHeader, Avatar, SourceTag, StatusPill, Kbd });
