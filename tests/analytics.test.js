import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const analyticsPath = path.join(__dirname, '..', 'assets', 'js', 'analytics.js');
const analyticsSource = readFileSync(analyticsPath, 'utf-8');

/**
 * Runs the real analytics.js source inside an isolated VM context that
 * stands in for a browser `window`, with `GA_MEASUREMENT_ID` pre-set the
 * same way each HTML page sets it inline before loading the script.
 *
 * Executing the actual file — with its real path passed as `filename` —
 * rather than a copy or a jsdom-injected `<script>`, is what lets Node's
 * code coverage attribute the executed lines back to this file. It also
 * sidesteps a cross-realm pitfall: jsdom runs scripts in their own
 * realm, so an array built there is never `deepStrictEqual` to a plain
 * `[]` literal from the test file, even when both are empty.
 * @param {string|undefined} measurementId
 * @returns {{dataLayer: unknown[]}} the sandboxed `window` object
 */
function runAnalytics(measurementId) {
  const window = { GA_MEASUREMENT_ID: measurementId };
  const context = vm.createContext({ window, console });
  vm.runInContext(analyticsSource, context, { filename: analyticsPath });
  return window;
}

describe('analytics.js', () => {
  test('sends nothing while the Measurement ID is still the placeholder', () => {
    const window = runAnalytics('G-XXXXXXXXXX');
    assert.equal(window.dataLayer.length, 0);
  });

  test('sends nothing when no Measurement ID has been set at all', () => {
    const window = runAnalytics(undefined);
    assert.equal(window.dataLayer.length, 0);
  });

  test('pushes "js" and "config" events once a real Measurement ID is set', () => {
    const window = runAnalytics('G-REAL123456');

    assert.equal(window.dataLayer.length, 2);
    assert.equal(window.dataLayer[0][0], 'js');
    assert.equal(window.dataLayer[1][0], 'config');
    assert.equal(window.dataLayer[1][1], 'G-REAL123456');
    assert.equal(window.dataLayer[1][2].anonymize_ip, true);
  });
});
