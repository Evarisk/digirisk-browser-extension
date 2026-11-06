# Reference Files & Patterns

Ce document liste les fichiers "canoniques" qui servent de modèle et de référence lors du développement sur l'extension ReedCRM. **Toute nouvelle intégration doit s'inspirer des patterns trouvés dans ces fichiers.**

## 1. UI et Interactions Popup

**`ui/popup/popup.js`**
- Contient la logique d'initialisation et d'interaction avec le DOM.
- **Pattern de sélection** : Utilisation exclusive de `document.getElementById` ou `document.querySelectorAll`.
- **Pattern de gestion d'événement** : Ajout explicite de listeners via `addEventListener('click', ...)`.
- **Pattern de gestion des erreurs UI** : Tout code asynchrone modifiant le DOM est encapsulé dans des blocs `try/catch` rendant un état d'erreur visible (message en rouge textuel, jamais un crash silencieux).

## 2. API et Communication avec Dolibarr

**`src/services/api.js` (ou équivalent `api/dolibarr.js`)**
- Centralise toutes les communications externes.
- **Copy this structure** :
  ```javascript
  // Remplacement global pour intercepter les fetch et les envoyer au SW (Règle 12)
  export async function fetchDoli(url, options = {}) {
      return new Promise((resolve, reject) => {
          // Extraction et formatage URL...
          chrome.runtime.sendMessage({
              type: "API_CALL",
              payload: { method, doliUrl, apiKey, endpoint, body }
          }, response => {
              // ...Gestion de l'erreur Chrome Runtime
              // ...Résolution avec le format fetch-like (response.ok, response.json())
          });
      });
  }
  ```
- **Ne jamais créer un `fetch` distant direct depuis `popup.js` ou un script de contenu**.

## 3. Communication Inter-Scripts (Messages)

**`src/background/background.js`**
- Gère le transit des données et les écoutes réseau.
- **Pattern d'écoute** :
  ```javascript
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === "API_CALL") {
          handleApiCall(request.payload).then(sendResponse).catch(err => sendResponse({error: err.message}));
          return true; // Obligatoire pour garder le canal de communication ouvert (async)
      }
  });
  ```

## 4. Rendu HTML et Data Mappers

**`ui/popup/src/models/*.mapper.js` et `ui/popup/src/components/*.js`**
- Sépare clairement la transformation des données brutes (Mapper) de la génération du HTML (Components).
- **Copy this pattern** :
  1. `mapTicket(apiTicket, state)` -> Extrait et normalise les données (dates, couleurs, escapeHtml).
  2. `renderTicketItemHtml(mappedTicket)` -> Concatène des strings JS (Template Literals) en évitant toute logique métier lourde. Ne retourne **que** la string HTML.
