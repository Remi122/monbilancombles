# Mon Bilan Combles : landing

Page de demande de bilan d'isolation des combles. Des particuliers remplissent le formulaire, leur demande part vers un webhook Make, puis elle est transmise à un artisan partenaire.

Site statique, sans étape de build : HTML, CSS et JavaScript écrits à la main, publiés tels quels par GitHub Pages depuis la branche `main`.

## Fichiers

- `index.html` : la landing (accroche et formulaire, pertes de chaleur, étapes, FAQ, appel final).
- `mentions-legales.html`, `confidentialite.html` : pages légales. Les passages entre `<mark>` restent à compléter.
- `assets/css/style.css` : tous les styles. Les tokens du design system sont recopiés dans le bloc `:root` en haut du fichier.
- `assets/js/config.js` : réglages. `webhookUrl` est l'adresse du webhook Make.
- `assets/js/form.js` : formulaire en 3 étapes, validation, envoi.
- `assets/fonts/` : Fraunces et Instrument Sans, hébergées ici (aucun appel à Google Fonts).
- `assets/img/` : logo, symbole, favicon.

## Commandes

- Aperçu local : `python3 -m http.server 8000`, puis ouvrir http://localhost:8000
- Mise en ligne : pousser sur `main`. GitHub Pages republie en une ou deux minutes.

Il n'y a ni dépendance à installer, ni test automatique. Après une modification, vérifier la page à 375px et à 1280px de large, et dérouler le formulaire jusqu'au bout.

## Design system

Source de vérité : https://claude.ai/artifact/DaAmqyBUVqmgS8e9VT1SoQ (lire son README avant de toucher au visuel).

- Couleurs : uniquement les variables de `:root` (`--sapin`, `--laine`, `--mousse`, `--lin`...). Jamais de code couleur écrit en dur ailleurs.
- `--laine` (jaune) est réservé au bouton principal et au mot surligné. Texte dessus en `--sur-laine`, jamais en blanc.
- Titres en Fraunces graisse 600, tout le reste en Instrument Sans. Texte courant à 17px minimum.
- Espacements et rayons : variables `--space-*` et `--radius-*`.
- Composants : classes `mbc-btn`, `mbc-champ`, `mbc-choix`, `mbc-pastille`, `mbc-liste-coches`. Les réutiliser avant d'en créer.
- Le logo est une image. Ne pas le recolorer ni réécrire le nom en texte.
- Pas de dégradé, pas d'emoji, pas de bleu-blanc-rouge : la marque est privée et ne doit pas ressembler à un site de l'État.

## Rédaction

- Vouvoiement, phrases courtes, mots de tous les jours.
- Boutons à la première personne : « Obtenir mon bilan gratuit ».
- Aucun chiffre sans source, aucune note ni avis inventés, aucune urgence fabriquée.
- Ne jamais écrire « isolation à 1 euro » ni « offre de l'État ».

## Formulaire

- Champs envoyés au webhook : `logement`, `code_postal`, `combles`, `statut`, `nom`, `telephone`, `email`, `consentement`, `date`, `page`, plus `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `gclid`, `fbclid` quand ils sont dans l'adresse.
- L'envoi se fait en champs de formulaire classiques (`application/x-www-form-urlencoded`), pas en JSON, pour éviter les blocages entre domaines.
- Le champ caché `site_web` est un piège à robots : s'il est rempli, rien n'est envoyé.
- Ajouter ou renommer un champ : le faire dans `index.html`, dans `regles` et `donnees()` de `form.js`, puis dans le scénario Make.
- Chaque champ en plus fait perdre des demandes. N'en ajouter que si l'artisan en a vraiment besoin.

## Avant le lancement

- Renseigner `webhookUrl` dans `assets/js/config.js` et envoyer une demande de test.
- Compléter les deux pages légales et les faire relire.
- Vérifier que chaque promesse de la page est tenue (gratuité, un artisan du secteur, usage des coordonnées).
- Retirer `<meta name="robots" content="noindex">` des trois pages.
- Brancher le nom de domaine monbilancombles.fr dans les réglages GitHub Pages.
