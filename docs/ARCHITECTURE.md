# Architecture Globale (DigiRisk Browser Extension)

Ce document décrit l'architecture haut niveau de l'extension de navigateur DigiRisk, conçue pour être compatible Manifest V3 (Chrome, Edge, Firefox).

## 1. Vision Globale

L'extension DigiRisk agit comme un pont direct entre la navigation web quotidienne de l'utilisateur et son instance Dolibarr / DigiRisk (via son API REST). L'objectif est d'offrir une interface légère, instantanée et non-intrusive (un popup) permettant de créer et consulter des tickets et signalements rattachés aux Groupements (GP) et Unités de Travail (UT) DigiRisk sans quitter l'onglet courant.

## 2. Séparation des Responsabilités

L'architecture est découpée en trois strates distinctes imposées par Manifest V3 :

- **Background (Service Worker)** : Éphémère (se coupe après 30s d'inactivité). Gère la communication externe (requêtes API) de manière sécurisée pour éviter les problèmes de CORS présents dans le contexte de la page web.
- **UI (Popup & Options)** : Les vues HTML/CSS/JS isolées de la page web courante. C'est l'interface principale de l'extension. Le code y est réactif et purement événementiel (Vanilla JS).
- **Content Scripts** : Scripts injectés dans la page web de l'utilisateur. Ils permettent la capture de texte sélectionné et l'éditeur d'annotation de capture d'écran in-page.

## 3. Structure du Dépôt

```
/
├── _locales/           # Traductions (FR, EN, ES, DE, IT) i18n
├── docs/               # Documentation interne (Architecture)
├── src/
│   ├── background/     # Service worker (exécuteur de requêtes)
│   ├── content/        # Content scripts injectés (éditeur capture d'écran in-page)
│   ├── services/       # Services partagés (API REST Dolibarr)
│   └── utils/          # Constantes et gestion d'erreurs
├── ui/
│   ├── components/     # Composants UI partagés
│   ├── options/        # Page de configuration (Profils, Tokens, URLs, Diagnostic)
│   └── popup/          # Le popup principal (HTML/CSS/JS)
├── icon32.png          # Icônes de l'extension (32, 128, 192)
└── manifest.json       # Configuration Manifest V3
```
