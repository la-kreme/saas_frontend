/* Ma page LK — placeholder for premium feature */

function ScreenMyPage() {
  return (
    <div style={{ padding:"28px 32px 80px", maxWidth:880, margin:"0 auto" }} className="lk-animate-up">
      <PageHeader
        title="Ma page LK"
        eyebrow="Premium"
        subtitle="Une page vitrine sur lekoulis.fr — référencée par les agents IA."
      />
      <Card padded={false} style={{
        padding:"40px 32px", textAlign:"center",
        background:"linear-gradient(135deg, var(--lk-primary-soft) 0%, var(--lk-secondary-tint) 100%)",
      }}>
        <Badge tone="primary" style={{ marginBottom:14 }}><I.Sparkles size={11} sw={2}/>Bientôt disponible</Badge>
        <h2 style={{ fontSize:22, fontWeight:700, letterSpacing:"-0.02em", marginBottom:8 }}>Votre vitrine sur le réseau Koulis</h2>
        <p style={{ fontSize:14, color:"var(--lk-text-secondary)", maxWidth:480, margin:"0 auto 22px", lineHeight:1.55 }}>
          Photos, menu, ambiance, tags. Vos clients vous trouvent depuis Claude, ChatGPT, Gemini.
        </p>
        <Button variant="primary" size="lg" iconRight={<I.ArrowRight size={14} sw={2.4}/>}>Activer</Button>
      </Card>
    </div>
  );
}

window.ScreenMyPage = ScreenMyPage;
