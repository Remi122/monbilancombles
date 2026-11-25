# Mon Bilan Combles : landing

Page de demande de bilan d'isolation des combles. Des particuliers remplissent le formulaire, leur demande part vers un webhook Make, puis elle est transmise à un artisan partenaire.

Site statique, sans étape de build : HTML, CSS et JavaScript écrits à la main, publiés tels quels par GitHub Pages depuis la branche `main`.

## Fichiers

- `index.html` : la landing (accroche et formulaire, garanties, constat, aides 2026, déroulé, combles perdus ou aménagés, FAQ, appel final). Les icônes sont dans un bloc `<symbol>` en haut du fichier et s'appellent avec `<use href="#i-nom">`.
- `mentions-legales.html`, `confidentialite.html` : pages légales, complètes. La politique de confidentialité nomme les outils utilisés (Make, Google Sheets, Google Tag Manager, Google Analytics 4, Google Ads, Microsoft Clarity, GitHub) et dit qu'une demande peut partir chez plusieurs artisans. Tout nouvel outil (Meta par exemple) ou tout changement dans la transmission des demandes doit y être ajouté, ainsi que dans la case de consentement du formulaire.
- `assets/css/style.css` : tous les styles. Les tokens du design system sont recopiés dans le bloc `:root` en haut du fichier.
- `assets/js/config.js` : réglages. `webhookUrl` est l'adresse du webhook Make.
- `assets/js/form.js` : formulaire en 6 étapes (une question par écran), validation, envoi.
- `assets/js/cookies.js` : bandeau cookies. Rien ne se charge avant l'accord du visiteur. Google Tag Manager se charge après accord si `gtmId` est renseigné dans `config.js`.
- `assets/js/anim.js` : apparition des blocs au défilement et remplissage des barres du graphique. Désactivé si le visiteur a demandé moins d'animations.
- `assets/fonts/` : Fraunces et Instrument Sans, hébergées ici (aucun appel à Google Fonts).
- `assets/img/` : logo, symbole, favicon, et trois photos d'illustration fournies par Rémi, qui en a les droits : `avant-apres.webp` (carte à côté du graphique), `combles-perdus.webp`, `combles-amenages.webp`. À remplacer par de vraies photos de chantier dès qu'il y en a.

## Commandes

- Aperçu local : `python3 -m http.server 8000`, puis ouvrir http://localhost:8000
- Mise en ligne : pousser sur `main`. GitHub Pages republie en une ou deux minutes.
- Après chaque modification d'un fichier CSS, JS ou d'une image, augmenter son numéro `?v=` dans `index.html`. Sans ça, les visiteurs gardent l'ancien fichier une dizaine de minutes et la page peut s'afficher de travers.

Il n'y a ni dépendance à installer, ni test automatique. Après une modification, vérifier la page à 375px et à 1280px de large, et dérouler le formulaire jusqu'au bout. Sur mobile, la première question doit tenir en entier sur le premier écran, bandeau cookies affiché.

## Design system

Source de vérité : https://claude.ai/artifact/DaAmqyBUVqmgS8e9VT1SoQ (lire son README avant de toucher au visuel).

- Couleurs : uniquement les variables de `:root` (`--sapin`, `--laine`, `--mousse`, `--lin`...). Jamais de code couleur écrit en dur ailleurs.
- `--laine` (jaune) est réservé au bouton principal, au mot surligné et au contour de 2 px du formulaire. Texte posé sur `--laine` : `--sur-laine`, jamais en blanc.
- Bouton principal (`mbc-btn`) : fond `--laine-foncee`, survol `--laine-sombre`, texte `--blanc`. Choix de Rémi du 24 novembre 2026, en sachant que le contraste n'est que de 2,4:1 (le texte vert foncé sur `--laine` donnait 6,3:1).
- Titres en Fraunces graisse 600, tout le reste en Instrument Sans. Texte courant à 17px minimum.
- Espacements et rayons : variables `--space-*` et `--radius-*`.
- Composants : classes `mbc-btn` (variantes `--secondaire`, `--bloc`, `--compact`), `mbc-champ`, `mbc-option`, `mbc-pastille`, `mbc-liste-coches`. Les réutiliser avant d'en créer.
- En-tête : bouton compact « Vérifier mes aides » vers le formulaire, masqué sous 720 px (sur mobile, le formulaire est déjà sur le premier écran).
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

## Mesure

- `form.js` pousse dans le `dataLayer` : `formulaire_debut` (première réponse), `formulaire_etape` (`etape_numero`, `etape_nom`, `reponse` ; pour le code postal, seulement le département), `generate_lead` (demande envoyée : `statut`, `logement`, `combles`, `annee`, `departement`), `formulaire_erreur` (`erreur`). Jamais de nom, téléphone ni e-mail : la politique de confidentialité le promet.
- Les étapes 5 et 6 (code postal, coordonnées) portent `data-clarity-mask="True"` pour que Clarity ne les enregistre jamais.
- `gtm/conteneur-gtm.json` : conteneur Tag Manager à importer (Admin > Importer un conteneur, fusionner). Il contient la balise Google GA4, les 4 événements GA4, Microsoft Clarity (avec l'accord transmis par `consentv2`) et un événement Clarity à l'envoi. Après import, vérifier les variables constantes « ID GA4 » et « ID Clarity », puis publier. Identifiants : Tag Manager `GTM-T5GX59MS` (dans `config.js`), GA4 `G-86R1R63SX0` et Clarity `ziv19n6ny3` (dans le fichier du conteneur). Ne jamais coller le code Clarity ou GA4 directement dans la page : tout passe par Tag Manager, pour respecter le bandeau cookies.
- Tag Manager ne se charge qu'après « Accepter » dans le bandeau cookies (`cookies.js`), une fois `gtmId` renseigné dans `config.js`. Les événements poussés avant l'accord restent dans le `dataLayer` et sont lus si le visiteur accepte ensuite.
- Dans GA4 : désactiver « Interactions avec les formulaires » dans la mesure améliorée (doublons), marquer `generate_lead` comme événement clé, créer les dimensions personnalisées des paramètres ci-dessus.

## Section aides

- La structure de la page reprend celle de mon-bilan-solaire.fr : accroche sur les aides, formulaire à une question par écran, bandes de couleur, bouton « Vérifier mes aides » suivi d'une courte légende.
- Les sources officielles sont en bas de page, dans le pied. Si une photo demande un crédit (licence Creative Commons par exemple), il va au même endroit.
- Les règles citées (fin de MaPrimeRénov' par geste pour l'isolation au 1er septembre 2026, prime CEE, TVA à 5,5 %, éco-prêt à taux zéro de 15 000 €, rénovation d'ampleur) ont été vérifiées le 23 novembre 2026 sur Service-Public.fr et France Rénov'.
- Les aides changent souvent. Avant chaque campagne, revérifier chaque chiffre sur les pages officielles liées sous la section, puis mettre à jour la date affichée.
- Ne jamais promettre un montant ni une éligibilité : la page dit ce qui existe, le bilan dit ce qui s'applique.
- La marque reste privée : parler des aides de l'État sans jamais se présenter comme un service public.

## Avant le lancement

- Renseigner `webhookUrl` dans `assets/js/config.js` et envoyer une demande de test.
- Faire relire les deux pages légales par un juriste, y compris les obligations des plateformes de mise en relation (article L111-7 du code de la consommation).
- Vérifier que chaque promesse de la page est tenue : gratuité, artisans tous RGE, appel puis bilan par e-mail avant tout déplacement, usage des coordonnées.
- Retirer `<meta name="robots" content="noindex">` des trois pages.
- Nom de domaine : mon-bilan-combles.fr (DNS chez OVH, branché dans les réglages GitHub Pages le 24 novembre 2026). Le fichier `CNAME` à la racine doit rester, sinon le domaine décroche. Une fois le certificat créé par GitHub, cocher « Enforce HTTPS ».
