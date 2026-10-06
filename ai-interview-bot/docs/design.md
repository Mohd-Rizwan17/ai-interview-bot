# Design

Mockup: https://claude.ai/artifact/ByhV8aSchdDPqzuNZR3ste

## Look
Dark, focused, "terminal at night". Lime accent, amber for the timer and warnings, red only for cheating and wrong answers (always with text or an icon too).

## Colors (dark)
- Ground #0D1117, panel #151B23, border #263040
- Text #E8EDF3, muted #9AA7B8
- Accent #B6F24A, timer/warning #F5B94A, danger #F87171
- Light theme: to be defined when the theme toggle is built

## Typography
- Space Grotesk for UI
- JetBrains Mono for code and the timer

## Icons
Stroke icons, 2px, 22px. Use lucide-react.

## Screens
Login, Register, Dashboard (with profile and topic scores), Interview Room (desktop and mobile), Interview Ended (cheating), Login Conflict (phone), Session Ended (desktop), History, 404 page, Scoreboard (still to design).

## Animation map
- Login and Register background: ConstellationGrid (Canvas 2D)
- Login <-> Register: GSAP card slide
- Login -> Dashboard: accent circle wipe, then stagger
- Every route change: fade and slide up, 0.3s
- Buttons: press scale, ripple, spinner
- Theme toggle: View Transitions API circular reveal
- Dashboard: slow dot-grid drift (CSS)
- History: row stagger, progress bar fill
- 404: flicker and bounce
- Cheating screen: red pulse and shake
- Interview room: timer pulse only

## ConstellationGrid notes
Take `isDark` as a prop, respect reduced motion, pause when the tab is hidden, connect only nearby nodes, lower density on mobile, and render as a fixed background layer.

## UI preference memory
Follow the mockup. Responsive first. Inspiration shortcuts: /motion-example, /ui-ux-pro-max-example, /21st-dev-example.
