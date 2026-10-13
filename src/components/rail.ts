import { asset, el, img, prefersReducedMotion } from '../util/dom';

/** Must match --rail-gap in the stylesheet. */
const RAIL_GAP = 14;
import { icons } from './icons';
import type { Game } from '../data/games';
import type { Provider } from '../data/providers';
import { sportsTiles } from '../data/sports';

interface RailOptions {
  title: string;
  icon: string;
  modifier?: string;
  /** Adds a "View All" pill next to the arrows, like the reference lobby. */
  viewAll?: boolean;
  id?: string;
}

/* One resize listener for every rail on the page, batched into a single frame:
   all reads happen together, then all writes. */
const arrowSyncs = new Set<() => void>();
let syncQueued = false;

window.addEventListener('resize', () => {
  if (syncQueued) return;
  syncQueued = true;
  requestAnimationFrame(() => {
    syncQueued = false;
    for (const sync of arrowSyncs) sync();
  });
});

/** Section header + horizontally scrollable rail with arrow controls. */
export function createRail(items: HTMLElement[], options: RailOptions): HTMLElement {
  const rail = el('div', { class: `rail ${options.modifier ?? 'rail--6'}` }, items);

  const prev = el('button', {
    class: 'icon-btn',
    type: 'button',
    'aria-label': `Scroll ${options.title} left`,
    unsafeHTML: icons.chevronLeft,
  });
  const next = el('button', {
    class: 'icon-btn',
    type: 'button',
    'aria-label': `Scroll ${options.title} right`,
    unsafeHTML: icons.chevronRight,
  });

  /** Page by whole columns so the scroll always lands on a snap point. */
  const page = (direction: 1 | -1): void => {
    const first = rail.firstElementChild;
    const step = first ? first.getBoundingClientRect().width + RAIL_GAP : rail.clientWidth * 0.8;
    const columns = Math.max(1, Math.floor((rail.clientWidth + RAIL_GAP) / step) - 1);
    rail.scrollBy({
      left: direction * Math.round(step * columns),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  prev.addEventListener('click', () => page(-1));
  next.addEventListener('click', () => page(1));

  const syncArrows = (): void => {
    const max = rail.scrollWidth - rail.clientWidth - 2;
    prev.disabled = rail.scrollLeft <= 2;
    next.disabled = rail.scrollLeft >= max;
  };

  rail.addEventListener('scroll', syncArrows, { passive: true });
  arrowSyncs.add(syncArrows);
  requestAnimationFrame(syncArrows);

  return el('section', { class: 'section', id: options.id }, [
    el('div', { class: 'section__head' }, [
      img(asset(options.icon), '', { class: 'section__icon', width: 26, height: 26 }),
      el('h2', { class: 'section__title', text: options.title }),
      el('div', { class: 'section__tools' }, [
        options.viewAll === false
          ? null
          : el('a', { class: 'view-all', href: '#', text: 'View All' }),
        prev,
        next,
      ]),
    ]),
    rail,
  ]);
}

export function gameCard(game: Game, badge?: string, onClick?: () => void): HTMLElement {
  const card = el(
    'a',
    {
      class: `game-card${badge ? ' game-card--demo' : ''}`,
      href: onClick ? '#chicken-road-2-demo' : '#',
      'aria-label': `${game.name} by ${game.provider}`,
    },
    [
      badge ? el('span', { class: 'game-card__badge', text: badge }) : null,
      img(asset(game.thumb), '', { width: 198, height: 294 }),
      el('span', { class: 'game-card__overlay' }, [
        el('span', { class: 'game-card__name', text: game.name }),
        el('span', { class: 'game-card__provider', text: game.provider }),
        el('span', { class: 'btn btn--primary btn--sm', text: onClick ? 'Play Demo' : 'Play' }),
      ]),
    ],
  );

  if (onClick) {
    card.addEventListener('click', (event) => {
      event.preventDefault();
      onClick();
    });
  } else {
    card.addEventListener('click', (event) => event.preventDefault());
  }

  return card;
}

export function providerTile(provider: Provider): HTMLElement {
  // No aria-label: the visible logo alt plus the count form the accessible name.
  return el('a', { class: 'provider-tile', href: '#' }, [
    img(asset(provider.logo), provider.name, { width: 120, height: 34 }),
    el('span', { text: `${provider.games} Games` }),
  ]);
}

export function createSportsRail(): HTMLElement {
  const tiles = sportsTiles.map((tile) =>
    el('a', { class: 'sports-tile', href: '#' }, [
      img(asset(tile.icon), '', { width: 358, height: 496 }),
      el('span', { text: tile.name }),
    ]),
  );

  return createRail(tiles, {
    title: 'Sports',
    icon: 'sections/sports.svg',
  });
}
