import { MESSAGE_TYPES } from '../../src/utils/constants.js';

/**
 * Retourne les URL candidates /api/index.php à tester dans l'ordre.
 * Si l'utilisateur ne précise pas /api/index.php ni /htdocs, on teste la racine puis /htdocs.
 * @param {string} rawUrl
 * @returns {string[]}
 */
function getDoliApiCandidates(rawUrl) {
    let cleaned = (rawUrl || '').trim().replace(/\/+$/, '');
    if (!cleaned) return [];
    if (cleaned.endsWith('/api/index.php')) {
        return [cleaned];
    }
    if (cleaned.endsWith('/htdocs')) {
        return [cleaned + '/api/index.php'];
    }
    if (!cleaned.includes('/api/index.php')) {
        return [
            cleaned + '/api/index.php',
            cleaned + '/htdocs/api/index.php'
        ];
    }
    return [cleaned];
}

// Remplacement global pour intercepter les fetch et les envoyer au SW (Règle 12)
async function fetchDoli(url, options = {}) {
    return new Promise((resolve, reject) => {
        const method = options.method || 'GET';
        const body = options.body ? JSON.parse(options.body) : null;
        let doliUrl = '', endpoint = '', apiKey = '', entity = '';

        try {
            const urlObj = new URL(url);
            doliUrl = urlObj.origin + (urlObj.pathname.includes('/api/index.php') ? urlObj.pathname.split('/api/index.php')[0] : '');
            endpoint = url.replace(doliUrl + '/api/index.php', '');
            if (!endpoint.startsWith('/')) {
                endpoint = url.replace(doliUrl, '');
            }
        } catch (e) {}

        apiKey = options.headers?.DOLAPIKEY || options.headers?.['DOLAPIKEY'];
        entity = options.headers?.DOLAPIENTITY || options.headers?.['DOLAPIENTITY'] || '';

        chrome.runtime.sendMessage({
            type: MESSAGE_TYPES.API_CALL,
            payload: { method, doliUrl, apiKey, entity, endpoint, body }
        }, response => {
            if (chrome.runtime.lastError) {
                return reject(new Error(chrome.runtime.lastError.message));
            }
            if (response && response.error) {
                let status = 500;
                const matchStatus = String(response.error).match(/Erreur HTTP (\d+)/);
                if (matchStatus) status = parseInt(matchStatus[1], 10);
                return resolve({
                    ok: false,
                    status,
                    statusText: response.error,
                    json: async () => { throw new Error(response.error); }
                });
            }
            resolve({
                ok: true,
                status: 200,
                json: async () => response.data,
                blob: async () => {
                    if (response.data) {
                        const bstr = atob(response.data);
                        const n = bstr.length;
                        const u8arr = new Uint8Array(n);
                        for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
                        return new Blob([u8arr], { type: response.mime || 'application/octet-stream' });
                    }
                    return null;
                }
            });
        });
    });
}

// Fonction pour tester la connexion à l'API Dolibarr / DigiRisk
async function testDolibarrConnection(apiUrl, login, passwordOrToken, entity) {
    try {
        let authSuccess = false;
        let apiTokenFinal = passwordOrToken;
        let lastErrorMsg = '';

        const baseHeaders = {
            'Accept': 'application/json'
        };
        if (entity && entity.trim() !== '') {
            baseHeaders['DOLAPIENTITY'] = entity.trim();
        }

        // 1. Test d'authentification (Récupération du token ou validation de la clé API)
        const loginResponse = await fetchDoli(`${apiUrl}/login?login=${encodeURIComponent(login)}&password=${encodeURIComponent(passwordOrToken)}`, {
            method: 'POST',
            headers: baseHeaders
        });

        if (loginResponse.ok) {
            const data = await loginResponse.json();
            apiTokenFinal = data && data.success ? data.success.token : passwordOrToken;
            authSuccess = true;
        } else {
            lastErrorMsg = loginResponse.statusText || '';
            const testKeyResponse = await fetchDoli(`${apiUrl}/status`, {
                headers: { ...baseHeaders, 'DOLAPIKEY': passwordOrToken }
            });
            if (testKeyResponse.ok) {
                authSuccess = true;
            } else if (!lastErrorMsg) {
                lastErrorMsg = testKeyResponse.statusText || '';
            }
        }

        if (!authSuccess) {
            return { success: false, error: new DoliError('DigiRisk-1002', lastErrorMsg) };
        }

        // 2. Test spécifique des permissions Dolibarr et DigiRisk
        let canReadDigirisk = false;
        let canReadUsers = false;
        let canReadTickets = false;
        let canReadThirdparties = false;
        let canReadProjects = false;
        let canReadGed = false;
        let hasGedPR37499 = false;

        try {
            // Test Module DigiRisk (GP / UT)
            const digiriskResponse = await fetchDoli(`${apiUrl}/digiriskdolibarr/digiriskelements?limit=1`, {
                method: 'GET',
                headers: { ...baseHeaders, 'DOLAPIKEY': apiTokenFinal }
            });
            if (digiriskResponse.ok || digiriskResponse.status === 404) {
                // 200 OK ou 404 (aucun GP/UT créé mais route accessible et autorisée)
                const stText = String(digiriskResponse.statusText || '');
                if (!stText.includes('API not found') && !stText.includes('Restler')) {
                    canReadDigirisk = true;
                }
            }

            // Test Utilisateurs
            const usersResponse = await fetchDoli(`${apiUrl}/users?limit=1`, {
                method: 'GET',
                headers: { ...baseHeaders, 'DOLAPIKEY': apiTokenFinal }
            });
            if (usersResponse.status !== 403 && usersResponse.status !== 401) {
                canReadUsers = true;
            }

            // Test Tickets
            const ticketsResponse = await fetchDoli(`${apiUrl}/tickets?limit=1`, {
                method: 'GET',
                headers: { ...baseHeaders, 'DOLAPIKEY': apiTokenFinal }
            });
            if (ticketsResponse.status !== 403 && ticketsResponse.status !== 401) {
                canReadTickets = true;
            }

            // Test Tiers
            const thirdpartiesResponse = await fetchDoli(`${apiUrl}/thirdparties?limit=1`, {
                method: 'GET',
                headers: { ...baseHeaders, 'DOLAPIKEY': apiTokenFinal }
            });
            if (thirdpartiesResponse.status !== 403 && thirdpartiesResponse.status !== 401) {
                canReadThirdparties = true;
            }

            // Test Projets
            const projectsResponse = await fetchDoli(`${apiUrl}/projects?limit=1`, {
                method: 'GET',
                headers: { ...baseHeaders, 'DOLAPIKEY': apiTokenFinal }
            });
            if (projectsResponse.status !== 403 && projectsResponse.status !== 401) {
                canReadProjects = true;
            }

            // Test GED
            const gedResponse = await fetchDoli(`${apiUrl}/documents?modulepart=ticket&id=1`, {
                method: 'GET',
                headers: { ...baseHeaders, 'DOLAPIKEY': apiTokenFinal }
            });
            if (gedResponse.status !== 403 && gedResponse.status !== 401) {
                canReadGed = true;
            }

            // Test PR 37499 : Support upload ticket
            await fetchDoli(`${apiUrl}/documents/upload`, {
                method: 'POST',
                headers: { ...baseHeaders, 'DOLAPIKEY': apiTokenFinal, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: "pr_test.txt",
                    modulepart: "ticket",
                    ref: "99999999",
                    filecontent: "dGVzdA==",
                    fileencoding: "base64"
                })
            });
            hasGedPR37499 = true;
        } catch (err) {
            console.warn("Erreur lors de la vérification des droits API:", err);
        }

        // 3. Récupérer le nom de l'entreprise/entité
        let entityName = "Inconnue";
        try {
            const companyResponse = await fetchDoli(`${apiUrl}/setup/company`, {
                method: 'GET',
                headers: {
                    ...baseHeaders,
                    'DOLAPIKEY': apiTokenFinal
                }
            });
            if (companyResponse.ok) {
                const companyData = await companyResponse.json();
                if (companyData && companyData.name) {
                    entityName = companyData.name;
                }
            }
        } catch (err) {
            console.warn("Erreur chargement nom entreprise:", err);
        }

        return {
            success: true,
            apiToken: apiTokenFinal,
            permissions: {
                digirisk: canReadDigirisk,
                users: canReadUsers,
                tickets: canReadTickets,
                thirdparties: canReadThirdparties,
                projects: canReadProjects,
                ged: canReadGed,
                ged_pr: hasGedPR37499
            },
            entityName: entityName
        };

    } catch (e) {
        return { success: false, error: new DoliError('DigiRisk-1001', e) };
    }
}

let profiles = [];
let activeProfileId = null;

function getActiveProfile() {
    return profiles.find(p => p.id === activeProfileId) || profiles[0];
}

function generateId() {
    return 'prof_' + Math.random().toString(36).substr(2, 9);
}

// Met à jour les champs du formulaire avec le profil sélectionné
function loadProfileIntoForm(p) {
    if (!p) return;
    document.getElementById('doli-profile-name').value = p.name || '';
    document.getElementById('doli-url').value = p.doliUrl || '';
    document.getElementById('doli-login').value = p.doliLogin || '';
    document.getElementById('doli-password').value = p.doliApiToken || '';
    document.getElementById('doli-entity').value = p.doliEntity || '';
    document.getElementById('doli-auto-assign').checked = p.doliAutoAssign !== false;

    document.getElementById('doli-ticket-type').value = p.doliTicketType || 'ISSUE';
    document.getElementById('doli-ticket-severity').value = p.doliTicketSeverity || 'NORMAL';
    document.getElementById('doli-ticket-category').value = p.doliTicketCategory || '';

    if (p.doliStatus) {
        renderPermissions(p.doliStatus, p.doliUrl);
    } else {
        renderPermissions({
            connection: 'pending',
            digirisk: 'pending',
            tickets: 'pending',
            users: 'pending',
            thirdparties: 'pending',
            projects: 'pending',
            ged: 'pending',
            ged_pr: 'pending'
        }, p.doliUrl);
    }
}

// Met à jour la liste déroulante des profils
function renderProfileSelect() {
    const select = document.getElementById('doli-profile-select');
    select.innerHTML = '';
    profiles.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name || 'Nouveau Profil';
        if (p.id === activeProfileId) opt.selected = true;
        select.appendChild(opt);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(null, (items) => {
        if (items.doliUrl && !items.doliProfiles) {
            const migratedProfile = {
                id: generateId(),
                name: 'Profil par défaut',
                doliUrl: items.doliUrl,
                doliLogin: items.doliLogin,
                doliApiToken: items.doliApiToken,
                doliEntity: items.doliEntity,
                doliAutoAssign: items.doliAutoAssign,
                doliTicketType: items.doliTicketType,
                doliTicketSeverity: items.doliTicketSeverity,
                doliTicketCategory: items.doliTicketCategory,
                doliStatus: items.doliStatus
            };
            profiles = [migratedProfile];
            activeProfileId = migratedProfile.id;

            chrome.storage.sync.remove(['doliUrl', 'doliLogin', 'doliApiToken', 'doliEntity', 'doliAutoAssign', 'doliTicketType', 'doliTicketSeverity', 'doliTicketCategory', 'doliStatus']);
            chrome.storage.sync.set({ doliProfiles: profiles, doliActiveProfileId: activeProfileId });
        } else {
            profiles = items.doliProfiles || [];
            activeProfileId = items.doliActiveProfileId;
        }

        if (profiles.length === 0) {
            const initialProfile = { id: generateId(), name: 'Profil 1' };
            profiles.push(initialProfile);
            activeProfileId = initialProfile.id;
            chrome.storage.sync.set({ doliProfiles: profiles, doliActiveProfileId: activeProfileId });
        }

        if (!activeProfileId || !profiles.find(p => p.id === activeProfileId)) {
            activeProfileId = profiles[0].id;
        }

        renderProfileSelect();
        loadProfileIntoForm(getActiveProfile());

        // --- PARAMÈTRES GLOBAUX ---
        if (items.doliImageFormat) {
            const fmtRadio = document.querySelector(`input[name="doli-format"][value="${items.doliImageFormat}"]`);
            if (fmtRadio) fmtRadio.checked = true;
        }
        if (items.doliBlurIntensity) {
            document.getElementById('doli-blur').value = items.doliBlurIntensity;
        }
        if (items.doliRecentCount) {
            document.getElementById('doli-recent-count').value = items.doliRecentCount;
        }
        if (items.doliListCount) {
            document.getElementById('doli-list-count').value = items.doliListCount;
        }
        if (items.doliApiLimit) {
            document.getElementById('doli-api-limit').value = items.doliApiLimit;
        }
        if (items.doliTiersLimit && document.getElementById('doli-tiers-limit')) {
            document.getElementById('doli-tiers-limit').value = items.doliTiersLimit;
        }
    });

    // Changement de profil via le select
    document.getElementById('doli-profile-select').addEventListener('change', (e) => {
        activeProfileId = e.target.value;
        chrome.storage.sync.set({ doliActiveProfileId: activeProfileId });
        loadProfileIntoForm(getActiveProfile());
    });

    // Renommer le profil en direct
    document.getElementById('doli-profile-name').addEventListener('input', (e) => {
        const p = getActiveProfile();
        if (p) {
            p.name = e.target.value;
            const opt = document.querySelector(`#doli-profile-select option[value="${p.id}"]`);
            if (opt) opt.textContent = p.name || 'Sans nom';
            chrome.storage.sync.set({ doliProfiles: profiles });
        }
    });

    // Nouveau Profil
    document.getElementById('btn-new-profile').addEventListener('click', () => {
        const newProfile = { id: generateId(), name: 'Nouveau Profil' };
        profiles.push(newProfile);
        activeProfileId = newProfile.id;
        chrome.storage.sync.set({ doliProfiles: profiles, doliActiveProfileId: activeProfileId });

        renderProfileSelect();
        loadProfileIntoForm(newProfile);
    });

    // Supprimer Profil
    document.getElementById('btn-delete-profile').addEventListener('click', () => {
        if (confirm(chrome.i18n.getMessage("opt_js_confirm"))) {
            profiles = profiles.filter(p => p.id !== activeProfileId);

            if (profiles.length === 0) {
                const emptyProfile = { id: generateId(), name: 'Profil 1' };
                profiles.push(emptyProfile);
            }

            activeProfileId = profiles[0].id;
            chrome.storage.sync.set({ doliProfiles: profiles, doliActiveProfileId: activeProfileId });

            renderProfileSelect();
            loadProfileIntoForm(getActiveProfile());
        }
    });

    // Bouton de Test de Connexion
    document.getElementById('btn-test-profile').addEventListener('click', async () => {
        const urlInput = document.getElementById('doli-url');
        const url = urlInput.value;
        const login = document.getElementById('doli-login').value;
        const password = document.getElementById('doli-password').value;
        const entityVal = document.getElementById('doli-entity').value.trim();
        const testStatusDiv = document.getElementById('test-status-container');
        const btnTest = document.getElementById('btn-test-profile');
        const statusDashboard = document.getElementById('permissions-dashboard');

        if (!url || !login || !password) {
            testStatusDiv.style.color = "#e74c3c";
            testStatusDiv.textContent = chrome.i18n.getMessage('opt_js_135');
            return;
        }

        const candidates = getDoliApiCandidates(url);
        let normalizedUrl = candidates[0];

        btnTest.disabled = true;
        btnTest.textContent = chrome.i18n.getMessage('opt_js_136');
        testStatusDiv.textContent = "";

        statusDashboard.classList.remove('hidden');
        renderPermissions({
            connection: 'warning',
            digirisk: 'warning',
            tickets: 'warning',
            users: 'warning',
            thirdparties: 'warning',
            projects: 'warning',
            ged: 'warning',
            ged_pr: 'warning'
        }, normalizedUrl);

        let testResult = null;
        for (const candidateUrl of candidates) {
            const res = await testDolibarrConnection(candidateUrl, login, password, entityVal);
            if (res.success) {
                normalizedUrl = candidateUrl;
                testResult = res;
                break;
            }
            if (!testResult) {
                testResult = res;
            }
        }

        urlInput.value = normalizedUrl;

        if (testResult && testResult.success) {
            testStatusDiv.style.color = "#27ae60";
            let msg = '✅ Connexion réussie !';
            if (testResult.entityName && testResult.entityName !== "Inconnue") {
                msg += ` (🏢 ${testResult.entityName})`;
            }
            testStatusDiv.textContent = msg;

            const hasDigirisk = testResult.permissions && testResult.permissions.digirisk;
            const hasUsers = testResult.permissions && testResult.permissions.users;
            const hasTickets = testResult.permissions && testResult.permissions.tickets;
            const hasThirdparties = testResult.permissions && testResult.permissions.thirdparties;
            const hasProjects = testResult.permissions && testResult.permissions.projects;
            const hasGed = testResult.permissions && testResult.permissions.ged;
            const hasGedPR = testResult.permissions && testResult.permissions.ged_pr;

            const statusObj = {
                connection: 'ok',
                digirisk: hasDigirisk ? 'ok' : 'ko',
                tickets: hasTickets ? 'ok' : 'ko',
                users: hasUsers ? 'ok' : 'ko',
                thirdparties: hasThirdparties ? 'ok' : 'ko',
                projects: hasProjects ? 'ok' : 'ko',
                ged: hasGed ? 'ok' : 'ko',
                ged_pr: hasGedPR ? 'ok' : 'ko',
                date: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
            };

            renderPermissions(statusObj, normalizedUrl);

            const p = getActiveProfile();
            if (p) {
                p.doliUrl = normalizedUrl;
                if (testResult.apiToken) p.doliApiToken = testResult.apiToken;
                if (testResult.permissions) p.permissions = testResult.permissions;
                p.doliStatus = statusObj;
                chrome.storage.sync.set({ doliProfiles: profiles });
            }

        } else {
            testStatusDiv.style.color = "#e74c3c";
            testStatusDiv.textContent = chrome.i18n.getMessage('opt_js_137');
            renderPermissions({
                connection: 'ko',
                digirisk: 'pending',
                tickets: 'pending',
                users: 'pending',
                thirdparties: 'pending',
                projects: 'pending',
                ged: 'pending',
                ged_pr: 'pending'
            }, normalizedUrl);
        }

        btnTest.disabled = false;
        btnTest.textContent = chrome.i18n.getMessage('opt_js_138');
    });
});

// Gestion du slider de floutage
document.getElementById('doli-blur').addEventListener('input', (e) => {
    const val = e.target.value;
    document.getElementById('doli-blur-value').textContent = val + 'px';

    const overlay = document.getElementById('doli-blur-overlay');
    if (overlay) {
        overlay.style.backdropFilter = `blur(${val}px)`;
        overlay.style.webkitBackdropFilter = `blur(${val}px)`;
    }
});

// Sauvegarde les options
document.getElementById('save-btn').addEventListener('click', async () => {
    const urlInput = document.getElementById('doli-url');
    const url = urlInput.value;
    const login = document.getElementById('doli-login').value;
    const password = document.getElementById('doli-password').value;
    const statusDiv = document.getElementById('status');
    const btn = document.getElementById('save-btn');

    if (!url || !login || !password) {
        statusDiv.style.color = "#e74c3c";
        statusDiv.textContent = chrome.i18n.getMessage('opt_js_143');
        return;
    }

    const candidates = getDoliApiCandidates(url);
    let normalizedUrl = candidates[0];
    const entityVal = document.getElementById('doli-entity').value.trim();

    btn.disabled = true;
    btn.textContent = chrome.i18n.getMessage('opt_js_144');
    statusDiv.textContent = "";

    if (candidates.length > 1) {
        for (const candidateUrl of candidates) {
            const res = await testDolibarrConnection(candidateUrl, login, password, entityVal);
            if (res.success) {
                normalizedUrl = candidateUrl;
                break;
            }
        }
    }
    urlInput.value = normalizedUrl;

    const formatVal = document.querySelector('input[name="doli-format"]:checked').value;
    const autoAssignVal = document.getElementById('doli-auto-assign').checked;
    const blurVal = document.getElementById('doli-blur').value;
    const recentCountVal = parseInt(document.getElementById('doli-recent-count').value, 10) || 10;
    const listCountVal = parseInt(document.getElementById('doli-list-count').value, 10) || 15;
    const apiLimitVal = parseInt(document.getElementById('doli-api-limit').value, 10) || 5000;
    const tiersLimitVal = document.getElementById('doli-tiers-limit') ? (parseInt(document.getElementById('doli-tiers-limit').value, 10) || 50000) : 50000;

    const ticketTypeVal = document.getElementById('doli-ticket-type').value.trim();
    const ticketSeverityVal = document.getElementById('doli-ticket-severity').value.trim();
    const ticketCategoryVal = document.getElementById('doli-ticket-category').value.trim();

    const p = getActiveProfile();
    if (!p) return;

    p.doliUrl = normalizedUrl;
    p.doliLogin = login;
    if (password && password.trim() !== '') {
        p.doliApiToken = password;
    }
    p.doliAutoAssign = autoAssignVal;
    p.doliEntity = entityVal;
    p.doliTicketType = ticketTypeVal;
    p.doliTicketSeverity = ticketSeverityVal;
    p.doliTicketCategory = ticketCategoryVal;

    try {
        const urlObj = new URL(profiles[0].doliUrl || 'https://example.com');
        const originPattern = urlObj.origin + "/*";

        chrome.permissions.request({
            origins: [originPattern]
        }, (granted) => {
            if (!granted) {
                statusDiv.style.color = "#f39c12";
                statusDiv.innerHTML = '⚠️ ' + chrome.i18n.getMessage("error_permission_denied");
            }
            saveToStorage();
        });
    } catch (e) {
        console.warn("Permission request failed or not supported in this context.", e);
        saveToStorage();
    }

    function saveToStorage() {
        chrome.storage.sync.set({
            doliProfiles: profiles,
            doliActiveProfileId: activeProfileId,
            'doliImageFormat': formatVal,
            'doliBlurIntensity': blurVal,
            'doliDefaultView': 'ticket',
            'doliRecentCount': recentCountVal,
            'doliListCount': listCountVal,
            'doliApiLimit': apiLimitVal,
            'doliTiersLimit': tiersLimitVal
        }, () => {
            statusDiv.style.color = "#27ae60";
            statusDiv.textContent = chrome.i18n.getMessage('opt_js_145');

            setTimeout(() => {
                statusDiv.textContent = '';
            }, 3000);

            btn.disabled = false;
            btn.textContent = chrome.i18n.getMessage('opt_js_146');
        });
    }
});

// Test Thirdparties Button - Diagnostic par pagination
document.getElementById('btn-test-tiers').addEventListener('click', async () => {
    const p = getActiveProfile();
    const resultDiv = document.getElementById('test-tiers-result');
    if (!p || !p.doliUrl || !p.doliApiToken) {
        resultDiv.style.color = '#e74c3c';
        resultDiv.textContent = 'Erreur: Profil incomplet';
        return;
    }
    const btn = document.getElementById('btn-test-tiers');
    btn.disabled = true;
    resultDiv.style.color = '#7f8c8d';
    resultDiv.textContent = 'Chargement...';

    const headers = {
        'DOLAPIKEY': p.doliApiToken,
        'Accept': 'application/json'
    };
    if (p.doliEntity) headers['DOLAPIENTITY'] = p.doliEntity;

    try {
        const ts = Date.now();
        let html = `<span style="color:#7f8c8d; font-size: 10px;">URL: ${p.doliUrl}<br>Token: ${p.doliApiToken.substring(0, 5)}...</span><br>`;
        resultDiv.innerHTML = html;

        const urlP0 = `${p.doliUrl}/thirdparties?limit=100&page=0&sortfield=t.rowid&sortorder=ASC&_ts=${ts}`;
        const resP0 = await fetchDoli(urlP0, { headers });
        if (resP0.ok) {
            const d = await resP0.json();
            const first = d.length > 0 ? (d[0].name || d[0].id) : '-';
            const last = d.length > 0 ? (d[d.length - 1].name || d[d.length - 1].id) : '-';
            const lastId = d.length > 0 ? d[d.length - 1].id : '?';
            html += `<span style="color:#27ae60">Page 0 (limit=100): <b>${d.length}</b> tiers</span> <span style="font-size:10px;color:#555">(IDs: ${first} → ${last}, dernier id=${lastId})</span><br>`;
        } else {
            html += `<span style="color:#e74c3c">Page 0: Erreur ${resP0.status}</span><br>`;
        }
        resultDiv.innerHTML = html;

        let totalCount = 0;
        let pageNum = 0;
        const maxPages = 20;
        while (pageNum < maxPages) {
            const urlPx = `${p.doliUrl}/thirdparties?limit=500&page=${pageNum}&sortfield=t.rowid&sortorder=ASC&_ts=${ts}`;
            const resPx = await fetchDoli(urlPx, { headers });
            if (resPx.ok) {
                const d = await resPx.json();
                totalCount += d.length;
                if (d.length < 500) break;
            } else {
                break;
            }
            pageNum++;
        }
        html += `<span style="color:#2980b9"><b>TOTAL par pagination (pages de 500): ${totalCount} tiers</b> en ${pageNum + 1} pages</span><br>`;
        resultDiv.innerHTML = html;
    } catch (e) {
        resultDiv.style.color = '#e74c3c';
        resultDiv.textContent = `Erreur: ${e.message}`;
    }
    btn.disabled = false;
});

// Affiche le tableau des droits
function renderPermissions(statusObj, baseUrl) {
    const dashboard = document.getElementById('permissions-dashboard');
    if (!dashboard) return;

    const st = statusObj || {};
    const baseDoli = baseUrl ? baseUrl.replace(/\/api\/index\.php$/, '') : '';

    const categories = [
        {
            name: "DigiRisk (Santé & Sécurité au Travail)",
            rights: [
                { id: 'DIGIRISK', title: "Lire les Groupements (GP) et Unités de Travail (UT) via API", key: "digirisk" }
            ]
        },
        {
            name: "Tickets",
            rights: [
                { id: '331', title: "Lire, créer et consulter les tickets", key: "tickets" }
            ]
        },
        {
            name: "Utilisateurs & Groupes",
            rights: [
                { id: '251', title: "Lire les utilisateurs, les groupes et leurs permissions", key: "users" }
            ]
        },
        {
            name: "Tiers",
            rights: [
                { id: '121', title: "Consulter les tiers (sociétés) liés à l'utilisateur", key: "thirdparties" },
                { id: '262', title: "Étendre l'accès à tous les tiers / Lire les tiers", key: "thirdparties" }
            ]
        },
        {
            name: "Projets",
            rights: [
                { id: '41', title: "Lire les projets et les tâches (partagés / contact)", key: "projects" }
            ]
        },
        {
            name: "GED",
            rights: [
                { id: '542', title: "Consulter les documents", key: "ged" },
                { id: 'PR #37499', title: "API Documents : Support pour les Tickets", key: "ged_pr" }
            ]
        },
        {
            name: "API / Web services",
            rights: [
                { id: 'API', title: "Connexion API REST", key: "connection" }
            ]
        }
    ];

    let html = '';

    categories.forEach(cat => {
        html += `<div class="perm-category"><h4 class="perm-category-title">${cat.name}</h4>`;
        cat.rights.forEach(right => {
            const status = st[right.key];
            let statusText = 'Non testé';
            let statusClass = 'pending';

            if (status === 'ok') { statusText = 'OK'; statusClass = 'ok'; }
            else if (status === 'ko') { statusText = 'KO'; statusClass = 'ko'; }
            else if (status === 'warning') { statusText = 'Test...'; statusClass = 'warning'; }

            let rightLink = "#";
            if (baseDoli && (right.id === 'PR #37499' || right.id === 'API')) {
                rightLink = `${baseDoli}/admin/modules.php?search_keyword=api`;
            } else if (baseDoli && right.id === 'DIGIRISK') {
                rightLink = `${baseDoli}/admin/modules.php?search_keyword=digirisk`;
            } else if (baseDoli) {
                rightLink = `${baseDoli}/user/group/perms.php?id=58&rights=${right.id}`;
            }

            let displayTitle = right.title;
            let displayId = right.id;
            if (right.id === 'PR #37499') {
                displayTitle = `<a href="https://github.com/Dolibarr/dolibarr/pull/37499" target="_blank" style="text-decoration: underline; color: var(--primary-color);" title="Voir la Pull Request sur GitHub">PR #37499</a> Support pour les Tickets`;
                displayId = 'GED';
            }

            html += `
            <div class="perm-row">
                <span class="perm-id">${displayId}</span>
                <span class="perm-title">${displayTitle}</span>
                <span class="perm-link"><a href="${rightLink}" target="_blank" title="Voir la configuration API">🔗 Voir</a></span>
                <span class="perm-status ${statusClass}">${statusText}</span>
            </div>`;
        });
        html += `</div>`;
    });

    if (st.date) {
        html += `<div style="padding: 8px 12px; font-size: 11px; color: #7f8c8d; text-align: right; background: #fff;">Dernier contrôle : ${st.date}</div>`;
    }

    dashboard.innerHTML = html;
    dashboard.classList.remove('hidden');
}

// Cache l'état OK/KO si l'utilisateur modifie l'URL
document.getElementById('doli-url').addEventListener('input', () => {
    document.getElementById('api-status-indicator').className = 'status-indicator';
});
