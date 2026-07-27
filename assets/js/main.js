/**
 * main.js
 * Handles: mobile navigation toggle, scroll-reveal animation,
 * announcement banner dismissal, and the footer year.
 * No build step required — plain ES modules, loaded with <script type="module">.
 */

/**
 * Wires up the hamburger button to expand/collapse the mobile nav.
 * @param {Document} doc
 */
export function initNavToggle(doc) {
  const toggle = doc.querySelector('[data-nav-toggle]');
  const nav = doc.querySelector('[data-main-nav]');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

/**
 * Reveals the announcement banner if it is active and has not expired,
 * and lets the visitor dismiss it for the current browser session.
 * @param {Document} doc
 * @param {{active:boolean,message:string,linkLabel?:string,linkHref?:string,expires?:string}} announcement
 */
export function renderAnnouncement(doc, announcement) {
  const banner = doc.querySelector('[data-announcement]');
  if (!banner || !announcement) return;

  // Resolve sessionStorage from the document's window rather than the
  // global scope, so this function also works against a JSDOM document
  // in unit tests, not just a real browser `document`. Reading (or even
  // touching) `sessionStorage` can throw — e.g. jsdom without a real
  // `url` option, or a real browser on an opaque origin / in strict
  // private-browsing modes — so every access is wrapped defensively.
  const win = doc.defaultView || (typeof window !== 'undefined' ? window : undefined);
  const dismissed = readDismissedFlag(win) === 'true';
  const expired = announcement.expires ? new Date(announcement.expires) < new Date() : false;

  if (!announcement.active || dismissed || expired) {
    banner.hidden = true;
    return;
  }

  const textEl = banner.querySelector('[data-announcement-text]');
  const linkEl = banner.querySelector('[data-announcement-link]');
  const closeEl = banner.querySelector('[data-announcement-close]');

  if (textEl) textEl.textContent = announcement.message;

  if (linkEl) {
    if (announcement.linkHref && announcement.linkLabel) {
      linkEl.textContent = announcement.linkLabel;
      linkEl.href = announcement.linkHref;
      linkEl.hidden = false;
    } else {
      linkEl.hidden = true;
    }
  }

  if (closeEl) {
    closeEl.addEventListener('click', () => {
      banner.hidden = true;
      writeDismissedFlag(win);
    });
  }

  banner.hidden = false;
}

/**
 * Reads the "announcement-dismissed" session flag, returning null if
 * sessionStorage is unavailable or access to it throws.
 * @param {Window|undefined} win
 * @returns {string|null}
 */
function readDismissedFlag(win) {
  try {
    return win && win.sessionStorage ? win.sessionStorage.getItem('announcement-dismissed') : null;
  } catch {
    return null;
  }
}

/**
 * Writes the "announcement-dismissed" session flag, silently doing
 * nothing if sessionStorage is unavailable or access to it throws.
 * @param {Window|undefined} win
 */
function writeDismissedFlag(win) {
  try {
    if (win && win.sessionStorage) win.sessionStorage.setItem('announcement-dismissed', 'true');
  } catch {
    /* sessionStorage unavailable (opaque origin, private browsing, etc.) — ignore */
  }
}

/**
 * Fades in elements marked with the `.reveal` class as they enter the viewport.
 * Falls back to showing everything immediately if IntersectionObserver is unavailable.
 * @param {Document} doc
 */
export function initScrollReveal(doc) {
  const items = Array.from(doc.querySelectorAll('.reveal'));
  if (items.length === 0) return;

  if (typeof IntersectionObserver === 'undefined') {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((el) => observer.observe(el));
}

/**
 * Writes the current year into every element marked with [data-current-year].
 * @param {Document} doc
 */
export function initFooterYear(doc) {
  const year = String(new Date().getFullYear());
  doc.querySelectorAll('[data-current-year]').forEach((el) => {
    el.textContent = year;
  });
}

/* Only auto-run in a real browser (this file is also imported by unit tests). */
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initNavToggle(document);
    initScrollReveal(document);
    initFooterYear(document);
  });
}
