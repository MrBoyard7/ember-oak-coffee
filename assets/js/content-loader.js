/**
 * content-loader.js
 * Fetches the JSON files in /data and injects them into the page.
 * This is the layer that lets a non-technical owner update copy, menu
 * items, and announcements by editing JSON (directly, or through the
 * /admin Decap CMS screen) without touching any HTML, CSS, or JS.
 *
 * Must be served over http(s), not file://, because `fetch` on local
 * files is blocked by CORS in most browsers. See README "Local preview".
 */

import { renderAnnouncement, initScrollReveal } from './main.js';

const DATA_PATHS = {
  site: 'data/site-content.json',
  menu: 'data/menu.json',
  announcements: 'data/announcements.json',
};

/**
 * Fetches and parses a JSON file, throwing a descriptive error on failure.
 * @param {string} path
 * @returns {Promise<any>}
 */
async function fetchJSON(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * Populates every element with [data-field="a.b.c"] using dot-notation
 * lookup against the supplied data object.
 * @param {Document} doc
 * @param {Record<string, any>} data
 */
function bindFields(doc, data) {
  doc.querySelectorAll('[data-field]').forEach((el) => {
    const path = el.getAttribute('data-field');
    const value = path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), data);
    if (value != null) el.textContent = value;
  });
}

/**
 * Points the "tel:" and "mailto:" links on the contact page at whatever
 * phone number and email address are set in site-content.json, so the
 * two never fall out of sync with the visible text.
 * @param {Document} doc
 * @param {{phone?:string,email?:string}} contact
 */
function renderContactLinks(doc, contact = {}) {
  const telLink = doc.querySelector('[data-tel-link]');
  if (telLink && contact.phone) {
    telLink.setAttribute('href', `tel:${contact.phone.replace(/[^+\d]/g, '')}`);
  }
  const mailLink = doc.querySelector('[data-mail-link]');
  if (mailLink && contact.email) {
    mailLink.setAttribute('href', `mailto:${contact.email}`);
  }
}

/**
 * Renders the "highlights" cards on the homepage.
 * @param {Document} doc
 * @param {Array<{title:string, description:string}>} highlights
 */
function renderHighlights(doc, highlights = []) {
  const mount = doc.querySelector('[data-highlights]');
  if (!mount) return;
  mount.innerHTML = highlights
    .map(
      (item) => `
      <div class="card reveal">
        <h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.description)}</p>
      </div>`
    )
    .join('');
}

/**
 * Renders the founding timeline on the about page.
 * @param {Document} doc
 * @param {Array<{year:string,label:string,detail:string}>} milestones
 */
function renderTimeline(doc, milestones = []) {
  const mount = doc.querySelector('[data-timeline]');
  if (!mount) return;
  mount.innerHTML = milestones
    .map(
      (m) => `
      <li>
        <span class="timeline-year">${escapeHTML(m.year)}</span>
        <strong>${escapeHTML(m.label)}</strong>
        <p>${escapeHTML(m.detail)}</p>
      </li>`
    )
    .join('');
}

/**
 * Renders the multi-paragraph "about.body" array on the about page.
 * @param {Document} doc
 * @param {string[]} paragraphs
 */
function renderAboutBody(doc, paragraphs = []) {
  const mount = doc.querySelector('[data-field-list="about.body"]');
  if (!mount) return;
  mount.innerHTML = paragraphs.map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join('');
}

/**
 * Renders the full menu, grouped by category, on the menu page.
 * @param {Document} doc
 * @param {{currency:string, categories:Array<any>}} menu
 */
function renderMenu(doc, menu) {
  const mount = doc.querySelector('[data-menu]');
  if (!mount || !menu) return;

  mount.innerHTML = menu.categories
    .map((category) => {
      const items = category.items
        .map(
          (item) => `
          <div class="menu-item">
            <div>
              <span class="menu-item-name">${escapeHTML(item.name)}</span>
              <span class="menu-item-desc">${escapeHTML(item.description)}</span>
            </div>
            <span class="menu-item-leader" aria-hidden="true"></span>
            <span class="menu-item-price">${escapeHTML(item.price)} ${escapeHTML(menu.currency)}</span>
          </div>`
        )
        .join('');

      return `
        <div class="menu-category reveal">
          <div class="menu-category-heading">
            <h3>${escapeHTML(category.name)}</h3>
            <span class="roast-tag">${escapeHTML(category.roastNote)} roast</span>
          </div>
          ${items}
        </div>`;
    })
    .join('');
}

/**
 * Renders opening hours as a table on the contact page.
 * @param {Document} doc
 * @param {Array<{days:string,time:string}>} hours
 */
function renderHours(doc, hours = []) {
  const mount = doc.querySelector('[data-hours]');
  if (!mount) return;
  mount.innerHTML = hours
    .map((h) => `<tr><td>${escapeHTML(h.days)}</td><td>${escapeHTML(h.time)}</td></tr>`)
    .join('');
}

/**
 * Minimal HTML-escaping for text interpolated from JSON content.
 * @param {unknown} value
 * @returns {string}
 */
function escapeHTML(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Entry point: loads all JSON content and renders whichever sections
 * exist on the current page (each render* function is a no-op if its
 * target element isn't present).
 * @param {Document} [doc]
 */
export async function loadSiteContent(doc = document) {
  try {
    const [site, menu, announcements] = await Promise.all([
      fetchJSON(DATA_PATHS.site),
      fetchJSON(DATA_PATHS.menu),
      fetchJSON(DATA_PATHS.announcements),
    ]);

    bindFields(doc, site);
    renderHighlights(doc, site.highlights);
    renderAboutBody(doc, site.about && site.about.body);
    renderTimeline(doc, site.about && site.about.milestones);
    renderHours(doc, site.contact && site.contact.hours);
    renderContactLinks(doc, site.contact);
    renderMenu(doc, menu);
    renderAnnouncement(doc, announcements);

    // The sections above just injected new `.reveal` elements (highlight
    // cards, timeline items, menu categories). main.js's own scroll-reveal
    // pass already ran at DOMContentLoaded, before this content existed,
    // so it never saw them — run it again now that they're in the DOM.
    initScrollReveal(doc);
  } catch (error) {
    // Fails loudly in the console so a broken JSON edit is easy to spot,
    // without breaking the rest of the (server-rendered-in-HTML) page.
    console.error('[content-loader]', error.message);
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => loadSiteContent(document));
}
