# Règles du Projet & Workflow (ReedCRM Extension)

## 1. Setup Local

L'extension ne nécessite aucun processus de `build` complexe type Webpack ou Vite. Il s'agit de HTML, CSS et Vanilla JS standards supportés par le navigateur.

1. Clonez le dépôt.
2. Ouvrez Google Chrome / Brave / Edge.
3. Allez sur `chrome://extensions/`.
4. Activez le **Mode Développeur** en haut à droite.
5. Cliquez sur **Charger l'extension non empaquetée** et sélectionnez le dossier racine de l'extension.

## 2. Développement Quotidien

- **Rafraîchissement** : Chaque fois que vous modifiez un fichier JS ou HTML, cliquez sur le bouton "Actualiser" (flèche en boucle) sur la carte de l'extension dans `chrome://extensions/`.
- **Débogage du Service Worker** : Cliquez sur "Service worker" sur la carte de l'extension pour ouvrir une console DevTools dédiée au script d'arrière-plan.
- **Débogage du Popup** : Faites un clic-droit sur l'icône de l'extension dans la barre d'outils et sélectionnez "Inspecter le pop-up".

## 3. Workflow Git (Git Conventions)

**Branch** : `{type}/{issue-number}-{short-description}`
→ `fix/503-mail-eventpro`, `feat/478-menu-reorder`

**Ne jamais commiter directement sur main**. La branche de dev principale est `main`. Une PR est requise avec ≥1 relecteur.

**Une issue = une branche = une PR.** Ne jamais mélanger plusieurs issues dans une seule branche ou PR.

**Format des commits** : `#{issue} [{Scope}] {type}: {short description}`

| Type | Usage |
|------|-------|
| `feat` / `add` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `rework` | Refactorisation / Rework |
| `chore` / `ci` | Build, CI, configuration |
| `docs` / `style` | Documentation, formatage |

**Scope** : Élément métier si large (`Ticket`, `Opportunite`), ou catégorie technique si ciblée (`JS`, `UI`, `CI`).

**Exemples de commits** :
- `#503 [Ticket] fix: affichage du compteur`
- `#478 [UI] rework: réorganisation des boutons`
- `#1305 [JS] add: gestionnaire d'événements API`

**Labels d'Issue** :
- **Story points** — ajoutez un label de suite de Fibonacci à chaque issue : `0`, `1`, `2`, `3`, `5`, `8`, `13`, `21`.
- **PWA** — ajoutez le label `PWA` aux issues liées à l'application web progressive si applicable.

## 4. Intégration Continue (CI)

*(À définir selon le repo GitHub de l'équipe Eoxia)*
Si applicable, une action GitHub vérifie la conformité JavaScript (JSHint, ESLint) et construit les paquets ZIP de déploiement à chaque publication de release.

## 5. Contraintes Spécifiques (Manifest V3)

- **Pas d'utilisation de CDN ou librairies distantes** via `<script src="https://...">`. Tout le code doit être localisé dans l'extension (exigence de sécurité Google Web Store).
- **Versioning** : Mettre systématiquement à jour la clé `"version"` dans `manifest.json` lors de chaque publication majeure/mineure pour permettre les mises à jour automatiques via les stores.
