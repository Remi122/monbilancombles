/* Bandeau cookies. Rien n'est chargé tant que le visiteur n'a pas accepté.
   Le choix est gardé 6 mois dans le navigateur et se modifie avec « Gérer les cookies » en bas de page. */
(function () {
  'use strict';

  var CLE = 'mbc_cookies';
  var SIX_MOIS = 182 * 24 * 3600 * 1000;
  var config = window.MBC_CONFIG || {};
  var charge = false;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  function signaler(etat, type) {
    gtag('consent', type, { ad_storage: etat, ad_user_data: etat, ad_personalization: etat, analytics_storage: etat });
  }
  signaler('denied', 'default');

  function lire() {
    try {
      var v = JSON.parse(window.localStorage.getItem(CLE));
      if (v && Date.now() - v.date < SIX_MOIS) return v.choix;
    } catch (e) { /* stockage indisponible : on redemande */ }
    return null;
  }

  function garder(choix) {
    try { window.localStorage.setItem(CLE, JSON.stringify({ choix: choix, date: Date.now() })); } catch (e) { /* tant pis */ }
  }

  /* Seul endroit où un outil de mesure se charge, et seulement après accord. */
  function chargerMesure() {
    signaler('granted', 'update');
    if (charge || !config.gtmId) return;
    charge = true;
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(config.gtmId);
    document.head.appendChild(s);
  }

  var bandeau = document.createElement('div');
  bandeau.className = 'cookies';
  bandeau.setAttribute('role', 'region');
  bandeau.setAttribute('aria-label', 'Cookies');
  bandeau.hidden = true;
  bandeau.innerHTML = '<p>Acceptez-vous les cookies de mesure d\'audience et de publicité&nbsp;? <a href="confidentialite.html">En savoir plus</a></p>' +
    '<div class="cookies__boutons"><button type="button" data-cookies="refus">Refuser</button><button type="button" data-cookies="accord">Accepter</button></div>';
  document.body.appendChild(bandeau);

  bandeau.addEventListener('click', function (e) {
    var bouton = e.target.closest('[data-cookies]');
    if (!bouton) return;
    var avant = lire();
    var choix = bouton.getAttribute('data-cookies');
    garder(choix);
    bandeau.hidden = true;
    if (choix === 'accord') chargerMesure();
    else if (avant === 'accord') window.location.reload(); /* retrait de l'accord : on repart sans outil chargé */
  });

  var nav = document.querySelector('.pied nav');
  if (nav) {
    var gerer = document.createElement('button');
    gerer.type = 'button';
    gerer.className = 'pied__cookies';
    gerer.textContent = 'Gérer les cookies';
    gerer.addEventListener('click', function () { bandeau.hidden = false; bandeau.querySelector('button').focus(); });
    nav.appendChild(gerer);
  }

  var choix = lire();
  if (choix === 'accord') chargerMesure();
  else if (choix === null) bandeau.hidden = false;
})();
