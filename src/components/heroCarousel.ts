import { asset, el, img, prefersReducedMotion } from '../util/dom';
import { heroSlides } from '../data/banners';
import { icons } from './icons';

const AUTOPLAY_MS = 6000;

export function createHeroCarousel(): HTMLElement {
  const slides = heroSlides.map((slide, index) =>
    el(
      'a',
      {
        class: `hero-slide${slide.wide ? ' hero-slide--wide' : ''}`,
        href: '#chicken-road-2-demo',
        'aria-label': `${slide.kicker ?? ''} ${slide.title}`.trim(),
      },
      [
        img(asset(slide.image), '', {
          class: 'hero-slide__img',
          'aria-hidden': 'true',
          loading: index < 2 ? 'eager' : 'lazy',
          fetchpriority: index === 0 ? 'high' : 'auto',
        }),
        el('div', { class: 'hero-slide__body' }, [
          slide.kicker ? el('span', { class: 'hero-slide__kicker', text: slide.kicker }) : null,
          el('span', { class: 'hero-slide__title', text: slide.title }),
          slide.subtitle ? el('span', { class: 'hero-slide__subtitle', text: slide.subtitle }) : null,
          el('span', { class: 'btn btn--purple btn--sm hero-slide__cta', text: slide.cta }),
        ]),
      ],
    ),
  );

  const track = el(
    'div',
    { class: 'hero__track', role: 'region', 'aria-label': 'Promotions', tabindex: '0' },
    slides,
  );
  const counter = el('span', { class: 'hero__count', text: `1/${slides.length}` });

  const prev = el('button', {
    class: 'icon-btn',
    type: 'button',
    'aria-label': 'Previous promotion',
    unsafeHTML: icons.chevronLeft,
  });
  const next = el('button', {
    class: 'icon-btn',
    type: 'button',
    'aria-label': 'Next promotion',
    unsafeHTML: icons.chevronRight,
  });

  const activeIndex = (): number => {
    let best = 0;
    let bestDistance = Infinity;
    slides.forEach((slide, i) => {
      const distance = Math.abs(slide.offsetLeft - track.offsetLeft - track.scrollLeft);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    });
    return best;
  };

  const goTo = (index: number): void => {
    const target = slides[(index + slides.length) % slides.length];
    if (!target) return;
    track.scrollTo({
      left: target.offsetLeft - track.offsetLeft,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  prev.addEventListener('click', () => goTo(activeIndex() - 1));
  next.addEventListener('click', () => goTo(activeIndex() + 1));

  track.addEventListener('scroll', () => {
    counter.textContent = `${activeIndex() + 1}/${slides.length}`;
  });

  const hero = el('section', { class: 'hero' }, [
    track,
    el('div', { class: 'hero__nav' }, [prev, counter, next]),
  ]);

  if (!prefersReducedMotion()) {
    let timer = window.setInterval(() => goTo(activeIndex() + 1), AUTOPLAY_MS);
    const stop = (): void => window.clearInterval(timer);
    const start = (): void => {
      stop();
      timer = window.setInterval(() => goTo(activeIndex() + 1), AUTOPLAY_MS);
    };
    hero.addEventListener('pointerenter', stop);
    hero.addEventListener('pointerleave', start);
    hero.addEventListener('focusin', stop);
    hero.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  }

  return hero;
}
