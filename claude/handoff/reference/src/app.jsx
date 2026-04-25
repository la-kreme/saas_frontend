/* Root app — wires everything together + tweaks */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "comfortable",
  "sidebarCollapsed": false,
  "emptyState": false,
  "accentHue": 340
}/*EDITMODE-END*/;

function App() {
  const [page, setPage] = React.useState("today");
  const [drawer, setDrawer] = React.useState(null);
  const [cmdk, setCmdk] = React.useState(false);
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdk(true); }
      if (e.key === "Escape") { setCmdk(false); setDrawer(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Apply accent tweak
  React.useEffect(() => {
    const root = document.documentElement;
    const h = tweaks.accentHue;
    if (h !== 340) {
      // recompute primary on the fly with hue shift
      root.style.setProperty("--lk-primary", `oklch(0.7 0.14 ${h})`);
      root.style.setProperty("--lk-primary-medium", `oklch(0.62 0.14 ${h})`);
      root.style.setProperty("--lk-primary-strong", `oklch(0.52 0.14 ${h})`);
      root.style.setProperty("--lk-primary-soft", `oklch(0.92 0.06 ${h})`);
      root.style.setProperty("--lk-primary-tint", `oklch(0.7 0.14 ${h} / 0.08)`);
    } else {
      root.style.setProperty("--lk-primary", "#ED73A9");
      root.style.setProperty("--lk-primary-medium", "#D66E90");
      root.style.setProperty("--lk-primary-strong", "#C6546D");
      root.style.setProperty("--lk-primary-soft", "#FBD0E4");
      root.style.setProperty("--lk-primary-tint", "rgba(237, 115, 169, 0.08)");
    }
  }, [tweaks.accentHue]);

  const titles = {
    today: "Aujourd'hui",
    reservations: "Réservations",
    floor: "Plan de salle",
    hours: "Horaires",
    widget: "Mon widget",
    settings: "Paramètres",
    mypage: "Ma page LK",
  };

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:"var(--lk-bg-main)" }}>
      <Sidebar current={page} onNav={setPage} collapsed={tweaks.sidebarCollapsed} density={tweaks.density}/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        <Topbar pageTitle={titles[page]} onCmdK={()=>setCmdk(true)} onNew={()=>{}}/>
        <main className="lk-scroll" style={{ flex:1, overflowY:"auto" }} data-screen-label={`${page}`}>
          {page === "today"        && <ScreenToday density={tweaks.density} emptyState={tweaks.emptyState} onOpenReservation={setDrawer}/>}
          {page === "reservations" && <ScreenReservations onOpen={setDrawer}/>}
          {page === "floor"        && <ScreenFloor/>}
          {page === "hours"        && <ScreenHours/>}
          {page === "widget"       && <ScreenWidget/>}
          {page === "settings"     && <ScreenSettings/>}
          {page === "mypage"       && <ScreenMyPage/>}
        </main>
      </div>

      <ResaDrawer resa={drawer} onClose={()=>setDrawer(null)}/>
      <CmdK open={cmdk} onClose={()=>setCmdk(false)} onJump={setPage}/>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Layout">
          <TweakRadio label="Densité" value={tweaks.density} onChange={(v)=>setTweak("density", v)}
            options={[{value:"compact", label:"Compact"}, {value:"comfortable", label:"Confort."}]} />
          <TweakToggle label="Sidebar réduite" value={tweaks.sidebarCollapsed} onChange={(v)=>setTweak("sidebarCollapsed", v)}/>
        </TweakSection>
        <TweakSection title="Couleur">
          <TweakSlider label="Teinte d'accent" min={0} max={360} step={5} value={tweaks.accentHue} onChange={(v)=>setTweak("accentHue", v)}/>
        </TweakSection>
        <TweakSection title="État">
          <TweakToggle label="Empty state (resto qui démarre)" value={tweaks.emptyState} onChange={(v)=>setTweak("emptyState", v)}/>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(<App/>);
