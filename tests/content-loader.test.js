import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { loadSiteContent } from '../assets/js/content-loader.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Reuse the real content files as fixtures, so this test breaks (usefully)
// if the JSON schema and the renderer ever drift apart.
const siteContent = JSON.parse(readFileSync(path.join(rootDir, 'data/site-content.json'), 'utf-8'));
const menu = JSON.parse(readFileSync(path.join(rootDir, 'data/menu.json'), 'utf-8'));

// A synthetic, never-expiring announcement — deliberately NOT read from
// data/announcements.json, since that file's `expires` date will
// eventually be in the past and silently break this test.
const activeAnnouncement = {
  active: true,
  message: 'Test announcement message',
  linkLabel: 'Details',
  linkHref: 'contact.html',
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
};

// Minimal page containing every hook loadSiteContent renders into,
// combined from across the real pages.
const FIXTURE_HTML = `
  <div data-announcement hidden>
    <span data-announcement-text></span>
    <a href="#" data-announcement-link hidden></a>
    <button data-announcement-close></button>
  </div>
  <p data-field="footer.note"></p>
  <div class="card-grid" data-highlights></div>
  <div data-field-list="about.body"></div>
  <ul data-timeline></ul>
  <table><tbody data-hours></tbody></table>
  <a data-tel-link href="tel:+000000"></a>
  <a data-mail-link href="mailto:placeholder@example.com"></a>
  <div data-menu></div>
`;

let restoreFetch;

/**
 * Stubs the global `fetch` used by content-loader.js so tests never hit
 * the network or the filesystem through a real server.
 * @param {{site?: any, menu?: any, announcements?: any}} overrides
 */
function mockFetch(overrides = {}) {
  const responses = {
    'data/site-content.json': overrides.site ?? siteContent,
    'data/menu.json': overrides.menu ?? menu,
    'data/announcements.json': overrides.announcements ?? activeAnnouncement,
  };
  const original = globalThis.fetch;
  globalThis.fetch = async (requestPath) => {
    if (!(requestPath in responses)) {
      return { ok: false, status: 404, statusText: 'Not Found' };
    }
    return { ok: true, json: async () => responses[requestPath] };
  };
  restoreFetch = () => {
    globalThis.fetch = original;
  };
}

function makeDoc() {
  return new JSDOM(`<!doctype html><html><body>${FIXTURE_HTML}</body></html>`, {
    url: 'https://example.com/',
  }).window.document;
}

describe('loadSiteContent', () => {
  afterEach(() => {
    if (restoreFetch) restoreFetch();
    restoreFetch = undefined;
  });

  test('renders bound text fields from site-content.json', async () => {
    mockFetch();
    const doc = makeDoc();
    await loadSiteContent(doc);
    assert.equal(
      doc.querySelector('[data-field="footer.note"]').textContent,
      siteContent.footer.note
    );
  });

  test('renders one highlight card per entry, marked visible', async () => {
    mockFetch();
    const doc = makeDoc();
    await loadSiteContent(doc);
    const cards = doc.querySelectorAll('[data-highlights] .card');
    assert.equal(cards.length, siteContent.highlights.length);
    cards.forEach((card) => assert.ok(card.classList.contains('is-visible')));
    assert.equal(cards[0].querySelector('h3').textContent, siteContent.highlights[0].title);
  });

  test('renders the "Our Story" body paragraphs', async () => {
    mockFetch();
    const doc = makeDoc();
    await loadSiteContent(doc);
    const paragraphs = doc.querySelectorAll('[data-field-list="about.body"] p');
    assert.equal(paragraphs.length, siteContent.about.body.length);
  });

  test('renders the founding timeline in the same order as the source data', async () => {
    mockFetch();
    const doc = makeDoc();
    await loadSiteContent(doc);
    const years = Array.from(doc.querySelectorAll('[data-timeline] .timeline-year')).map(
      (el) => el.textContent
    );
    assert.deepEqual(
      years,
      siteContent.about.milestones.map((m) => m.year)
    );
  });

  test('renders one table row per opening-hours entry', async () => {
    mockFetch();
    const doc = makeDoc();
    await loadSiteContent(doc);
    const rows = doc.querySelectorAll('[data-hours] tr');
    assert.equal(rows.length, siteContent.contact.hours.length);
  });

  test('points the tel/mailto links at the configured phone and email', async () => {
    mockFetch();
    const doc = makeDoc();
    await loadSiteContent(doc);
    const telLink = doc.querySelector('[data-tel-link]');
    const mailLink = doc.querySelector('[data-mail-link]');
    assert.equal(
      telLink.getAttribute('href'),
      `tel:${siteContent.contact.phone.replace(/[^+\d]/g, '')}`
    );
    assert.equal(mailLink.getAttribute('href'), `mailto:${siteContent.contact.email}`);
  });

  test('renders every menu category and item, marked visible', async () => {
    mockFetch();
    const doc = makeDoc();
    await loadSiteContent(doc);
    const categories = doc.querySelectorAll('[data-menu] .menu-category');
    assert.equal(categories.length, menu.categories.length);
    categories.forEach((cat) => assert.ok(cat.classList.contains('is-visible')));
    const firstItems = categories[0].querySelectorAll('.menu-item');
    assert.equal(firstItems.length, menu.categories[0].items.length);
  });

  test('escapes HTML found in menu content instead of rendering it as markup', async () => {
    mockFetch({
      menu: {
        ...menu,
        categories: [
          {
            id: 'test',
            name: 'Test',
            roastNote: 'medium',
            items: [{ name: '<b>Bold</b>', description: 'desc', price: '1' }],
          },
        ],
      },
    });
    const doc = makeDoc();
    await loadSiteContent(doc);
    assert.ok(
      !doc.querySelector('[data-menu] b'),
      'raw HTML in content must not become a real element'
    );
    assert.match(doc.querySelector('.menu-item-name').textContent, /<b>Bold<\/b>/);
  });

  test('shows the announcement banner when active and not expired', async () => {
    mockFetch();
    const doc = makeDoc();
    await loadSiteContent(doc);
    const banner = doc.querySelector('[data-announcement]');
    assert.equal(banner.hidden, false);
    assert.equal(
      doc.querySelector('[data-announcement-text]').textContent,
      activeAnnouncement.message
    );
  });

  test('keeps the announcement banner hidden when inactive', async () => {
    mockFetch({ announcements: { active: false, message: 'Should not show' } });
    const doc = makeDoc();
    await loadSiteContent(doc);
    assert.equal(doc.querySelector('[data-announcement]').hidden, true);
  });

  test('does not throw when a data file fails to load, and logs the failure', async () => {
    const original = globalThis.fetch;
    globalThis.fetch = async () => ({ ok: false, status: 500, statusText: 'Server Error' });
    restoreFetch = () => {
      globalThis.fetch = original;
    };

    const originalConsoleError = console.error;
    let loggedMessage = '';
    console.error = (...args) => {
      loggedMessage = args.join(' ');
    };

    const doc = makeDoc();
    await assert.doesNotReject(() => loadSiteContent(doc));

    console.error = originalConsoleError;
    assert.match(loggedMessage, /Failed to load/);
  });
});
