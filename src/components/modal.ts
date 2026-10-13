import { el, lockScroll, unlockScroll } from '../util/dom';
import { icons } from './icons';

export interface ModalHandle {
  root: HTMLElement;
  close: () => void;
}

interface ModalOptions {
  panelClass?: string;
  label: string;
  /** Set to false for modals that must be acted on (still closable via the X). */
  dismissOnBackdrop?: boolean;
  onClose?: () => void;
}

/** Accessible modal: focus trap, Escape to close, scroll lock, focus restore. */
export function openModal(content: HTMLElement, options: ModalOptions): ModalHandle {
  const previouslyFocused = document.activeElement as HTMLElement | null;

  const closeButton = el('button', {
    class: 'modal__close',
    type: 'button',
    'aria-label': 'Close dialog',
    html: icons.close,
  });

  const panel = el(
    'div',
    {
      class: `modal__panel ${options.panelClass ?? ''}`.trim(),
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': options.label,
      tabindex: '-1',
    },
    [closeButton, content],
  );

  const root = el('div', { class: 'modal' }, [panel]);

  const close = (): void => {
    document.removeEventListener('keydown', onKeydown, true);
    root.remove();
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
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
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
  lockScroll();
  panel.focus();

  return { root, close };
}
