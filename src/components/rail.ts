import { asset, el, img } from '../util/dom';
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

/** Section header + horizontally scrollable rail with arrow controls. */
export function createRail(items: HTMLElement[], options: RailOptions): HTMLElement {
  const rail = el('div', { class: `rail ${options.modifier ?? 'rail--6'}` }, items);

  const prev = el('button', {
    class: 'icon-btn',
    type: 'button',
    'aria-label': `Scroll ${options.title} left`,
    html: icons.chevronLeft,
  });
  const next = el('button', {
    class: 'icon-btn',
    type: 'button',
    'aria-label': `Scroll ${options.title} right`,
    html: icons.chevronRight,
  });

  const page = (direction: 1 | -1): void => {
    rail.scrollBy({ left: direction * Math.round(rail.clientWidth * 0.8), behavior: 'smooth' });
  };

  prev.addEventListener('click', () => page(-1));
  next.addEventListener('click', () => page(1));

  const syncArrows = (): void => {
    const max = rail.scrollWidth - rail.clientWidth - 2;
    prev.disabled = rail.scrollLeft <= 2;
    next.disabled = rail.scrollLeft >= max;
  };

  rail.addEventListener('scroll', syncArrows, { passive: true });
  window.addEventListener('resize', syncArrows);
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
      img(asset(game.thumb), `${game.name} - ${game.provider}`, { width: 198, height: 294 }),
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
  return el('a', { class: 'provider-tile', href: '#', 'aria-label': provider.name }, [
    img(asset(provider.logo), provider.name, { width: 120, height: 34 }),
    el('span', { text: `${provider.games} Games` }),
  ]);
}

export function createSportsRail(): HTMLElement {
  const tiles = sportsTiles.map((tile) =>
    el('a', { class: 'sports-tile', href: '#', 'aria-label': tile.name }, [
      img(asset(tile.icon), '', { width: 358, height: 496 }),
      el('span', { text: tile.name }),
    ]),
  );

  return createRail(tiles, {
    title: 'Sports',
    icon: 'sections/sports.svg',
  });
}
