import './styles/index.css';

import { asset, el, img, lockScroll, prefersReducedMotion, qs, unlockScroll } from './util/dom';
import { categoryChips } from './data/navigation';
import { cashbackStrip, missionsStrip } from './data/banners';
import {
  allGames,
  halloweenGames,
  liveGames,
  newGamesGames,
  popularGames,
  topGames,
} from './data/games';
import { providers } from './data/providers';

import { createHeader } from './components/header';
import { createSidebar } from './components/sidebar';
import { createHeroCarousel } from './components/heroCarousel';
import { createRail, createSportsRail, gameCard, providerTile } from './components/rail';
import { createPromoStrip } from './components/promoStrip';
import { createFooter } from './components/footer';
import { createGameDemo } from './game';

const app = qs<HTMLDivElement>('#app');
if (!app) throw new Error('#app container is missing from index.html');

/* ------------------------------------------------------------------ shell */

const shell = el('div', { class: 'shell' });

const isCompact = (): boolean => window.matchMedia('(max-width: 1024px)').matches;

const sidebar = createSidebar();

const setDrawer = (open: boolean): void => {
  shell.classList.toggle('is-drawer-open', open);
  header.toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (open) lockScroll();
  else unlockScroll();
};

let drawerOpen = false;
const closeDrawer = (): void => {
  if (!drawerOpen) return;
  drawerOpen = false;
  setDrawer(false);
};

const header = createHeader({
  onToggleSidebar: () => {
    // Wide screens collapse the rail; narrow screens slide a drawer in.
    if (isCompact()) {
      drawerOpen = !drawerOpen;
      setDrawer(drawerOpen);
      if (drawerOpen) sidebar.querySelector<HTMLButtonElement>('.nav-item')?.focus();
      else header.toggle.focus();
    } else {
      shell.classList.toggle('is-collapsed');
    }
  },
});

const scrim = el('div', { class: 'sidebar__scrim' });
scrim.addEventListener('click', closeDrawer);

window.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || !drawerOpen) return;
  closeDrawer();
  header.toggle.focus();
});

// Closing the drawer after a nav tap keeps mobile usable.
sidebar.addEventListener('click', (event) => {
  if (isCompact() && (event.target as HTMLElement).closest('.nav-item')) closeDrawer();
});

// Leaving the compact range must not strand either state on the shell.
window.matchMedia('(max-width: 1024px)').addEventListener('change', (event) => {
  if (event.matches) shell.classList.remove('is-collapsed');
  else closeDrawer();
});

/* ----------------------------------------------------------------- chips */

/* Filter toggles, not tabs: there are no tab panels, so `aria-pressed` is the
   honest pattern. (In this layout reproduction they are visual only.) */
const chipButtons = categoryChips.map((chip, index) =>
  el(
    'button',
    {
      class: `chip${index === 0 ? ' is-active' : ''}`,
      type: 'button',
      'aria-pressed': index === 0 ? 'true' : 'false',
    },
    [img(asset(chip.icon), '', { width: 18, height: 18 }), el('span', { text: chip.label })],
  ),
);

const chips = el(
  'div',
  { class: 'chips', role: 'group', 'aria-label': 'Game categories' },
  chipButtons,
);

chipButtons.forEach((button) => {
  button.addEventListener('click', () => {
    chipButtons.forEach((c) => {
      c.classList.remove('is-active');
      c.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('is-active');
    button.setAttribute('aria-pressed', 'true');
  });
});

/* ------------------------------------------------------------- demo entry */

const demo = createGameDemo();

const scrollToDemo = (): void => {
  demo.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  });
};

/** Chicken Road 2 keeps its lobby tile, but the tile jumps to the live demo. */
const topGamesCards = topGames.map((game) =>
  game.name === 'Chicken Road 2'
    ? gameCard(game, 'Demo', scrollToDemo)
    : gameCard(game),
);

/* ------------------------------------------------------------------ main */

const main = el('main', { class: 'main', id: 'main', tabindex: '-1' }, [
  el('div', { class: 'main__inner' }, [
    el('h1', { class: 'sr-only', text: 'Wildies online casino and sportsbook - demo lobby' }),
    createHeroCarousel(),
    chips,
    createRail(topGamesCards, { title: 'Top Games', icon: 'sections/top.svg' }),
    demo,
    createRail(popularGames.map((g) => gameCard(g)), {
      title: 'Popular Games',
      icon: 'sections/popular.svg',
    }),
    createRail(halloweenGames.map((g) => gameCard(g)), {
      title: 'Halloween Hits',
      icon: 'sections/halloween.svg',
    }),
    createRail(providers.map(providerTile), {
      title: 'Providers',
      icon: 'sections/providers.svg',
    }),
    createPromoStrip(cashbackStrip),
    createRail(newGamesGames.map((g) => gameCard(g)), {
      title: 'New Games',
      icon: 'sections/new.svg',
    }),
    createRail(liveGames.map((g) => gameCard(g)), {
      title: 'Live Games',
      icon: 'sections/live.svg',
    }),
    createPromoStrip(missionsStrip),
    createSportsRail(),
    createRail(allGames.map((g) => gameCard(g)), {
      title: 'All Games',
      icon: 'sections/all.svg',
    }),
  ]),
]);

shell.append(header.element, sidebar, scrim, main, createFooter());
app.append(shell);

/* Placeholder links exist only to mirror the reference layout - keep them inert. */
app.addEventListener('click', (event) => {
  const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href="#"]');
  if (link) event.preventDefault();
});
