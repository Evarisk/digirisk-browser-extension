// ui/popup/src/features/attachments/state.js
export const attachmentState = {
    ticketFiles: []
};

export function addFileToState(type, fileData) {
    attachmentState.ticketFiles.push(fileData);
}

export function removeFileFromState(type, index) {
    attachmentState.ticketFiles.splice(index, 1);
}

export function clearAttachmentState(type) {
    attachmentState.ticketFiles = [];
}
