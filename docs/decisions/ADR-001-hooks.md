# ADR 001: Remplacement des Hooks par des Événements (Extension)

## Contexte
L'extension n'étant pas intégrée au moteur backend de Dolibarr, le système de Hooks PHP classique n'est pas applicable.

## Décision
Toute interaction asynchrone ou injection de logique dans l'onglet actif doit passer par :
- Des `Content Scripts` qui agissent comme des "listeners" dans la page.
- Des événements Chrome (`chrome.runtime.sendMessage` / `chrome.runtime.onMessage.addListener`).

## Conséquences
- Architecture purement asynchrone et événementielle.
- Moins de couplage avec le code source de Dolibarr.
