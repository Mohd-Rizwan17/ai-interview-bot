# Design

UI and UX rules for the AI Interview Bot. The code source of truth is `client/src/index.css`. This file explains the thinking behind it.

## 1. Direction

- Dark, glass, calm. Soft shadows, big radius, one accent colour per role.
- "Smooth" means rounded corners, gentle hover and press, a glow on the main button, and a designed state for everything (loading, empty, error, success).
- The interview room is a work area, not a showcase. It stays solid and quiet.
- Success is always green, whatever the accent is.

## 2. Themes

Colours are tokens on `:root`. `MainLayout` sets `<html data-role="user|admin">`, and `:root[data-role="admin"]` overrides the tokens. Tailwind classes read the variables, so a component never knows which theme it is in.

| | User | Admin |
|---|---|---|
| Name | Modern Minimal | Lime Frost |
| Base | Neutral dark | Dark with a frosted tint |
| Accent | Blue | Lime |
| Radius | Role-based tokens | Role-based tokens |

Shared semantic tokens:

| Token | Use |
|---|---|
| `accent` | Primary buttons, active nav, focus, links |
| `ok` | Correct, success, completed. Always green |
| `warn` | Warnings, mixed state (amber) |
| `danger` | Errors, delete, cheating (red) |
| `panel`, `bg`, `border`, `text`, `muted` | Surfaces and text |
| `--glass-*` | Glass fill, border, blur, highlight |

Why `ok` exists: the accent is blue or lime, so "Correct" in the accent colour looked wrong. Admin is not cyan or violet because red, amber and green are already taken by danger, warn and ok.

Earlier directions (violet and pink for user, cyan and blue for admin) were replaced by T1.

## 3. Typography

- One variable font family, weights 300 to 700 loaded in `index.html`.
- Headings on Login, Register and Dashboard use `ProximityText`: letters get heavier near the cursor. On touch or reduced motion it is plain text.
- Body text stays regular weight. Numbers in stat cards are bold.
- Code uses Monaco's own font in the editor.

## 4. Surfaces

Four glass classes in `index.css`:

| Class | Where | Notes |
|---|---|---|
| `glass` | Cards on Dashboard, Overview, History, My Questions, Leaderboard | Blur plus a soft inner highlight (`inset box-shadow`) |
| `glass-strong` | Login, Register, Forgot password card | One big panel. Inputs inside have no blur, so blur never stacks |
| `glass-interactive` | Cards that react on hover | Lifts a little and brightens |
| `glass-solid` | Interview room, Mini Project, Review panels, modals, toasts | No blur. Text must be easy to read |

Rules:
- Around 6 blur panels on a screen at most.
- No blur next to Monaco or an iframe.
- No `::before` highlight, because `NavItem` already uses `before:` for its active bar. Use `inset box-shadow`.
- Do not animate blur.

Light theme later: change only the token values.

## 5. Components and states

**Buttons.** Primary has an accent gradient and a glow. Hover lifts, press sinks. These rules are selectors in `index.css`, not classes on every button. Side effect: a new `bg-accent` element picks up the glow too.

**Navigation.** Floating glass sidebar. Active item is a tinted pill with an accent bar. Round rows show 1, 2, 3 badges for pick order, "Select all" and "Clear", and the count for the chosen difficulty on My Questions (for example "Medium · 8 questions"). Bottom of the sidebar: avatar, name, Logout. The avatar opens the profile popup.

**Avatar.** Round, first letter of the name. A green dot in the sidebar is decoration only.

**Cards.** `StatCard` is the base. `RoundBars`, `RecentList` and `StatCard` are shared between user and admin screens, so numbers come from one logic.

**Modals.** Native `<dialog>`. Solid. Cancel is first and focused, so a stray Enter never deletes. `OtpModal`: large OTP number, a progress bar that shrinks, countdown, one input, Verify and Resend. On expiry the number is struck, the input is disabled and Resend glows. `ProfileModal`: avatar, name, email, username, role, member since, then two separate forms (Edit name, Change password) each with its own error and loading.

**Toasts.** Success only, solid, from `toastSlice`. Errors stay inline.

**Banners.** `RoomBanner` slides in. Cheating and refresh banners stay until dismissed.

**Loaders.** `DotLoader` is a 7×7 dot grid whose dots light up in a ring. `PageLoader` wraps it and appears only after 400 ms.

**Empty and error states.** Notice cards with a short sentence and the next action. 404 has its own page.

**Score card.** Shows percentage, marks, and a penalty note if a refresh penalty applied. Mini Project shows "Not graded", never "0 / 0".

## 6. Screens

**Login and Register.** `AuthLayout` with `DotGrid` behind, kept alive when switching between Login and Register. One `glass-strong` card slides in with GSAP (`useCardSlide`). Login has "Forgot password?". Forgot password is one page with three steps (email, new password, done).

**User dashboard.** Bento layout: Start card and score trend side by side, round treemap and round radar, recent interviews with "14 / 20" and "View review →". Four stat cards on top. No fake data. Sessions and monthly sales from the inspiration were dropped because the API does not have them.

**Admin overview.** Four cards, three bars (Easy, Medium, Hard) for how questions reach users, recent imports, all-users performance, needs-more-questions list, top performers preview, buttons for Import and Add.

**Leaderboard.** Podium in the order 2, 1, 3, then a table from rank 4. Avatar, name, email, rank, score.

**History.** Rows with an inner link and a separate Delete button (no button inside an anchor). Search at the top, retention dropdown, Delete all hidden while searching. No delete for a running interview.

**Interview room.** Three areas: sidebar (Round N, questions, progress, ticks), question panel, answer panel. No Run button. Solid panels. Timer pulses red under 60 seconds. On a phone the timer is a thin sticky strip. Cheating screen: red pulse and a short shake.

**Mini Project room.** File explorer, tabbed Monaco editor, aside with Task and Preview tabs (both stay mounted so ticks and console survive), save status (Saved, Save, Saving..., Retry save) and Submit Round. Folder selected means the new file name gets that prefix, like VS Code. On a phone, a one-line note about using a larger screen.

**Review.** Question by question: my answer, correct answer, explanation. "Show only mistakes". Mini Project review shows code read-only, with files and preview. On a phone the code area is behind a "Show code" button.

**Product tour.** Four steps with a spotlight. Runs on the first visit, replay from "Take a tour". Steps whose target is off screen are skipped (for example the rounds step when the mobile drawer is closed).

## 7. Motion

Library: GSAP for card slides, CSS for the rest. Cleanup with `gsap.context`.

| Where | Effect |
|---|---|
| Every route | Fade and 12 px slide up, 300 ms. Enter only |
| Login, Register card | GSAP slide |
| Login success | Accent circle wipe (`circleWipe.js`) |
| Dashboard cards | 40 ms stagger |
| History, My Questions lists | Stagger |
| Progress bars | Fill from zero |
| Round list tick | Pop |
| Save status dot | Small pulse on change |
| Import steps | `ImportSteps` stepper |
| Timer under 60 s | Pulse |
| Cheating screen | Red pulse, shake |
| OTP Resend after expiry | `glow-pulse` |
| Auth background | `DotGrid` drift |
| Heading letters | Cursor proximity weight |

Rules:
- **Reduced motion:** fade stays, movement goes. `glow-pulse` becomes a still glow ring so the button still looks special. In the interview room only the timer pulse stays.
- Route changes animate entering only. Exit animations fight React Router and add delay.
- `DotGrid` pauses when the tab is hidden, uses fewer dots on mobile, and draws one static frame in reduced motion.
- Dot drift is on auth pages only. The dashboard already has many glass panels.

## 8. Responsive

- Phone: top bar with the avatar and a menu button. The sidebar becomes a slide-in drawer with a backdrop. It closes on Esc and on link click.
- Tables and wide content scroll inside their own container.
- The Review code workbench is collapsed by default on phones.
- Interview room layout was acceptable on a phone. Only the timer was changed.
- To check on a real device: History, My Questions, Dashboard, Leaderboard.

## 9. Accessibility

- Native dialogs: Esc and focus trap come free.
- Visible focus rings.
- Colour is never the only signal (icons, labels and text go with red and green).
- Reduced motion is respected everywhere.
- Contrast: body text on glass panels must stay readable. Where it did not, the panel became solid.

## 10. Design inspiration shortcuts

Used when asking for new UI:

| Shortcut | Source |
|---|---|
| `/motion-example` | https://motion.dev/examples |
| `/ui-ux-pro-max-example` | https://ui-ux-pro-max-skill.nextlevelbuilder.io/ |
| `/21st-dev-example` | https://21st.dev/ |

21st.dev components are TypeScript and shadcn. Port them to JSX with our tokens. Do not add the shadcn setup.

## 11. Not done

Light theme, profile pictures, a shared `Button` component, a mobile pass on History, My Questions, Dashboard and Leaderboard with real screenshots, the theory layout polish.