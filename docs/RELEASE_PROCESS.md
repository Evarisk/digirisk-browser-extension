# Release Process (ReedCRM Extension)

Ce document détaille les étapes nécessaires pour la création et le déploiement d'une nouvelle version de l'extension ReedCRM.

## 1. Préparation de la Release

1. **Vérification des tests locaux** : S'assurer que les appels API, l'interface graphique (popup), et le stockage fonctionnent correctement (`chrome.storage`).
2. **Mise à jour de la version** :
   - Ouvrir `manifest.json`.
   - Mettre à jour la clé `"version": "X.Y.Z"` (ex: `"23.0.3"`).
3. **Validation de sécurité** :
   - Vérifier qu'aucune nouvelle API non documentée n'est ajoutée.

## 2. Génération Automatique du ZIP & Release GitHub (CI/CD)

L'empaquetage est entièrement automatisé via GitHub Actions (`.github/workflows/release.yml`).

Pour publier une nouvelle version :
1. Commitez et pushez la mise à jour de `"version"` dans `manifest.json` sur `main`.
2. Créez et poussez le tag correspondant :
   ```bash
   git tag v23.0.3
   git push origin v23.0.3
   ```
   *(Vous pouvez également créer la Release et le tag directement depuis l'interface GitHub, ou lancer l'action manuellement via l'onglet **Actions > Build & Release Chrome Extension > Run workflow**).*

3. **Ce que fait automatiquement la GitHub Action** :
   - Vérifie que `manifest.json` est valide et que sa version correspond au tag Git.
   - Vérifie la validité JSON de tous les fichiers `_locales/*/messages.json`.
   - Vérifie la syntaxe JavaScript de tous les fichiers dans `src/` et `ui/`.
   - Construit une archive propre `reedcrm-chrome-vX.Y.Z.zip` contenant uniquement à sa racine :
     - `manifest.json`, `LICENSE`, `icon32.png`, `icon128.png`, `icon192.png`
     - `_locales/`, `src/`, `ui/`
     *(Sans `.git/`, `docs/`, `scratch/`, `AGENTS.md`, etc.)*
   - Crée la **Release GitHub** avec les notes de version générées automatiquement et y attache le fichier `reedcrm-chrome-vX.Y.Z.zip`.

## 3. Publication (Chrome Web Store)

1. Téléchargez le fichier `reedcrm-chrome-vX.Y.Z.zip` depuis la page [Releases GitHub](https://github.com/Eoxia/reedcrm-browser-extension/releases).
2. Accédez au [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole/).
3. Sélectionnez l'extension **ReedCRM**.
4. Allez dans **Package** > **Importer un nouveau package** et déposez `reedcrm-chrome-vX.Y.Z.zip`.
5. Remplissez ou mettez à jour les descriptions dans **Fiche du magasin** si nécessaire.
6. Soumettez pour examen.
