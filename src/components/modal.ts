import { el, lockScroll, unlockScroll } from '../util/dom';
import { icons } from './icons';

export interface ModalHandle {
  root: HTMLElement;
  close: () => void;
}

interface ModalOptions {
  panelClass?: string;
  label: string;
  /** Use `alertdialog` for pop-ups that interrupt and require a decision. */
  role?: 'dialog' | 'alertdialog';
  labelledBy?: string;
  /** Set to false for modals that must be acted on (still closable via the X). */
  dismissOnBackdrop?: boolean;
  onClose?: () => void;
}

/** Hides the page behind the dialog from both Tab order and assistive tech. */
function setBackgroundInert(inert: boolean): void {
  const app = document.getElementById('app');
  if (!app) return;
  app.inert = inert;
  if (inert) app.setAttribute('aria-hidden', 'true');
  else app.removeAttribute('aria-hidden');
}

/** Accessible modal: focus trap, Escape to close, scroll lock, focus restore. */
export function openModal(content: HTMLElement, options: ModalOptions): ModalHandle {
  const previouslyFocused = document.activeElement as HTMLElement | null;

  const closeButton = el('button', {
    class: 'modal__close',
    type: 'button',
    'aria-label': 'Close dialog',
    unsafeHTML: icons.close,
  });

  const panel = el(
    'div',
    {
      class: `modal__panel ${options.panelClass ?? ''}`.trim(),
      role: options.role ?? 'dialog',
      'aria-modal': 'true',
      'aria-label': options.labelledBy ? undefined : options.label,
      'aria-labelledby': options.labelledBy,
      tabindex: '-1',
    },
    [closeButton, content],
  );

  const root = el('div', { class: 'modal' }, [panel]);

  const close = (): void => {
    document.removeEventListener('keydown', onKeydown, true);
    root.remove();
    setBackgroundInert(false);
    unlockScroll();
    previouslyFocused?.focus?.();
    options.onClose?.();
  };

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusables = panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!first || !last) return;

    const active = document.activeElement;
    const inside = active instanceof HTMLElement && panel.contains(active) && active !== panel;

    // Focus starts on the panel itself, which is not in `focusables`; without
    // this branch Shift+Tab would walk straight out of the dialog.
    if (!inside) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  closeButton.addEventListener('click', close);
  if (options.dismissOnBackdrop !== false) {
    root.addEventListener('mousedown', (event) => {
      if (event.target === root) close();
    });
  }
  document.addEventListener('keydown', onKeydown, true);

  document.body.append(root);
  setBackgroundInert(true);
  lockScroll();
  panel.focus();

  return { root, close };
}
