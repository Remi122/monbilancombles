/* Formulaire de demande de bilan : 3 étapes, validation, envoi vers le webhook Make. Sans dépendance. */
(function () {
  'use strict';

  var form = document.getElementById('formulaire-bilan');
  if (!form) return;

  var config = window.MBC_CONFIG || {};
  var pas = Array.prototype.slice.call(form.querySelectorAll('.form__pas'));
  var etape = document.getElementById('form-etape');
  var jauge = document.getElementById('form-jauge');
  var erreurEnvoi = document.getElementById('form-erreur');
  var boutonEnvoi = document.getElementById('form-envoyer');
  var courant = 0;

  var regles = {
    logement: function () { return !!valeurRadio('logement'); },
    code_postal: function () { return /^\d{5}$/.test(form.code_postal.value.trim()); },
    combles: function () { return !!valeurRadio('combles'); },
    statut: function () { return !!valeurRadio('statut'); },
    nom: function () { return form.nom.value.trim().length >= 3; },
    telephone: function () { return /^(0\d{9}|33\d{9})$/.test(chiffres(form.telephone.value)); },
    email: function () { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.value.trim()); },
    consentement: function () { return form.consentement.checked; }
  };

  function chiffres(v) { return v.replace(/[^\d]/g, ''); }

  function valeurRadio(nom) {
    var coche = form.querySelector('input[name="' + nom + '"]:checked');
    return coche ? coche.value : '';
  }

  function marquer(champ, valide) {
    champ.classList.toggle('mbc-champ--erreur', !valide);
    var saisie = champ.querySelector('input:not([type="radio"]):not([type="checkbox"])');
    if (saisie) saisie.setAttribute('aria-invalid', valide ? 'false' : 'true');
  }

  function validerPas(index) {
    var premier = null;
    pas[index].querySelectorAll('[data-champ]').forEach(function (champ) {
      var valide = regles[champ.getAttribute('data-champ')]();
      marquer(champ, valide);
      if (!valide && !premier) premier = champ.querySelector('input');
    });
    if (premier) premier.focus();
    return !premier;
  }

  function afficher(index) {
    courant = index;
    pas.forEach(function (p, i) { p.classList.toggle('est-actif', i === index); });
    etape.textContent = 'Étape ' + (index + 1) + ' sur ' + pas.length;
    jauge.style.width = ((index + 1) / pas.length * 100) + '%';
    var premier = pas[index].querySelector('input');
    if (premier && index > 0) premier.focus({ preventScroll: true });
  }

  /* Efface l'erreur d'un champ dès que la saisie redevient correcte. */
  form.addEventListener('input', function (e) {
    var champ = e.target.closest('[data-champ]');
    if (champ && champ.classList.contains('mbc-champ--erreur') && regles[champ.getAttribute('data-champ')]()) marquer(champ, true);
  });
  form.addEventListener('change', function (e) {
    var champ = e.target.closest('[data-champ]');
    if (champ && champ.classList.contains('mbc-champ--erreur') && regles[champ.getAttribute('data-champ')]()) marquer(champ, true);
  });

  form.addEventListener('click', function (e) {
    if (e.target.closest('[data-suivant]')) {
      if (validerPas(courant)) afficher(courant + 1);
    } else if (e.target.closest('[data-retour]')) {
      afficher(courant - 1);
    }
  });

  /* Entrée dans un champ des étapes 1 et 2 : passe à la suite au lieu d'envoyer. */
  form.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && courant < pas.length - 1) {
      e.preventDefault();
      if (validerPas(courant)) afficher(courant + 1);
    }
  });

  function suivi() {
    var q = new URLSearchParams(window.location.search);
    var donnees = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'].forEach(function (cle) {
      if (q.get(cle)) donnees[cle] = q.get(cle);
    });
    return donnees;
  }

  function donnees() {
    var d = {
      logement: valeurRadio('logement'),
      code_postal: form.code_postal.value.trim(),
      combles: valeurRadio('combles'),
      statut: valeurRadio('statut'),
      nom: form.nom.value.trim(),
      telephone: chiffres(form.telephone.value),
      email: form.email.value.trim(),
      consentement: 'oui',
      date: new Date().toISOString(),
      page: window.location.origin + window.location.pathname
    };
    var s = suivi();
    Object.keys(s).forEach(function (cle) { d[cle] = s[cle]; });
    return d;
  }

  /* Envoi en champs de formulaire classiques : Make les lit tels quels, et le navigateur
     n'a pas besoin d'autorisation particulière du serveur pour ce type d'envoi. */
  function envoyer(url, d) {
    var corps = new URLSearchParams(d);
    return fetch(url, { method: 'POST', body: corps }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
    }, function () {
      return fetch(url, { method: 'POST', body: corps, mode: 'no-cors' });
    });
  }

  function signalerErreur(texte) {
    erreurEnvoi.textContent = texte;
    erreurEnvoi.classList.add('est-visible');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    erreurEnvoi.classList.remove('est-visible');
    if (!validerPas(courant)) return;
    if (form.site_web.value) return; /* champ piège rempli : c'est un robot */

    if (!config.webhookUrl) {
      signalerErreur('Le formulaire n\'est pas encore ouvert : votre demande n\'a pas été envoyée. Revenez dans quelques jours.');
      return;
    }

    boutonEnvoi.disabled = true;
    envoyer(config.webhookUrl, donnees()).then(function () {
      document.getElementById('form-corps').hidden = true;
      var merci = document.getElementById('form-merci');
      merci.classList.add('est-visible');
      merci.focus();
    }).catch(function () {
      boutonEnvoi.disabled = false;
      signalerErreur('L\'envoi n\'a pas fonctionné. Vérifiez votre connexion puis réessayez.');
    });
  });
})();
