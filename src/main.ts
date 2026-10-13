import './styles/index.css';

import { el, qs } from './util/dom';
import { categoryChips } from './data/navigation';
import { asset, img } from './util/dom';
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

const app = qs<HTMLDivElement>('#app')!;

/* ------------------------------------------------------------------ shell */

const shell = el('div', { class: 'shell' });

const isCompact = (): boolean => window.matchMedia('(max-width: 1024px)').matches;

const header = createHeader({
  onToggleSidebar: () => {
    // Wide screens collapse the rail; narrow screens slide a drawer in.
    shell.classList.toggle(isCompact() ? 'is-drawer-open' : 'is-collapsed');
  },
});

const sidebar = createSidebar();
const scrim = el('div', { class: 'sidebar__scrim' });
scrim.addEventListener('click', () => shell.classList.remove('is-drawer-open'));

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') shell.classList.remove('is-drawer-open');
});

// Closing the drawer after a nav tap keeps mobile usable.
sidebar.addEventListener('click', (event) => {
  if (isCompact() && (event.target as HTMLElement).closest('.nav-item')) {
    shell.classList.remove('is-drawer-open');
  }
});

/* ----------------------------------------------------------------- chips */

const chips = el(
  'div',
  { class: 'chips', role: 'tablist', 'aria-label': 'Game categories' },
  categoryChips.map((chip, index) => {
    const button = el(
      'button',
      {
        class: `chip${index === 0 ? ' is-active' : ''}`,
        type: 'button',
        role: 'tab',
        'aria-selected': index === 0 ? 'true' : 'false',
      },
      [img(asset(chip.icon), '', { width: 18, height: 18 }), el('span', { text: chip.label })],
    );

    button.addEventListener('click', () => {
      chips.querySelectorAll('.chip').forEach((c) => {
        c.classList.remove('is-active');
        c.setAttribute('aria-selected', 'false');
      });
      button.classList.add('is-active');
      button.setAttribute('aria-selected', 'true');
    });

    return button;
  }),
);

/* ------------------------------------------------------------- demo entry */

const demo = createGameDemo();

const scrollToDemo = (): void => {
  demo.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/** Chicken Road 2 keeps its lobby tile, but the tile jumps to the live demo. */
const topGamesCards = topGames.map((game) =>
  game.name === 'Chicken Road 2'
    ? gameCard(game, 'Demo', scrollToDemo)
    : gameCard(game),
);

/* ------------------------------------------------------------------ main */

const main = el('main', { class: 'main', id: 'main' }, [
  el('div', { class: 'main__inner' }, [
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
    createRail(providers.slice(0, 18).map(providerTile), {
      title: 'Providers',
      icon: 'sections/providers.svg',
      modifier: 'rail--providers',
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
  createFooter(),
]);

shell.append(header, sidebar, scrim, main);
app.append(shell);

/* Placeholder links exist only to mirror the reference layout - keep them inert. */
app.addEventListener('click', (event) => {
  const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href="#"]');
  if (link) event.preventDefault();
});

/* Section titles use Title Case in data but the reference renders them upper. */
document.querySelectorAll<HTMLElement>('.section__title').forEach((node) => {
  node.textContent = node.textContent?.toUpperCase() ?? '';
});
