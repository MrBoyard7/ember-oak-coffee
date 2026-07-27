/**
 * analytics.js
 * Minimal Google Analytics 4 (gtag.js) bootstrap.
 *
 * `window.GA_MEASUREMENT_ID` is set inline in each page's <head>, right
 * before the gtag.js <script> tag is loaded. Replace the placeholder
 * "G-XXXXXXXXXX" in every HTML file with the real GA4 Measurement ID
 * before deploying — see README > "Google Analytics".
 *
 * This file intentionally does nothing if no ID has been configured,
 * so local development and CI never send real analytics events.
 */
window.dataLayer = window.dataLayer || [];

function gtag() {
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

const measurementId = window.GA_MEASUREMENT_ID;

if (measurementId && measurementId !== 'G-XXXXXXXXXX') {
  gtag('js', new Date());
  gtag('config', measurementId, { anonymize_ip: true });
} else {
  console.info('[analytics] GA_MEASUREMENT_ID not configured — analytics disabled.');
}
