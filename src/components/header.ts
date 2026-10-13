import { asset, el } from '../util/dom';
import { icons } from './icons';
import { openAuthModal } from './authModal';

interface HeaderOptions {
  onToggleSidebar: () => void;
}

export interface Header {
  element: HTMLElement;
  /** Exposed so the shell can keep `aria-expanded` in sync with the drawer. */
  toggle: HTMLButtonElement;
}

export function createHeader({ onToggleSidebar }: HeaderOptions): Header {
  const toggle = el('button', {
    class: 'header__toggle',
    type: 'button',
    'aria-label': 'Navigation menu',
    'aria-controls': 'sidebar',
    'aria-expanded': 'false',
    unsafeHTML: icons.collapse,
  });
  toggle.addEventListener('click', onToggleSidebar);

  const brand = el('div', { class: 'header__brand' }, [
    toggle,
    el('a', { href: '#', class: 'header__logo-link', 'aria-label': 'Wildies home' }, [
      el('img', {
        src: asset('icons/logo.svg'),
        alt: 'Wildies',
        class: 'header__logo',
        width: 150,
        height: 32,
      }),
    ]),
  ]);

  const search = el('div', { class: 'search' }, [
    el('span', { class: 'search__icon', unsafeHTML: icons.search }),
    el('input', {
      class: 'search__input',
      type: 'search',
      placeholder: 'Game | Provider | Category',
      'aria-label': 'Search games, providers and categories',
    }),
  ]);

  const login = el('button', { class: 'btn btn--ghost', type: 'button', text: 'Login' });
  const register = el('button', { class: 'btn btn--primary', type: 'button', text: 'Register' });
  login.addEventListener('click', () => openAuthModal('login'));
  register.addEventListener('click', () => openAuthModal('signup'));

  const element = el('header', { class: 'header' }, [
    brand,
    el('div', { class: 'header__spacer' }),
    search,
    el('div', { class: 'header__actions' }, [login, register]),
  ]);

  return { element, toggle };
}
