import { asset, el, img } from '../util/dom';
import { primaryNav, socialLinks } from '../data/navigation';
import { icons } from './icons';

export function createSidebar(): HTMLElement {
  const nav = el(
    'nav',
    { class: 'sidebar__nav', 'aria-label': 'Primary' },
    primaryNav.map((item, index) => {
      const button = el(
        'button',
        {
          class: `nav-item${index === 0 ? ' is-active' : ''}`,
          type: 'button',
          'aria-current': index === 0 ? 'page' : undefined,
        },
        [
          img(asset(item.icon), '', { class: 'nav-item__icon', width: 20, height: 20 }),
          el('span', { class: 'nav-item__label', text: item.label }),
          item.expandable ? el('span', { class: 'nav-item__caret', html: icons.caretDown }) : null,
        ],
      );

      button.addEventListener('click', () => {
        nav.querySelectorAll('.nav-item').forEach((n) => {
          n.classList.remove('is-active');
          n.removeAttribute('aria-current');
        });
        button.classList.add('is-active');
        button.setAttribute('aria-current', 'page');
      });

      return button;
    }),
  );

  const foot = el('div', { class: 'sidebar__foot' }, [
    el('button', { class: 'sidebar__chip', type: 'button' }, [
      el('span', { html: icons.globe }),
      el('span', { class: 'select__label', text: 'English' }),
      el('span', { class: 'caret', html: icons.caretDown }),
    ]),
    el('button', { class: 'sidebar__chip', type: 'button' }, [
      el('span', { html: icons.chat }),
      el('span', { class: 'select__label', text: 'Support' }),
    ]),
    el(
      'div',
      { class: 'sidebar__social' },
      socialLinks.map((s) =>
        el('a', { class: 'social-btn', href: '#', 'aria-label': s.label }, [
          img(asset(s.icon), '', { width: 15, height: 15 }),
        ]),
      ),
    ),
  ]);

  return el('aside', { class: 'sidebar', id: 'sidebar' }, [
    nav,
    el('div', { class: 'sidebar__divider' }),
    foot,
  ]);
}
