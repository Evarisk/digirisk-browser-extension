// ui/popup/src/features/attachments/index.js
import { attachmentState, addFileToState, removeFileFromState } from './state.js';
import { triggerCaptureForType } from './capture.js';
import { escapeHtml } from '../../utils/formatters.js';

export function renderAttachmentsList(type) {
    const listDiv = document.getElementById('ticket-attachments-list');
    if (!listDiv) return;
    
    const files = attachmentState.ticketFiles;
    listDiv.innerHTML = '';

    files.forEach((f, idx) => {
        const chip = document.createElement('div');
        chip.className = 'attachment-chip';
        chip.innerHTML = `
            <span class="file-name" title="${escapeHtml(f.name)}">📄 ${escapeHtml(f.name)}</span>
            <button type="button" class="remove-file" data-idx="${idx}" title="Retirer">×</button>
        `;
        chip.querySelector('.remove-file').addEventListener('click', () => {
            removeFileFromState(type, idx);
            renderAttachmentsList(type);
        });
        listDiv.appendChild(chip);
    });
}

function handleFileInputChange(e, type) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(evt) {
            const dataUrl = evt.target.result;
            const base64Content = dataUrl.split(',')[1];
            addFileToState(type, { name: file.name, content: base64Content });
            renderAttachmentsList(type);
        };
        reader.readAsDataURL(file);
    });
    e.target.value = '';
}

export function initAttachmentsFeature() {
    document.getElementById('btn-ticket-attach')?.addEventListener('click', () => {
        document.getElementById('ticket-file-input')?.click();
    });
    document.getElementById('ticket-file-input')?.addEventListener('change', (e) => handleFileInputChange(e, 'ticket'));
    
    document.getElementById('btn-ticket-capture')?.addEventListener('click', () => triggerCaptureForType('ticket', renderAttachmentsList));
}
