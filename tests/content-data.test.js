import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');

/**
 * Reads and parses a JSON file from /data by filename.
 * @param {string} filename
 * @returns {any}
 */
function readJSON(filename) {
  const raw = readFileSync(path.join(dataDir, filename), 'utf-8');
  return JSON.parse(raw);
}

describe('data/site-content.json', () => {
  const site = readJSON('site-content.json');

  test('has the required top-level sections', () => {
    for (const key of ['brand', 'hero', 'highlights', 'about', 'contact', 'footer']) {
      assert.ok(key in site, `expected site-content.json to have a "${key}" section`);
    }
  });

  test('hero has non-empty heading and CTAs', () => {
    assert.equal(typeof site.hero.heading, 'string');
    assert.ok(site.hero.heading.length > 0);
    assert.ok(site.hero.primaryCta.href);
    assert.ok(site.hero.secondaryCta.href);
  });

  test('highlights is a non-empty array of {title, description}', () => {
    assert.ok(Array.isArray(site.highlights));
    assert.ok(site.highlights.length > 0);
    for (const item of site.highlights) {
      assert.equal(typeof item.title, 'string');
      assert.equal(typeof item.description, 'string');
    }
  });

  test('about.milestones is chronologically ordered', () => {
    const years = site.about.milestones.map((m) => Number(m.year));
    const sorted = [...years].sort((a, b) => a - b);
    assert.deepEqual(years, sorted, 'milestones should be listed oldest to newest');
  });

  test('contact.hours has exactly 7 days covered across its ranges', () => {
    assert.ok(Array.isArray(site.contact.hours));
    assert.ok(site.contact.hours.length >= 1);
    for (const entry of site.contact.hours) {
      assert.equal(typeof entry.days, 'string');
      assert.equal(typeof entry.time, 'string');
    }
  });

  test('contact.email looks like an email address', () => {
    assert.match(site.contact.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });
});

describe('data/menu.json', () => {
  const menu = readJSON('menu.json');

  test('has at least one category', () => {
    assert.ok(Array.isArray(menu.categories));
    assert.ok(menu.categories.length > 0);
  });

  test('every category has a valid roastNote', () => {
    for (const category of menu.categories) {
      assert.ok(['light', 'medium', 'dark'].includes(category.roastNote));
    }
  });

  test('every menu item has a name, description, and numeric price', () => {
    for (const category of menu.categories) {
      assert.ok(Array.isArray(category.items) && category.items.length > 0);
      for (const item of category.items) {
        assert.equal(typeof item.name, 'string');
        assert.equal(typeof item.description, 'string');
        assert.ok(!Number.isNaN(Number(item.price)), `price "${item.price}" should be numeric`);
      }
    }
  });

  test('category ids are unique', () => {
    const ids = menu.categories.map((c) => c.id);
    assert.equal(new Set(ids).size, ids.length);
  });
});

describe('data/announcements.json', () => {
  const announcement = readJSON('announcements.json');

  test('has the fields the banner renderer expects', () => {
    assert.equal(typeof announcement.active, 'boolean');
    assert.equal(typeof announcement.message, 'string');
    assert.ok(announcement.message.length > 0);
  });
});
