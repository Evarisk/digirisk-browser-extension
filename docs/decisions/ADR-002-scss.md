# ADR 002: Abandon du SCSS au profit du CSS Vanilla (Extension)

## Contexte
Le framework backend Saturne repose fortement sur Gulp et SCSS pour gérer les thèmes et les variables. L'extension Chrome dispose d'interfaces beaucoup plus petites et isolées.

## Décision
Pour minimiser la chaîne de compilation et les dépendances, **l'extension utilise exclusivement du CSS Vanilla (CSS3)**. Les variables natives (`--color-primary`) remplacent les variables SCSS.

## Conséquences
- Pas besoin de configurer Gulp.
- Changements immédiats sans compilation.
- Moins de réutilisabilité inter-projets, mais suffisant pour le périmètre restreint d'un popup d'extension.
