/* Apparition en douceur des blocs au défilement, et barres du graphique qui se remplissent.
   Rien ne bouge si le visiteur a demandé moins d'animations, et sans JavaScript tout reste visible. */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var cibles = document.querySelectorAll('.section .titre-1, .section .intro, .garanties li, .constat > .carte, .aide, .etapes li, .type, .faq details, .appel');
  var hauteur = window.innerHeight;
  var vus = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('est-vu');
      vus.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  Array.prototype.forEach.call(cibles, function (el) {
    if (el.getBoundingClientRect().top < hauteur) return; /* déjà à l'écran : on n'y touche pas */
    var rang = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.style.setProperty('--delai', Math.min(rang, 4) * 70 + 'ms');
    el.setAttribute('data-anim', '');
    vus.observe(el);
  });

  var barres = document.querySelector('.barres');
  if (barres && barres.getBoundingClientRect().top >= hauteur) {
    Array.prototype.forEach.call(barres.children, function (li, i) { li.style.setProperty('--delai', i * 90 + 'ms'); });
    barres.setAttribute('data-barres', '');
    vus.observe(barres);
  }

  document.documentElement.classList.add('js-anim');
})();
