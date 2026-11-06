# ADR 003: Stratégie de Build (Extension)

## Contexte
L'extension navigateur doit être déployée sur Chrome, Firefox et Edge. Faut-il utiliser un outil de bundle complexe type Webpack, Vite ou Gulp comme sur le projet backend ?

## Décision
**Nous avons décidé de ne PAS utiliser de bundler ni de compilateur (ex: Babel, TS, SCSS) pour cette extension.** 

## Conséquences
- Le code source est directement interprété par le navigateur.
- Facilite le debug en production.
- Respecte naturellement les règles strictes de sécurité du Chrome Web Store (qui demande souvent le code source non minifié si le bundle est complexe).
- Limite l'utilisation des imports ES Modules à l'architecture native du navigateur.
