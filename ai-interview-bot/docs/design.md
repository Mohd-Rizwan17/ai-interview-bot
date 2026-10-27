# Design

## Look
Dark, glassy, minimal. A floating glass sidebar over a soft aurora background. The theme changes with the role, set by `<html data-role>` from `MainLayout`.

## Themes
| | User (Modern Minimal) | Admin (Lime Frost) |
|---|---|---|
| Ground | `#121212` | `#020617` |
| Panel solid | `#1c1c1c` | `#0f172a` |
| Accent | `#3b82f6` | `#aff33e` |
| Accent 2 (gradient end) | `#60a5fa` | `#c8f56a` |
| Ink / muted | `#ededed` / `#a3a3a3` | `#f8fafc` / `#94a3b8` |
| Radius md / lg / xl | 4 / 6 / 10 px | 12 / 16 / 20 px |

Login and Register use the user palette. Shared: ok `#4ade80`, warn `#f5b94a`, danger `#f87171`.

Note: the Modern Minimal colours were read from a screenshot, not from the official token list. Lime Frost tokens come from 21st.dev.

## Typography
Space Grotesk (variable, 300 to 700) and JetBrains Mono for numbers and code. Headings on Login, Register and Dashboard change weight near the cursor (mouse devices only, off with reduced motion).

## Surfaces
- `glass`: cards. `glass-strong`: sidebar, auth card. `glass-solid`: modals, Monaco and iframe panels, long lists.
- `bg-accent`: gradient from accent to accent 2, with a soft glow on primary buttons.
- Tokens are `--glass-*` variables in `index.css`, so a light theme only needs new values.

## Components
- **Auth background:** `DotGrid` canvas (dots reveal from the centre, then twinkle at 30 fps). Static with reduced motion.
- **Loader:** `DotLoader` inside `PageLoader`. It shows only after 400 ms of waiting, so fast pages never flash it.
- **404:** large number, "Go back" only when the app has history.
- **Avatar:** first letter, green dot in the sidebar.
- **Bento dashboard:** trend line, round treemap (tile size by attempts, colour by score), round radar (3 or more graded rounds).
- **Product tour:** custom spotlight, 4 steps, shown once per user per browser.

## Motion
Hover 150ms, press scale .97 (120ms), modal 200ms, toast and banner 250ms, page enter 300ms (fade and 12px up), list stagger 40ms (max 6), tick pop 200ms, auth card slide 400ms, login circle wipe 600ms. Reduced motion: everything becomes a plain fade, dots and aurora stop.

## UI preference memory
- Hinglish explanations, direct answer first.
- Plan or blueprint before big UI work, with an animation map for animation work.
- Inspiration shortcuts: `/motion-example` (motion.dev/examples), `/ui-ux-pro-max-example` (ui-ux-pro-max-skill.nextlevelbuilder.io), `/21st-dev-example` (21st.dev).