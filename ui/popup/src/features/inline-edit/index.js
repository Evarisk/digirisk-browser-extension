// ui/popup/src/features/inline-edit/index.js
import { store } from '../../store/store.js';
import { fetchDoli } from '../../api/dolibarr.js';
import { escapeHtml } from '../../utils/formatters.js';

export function initInlineEdit(containerSelector, onUpdateSuccess) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.addEventListener('dblclick', (e) => {
        const target = e.target.closest('.editable-field');
        if (!target) return;
        e.stopPropagation();

        if (target.querySelector('input, select')) return;

        const ticketId = target.getAttribute('data-ticket-id');
        const field = target.getAttribute('data-field');
        const currentVal = target.getAttribute('data-val') || '';
        const originalHtml = target.innerHTML;

        let inputEl = null;

        if (field === 'subject' || field === 'progress') {
            inputEl = document.createElement('input');
            inputEl.type = field === 'progress' ? 'number' : 'text';
            if (field === 'progress') {
                inputEl.min = 0; inputEl.max = 100; inputEl.step = 5;
                inputEl.style.width = '50px';
            } else {
                inputEl.style.width = '100%';
            }
            inputEl.value = currentVal;
            inputEl.style.fontSize = '11px';
            inputEl.style.padding = '2px 4px';
            inputEl.style.border = '1px solid #3498db';
            inputEl.style.borderRadius = '3px';
            inputEl.style.outline = 'none';
        } else if (field === 'status') {
            inputEl = document.createElement('select');
            const statuses = { "0": "Non lu", "1": "Lu", "2": "Assigné", "3": "En cours", "4": "En attente", "5": "Fermé", "8": "Annulé" };
            for (const [k, v] of Object.entries(statuses)) {
                inputEl.innerHTML += `<option value="${k}" ${String(k) === String(currentVal) ? 'selected' : ''}>${v}</option>`;
            }
            inputEl.style.fontSize = '10px';
            inputEl.style.padding = '1px';
        } else if (field === 'severity') {
            inputEl = document.createElement('select');
            const severities = { "LOW": "Basse", "NORMAL": "Normale", "HIGH": "Haute", "BLOCKING": "Bloquante" };
            for (const [k, v] of Object.entries(severities)) {
                inputEl.innerHTML += `<option value="${k}" ${String(k) === String(currentVal).toUpperCase() ? 'selected' : ''}>${v}</option>`;
            }
            inputEl.style.fontSize = '10px';
            inputEl.style.padding = '1px';
        } else if (field === 'assign') {
            inputEl = document.createElement('select');
            inputEl.innerHTML = `<option value="">Non assigné</option>`;
            const users = store.state.users || [];
            users.forEach(u => {
                const name = `${u.firstname || ''} ${u.lastname || u.login || ''}`.trim();
                inputEl.innerHTML += `<option value="${u.id}" ${String(u.id) === String(currentVal) ? 'selected' : ''}>${escapeHtml(name)}</option>`;
            });
            inputEl.style.fontSize = '10px';
            inputEl.style.padding = '1px';
            inputEl.style.maxWidth = '100px';
        }

        if (!inputEl) return;

        if (target.tagName === 'IMG') {
            const parent = target.parentElement;
            target.style.display = 'none';
            parent.appendChild(inputEl);
        } else {
            target.innerHTML = '';
            target.appendChild(inputEl);
        }
        inputEl.focus();

        let isSaving = false;
        const saveChanges = async () => {
            if (isSaving) return;
            isSaving = true;
            const newVal = inputEl.value.trim();

            if (String(newVal) === String(currentVal)) {
                restoreOriginal();
                return;
            }

            if (target.tagName === 'IMG') {
                inputEl.disabled = true;
            } else {
                target.innerHTML = '<span style="font-size:10px; color:#888;">⏳...</span>';
            }

            const payload = {};
            if (field === 'subject') payload.subject = newVal;
            if (field === 'progress') payload.progress = parseInt(newVal, 10) || 0;
            if (field === 'status') { payload.statut = newVal; payload.fk_statut = newVal; payload.status = newVal; }
            if (field === 'severity') payload.severity_code = newVal;
            if (field === 'assign') payload.fk_user_assign = newVal ? parseInt(newVal, 10) : 0;

            try {
                const activeProfile = store.state.activeProfile;
                if (!activeProfile) throw new Error('No active profile');

                const headers = { 'Content-Type': 'application/json', 'DOLAPIKEY': activeProfile.apiKey };
                if (activeProfile.entity) headers['DOLAPIENTITY'] = String(activeProfile.entity);

                const res = await fetchDoli(`${activeProfile.url}/api/index.php/tickets/${ticketId}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    const updatedItem = await res.json();
                    store.updateTicket(ticketId, updatedItem);
                    if (onUpdateSuccess) onUpdateSuccess();
                } else {
                    alert("Erreur lors de la mise à jour.");
                    restoreOriginal();
                }
            } catch (err) {
                console.error(err);
                restoreOriginal();
            }
        };

        const restoreOriginal = () => {
            if (target.tagName === 'IMG') {
                inputEl.remove();
                target.style.display = 'block';
            } else {
                target.innerHTML = originalHtml;
            }
        };

        inputEl.addEventListener('blur', saveChanges);
        inputEl.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') { ev.preventDefault(); inputEl.blur(); }
            if (ev.key === 'Escape') { isSaving = true; restoreOriginal(); }
        });
        if (inputEl.tagName === 'SELECT') {
            inputEl.addEventListener('change', () => inputEl.blur());
        }
    });
}
