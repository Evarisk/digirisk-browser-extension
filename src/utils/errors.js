// Dictionnaire standardisé des erreurs DigiRisk (Métadonnées uniquement)
const ERROR_DICTIONARY = {
    // ---- Catégorie : API & Réseau (Série 1000) ----
    'DigiRisk-1001': { category: 'Réseau', key: 'error_1001', file: 'options.js', line: 155 },
    'DigiRisk-1002': { category: 'Authentification', key: 'error_1002', file: 'options.js', line: 35 },
    'DigiRisk-1003': { category: 'Permissions', key: 'error_1003', file: 'popup.js', line: 'auto' },
    'DigiRisk-1004': { category: 'Ressource Introuvable', key: 'error_1004', file: 'popup.js', line: 'auto' },
    'DigiRisk-1500': { category: 'Serveur Dolibarr (Erreur Interne)', key: 'error_1500', file: 'popup.js', line: 'auto' },

    // ---- Catégorie : Configuration (Série 2000) ----
    'DigiRisk-2001': { category: 'Configuration Manquante', key: 'error_2001', file: 'popup.js', line: 'auto' },
    'DigiRisk-2002': { category: 'Configuration Manquante', key: 'error_2002', file: 'background.js', line: 'multiple' },

    // ---- Catégorie : Performance (Série 2500) ----
    'DigiRisk-2003': { category: 'Performance: Miniature Manquante', key: 'error_2003', file: 'popup.js', line: 'auto' },

    // ---- Catégorie : Validation Formulaire (Série 3000) ----
    'DigiRisk-3001': { category: 'Validation', key: 'error_3001', file: 'popup.js', line: 'auto' },
    'DigiRisk-3002': { category: 'Validation', key: 'error_3002', file: 'popup.js', line: 'auto' },

    // ---- Catégorie : Traitement Métier / Création Entités (Série 4000) ----
    'DigiRisk-4001': { category: 'Affectation Contact', key: 'error_4001', file: 'popup.js', line: 'auto' },
    'DigiRisk-4002': { category: 'Sauvegarde API', key: 'error_4002', file: 'popup.js', line: 'auto' },
    'DigiRisk-4003': { category: 'Erreur Réseau (Contact)', key: 'error_4003', file: 'popup.js', line: 'auto' },
    'DigiRisk-4004': { category: 'Sauvegarde API', key: 'error_4004', file: 'popup.js', line: 'auto' },
    'DigiRisk-4005': { category: 'Envoi PJ', key: 'error_4005', file: 'popup.js', line: 'auto' },
    'DigiRisk-4006': { category: 'Envoi PJ Ticket', key: 'error_4006', file: 'popup.js', line: 'auto' },

    // ---- Catégorie : Édition en ligne (Série 5000) ----
    'DigiRisk-5006': { category: 'Assignation Utilisateur', key: 'error_5006', file: 'inline-edit/index.js', line: 'auto' },

    // ---- Défaut ----
    'DigiRisk-9999': { category: 'Erreur Inconnue', key: 'error_9999', file: 'Partout', line: 'auto' }
};

function normalizeErrorCode(code) {
    if (!code) return 'DigiRisk-9999';
    return String(code).replace(/^ReedCRM-/, 'DigiRisk-');
}

const ErrorManager = {
    getMessage(errorCode, fallbackString = "") {
        const normalizedCode = normalizeErrorCode(errorCode);
        let msgKey = normalizedCode;

        if (ERROR_DICTIONARY[normalizedCode]) {
            msgKey = ERROR_DICTIONARY[normalizedCode].key;
        }

        if (chrome && chrome.i18n) {
            const translatedMessage = chrome.i18n.getMessage(msgKey, fallbackString ? [fallbackString] : undefined);
            if (translatedMessage) {
                return translatedMessage;
            }
        }

        if (fallbackString) return `Erreur : ${fallbackString}`;
        return `Code d'erreur inconnu : ${normalizedCode}`;
    }
};

/**
 * Classe standardisée pour gérer toutes les erreurs de l'extension.
 */
class DoliError extends Error {
    constructor(code, originalError = null, context = {}) {
        const normalizedCode = normalizeErrorCode(code);
        const errorDef = ERROR_DICTIONARY[normalizedCode] || ERROR_DICTIONARY['DigiRisk-9999'];

        const translatedMessage = ErrorManager.getMessage(normalizedCode, context.substitution || "");
        super(translatedMessage);

        this.name = 'DoliError';
        this.code = normalizedCode;
        this.category = errorDef.category;
        this.userMessage = translatedMessage;

        this.dictFile = errorDef.file || 'non défini';
        this.dictLine = errorDef.line || 'non défini';

        if (originalError) {
            this.technicalMessage = (typeof originalError === 'object' && originalError.message) ? originalError.message : String(originalError);
        } else {
            this.technicalMessage = "Aucun détail technique fourni.";
        }

        this.context = context;

        this.callerInfo = "Origine inconnue";
        if (this.stack) {
            const stackLines = this.stack.split('\n');
            for (let i = 1; i < stackLines.length; i++) {
                if (stackLines[i] && !stackLines[i].includes('errors.js')) {
                    const match = stackLines[i].match(/\/([^\/]+\.js):(\d+):\d+/);
                    if (match) {
                        this.callerInfo = `${match[1]} - L${match[2]}`;
                    }
                    break;
                }
            }
        }
    }

    /**
     * Génère le bloc HTML standardisé pour afficher l'erreur à l'utilisateur.
     * @returns {string} Le code HTML de la boîte d'erreur
     */
    toHTML() {
        const safeTechMessage = (this.technicalMessage || "Aucun message technique").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        const detailsHtml = `
        <details class="doli-error-details">
            <summary>Voir les détails techniques</summary>
            <div style="margin-top: 8px; margin-bottom: 2px; font-weight: bold; font-size: 0.9em; color: #555;">📍 Dictionnaire : ${this.dictFile} / Ligne ${this.dictLine}</div>
            <div style="margin-bottom: 8px; font-size: 0.85em; color: #7f8c8d;">Trace exécution : ${this.callerInfo}</div>
            <pre>${safeTechMessage}</pre>
            ${this.context && Object.keys(this.context).length > 0 ? `<pre>Contexte: ${JSON.stringify(this.context, null, 2)}</pre>` : ''}
        </details>`;

        return `
        <div class="doli-error-box">
            <div class="doli-error-header">
                <strong>[${this.code}] ${this.category}</strong>
            </div>
            <div class="doli-error-body">
                ${this.userMessage}
            </div>
            ${detailsHtml}
        </div>`;
    }
}

// Fonction utilitaire pour faciliter l'affichage
function showDoliError(errorObject, domElement) {
    if (errorObject instanceof DoliError) {
        domElement.innerHTML = errorObject.toHTML();
    } else {
        const fallback = new DoliError('DigiRisk-9999', errorObject);
        domElement.innerHTML = fallback.toHTML();
    }
}
