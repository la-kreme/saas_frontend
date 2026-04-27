/* Settings — clean grouped form */

function ScreenSettings() {
  return (
    <div style={{ padding:"28px 32px 80px", maxWidth:880, margin:"0 auto" }} className="lk-animate-up">
      <PageHeader
        title="Paramètres"
        subtitle="Configuration avancée de votre widget de réservation."
        actions={<Button variant="primary" size="md" icon={<I.Save size={14} sw={2}/>}>Enregistrer</Button>}
      />

      <SettingGroup title="Notifications" subtitle="Recevez les alertes de nouvelles réservations.">
        <Field label="Email de notification">
          <input defaultValue={RESTAURANT.email} type="email" style={inputStyle}/>
        </Field>
        <Field label="Téléphone (SMS)">
          <input defaultValue={RESTAURANT.phone} type="tel" style={inputStyle}/>
        </Field>
        <ToggleRow label="Confirmer immédiatement par email" checked={true}/>
        <ToggleRow label="SMS pour les résa de plus de 5 personnes" checked={true}/>
        <ToggleRow label="Notification push mobile" checked={false}/>
      </SettingGroup>

      <SettingGroup title="Règles de réservation" subtitle="Définissez les contraintes pour vos clients.">
        <SliderRow label="Délai minimum d'annulation" value="2h" hint="Un client peut annuler jusqu'à 2 h avant sa réservation."/>
        <SliderRow label="Horizon de réservation" value="30 j" hint="Les clients peuvent réserver jusqu'à 30 jours à l'avance."/>
        <Field label="Mode de confirmation">
          <select style={inputStyle} defaultValue="manual">
            <option value="auto">Automatique</option>
            <option value="manual">Manuel — je valide chaque résa</option>
            <option value="hybrid">Hybride — auto si moins de 4 pers.</option>
          </select>
        </Field>
      </SettingGroup>

      <SettingGroup title="No-show & garanties" subtitle="Réduisez l'impact des no-shows.">
        <ToggleRow label="Demander une empreinte CB pour les groupes ≥ 6" checked={false} premium/>
        <ToggleRow label="Rappel automatique 24h avant la réservation" checked={true}/>
        <Field label="Frais de no-show">
          <input defaultValue="20 € / personne" style={inputStyle}/>
        </Field>
      </SettingGroup>

      <SettingGroup title="Zone dangereuse" danger subtitle="Actions irréversibles.">
        <ToggleRow label="Mettre le widget en pause" checked={false} hint="Les clients verront « réservations temporairement fermées »."/>
        <div>
          <Button variant="danger" size="md" icon={<I.Trash size={13} sw={2}/>}>Supprimer mon compte</Button>
        </div>
      </SettingGroup>
    </div>
  );
}

function SettingGroup({ title, subtitle, children, danger }) {
  return (
    <Card padded={false} style={{
      padding:"22px 24px", marginBottom:14,
      borderColor: danger ? "rgba(239,68,68,0.2)" : undefined,
    }}>
      <div style={{ marginBottom:18 }}>
        <h2 style={{ fontSize:15, fontWeight:600, marginBottom:3, color: danger ? "var(--lk-error)" : "var(--lk-text-primary)" }}>{title}</h2>
        {subtitle && <p style={{ fontSize:12.5, color:"var(--lk-text-muted)" }}>{subtitle}</p>}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>{children}</div>
    </Card>
  );
}

function ToggleRow({ label, checked, hint, premium }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:14 }}>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13.5, fontWeight:500, display:"inline-flex", alignItems:"center", gap:8 }}>
          {label}
          {premium && <Badge tone="primary"><I.Sparkles size={10} sw={2}/>Premium</Badge>}
        </div>
        {hint && <div style={{ fontSize:12, color:"var(--lk-text-muted)", marginTop:3 }}>{hint}</div>}
      </div>
      <Toggle checked={checked}/>
    </div>
  );
}

function SliderRow({ label, value, hint }) {
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontSize:13.5, fontWeight:500 }}>{label}</span>
        <span style={{ fontSize:13, fontWeight:600, color:"var(--lk-primary-strong)", fontVariantNumeric:"tabular-nums" }}>{value}</span>
      </div>
      <div style={{ position:"relative", height:6, background:"var(--lk-surface-3)", borderRadius:3 }}>
        <div style={{ position:"absolute", left:0, width:"40%", height:"100%", background:"linear-gradient(90deg, var(--lk-primary-soft), var(--lk-primary))", borderRadius:3 }}/>
        <div style={{ position:"absolute", left:"40%", top:"50%", transform:"translate(-50%,-50%)", width:14, height:14, borderRadius:"50%", background:"white", border:"2px solid var(--lk-primary)", boxShadow:"var(--shadow-xs)" }}/>
      </div>
      {hint && <div style={{ fontSize:11.5, color:"var(--lk-text-muted)", marginTop:6 }}>{hint}</div>}
    </div>
  );
}

window.ScreenSettings = ScreenSettings;
