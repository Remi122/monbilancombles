/* Formulaire de bilan : une question par étape, validation, envoi vers le webhook Make. Sans dépendance. */
(function () {
  'use strict';

  var form = document.getElementById('bilan');
  if (!form) return;

  var config = window.MBC_CONFIG || {};
  var pas = Array.prototype.slice.call(form.querySelectorAll('.form__pas'));
  var segments = form.querySelectorAll('#form-segments i');
  var etape = document.getElementById('form-etape');
  var retour = document.getElementById('form-retour');
  var erreurEnvoi = document.getElementById('form-erreur');
  var boutonEnvoi = document.getElementById('form-envoyer');
  var choix = ['statut', 'logement', 'combles', 'annee'];
  var courant = 0;

  var regles = {
    code_postal: function () { return /^\d{5}$/.test(form.code_postal.value.trim()); },
    nom: function () { return form.nom.value.trim().length >= 3; },
    telephone: function () { return /^(0\d{9}|33\d{9})$/.test(chiffres(form.telephone.value)); },
    email: function () { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.value.trim()); },
    consentement: function () { return form.consentement.checked; }
  };
  choix.forEach(function (nom) { regles[nom] = function () { return !!valeur(nom); }; });

  function chiffres(v) { return v.replace(/[^\d]/g, ''); }

  function valeur(nom) {
    var coche = form.querySelector('input[name="' + nom + '"]:checked');
    return coche ? coche.value : '';
  }

  function marquer(champ, valide) {
    champ.classList.toggle('mbc-champ--erreur', !valide);
    var saisie = champ.querySelector('.mbc-champ__input');
    if (saisie) saisie.setAttribute('aria-invalid', valide ? 'false' : 'true');
  }

  function champsDe(index) {
    var bloc = pas[index];
    var liste = Array.prototype.slice.call(bloc.querySelectorAll('[data-champ]'));
    if (bloc.hasAttribute('data-champ')) liste.push(bloc);
    return liste;
  }

  function validerPas(index) {
    var premier = null;
    champsDe(index).forEach(function (champ) {
      var valide = regles[champ.getAttribute('data-champ')]();
      marquer(champ, valide);
      if (!valide && !premier) premier = champ.querySelector('input');
    });
    if (premier) premier.focus();
    return !premier;
  }

  function afficher(index, sansFocus) {
    courant = index;
    pas.forEach(function (p, i) { p.classList.toggle('est-actif', i === index); });
    segments.forEach(function (s, i) { s.classList.toggle('est-fait', i <= index); });
    etape.textContent = 'Étape ' + (index + 1) + ' sur ' + pas.length;
    retour.hidden = index === 0;
    if (sansFocus) return;
    var cible = pas[index].querySelector('input:checked') || pas[index].querySelector('input');
    if (cible) cible.focus({ preventScroll: true });
  }

  function suivant() {
    if (courant < pas.length - 1 && validerPas(courant)) afficher(courant + 1);
  }

  /* Un clic sur une réponse passe à la question suivante. Au clavier, les flèches
     choisissent et la touche Entrée valide, pour ne pas avancer par surprise. */
  form.addEventListener('click', function (e) {
    if (e.target.matches('input[type="radio"]') && e.detail > 0) {
      window.setTimeout(suivant, 180);
    } else if (e.target.closest('[data-suivant]')) {
      suivant();
    } else if (e.target.closest('#form-retour')) {
      afficher(courant - 1);
    }
  });

  form.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && courant < pas.length - 1) {
      e.preventDefault();
      suivant();
    }
  });

  /* Efface l'erreur d'un champ dès que la saisie redevient correcte. */
  function corriger(e) {
    var champ = e.target.closest('.mbc-champ[data-champ]');
    if (champ && champ.classList.contains('mbc-champ--erreur') && regles[champ.getAttribute('data-champ')]()) marquer(champ, true);
  }
  form.addEventListener('input', corriger);
  form.addEventListener('change', corriger);

  function donnees() {
    var d = {};
    choix.forEach(function (nom) { d[nom] = valeur(nom); });
    d.code_postal = form.code_postal.value.trim();
    d.nom = form.nom.value.trim();
    d.telephone = chiffres(form.telephone.value);
    d.email = form.email.value.trim();
    d.consentement = 'oui';
    d.date = new Date().toISOString();
    d.page = window.location.origin + window.location.pathname;
    var q = new URLSearchParams(window.location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'].forEach(function (cle) {
      if (q.get(cle)) d[cle] = q.get(cle);
    });
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
    if (courant < pas.length - 1) { suivant(); return; }
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

  afficher(0, true);
})();
