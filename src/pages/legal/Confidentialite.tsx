const LAST_UPDATED = '28 avril 2026';
const CONTACT_EMAIL = 'privacy@koulis.app';

export default function Confidentialite() {
  return (
    <main className="lk-legal-page">
      <header className="lk-legal-header">
        <a href="/" className="lk-legal-back">← Retour</a>
        <h1 className="lk-legal-title">Politique de confidentialite</h1>
        <p className="lk-legal-date">Derniere mise a jour : {LAST_UPDATED}</p>
      </header>

      <section className="lk-legal-section">
        <p>La presente politique decrit la facon dont MGroupe, editeur de l'application <strong>koulis.app</strong> commercialisee sous la marque <em>Koulis</em> (ci-apres le &laquo; Service &raquo;), traite les donnees personnelles des utilisateurs. Elle est conforme au Reglement general sur la protection des donnees (RGPD) et a la loi francaise Informatique et Libertes.</p>
        <p>Koulis est un outil de reservation destine aux restaurateurs independants. Le Service comprend un tableau de bord de gestion, un widget de reservation integrable au site du restaurant et un serveur MCP (Model Context Protocol) open source qui expose des connecteurs ouverts permettant a tout agent conversationnel ou outil tiers d'interroger et de gerer des reservations. MGroupe ne diffuse aucune publicite et ne vend aucune donnee personnelle.</p>
      </section>

      <h2 className="lk-legal-h2">1. Responsable du traitement</h2>
      <div className="lk-legal-infobox">
        <p><strong>MGroupe</strong>, micro-entreprise immatriculee au nom de Massimo Marcellin, exploitant la marque <em>Koulis</em>.</p>
        <p>Siege : 3 Avenue Francois Mitterrand, 59290 Wasquehal, France.</p>
        <p>SIRET : 100 354 513 00010.</p>
        <p>Contact : <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
      </div>
      <p className="lk-legal-note">Compte tenu de la taille de la structure, MGroupe n'est pas tenue de designer un delegue a la protection des donnees. Toutes les demandes liees aux donnees personnelles sont traitees directement par le responsable du traitement a l'adresse ci-dessus.</p>

      <h2 className="lk-legal-h2">2. Donnees collectees</h2>
      <p>MGroupe collecte uniquement les donnees strictement necessaires au fonctionnement du Service.</p>

      <h3 className="lk-legal-h3">2.1 Lors de la creation de compte (Google OAuth)</h3>
      <p>Lorsqu'un utilisateur se connecte via Google, MGroupe recoit, par l'intermediaire des scopes <code>openid</code>, <code>email</code> et <code>profile</code>, les informations suivantes : identifiant Google unique, adresse email, prenom, nom, photo de profil et locale. Ces donnees ne sont jamais utilisees a d'autres fins que l'authentification et l'identification au sein du Service. MGroupe n'accede ni a Gmail, ni a Google Calendar, ni a Google Drive, ni a aucun autre service Google.</p>

      <h3 className="lk-legal-h3">2.2 Donnees generees par l'usage du Service</h3>
      <p>En fonction de l'utilisation du Service, peuvent etre enregistres : les etablissements crees et leur configuration, les parametres du widget de reservation, l'historique des reservations, les requetes adressees au serveur MCP, les logs techniques d'API ainsi que les coordonnees des convives strictement necessaires a la prise de reservation (nom, telephone et/ou email, taille du groupe, creneau, commentaires eventuels). Les coordonnees des convives sont traitees pour le compte du restaurateur, qui en demeure le responsable de traitement principal.</p>

      <h3 className="lk-legal-h3">2.3 Donnees de mesure d'audience produit</h3>
      <p>A l'interieur du tableau de bord utilisateur (zone authentifiee), Koulis utilise <strong>PostHog</strong> pour mesurer l'utilisation des fonctionnalites produit (clics, parcours, erreurs). Cette mesure d'audience est strictement interne, n'est jamais partagee avec des annonceurs et ne sert pas a du ciblage publicitaire. Aucun cookie de tracage publicitaire tiers n'est pose par MGroupe.</p>

      <h2 className="lk-legal-h2">3. Finalites et bases legales</h2>
      <div className="lk-legal-table-wrap">
        <table className="lk-legal-table">
          <thead>
            <tr><th>Finalite</th><th>Base legale</th></tr>
          </thead>
          <tbody>
            <tr><td>Creation et gestion du compte utilisateur</td><td>Execution du contrat (CGU)</td></tr>
            <tr><td>Fourniture du tableau de bord, du widget et du serveur MCP</td><td>Execution du contrat</td></tr>
            <tr><td>Communications operationnelles (email transactionnels)</td><td>Execution du contrat</td></tr>
            <tr><td>Mesure d'audience produit (PostHog) au sein du dashboard</td><td>Interet legitime a ameliorer le Service</td></tr>
            <tr><td>Securite, prevention de la fraude et journalisation</td><td>Interet legitime</td></tr>
            <tr><td>Respect des obligations comptables et fiscales</td><td>Obligation legale</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="lk-legal-h2">4. Durees de conservation</h2>
      <p>Les donnees de compte sont conservees tant que le compte utilisateur est actif, puis supprimees dans un delai maximal de 30 jours apres la cloture du compte, a l'exception des donnees necessaires au respect d'obligations legales (comptables, fiscales) qui sont conservees jusqu'a 10 ans en archivage intermediaire.</p>
      <p>Les logs techniques sont conserves 12 mois maximum. Les evenements PostHog sont conserves 12 mois puis agreges ou supprimes. Les reservations sont conservees 36 mois pour permettre les statistiques d'etablissement, sauf demande de suppression anterieure du restaurateur ou de la personne concernee.</p>

      <h2 className="lk-legal-h2">5. Sous-traitants et destinataires</h2>
      <p>Pour fournir le Service, MGroupe s'appuie sur les sous-traitants suivants. Chacun est lie par un accord de sous-traitance conforme a l'article 28 du RGPD.</p>
      <div className="lk-legal-table-wrap">
        <table className="lk-legal-table">
          <thead>
            <tr><th>Sous-traitant</th><th>Role</th><th>Localisation</th></tr>
          </thead>
          <tbody>
            <tr><td>Google Ireland Ltd.</td><td>Authentification (OAuth 2.0)</td><td>UE / Etats-Unis (DPF)</td></tr>
            <tr><td>Supabase Inc.</td><td>Authentification, base de donnees, stockage</td><td>UE (region Francfort)</td></tr>
            <tr><td>Cloudflare Inc.</td><td>CDN, DNS, protection</td><td>Mondial (DPF)</td></tr>
            <tr><td>Railway Corp.</td><td>Hebergement applicatif backend</td><td>Etats-Unis (DPF)</td></tr>
            <tr><td>PostHog Inc.</td><td>Mesure d'audience produit</td><td>UE (option EU Cloud)</td></tr>
          </tbody>
        </table>
      </div>
      <p className="lk-legal-note">Lorsqu'un transfert hors UE a lieu, il est encadre par les Clauses contractuelles types de la Commission europeenne et, le cas echeant, par l'adhesion du sous-traitant au cadre <em>Data Privacy Framework</em> (DPF) UE-Etats-Unis.</p>

      <h2 className="lk-legal-h2">6. Vos droits</h2>
      <p>Conformement aux articles 15 a 22 du RGPD, vous disposez d'un droit d'acces, de rectification, d'effacement, de limitation, d'opposition et de portabilite sur vos donnees. Vous pouvez egalement definir des directives relatives a leur sort apres votre deces.</p>
      <p>Pour exercer ces droits, ecrivez a <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. MGroupe repond dans un delai maximal d'un mois. En cas de desaccord, vous pouvez adresser une reclamation a la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noreferrer">cnil.fr</a>).</p>

      <h2 className="lk-legal-h2">7. Securite</h2>
      <p>Les donnees sont chiffrees en transit (TLS 1.2 ou superieur) et au repos chez Supabase. L'acces aux systemes de production est restreint et journalise. MGroupe procede regulierement a des revues de dependances et a une rotation des secrets. En cas de violation de donnees susceptible d'engendrer un risque pour les personnes concernees, MGroupe notifiera la CNIL dans les 72 heures et informera, le cas echeant, les utilisateurs concernes.</p>

      <h2 className="lk-legal-h2">8. Cookies</h2>
      <p>Le Service utilise uniquement des cookies strictement necessaires (session d'authentification Supabase, preference d'interface). Aucun cookie publicitaire ni cookie de mesure d'audience tiers n'est depose sur la partie publique du site. Les evenements PostHog sont collectes apres authentification, dans le cadre de la mesure d'audience produit decrite a l'article 2.3.</p>

      <h2 className="lk-legal-h2">9. Limitation d'usage des donnees Google</h2>
      <p>L'utilisation par Koulis des informations recues des API Google respecte la <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">Google API Services User Data Policy</a>, y compris les exigences relatives a l'usage limite (Limited Use). Les donnees Google ne sont jamais transferees a des tiers a des fins publicitaires, ne sont jamais utilisees pour de la publicite ciblee et ne sont jamais lues par un humain, sauf consentement explicite de l'utilisateur, necessite operationnelle stricte (securite, support) ou obligation legale.</p>

      <h2 className="lk-legal-h2">10. Modifications</h2>
      <p>MGroupe peut faire evoluer la presente politique. Toute modification substantielle sera notifiee aux utilisateurs par email ou par une banniere dans le Service au moins 15 jours avant son entree en vigueur.</p>

      <footer className="lk-legal-footer">
        <p>Pour toute question relative a cette politique, ecrire a <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
      </footer>
    </main>
  );
}
