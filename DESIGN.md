# Design Brief

## Direction

Givethra — A mobile-first humanitarian platform that connects verified help seekers and heroes through transparent, trustworthy case listings and direct impact tracking.

## Tone

Professional, accessible, and human-centered. Modern card-based UI prioritizes clarity and one-handed navigation over decoration, building trust through verification badges and accountability systems.

## Differentiation

Verification-first design with visible trust badges, Proud ❤️ impact tracking, and institution-verified cases eliminate donation platform anonymity and create real accountability.

## Color Palette

| Token      | Light (L C H)    | Dark (L C H)    | Role                    |
| ---------- | ---------------- | --------------- | ----------------------- |
| background | 0.99 0.005 260   | 0.145 0.01 260  | Page backgrounds        |
| foreground | 0.15 0.01 260    | 0.95 0.01 260   | Primary text            |
| card       | 1.0 0.0 0        | 0.18 0.01 260   | Card/surface backgrounds|
| primary    | 0.48 0.18 268    | 0.7 0.18 268    | CTAs, active states     |
| accent     | 0.48 0.18 268    | 0.7 0.18 268    | Highlights, badges      |
| muted      | 0.95 0.01 260    | 0.22 0.01 260   | Disabled, secondary     |
| destructive| 0.55 0.22 25     | 0.65 0.19 22    | Error, delete actions   |
| success    | 0.6 0.18 150     | 0.6 0.18 150    | Verified, completed     |
| warning    | 0.72 0.15 85     | 0.72 0.15 85    | Pending, alerts         |

## Typography

- Display: Space Grotesk — headlines, section titles, emphasis
- Body: DM Sans — body copy, form fields, lists, UI labels
- Mono: Geist Mono — case references, transaction IDs, amounts
- Scale: h1 `text-3xl md:text-4xl font-display font-bold`, h2 `text-xl md:text-2xl font-display font-semibold`, label `text-sm font-body font-semibold`, body `text-base font-body`

## Elevation & Depth

Cards use subtle shadows (`shadow-card` 1px 3px) on light surfaces and 1-2px border for dark mode; Featured content uses `shadow-elevated` (10px blur); Bottom nav has `border-t` to separate from content.

## Structural Zones

| Zone             | Background                    | Border                  | Notes                                          |
| ---------------- | ----------------------------- | ----------------------- | ---------------------------------------------- |
| Header (sticky)  | `bg-card border-b`            | `border-border`         | Logo, search, notification, profile; z-50     |
| Hero             | `bg-background`               | —                       | Large CTA buttons, centered headline           |
| Category Scroll  | `bg-background`               | —                       | Horizontal snap-scroll, icon + label pills     |
| Category Grid    | `bg-background`               | —                       | sm:grid-cols-2 lg:grid-cols-3, cards `bg-card`|
| Featured Cases   | `bg-background`               | —                       | Grid with image, verification badge, progress |
| Trust Badges     | `bg-muted/30`                 | —                       | Horizontal list with checkmark icons           |
| Bottom Nav       | `bg-card border-t fixed`      | `border-border`         | 5 items, icon+label, active = primary color    |
| Footer           | `bg-muted/20 border-t`        | `border-border`         | Links, copyright (desktop only)                |

## Spacing & Rhythm

Mobile-first grid: `px-4 py-6` section padding, `gap-4` for cards, `gap-2` for form fields. Desktop (md:) increases to `px-8 py-8` and `gap-6`. Hero CTA spacing: `gap-3` for buttons side-by-side or `flex-col gap-4` on mobile.

## Component Patterns

- Buttons: Rounded corners (`rounded-lg`), primary CTA uses `bg-primary text-primary-foreground`, secondary uses `border border-border bg-transparent`, hover uses `opacity-90 transition-button`.
- Cards: `rounded-lg bg-card border border-border`, featured cases use `shadow-elevated`.
- Badges: Verification badges are small rounded pills, `bg-success/20 text-success font-semibold`, Proud ❤️ shown as inline red badge.
- Category Pills: `rounded-full px-4 py-2 text-sm`, active = `bg-primary text-primary-foreground`, inactive = `bg-muted text-muted-foreground`.
- Progress Bar: `h-2 bg-muted rounded-full`, filled portion uses `bg-success` for completed.
- Notification Badge: Red circular badge with count, positioned top-right on bell icon.

## Motion

- Entrance: Hero section fades and slides up on load (200ms ease-out). Featured cases stagger in (100ms each).
- Hover: Buttons and cards use `transition-button` (200ms), scale `hover:scale-105` disabled.
- Interactive: Bottom nav tab change uses `transition-smooth` (300ms). Category pill scroll is smooth native scroll behavior.

## Constraints

- No raw hex colors — all colors use OKLCH tokens.
- Mobile bottom nav icons must remain visible always (no text-only, no icon-only).
- Category scroll must support one-handed thumb navigation (snap-scroll on mobile).
- Form inputs must have min 48px tap target height.
- All interactive elements use `transition-button` or `transition-smooth` for consistency.
- Notification badge shows unread count, not "..." truncation.

## Signature Detail

Verification badges (Email Verified ✓, Mobile Verified ✓, Identity Verified ✓) appear inline on profiles and case cards, creating immediate trust signaling that differentiates Givethra from generic donation platforms.
