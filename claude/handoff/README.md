# Handoff — Refonte SaaS Le Koulis

Ce dossier contient tout ce dont **Claude Code** a besoin pour appliquer la refonte visuelle à votre `saas-frontend` existant (React 19 + TypeScript 5.9 + Vite + CSS maison) **sans casser votre logique métier**.

## Lecture dans cet ordre

1. **`CLAUDE_CODE_PROMPT.md`** — Le prompt à donner à Claude Code en premier. Définit les règles strictes (ne pas toucher aux hooks/API/routing, etc.).
2. **`MIGRATION_PLAN.md`** — Plan d'attaque progressif, écran par écran, avec des étapes reviewables.
3. **`DESIGN_SYSTEM.md`** — Tokens (couleurs, spacing, type, shadows) et conventions.
4. **`COMPONENTS.md`** — Patterns des composants clés (Button, Card, KpiCard, Sidebar item, etc.) avec mapping Lucide.
5. **`tokens.css`** — Fichier CSS prêt à importer dans votre `index.css`.

## Référence visuelle

Le HTML de la refonte est joint dans `reference/`. Ouvrez-le pour voir le rendu cible. Tous les composants sont commentés.

## Stratégie en une phrase

> Migrer **token par token, composant par composant, écran par écran**, en gardant intacts hooks, contextes, appels Supabase, routing, et tests. Une PR par étape.

## Workflow recommandé

```
1. Branche feature/redesign-tokens
   → Importer tokens.css, vérifier que rien ne casse visuellement
   → Merge

2. Branche feature/redesign-atomics
   → Migrer Button, Card, Badge (composants atomiques sans logique)
   → Merge

3. Branche feature/redesign-aujourdhui
   → Refondre l'écran Aujourd'hui en remplaçant UNIQUEMENT le JSX visuel
   → Tester manuellement le flow
   → Merge

4. Répéter pour chaque écran (Réservations, Plan de salle, Horaires, Widget, Paramètres)
```

À chaque étape : commit small, deploy, vérifier que les features marchent toujours.
