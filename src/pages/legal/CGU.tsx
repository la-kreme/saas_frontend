const LAST_UPDATED = '28 avril 2026';
const CONTACT_EMAIL = 'contact@koulis.app';

export default function CGU() {
  return (
    <main className="lk-legal-page">
      <header className="lk-legal-header">
        <a href="/" className="lk-legal-back">← Retour</a>
        <h1 className="lk-legal-title">Conditions Generales d'Utilisation</h1>
        <p className="lk-legal-date">Derniere mise a jour : {LAST_UPDATED}</p>
      </header>

      <section className="lk-legal-section">
        <p>
          Les presentes Conditions Generales d'Utilisation (&laquo; CGU &raquo;)
          regissent l'acces et l'utilisation des services proposes par
          MGroupe sous la marque <strong>Koulis</strong>, accessibles via
          l'application <strong>koulis.app</strong>, le widget de
          reservation integrable et le serveur MCP open source associe
          (ci-apres le &laquo; Service &raquo;). En accedant au Service ou en creant un
          compte, l'Utilisateur reconnait avoir pris connaissance des
          presentes CGU et les accepter sans reserve.
        </p>
      </section>

      <h2 className="lk-legal-h2">1. Editeur du Service</h2>
      <div className="lk-legal-infobox">
        <p><strong>MGroupe</strong>, micro-entreprise immatriculee au nom de Massimo Marcellin, exploitant la marque <em>Koulis</em>.</p>
        <p>Siege : 3 Avenue Francois Mitterrand, 59290 Wasquehal, France.</p>
        <p>SIRET : 100 354 513 00010.</p>
        <p>TVA non applicable, article 293 B du Code general des impots.</p>
        <p>Contact : <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
        <p>Hebergement : Cloudflare Inc., Railway Corp., Supabase Inc.</p>
      </div>

      <h2 className="lk-legal-h2">2. Objet du Service</h2>
      <p>Koulis est un outil de reservation pour restaurateurs independants. Le Service comprend :</p>
      <ul className="lk-legal-list">
        <li>un <strong>tableau de bord</strong> de gestion des reservations et de configuration de l'etablissement ;</li>
        <li>un <strong>widget</strong> de reservation integrable au site du restaurant ;</li>
        <li>un <strong>serveur MCP open source</strong> exposant des connecteurs ouverts permettant a tout agent conversationnel ou outil tiers d'interroger et de gerer les reservations.</li>
      </ul>
      <p>Le Service est propose selon deux paliers :</p>
      <ul className="lk-legal-list">
        <li>une offre <strong>gratuite</strong> donnant acces a l'API CRUD de reservation et au widget dans la limite de 300 reservations par mois, sans engagement de duree ;</li>
        <li>une offre <strong>Premium</strong> (a venir) integrant un agent IA de prise de reservation et des fonctionnalites avancees, dont les modalites tarifaires seront precisees au sein du Service avant toute souscription.</li>
      </ul>

      <h2 className="lk-legal-h2">3. Creation de compte</h2>
      <p>L'acces au tableau de bord necessite la creation d'un compte via Google OAuth. L'Utilisateur s'engage a fournir des informations exactes et a les maintenir a jour. Chaque compte est strictement personnel ; le partage des identifiants est interdit. L'Utilisateur est responsable de la confidentialite de son acces et de toute activite realisee depuis son compte.</p>
      <p>Le Service est reserve aux personnes ayant la capacite juridique de contracter et, pour les usages professionnels, aux personnes dument habilitees a representer l'etablissement concerne.</p>

      <h2 className="lk-legal-h2">4. Engagements de l'Utilisateur</h2>
      <p>L'Utilisateur s'engage a utiliser le Service de maniere loyale et conforme a sa destination. Sont notamment proscrits :</p>
      <ul className="lk-legal-list">
        <li>toute tentative d'acces non autorise, de retro-ingenierie, de contournement des mecanismes de securite ou de quotas ;</li>
        <li>tout usage automatise visant a degrader la disponibilite du Service ou de son serveur MCP ;</li>
        <li>toute utilisation a des fins frauduleuses, illegales ou contraires aux droits de tiers ;</li>
        <li>la diffusion via le Service de contenus illicites, diffamatoires ou attentatoires aux droits d'autrui ;</li>
        <li>la revente du Service a un tiers sans accord ecrit prealable de MGroupe.</li>
      </ul>

      <h2 className="lk-legal-h2">5. Tarification et facturation</h2>
      <p>L'offre gratuite est sans contrepartie financiere. Les eventuelles offres payantes seront facturees selon les conditions presentees au moment de la souscription. MGroupe pourra faire evoluer ses tarifs ; toute evolution sera notifiee aux Utilisateurs concernes au moins 30 jours avant son entree en vigueur, et n'aura d'effet qu'a compter du renouvellement suivant.</p>

      <h2 className="lk-legal-h2">6. Disponibilite</h2>
      <p>MGroupe met en oeuvre les meilleurs efforts pour assurer la disponibilite et la performance du Service. Elle se reserve toutefois la possibilite d'interrompre temporairement le Service pour des raisons de maintenance, de mise a jour ou de securite, sans indemnisation. Aucun engagement de niveau de service (SLA) n'est pris au titre de l'offre gratuite ; les niveaux applicables aux offres Premium seront precises dans des conditions particulieres.</p>

      <h2 className="lk-legal-h2">7. Propriete intellectuelle et composants open source</h2>
      <p>La marque Koulis, le tableau de bord, le widget, leurs interfaces graphiques et l'ensemble des elements proprietaires qui composent le Service sont proteges par le droit de la propriete intellectuelle et restent la propriete exclusive de MGroupe ou de ses partenaires. Aucune disposition des presentes ne peut etre interpretee comme un transfert de propriete au profit de l'Utilisateur.</p>
      <p>Le serveur MCP de Koulis est distribue sous licence open source. Les conditions de cette licence figurent dans le depot de code correspondant et prevalent sur les presentes CGU pour ce qui concerne l'usage, la modification et la redistribution dudit serveur. Les presentes CGU continuent toutefois a s'appliquer a l'usage de l'instance hebergee par MGroupe et des services associes (compte, dashboard, widget, support).</p>
      <p>L'Utilisateur conserve la pleine propriete des donnees qu'il importe ou genere via le Service. Il concede a MGroupe une licence non exclusive, gracieuse, limitee a la duree du contrat et a ce qui est strictement necessaire a la fourniture du Service.</p>

      <h2 className="lk-legal-h2">8. Donnees personnelles</h2>
      <p>Le traitement des donnees a caractere personnel est decrit dans la <a href="/confidentialite">Politique de confidentialite</a>. Les Utilisateurs reconnaissent en avoir pris connaissance. Pour les coordonnees de convives traitees via le widget ou le serveur MCP, le restaurateur agit en tant que responsable de traitement et MGroupe en tant que sous-traitant ; un addendum de sous-traitance est disponible sur simple demande.</p>

      <h2 className="lk-legal-h2">9. Responsabilite</h2>
      <p>Le Service est fourni &laquo; en l'etat &raquo;. MGroupe ne peut etre tenue responsable des dommages indirects, perte de chiffre d'affaires, perte de clientele ou perte de donnees resultant de l'utilisation du Service. La responsabilite totale et cumulee de MGroupe, toutes causes confondues, est limitee au montant paye par l'Utilisateur au cours des 12 mois precedant le fait generateur, ou, a defaut de paiement, a la somme symbolique de cent (100) euros.</p>
      <p>Aucune des stipulations qui precedent ne saurait limiter la responsabilite de MGroupe en cas de faute lourde, de dol, de violation d'une obligation essentielle ou de dommage corporel.</p>

      <h2 className="lk-legal-h2">10. Suspension et resiliation</h2>
      <p>En cas de manquement grave de l'Utilisateur aux presentes CGU, MGroupe pourra suspendre ou resilier l'acces au Service, apres mise en demeure restee infructueuse pendant 7 jours, ou immediatement en cas de risque pour la securite du Service ou de tiers.</p>
      <p>L'Utilisateur peut cloturer son compte a tout moment depuis son tableau de bord ou par demande ecrite a <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Les conditions de conservation des donnees apres cloture sont precisees dans la Politique de confidentialite.</p>

      <h2 className="lk-legal-h2">11. Modifications des CGU</h2>
      <p>MGroupe se reserve le droit de modifier les presentes CGU pour refleter l'evolution du Service ou de la reglementation. Toute modification substantielle sera notifiee aux Utilisateurs au moins 15 jours avant son entree en vigueur. La poursuite de l'utilisation du Service vaut acceptation des nouvelles conditions.</p>

      <h2 className="lk-legal-h2">12. Droit applicable et juridiction</h2>
      <p>Les presentes CGU sont regies par le droit francais. A defaut de resolution amiable, tout litige relatif a leur interpretation ou a leur execution releve de la competence exclusive des tribunaux du ressort de la cour d'appel de Douai, sauf disposition d'ordre public contraire applicable au consommateur.</p>
      <p>Conformement aux articles L.611-1 et suivants du Code de la consommation, le consommateur peut recourir gratuitement a un mediateur de la consommation en vue de la resolution amiable d'un litige.</p>

      <footer className="lk-legal-footer">
        <p>Pour toute question relative aux presentes CGU, ecrire a <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
      </footer>
    </main>
  );
}
