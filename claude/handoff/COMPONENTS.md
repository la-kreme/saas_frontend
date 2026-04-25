# Composants — patterns clés

Tous les composants sont à créer dans `src/components/ui/` (atomiques) ou `src/components/layout/` (Sidebar, Topbar, Drawer, etc.).

Les snippets ci-dessous sont des **références de structure**, pas du code à copier-coller tel quel — adaptez à vos conventions TypeScript.

---

## Mapping icônes : refonte → Lucide React

Dans la refonte HTML j'ai utilisé des icônes line custom. Dans votre projet, remplacez-les par Lucide :

| Refonte (custom) | Lucide React          | Usage                          |
|------------------|------------------------|--------------------------------|
| `I.Home`         | `Home`                | Aujourd'hui                    |
| `I.Calendar`     | `Calendar`            | Réservations                   |
| `I.Grid`         | `LayoutGrid`          | Plan de salle                  |
| `I.Clock`        | `Clock`               | Horaires                       |
| `I.Code`         | `Code2`               | Mon widget                     |
| `I.Sparkles`     | `Sparkles`            | Premium, Agent IA              |
| `I.Settings`     | `Settings`            | Paramètres                     |
| `I.Logout`       | `LogOut`              | Déconnexion                    |
| `I.Plus`         | `Plus`                | Nouveau                        |
| `I.Search`       | `Search`              | Recherche, Cmd+K               |
| `I.X`            | `X`                   | Fermer modal/drawer            |
| `I.Check`        | `Check`               | Confirmer, statut OK           |
| `I.Users`        | `Users`               | Couverts                       |
| `I.Mail`         | `Mail`                | Email contact                  |
| `I.Phone`        | `Phone`               | Téléphone contact              |
| `I.Bell`         | `Bell`                | Notifications                  |
| `I.ChevronRight` | `ChevronRight`        | Drill-down                     |
| `I.ArrowRight`   | `ArrowRight`          | CTA                            |
| `I.MoreH`/`More` | `MoreHorizontal`      | Menu contextuel                |
| `I.Pencil`       | `Pencil`              | Édition                        |
| `I.Trash`        | `Trash2`              | Suppression                    |
| `I.Eye`          | `Eye`                 | Mode service / preview         |
| `I.Filter`       | `SlidersHorizontal`   | Filtres avancés                |
| `I.Copy`         | `Copy`                | Copier (clipboard)             |
| `I.Open`         | `ExternalLink`        | Lien externe                   |
| `I.Save`         | `Save`                | Enregistrer                    |
| `I.Lock`         | `Lock`                | Fermé / verrouillé             |
| `I.Repeat`       | `Repeat`              | Appliquer à toute la semaine   |
| `I.Bookmark`     | `Link2`               | Lien partageable               |
| `I.Info`         | `Info`                | Hint, info                     |
| `I.Maximize`     | `Maximize2`           | Plein écran                    |
| `I.Zoom`/`ZoomOut` | `ZoomIn` / `ZoomOut` | Zoom canvas                    |

---

## Button

Variants : `primary` | `secondary` | `ghost` | `danger` | `sky`
Sizes : `sm` (28px) | `md` (36px) | `lg` (44px)

```tsx
type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'sky';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;
```

Styles clés :
- **primary** : background `--lk-primary`, hover → `--lk-primary-medium`, color blanche
- **secondary** : background `--lk-bg-card`, border `--lk-border`, color `--lk-text-primary`
- **ghost** : transparent, hover → `--lk-surface-2`
- **danger** : background `--lk-error`, color blanc
- **sky** : background `--lk-secondary-tint`, color `--lk-secondary-strong`

Padding : sm `0 10px`, md `0 14px`, lg `0 18px`.
Gap entre icon et label : `6px` (sm) ou `8px` (md/lg).
Border-radius : `--radius`.

---

## Card

Wrapper de base. Padding par défaut `22px 24px`, override possible via prop `padded={false}` + style inline.

```tsx
type CardProps = {
  padded?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
};
```

Styles :
- background : `--lk-bg-card`
- border : `1px solid --lk-border`
- border-radius : `--radius-lg`
- shadow : `--shadow-sm`
- transition : background `--t`

---

## Badge / StatusPill

```tsx
type BadgeTone = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'sky' | 'neutral';

<Badge tone="success" icon={<Check size={11}/>}>Confirmée</Badge>
```

Style :
- height 22px
- padding `0 10px`
- font-size 11.5px / weight 600
- background `--lk-{tone}-tint`
- color `--lk-{tone}` (ou `-strong`)
- border-radius `--radius-full`
- gap icon/label : 5px

`StatusPill` est un wrapper qui mappe `'confirmed'` → success, `'pending'` → warning, `'cancelled'` → error.

---

## Avatar

Initiales sur fond pastel **dérivé du nom** (hash). Pas d'image dans la version actuelle.

```tsx
function hashHue(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}
// background: `oklch(0.92 0.06 ${hashHue(name)})`
// color: `oklch(0.4 0.08 ${hashHue(name)})`
```

Tailles : 24, 28, 32, 36, 44, 56.
Border-radius : `--radius-full`.
Font-weight : 600.

---

## KpiCard

Card spécialisée pour le dashboard.

```tsx
type KpiCardProps = {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  tint: string;          // background color of icon container
  trend?: string;        // "+3 vs hier"
  sub?: string;          // "/ 26 capacité"
  hot?: boolean;         // pulsing dot
};
```

Layout :
- Header (icon container 32×32 + trend/hot dot à droite)
- Label uppercase 11px
- Number 28-30px / weight 700 / tabular-nums
- Optional sub à droite du number

---

## Sidebar

Largeur : 240px (étendu) ou 64px (réduit).
Background : `--lk-surface-1`.
Border-right : `1px solid --lk-border`.

Structure :
1. Logo + brand (header, padding 16-18px)
2. Nav groups (header uppercase muted + items)
3. Footer (Agent IA promo + user avatar + logout)

Item nav :
- height 36px
- padding `0 12px`
- gap 10px (icon + label)
- border-radius `--radius`
- État courant : background `--lk-primary-tint`, color `--lk-primary-strong`, fonctionnant sur `useLocation().pathname`

```tsx
const items = [
  { to: '/aujourdhui',     icon: Home,        label: "Aujourd'hui" },
  { to: '/reservations',   icon: Calendar,    label: 'Réservations' },
  { to: '/plan',           icon: LayoutGrid,  label: 'Plan de salle' },
  { to: '/horaires',       icon: Clock,       label: 'Horaires' },
  { to: '/widget',         icon: Code2,       label: 'Mon widget' },
  { to: '/parametres',     icon: Settings,    label: 'Paramètres' },
];
```

---

## Topbar

Hauteur : 60px.
Background : `--lk-bg-card`.
Border-bottom : `1px solid --lk-border`.

Contenu :
- (left) Page title 17px / 600 (pris du context route)
- (center) Recherche / Cmd+K trigger (bouton qui ouvre la palette)
- (right) Bell notifications + Date selector + Avatar menu

Le bouton Cmd+K trigger :
```tsx
<button onClick={openCmdK} style={{
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: '0 12px', height: 34,
  background: 'var(--lk-surface-2)',
  border: '1px solid var(--lk-border)',
  borderRadius: 'var(--radius)',
  color: 'var(--lk-text-muted)',
  fontSize: 13,
}}>
  <Search size={14}/>
  Rechercher…
  <Kbd>⌘</Kbd><Kbd>K</Kbd>
</button>
```

---

## Drawer (résa detail)

Overlay sombre + panel slide-from-right 480px.

```tsx
<aside style={{
  position: 'fixed', top: 0, right: 0, bottom: 0,
  width: 480,
  background: 'var(--lk-bg-card)',
  boxShadow: 'var(--shadow-xl)',
  animation: 'lk-fade-up 0.3s cubic-bezier(0.22,1,0.36,1)',
  display: 'flex', flexDirection: 'column',
}}>
  <header /> { /* avatar + name + close */ }
  <div className="lk-scroll" style={{ flex: 1, overflowY: 'auto' }}>
    {/* content */}
  </div>
  <footer /> { /* actions */ }
</aside>
```

Important :
- `Esc` ferme le drawer (listener global)
- Backdrop click ferme aussi
- Le scroll de la page **derrière** est préservé visuellement mais bloqué via `overflow: hidden` sur `<body>`

---

## Cmd+K Palette

Modal centrée 560px de large, top à 15vh.
Sections : Pages / Réservations / Clients / Actions.
Filtre client-side sur `query.toLowerCase()` dans `label`.

Listener global :
```tsx
useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setOpen(true);
    }
  };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}, []);
```

---

## EmptyState

Pour les écrans qui n'ont pas encore de données. Pattern :

```tsx
<Card style={{ padding: 40, textAlign: 'center',
  background: 'linear-gradient(135deg, var(--lk-primary-soft) 0%, var(--lk-secondary-tint) 100%)' }}>
  <Sparkles size={32} className="mb-3" />
  <h2>Title qui motive</h2>
  <p>Phrase qui explique ce qui va se passer.</p>
  <Button variant="primary">Action</Button>
</Card>
```

Évitez les illustrations placeholder vides — préférez un gradient soft + une icon Lucide + un CTA clair.
