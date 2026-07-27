import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const pages = ['index.html', 'menu.html', 'about.html', 'contact.html'];

for (const page of pages) {
  describe(page, () => {
    const html = readFileSync(path.join(rootDir, page), 'utf-8');
    const { document } = new JSDOM(html).window;

    test('declares a <title> and a meta description', () => {
      assert.ok(document.querySelector('title').textContent.length > 0);
      const description = document.querySelector('meta[name="description"]');
      assert.ok(description && description.getAttribute('content').length > 0);
    });

    test('sets a responsive viewport meta tag', () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      assert.ok(viewport && viewport.getAttribute('content').includes('width=device-width'));
    });

    test('links the shared stylesheet', () => {
      const stylesheet = document.querySelector(
        'link[rel="stylesheet"][href="assets/css/styles.css"]'
      );
      assert.ok(stylesheet, 'expected assets/css/styles.css to be linked');
    });

    test('has a primary navigation with all four site links', () => {
      const links = Array.from(document.querySelectorAll('[data-main-nav] a')).map((a) =>
        a.getAttribute('href')
      );
      for (const href of ['index.html', 'menu.html', 'about.html', 'contact.html']) {
        assert.ok(links.includes(href), `expected nav to link to ${href}`);
      }
    });

    test('marks exactly one nav link as the current page', () => {
      const current = document.querySelectorAll('[data-main-nav] a[aria-current="page"]');
      assert.equal(current.length, 1);
    });

    test('has a <main id="main"> landmark matching the skip link', () => {
      const skipLink = document.querySelector('a[href="#main"]');
      const main = document.getElementById('main');
      assert.ok(skipLink, 'expected a "Skip to content" link');
      assert.ok(main, 'expected an element with id="main"');
    });

    test('loads main.js and content-loader.js as modules', () => {
      const scripts = Array.from(document.querySelectorAll('script[type="module"]')).map((s) =>
        s.getAttribute('src')
      );
      assert.ok(scripts.includes('assets/js/main.js'));
      assert.ok(scripts.includes('assets/js/content-loader.js'));
    });
  });
}
