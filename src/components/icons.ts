const svg = (body: string, size = 20): string =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const icons = {
  search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>', 18),
  caretDown: svg('<path d="m6 9 6 6 6-6"/>', 16),
  chevronLeft: svg('<path d="m14 6-6 6 6 6"/>', 16),
  chevronRight: svg('<path d="m10 6 6 6-6 6"/>', 16),
  close: svg('<path d="M6 6l12 12M18 6L6 18"/>', 18),
  globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18"/>', 16),
  chat: svg('<path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12Z"/>', 16),
  menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>', 20),
  collapse: svg('<path d="M4 6h16M4 12h10M4 18h16"/><path d="m19 9-3 3 3 3"/>', 20),
  eyeOff: svg('<path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.4 5.2A9.6 9.6 0 0 1 12 5c5 0 9 4.5 9 7a11 11 0 0 1-2.3 3.4M6.2 6.7A11.6 11.6 0 0 0 3 12c0 2.5 4 7 9 7 1.3 0 2.4-.3 3.5-.7"/>', 18),
  google: `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6Z"/><path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3C3.7 21 7.5 23.5 12 23.5Z"/><path fill="#FBBC05" d="M5.6 14.2a7 7 0 0 1 0-4.4v-3H1.8a11.5 11.5 0 0 0 0 10.4l3.8-3Z"/><path fill="#EA4335" d="M12 5.4c1.7 0 3.2.6 4.4 1.7l3.3-3.2C17.7 2.1 15.1 1 12 1 7.5 1 3.7 3.5 1.8 7.2l3.8 3c.9-2.8 3.4-4.8 6.4-4.8Z"/></svg>`,
  shield: svg('<path d="M12 3l7 3v5c0 4.6-3 8.4-7 10-4-1.6-7-5.4-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/>', 16),
};
