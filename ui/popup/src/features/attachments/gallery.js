export function renderThumbnails(filesArray, containerId, inputId) {
    const container = document.getElementById(containerId);
    const input = document.getElementById(inputId);
    
    if (!container) return;

    if (filesArray.length === 0) {
        container.classList.add('hidden');
        container.innerHTML = '';
        if (input) input.value = '';
        return;
    }
    
    container.classList.remove('hidden');
    container.innerHTML = '';
    container.classList.add('new-layout');
    
    filesArray.forEach((fileObj, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'preview-item rich-thumb';
        
        let ext = fileObj.file.name.split('.').pop().toLowerCase();
        let iconSvg = '';
        let extBadge = ext;
        let iconClass = '';

        if (fileObj.file.type.startsWith('image/')) {
            iconSvg = `<img src="${fileObj.previewUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:4px;">`;
            iconClass = 'is-image';
            if (ext === 'jpeg') extBadge = 'jpg';
        } else if (ext === 'pdf') {
            iconSvg = '<svg viewBox="0 0 512 512" fill="currentColor"><path d="M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 144-208 0c-35.3 0-64 28.7-64 64l0 144-48 0c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128zM176 352l32 0c30.9 0 56 25.1 56 56s-25.1 56-56 56l-16 0 0 32c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-48 0-80c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24l-16 0 0 48 16 0zm96-80l32 0c26.5 0 48 21.5 48 48l0 64c0 26.5-21.5 48-48 48l-32 0c-8.8 0-16-7.2-16-16l0-128c0-8.8 7.2-16 16-16zm32 128c8.8 0 16-7.2 16-16l0-64c0-8.8-7.2-16-16-16l-16 0 0 96 16 0zm80-112c0-8.8 7.2-16 16-16l48 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0 0 32 32 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0 0 48c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-64 0-64z"/></svg>';
            iconClass = 'is-pdf';
        } else if (['doc', 'docx'].includes(ext)) {
            iconSvg = '<svg viewBox="0 0 384 512" fill="currentColor"><path d="M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-288-128 0c-17.7 0-32-14.3-32-32L224 0 64 0zM256 0l0 128 128 0L256 0zM111 257.1l26.8 89.2 31.6-90.3c3.4-9.6 12.5-16.1 22.7-16.1s19.3 6.4 22.7 16.1l31.6 90.3L273 257.1c3.8-12.7 17.2-19.9 29.9-16.1s19.9 17.2 16.1 29.9l-48 160c-3 10-12 16.9-22.4 17.1s-19.8-6.2-23.2-16.1L192 336.6l-33.3 95.3c-3.4 9.8-12.8 16.3-23.2 16.1s-19.5-7.1-22.4-17.1l-48-160c-3.8-12.7 3.4-26.1 16.1-29.9s26.1 3.4 29.9 16.1z"/></svg>';
            iconClass = 'is-word';
        } else {
            iconSvg = '<svg viewBox="0 0 384 512" fill="currentColor"><path d="M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-288-128 0c-17.7 0-32-14.3-32-32L224 0 64 0zM256 0l0 128 128 0L256 0zM112 256l160 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-160 0c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64l160 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-160 0c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64l160 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-160 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/></svg>';
            extBadge = ext.substring(0, 4);
        }

        const badgeDiv = document.createElement('div');
        badgeDiv.className = 'thumb-badge';
        badgeDiv.textContent = extBadge;

        const iconDiv = document.createElement('div');
        iconDiv.className = `thumb-icon ${iconClass}`;
        iconDiv.innerHTML = iconSvg; 

        const nameDiv = document.createElement('div');
        nameDiv.className = 'thumb-name';
        nameDiv.title = fileObj.file.name;
        nameDiv.textContent = fileObj.file.name;

        itemDiv.appendChild(badgeDiv);
        itemDiv.appendChild(iconDiv);
        itemDiv.appendChild(nameDiv);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn-remove-item rich-close';
        removeBtn.innerHTML = '<svg viewBox="0 0 512 512" fill="currentColor"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>';
        removeBtn.title = "Supprimer";
        removeBtn.onclick = (e) => {
            e.preventDefault();
            filesArray.splice(index, 1);
            renderThumbnails(filesArray, containerId, inputId);
        };
        itemDiv.appendChild(removeBtn);
        
        container.appendChild(itemDiv);
    });
}
