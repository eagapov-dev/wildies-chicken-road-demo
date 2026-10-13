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
| Language | **TypeScript** (strict) | Type safety for the game state machine without a framework runtime. |
| UI | **Vanilla TS + a small `el()` DOM helper** | The page is content-driven markup; a framework would add weight without adding value. Components are plain functions returning `HTMLElement`. |
| Styling | **Hand-written CSS**, custom properties, container queries | Design tokens are sampled from the reference site; container queries let the hero slides scale their own typography. |
| Game | **Canvas 2D** + `requestAnimationFrame` | Smooth traffic, camera follow, hop animation and particles at 60 fps. |
| Fonts | Montserrat (Google Fonts) | Same family as the reference. |

No UI framework, no CSS framework, no runtime dependencies — the shipped bundle is **~53 kB JS /
~29 kB CSS** (≈17 kB + 7 kB gzipped).

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

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build      # type-check (tsc) + production build into dist/
npm run preview    # serve the production build locally
```

Requires Node 20+.

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

## Responsiveness & accessibility

* Desktop ≥1440px → 6 cards per rail; collapsible sidebar rail.
* ≤1024px → the sidebar becomes an off-canvas drawer with a scrim; the burger toggles it.
* ≤920px → 4 cards per rail; the game switches to stage-on-top / controls-below.
* ≤768px → 3 cards; one hero slide per view; search collapses.
* ≤560px → ~2.4 cards; square game stage; single-column footer.

Also: semantic landmarks, a skip link, visible focus rings, `aria-label`s on icon-only controls,
focus-trapped modals with Escape-to-close and focus restore, `prefers-reduced-motion` support
(carousel autoplay, hop animation and particles all respect it), and a `requestAnimationFrame`
fallback so the game can never lock up if the visitor switches tabs mid-hop.

---

## Asset attribution

Images (logos, banners, game thumbnails, provider and payment marks) were taken from the public
wildies16.com front page for the purpose of reproducing its layout in this assessment, converted to
WebP, and served locally rather than hot-linked. All trademarks belong to their respective owners.
The Chicken Road 2 scene itself is an original canvas recreation — no InOut game code or art is used.
