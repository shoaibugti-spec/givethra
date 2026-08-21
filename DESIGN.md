# Design Brief — Givethra Corporate Identity

## Direction

Givethra — A verified humanitarian platform with corporate teal/turquoise identity, light mode by default, professional trust-centered case discovery and direct impact tracking for Help Seekers and Heroes.

## Tone

Professional, warm, human-centered. Light, clean, trustworthy. Verification-first design with inline trust badges, transparent impact tracking, and institution-verified checkmarks eliminate anonymity and create accountability. Never generic—distinctly humanitarian.

## Differentiation

Corporate identity applied with precision: turquoise primary (#00A896) for all CTAs and active states, deep blue secondary (#028090) for trust signaling, crisp light background (#F4F9F9) by default. Verification badges, Proud ❤️ markers, and real impact metrics build distinctive trust narrative.

## Color Palette

| Token      | Light (Hex / OKLCH)      | Dark (OKLCH)         | Role                    |
| ---------- | ----------------------- | -------------------- | ----------------------- |
| primary    | #00A896 / 0.54 0.18 165 | 0.62 0.18 165        | CTAs, active states     |
| secondary  | #028090 / 0.32 0.12 190 | 0.48 0.12 190        | Trust, secondary CTAs   |
| background | #F4F9F9 / 0.97 0.002 260| 0.08 0.02 260        | Page backgrounds        |
| foreground | #1E293B / 0.21 0.02 260 | 0.96 0.008 260       | Primary text            |
| accent     | #F0FDF4 / 0.96 0.01 150 | 0.80 0.01 150        | Highlights, badges      |
| card       | 0.99 0.005 0            | 0.12 0.01 260        | Card/surface backgrounds|
| muted      | 0.92 0.008 260          | 0.25 0.01 260        | Disabled, secondary     |
| destructive| 0.55 0.22 25            | 0.65 0.19 22         | Error, delete actions   |
| border     | 0.88 0.008 260          | 0.22 0.01 260        | Dividers, outlines      |

## Typography

Display: Space Grotesk — headlines, CTAs, section titles. Body: DM Sans — descriptions, labels, body copy. Mono: Geist Mono — case IDs, amounts, data. Scale: h1 text-3xl md:text-4xl font-display font-bold; h2 text-xl md:text-2xl font-display font-semibold; label text-sm font-body font-semibold; body text-base font-body.

## Elevation & Depth

Cards use subtle shadows (shadow-card 1px 3px) on light surfaces; dark mode uses 1-2px borders. Featured content uses shadow-elevated (10px blur). Header/bottom nav use border-b/border-t for separation.

## Structural Zones

| Zone               | Background              | Border         | Notes                                       |
| ------------------ | ----------------------- | -------------- | ------------------------------------------- |
| Header (sticky)    | bg-card border-b        | border-border  | Logo, search, profile; z-50                 |
| Hero Section       | bg-background           | —              | Headline, turquoise buttons, trust message  |
| Location Toggle    | bg-background           | —              | Local/International pill buttons, primary   |
| Category Scroll    | bg-background           | —              | Horizontal snap, icon+label, turquoise pill |
| Featured Cases     | bg-background           | —              | 2-3 grid, image, verification, turquoise btn|
| Impact Stats       | bg-muted/10 border-t/b  | border-border  | Cases, Heroes, Support count                |
| How It Works       | bg-background border-t  | border-border  | 3-step guide (01, 02, 03)                   |
| Bottom Nav         | bg-card border-t fixed  | border-border  | 5 items, turquoise active state, icon+label |
| Footer             | bg-muted/20 border-t    | border-border  | Links, copyright (desktop)                  |

## Spacing & Rhythm

Mobile-first: px-4 py-6 sections, gap-4 cards, gap-2 form. Desktop (md:+): px-8 py-8, gap-6. Hero buttons: gap-3 side-by-side or flex-col gap-4 mobile. Category pills: native horizontal scroll with snap-center.

## Component Patterns

Buttons: .btn-primary = bg-primary (#00A896) text-white px-6 py-3 rounded-lg transition-button; .btn-secondary = border border-border px-6 py-3 rounded-lg bg-transparent. Cards: rounded-lg bg-card border border-border; featured cases shadow-elevated. Badge (verification): bg-success/20 text-success font-semibold text-xs. Category/Location Pills: .pill-active bg-primary (#00A896) text-white rounded-full px-4 py-2; .pill-inactive bg-muted text-muted-foreground. Progress: h-2 bg-muted rounded-full, filled = success. Notification: red circular, top-right.

## Motion

Entrance: Hero fades/slides up (200ms ease-out); cases stagger (100ms each). Hover: Buttons/cards transition-button (200ms), no scale. Interactive: Bottom nav transition-smooth (300ms); category native snap.

## Constraints

No raw hex outside brand tokens. Light mode default—no auto dark mode on first visit. Mobile bottom nav: icon+label, 48px tap targets. All forms: 48px min height. All interactive: transition-button or transition-smooth. Turquoise primary (#00A896) for all CTAs. Light background (#F4F9F9) for all page backgrounds. Conditional hero buttons (hidden for logged-in with role). Verification badges inline for trust.

## Learnings

Givethra brand identity: Cosmic Turquoise (#00A896) as primary, Deep Blue (#028090) as trust secondary. Light clean background (#F4F9F9) enforced by default. Accent mint (#F0FDF4) for highlights. Humanitarian + verification-first = trust + impact narrative.
