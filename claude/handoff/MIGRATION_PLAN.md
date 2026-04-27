# Plan de migration progressive

Stratégie : **petites étapes reviewables**, chacune mergée et testée avant la suivante. **Ne jamais sauter d'étape.**

---

## Étape 0 — Inventaire (no code)

**Objectif** : aligner les conventions avant de toucher quoi que ce soit.

- [ ] Claude Code liste la structure de `src/`
- [ ] Récupère le contenu actuel de `src/index.css` (tokens existants `--lk-*`)
- [ ] Identifie les composants UI partagés (`Button`, `Card`, etc.)
- [ ] Détecte les éventuelles collisions de noms

**Livrable** : un compte-rendu écrit. Pas de code.

---

## Étape 1 — Tokens

**Objectif** : injecter le système de tokens élargi sans rien casser.

- [ ] Ouvrir `handoff/tokens.css` et `src/index.css`
- [ ] **Merger** les tokens : si un token existe déjà avec une valeur, **demander** avant de l'écraser
- [ ] Ajouter les nouveaux tokens (`--lk-text-muted`, `--shadow-xs`, `--radius-lg`, etc.)
- [ ] Importer les Google Fonts si pas déjà fait (Poppins)
- [ ] `npm run build` — doit passer sans erreur

**Risque** : faible. Les tokens additionnels n'affectent pas l'existant.

**Critère de validation** : la couleur primaire `--lk-primary` reste visuellement identique partout dans l'app.

---

## Étape 2 — Composants atomiques

**Objectif** : créer la nouvelle famille de composants UI dans `src/components/ui/`, **sans toucher aux écrans existants**.

Composants à créer (dans cet ordre) :

1. `Button.tsx` — variants : primary, secondary, ghost, danger, sky + sizes sm/md/lg + icon/iconRight
2. `Card.tsx` — wrapper avec padding, shadow, border
3. `Badge.tsx` — pill colored (tone: primary, success, warning, error, info, sky)
4. `Avatar.tsx` — initiales sur fond pastel hashé sur le nom
5. `StatusPill.tsx` — badge de statut résa (confirmed, pending, cancelled)
6. `IconBtn.tsx` — bouton icon-only carré

**Règles** :
- Import des icônes depuis `lucide-react`, pas de SVG inline
- Props typées strictement (TypeScript)
- Aucune logique métier, juste de la présentation
- Ces composants existent **en parallèle** des anciens — ne touchez pas à `<button class="btn">` existants pour l'instant

**Livrable** : un Storybook ou une page `/dev/ui-kit` (si vous avez le temps) qui les affiche tous.

**Critère de validation** : tous les composants visuels matchent le HTML de référence.

---

## Étape 3 — Layout (Sidebar + Topbar)

**Objectif** : remplacer la coquille de l'app.

- [ ] Créer `src/components/layout/Sidebar.tsx`
- [ ] Créer `src/components/layout/Topbar.tsx`
- [ ] Brancher la nav sur `react-router-dom` (utiliser `useLocation`, `Link`)
- [ ] Brancher l'avatar de la sidebar footer sur le user Supabase actuel
- [ ] Brancher le bouton Cmd+K sur un état local pour l'instant (la palette viendra plus tard)
- [ ] Remplacer l'ancien layout dans le `<Outlet/>` parent

**Risque** : moyen. C'est ici qu'on touche aux routes.

**Critère de validation** :
- Toutes les routes existantes restent accessibles
- L'auth fonctionne toujours (logout, profil)
- Aucune régression sur les écrans pas encore migrés

---

## Étape 4 — Écran Aujourd'hui

- [ ] Lire l'écran Aujourd'hui actuel **en entier**
- [ ] Lister tous les hooks, queries Supabase, états utilisés
- [ ] Refaire le JSX visuel uniquement, en réutilisant les hooks et données existants
- [ ] Composants à créer si pas encore : `KpiCard`, `ServiceTimeline`, `ActivityFeed`, `EmptyState`

**Critère de validation** : les KPI affichent les vraies données Supabase, le clic sur une résa ouvre bien le détail (peu importe que ce soit un drawer ou une page).

---

## Étape 5 — Écran Réservations

- [ ] Refaire la liste avec filtres (all, confirmed, pending, cancelled)
- [ ] Recherche locale ou serveur selon votre architecture actuelle
- [ ] Le drawer (ou page) de détail réutilise la logique existante

---

## Étape 6 — Écran Plan de salle

⚠️ Le plus complexe. Si la logique drag-and-drop existe déjà, **ne pas la toucher** — juste restyler les chips et zones.

---

## Étape 7 — Écran Horaires

- [ ] Vue semaine + édition jour
- [ ] Brancher sur les schémas existants (services, durée, intervalle)

---

## Étape 8 — Écran Mon Widget

- [ ] Layout config + preview live
- [ ] Le code embed reflète bien la `--lk-primary` choisie

---

## Étape 9 — Écran Paramètres

- [ ] Groupes de settings, toggles, sliders, zone dangereuse

---

## Étape 10 — Cmd+K palette (bonus)

- [ ] Implémentation de la palette de recherche globale
- [ ] Brancher sur les routes (pages) + sur les résas du jour

---

## Anti-patterns à éviter

❌ "Migrer tous les écrans en une fois"
❌ "Réécrire les hooks en passant"
❌ "Refactor + redesign en même temps"
❌ "Modifier les types pour matcher le nouveau JSX"

✅ Une étape, une PR, un test manuel, on merge, on continue.
