# Design System — Le Koulis SaaS

Référence des conventions visuelles. Tous les tokens sont dans `tokens.css`.

---

## 1. Couleurs

### Primary — Rose signature
La couleur identitaire. Utilisée pour :
- Les CTA principaux
- Les states actifs (lien sidebar courant, bouton sélectionné)
- Les accents de marque (logo, KPI couverts)
- Les pills de statut "premium"

```
--lk-primary         #ED73A9   /* base */
--lk-primary-soft    #FBD0E4   /* hover backgrounds, gradients */
--lk-primary-medium  #D66E90   /* hover state for primary buttons */
--lk-primary-strong  #C6546D   /* text on tinted bg, strong accents */
--lk-primary-tint    rgba(237,115,169,0.08)   /* subtle bg fill */
```

### Secondary — Sky blue
Couleur secondaire chaleureuse. Utilisée pour :
- Boutons secondaires d'action
- Accents informatifs (Agent IA, intégrations)
- Tags "source = widget"

### Surfaces — Warm cream
La palette **n'est pas** blanc + gris. C'est cream.

```
--lk-bg-main    #FFFBF5  /* fond app entier */
--lk-bg-card    #FFFFFF  /* cards, modals — vrai blanc */
--lk-surface-1  #FFFBF5  /* alt background = bg-main */
--lk-surface-2  #FAF6EE  /* zones de section, table headers */
--lk-surface-3  #F2EDE2  /* le plus chaud — éléments "creusés" */
```

### Status
- `success` → vert (résa confirmée)
- `warning` → orange (résa en attente, no-show risk)
- `error` → rouge (annulation, zone dangereuse)
- `info` → bleu (notifications neutres)

Chaque couleur a son `*-tint` (12% alpha) pour les backgrounds soft.

---

## 2. Typographie

**Famille** : `Poppins` (déjà alignée avec votre landing). À importer via Google Fonts :

```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

### Échelle sémantique

| Token        | Px   | Usage                                     |
|--------------|------|-------------------------------------------|
| `--fs-xs`    | 11   | labels, kbd, captions                     |
| `--fs-sm`    | 12   | helper text, meta                         |
| `--fs-base`  | 14   | corps de texte, default                   |
| `--fs-md`    | 15   | section titles                            |
| `--fs-lg`    | 17   | h2 in cards                               |
| `--fs-xl`    | 22   | page titles                               |
| `--fs-2xl`   | 28   | KPI numbers                               |
| `--fs-3xl`   | 36   | hero numbers, empty state CTAs            |

### Règles de hiérarchie

- **Page title** : 22px / 700 / letter-spacing -0.025em
- **Section title** (dans une card) : 15px / 600
- **Label uppercase** (KPI label, group title) : 11px / 600 / letter-spacing 0.06em / `--lk-text-muted`
- **Eyebrow** (date au-dessus du titre, tag premium) : 11px / 500 / `--lk-primary-strong`

### Numbers
Toujours `font-variant-numeric: tabular-nums` pour les chiffres alignés (KPI, heures, prix).

---

## 3. Espacement

Échelle 4-base : `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.

**Conventions** :
- Padding card standard : `18px 20px` (compact) ou `22px 24px` (confort)
- Gap entre cards : `14px` à `18px`
- Padding écran : `28px 32px 80px` (le 80px en bas pour respirer au scroll)
- Max-width contenu : `1440px` centré

---

## 4. Radius

| Token            | Px   | Usage                            |
|------------------|------|----------------------------------|
| `--radius-sm`    | 6    | inputs, small chips              |
| `--radius`       | 10   | cards, buttons, default          |
| `--radius-lg`    | 14   | modal, drawer, large cards       |
| `--radius-xl`    | 20   | hero cards, big surfaces         |
| `--radius-2xl`   | 28   | rare, big visual statements      |
| `--radius-full`  | 9999 | avatars, status pills, kbd       |

---

## 5. Ombres

Système à 5 niveaux, **toujours teintées vert sombre** (pas du noir pur) pour rester chaleureux :

```
--shadow-xs   1px 2px        — boutons, inputs
--shadow-sm   2px 6px        — cards atones
--shadow      6px 18px       — cards principales (hover)
--shadow-lg   8px 28px       — popovers
--shadow-xl   20px 60px      — modal, drawer
--shadow-glow ring 4px       — focus state
```

---

## 6. Transitions

```
--t-fast  120ms ease                              /* hover, micro-interactions */
--t       200ms ease                              /* default */
--t-slow  350ms cubic-bezier(0.22, 1, 0.36, 1)    /* page transitions, drawer */
```

**Règle** : tout élément interactif doit avoir une transition. Jamais de jump cut sur hover.

---

## 7. Iconographie

**Lucide React** (que vous avez déjà). Tailles canoniques :

- Sidebar nav : `16px` strokeWidth `1.7`
- Topbar / header buttons : `16px` strokeWidth `2`
- Inline avec texte : `13–14px` strokeWidth `2`
- KPI card icon : `16px` strokeWidth `2` dans un container 32×32
- Status pill icon : `10–11px` strokeWidth `2.4`

**Stroke** : généralement `currentColor`, sauf pour les icônes de status colorées qui prennent leur teinte directe.

---

## 8. Logo

Signature `le koulis` en italique Poppins :

```jsx
<span className="lk-logo">
  <span className="le">le</span>
  koulis
</span>
```

Couleur toujours `--lk-primary`. Tailles courantes : 14px (sidebar), 18px (auth pages), 24px (landing).

---

## 9. Mode densité

Le SaaS supporte 2 densités via une classe sur `<body>` ou un context :

- **Comfortable** (default) : padding `22px 24px`, gaps `16-18px`, font `14px`
- **Compact** : padding `14px 16px`, gaps `10-12px`, font `13px`

Implémentation suggérée : variable CSS `--density-pad-y`, `--density-pad-x`, `--density-gap` que vous bumpez sur `<body class="density-compact">`.

---

## 10. À ne pas faire

❌ Inventer des couleurs hors palette (utiliser `oklch()` pour dériver si vraiment nécessaire)
❌ Utiliser du gris pur — toujours préférer le cream system
❌ Mélanger Inter / Roboto / autres → uniquement Poppins
❌ Ajouter des emojis dans l'UI fonctionnelle
❌ Utiliser des gradients agressifs — uniquement les soft `primary-soft → secondary-tint`
❌ Border radius mixé : si une card est en `--radius`, ses inputs internes peuvent être `--radius-sm` mais pas plus petit
