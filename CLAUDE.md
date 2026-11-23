# Mon Bilan Combles : landing

Page de demande de bilan d'isolation des combles. Des particuliers remplissent le formulaire, leur demande part vers un webhook Make, puis elle est transmise à un artisan partenaire.

Site statique, sans étape de build : HTML, CSS et JavaScript écrits à la main, publiés tels quels par GitHub Pages depuis la branche `main`.

## Fichiers

- `index.html` : la landing (accroche et formulaire, garanties, constat, aides 2026, déroulé, combles perdus ou aménagés, FAQ, appel final). Les icônes sont dans un bloc `<symbol>` en haut du fichier et s'appellent avec `<use href="#i-nom">`.
- `mentions-legales.html`, `confidentialite.html` : pages légales. Les passages entre `<mark>` restent à compléter.
- `assets/css/style.css` : tous les styles. Les tokens du design system sont recopiés dans le bloc `:root` en haut du fichier.
- `assets/js/config.js` : réglages. `webhookUrl` est l'adresse du webhook Make.
- `assets/js/form.js` : formulaire en 6 étapes (une question par écran), validation, envoi.
- `assets/js/cookies.js` : bandeau cookies. Rien ne se charge avant l'accord du visiteur. Google Tag Manager se charge après accord si `gtmId` est renseigné dans `config.js`.
- `assets/fonts/` : Fraunces et Instrument Sans, hébergées ici (aucun appel à Google Fonts).
- `assets/img/` : logo, symbole, favicon.

## Commandes

- Aperçu local : `python3 -m http.server 8000`, puis ouvrir http://localhost:8000
- Mise en ligne : pousser sur `main`. GitHub Pages republie en une ou deux minutes.

Il n'y a ni dépendance à installer, ni test automatique. Après une modification, vérifier la page à 375px et à 1280px de large, et dérouler le formulaire jusqu'au bout. Sur mobile, la première question doit tenir en entier sur le premier écran, bandeau cookies affiché.

## Design system

Source de vérité : https://claude.ai/artifact/DaAmqyBUVqmgS8e9VT1SoQ (lire son README avant de toucher au visuel).

- Couleurs : uniquement les variables de `:root` (`--sapin`, `--laine`, `--mousse`, `--lin`...). Jamais de code couleur écrit en dur ailleurs.
- `--laine` (jaune) est réservé au bouton principal et au mot surligné. Texte dessus en `--sur-laine`, jamais en blanc.
- Titres en Fraunces graisse 600, tout le reste en Instrument Sans. Texte courant à 17px minimum.
- Espacements et rayons : variables `--space-*` et `--radius-*`.
- Composants : classes `mbc-btn`, `mbc-champ`, `mbc-option`, `mbc-pastille`, `mbc-liste-coches`. Les réutiliser avant d'en créer.
- Le logo est une image. Ne pas le recolorer ni réécrire le nom en texte.
- Pas de dégradé, pas d'emoji, pas de bleu-blanc-rouge : la marque est privée et ne doit pas ressembler à un site de l'État.

## Rédaction

- Vouvoiement, phrases courtes, mots de tous les jours.
- Boutons à la première personne : « Vérifier mes aides ».
- Aucun chiffre sans source, aucune note ni avis inventés, aucune urgence fabriquée.
- Ne jamais dire deux fois la même chose sur la page : chaque information a une seule place.
- Ne jamais écrire « isolation à 1 euro » ni « offre de l'État ».

## Formulaire

- Champs envoyés au webhook : `statut`, `logement`, `combles`, `annee`, `code_postal`, `nom`, `telephone`, `email`, `consentement`, `date`, `page`, plus `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `gclid`, `fbclid` quand ils sont dans l'adresse.
- L'envoi se fait en champs de formulaire classiques (`application/x-www-form-urlencoded`), pas en JSON, pour éviter les blocages entre domaines.
- Le champ caché `site_web` est un piège à robots : s'il est rempli, rien n'est envoyé.
- Un clic sur une réponse passe à la question suivante. Au clavier, les flèches choisissent et Entrée valide.
- Ajouter ou renommer une question : le faire dans `index.html`, dans `choix` ou `regles` et `donnees()` de `form.js`, puis dans le scénario Make. Ajouter aussi un segment `<i>` à la barre de progression.
- Chaque champ en plus fait perdre des demandes. N'en ajouter que si l'artisan en a vraiment besoin.

## Section aides

- La structure de la page reprend celle de mon-bilan-solaire.fr : accroche sur les aides, formulaire à une question par écran, bandes de couleur, bouton « Vérifier mes aides » suivi d'une courte légende.
- Les règles citées (fin de MaPrimeRénov' par geste pour l'isolation au 1er septembre 2026, prime CEE, TVA à 5,5 %, éco-prêt à taux zéro de 15 000 €, rénovation d'ampleur) ont été vérifiées le 23 novembre 2026 sur Service-Public.fr et France Rénov'.
- Les aides changent souvent. Avant chaque campagne, revérifier chaque chiffre sur les pages officielles liées sous la section, puis mettre à jour la date affichée.
- Ne jamais promettre un montant ni une éligibilité : la page dit ce qui existe, le bilan dit ce qui s'applique.
- La marque reste privée : parler des aides de l'État sans jamais se présenter comme un service public.

## Avant le lancement

- Renseigner `webhookUrl` dans `assets/js/config.js` et envoyer une demande de test.
- Compléter les deux pages légales et les faire relire.
- Vérifier que chaque promesse de la page est tenue : gratuité, artisans tous RGE, appel puis bilan par e-mail avant tout déplacement, usage des coordonnées.
- Retirer `<meta name="robots" content="noindex">` des trois pages.
- Brancher le nom de domaine monbilancombles.fr dans les réglages GitHub Pages.
