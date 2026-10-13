import { asset, el, img } from '../util/dom';
import type { PromoStrip } from '../data/banners';

export function createPromoStrip(promo: PromoStrip): HTMLElement {
  return el('section', { class: 'promo-strip' }, [
    img(asset(promo.image), ''),
    el('div', { class: 'promo-strip__body' }, [
      el('h3', { class: 'promo-strip__title', text: promo.title }),
      ...promo.lines.map((line) => el('p', { class: 'promo-strip__line', text: line })),
      el('a', { class: 'btn btn--purple btn--sm promo-strip__cta', href: '#', text: promo.cta }),
    ]),
  ]);
}
