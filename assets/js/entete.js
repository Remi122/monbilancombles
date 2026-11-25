/* En-tête collant : un trait apparaît sous l'en-tête dès qu'on fait défiler la page.
   Sur mobile, le bouton « Vérifier mes aides » n'y apparaît qu'une fois le formulaire sorti de l'écran.
   La hauteur de l'en-tête est transmise au CSS pour que les liens #faq, #aides… ne passent pas dessous. */
(function () {
  'use strict';

  var entete = document.querySelector('.entete');
  if (!entete) return;
  var racine = document.documentElement;

  function mesurer() { racine.style.setProperty('--entete-hauteur', entete.offsetHeight + 'px'); }
  function suivre() { entete.classList.toggle('est-colle', window.scrollY > 4); }

  mesurer();
  suivre();
  window.addEventListener('resize', mesurer);
  window.addEventListener('scroll', suivre, { passive: true });

  var formulaire = document.getElementById('bilan');
  if (formulaire && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entrees) {
      entete.classList.toggle('formulaire-hors-vue', !entrees[0].isIntersecting);
      mesurer();
    }).observe(formulaire);
  }
})();
