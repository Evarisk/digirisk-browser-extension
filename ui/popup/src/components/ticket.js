import { escapeHtml } from '../utils/formatters.js';

export function renderTicketCard(ticket) {
    let badgeHtml = '';
    if (ticket.photoUrl) {
        badgeHtml = `<div style="position:relative; width:20px; height:20px; flex-shrink:0; display:inline-block; vertical-align:middle;" title="Assigné à">
            <span class="assignee-badge editable-field" data-ticket-id="${ticket.id}" data-field="assign" data-val="${ticket.fk_user_assign}" style="background:#34495e; color:white; font-size:9px; font-weight:bold; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; position:absolute; top:0; left:0;">${ticket.initials}</span>
            <img src="${ticket.photoUrl}" class="assignee-photo editable-field" data-ticket-id="${ticket.id}" data-field="assign" data-val="${ticket.fk_user_assign}" style="width:20px; height:20px; border-radius:50%; object-fit:cover; display:block; border: 1px solid #ccc; position:absolute; top:0; left:0;" />
        </div>`;
    } else {
        badgeHtml = `<span class="assignee-badge editable-field" data-ticket-id="${ticket.id}" data-field="assign" data-val="${ticket.fk_user_assign}" title="Assigné à" style="background:#34495e; color:white; font-size:9px; font-weight:bold; width:20px; height:20px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;">${ticket.initials}</span>`;
    }

    const digiriskBadge = ticket.digiriskElementLabel
        ? `<span title="GP/UT DigiRisk" style="background:#eef4fb; color:#1e4e8c; border:1px solid #c5daf6; font-size:10px; font-weight:600; padding:1px 6px; border-radius:4px; white-space:nowrap;">🛡️ ${escapeHtml(ticket.digiriskElementLabel)}</span>`
        : '';
    const locationBadge = ticket.digiriskLocation
        ? `<span title="Lieu" style="color:#666; font-size:10px; white-space:nowrap;">📍 ${escapeHtml(ticket.digiriskLocation)}</span>`
        : '';

    return `
        <div class="ticket-item-wrapper" data-id="${ticket.id}" data-status="${ticket.stat}" data-severity="${ticket.severity}" data-search="${escapeHtml(ticket.searchString)}" data-date="${ticket.datec}" style="display:flex; flex-direction:column; border-bottom: 1px solid #f0f0f0; padding: 10px 6px; position:relative; transition: background 0.2s;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; gap:8px;">
                <div style="display:flex; align-items:center; gap:6px; overflow:hidden; flex:1;">
                    <a href="${ticket.ticketUrl}" target="_blank" style="text-decoration:none; color:#0056b3; font-weight:bold; font-size:12px; white-space:nowrap; flex-shrink:0;">${escapeHtml(ticket.ref)}</a>
                    <a href="${ticket.chatUrl}" target="_blank" title="Voir les échanges de messages" style="text-decoration:none; font-size:12px; flex-shrink:0;">💬</a>
                    ${ticket.companyName ? `<span style="color:#555; font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:bold;">🏢 ${escapeHtml(ticket.companyName)}</span>` : ''}
                </div>
                <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                    <span class="editable-field" data-ticket-id="${ticket.id}" data-field="severity" data-val="${escapeHtml(ticket.severityCode)}" title="Double-clic pour éditer la sévérité" style="font-size:10px; padding:1px 5px; border-radius:4px; border:1px solid #ddd; color:#666; background:#fafafa; white-space:nowrap;">${escapeHtml(ticket.severity)}</span>
                    ${badgeHtml}
                    <span class="editable-field" data-ticket-id="${ticket.id}" data-field="status" data-val="${ticket.stat}" title="Double-clic pour éditer le statut" style="background:${ticket.statusColor}; color:white; padding:2px 6px; border-radius:10px; font-size:10px; font-weight:bold; white-space:nowrap;">${escapeHtml(ticket.statusLabelText)}</span>
                </div>
            </div>
            ${(digiriskBadge || locationBadge) ? `<div style="display:flex; align-items:center; gap:6px; margin-bottom:4px; flex-wrap:wrap;">${digiriskBadge}${locationBadge}</div>` : ''}
            <div class="ticket-tooltip-trigger" data-msg="${ticket.safeMessageAttr}" style="display:flex; justify-content:space-between; align-items:center; cursor:help; gap:8px;">
                <div class="editable-field" data-ticket-id="${ticket.id}" data-field="subject" data-val="${ticket.safeSubject}" title="Double-clic pour éditer le sujet" style="color:#333; font-size:12px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1;">
                    ${ticket.safeSubject}
                </div>
                <div style="display:flex; align-items:center; gap:6px; font-size:10px; color:#888; white-space:nowrap; flex-shrink:0;">
                    ${ticket.dateFormatted ? `<span title="Date de création">📅 ${ticket.dateFormatted}</span>` : ''}
                    ${ticket.elapsedTimeStr ? `<span title="Temps écoulé depuis la création" style="color:#d35400;">⏱️ ${ticket.elapsedTimeStr}</span>` : ''}
                    <span class="editable-field" data-ticket-id="${ticket.id}" data-field="progress" data-val="${ticket.progressPct}" title="Double-clic pour éditer la progression" style="background:#eee; padding:1px 4px; border-radius:3px; font-weight:bold; color:#555;">📊 ${ticket.progressPct}%</span>
                </div>
            </div>
        </div>
    `;
}
