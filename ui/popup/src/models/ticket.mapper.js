import { extractTextFromHtml, escapeHtml, formatLineBreaksForAttribute } from '../utils/formatters.js';

export function mapTicket(apiTicket, state) {
    const stat = String(apiTicket.statut || apiTicket.status || "0");
    let statusColor = "#95a5a6";
    let statusLabelText = stat;
    const statusMap = {
        "0": "Non lu",
        "1": "Lu",
        "2": "Assigné",
        "3": "En cours",
        "4": "En attente",
        "5": "Fermé",
        "8": "Annulé"
    };

    if (statusMap[stat]) {
        statusLabelText = statusMap[stat];
        if (stat === "0") statusColor = "#e74c3c";
        else if (stat === "1") statusColor = "#f39c12";
        else if (stat === "2") statusColor = "#f1c40f";
        else if (stat === "3") statusColor = "#3498db";
        else if (stat === "4") statusColor = "#9b59b6";
        else if (stat === "5") statusColor = "#2ecc71";
        else if (stat === "8") statusColor = "#7f8c8d";
    }

    const ticketRef = apiTicket.ref || apiTicket.track_id || `Ticket #${apiTicket.id}`;
    
    // Resolve Company Name
    let companyName = apiTicket.thirdparty_name || apiTicket.soc_name;
    if (!companyName && apiTicket.fk_soc && state && state.thirdparties) {
        const matchedTiers = state.thirdparties.find(t => String(t.id) === String(apiTicket.fk_soc));
        if (matchedTiers) companyName = matchedTiers.name || matchedTiers.nom;
    }
    if (!companyName && apiTicket.fk_soc) companyName = "Tiers #" + apiTicket.fk_soc;

    // Resolve DigiRisk GP/UT element & Location from extrafields
    const arrayOptions = apiTicket.array_options || {};
    const digiriskServiceId = arrayOptions.options_digiriskdolibarr_ticket_service || '';
    const digiriskLocation = arrayOptions.options_digiriskdolibarr_ticket_location || '';
    let digiriskElementLabel = '';
    if (digiriskServiceId && state && Array.isArray(state.digiriskElements)) {
        const matchedEl = state.digiriskElements.find(el => String(el.id || el.rowid) === String(digiriskServiceId));
        if (matchedEl) {
            digiriskElementLabel = `${matchedEl.ref ? matchedEl.ref + ' - ' : ''}${matchedEl.label || matchedEl.nom || ''}`.trim();
        }
    }
    if (!digiriskElementLabel && digiriskServiceId && String(digiriskServiceId) !== '0') {
        digiriskElementLabel = `GP/UT #${digiriskServiceId}`;
    }

    // Severity
    const severityMap = {
        "LOW": "Basse",
        "NORMAL": "Normale",
        "HIGH": "Haute",
        "BLOCKING": "Bloquante"
    };
    let severityCode = String(apiTicket.severity_code || "").toUpperCase();
    let severity = severityMap[severityCode] || apiTicket.severity_label || apiTicket.severity_code || "Normal";

    // Date and Elapsed Time
    let dateFormatted = "";
    let elapsedTimeStr = "";
    if (apiTicket.datec) {
        const d = new Date(apiTicket.datec * 1000);
        const DD = String(d.getDate()).padStart(2, '0');
        const MM = String(d.getMonth() + 1).padStart(2, '0');
        const YYYY = d.getFullYear();
        dateFormatted = `${DD}/${MM}/${YYYY}`;
        
        const diffMs = Date.now() - d.getTime();
        if (diffMs > 0) {
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            let tps = [];
            if (diffDays > 0) tps.push(`${diffDays} j`);
            tps.push(`${String(diffHrs).padStart(2,'0')}:${String(diffMins).padStart(2,'0')}`);
            elapsedTimeStr = `Tps: ${tps.join(' ')}`;
        }
    } else if (apiTicket.date_creation) {
        const d = new Date(apiTicket.date_creation * 1000);
        if (!isNaN(d)) dateFormatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2, '0')}/${d.getFullYear()}`;
    }

    const progressPct = apiTicket.progress || apiTicket.progression || "0";

    // HTML / Text Cleaning
    let rawMsg = extractTextFromHtml(apiTicket.message);
    const safeSubject = escapeHtml(apiTicket.subject || "Sans titre");
    const safeMessage = escapeHtml(rawMsg);
    const safeMessageAttr = formatLineBreaksForAttribute(safeMessage);
    const searchString = (ticketRef + ' ' + safeSubject + ' ' + (companyName || '') + ' ' + digiriskElementLabel + ' ' + digiriskLocation).toLowerCase();
    
    // Assignee initials & photo
    let initials = "?";
    let photoUrl = '';

    if (apiTicket.fk_user_assign && state && state.users) {
        const matchedUser = state.users.find(u => String(u.id) === String(apiTicket.fk_user_assign));
        if (matchedUser) {
            if (matchedUser.firstname && matchedUser.lastname) {
                initials = matchedUser.firstname.charAt(0).toUpperCase() + matchedUser.lastname.charAt(0).toUpperCase();
            } else if (matchedUser.name) {
                const parts = matchedUser.name.split(' ');
                initials = parts.length > 1 ? parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
            } else if (matchedUser.login) {
                initials = matchedUser.login.substring(0, 2).toUpperCase();
            }
            
            if (matchedUser.photo && matchedUser.photo.trim() !== '') {
                photoUrl = matchedUser.photo.trim();
            }
        }
    }

    if (!photoUrl && apiTicket.user_assign_photo && apiTicket.user_assign_photo.trim() !== '') {
        photoUrl = apiTicket.user_assign_photo.trim();
    }
    
    if (photoUrl && !photoUrl.startsWith('http') && !photoUrl.startsWith('//') && state && state.activeProfile) {
        photoUrl = `${state.activeProfile.url}/document.php?modulepart=user&file=${encodeURIComponent(photoUrl)}`;
    }

    let ticketUrl = '#';
    let chatUrl = '#';
    if (state && state.activeProfile) {
        ticketUrl = `${state.activeProfile.url}/ticket/card.php?id=${apiTicket.id}`;
        chatUrl = `${state.activeProfile.url}/ticket/messaging.php?id=${apiTicket.id}`;
    }

    return {
        id: apiTicket.id,
        rawTicket: apiTicket,
        ref: ticketRef,
        stat,
        statusLabelText,
        statusColor,
        companyName,
        digiriskServiceId,
        digiriskElementLabel,
        digiriskLocation,
        severity,
        severityCode: apiTicket.severity_code || '',
        dateFormatted,
        elapsedTimeStr,
        datec: apiTicket.datec || 0,
        progressPct,
        safeSubject,
        safeMessage,
        safeMessageAttr,
        searchString,
        photoUrl,
        initials,
        fk_user_assign: apiTicket.fk_user_assign || '',
        ticketUrl,
        chatUrl
    };
}
