// ui/popup/src/features/attachments/capture.js
export function triggerCaptureForType(type, onRenderList) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) return;
        const tab = tabs[0];
        if (!tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("edge://") || tab.url.startsWith("about:")) {
            alert("La capture d'écran n'est pas autorisée sur les pages internes du navigateur.");
            return;
        }

        const currentFormState = {
            targetTab: 'ticket',
            captureTarget: 'ticket',
            ticketSubj: document.getElementById('ticket-subject')?.value || '',
            ticketMsg: document.getElementById('ticket-message')?.value || '',
            ticketTiers: document.getElementById('ticket-tiers')?.value || '',
            ticketTiersLabel: document.getElementById('ticket-tiers-input')?.value || '',
            ticketProject: document.getElementById('ticket-project')?.value || '',
            ticketProjectLabel: document.getElementById('ticket-project-input')?.value || '',
            ticketContact: document.getElementById('ticket-contact')?.value || '',
            ticketContactLabel: document.getElementById('ticket-contact-input')?.value || '',
            ticketType: document.getElementById('ticket-type')?.value || '',
            ticketSeverity: document.getElementById('ticket-severity')?.value || '',
            ticketCategory: document.getElementById('ticket-category')?.value || '',
            ticketAssign: document.getElementById('ticket-assign')?.value || '',
            ticketAssignLabel: document.getElementById('ticket-assign-input')?.value || '',
            ticketDigiriskElement: document.getElementById('ticket-digiriskelement')?.value || '',
            ticketDigiriskElementLabel: document.getElementById('ticket-digiriskelement-input')?.value || '',
            ticketLocation: document.getElementById('ticket-location')?.value || ''
        };

        chrome.storage.local.set({ prefillData: currentFormState }, () => {
            chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
                if (chrome.runtime.lastError || !dataUrl) {
                    console.warn("Erreur capture:", chrome.runtime.lastError);
                    alert("Impossible de capturer cet onglet.");
                    return;
                }

                chrome.tabs.sendMessage(tab.id, { action: "START_ANNOTATION", image: dataUrl }, () => {
                    if (chrome.runtime.lastError) {
                        if (chrome.scripting) {
                            chrome.scripting.executeScript({
                                target: { tabId: tab.id },
                                files: ['src/content/content.js']
                            }, () => {
                                if (chrome.runtime.lastError) {
                                    alert("Veuillez rafraîchir (F5) la page web actuelle pour utiliser l'outil d'annotation.");
                                } else {
                                    setTimeout(() => {
                                        chrome.tabs.sendMessage(tab.id, { action: "START_ANNOTATION", image: dataUrl }, () => {
                                            window.close();
                                        });
                                    }, 150);
                                }
                            });
                        } else {
                            alert("Veuillez rafraîchir (F5) la page web actuelle pour utiliser l'outil d'annotation.");
                        }
                    } else {
                        window.close();
                    }
                });
            });
        });
    });
}
