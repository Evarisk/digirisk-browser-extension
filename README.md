# Extension Navigateur DigiRisk pour Dolibarr

Extension Google Chrome (Manifest V3) permettant d'interagir directement avec votre instance **Dolibarr ERP/CRM** et le module **DigiRisk** (santé et sécurité au travail / DUERP / registre de sécurité) pour créer et suivre vos tickets et signalements sans quitter votre navigation.

## Fonctionnalités principales

- **Connexion API Dolibarr & DigiRisk** :
  - Écran d'accueil (Onboarding) lors de la première ouverture du popup pour configurer rapidement l'URL Dolibarr, l'identifiant et le mot de passe ou jeton API.
  - Gestion multi-profils permettant de basculer entre plusieurs instances Dolibarr.
  - Support natif du module **MultiCompany** (`DOLAPIENTITY`).
  - Détection automatique de l'endpoint `/api/index.php` (compatible installations à la racine ou avec `/htdocs`).
  - Tableau de bord de diagnostic temps réel des permissions Dolibarr et DigiRisk (API REST, Module DigiRisk GP/UT, Tickets, Utilisateurs, Tiers, Projets, GED).
- **Création et suivi de Tickets DigiRisk / Dolibarr** :
  - Création rapide d'un ticket avec sujet, message, assignation automatique ou manuelle à un utilisateur.
  - Rattachement direct à un **Groupement (GP) ou une Unité de Travail (UT)** DigiRisk (`options_digiriskdolibarr_ticket_service`) et renseignement du **Lieu** (`options_digiriskdolibarr_ticket_location`).
  - Rattachement optionnel à un Tiers, Contact et Projet Dolibarr.
  - Ajout de pièces jointes par glisser-déposer et **capture d'écran annotée** de l'onglet actif (recadrage, flèches, texte, floutage RGPD).
  - Sauvegarde automatique des brouillons (`chrome.storage.local`).
  - Consultation des derniers tickets et liste complète avec filtres, recherche et édition rapide en ligne (statut, sévérité, assignation).

## Installation en mode développeur

1. Clonez ce dépôt :
   ```bash
   git clone https://github.com/Evarisk/digirisk-browser-extension.git
   cd digirisk-browser-extension
   ```
2. Ouvrez Google Chrome et accédez à `chrome://extensions/`.
3. Activez le **Mode développeur** (en haut à droite).
4. Cliquez sur **Charger l'extension non empaquetée** et sélectionnez le dossier du dépôt.

## Liens utiles

- Site officiel DigiRisk : [https://digirisk.com](https://digirisk.com)
- Dépôt du module Dolibarr DigiRisk : [https://github.com/Evarisk/DigiRisk](https://github.com/Evarisk/DigiRisk)
- Support & Issues : [https://github.com/Evarisk/digirisk-browser-extension/issues](https://github.com/Evarisk/digirisk-browser-extension/issues)

## Licence

Distribué sous licence **GNU General Public License v3.0** (`GPL-3.0`). Voir le fichier [LICENSE](LICENSE).
