import { asset, el, img } from '../util/dom';
import { footerColumns, socialLinks } from '../data/navigation';
import { footerProviderLogos } from '../data/providers';
import { paymentLogos } from '../data/payments';

export function createFooter(): HTMLElement {
  return el('footer', { class: 'footer' }, [
    el('div', { class: 'footer__inner' }, [
      el(
        'div',
        { class: 'logo-strip logo-strip--providers' },
        footerProviderLogos.map((logo) => img(asset(logo), '')),
      ),
      el(
        'div',
        { class: 'logo-strip logo-strip--payments' },
        paymentLogos.map((p) => img(asset(p.logo), p.name)),
      ),
      el('div', { class: 'footer__brand' }, [
        img(asset('icons/logo.svg'), 'Wildies', { width: 150, height: 32 }),
        el('p', { class: 'footer__copy', text: `© ${new Date().getFullYear()} Casino. All rights reserved.` }),
      ]),
      el('div', { class: 'footer__grid' }, [
        el('div', { class: 'footer__age', text: '18+' }),
        ...footerColumns.map((column) =>
          el('div', { class: 'footer__col' }, [
            el('h4', { text: column.title }),
            el(
              'ul',
              {},
              column.links.map((link) => el('li', {}, [el('a', { href: '#', text: link })])),
            ),
          ]),
        ),
        el('div', { class: 'footer__col' }, [
          el('h4', { text: 'Social Media' }),
          el(
            'div',
            { class: 'footer__social' },
            socialLinks.map((s) =>
              el('a', { href: '#', 'aria-label': s.label }, [img(asset(s.icon), '')]),
            ),
          ),
        ]),
      ]),
      el('p', { class: 'footer__disclaimer' }, [
        el('strong', { text: 'Assessment build - not a live casino. ' }),
        document.createTextNode(
          'This page is an unaffiliated technical-test reproduction of the wildies16.com layout. ' +
            'No accounts, deposits, withdrawals or real-money wagering exist here. ' +
            'The Chicken Road 2 demo runs on simulated outcomes with play-money credits and awards no prize of any kind. ',
        ),
        el('strong', { text: '18+ - play responsibly.' }),
      ]),
    ]),
  ]);
}
