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

  // Two buttons that swap one form - `aria-pressed` toggles, not an ARIA tablist
  // (there are no tab panels to point at).
  const tabSignup = el('button', {
    class: 'auth__tab',
    type: 'button',
    text: 'Sign Up',
    'aria-pressed': 'false',
  });
  const tabLogin = el('button', {
    class: 'auth__tab',
    type: 'button',
    text: 'Login',
    'aria-pressed': 'false',
  });
  const tabs = el('div', { class: 'auth__tabs', role: 'group', 'aria-label': 'Account' }, [
    tabSignup,
    tabLogin,
  ]);

  const form = el('form', { class: 'auth__form', novalidate: true });

  /** Visible label + input, so the label survives the first keystroke. */
  const field = (
    id: string,
    label: string,
    attrs: { type: string; autocomplete: string },
  ): HTMLElement =>
    el('div', { class: 'auth__field' }, [
      el('label', { class: 'auth__label', for: id, text: label }),
      el('input', { class: 'auth__input', id, name: id, ...attrs }),
    ]);
  const submit = el('button', { class: 'btn btn--primary btn--block', type: 'submit' });
  const feedback = el('p', { class: 'auth__note' });
  const formStatus = el('p', { class: 'auth__note', role: 'status', 'aria-live': 'polite' });

  const render = (tab: AuthTab): void => {
    tabSignup.classList.toggle('is-active', tab === 'signup');
    tabLogin.classList.toggle('is-active', tab === 'login');
    tabSignup.setAttribute('aria-pressed', tab === 'signup' ? 'true' : 'false');
    tabLogin.setAttribute('aria-pressed', tab === 'login' ? 'true' : 'false');
    aside.querySelector('h3')!.textContent = tab === 'login' ? 'Welcome back' : 'Welcome to';

    form.replaceChildren(
      field(
        tab === 'login' ? 'auth-identifier' : 'auth-email',
        tab === 'login' ? 'Username or email' : 'Email',
        {
          type: tab === 'login' ? 'text' : 'email',
          autocomplete: tab === 'login' ? 'username' : 'email',
        },
      ),
      field('auth-password', 'Password', {
        type: 'password',
        autocomplete: tab === 'login' ? 'current-password' : 'new-password',
      }),
      el('div', { class: 'auth__row' }, [
        el('label', {}, [
          el('input', { type: 'checkbox' }),
          document.createTextNode(tab === 'login' ? 'Remember Me' : 'I am 18+ and accept the Terms'),
        ]),
        tab === 'login'
          ? el('a', { class: 'auth__link', href: '#', text: 'Forgot Password?' })
          : null,
      ]),
      submit,
      formStatus,
      el('div', { class: 'auth__row auth__row--divider' }, [el('span', { text: 'or' })]),
      el('button', { class: 'btn btn--ghost btn--block', type: 'button' }, [
        el('span', { unsafeHTML: icons.google }),
        document.createTextNode(tab === 'login' ? 'Login with Google' : 'Sign up with Google'),
      ]),
      feedback,
    );

    submit.textContent = tab === 'login' ? 'Login' : 'Create Account';
    feedback.textContent =
      'Demo interface for a technical assessment - this form is inactive. No account is created and nothing is sent anywhere.';
    formStatus.textContent = '';
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    formStatus.textContent =
      'This is a non-functional demo form. No account was created and no data left your browser.';
  });

  tabSignup.addEventListener('click', () => render('signup'));
  tabLogin.addEventListener('click', () => render('login'));

  main.append(tabs, form);
  content.append(aside, main);
  render(initialTab);

  openModal(content, { label: 'Sign up or log in', panelClass: 'auth-panel' });
}
