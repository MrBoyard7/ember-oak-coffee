import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { initNavToggle, renderAnnouncement, initFooterYear } from '../assets/js/main.js';

/**
 * Builds a minimal JSDOM document with just enough markup for the
 * function under test, so each test stays independent and readable.
 * @param {string} html
 * @returns {Document}
 */
function makeDoc(html) {
  return new JSDOM(html, { url: 'https://example.com/' }).window.document;
}

describe('initNavToggle', () => {
  test('toggles the mobile nav open and closed on click', () => {
    const doc = makeDoc(`
      <button data-nav-toggle aria-expanded="false"></button>
      <nav data-main-nav></nav>
    `);
    initNavToggle(doc);

    const toggle = doc.querySelector('[data-nav-toggle]');
    const nav = doc.querySelector('[data-main-nav]');

    toggle.dispatchEvent(new doc.defaultView.Event('click', { bubbles: true }));
    assert.equal(nav.classList.contains('is-open'), true);
    assert.equal(toggle.getAttribute('aria-expanded'), 'true');

    toggle.dispatchEvent(new doc.defaultView.Event('click', { bubbles: true }));
    assert.equal(nav.classList.contains('is-open'), false);
    assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  });

  test('does nothing if the toggle or nav is missing from the page', () => {
    const doc = makeDoc('<div></div>');
    assert.doesNotThrow(() => initNavToggle(doc));
  });
});

describe('renderAnnouncement', () => {
  function makeBannerDoc() {
    return makeDoc(`
      <div data-announcement hidden>
        <span data-announcement-text></span>
        <a href="#" data-announcement-link hidden></a>
        <button data-announcement-close></button>
      </div>
    `);
  }

  test('shows the banner with the message when active and not expired', () => {
    const doc = makeBannerDoc();
    renderAnnouncement(doc, {
      active: true,
      message: 'Closed for a private event',
      expires: '2999-01-01',
    });

    const banner = doc.querySelector('[data-announcement]');
    assert.equal(banner.hidden, false);
    assert.equal(
      doc.querySelector('[data-announcement-text]').textContent,
      'Closed for a private event'
    );
  });

  test('keeps the banner hidden when active is false', () => {
    const doc = makeBannerDoc();
    renderAnnouncement(doc, { active: false, message: 'Should not show' });
    assert.equal(doc.querySelector('[data-announcement]').hidden, true);
  });

  test('keeps the banner hidden when the expiry date is in the past', () => {
    const doc = makeBannerDoc();
    renderAnnouncement(doc, { active: true, message: 'Old news', expires: '2000-01-01' });
    assert.equal(doc.querySelector('[data-announcement]').hidden, true);
  });

  test('shows the optional link only when both href and label are provided', () => {
    const doc = makeBannerDoc();
    renderAnnouncement(doc, {
      active: true,
      message: 'Come see us',
      linkLabel: 'Details',
      linkHref: 'contact.html',
    });
    const link = doc.querySelector('[data-announcement-link]');
    assert.equal(link.hidden, false);
    assert.equal(link.textContent, 'Details');
    assert.equal(link.getAttribute('href'), 'contact.html');
  });
});

describe('initFooterYear', () => {
  test('writes the current year into every [data-current-year] element', () => {
    const doc = makeDoc('<span data-current-year></span><span data-current-year></span>');
    initFooterYear(doc);
    const expected = String(new Date().getFullYear());
    doc.querySelectorAll('[data-current-year]').forEach((el) => {
      assert.equal(el.textContent, expected);
    });
  });
});
