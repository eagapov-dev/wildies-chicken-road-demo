# Wildies — landing page + Chicken Road 2 interactive demo

A reproduction of the [wildies16.com](https://wildies16.com/) casino lobby layout, extended with a
playable **Chicken Road 2** demonstration that visitors can try before registering.

Built as a practical technical test. **It is not a live casino and not affiliated with the operator.**

**Live demo → https://eagapov-dev.github.io/wildies-chicken-road-demo/**
**Source → https://github.com/eagapov-dev/wildies-chicken-road-demo**

---

## ⚠️ Test-environment disclosure

This build is deliberately and visibly a simulation:

| | |
|---|---|
| **Money** | None. The only balance is "demo credits" (`FUN`), play money that exists in the browser tab. |
| **Outcomes** | Pre-set to winning ones, as the brief requires. There is no RNG that can produce a loss — traffic is actively steered away from the chicken so a collision can never be rendered. |
| **Bonus** | After two completed rounds a pop-up reads *"You've won a bonus"* with a **Claim Bonus** button. The bonus credits 500 demo credits and is labelled *Simulated · Test environment* in the pop-up, with explicit wording that it has no monetary value and is not withdrawable or redeemable. |
| **Accounts** | The Login/Register modal is a visual reproduction only. It submits nothing, stores nothing and transmits nothing. |
| **Payments** | No deposit, withdrawal or payment flow exists anywhere in the code. |

Disclosures appear in four places: a badge row on the game header, a notice in the control panel, a
strip under the game, and a block in the page footer. The page is also marked `noindex, nofollow`.

---

## Tech stack

| Area | Choice | Why |
|---|---|---|
| Build | **Vite 8** | Fast dev server, zero-config static output. |
| Language | **TypeScript**, `strict` + `noUncheckedIndexedAccess` | Type safety for the game state machine without a framework runtime. |
| UI | **Vanilla TS + a small `el()` DOM helper** | The page is content-driven markup; a framework would add weight without adding value. Components are plain functions returning `HTMLElement`. |
| Styling | **Hand-written CSS**, custom properties, container queries | Design tokens are sampled from the reference site; container queries let the hero slides scale their own typography. |
| Game | **Canvas 2D** + `requestAnimationFrame` | Smooth traffic, camera follow, hop animation and particles at 60 fps. |
| Fonts | Montserrat (Google Fonts) | Same family as the reference. |

No UI framework, no CSS framework, no runtime dependencies — the shipped bundle is **~55 kB JS /
~31 kB CSS** (≈18 kB + 7 kB gzipped).

---

## What to look at first

1. Open the live link — the lobby mirrors the reference layout (header, sidebar, hero carousel,
   category chips, game rails, provider grid, promo strips, sports rail, footer).
2. Scroll to **Try before you register**, or click the `DEMO`-badged **Chicken Road 2** tile in
   Top Games, which jumps straight to it.
3. Press **Start the demo → Play → Go** a couple of times, then **Cash out**.
4. Repeat once. After the second completed round the **"You've won a bonus"** pop-up appears.
5. Resize the window (or use device emulation) down to ~390px — the sidebar becomes a drawer and
   the game stacks stage-over-controls.

## Running it locally

Requires **Node 20 or newer** (check with `node -v`). Nothing else: no database, no backend,
no environment variables, no API keys — it is a fully static site.

```bash
git clone https://github.com/eagapov-dev/wildies-chicken-road-demo.git
cd wildies-chicken-road-demo
npm install
npm run dev
```

Then open **http://localhost:5173**. If you received a ZIP instead, unpack it and start from
`npm install`.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload on http://localhost:5173 |
| `npm run build` | Type-checks with `tsc`, then builds to `dist/` |
| `npm run preview` | Serves the built `dist/` locally, to check the production bundle |
| `npm run typecheck` | Type-check only, no build |

`npm run build` is what CI runs; it fails on any type error, so a green build means the
TypeScript is clean.

---

## How the demo plays

1. Pick a **difficulty** — Easy (9 lanes) · Medium (7) · Hard (6) · Hardcore (5). Fewer lanes, bigger
   multiplier steps.
2. Set a **bet** in demo credits (1–100) and press **Play**.
3. Press **Go** (or tap the stage, or press <kbd>Space</kbd>/<kbd>→</kbd>) to cross one lane at a
   time. Each lane raises the multiplier.
4. **Cash out** at any point (or press <kbd>C</kbd>) to bank the simulated win; reaching the far kerb
   auto-settles at the top multiplier.
5. After **two completed rounds**, the bonus pop-up appears.

Keyboard, pointer and touch all work; the stage is tappable on mobile.

---

## Project structure

```
index.html                 Document shell
public/assets/             Images sourced from the reference site (WebP/SVG)
src/
  main.ts                  Composes the page
  util/dom.ts              el()/img() helpers, base-aware asset URLs, scroll lock
  data/                    Content as typed data (nav, banners, games, providers, payments, sports)
  components/              header, sidebar, hero carousel, rails/cards, promo strips, footer,
                           generic accessible modal, auth modal
  game/
    config.ts              Difficulties, multiplier tables, bet limits, bonus constants
    engine.ts              Pure state machine — no DOM, no canvas, no RNG-driven losses
    scene.ts               Canvas renderer: road, traffic, chicken, particles, camera
    bonusModal.ts          "You've won a bonus" pop-up
    index.ts               Wires engine ↔ scene ↔ controls
  styles/                  tokens → base → layout → components → hero → game → modal → footer →
                           responsive (imported by styles/index.css)
```

The engine is deliberately separate from the renderer: `engine.ts` has no DOM access, so the game
rules are readable and testable on their own, and the canvas layer is purely presentational.

---

## Responsiveness

* Desktop ≥1440px → 6 cards per rail; collapsible sidebar rail.
* ≤1024px → the sidebar becomes an off-canvas drawer with a scrim; the burger toggles it, and
  the rails step **up** to 5 columns so cards do not grow as the viewport shrinks.
* ≤920px → 4 cards per rail; the game switches to stage-on-top / controls-below.
* ≤768px → one hero slide per view; search collapses; the rail gap tightens to 10px.
* ≤680px → 3 cards. ≤560px → ~2.4 cards, square game stage, single-column footer.

Every column formula derives from a single `--rail-gap` token, so the gap and the arithmetic cannot
drift apart. Verified at 360 / 430 / 600 / 768 / 1024 px with an automated check for horizontal
overflow and off-viewport elements.

## Accessibility

What is implemented and verified in the source:

* **Landmarks and headings** — `header` / `nav` / `main` / `contentinfo`, with an `sr-only` `<h1>`.
* **Skip link** to a focusable `<main tabindex="-1">`.
* **Keyboard play** — Space / → cross a lane, `C` cashes out. The transient lock between steps uses
  `aria-disabled`, not the `disabled` attribute, because a disabled element is blurred by the
  browser and keyboard play would break after the first move.
* **Status announcements** — a persistent `role="status"` region in the stage announces each lane,
  the multiplier, the cash-out value and the round result. The canvas itself is `aria-hidden`: it
  is a picture of state that already exists as text.
* **Modals** — focus trap (including the Shift+Tab edge case from the panel itself), Escape to
  close, focus restore, scroll lock, and the page behind is `inert` + `aria-hidden`. The bonus
  pop-up is an `alertdialog` labelled by its heading.
* **Reduced motion** — respected by the CSS animations, the carousel autoplay, the hop, the
  particles, JS smooth-scrolling, *and* the canvas loop (it paints one static frame instead of
  running rAF).
* **Contrast** — `--green` was darkened to `#0f8a52` (white on it: 4.6:1, was 2.76:1) and
  `--text-faint` lightened to `#8e9196`; the dim/gold/green text tokens were checked against the
  surfaces they actually appear on.
* **Focus visibility** — one global `:focus-visible` ring, with no rule removing it without a
  replacement.
* **Forms** — real `<label>`s and correct `autocomplete` tokens in the auth modal; icon-only
  controls carry `aria-label`s; the drawer toggle exposes `aria-expanded` / `aria-controls`.
* Closed off-canvas drawer is `visibility: hidden`, so it leaves the tab order.

**Known limitations** (stated rather than papered over): this has not been through a screen-reader
session or an automated axe run, so it is not claimed as WCAG 2.2 AA conformant. The decorative
lobby tiles are `<a href="#">` placeholders that go nowhere — faithful to the reference layout, but
they add inert stops for keyboard and screen-reader users. The hero carousel pauses on hover, focus
and reduced motion but has no explicit pause button.

## Asset attribution

Images (logos, banners, game thumbnails, provider and payment marks) were taken from the public
wildies16.com front page for the purpose of reproducing its layout in this assessment, converted to
WebP, and served locally rather than hot-linked. All trademarks belong to their respective owners.
The Chicken Road 2 scene itself is an original canvas recreation — no InOut game code or art is used.
