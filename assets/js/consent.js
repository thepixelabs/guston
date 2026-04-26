/* GUSTON — Cookie Consent (Google Consent Mode v2)
 *
 * Default state (set in <head> before this loads): all storage denied.
 * This script reads localStorage for a previous choice. If found, it
 * upgrades or keeps consent silently. If absent, it shows the banner.
 *
 * The banner accept button calls gtag('consent', 'update', granted),
 * decline persists 'denied' so we don't re-prompt on every visit. The
 * footer "Cookie Settings" button (any element with [data-consent-manage])
 * clears the stored choice and re-shows the banner.
 */
(function () {
  'use strict';

  var CONSENT_KEY = 'guston_consent_v1';

  var banner     = document.getElementById('consent-banner');
  var acceptBtn  = document.getElementById('consent-accept');
  var declineBtn = document.getElementById('consent-decline');
  var manageBtns = document.querySelectorAll('[data-consent-manage]');

  function gtag() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
  }

  function grantConsent() {
    gtag('consent', 'update', {
      analytics_storage:  'granted',
      ad_storage:         'granted',
      ad_user_data:       'granted',
      ad_personalization: 'granted'
    });
  }

  function revokeConsent() {
    gtag('consent', 'update', {
      analytics_storage:  'denied',
      ad_storage:         'denied',
      ad_user_data:       'denied',
      ad_personalization: 'denied'
    });
  }

  function hideBanner() {
    if (!banner) return;
    // Move focus out before hiding so we don't violate the rule
    // "aria-hidden must not be set on an ancestor of the focused element."
    if (banner.contains(document.activeElement) && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
    banner.classList.remove('is-visible');
    banner.setAttribute('aria-hidden', 'true');
  }

  function showBanner() {
    if (!banner) return;
    banner.removeAttribute('aria-hidden');
    banner.classList.add('is-visible');
    if (acceptBtn) acceptBtn.focus();
  }

  function saveAndClose(choice) {
    try { localStorage.setItem(CONSENT_KEY, choice); } catch (e) {}
    hideBanner();
  }

  var stored;
  try { stored = localStorage.getItem(CONSENT_KEY); } catch (e) {}

  if (stored === 'granted') {
    grantConsent();
  } else if (stored === 'denied') {
    /* default already denied, nothing to do */
  } else {
    showBanner();
  }

  if (acceptBtn) {
    acceptBtn.addEventListener('click', function () {
      grantConsent();
      saveAndClose('granted');
    });
  }

  if (declineBtn) {
    declineBtn.addEventListener('click', function () {
      revokeConsent();
      saveAndClose('denied');
    });
  }

  for (var i = 0; i < manageBtns.length; i++) {
    manageBtns[i].addEventListener('click', function (e) {
      e.preventDefault();
      try { localStorage.removeItem(CONSENT_KEY); } catch (err) {}
      showBanner();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (banner && banner.classList.contains('is-visible')) {
      revokeConsent();
      saveAndClose('denied');
    }
  });
})();
