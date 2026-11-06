export function extractTextFromHtml(htmlString) {
    if (!htmlString) return "";
    let formatted = htmlString.replace(/<br\s*[\/]?>/gi, '\n')
                              .replace(/<\/p>/gi, '\n\n')
                              .replace(/<\/li>/gi, '\n')
                              .replace(/<\/div>/gi, '\n')
                              .replace(/<\/h[1-6]>/gi, '\n\n');
    const doc = new DOMParser().parseFromString(formatted, 'text/html');
    let text = doc.body.textContent || "";
    return text.replace(/\n{3,}/g, '\n\n').trim();
}

export function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
}

export function formatLineBreaksForAttribute(str) {
    if (!str) return "";
    return String(str).replace(/\n/g, '&#10;');
}
