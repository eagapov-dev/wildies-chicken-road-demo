/** Base-aware asset URL so the build works from a domain root or a sub-path. */
export const asset = (path: string): string =>
  `${import.meta.env.BASE_URL}assets/${path}`.replace(/([^:]\/)\/+/g, '$1');

type Attrs = Record<string, string | number | boolean | undefined | null>;

/** Tiny `createElement` helper - keeps component code declarative without a framework. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  children: Array<Node | string | null | undefined> = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') node.className = String(value);
    else if (key === 'html') node.innerHTML = String(value);
    else if (key === 'text') node.textContent = String(value);
    else if (key === 'dataset') continue;
    else node.setAttribute(key, value === true ? '' : String(value));
  }

  for (const child of children) {
    if (child === null || child === undefined) continue;
    node.append(typeof child === 'string' ? document.createTextNode(child) : child);
  }

  return node;
}

/** `<img>` with the defaults every thumbnail on this page wants. */
export function img(src: string, alt = '', attrs: Attrs = {}): HTMLImageElement {
  return el('img', { src, alt, loading: 'lazy', decoding: 'async', ...attrs });
}

export const qs = <T extends Element>(selector: string, root: ParentNode = document): T | null =>
  root.querySelector<T>(selector);

export function formatCredits(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Locks body scroll while a modal is open; reference-counted for stacked modals. */
let scrollLocks = 0;

export function lockScroll(): void {
  scrollLocks += 1;
  document.body.classList.add('is-locked');
}

export function unlockScroll(): void {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks === 0) document.body.classList.remove('is-locked');
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
