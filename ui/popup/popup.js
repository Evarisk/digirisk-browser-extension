import { fetchDoli } from './src/api/dolibarr.js';
import { store } from './src/store/store.js';
import { mapTicket } from './src/models/ticket.mapper.js';
import { renderTicketItemHtml } from './src/components/ticket.js';
import { initInlineEdit } from './src/features/inline-edit/index.js';
import { initAttachments } from './src/features/attachments/index.js';
import { uploadFileToDoli } from './src/features/attachments/api.js';
import { attachmentsState, clearTicketFiles } from './src/features/attachments/state.js';

class CustomSelect {
    constructor(selectElement) {
        this.selectElement = selectElement;
        this.container = selectElement.parentElement;
        this.wrapper = null;
        this.trigger = null;
        this.optionsContainer = null;
        this.searchInput = null;
        this.optionsList = null;

        this.init();
    }

    init() {
        if (!this.container.classList.contains('searchable-select-container')) return;

        const existingWrapper = this.container.querySelector('.custom-select-wrapper');
        if (existingWrapper) {
            this.container.removeChild(existingWrapper);
        }

        this.selectElement.classList.add('hidden');

        this.wrapper = document.createElement('div');
        this.wrapper.className = 'custom-select-wrapper';

        this.trigger = document.createElement('div');
        this.trigger.className = 'custom-select-trigger';

        const selectedOption = this.selectElement.options[this.selectElement.selectedIndex] || this.selectElement.options[0];
        const triggerText = selectedOption ? selectedOption.textContent : '-- Sélectionnez --';

        this.trigger.innerHTML = `<span>${triggerText}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

        this.optionsContainer = document.createElement('div');
        this.optionsContainer.className = 'custom-options-container';

        const searchBox = document.createElement('div');
        searchBox.className = 'custom-search-box';
        this.searchInput = document.createElement('input');
        this.searchInput.type = 'text';
        this.searchInput.id = 'search_' + this.selectElement.id;
        this.searchInput.name = 'search_' + this.selectElement.id;
        this.searchInput.placeholder = chrome.i18n.getMessage('popup_jsph_134');
        searchBox.appendChild(this.searchInput);

        this.optionsList = document.createElement('div');
        this.optionsList.className = 'custom-options';

        this.optionsContainer.appendChild(searchBox);
        this.optionsContainer.appendChild(this.optionsList);

        this.wrapper.appendChild(this.trigger);
        this.wrapper.appendChild(this.optionsContainer);
        this.container.appendChild(this.wrapper);

        this.renderOptions();
        this.bindEvents();
    }

    renderOptions(filter = '') {
        this.optionsList.innerHTML = '';
        const lowercaseFilter = filter.toLowerCase();
        let matchCount = 0;

        Array.from(this.selectElement.options).forEach((option, index) => {
            const text = option.textContent;
            const searchContext = (text + ' ' + (option.dataset.search || '')).toLowerCase();
            if (searchContext.includes(lowercaseFilter)) {
                const customOption = document.createElement('div');
                customOption.className = 'custom-option';
                if (option.disabled) customOption.classList.add('disabled');
                if (option.selected) customOption.classList.add('selected');
                customOption.textContent = text;
                customOption.dataset.value = option.value;
                customOption.dataset.index = index;

                customOption.addEventListener('click', (e) => {
                    if (option.disabled) return;
                    e.stopPropagation();
                    this.selectOption(option.value, customOption);
                });

                this.optionsList.appendChild(customOption);
                matchCount++;
            }
        });

        if (matchCount === 0) {
            const noMatch = document.createElement('div');
            noMatch.className = 'custom-option disabled';
            noMatch.textContent = chrome.i18n.getMessage('popup_js_110');
            this.optionsList.appendChild(noMatch);
        }
    }

    selectOption(value, optionElement) {
        this.selectElement.value = value;
        this.selectElement.dispatchEvent(new Event('change'));

        this.trigger.querySelector('span').textContent = optionElement.textContent;

        const allOptions = this.optionsList.querySelectorAll('.custom-option');
        allOptions.forEach(opt => opt.classList.remove('selected'));
        optionElement.classList.add('selected');

        this.close();
    }

    bindEvents() {
        this.trigger.addEventListener('click', () => {
            this.wrapper.classList.toggle('open');
            this.trigger.classList.toggle('open');
            if (this.wrapper.classList.contains('open')) {
                this.searchInput.value = '';
                this.renderOptions();
                setTimeout(() => this.searchInput.focus(), 100);
            }
        });

        this.searchInput.addEventListener('input', (e) => {
            this.renderOptions(e.target.value);
        });

        this._outsideClickHandler = (e) => {
            if (this.wrapper && !this.wrapper.contains(e.target)) {
                this.close();
            }
        };
        document.addEventListener('click', this._outsideClickHandler);
    }

    close() {
        this.wrapper.classList.remove('open');
        this.trigger.classList.remove('open');
    }

    update() {
        if (!this.wrapper || !this.trigger || !this.optionsList) {
            this.init();
            return;
        }
        const selectedOption = this.selectElement.options[this.selectElement.selectedIndex] || this.selectElement.options[0];
        const triggerSpan = this.trigger.querySelector('span');
        if (triggerSpan && selectedOption) {
            triggerSpan.textContent = selectedOption.textContent;
        }
        const currentFilter = this.searchInput ? this.searchInput.value : '';
        this.renderOptions(currentFilter);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        const setupWarning = document.getElementById('setup-warning');
        const ticketForm = document.getElementById('ticket-form');
        const btnOpenOptions = document.getElementById('btn-open-options');
        const btnNavOptions = document.getElementById('btn-nav-options');
        const statusMessage = document.getElementById('status-message');
        const btnSubmit = document.getElementById('btn-submit');
        const assigneeSelect = document.getElementById('ticket-assignee');

        const tabTicket = document.getElementById('tab-ticket');
        const tabTicketList = document.getElementById('tab-ticket-list');
        const viewTicket = document.getElementById('view-ticket');
        const viewTicketList = document.getElementById('view-ticket-list');
        const viewTitle = document.getElementById('view-title');
        const recentTicketsContainer = document.getElementById('all-ticket-container');
        const recentTicketsList = document.getElementById('recent-tickets-list');

        function switchTab(view) {
            viewTitle.classList.add('hidden');
            const ticketActions = document.getElementById('ticket-top-actions');
            const mainHeader = document.getElementById('main-header-container');

            tabTicket.classList.remove('active');
            if (tabTicketList) tabTicketList.classList.remove('active');

            viewTicket.classList.add('hidden');
            if (viewTicketList) viewTicketList.classList.add('hidden');

            if (view === 'ticketList') {
                if (tabTicketList) tabTicketList.classList.add('active');
                if (viewTicketList) viewTicketList.classList.remove('hidden');
                if (ticketActions) ticketActions.style.display = 'none';
                if (mainHeader) mainHeader.style.display = 'none';
            } else {
                tabTicket.classList.add('active');
                viewTicket.classList.remove('hidden');
                if (ticketActions) ticketActions.style.display = 'flex';
                if (mainHeader) mainHeader.style.display = '';
            }
        }

        tabTicket.addEventListener('click', () => switchTab('ticket'));
        if (tabTicketList) {
            tabTicketList.addEventListener('click', () => switchTab('ticketList'));
        }

        if (btnOpenOptions) {
            btnOpenOptions.addEventListener('click', () => {
                chrome.runtime.openOptionsPage();
            });
        }
        if (btnNavOptions) {
            btnNavOptions.addEventListener('click', () => {
                chrome.runtime.openOptionsPage();
            });
        }

        /**
         * Charge les Groupements (GP) et Unités de Travail (UT) depuis l'API DigiRisk.
         * @param {string} apiUrl
         * @param {string} token
         * @param {string} entity
         * @returns {Promise<Array<Object>>}
         */
        async function loadDigiriskElements(apiUrl, token, entity) {
            const digiriskSelect = document.getElementById('ticket-digiriskelement');
            if (!digiriskSelect) return [];

            const headers = {
                'DOLAPIKEY': token,
                'Accept': 'application/json'
            };
            if (entity && String(entity).trim() !== '') {
                headers['DOLAPIENTITY'] = String(entity).trim();
            }

            const flatElements = [];

            const flattenTree = (nodes, depth = 0) => {
                if (!nodes) return;
                const list = Array.isArray(nodes) ? nodes : Object.values(nodes);
                list.forEach(node => {
                    const obj = node.object || node;
                    if (obj && obj.id && (obj.element_type === 'groupment' || obj.element_type === 'workunit' || obj.ref)) {
                        flatElements.push({
                            id: obj.id,
                            ref: obj.ref || '',
                            label: obj.label || '',
                            element_type: obj.element_type || '',
                            fk_parent: obj.fk_parent || 0,
                            depth
                        });
                    }
                    if (node.children) {
                        flattenTree(node.children, depth + 1);
                    }
                });
            };

            try {
                let res = await fetchDoli(`${apiUrl}/digiriskdolibarr/digiriskelements/tree`, {
                    method: 'GET',
                    headers
                });

                if (res.ok) {
                    const treeData = await res.json();
                    flattenTree(treeData, 0);
                } else {
                    res = await fetchDoli(`${apiUrl}/digiriskdolibarr/digiriskelements?limit=500`, {
                        method: 'GET',
                        headers
                    });
                    if (res.ok) {
                        const listData = await res.json();
                        if (Array.isArray(listData)) {
                            listData
                                .filter(el => Number(el.status) > 0 && (el.element_type === 'groupment' || el.element_type === 'workunit'))
                                .sort((a, b) => Number(a.ranks || 0) - Number(b.ranks || 0))
                                .forEach(el => {
                                    flatElements.push({
                                        id: el.id,
                                        ref: el.ref || '',
                                        label: el.label || '',
                                        element_type: el.element_type || '',
                                        fk_parent: el.fk_parent || 0,
                                        depth: el.element_type === 'workunit' ? 1 : 0
                                    });
                                });
                        }
                    }
                }
            } catch (err) {
                console.warn("Info: API DigiRisk GP/UT non disponible ou vide :", err);
            }

            const currentVal = digiriskSelect.value || '';
            digiriskSelect.innerHTML = '';
            const defaultOpt = document.createElement('option');
            defaultOpt.value = '';
            defaultOpt.textContent = 'GP / UT (Unité de travail)';
            digiriskSelect.appendChild(defaultOpt);

            flatElements.forEach(el => {
                const opt = document.createElement('option');
                opt.value = el.id;
                const indent = el.depth > 0 ? '↳ '.repeat(Math.min(el.depth, 3)) : '';
                const typeBadge = el.element_type === 'groupment' ? '[GP]' : (el.element_type === 'workunit' ? '[UT]' : '');
                opt.textContent = `${indent}${el.ref ? el.ref + ' - ' : ''}${el.label}`.trim();
                opt.dataset.search = `${el.ref} ${el.label} ${typeBadge}`.toLowerCase();
                if (currentVal && String(el.id) === String(currentVal)) {
                    opt.selected = true;
                }
                digiriskSelect.appendChild(opt);
            });

            if (currentVal) {
                digiriskSelect.value = currentVal;
            }

            if (!window.ticketDigiriskSelect) {
                window.ticketDigiriskSelect = new CustomSelect(digiriskSelect);
            } else {
                window.ticketDigiriskSelect.update();
            }

            store.setDigiriskElements(flatElements);
            return flatElements;
        }

        // Fonction pour charger les utilisateurs depuis Dolibarr
        async function loadUsers(apiUrl, token, userLogin, autoAssign, entity) {
            try {
                const headers = {
                    'DOLAPIKEY': token,
                    'Accept': 'application/json'
                };
                if (entity && String(entity).trim() !== '') {
                    headers['DOLAPIENTITY'] = String(entity).trim();
                }

                const response = await fetchDoli(`${apiUrl}/users?limit=500&statut=1`, {
                    method: 'GET',
                    headers
                });

                if (response.ok) {
                    const users = await response.json();
                    assigneeSelect.innerHTML = '<option value="">-- Non assigné --</option>';

                    if (Array.isArray(users)) {
                        const activeUsers = users.filter(u => {
                            const isActive = (String(u.statut) === "1" || String(u.status) === "1");
                            const isEmployee = (u.employee == 1 || u.employee === true || String(u.employee) === "1");
                            return isActive && isEmployee;
                        });

                        activeUsers.sort((a, b) => {
                            const nameA = ((a.firstname || '') + ' ' + (a.lastname || '')).trim().toLowerCase();
                            const nameB = ((b.firstname || '') + ' ' + (b.lastname || '')).trim().toLowerCase();
                            return nameA.localeCompare(nameB);
                        });

                        activeUsers.forEach(user => {
                            const option = document.createElement('option');
                            option.value = user.id;
                            const displayName = [user.firstname, user.lastname].filter(Boolean).join(' ') || user.login;
                            option.textContent = displayName;

                            if (autoAssign && userLogin && user.login && user.login.toLowerCase() === userLogin.toLowerCase()) {
                                option.selected = true;
                            }

                            assigneeSelect.appendChild(option);
                        });

                        if (!window.ticketAssigneeSelect) window.ticketAssigneeSelect = new CustomSelect(assigneeSelect);
                        else window.ticketAssigneeSelect.update();

                        window.usersList = activeUsers;
                        return activeUsers;
                    }
                    if (!window.ticketAssigneeSelect) window.ticketAssigneeSelect = new CustomSelect(assigneeSelect);
                    else window.ticketAssigneeSelect.update();
                    return [];
                } else {
                    assigneeSelect.innerHTML = '<option value="">Erreur chargement utilisateurs</option>';
                    if (window.ticketAssigneeSelect) window.ticketAssigneeSelect.update();
                    return [];
                }
            } catch (error) {
                console.error("Erreur fetch users:", error);
                assigneeSelect.innerHTML = '<option value="">Impossible de charger les utilisateurs</option>';
                if (window.ticketAssigneeSelect) window.ticketAssigneeSelect.update();
                return [];
            }
        }

        function renderThirdpartiesOptions(tiersSelect, tiersArray, selectedId = '') {
            const currentVal = selectedId || tiersSelect.value || '';
            tiersSelect.innerHTML = '';
            const defaultOpt = document.createElement('option');
            defaultOpt.value = '';
            defaultOpt.textContent = chrome.i18n.getMessage('popup_5') || 'Tiers';
            tiersSelect.appendChild(defaultOpt);

            const sorted = [...tiersArray].sort((a, b) => {
                const nameA = (a.name || a.nom || '').toLowerCase();
                const nameB = (b.name || b.nom || '').toLowerCase();
                return nameA.localeCompare(nameB);
            });

            sorted.forEach(t => {
                const option = document.createElement('option');
                option.value = t.id;
                let displayName = t.name || t.nom || `Tiers #${t.id}`;
                if (t.name_alias) displayName += ` - ${t.name_alias}`;
                option.textContent = displayName;
                option.dataset.search = `${t.name_alias || ''} ${t.code_client || ''} ${t.email || ''}`.toLowerCase();
                if (currentVal && String(t.id) === String(currentVal)) {
                    option.selected = true;
                }
                tiersSelect.appendChild(option);
            });

            if (currentVal) {
                tiersSelect.value = currentVal;
            }
            if (!window.ticketTiersSelect) {
                window.ticketTiersSelect = new CustomSelect(tiersSelect);
            } else {
                window.ticketTiersSelect.update();
            }
        }

        async function loadThirdparties(apiUrl, token, entity, limit = 50000) {
            const tiersSelect = document.getElementById('ticket-tiers');
            const tiersMap = new Map();
            const headers = {
                'DOLAPIKEY': token,
                'Accept': 'application/json',
                ...(entity ? { 'DOLAPIENTITY': String(entity).trim() } : {})
            };

            try {
                const pageSize = 500;
                const firstUrl = `${apiUrl}/thirdparties?limit=${pageSize}&page=0&sortfield=t.rowid&sortorder=DESC`;
                const response = await fetchDoli(firstUrl, { headers });

                if (response.ok) {
                    const tiers = await response.json();
                    if (Array.isArray(tiers)) {
                        tiers.forEach(t => tiersMap.set(String(t.id), t));
                        renderThirdpartiesOptions(tiersSelect, Array.from(tiersMap.values()));

                        if (tiers.length === pageSize && tiersMap.size < limit) {
                            (async () => {
                                try {
                                    let page = 1;
                                    const maxPages = Math.min(Math.ceil(limit / pageSize), 40);
                                    while (page < maxPages && tiersMap.size < limit) {
                                        const pageUrl = `${apiUrl}/thirdparties?limit=${pageSize}&page=${page}&sortfield=t.rowid&sortorder=DESC`;
                                        const pageRes = await fetchDoli(pageUrl, { headers });
                                        if (!pageRes.ok) break;
                                        const pageData = await pageRes.json();
                                        if (!Array.isArray(pageData) || pageData.length === 0) break;
                                        pageData.forEach(t => tiersMap.set(String(t.id), t));
                                        if (pageData.length < pageSize) break;
                                        page++;
                                    }
                                    const allTiers = Array.from(tiersMap.values());
                                    store.setThirdparties(allTiers);
                                    renderThirdpartiesOptions(tiersSelect, allTiers, tiersSelect.value);
                                } catch (bgErr) {
                                    console.warn("Pagination tiers interrompue:", bgErr);
                                }
                            })();
                        }
                    }
                } else {
                    tiersSelect.innerHTML = `<option value="">${chrome.i18n.getMessage('popup_5') || 'Tiers'}</option>`;
                    if (!window.ticketTiersSelect) window.ticketTiersSelect = new CustomSelect(tiersSelect);
                    else window.ticketTiersSelect.update();
                }
            } catch (error) {
                console.error("Erreur fetch tiers:", error);
                tiersSelect.innerHTML = '<option value="">Erreur chargement</option>';
                if (!window.ticketTiersSelect) window.ticketTiersSelect = new CustomSelect(tiersSelect);
                else window.ticketTiersSelect.update();
            }

            const contactSelect = document.getElementById('ticket-contact');
            if (!window.ticketContactSelect) {
                window.ticketContactSelect = new CustomSelect(contactSelect);
            }

            const projectSelect = document.getElementById('ticket-project');
            if (!window.ticketProjectSelect) {
                window.ticketProjectSelect = new CustomSelect(projectSelect);
            }
            return Array.from(tiersMap.values());
        }

        async function loadContacts(apiUrl, token, entity, socid) {
            const contactSelect = document.getElementById('ticket-contact');
            const contactContainer = document.getElementById('ticket-contact-container');

            if (!socid) {
                contactSelect.innerHTML = '<option value="">Contact</option>';
                if (window.ticketContactSelect) window.ticketContactSelect.update();
                contactContainer.classList.add('hidden');
                return;
            }

            contactContainer.classList.remove('hidden');
            contactSelect.innerHTML = '<option value="">Chargement...</option>';
            if (window.ticketContactSelect) window.ticketContactSelect.update();

            try {
                const response = await fetchDoli(`${apiUrl}/contacts?limit=500&sortfield=t.lastname&sortorder=ASC&thirdparty_ids=${socid}`, {
                    headers: {
                        'DOLAPIKEY': token,
                        'Accept': 'application/json',
                        ...(entity ? { 'DOLAPIENTITY': String(entity).trim() } : {})
                    }
                });

                contactSelect.innerHTML = '<option value="">Contact</option>';

                if (response.ok) {
                    const contacts = await response.json();
                    if (Array.isArray(contacts) && contacts.length > 0) {
                        contacts.forEach(c => {
                            const option = document.createElement('option');
                            option.value = c.id;
                            option.textContent = [c.firstname, c.lastname].filter(Boolean).join(' ') || `Contact #${c.id}`;
                            contactSelect.appendChild(option);
                        });
                    } else {
                        contactSelect.innerHTML = '<option value="">Aucun contact lié</option>';
                    }
                } else {
                    contactSelect.innerHTML = '<option value="">Aucun contact lié</option>';
                }
            } catch (error) {
                console.error("Erreur fetch contacts:", error);
                contactSelect.innerHTML = '<option value="">Erreur chargement</option>';
            }
            if (window.ticketContactSelect) window.ticketContactSelect.update();
        }

        async function loadProjects(apiUrl, token, entity, socid = '') {
            const projectSelect = document.getElementById('ticket-project');
            const projectContainer = document.getElementById('ticket-project-container');
            if (!projectSelect || !projectContainer) return;

            projectContainer.classList.remove('hidden');
            const previousValue = projectSelect.value;

            try {
                const socParam = socid ? `&thirdparty_ids=${socid}` : '';
                const response = await fetchDoli(`${apiUrl}/projects?limit=200&sortfield=t.rowid&sortorder=DESC${socParam}`, {
                    headers: {
                        'DOLAPIKEY': token,
                        'Accept': 'application/json',
                        ...(entity ? { 'DOLAPIENTITY': String(entity).trim() } : {})
                    }
                });

                projectSelect.innerHTML = '<option value="">Projet</option>';

                if (response.ok) {
                    const projects = await response.json();
                    if (Array.isArray(projects) && projects.length > 0) {
                        projects.forEach(p => {
                            const option = document.createElement('option');
                            option.value = p.id;
                            option.textContent = p.ref + (p.title ? ` - ${p.title}` : '');
                            option.dataset.search = `${p.ref || ''} ${p.title || ''}`.toLowerCase();
                            if (previousValue && String(p.id) === String(previousValue)) {
                                option.selected = true;
                            } else if (!previousValue && !socid && p.title && /ticket|digirisk|duerp/i.test(p.title)) {
                                option.selected = true;
                            }
                            projectSelect.appendChild(option);
                        });
                    }
                }
            } catch (error) {
                console.warn("Erreur fetch projets:", error);
            }
            if (window.ticketProjectSelect) window.ticketProjectSelect.update();
        }

        // Fonction pour charger les derniers tickets
        async function loadRecentTickets(apiUrl, token, limit = 15, entity, usersPromise, thirdpartiesPromise, digiriskPromise) {
            recentTicketsContainer.classList.remove('hidden');
            const formContainer = document.getElementById('recent-tickets-container-form');
            const formList = document.getElementById('recent-tickets-list-form');
            if (formContainer) formContainer.classList.remove('hidden');

            const loaderHtml = `
                <div class="loader-container">
                    <div class="loader-spinner"></div>
                    <div>${chrome.i18n.getMessage("popup_32") || "Chargement des tickets..."}</div>
                </div>
            `;
            recentTicketsList.innerHTML = loaderHtml;
            if (formList) formList.innerHTML = loaderHtml;

            let usersList = [];
            if (usersPromise) {
                try { usersList = await usersPromise || []; } catch (e) { console.error("Erreur attente users dans tickets", e); }
            }

            let thirdpartiesList = [];
            if (thirdpartiesPromise) {
                try { thirdpartiesList = await thirdpartiesPromise || []; } catch (e) { console.error("Erreur attente tiers dans tickets", e); }
            }

            if (digiriskPromise) {
                try { await digiriskPromise; } catch (e) {}
            }

            try {
                const doliBaseUrl = apiUrl.replace(/\/api\/index\.php\/?$/, '');

                store.setUsers(usersList);
                store.setThirdparties(thirdpartiesList);
                store.setActiveProfile({ url: doliBaseUrl });

                const headers = {
                    'DOLAPIKEY': token,
                    'Accept': 'application/json'
                };
                if (entity && String(entity).trim() !== '') {
                    headers['DOLAPIENTITY'] = String(entity).trim();
                }

                let response = await fetchDoli(`${apiUrl}/tickets?sortfield=t.rowid&sortorder=DESC&limit=${limit}`, {
                    method: 'GET',
                    headers
                });

                if (!response.ok && (response.status === 400 || response.status === 500)) {
                    response = await fetchDoli(`${apiUrl}/tickets?limit=${limit}`, {
                        method: 'GET',
                        headers
                    });
                }

                if (response.ok) {
                    const textData = await response.text();
                    const tickets = textData.trim() ? JSON.parse(textData) : [];

                    if (Array.isArray(tickets) && tickets.length > 0) {
                        const sortedTickets = tickets.sort((a, b) => b.datec - a.datec).slice(0, limit);

                        const mappedTickets = sortedTickets.map(t => mapTicket(t, store.state));
                        store.setTickets(mappedTickets);

                        recentTicketsList.innerHTML = '';
                        if (formList) formList.innerHTML = '';

                        store.state.tickets.forEach(mappedTicket => {
                            const html = renderTicketItemHtml(mappedTicket);

                            const div = document.createElement('div');
                            div.innerHTML = html.trim();
                            const newCard = div.firstChild;
                            recentTicketsList.appendChild(newCard);

                            const imgNode = newCard.querySelector('.avatar-img');
                            if (imgNode) {
                                imgNode.addEventListener('error', function () {
                                    const initials = this.getAttribute('data-initials') || '?';
                                    this.replaceWith(document.createTextNode(initials));
                                });
                            }

                            if (formList) {
                                const formDiv = document.createElement('div');
                                formDiv.innerHTML = html.trim();
                                const newFormCard = formDiv.firstChild;
                                formList.appendChild(newFormCard);
                                const formImgNode = newFormCard.querySelector('.avatar-img');
                                if (formImgNode) {
                                    formImgNode.addEventListener('error', function () {
                                        const initials = this.getAttribute('data-initials') || '?';
                                        this.replaceWith(document.createTextNode(initials));
                                    });
                                }
                            }
                        });

                        if (typeof initInlineEdit === 'function') {
                            initInlineEdit();
                        }

                        if (typeof window.applyTicketFilters === 'function') {
                            window.applyTicketFilters();
                        }

                    } else {
                        const noTicketsMsg = `<div style="text-align: center; color: #999;font-size: 11px; padding: 10px;">Aucun ticket récent trouvé (ou accès API refusé pour cet utilisateur).</div>`;
                        recentTicketsList.innerHTML = noTicketsMsg;
                        if (formList) formList.innerHTML = noTicketsMsg;
                        const countEl = document.getElementById('ticket-count-total');
                        if (countEl) countEl.textContent = '0';
                    }
                } else {
                    recentTicketsList.innerHTML = '';
                    if (formList) formList.innerHTML = '';
                    const d = document.createElement('div');
                    d.style.cssText = "text-align: center; color: #e74c3c;font-size: 11px; padding: 10px;";
                    d.textContent = `Erreur API (${response.status})`;
                    recentTicketsList.appendChild(d);
                    if (formList) formList.appendChild(d.cloneNode(true));
                }
            } catch (error) {
                recentTicketsList.innerHTML = '';
                if (formList) formList.innerHTML = '';
                const d = document.createElement('div');
                d.style.cssText = "text-align: center; color: #e74c3c;font-size: 11px; padding: 10px;";
                d.textContent = `Erreur JS: ${error.message}`;
                recentTicketsList.appendChild(d);
                if (formList) formList.appendChild(d.cloneNode(true));
            }
        }

        // Vérifie si l'API est configurée et gère le multi-profils
        chrome.storage.sync.get(['doliProfiles', 'doliActiveProfileId', 'doliRecentCount', 'doliListCount', 'doliApiLimit', 'doliTiersLimit'], (items) => {
            const profiles = items.doliProfiles || [];
            const activeId = items.doliActiveProfileId;
            let p = profiles.find(prof => prof.id === activeId);

            if (!p && profiles.length > 0) {
                p = profiles[0];
                chrome.storage.sync.set({ doliActiveProfileId: p.id });
            }

            const profileSwitcher = document.getElementById('doli-active-profile');
            const navFavicon = document.getElementById('nav-favicon');

            if (profiles.length > 1) {
                profileSwitcher.classList.remove('hidden');
                profileSwitcher.innerHTML = '';
                profiles.forEach(prof => {
                    const opt = document.createElement('option');
                    opt.value = prof.id;
                    opt.textContent = prof.name || 'Profil';
                    if (prof.id === p?.id) opt.selected = true;
                    profileSwitcher.appendChild(opt);
                });

                profileSwitcher.addEventListener('change', (e) => {
                    chrome.storage.sync.set({ doliActiveProfileId: e.target.value }, () => {
                        window.location.reload();
                    });
                });
            } else if (profiles.length === 1) {
                profileSwitcher.classList.add('hidden');
            }

            if (p && p.doliUrl && p.doliApiToken && profileSwitcher && !profileSwitcher.classList.contains('hidden')) {
                (async () => {
                    try {
                        const headers = { 'DOLAPIKEY': p.doliApiToken, 'Accept': 'application/json' };
                        if (p.doliEntity) headers['DOLAPIENTITY'] = String(p.doliEntity).trim();

                        const compRes = await fetchDoli(`${p.doliUrl}/setup/company`, { headers });
                        if (!compRes.ok) throw new Error('Company fetch failed');
                        const compData = await compRes.json();

                        const logoName = compData.logo_squarred || compData.logo;
                        if (!logoName) throw new Error('No logo found');

                        let filePath = 'logos/' + logoName;
                        const isSquarred = (logoName === compData.logo_squarred);

                        let docRes = await fetchDoli(`${p.doliUrl}/documents/download?modulepart=mycompany&original_file=${encodeURIComponent(filePath)}`, { headers });

                        if (!docRes.ok && isSquarred) {
                            filePath = 'logos/thumbs/' + logoName;
                            docRes = await fetchDoli(`${p.doliUrl}/documents/download?modulepart=mycompany&original_file=${encodeURIComponent(filePath)}`, { headers });
                        }

                        if (!docRes.ok) {
                            if (isSquarred && compData.logo && compData.logo !== compData.logo_squarred) {
                                filePath = 'logos/' + compData.logo;
                                docRes = await fetchDoli(`${p.doliUrl}/documents/download?modulepart=mycompany&original_file=${encodeURIComponent(filePath)}`, { headers });
                            }
                            if (!docRes.ok) {
                                throw new DoliError('DigiRisk-2003');
                            }
                        }

                        const docData = await docRes.json();
                        if (docData && docData.content) {
                            const contentType = docData['content-type'] || 'image/png';
                            if (navFavicon) {
                                navFavicon.src = `data:${contentType};base64,${docData.content}`;
                                navFavicon.style.display = 'block';
                                profileSwitcher.classList.add('has-favicon');
                            }
                            return;
                        }
                    } catch (err) {
                        try {
                            const domain = new URL(p.doliUrl).origin;
                            if (navFavicon) {
                                navFavicon.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
                                navFavicon.style.display = 'block';
                                profileSwitcher.classList.add('has-favicon');
                            }
                        } catch (e) {}

                        if (err instanceof DoliError && err.code === 'DigiRisk-2003') {
                            const warnBox = document.getElementById('performance-warning');
                            const warnTxt = document.getElementById('performance-warning-text');
                            const warnLink = document.getElementById('performance-warning-link');
                            if (warnBox && warnTxt && warnLink) {
                                warnTxt.textContent = err.userMessage;
                                warnLink.textContent = chrome.i18n.getMessage('btn_fix_logo') || "Générer";

                                let guiUrl = p.doliUrl;
                                if (guiUrl.endsWith('/api/index.php')) {
                                    guiUrl = guiUrl.substring(0, guiUrl.length - '/api/index.php'.length);
                                } else if (guiUrl.includes('/api/index.php/')) {
                                    guiUrl = guiUrl.split('/api/index.php/')[0];
                                }
                                warnLink.href = `${guiUrl}/admin/company.php`;
                                warnBox.classList.remove('hidden');
                            }
                        }
                    }
                })();
            }

            const topNav = document.querySelector('.top-nav');
            const mainHeader = document.getElementById('main-header-container');

            function getDoliApiCandidates(rawUrl) {
                let cleaned = rawUrl.trim();
                if (!/^https?:\/\//i.test(cleaned)) {
                    cleaned = 'https://' + cleaned;
                }
                cleaned = cleaned.replace(/\/+$/, '');
                if (cleaned.endsWith('/api/index.php')) {
                    return [cleaned];
                }
                if (cleaned.includes('/api/index.php/')) {
                    return [cleaned.split('/api/index.php/')[0] + '/api/index.php'];
                }
                if (cleaned.endsWith('/htdocs')) {
                    return [cleaned + '/api/index.php'];
                }
                return [
                    cleaned + '/api/index.php',
                    cleaned + '/htdocs/api/index.php'
                ];
            }

            async function testOnboardingConnection(apiUrl, login, passwordOrToken) {
                try {
                    const baseHeaders = { 'Accept': 'application/json' };
                    let authSuccess = false;
                    let apiTokenFinal = passwordOrToken;

                    const loginResponse = await fetchDoli(
                        `${apiUrl}/login?login=${encodeURIComponent(login)}&password=${encodeURIComponent(passwordOrToken)}`,
                        { method: 'POST', headers: baseHeaders }
                    );

                    if (loginResponse.ok) {
                        const data = await loginResponse.json();
                        if (data && data.success && data.success.token) {
                            apiTokenFinal = data.success.token;
                            authSuccess = true;
                        }
                    }

                    if (!authSuccess) {
                        const testKeyResponse = await fetchDoli(`${apiUrl}/status`, {
                            method: 'GET',
                            headers: { ...baseHeaders, 'DOLAPIKEY': passwordOrToken }
                        });
                        if (testKeyResponse.ok) {
                            authSuccess = true;
                        }
                    }

                    if (!authSuccess) {
                        return { success: false };
                    }

                    const authHeaders = { ...baseHeaders, 'DOLAPIKEY': apiTokenFinal };
                    let canReadDigirisk = false;
                    let canReadUsers = false;
                    let canReadTickets = false;
                    let canReadThirdparties = false;
                    let canReadProjects = false;
                    let canReadGed = false;

                    try {
                        const [dRes, uRes, tRes, tpRes, pRes, gRes] = await Promise.all([
                            fetchDoli(`${apiUrl}/digiriskdolibarr/digiriskelements?limit=1`, { method: 'GET', headers: authHeaders }),
                            fetchDoli(`${apiUrl}/users?limit=1`, { method: 'GET', headers: authHeaders }),
                            fetchDoli(`${apiUrl}/tickets?limit=1`, { method: 'GET', headers: authHeaders }),
                            fetchDoli(`${apiUrl}/thirdparties?limit=1`, { method: 'GET', headers: authHeaders }),
                            fetchDoli(`${apiUrl}/projects?limit=1`, { method: 'GET', headers: authHeaders }),
                            fetchDoli(`${apiUrl}/documents?modulepart=ticket&id=1`, { method: 'GET', headers: authHeaders })
                        ]);
                        const stText = String(dRes.statusText || '');
                        canReadDigirisk = (dRes.ok || dRes.status === 404) && !stText.includes('API not found') && !stText.includes('Restler');
                        canReadUsers = uRes.status !== 403 && uRes.status !== 401;
                        canReadTickets = tRes.status !== 403 && tRes.status !== 401;
                        canReadThirdparties = tpRes.status !== 403 && tpRes.status !== 401;
                        canReadProjects = pRes.status !== 403 && pRes.status !== 401;
                        canReadGed = gRes.status !== 403 && gRes.status !== 401;
                    } catch (permErr) {
                        console.warn('Erreur lors de la vérification des droits API:', permErr);
                    }

                    let entityName = '';
                    try {
                        const compRes = await fetchDoli(`${apiUrl}/setup/company`, { method: 'GET', headers: authHeaders });
                        if (compRes.ok) {
                            const compData = await compRes.json();
                            if (compData && compData.name) {
                                entityName = String(compData.name).trim();
                            }
                        }
                    } catch (compErr) {
                        console.warn('Erreur lecture société:', compErr);
                    }

                    return {
                        success: true,
                        apiUrl,
                        apiToken: apiTokenFinal,
                        permissions: {
                            digirisk: canReadDigirisk,
                            users: canReadUsers,
                            tickets: canReadTickets,
                            thirdparties: canReadThirdparties,
                            projects: canReadProjects,
                            ged: canReadGed,
                            ged_pr: true
                        },
                        entityName
                    };
                } catch (err) {
                    console.error('Erreur testOnboardingConnection:', err);
                    return { success: false };
                }
            }

            function initOnboardingView(existingProfiles, currentProfile) {
                const onboardingForm = document.getElementById('onboarding-form');
                const urlInput = document.getElementById('onboarding-doli-url');
                const loginInput = document.getElementById('onboarding-doli-login');
                const passwordInput = document.getElementById('onboarding-doli-password');
                const statusBox = document.getElementById('onboarding-status');
                const btnConnect = document.getElementById('btn-onboarding-connect');
                const openDoliLink = document.getElementById('onboarding-open-doli-link');

                if (!onboardingForm || !urlInput || !loginInput || !passwordInput) return;

                if (currentProfile) {
                    if (currentProfile.doliUrl) urlInput.value = currentProfile.doliUrl;
                    if (currentProfile.doliLogin) loginInput.value = currentProfile.doliLogin;
                }

                const getSafeDoliWebUrl = () => {
                    const raw = urlInput.value.trim();
                    if (!raw) return null;
                    try {
                        const candidate = /^https?:\/\//i.test(raw) ? raw : 'https://' + raw;
                        const parsed = new URL(candidate);
                        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
                        parsed.pathname = parsed.pathname.replace(/\/api\/index\.php\/?$/i, '');
                        return parsed.href;
                    } catch (e) {
                        return null;
                    }
                };

                const updateDoliShortcut = () => {
                    if (!openDoliLink) return;
                    if (getSafeDoliWebUrl()) {
                        openDoliLink.classList.remove('hidden');
                    } else {
                        openDoliLink.classList.add('hidden');
                    }
                };

                if (openDoliLink) {
                    openDoliLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        const safeUrl = getSafeDoliWebUrl();
                        if (safeUrl) {
                            chrome.tabs.create({ url: safeUrl });
                        }
                    });
                }

                urlInput.addEventListener('input', updateDoliShortcut);
                updateDoliShortcut();

                const showStatus = (text, type) => {
                    if (!statusBox) return;
                    statusBox.textContent = text;
                    statusBox.className = `onboarding-status status-${type}`;
                };

                onboardingForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    try {
                        const rawUrl = urlInput.value.trim();
                        const login = loginInput.value.trim();
                        const password = passwordInput.value.trim();

                        if (!rawUrl || !login || !password) {
                            showStatus(chrome.i18n.getMessage('opt_js_135'), 'error');
                            return;
                        }

                        const candidates = getDoliApiCandidates(rawUrl);
                        let originPattern = '';
                        try {
                            const urlObj = new URL(candidates[0]);
                            originPattern = urlObj.origin + '/*';
                        } catch (urlErr) {
                            showStatus(chrome.i18n.getMessage('opt_js_137'), 'error');
                            return;
                        }

                        btnConnect.disabled = true;
                        btnConnect.classList.add('btn-loading');
                        showStatus(chrome.i18n.getMessage('opt_js_136'), 'info');

                        await new Promise((resolve) => {
                            try {
                                chrome.permissions.request({ origins: [originPattern] }, (granted) => {
                                    if (chrome.runtime.lastError) {
                                        console.warn('Permission error:', chrome.runtime.lastError.message);
                                    }
                                    if (!granted) {
                                        showStatus(chrome.i18n.getMessage('error_permission_denied'), 'error');
                                    }
                                    resolve(granted);
                                });
                            } catch (permEx) {
                                resolve(false);
                            }
                        });

                        let result = { success: false };
                        for (const candidateUrl of candidates) {
                            result = await testOnboardingConnection(candidateUrl, login, password);
                            if (result.success) break;
                        }

                        if (!result.success) {
                            showStatus(chrome.i18n.getMessage('opt_js_137'), 'error');
                            btnConnect.disabled = false;
                            btnConnect.classList.remove('btn-loading');
                            return;
                        }

                        const hostname = new URL(result.apiUrl).hostname;
                        const profileName = result.entityName || hostname || 'Profil 1';
                        const statusObj = {
                            connection: 'ok',
                            digirisk: result.permissions.digirisk ? 'ok' : 'ko',
                            users: result.permissions.users ? 'ok' : 'ko',
                            tickets: result.permissions.tickets ? 'ok' : 'ko',
                            thirdparties: result.permissions.thirdparties ? 'ok' : 'ko',
                            projects: result.permissions.projects ? 'ok' : 'ko',
                            ged: result.permissions.ged ? 'ok' : 'ko',
                            ged_pr: result.permissions.ged_pr ? 'ok' : 'ko',
                            date: new Date().toLocaleString()
                        };

                        const targetProfile = currentProfile || {
                            id: 'prof_' + Math.random().toString(36).substring(2, 11)
                        };
                        targetProfile.name = profileName;
                        targetProfile.doliUrl = result.apiUrl;
                        targetProfile.doliLogin = login;
                        targetProfile.doliApiToken = result.apiToken;
                        targetProfile.doliAutoAssign = true;
                        targetProfile.doliTicketType = targetProfile.doliTicketType || 'ISSUE';
                        targetProfile.doliTicketSeverity = targetProfile.doliTicketSeverity || 'NORMAL';
                        targetProfile.permissions = result.permissions;
                        targetProfile.doliStatus = statusObj;

                        const updatedProfiles = existingProfiles.length > 0
                            ? existingProfiles.map(pr => pr.id === targetProfile.id ? targetProfile : pr)
                            : [targetProfile];

                        await new Promise((resolve) => {
                            chrome.storage.sync.set({
                                doliProfiles: updatedProfiles,
                                doliActiveProfileId: targetProfile.id
                            }, () => {
                                if (chrome.runtime.lastError) {
                                    console.error('Storage sync error:', chrome.runtime.lastError.message);
                                }
                                resolve();
                            });
                        });

                        showStatus(chrome.i18n.getMessage('opt_js_145'), 'success');
                        setTimeout(() => {
                            window.location.reload();
                        }, 450);
                    } catch (submitErr) {
                        console.error('Erreur onboarding submit:', submitErr);
                        showStatus(chrome.i18n.getMessage('opt_js_137'), 'error');
                        btnConnect.disabled = false;
                        btnConnect.classList.remove('btn-loading');
                    }
                });
            }

            if (p && p.doliUrl && p.doliApiToken) {
                if (topNav) topNav.classList.remove('hidden');
                if (mainHeader) mainHeader.classList.remove('hidden');
                setupWarning.classList.add('hidden');
                ticketForm.classList.remove('hidden');
                btnSubmit.disabled = false;
                btnSubmit.querySelector('.btn-text span[data-i18n]').textContent = chrome.i18n.getMessage('popup_js_111');

                const tiersLimit = items.doliTiersLimit !== undefined ? parseInt(items.doliTiersLimit, 10) || 50000 : 50000;
                const listCount = items.doliListCount !== undefined ? parseInt(items.doliListCount, 10) || 15 : 15;

                const digiriskPromise = loadDigiriskElements(p.doliUrl, p.doliApiToken, p.doliEntity);
                const usersPromise = loadUsers(p.doliUrl, p.doliApiToken, p.doliLogin, p.doliAutoAssign, p.doliEntity);
                const thirdpartiesPromise = loadThirdparties(p.doliUrl, p.doliApiToken, p.doliEntity, tiersLimit);

                // Charger les projets par défaut (notamment le projet Ticket DigiRisk s'il existe)
                loadProjects(p.doliUrl, p.doliApiToken, p.doliEntity, '');

                const tiersSelect = document.getElementById('ticket-tiers');
                if (tiersSelect) {
                    tiersSelect.addEventListener('change', (e) => {
                        loadContacts(p.doliUrl, p.doliApiToken, p.doliEntity, e.target.value);
                        loadProjects(p.doliUrl, p.doliApiToken, p.doliEntity, e.target.value);
                    });
                }

                loadRecentTickets(p.doliUrl, p.doliApiToken, listCount, p.doliEntity, usersPromise, thirdpartiesPromise, digiriskPromise);

                usersPromise.then(users => {
                    const filterAssigneeSelect = document.getElementById('ticket-filter-assignee');
                    if (filterAssigneeSelect && Array.isArray(users)) {
                        users.forEach(u => {
                            const opt = document.createElement('option');
                            opt.value = u.id;
                            let displayName = (u.firstname || u.lastname) ? `${u.firstname || ''} ${u.lastname || ''}`.trim() : u.login;
                            if (displayName.length > 15) {
                                displayName = displayName.substring(0, 15) + '...';
                            }
                            opt.textContent = displayName;
                            filterAssigneeSelect.appendChild(opt);
                        });
                    }
                });

                const gedWarning = document.getElementById('ged-warning');
                const pasteZone = document.getElementById('paste-zone');

                if (gedWarning && p.permissions && p.permissions.ged_pr === false) {
                    gedWarning.classList.remove('hidden');
                    gedWarning.innerHTML = `L'API de votre Dolibarr ne permet pas l'upload des fichiers joints aux tickets.<br> Voir <a href="https://github.com/Dolibarr/dolibarr/pull/37499" target="_blank" style="color: #c0392b; text-decoration: underline;">PR#37499</a> ou utilisez Dolibarr v23+.`;

                    if (pasteZone) {
                        const uploadZone = pasteZone.querySelector('.dashed-upload-zone');
                        if (uploadZone) {
                            uploadZone.style.display = 'none';
                        }
                    }
                } else if (gedWarning && p.doliStatus && p.doliStatus.ged !== 'ok') {
                    gedWarning.classList.remove('hidden');
                }

                const prefillKeys = [
                    'doliPrefillSubject', 'doliPrefillMessage', 'doliPrefillAssignee', 'doliActiveTab',
                    'doliPrefillTicketDigiriskElement', 'doliPrefillTicketLocation',
                    'doliPrefillTicketTiers', 'doliPrefillTicketContact', 'doliPrefillTicketProject'
                ];

                const profId = p.id || 'default';
                const draftTicketKey = `draftTicket_${profId}`;
                const draftSharedKey = `draftShared_${profId}`;

                chrome.storage.local.get([...prefillKeys, draftTicketKey, draftSharedKey], async (localItems) => {
                    switchTab('ticket');

                    // 1. Restauration des drafts spécifiques au profil
                    if (localItems[draftTicketKey]) {
                        const dt = localItems[draftTicketKey];
                        if (dt.subject !== undefined) document.getElementById('ticket-subject').value = dt.subject;
                        if (dt.message !== undefined) document.getElementById('ticket-message').value = dt.message;
                        if (dt.location !== undefined && document.getElementById('ticket-location')) {
                            document.getElementById('ticket-location').value = dt.location;
                        }
                        if (dt.assignee !== undefined && dt.assignee !== '') {
                            await usersPromise;
                            assigneeSelect.value = dt.assignee;
                            if (window.ticketAssigneeSelect) window.ticketAssigneeSelect.update();
                        }
                    }

                    const doliDigiriskElement = localItems.doliPrefillTicketDigiriskElement || (localItems[draftSharedKey] ? localItems[draftSharedKey].digiriskElement : '');
                    const doliLocation = localItems.doliPrefillTicketLocation || (localItems[draftTicketKey] ? localItems[draftTicketKey].location : '');
                    const doliTiers = localItems.doliPrefillTicketTiers || (localItems[draftSharedKey] ? localItems[draftSharedKey].tiers : '');
                    const doliContact = localItems.doliPrefillTicketContact || (localItems[draftSharedKey] ? localItems[draftSharedKey].contact : '');
                    const doliProject = localItems.doliPrefillTicketProject || (localItems[draftSharedKey] ? localItems[draftSharedKey].project : '');

                    // 2. Écrasement éventuel par les PREFILLS (Mail / Screenshot)
                    if (localItems.doliPrefillSubject) document.getElementById('ticket-subject').value = localItems.doliPrefillSubject;
                    if (localItems.doliPrefillMessage) document.getElementById('ticket-message').value = localItems.doliPrefillMessage;
                    if (doliLocation && document.getElementById('ticket-location')) {
                        document.getElementById('ticket-location').value = doliLocation;
                    }
                    if (localItems.doliPrefillAssignee) {
                        await usersPromise;
                        assigneeSelect.value = localItems.doliPrefillAssignee;
                        if (window.ticketAssigneeSelect) window.ticketAssigneeSelect.update();
                    }

                    if (doliDigiriskElement) {
                        await digiriskPromise;
                        const dgElem = document.getElementById('ticket-digiriskelement');
                        if (dgElem) {
                            dgElem.value = doliDigiriskElement;
                            if (window.ticketDigiriskSelect) window.ticketDigiriskSelect.update();
                        }
                    }

                    if (doliTiers) {
                        const tiersElem = document.getElementById('ticket-tiers');
                        if (tiersElem) {
                            setTimeout(() => {
                                tiersElem.value = doliTiers;
                                if (window.ticketTiersSelect) window.ticketTiersSelect.update();

                                loadContacts(p.doliUrl, p.doliApiToken, p.doliEntity, doliTiers).then(() => {
                                    if (doliContact) {
                                        const contactElem = document.getElementById('ticket-contact');
                                        if (contactElem) {
                                            contactElem.value = doliContact;
                                            if (window.ticketContactSelect) window.ticketContactSelect.update();
                                        }
                                    }
                                });

                                loadProjects(p.doliUrl, p.doliApiToken, p.doliEntity, doliTiers).then(() => {
                                    if (doliProject) {
                                        const projectElem = document.getElementById('ticket-project');
                                        if (projectElem) {
                                            projectElem.value = doliProject;
                                            if (window.ticketProjectSelect) window.ticketProjectSelect.update();
                                        }
                                    }
                                });
                            }, 500);
                        }
                    } else if (doliProject) {
                        setTimeout(() => {
                            const projectElem = document.getElementById('ticket-project');
                            if (projectElem) {
                                projectElem.value = doliProject;
                                if (window.ticketProjectSelect) window.ticketProjectSelect.update();
                            }
                        }, 500);
                    }

                    chrome.storage.local.remove(prefillKeys);

                    let draftTimeout;

                    const performSaveDraft = () => {
                        const draftTicket = {
                            subject: document.getElementById('ticket-subject').value,
                            message: document.getElementById('ticket-message').value,
                            location: document.getElementById('ticket-location') ? document.getElementById('ticket-location').value : '',
                            assignee: assigneeSelect ? assigneeSelect.value : ''
                        };

                        const draftShared = {
                            digiriskElement: document.getElementById('ticket-digiriskelement') ? document.getElementById('ticket-digiriskelement').value : '',
                            tiers: document.getElementById('ticket-tiers') ? document.getElementById('ticket-tiers').value : '',
                            contact: document.getElementById('ticket-contact') ? document.getElementById('ticket-contact').value : '',
                            project: document.getElementById('ticket-project') ? document.getElementById('ticket-project').value : ''
                        };
                        chrome.storage.local.set({ [draftTicketKey]: draftTicket, [draftSharedKey]: draftShared });
                    };

                    const saveDraftDebounced = () => {
                        clearTimeout(draftTimeout);
                        draftTimeout = setTimeout(performSaveDraft, 300);
                    };

                    const allInputs = document.querySelectorAll('#view-ticket input, #view-ticket textarea, #view-ticket select, #ticket-top-actions input, #ticket-top-actions select');
                    allInputs.forEach(el => {
                        el.addEventListener('input', saveDraftDebounced);
                        el.addEventListener('change', performSaveDraft);
                        el.addEventListener('blur', performSaveDraft);
                    });
                });
            } else {
                if (topNav) topNav.classList.add('hidden');
                if (mainHeader) mainHeader.classList.add('hidden');
                setupWarning.classList.remove('hidden');
                ticketForm.classList.add('hidden');
                initOnboardingView(profiles, p);
            }
        });

        // Gestion de l'envoi du formulaire TICKET
        ticketForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const subject = document.getElementById('ticket-subject').value;
            const message = document.getElementById('ticket-message').value;
            const assigneeId = assigneeSelect.value;

            const digiriskSelectElem = document.getElementById('ticket-digiriskelement');
            const digiriskElementId = digiriskSelectElem ? digiriskSelectElem.value : '';

            const locationInputElem = document.getElementById('ticket-location');
            const locationVal = locationInputElem ? locationInputElem.value.trim() : '';

            const tiersSelectElem = document.getElementById('ticket-tiers');
            const tiersId = tiersSelectElem ? tiersSelectElem.value : '';

            const contactSelectElem = document.getElementById('ticket-contact');
            const contactId = contactSelectElem ? contactSelectElem.value : '';

            const projectSelectElem = document.getElementById('ticket-project');
            const projectId = projectSelectElem ? projectSelectElem.value : '';

            btnSubmit.disabled = true;
            btnSubmit.classList.add('btn-loading');
            btnSubmit.querySelector('.btn-text span[data-i18n]').textContent = chrome.i18n.getMessage('popup_js_123');
            statusMessage.textContent = '';
            statusMessage.style.color = '#333';

            try {
                const items = await new Promise(resolve => chrome.storage.sync.get(['doliProfiles', 'doliActiveProfileId', 'doliListCount'], resolve));
                const profiles = items.doliProfiles || [];
                const p = profiles.find(prof => prof.id === items.doliActiveProfileId) || profiles[0];

                if (!p || !p.doliUrl || !p.doliApiToken) {
                    throw new DoliError("DigiRisk-2001");
                }

                const apiUrl = p.doliUrl;
                const token = p.doliApiToken;
                const entity = p.doliEntity;

                const baseHeaders = {
                    'DOLAPIKEY': token,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                };
                if (entity && String(entity).trim() !== '') {
                    baseHeaders['DOLAPIENTITY'] = String(entity).trim();
                }

                const randomTrackId = 'TCK' + Math.random().toString(36).substr(2, 8).toUpperCase();

                const ticketData = {
                    subject: subject,
                    message: message,
                    track_id: randomTrackId,
                    type_code: p.doliTicketType || 'ISSUE',
                    severity_code: p.doliTicketSeverity || 'NORMAL'
                };

                // Ajout des extrafields DigiRisk (GP/UT & Lieu & Date)
                if ((digiriskElementId && digiriskElementId !== '') || locationVal !== '') {
                    ticketData.array_options = {
                        options_digiriskdolibarr_ticket_date: Math.floor(Date.now() / 1000)
                    };
                    if (digiriskElementId && digiriskElementId !== '') {
                        ticketData.array_options.options_digiriskdolibarr_ticket_service = String(digiriskElementId);
                    }
                    if (locationVal !== '') {
                        ticketData.array_options.options_digiriskdolibarr_ticket_location = locationVal;
                    }
                }

                if (tiersId && tiersId !== '') {
                    ticketData.socid = parseInt(tiersId, 10);
                    ticketData.fk_soc = parseInt(tiersId, 10);
                }
                if (contactId && contactId !== '') {
                    ticketData.contactid = parseInt(contactId, 10);
                    ticketData.fk_contact = parseInt(contactId, 10);
                }
                if (projectId && projectId !== '') {
                    ticketData.fk_project = parseInt(projectId, 10);
                }

                if (p.doliTicketCategory && p.doliTicketCategory.trim() !== '') {
                    ticketData.category_code = p.doliTicketCategory.trim();
                }

                if (assigneeId && assigneeId !== "") {
                    ticketData.fk_user_assign = parseInt(assigneeId, 10);
                }

                const response = await fetchDoli(`${apiUrl}/tickets`, {
                    method: 'POST',
                    headers: baseHeaders,
                    body: JSON.stringify(ticketData)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    if (response.status === 401 || response.status === 403) {
                        throw new DoliError('DigiRisk-1003', errorText, { status: response.status });
                    }
                    if (response.status === 404) {
                        throw new DoliError('DigiRisk-1004', errorText, { status: response.status });
                    }
                    if (response.status === 500) {
                        throw new DoliError('DigiRisk-1500', errorText, { status: 500 });
                    }
                    throw new DoliError('DigiRisk-9999', `Erreur HTTP ${response.status}: ${errorText}`, { status: response.status });
                }

                const ticketId = await response.json();

                // 2. Gestion de la pièce jointe (si présente)
                let ticketRef = ticketId ? ticketId.toString() : '';

                if (attachmentsState.ticketFiles.length > 0 && ticketId) {
                    btnSubmit.querySelector('.btn-text span[data-i18n]').textContent = chrome.i18n.getMessage('popup_js_124');

                    const getTicketRes = await fetchDoli(`${apiUrl}/tickets/${ticketId}`, {
                        headers: baseHeaders
                    });

                    if (getTicketRes.ok) {
                        const ticketDetails = await getTicketRes.json();
                        if (ticketDetails && ticketDetails.ref) {
                            ticketRef = ticketDetails.ref;
                        }
                    }

                    if (attachmentsState.ticketFiles.length > 0 && ticketRef) {
                        btnSubmit.querySelector('.btn-text span[data-i18n]').textContent = chrome.i18n.getMessage('popup_js_120');
                        for (const fileObj of attachmentsState.ticketFiles) {
                            try {
                                await uploadFileToDoli(apiUrl, token, entity, fileObj.file, 'ticket', ticketId.toString());
                            } catch (err) {
                                throw new DoliError('DigiRisk-4006', err.message, { substitution: ticketRef });
                            }
                        }
                    }
                } else if (ticketId) {
                    const getTicketRes = await fetchDoli(`${apiUrl}/tickets/${ticketId}`, {
                        headers: baseHeaders
                    });
                    if (getTicketRes.ok) {
                        const ticketDetails = await getTicketRes.json();
                        if (ticketDetails && ticketDetails.ref) {
                            ticketRef = ticketDetails.ref;
                        }
                    }
                }

                const baseUrl = apiUrl.replace(/\/api\/index\.php\/?$/, '').replace(/\/htdocs\/api\/index\.php\/?$/, '/htdocs');
                const ticketLink = `${baseUrl}/ticket/card.php?id=${ticketId}`;
                const displayRef = ticketRef || ticketId;

                btnSubmit.classList.remove('btn-loading');
                btnSubmit.disabled = false;
                btnSubmit.querySelector('.btn-text span[data-i18n]').textContent = chrome.i18n.getMessage('popup_js_125');
                statusMessage.innerHTML = `
                    <div style="color:#27ae60; font-size:13px; text-align:left;">
                        Ticket <a href="${ticketLink}" target="_blank" style="text-decoration:none; font-weight:bold; color:#27ae60;" title="Voir le ticket">${displayRef}</a> créé avec succès !
                    </div>
                `;
                ticketForm.reset();
                if (locationInputElem) locationInputElem.value = '';
                clearTicketFiles();
                const ticketPreviewContainer = document.getElementById('preview-container');
                if (ticketPreviewContainer) {
                    ticketPreviewContainer.innerHTML = '';
                    ticketPreviewContainer.classList.add('hidden');
                }

                const prfId = p ? (p.id || 'default') : 'default';
                chrome.storage.local.remove([`draftTicket_${prfId}`, `draftShared_${prfId}`]);

                // Rafraîchir la liste des derniers tickets
                const listCount = items.doliListCount !== undefined ? parseInt(items.doliListCount, 10) || 15 : 15;
                loadRecentTickets(apiUrl, token, listCount, entity, Promise.resolve(store.state.users), Promise.resolve(store.state.thirdparties), Promise.resolve(store.state.digiriskElements));

            } catch (error) {
                btnSubmit.classList.remove('btn-loading');
                btnSubmit.querySelector('.btn-text span[data-i18n]').textContent = chrome.i18n.getMessage('popup_js_126');
                btnSubmit.disabled = false;

                if (error.message && error.message.includes('Ticket créé')) {
                    statusMessage.style.color = '#e74c3c';
                    const items = await new Promise(resolve => chrome.storage.local.get(['doliUrl'], resolve));
                    const baseUrl = items.doliUrl ? items.doliUrl.replace(/\/api\/index\.php\/?$/, '').replace(/\/htdocs\/api\/index\.php\/?$/, '/htdocs') : '#';
                    const match = error.message.match(/Ticket créé \((.*?)\)/);
                    const extractedRef = match ? match[1] : '';

                    let detailsMsg = error.message;
                    if (detailsMsg.includes('fichier. ')) {
                        detailsMsg = detailsMsg.split('fichier. ')[1].trim();
                    } else if (detailsMsg.includes('pièce jointe échouée:')) {
                        detailsMsg = detailsMsg.split('pièce jointe échouée:')[1].trim();
                    }
                    detailsMsg = detailsMsg.replace('PR#37499', '<a href="https://github.com/Dolibarr/dolibarr/pull/37499" target="_blank" style="text-decoration:underline; color:#e74c3c;">PR#37499</a>');

                    statusMessage.innerHTML = `
                        <div style="font-size:13px; text-align:center; padding: 10px; margin-top: 10px; border: 1px solid #e74c3c; border-radius: 4px; background: #fdfdfd;">
                            <span style="color:#e67e22; font-weight:bold; font-size:13px;">⚠️ Création partielle du ticket : <a href="${baseUrl}/ticket/card.php?id=${extractedRef}" target="_blank" style="text-decoration:underline; color:#e67e22;">${extractedRef}</a></span><br>
                            <small style="color:#e74c3c; display:inline-block; margin-top:4px;"><i>Détail : ${detailsMsg}</i></small>
                        </div>
                    `;
                } else {
                    showDoliError(error, statusMessage);
                }
                btnSubmit.querySelector('.btn-text span[data-i18n]').textContent = chrome.i18n.getMessage('popup_js_127');
            }
        });

        initAttachments();

        const btnClearTicket = document.getElementById('btn-clear-ticket');
        if (btnClearTicket) {
            btnClearTicket.addEventListener('click', () => {
                document.getElementById('ticket-form').reset();
                const locEl = document.getElementById('ticket-location');
                if (locEl) locEl.value = '';
                document.getElementById('ticket-subject').focus();
                clearTicketFiles();
                const previewContainer = document.getElementById('preview-container');
                if (previewContainer) { previewContainer.innerHTML = ''; previewContainer.classList.add('hidden'); }
                const pId = document.getElementById('doli-active-profile').value;
                if (pId) chrome.storage.local.remove([`draftTicket_${pId}`, `draftShared_${pId}`]);
            });
        }

        // Recherche et filtres dans les tickets
        const ticketSearchInput = document.getElementById('ticket-search-input');
        let currentTicketDateFilter = 'month';
        let currentTicketAssigneeFilter = 'all';

        window.applyTicketFilters = applyTicketFilters;
        function applyTicketFilters() {
            const query = (ticketSearchInput ? ticketSearchInput.value : '').toLowerCase().trim();
            const items = document.querySelectorAll('.recent-ticket-item');

            const now = Date.now() / 1000;
            const ONE_DAY = 24 * 3600;
            const ONE_WEEK = 7 * ONE_DAY;
            const ONE_MONTH = 30 * ONE_DAY;

            let visibleCount = 0;

            items.forEach(item => {
                let matchSearch = true;
                if (query !== '') {
                    const searchStr = item.getAttribute('data-search') || '';
                    const searchTokens = query.split(' ').filter(t => t.length > 0);
                    matchSearch = searchTokens.every(token => searchStr.includes(token));
                }

                let matchDate = true;
                if (currentTicketDateFilter) {
                    const itemDate = parseFloat(item.getAttribute('data-date')) || 0;
                    if (currentTicketDateFilter === 'yesterday') {
                        matchDate = (now - itemDate) <= (2 * ONE_DAY);
                    } else if (currentTicketDateFilter === 'week') {
                        matchDate = (now - itemDate) <= ONE_WEEK;
                    } else if (currentTicketDateFilter === 'month') {
                        matchDate = (now - itemDate) <= ONE_MONTH;
                    }
                }

                let matchAssignee = true;
                if (currentTicketAssigneeFilter && currentTicketAssigneeFilter !== 'all') {
                    const itemAssignee = item.getAttribute('data-assignee');
                    if (currentTicketAssigneeFilter === 'unassigned') {
                        matchAssignee = !itemAssignee || itemAssignee === 'null' || itemAssignee === '0' || itemAssignee === '';
                    } else {
                        matchAssignee = (String(itemAssignee) === String(currentTicketAssigneeFilter));
                    }
                }

                if (matchSearch && matchDate && matchAssignee) {
                    item.style.display = 'flex';
                    if (item.closest('#recent-tickets-list')) {
                        visibleCount++;
                    }
                } else {
                    item.style.display = 'none';
                }
            });

            if (query === '') {
                items.forEach(item => {
                    if (item.classList.contains('initially-hidden')) {
                        item.style.display = 'none';
                    }
                });
            }

            const countEl = document.getElementById('ticket-count-total');
            if (countEl) {
                countEl.textContent = visibleCount;
            }
        }

        if (ticketSearchInput) {
            let debounceTimerTkt;
            ticketSearchInput.addEventListener('input', () => {
                clearTimeout(debounceTimerTkt);
                debounceTimerTkt = setTimeout(() => {
                    applyTicketFilters();
                }, 300);
            });
        }

        const ticketQuickFilters = document.querySelectorAll('.ticket-quick-filter');
        ticketQuickFilters.forEach(btn => {
            if (btn.getAttribute('data-filter') === 'month') {
                btn.classList.add('active');
            }
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = e.currentTarget.getAttribute('data-filter');
                if (filter === 'all') {
                    currentTicketDateFilter = null;
                } else {
                    currentTicketDateFilter = filter;
                }

                ticketQuickFilters.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');

                applyTicketFilters();
            });
        });

        const ticketFilterAssignee = document.getElementById('ticket-filter-assignee');
        if (ticketFilterAssignee) {
            ticketFilterAssignee.addEventListener('change', (e) => {
                currentTicketAssigneeFilter = e.target.value;
                if (currentTicketAssigneeFilter !== 'all') {
                    ticketFilterAssignee.style.backgroundColor = '#2563eb';
                    ticketFilterAssignee.style.color = '#ffffff';
                } else {
                    ticketFilterAssignee.style.backgroundColor = '#e2e8f0';
                    ticketFilterAssignee.style.color = '#475569';
                }
                applyTicketFilters();
            });
        }

    } catch (fatalError) {
        document.body.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;">
            <h3 style="margin-top:0;">Erreur fatale de l'extension</h3>
            <p>${fatalError.message}</p>
            <pre style="font-size:10px; overflow:auto; background:#eee; padding:5px;">${fatalError.stack}</pre>
        </div>`;
    }
});
