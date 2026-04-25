# Prompt initial pour Claude Code

Copiez-collez ce prompt à Claude Code **avant toute autre instruction**.

---

## Contexte

Je veux appliquer une refonte visuelle à mon SaaS `saas-frontend` (React 19 + TypeScript 5.9 + Vite + React Router 7 + Supabase + Lucide React + CSS custom maison).

Le design cible est dans le dossier `handoff/` :
- `handoff/reference/` — le HTML de référence (la cible visuelle)
- `handoff/DESIGN_SYSTEM.md` — tokens et conventions
- `handoff/COMPONENTS.md` — patterns des composants
- `handoff/MIGRATION_PLAN.md` — plan progressif
- `handoff/tokens.css` — tokens CSS prêts à importer

## Règles ABSOLUES — non négociables

### 🚫 Ne JAMAIS toucher à :

1. **Les hooks personnalisés** (`useXxx`) — leur logique est métier
2. **Les contextes React** (auth, state global, etc.)
3. **Les appels Supabase** (auth, queries, RLS, realtime)
4. **Le routing** (`react-router-dom`) — routes, guards, redirections
5. **Les types TypeScript** des données métier
6. **Les tests** existants — si un test casse, c'est que vous avez touché à du code que vous n'auriez pas dû
7. **Les fichiers `.env`, configs Vite, tsconfig**
8. **La logique de formulaires** (validation, submit, error handling) — uniquement leur apparence

### ✅ Vous POUVEZ modifier :

1. Les **tokens CSS** (`--lk-*`) dans `src/index.css`
2. Les **classes utilitaires** (`.btn`, `.card`, etc.) dans le CSS
3. Le **JSX visuel** : structure des layouts, className, style inline
4. Ajouter de **nouveaux composants visuels** (Button, Card, KpiCard, Sidebar...) dans `src/components/ui/`
5. Les **icônes Lucide** utilisées (avec mapping dans `COMPONENTS.md`)

## Méthode

1. **Lis d'abord tout `handoff/`** avant de toucher au code.
2. **Annonce ce que tu vas faire** avant chaque étape (étape n°1, n°2…) selon `MIGRATION_PLAN.md`.
3. **Une étape = une PR mentale** : ne mélange jamais "migrer les tokens" et "refondre l'écran Aujourd'hui" dans le même chantier.
4. **À chaque écran refait** :
   - Lis le composant existant en entier d'abord
   - Identifie tous les hooks, props, side-effects, callbacks
   - Refais UNIQUEMENT la partie visuelle
   - Si tu as un doute, **demande-moi avant de modifier**
5. **Vérifie** que `npm run build` et `npm run typecheck` passent après chaque étape.

## Premier livrable attendu

Liste-moi :
1. La structure actuelle de mon projet (`src/`)
2. Le contenu de mon `index.css` actuel (tokens existants)
3. Les composants UI partagés que tu détectes (Button, Card, etc.)

**N'écris aucun code à la première réponse.** Juste cet inventaire pour qu'on aligne les noms et qu'on évite les collisions.

Ensuite j'approuverai et tu commenceras par l'**étape 1** du `MIGRATION_PLAN.md`.
