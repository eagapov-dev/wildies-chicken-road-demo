import { asset, el, img } from '../util/dom';
import { icons } from './icons';
import { openModal } from './modal';

type AuthTab = 'login' | 'signup';

/**
 * Visual reproduction of the reference auth modal.
 * It is intentionally inert: nothing is submitted, stored or transmitted,
 * because this build is a layout assessment, not a real operator site.
 */
export function openAuthModal(initialTab: AuthTab = 'signup'): void {
  const content = el('div', { class: 'auth' });

  const aside = el('div', { class: 'auth__aside' }, [
    el('h3', { text: initialTab === 'login' ? 'Welcome back' : 'Welcome to' }),
    el('strong', { text: 'Enter Wildies' }),
    img(asset('banners/slider-4.webp'), '', { loading: 'eager' }),
  ]);

  const main = el('div', { class: 'auth__main' });

  const tabSignup = el('button', { class: 'auth__tab', type: 'button', text: 'Sign Up' });
  const tabLogin = el('button', { class: 'auth__tab', type: 'button', text: 'Login' });
  const tabs = el('div', { class: 'auth__tabs', role: 'tablist' }, [tabSignup, tabLogin]);

  const form = el('form', { class: 'auth__form', novalidate: true });
  const submit = el('button', { class: 'btn btn--primary btn--block', type: 'submit' });
  const feedback = el('p', { class: 'auth__note', role: 'status' });

  const render = (tab: AuthTab): void => {
    tabSignup.classList.toggle('is-active', tab === 'signup');
    tabLogin.classList.toggle('is-active', tab === 'login');
    aside.querySelector('h3')!.textContent = tab === 'login' ? 'Welcome back' : 'Welcome to';

    form.replaceChildren(
      el('div', { class: 'auth__field' }, [
        el('input', {
          class: 'auth__input',
          type: 'text',
          placeholder: tab === 'login' ? 'Username / Email' : 'Email',
          autocomplete: 'off',
          'aria-label': tab === 'login' ? 'Username or email' : 'Email',
        }),
      ]),
      el('div', { class: 'auth__field' }, [
        el('input', {
          class: 'auth__input',
          type: 'password',
          placeholder: 'Password',
          autocomplete: 'new-password',
          'aria-label': 'Password',
        }),
      ]),
      el('div', { class: 'auth__row' }, [
        el('label', {}, [
          el('input', { type: 'checkbox', style: 'margin-right:8px' }),
          document.createTextNode(tab === 'login' ? 'Remember Me' : 'I am 18+ and accept the Terms'),
        ]),
        tab === 'login'
          ? el('a', { class: 'auth__link', href: '#', text: 'Forgot Password?' })
          : null,
      ]),
      submit,
      el('div', { class: 'auth__row', style: 'justify-content:center;margin:16px 0 10px' }, [
        el('span', { text: 'or' }),
      ]),
      el('button', { class: 'btn btn--ghost btn--block', type: 'button' }, [
        el('span', { html: icons.google }),
        document.createTextNode(tab === 'login' ? 'Login with Google' : 'Sign up with Google'),
      ]),
      feedback,
    );

    submit.textContent = tab === 'login' ? 'Login' : 'Create Account';
    feedback.textContent =
      'Demo interface for a technical assessment - this form is inactive. No account is created and nothing is sent anywhere.';
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    feedback.textContent =
      'This is a non-functional demo form. No account was created and no data left your browser.';
  });

  tabSignup.addEventListener('click', () => render('signup'));
  tabLogin.addEventListener('click', () => render('login'));

  main.append(tabs, form);
  content.append(aside, main);
  render(initialTab);

  openModal(content, { label: 'Sign up or log in', panelClass: 'auth-panel' });
}
