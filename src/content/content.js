// content.js - Script injecté dans les pages web visitées
console.log("Script de contenu Doli-DigiRisk chargé sur la page actuelle.");

function createSvgIcon(type, size = 16) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    
    if (type === 'opp') {
        svg.setAttribute('fill', '#6c757d');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('viewBox', '0 0 24 24');
        const path = document.createElementNS(ns, 'path');
        path.setAttribute('d', 'M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.92 18,21.92C19.61,21.92 20.92,20.61 20.92,19C20.92,17.39 19.61,16.08 18,16.08Z');
        svg.appendChild(path);
    } else if (type === 'ticket') {
        svg.setAttribute('fill', '#38b2ac');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('viewBox', '0 0 24 24');
        const path = document.createElementNS(ns, 'path');
        path.setAttribute('d', 'M22,10V6A2,2 0 0,0 20,4H4A2,2 0 0,0 2,6V10C3.11,10 4,10.9 4,12C4,13.11 3.11,14 2,14V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V14C20.89,14 20,13.11 20,12C20,10.9 20.89,10 22,10M11,15H13V13H15V11H13V9H11V11H9V13H11V15Z');
        svg.appendChild(path);
    }
    
    return svg;
}

function createEditorSvg(mode) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');

    if (mode === 'crop') {
        const p1 = document.createElementNS(ns, 'path'); p1.setAttribute('d', 'M6 2v14a2 2 0 0 0 2 2h14');
        const p2 = document.createElementNS(ns, 'path'); p2.setAttribute('d', 'M18 22V8a2 2 0 0 0-2-2H2');
        svg.appendChild(p1); svg.appendChild(p2);
    } else if (mode === 'pencil') {
        const p1 = document.createElementNS(ns, 'path'); p1.setAttribute('d', 'M12 20h9');
        const p2 = document.createElementNS(ns, 'path'); p2.setAttribute('d', 'M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z');
        svg.appendChild(p1); svg.appendChild(p2);
    } else if (mode === 'arrow') {
        const l1 = document.createElementNS(ns, 'line'); l1.setAttribute('x1', '7'); l1.setAttribute('y1', '17'); l1.setAttribute('x2', '17'); l1.setAttribute('y2', '7');
        const p1 = document.createElementNS(ns, 'polyline'); p1.setAttribute('points', '7 7 17 7 17 17');
        svg.appendChild(l1); svg.appendChild(p1);
    } else if (mode === 'text') {
        const p1 = document.createElementNS(ns, 'polyline'); p1.setAttribute('points', '4 7 4 4 20 4 20 7');
        const l1 = document.createElementNS(ns, 'line'); l1.setAttribute('x1', '9'); l1.setAttribute('y1', '20'); l1.setAttribute('x2', '15'); l1.setAttribute('y2', '20');
        const l2 = document.createElementNS(ns, 'line'); l2.setAttribute('x1', '12'); l2.setAttribute('y1', '4'); l2.setAttribute('x2', '12'); l2.setAttribute('y2', '20');
        svg.appendChild(p1); svg.appendChild(l1); svg.appendChild(l2);
    } else if (mode === 'rect') {
        const r1 = document.createElementNS(ns, 'rect'); r1.setAttribute('x', '3'); r1.setAttribute('y', '3'); r1.setAttribute('width', '18'); r1.setAttribute('height', '18'); r1.setAttribute('rx', '2'); r1.setAttribute('ry', '2');
        svg.appendChild(r1);
    } else if (mode === 'blur') {
        const c1 = document.createElementNS(ns, 'circle'); c1.setAttribute('cx', '12'); c1.setAttribute('cy', '12'); c1.setAttribute('r', '10');
        const p1 = document.createElementNS(ns, 'path'); p1.setAttribute('d', 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z');
        svg.appendChild(c1); svg.appendChild(p1);
    } else if (mode === 'sequence') {
        const c1 = document.createElementNS(ns, 'circle'); c1.setAttribute('cx', '12'); c1.setAttribute('cy', '12'); c1.setAttribute('r', '10');
        const t1 = document.createElementNS(ns, 'text'); t1.setAttribute('x', '12'); t1.setAttribute('y', '16'); t1.setAttribute('font-family', 'Arial'); t1.setAttribute('font-size', '12'); t1.setAttribute('font-weight', 'bold'); t1.setAttribute('text-anchor', 'middle'); t1.setAttribute('fill', 'currentColor'); t1.setAttribute('stroke', 'none'); t1.textContent = '1';
        svg.appendChild(c1); svg.appendChild(t1);
    } else if (mode === 'settings') {
        const c1 = document.createElementNS(ns, 'circle'); c1.setAttribute('cx', '12'); c1.setAttribute('cy', '12'); c1.setAttribute('r', '3');
        const p1 = document.createElementNS(ns, 'path'); p1.setAttribute('d', 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z');
        svg.appendChild(c1); svg.appendChild(p1);
    } else if (mode === 'cancel') {
        const l1 = document.createElementNS(ns, 'line'); l1.setAttribute('x1', '18'); l1.setAttribute('y1', '6'); l1.setAttribute('x2', '6'); l1.setAttribute('y2', '18');
        const l2 = document.createElementNS(ns, 'line'); l2.setAttribute('x1', '6'); l2.setAttribute('y1', '6'); l2.setAttribute('x2', '18'); l2.setAttribute('y2', '18');
        svg.appendChild(l1); svg.appendChild(l2);
    } else if (mode === 'validate') {
        const p1 = document.createElementNS(ns, 'polyline'); p1.setAttribute('points', '20 6 9 17 4 12');
        svg.appendChild(p1);
    } else if (mode === 'size') {
        svg.setAttribute('width', '14'); svg.setAttribute('height', '14'); svg.removeAttribute('stroke'); svg.setAttribute('fill', 'currentColor');
        const c1 = document.createElementNS(ns, 'circle'); c1.setAttribute('cx', '12'); c1.setAttribute('cy', '12'); c1.setAttribute('r', '8');
        svg.appendChild(c1);
    }

    return svg;
}

// --- Éditeur de Capture d'Écran In-Page ---


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "START_IN_PAGE_EDITOR") {
        initEditor(request.image);
        sendResponse({ status: "started" });
    }
});

let editorOverlay = null;
let canvas = null;
let ctx = null;
let img = null;
let currentMode = 'crop'; // 'crop', 'arrow', 'text'
let isDrawing = false;
let startX = 0, startY = 0;
let snapshot = null; // Pour restaurer l'état du canvas pendant le glissement d'une flèche
let cropSelectionDiv = null;
let userBlurIntensity = 8; // Réglage global
let userColor = '#e74c3c';
let userLineWidth = 4;
let userImageFormat = 'png'; // Réglage global
let sequenceCounter = 1;

function initEditor(dataUrl) {
    chrome.storage.sync.get(['doliBlurIntensity', 'doliImageFormat'], (items) => {
        if (items.doliBlurIntensity) userBlurIntensity = items.doliBlurIntensity;
        if (items.doliImageFormat) userImageFormat = items.doliImageFormat;
    });

    if (editorOverlay) {
        document.body.removeChild(editorOverlay);
    }

    // 1. Création de l'interface
    editorOverlay = document.createElement('div');
    editorOverlay.id = 'doli-editor-overlay';

    const toolbar = document.createElement('div');
    toolbar.id = 'doli-editor-toolbar';

    const tools = [
        { mode: 'crop', titleKey: 'editor_crop', active: true },
        { mode: 'pencil', titleKey: 'editor_draw' },
        { mode: 'arrow', titleKey: 'editor_arrow' },
        { mode: 'text', titleKey: 'editor_text' },
        { mode: 'rect', titleKey: 'editor_box' },
        { mode: 'blur', titleKey: 'editor_blur' },
        { mode: 'sequence', titleKey: 'editor_bullet' }
    ];

    tools.forEach(t => {
        const btn = document.createElement('button');
        btn.className = 'doli-tool-btn' + (t.active ? ' active' : '');
        btn.dataset.mode = t.mode;
        btn.title = chrome.i18n.getMessage(t.titleKey) || t.titleKey;
        btn.appendChild(createEditorSvg(t.mode));
        toolbar.appendChild(btn);
    });

    const sep1 = document.createElement('div');
    sep1.className = 'doli-editor-separator';
    toolbar.appendChild(sep1);

    const colorRow = document.createElement('div');
    colorRow.className = 'doli-tool-input-row';
    colorRow.title = chrome.i18n.getMessage('editor_color_label') || 'Couleur';
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.id = 'doli-color-picker';
    colorInput.className = 'doli-editor-color';
    colorInput.value = '#e74c3c';
    colorRow.appendChild(colorInput);
    toolbar.appendChild(colorRow);

    const sizeRow = document.createElement('div');
    sizeRow.className = 'doli-tool-input-row';
    sizeRow.title = chrome.i18n.getMessage('editor_size_label') || 'Taille';
    sizeRow.appendChild(createEditorSvg('size'));
    const sizeInput = document.createElement('input');
    sizeInput.type = 'range';
    sizeInput.id = 'doli-line-width';
    sizeInput.className = 'doli-editor-range';
    sizeInput.min = '1';
    sizeInput.max = '15';
    sizeInput.value = '4';
    sizeRow.appendChild(sizeInput);
    toolbar.appendChild(sizeRow);

    const sep2 = document.createElement('div');
    sep2.className = 'doli-editor-separator';
    toolbar.appendChild(sep2);

    const btnSettings = document.createElement('button');
    btnSettings.className = 'doli-tool-btn';
    btnSettings.id = 'doli-btn-settings';
    btnSettings.title = chrome.i18n.getMessage('editor_settings_title') || 'Paramètres';
    btnSettings.appendChild(createEditorSvg('settings'));
    toolbar.appendChild(btnSettings);

    const btnCancel = document.createElement('button');
    btnCancel.className = 'doli-tool-btn danger';
    btnCancel.id = 'doli-btn-cancel';
    btnCancel.title = chrome.i18n.getMessage('editor_cancel_btn') || 'Annuler';
    btnCancel.appendChild(createEditorSvg('cancel'));
    toolbar.appendChild(btnCancel);

    const btnValidate = document.createElement('button');
    btnValidate.className = 'doli-tool-btn success';
    btnValidate.id = 'doli-btn-validate';
    btnValidate.title = chrome.i18n.getMessage('editor_save_btn') || 'Valider';
    btnValidate.appendChild(createEditorSvg('validate'));
    toolbar.appendChild(btnValidate);

    editorOverlay.appendChild(toolbar);

    const canvasContainer = document.createElement('div');
    canvasContainer.id = 'doli-editor-canvas-container';

    const canvasEl = document.createElement('canvas');
    canvasEl.id = 'doli-editor-canvas';
    canvasContainer.appendChild(canvasEl);

    const cropSelection = document.createElement('div');
    cropSelection.id = 'doli-crop-selection';
    cropSelection.style.display = 'none';
    canvasContainer.appendChild(cropSelection);

    editorOverlay.appendChild(canvasContainer);

    document.body.appendChild(editorOverlay);

    canvas = document.getElementById('doli-editor-canvas');
    ctx = canvas.getContext('2d', { willReadFrequently: true });
    cropSelectionDiv = document.getElementById('doli-crop-selection');

    // 2. Chargement de l'image sur le canvas
    img = new Image();
    img.onload = () => {
        // Le canvas prend la vraie résolution de l'image (physique, ex: 2x en Retina)
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // CSS laisse img s'étirer via "width: 100vw; height: 100vh;" et "object-fit: fill"
        
        // Facteurs pour passer des pixels logiques CSS (souris) aux pixels physiques (canvas interne)
        canvas.scaleX = img.width / window.innerWidth;
        canvas.scaleY = img.height / window.innerHeight;
    };
    img.src = dataUrl;

    // 3. Événements des boutons de la barre d'outils
    const toolBtns = editorOverlay.querySelectorAll('.doli-tool-btn[data-mode]');
    
    // Bouton de Paramètres
    document.getElementById('doli-btn-settings').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: "OPEN_OPTIONS_PAGE" });
    });
    
    toolBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            toolBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.getAttribute('data-mode');
            
            if (currentMode === 'text') {
                canvas.style.cursor = 'text';
            } else {
                canvas.style.cursor = 'crosshair';
            }
            
            // Réinitialise le compteur quand on sélectionne (ou re-sélectionne) l'outil Puce
            if (currentMode === 'sequence') {
                sequenceCounter = 1;
            }
        });
    });

    
    const colorPicker = document.getElementById('doli-color-picker');
    const widthPicker = document.getElementById('doli-line-width');
    colorPicker.value = userColor;
    widthPicker.value = userLineWidth;
    
    colorPicker.addEventListener('input', (e) => userColor = e.target.value);
    widthPicker.addEventListener('input', (e) => userLineWidth = parseInt(e.target.value, 10));

    document.getElementById('doli-btn-cancel').addEventListener('click', closeEditor);

    document.getElementById('doli-btn-validate').addEventListener('click', saveAndClose);

    // 4. Événements de la souris sur le canvas
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
}

function getMousePos(evt) {
    const rect = canvas.getBoundingClientRect();
    const logicalX = evt.clientX - rect.left;
    const logicalY = evt.clientY - rect.top;
    return {
        // Coordonnées logiques CSS (pour dessiner les div HTML par-dessus)
        logicalX: logicalX,
        logicalY: logicalY,
        // Coordonnées internes au Canvas (pour dessiner dessus et cropper)
        x: logicalX * canvas.scaleX,
        y: logicalY * canvas.scaleY
    };
}

let logicalStartX = 0, logicalStartY = 0; // Coordonnées vue CSS

function onMouseDown(e) {
    if (e.target.id === 'doli-floating-text-input') return; // Ne pas interférer avec le texte en cours de frappe

    if (currentMode === 'text') {
        e.preventDefault(); // Empêche le navigateur de refuser le focus
        const pos = getMousePos(e);
        addTextInput(pos.x, pos.y, e.clientX, e.clientY);
        return;
    }

    isDrawing = true;
    const pos = getMousePos(e);
    startX = pos.x;
    startY = pos.y;
    logicalStartX = pos.logicalX;
    logicalStartY = pos.logicalY;

    if (currentMode === 'arrow' || currentMode === 'rect' || currentMode === 'blur' || currentMode === 'sequence') {
        try {
            snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        } catch (e) {
            console.error("Erreur getImageData sur snapshot:", e);
            // Fallback pour ne pas crasher si le canvas est invalide/tainted (bien que rare en extension)
            snapshot = ctx.createImageData(Math.max(1, canvas.width), Math.max(1, canvas.height));
        }
        
        // Dessiner la puce immédiatement pour avoir un retour visuel sans glisser
        if (currentMode === 'sequence') {
            drawSequenceCircle(ctx, startX, startY, sequenceCounter);
        }
    } else if (currentMode === 'crop') {
        const rect = canvas.getBoundingClientRect();
        // Div position en pixels logiques
        cropSelectionDiv.style.left = (rect.left + logicalStartX) + 'px';
        cropSelectionDiv.style.top = (rect.top + logicalStartY) + 'px';
        cropSelectionDiv.style.width = '0px';
        cropSelectionDiv.style.height = '0px';
        cropSelectionDiv.style.display = 'block';
    } else if (currentMode === 'pencil') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.strokeStyle = userColor;
        ctx.lineWidth = userLineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }
}

function onMouseMove(e) {
    if (!isDrawing) return;
    const pos = getMousePos(e);

    if (currentMode === 'arrow') {
        // Restaure l'état avant le début du trait
        ctx.putImageData(snapshot, 0, 0);
        drawArrow(ctx, startX, startY, pos.x, pos.y);
    } else if (currentMode === 'rect') {
        ctx.putImageData(snapshot, 0, 0);
        drawRect(ctx, startX, startY, pos.x, pos.y);
    } else if (currentMode === 'blur') {
        ctx.putImageData(snapshot, 0, 0);
        
        // Prévisualisation de la zone de flou géométrique (grisé translucide)
        ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
        const w = pos.x - startX;
        const h = pos.y - startY;
        ctx.fillRect(startX, startY, w, h);
    } else if (currentMode === 'sequence') {
        ctx.putImageData(snapshot, 0, 0);
        const dx = pos.x - startX;
        const dy = pos.y - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Si on a glissé suffisament loin, on dessine une flèche
        if (distance > 20) {
            drawArrow(ctx, startX, startY, pos.x, pos.y);
        }
        // Puis le cercle par-dessus le point d'origine
        drawSequenceCircle(ctx, startX, startY, sequenceCounter);
    } else if (currentMode === 'crop') {
        const currentClientX = Math.max(0, Math.min(e.clientX, window.innerWidth));
        const currentClientY = Math.max(0, Math.min(e.clientY, window.innerHeight));
        
        const rectCanvas = canvas.getBoundingClientRect();
        
        const absStartX = rectCanvas.left + logicalStartX;
        const absStartY = rectCanvas.top + logicalStartY;

        const x = Math.min(currentClientX, absStartX);
        const y = Math.min(currentClientY, absStartY);
        const w = Math.abs(currentClientX - absStartX);
        const h = Math.abs(currentClientY - absStartY);

        cropSelectionDiv.style.left = x + 'px';
        cropSelectionDiv.style.top = y + 'px';
        cropSelectionDiv.style.width = w + 'px';
        cropSelectionDiv.style.height = h + 'px';
    } else if (currentMode === 'pencil') {
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    }
}

function onMouseUp(e) {
    if (!isDrawing) return;
    isDrawing = false;
    const pos = getMousePos(e);

    if (currentMode === 'arrow') {
        ctx.putImageData(snapshot, 0, 0);
        drawArrow(ctx, startX, startY, pos.x, pos.y);
    } else if (currentMode === 'rect') {
        ctx.putImageData(snapshot, 0, 0);
        drawRect(ctx, startX, startY, pos.x, pos.y);
    } else if (currentMode === 'blur') {
        ctx.putImageData(snapshot, 0, 0); // Enlève la prévisualisation grisée
        const w = pos.x - startX;
        const h = pos.y - startY;
        if (Math.abs(w) > 5 && Math.abs(h) > 5) {
            applyAreaBlur(ctx, startX, startY, w, h, userBlurIntensity);
        }
    } else if (currentMode === 'sequence') {
        ctx.putImageData(snapshot, 0, 0); 
        const dx = pos.x - startX;
        const dy = pos.y - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Si on a glissé, on trace la flèche
        if (distance > 20) {
            drawArrow(ctx, startX, startY, pos.x, pos.y);
        }
        // Trace le cercle par-dessus l'origine de la flèche (ou simplement clique)
        drawSequenceCircle(ctx, startX, startY, sequenceCounter);
        
        // On incrémente uniquement relâché
        sequenceCounter++;
    } else if (currentMode === 'crop') {
        cropSelectionDiv.style.display = 'none';
        
        const w = Math.abs(pos.x - startX);
        const h = Math.abs(pos.y - startY);
        const x = Math.min(pos.x, startX);
        const y = Math.min(pos.y, startY);

        if (w > 20 && h > 20) {
            applyCrop(x, y, w, h);
        }
    } else if (currentMode === 'pencil') {
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.closePath();
    }
}

function drawArrow(context, fromX, fromY, toX, toY) {
    const headlen = 15; // length of head in pixels
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    
    // Raccourcir la ligne principale pour ne pas qu'elle dépasse de la pointe (12px en arrière)
    const lineEndX = toX - 12 * Math.cos(angle);
    const lineEndY = toY - 12 * Math.sin(angle);
    
    context.beginPath();
    context.strokeStyle = userColor; // Rouge
    context.lineWidth = userLineWidth;
    context.moveTo(fromX, fromY);
    context.lineTo(lineEndX, lineEndY);
    context.stroke();
    
    // Tête de la flèche
    context.beginPath();
    context.fillStyle = userColor;
    context.moveTo(toX, toY);
    context.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    context.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    context.lineTo(toX, toY);
    context.fill();
}

function drawRect(context, fromX, fromY, toX, toY) {
    context.beginPath();
    context.strokeStyle = userColor; // Rouge
    context.lineWidth = userLineWidth;
    const w = toX - fromX;
    const h = toY - fromY;
    context.rect(fromX, fromY, w, h);
    context.stroke();
}

function drawSequenceCircle(context, x, y, number) {
    const radius = 16;
    
    // 1. Cercle rouge
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = userColor; // Rouge
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = '#c0392b'; // Rouge foncé (bordure)
    context.stroke();
    
    // 2. Texte blanc (numéro)
    context.fillStyle = '#ffffff'; // Blanc
    context.font = 'bold 16px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Léger ajustement vertical souvent nécessaire selon la police
    context.fillText(number.toString(), x, y + 1);
}

function applyAreaBlur(context, x, y, w, h, blurAmount) {
    // Rend les dimensions positives si tracé de bas en haut
    const rx = w < 0 ? x + w : x;
    const ry = h < 0 ? y + h : y;
    const rw = Math.abs(w);
    const rh = Math.abs(h);

    // Technique de pixelisation/box blur:
    // On prend l'image, on la réduit fortement puis on l'agrandit
    // (Une approche plus simple et rapide en JS qu'un vrai Gaussian Blur)
    
    // On extrait la zone
    const imageData = context.getImageData(rx, ry, rw, rh);
    
    // Canvas temporaire pour la manipulation
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = rw;
    tempCanvas.height = rh;
    const tCtx = tempCanvas.getContext('2d');
    tCtx.putImageData(imageData, 0, 0);
    
    // Applique le flou css sur le context principal...
    // Note: ctx.filter n'est pas supporté partout pour l'export. 
    // On le dessine donc offscreen :
    const blurCanvas = document.createElement('canvas');
    blurCanvas.width = rw;
    blurCanvas.height = rh;
    const bCtx = blurCanvas.getContext('2d');
    
    // Filtre natif très efficace (si supporté par le nav, sinon on pixellise)
    bCtx.filter = `blur(${blurAmount}px)`;
    bCtx.drawImage(tempCanvas, 0, 0);
    
    // Remet sur le canvas (le filtre s'applique)
    context.drawImage(blurCanvas, rx, ry);
}

function applyCrop(x, y, w, h) {
    // S'assurer qu'on travaille avec des entiers pour éviter les bugs sur certains navigateurs
    x = Math.round(x);
    y = Math.round(y);
    w = Math.max(1, Math.round(w));
    h = Math.max(1, Math.round(h));

    let croppedImage;
    try {
        croppedImage = ctx.getImageData(x, y, w, h);
    } catch (e) {
        console.error("Erreur getImageData lors du recadrage:", e);
        // Si erreur inattendue (cross-origin / dimensions), on annule le mode crop
        editorOverlay.classList.remove('doli-cropped');
        return;
    }
    
    // Le canvas prend la taille des pixels extraits, il sera géré par CSS `object-fit: contain`
    canvas.width = w;
    canvas.height = h;
    
    ctx.putImageData(croppedImage, 0, 0);
    
    // Enlève l'affichage en étirement pur et passe en mode "modal sombre"
    editorOverlay.classList.add('doli-cropped');
    
    // Nettoie les inline styles s'il y en avait
    canvas.style.width = '';
    canvas.style.height = '';
    
    // Ajuste le scale pour que dessiner ensuite soit toujours proportionnel (même si on crop, la résolution interne est 1:1 pour nous maintenant sur cette portion)
    const rect = canvas.getBoundingClientRect();
    canvas.scaleX = w / rect.width;
    canvas.scaleY = h / rect.height;

    // Bascule automatique sur l'outil Tracer après le recadrage
    const pencilBtn = document.querySelector('.doli-tool-btn[data-mode="pencil"]');
    if (pencilBtn) pencilBtn.click();
}

function addTextInput(canvasX, canvasY, clientX, clientY) {
    // Si on clique ailleurs, on valide le texte existant d'abord
    const existing = document.getElementById('doli-floating-text-input');
    if (existing) {
        existing.blur(); // déclenche l'écriture
    }

    const input = document.createElement('div');
    input.id = 'doli-floating-text-input';
    input.contentEditable = true;
    input.style.left = clientX + 'px';
    input.style.top = clientY + 'px';
    // Ajoutons un attribut placeholder via CSS ou texte par défaut (optionnel, on le garde vide pour l'instant)
    editorOverlay.appendChild(input);

    setTimeout(() => {
        input.focus();
    }, 10);

    // Isolement des frappes clavier par rapport au site hôte (ex: raccourcis)
    const stopEvent = (e) => e.stopPropagation();
    input.addEventListener('keydown', stopEvent);
    input.addEventListener('keyup', stopEvent);
    input.addEventListener('keypress', stopEvent);

    // Quand on perd le focus (clic à l'extérieur) on écrit sur le canvas et on supprime l'input
    input.addEventListener('blur', () => {
        const text = input.innerText.trim();
        if (text) {
            // Configuration de la police proportionnelle au scale du canvas
            const fontSize = Math.max(16, Math.floor(20 * Math.max(canvas.scaleX, canvas.scaleY)));
            ctx.font = 'bold ' + fontSize + 'px Arial';
            ctx.fillStyle = userColor;
            ctx.textBaseline = 'top';
            
            // Découpe multi-lignes naïve
            const lines = text.split('\n');
            let offsetY = 0;
            lines.forEach(line => {
                ctx.fillText(line, canvasX, canvasY + offsetY);
                offsetY += (fontSize * 1.2);
            });
        }
        if(input.parentNode) input.parentNode.removeChild(input);
    });
    
    // Valider sur "Entrée" sans majuscule, ou "Shift+Entrée" pour sauter une ligne
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            input.blur();
        }
    });
}

function closeEditor() {
    if (editorOverlay) {
        document.body.removeChild(editorOverlay);
        editorOverlay = null;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    }
}

function saveAndClose() {
    // Si un input texte est encore actif, on force son écriture
    const activeText = document.getElementById('doli-floating-text-input');
    if (activeText) activeText.blur();

    // EXTRACTION de l'image AVANT de détruire l'éditeur (certains navigateurs vident le buffer sinon)
    let dataUrl;
    if (userImageFormat === 'jpg') {
        dataUrl = canvas.toDataURL('image/jpeg', 0.85); // Option JPG avec 85% de qualité
    } else {
        dataUrl = canvas.toDataURL('image/png');
    }

    // Cache le curseur visuel s'il traîne, et ferme l'éditeur
    closeEditor();
    
    // Sauvegarde la capture pour le popup
    chrome.storage.local.set({ doliPendingScreenshot: dataUrl }, () => {
        // Réouvre silencieusement le popup Chrome
        chrome.runtime.sendMessage({ action: "OPEN_EXTENSION_POPUP" });
    });
}

// ==========================================
// INTÉGRATION NEXTCLOUD MAIL
// ==========================================

function injectNextcloudButton() {
    if (!window.location.href.includes('/apps/mail/box')) return;

    // Chercher tous les toggles présents
    const allActionBtns = Array.from(document.querySelectorAll('.action-item__menutoggle'));
    
    // Le focus demandé par l'utilisateur: supprimer à gauche (navigation), supprimer à droite (lecteur/éditeur)
    // Ne garder QUE la liste du milieu !
    const validBtns = allActionBtns.filter(btn => {
        // Exclure les infobulles popover
        if (btn.closest('.v-popper__wrapper')) return false;

        // 1. Exclure la barre de navigation gauche (Comptes, Dossiers)
        if (btn.closest('#app-navigation, .app-navigation, .navigation')) return false;

        // 2. Exclure le panneau principal de lecture ou d'édition (situé à droite)
        if (btn.closest('.app-content-details, .mail-message-container, .message-head, .composer, .mail-composer, .compose-message, form')) return false;

        // Ce qu'il reste est par soustraction la colonne centrale (le listing des mails)
        return true;
    });

    // Nettoyage impitoyable des anciens boutons qui auraient pu être injectés dans des zones maintenant interdites
    document.querySelectorAll('.doli-nextcloud-btn').forEach(doli => {
        const nextBtn = doli.nextElementSibling;
        if (!nextBtn || !validBtns.includes(nextBtn)) {
            doli.remove();
        }
    });

    validBtns.forEach(btn => {
        const parent = btn.parentElement;
        if (!parent) return;

        const existingDoli = parent.querySelector('.doli-nextcloud-btn');
        if (existingDoli) return;

        const doliContainer = document.createElement('div');
        doliContainer.className = 'doli-nextcloud-btn doli-dropdown-container';
        doliContainer.style.position = 'relative';
        doliContainer.style.display = 'inline-block';
        doliContainer.style.marginRight = '8px';

        // Bouton principal (déclencheur du menu)
        const mainBtn = document.createElement('button');
        mainBtn.className = 'button-vue button-vue--size-normal'; // Enlevé vue-tertiary pour controler le fond
        mainBtn.style.display = 'inline-flex';
        mainBtn.style.alignItems = 'center';
        mainBtn.style.gap = '6px';
        mainBtn.style.padding = '0 16px'; // Un peu plus de padding horizontal pour la pilule
        mainBtn.style.backgroundColor = '#0d8aff'; // Couleur de fond DigiRisk
        mainBtn.style.color = '#ffffff'; // Texte blanc
        mainBtn.style.borderRadius = '20px'; // Cadre très arrondi (style pilule)
        mainBtn.style.border = 'none';
        mainBtn.style.fontWeight = 'bold';
        mainBtn.style.transition = 'transform 0.1s, opacity 0.2s';
        mainBtn.title = "Actions DigiRisk";
        
        mainBtn.addEventListener('mouseenter', () => mainBtn.style.opacity = '0.9');
        mainBtn.addEventListener('mouseleave', () => mainBtn.style.opacity = '1');
        mainBtn.addEventListener('mousedown', () => mainBtn.style.transform = 'scale(0.95)');
        mainBtn.addEventListener('mouseup', () => mainBtn.style.transform = 'scale(1)');
        
        // SVG / Icon enlevé selon demande
        mainBtn.textContent = '';
        const wrapper = document.createElement('span');
        wrapper.className = 'button-vue__wrapper';
        const textSpan = document.createElement('span');
        textSpan.className = 'button-vue__text';
        textSpan.style.color = '#ffffff';
        textSpan.textContent = 'DigiRisk ▼';
        wrapper.appendChild(textSpan);
        mainBtn.appendChild(wrapper);

        // Le menu déroulant
        const dropdown = document.createElement('div');
        dropdown.className = 'doli-dropdown-menu';
        dropdown.style.display = 'none';
        dropdown.style.position = 'absolute';
        dropdown.style.top = '100%';
        dropdown.style.left = '0';
        dropdown.style.backgroundColor = 'white';
        dropdown.style.border = '1px solid #ddd';
        dropdown.style.borderRadius = '4px';
        dropdown.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        dropdown.style.zIndex = '1000';
        dropdown.style.padding = '4px';
        // Format the dropdown internal layout as side-by-side icons
        dropdown.style.flexDirection = 'row';
        dropdown.style.gap = '4px';
        
        const actionStyle = `
            padding: 8px 12px;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 4px;
            transition: background-color 0.2s;
        `;

        // L'action: Créer une Opportunité (Icône partage comme mockup utilisateur)
        const oppAction = document.createElement('div');
        oppAction.style.cssText = actionStyle;
        oppAction.title = 'Créer une Opportunité';
        oppAction.textContent = '';
        oppAction.appendChild(createSvgIcon('opp', 20));
        oppAction.addEventListener('mouseenter', () => oppAction.style.backgroundColor = '#f1f5f9');
        oppAction.addEventListener('mouseleave', () => oppAction.style.backgroundColor = 'transparent');
        oppAction.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation(); dropdown.style.display = 'none';
            extractAndOpenEntity('opportunite', btn);
        });

        // L'action: Créer un ticket
        const ticketAction = document.createElement('div');
        ticketAction.style.cssText = actionStyle;
        ticketAction.title = 'Créer un Ticket';
        ticketAction.textContent = '';
        ticketAction.appendChild(createSvgIcon('ticket', 20));
        ticketAction.addEventListener('mouseenter', () => ticketAction.style.backgroundColor = '#f1f5f9');
        ticketAction.addEventListener('mouseleave', () => ticketAction.style.backgroundColor = 'transparent');
        ticketAction.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation(); dropdown.style.display = 'none';
            extractAndOpenEntity('ticket', btn);
        });

        // Toggle simple du menu
        mainBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'none' ? 'flex' : 'none';
        });

        // Fermer le menu si on clique ailleurs dans la page
        document.addEventListener('click', (e) => {
            if (!doliContainer.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });

        // Assemblage

        dropdown.appendChild(ticketAction);
        doliContainer.appendChild(mainBtn);
        doliContainer.appendChild(dropdown);

        // Insère le conteneur juste avant le bouton "Actions"
        parent.insertBefore(doliContainer, btn);
    });
}

function extractAndOpenEntity(activeTab, triggerBtn) {
    let subject = "";
    let message = "";

    // 1. Si déclenché depuis un bouton dans le listing, on extrait d'abord le texte de la ligne correspondante
    if (triggerBtn) {
        const listItem = triggerBtn.closest('li, .app-content-list-item, .list-item, .envelope');
        if (listItem) {
            const subjectEl = listItem.querySelector('.app-content-list-item-line-one, .title, .subject, .envelope__subject');
            if (subjectEl) subject = subjectEl.innerText.trim();

            const previewEl = listItem.querySelector('.app-content-list-item-line-two, .preview, .envelope__preview, .subtitle');
            if (previewEl) message = previewEl.innerText.trim();
        }
    }

    // 2. Fallbacks de vue principale (au cas où, mais moins utilisé maintenant que le bouton est juste dans la liste)
    if (!subject) {
        const selectors = [
            '#mail-thread-header-fields h2',
            '#mail-thread-header h2',
            '.message-head__subject',
            '.thread-message__subject',
            'h1.message-subject',
            '.envelope__subject',
            '.subject'
        ];
        
        let subjectEl = null;
        for (const sel of selectors) {
            subjectEl = document.querySelector(sel);
            if (subjectEl) break;
        }

        if (subjectEl) {
            subject = subjectEl.innerText.trim();
        } else {
            const altSubject = document.querySelector('.app-content-list-item.active .app-content-list-item-line-one, .mail-message-header .title');
            if (altSubject) subject = altSubject.innerText.trim();
        }
    }

    // 2. Extraction du corps (parfois iframe texte riche, ou div text brut)
    const iframe = document.querySelector('iframe.message-frame, iframe[title="Message"], iframe.message-body__html');
    if (iframe && iframe.contentDocument) {
        message = iframe.contentDocument.body.innerText.trim();
    } else {
        const bodyEl = document.querySelector('.message-body__content, .message-body, .message__body, .mail-message-body');
        if (bodyEl) {
            message = bodyEl.innerText.trim();
        }
    }

    const defaultSubject = activeTab === 'opportunite' ? 'Nouvelle opp. depuis Nextcloud' : 'Nouveau ticket depuis Nextcloud';

    // Sauvegarde en local pour que le popup le récupère et s'ouvre
    chrome.storage.local.set({ 
        doliActiveTab: activeTab,
        doliPrefillSubject: subject || defaultSubject,
        doliPrefillMessage: message || 'Contenu de l\'e-mail introuvable. Veuillez copier/coller le texte ici.'
    }, () => {
        chrome.runtime.sendMessage({ action: "OPEN_EXTENSION_POPUP" });
    });
}

// ==========================================
// INTÉGRATION GMAIL
// ==========================================

function injectGmailButton() {
    if (!window.location.href.includes('mail.google.com')) return;

    // Gmail utilise des sélecteurs ARIA robustes. L'action bar au survol est un [role="toolbar"]
    const rows = document.querySelectorAll('tr[role="row"]');
    
    rows.forEach(row => {
        const toolbar = row.querySelector('[role="toolbar"]');
        if (!toolbar) return; // Si la ligne n'a pas sa barre d'actions visible/génerée
        
        // On s'assure de ne pas l'ajouter deux fois
        if (toolbar.querySelector('.doli-gmail-btn')) return;

        // Container global sous forme de tag <li>
        const doliContainer = document.createElement('li');
        doliContainer.className = 'doli-gmail-btn doli-dropdown-container';
        doliContainer.style.position = 'relative';
        doliContainer.style.display = 'flex';
        doliContainer.style.alignItems = 'center';
        doliContainer.style.marginRight = '10px';
        doliContainer.style.zIndex = '100';

        // Bouton principal "DigiRisk"
        const mainBtn = document.createElement('button');
        mainBtn.style.display = 'inline-flex';
        mainBtn.style.alignItems = 'center';
        mainBtn.style.justifyContent = 'center';
        mainBtn.style.gap = '6px';
        mainBtn.style.padding = '0 10px';
        mainBtn.style.backgroundColor = '#084B54'; 
        mainBtn.style.color = '#ffffff'; 
        mainBtn.style.borderRadius = '20px'; 
        mainBtn.style.border = 'none';
        mainBtn.style.fontWeight = '600';
        mainBtn.style.fontSize = '12px';
        mainBtn.style.cursor = 'pointer';
        mainBtn.style.height = '24px'; 
        mainBtn.style.minHeight = '24px'; 
        mainBtn.title = "Actions DigiRisk";
        
        mainBtn.addEventListener('mouseenter', () => mainBtn.style.opacity = '0.9');
        mainBtn.addEventListener('mouseleave', () => mainBtn.style.opacity = '1');
        mainBtn.textContent = '';
        const span = document.createElement('span');
        span.style.color = '#ffffff';
        span.textContent = 'DigiRisk ▼';
        mainBtn.appendChild(span);

        // Menu déroulant
        const dropdown = document.createElement('div');
        dropdown.className = 'doli-dropdown-menu';
        dropdown.style.display = 'none';
        dropdown.style.position = 'absolute';
        dropdown.style.top = '100%';
        dropdown.style.right = '0'; // Positionnement vers la gauche
        dropdown.style.backgroundColor = 'white';
        dropdown.style.border = '1px solid #ddd';
        dropdown.style.borderRadius = '4px';
        dropdown.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        dropdown.style.padding = '4px';
        dropdown.style.flexDirection = 'row';
        dropdown.style.gap = '4px';
        dropdown.style.marginTop = '4px';
        
        const actionStyle = `
            padding: 8px 12px;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 4px;
            transition: background-color 0.2s;
        `;

        // Action: Créer Opportunité
        const oppAction = document.createElement('div');
        oppAction.style.cssText = actionStyle;
        oppAction.title = 'Créer une Opportunité';
        oppAction.textContent = '';
        oppAction.appendChild(createSvgIcon('opp', 20));
        oppAction.addEventListener('mouseenter', () => oppAction.style.backgroundColor = '#f1f5f9');
        oppAction.addEventListener('mouseleave', () => oppAction.style.backgroundColor = 'transparent');
        oppAction.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation(); dropdown.style.display = 'none';
            extractAndOpenGmailEntity('opportunite', row);
        });

        // Action: Créer Ticket
        const ticketAction = document.createElement('div');
        ticketAction.style.cssText = actionStyle;
        ticketAction.title = 'Créer un Ticket';
        ticketAction.textContent = '';
        ticketAction.appendChild(createSvgIcon('ticket', 20));
        ticketAction.addEventListener('mouseenter', () => ticketAction.style.backgroundColor = '#f1f5f9');
        ticketAction.addEventListener('mouseleave', () => ticketAction.style.backgroundColor = 'transparent');
        ticketAction.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation(); dropdown.style.display = 'none';
            extractAndOpenGmailEntity('ticket', row);
        });

        // Event Toggle Dropdown
        mainBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'none' ? 'flex' : 'none';
        });

        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
            if (!doliContainer.contains(e.target)) dropdown.style.display = 'none';
        });

        // DOM Appends

        dropdown.appendChild(ticketAction);
        doliContainer.appendChild(mainBtn);
        doliContainer.appendChild(dropdown);

        // Inject as FIRST item in toolbar so standard Gmail actions persist on right
        toolbar.insertBefore(doliContainer, toolbar.firstChild);
    });
}

function extractAndOpenGmailEntity(activeTab, row) {
    let subject = "";
    let message = "";

    if (row) {
        // Extraction native Gmail du Sujet
        const subjectEl = row.querySelector('.bog, .bqe, [data-thread-id]');
        if (subjectEl) subject = subjectEl.innerText.trim();

        // Extraction native Gmail du Snippet/Aperçu
        const snippetEl = row.querySelector('.y2');
        if (snippetEl) {
            message = snippetEl.innerText.replace(/^-/, '').trim();
        }
    }

    const defaultSubject = activeTab === 'opportunite' ? 'Nouvelle opp. depuis Gmail' : 'Nouveau ticket depuis Gmail';

    chrome.storage.local.set({ 
        doliActiveTab: activeTab,
        doliPrefillSubject: subject || defaultSubject,
        doliPrefillMessage: message || 'Aperçu indisponible. Veuillez détailler.'
    }, () => {
        chrome.runtime.sendMessage({ action: "OPEN_EXTENSION_POPUP" });
    });
}

function injectGmailReadButton() {
    if (!window.location.href.includes('mail.google.com')) return;

    // Détection d'un email ouvert via le titre principal
    const subjectEl = document.querySelector('h2.hP');
    if (!subjectEl) return;

    // Cibler la barre d'action de l'en-tête du message courant (Date, Etoile, Répondre)
    let toolbar = null;
    // .gK est la classe native Gmail pour cet emplacement (en haut à droite du message individuel)
    const gkElements = document.querySelectorAll('.gK');
    if (gkElements.length > 0) {
        // Prendre le dernier message ouvert dans le fil (celui avec lequel on interagit)
        toolbar = gkElements[gkElements.length - 1];
    } else {
        // Fallback sécurisé : chercher la petite flèche répondre de l'en-tête
        const headerActions = document.querySelectorAll('div[data-tooltip="Répondre"], div[data-tooltip="Reply"], div[aria-label="Répondre"], div[aria-label="Reply"]');
        for (let i = headerActions.length - 1; i >= 0; i--) {
            const btn = headerActions[i];
            // S'assurer qu'il s'agit du petit icône d'action en-tête et non du gros bouton bas
            if (btn.offsetHeight > 0 && btn.offsetHeight < 30) {
                let parent = btn.parentElement;
                while (parent && parent !== document.body) {
                    const style = window.getComputedStyle(parent);
                    if (style.display === 'flex' || style.display === 'inline-flex') {
                        toolbar = parent;
                        break;
                    }
                    parent = parent.parentElement;
                }
                if (toolbar) break;
            }
        }
    }

    if (!toolbar) return; // Sécurité si conteneur non trouvé


    if (toolbar.querySelector('.doli-gmail-read-btn')) return;

    const doliContainer = document.createElement('div');
    doliContainer.className = 'doli-gmail-read-btn doli-dropdown-container';
    doliContainer.style.position = 'relative';
    doliContainer.style.display = 'inline-flex';
    doliContainer.style.alignItems = 'center';
    doliContainer.style.marginRight = '15px';
    doliContainer.style.zIndex = '100';

    const mainBtn = document.createElement('button');
    mainBtn.style.display = 'inline-flex';
    mainBtn.style.alignItems = 'center';
    mainBtn.style.justifyContent = 'center';
    mainBtn.style.gap = '6px';
    mainBtn.style.padding = '0 10px';
    mainBtn.style.backgroundColor = '#084B54'; 
    mainBtn.style.color = '#ffffff'; 
    mainBtn.style.borderRadius = '20px'; 
    mainBtn.style.border = 'none';
    mainBtn.style.fontWeight = '600';
    mainBtn.style.fontSize = '12px';
    mainBtn.style.cursor = 'pointer';
    mainBtn.style.height = '24px'; 
    mainBtn.style.minHeight = '24px'; 
    mainBtn.title = "Actions globales DigiRisk";
    
    mainBtn.addEventListener('mouseenter', () => mainBtn.style.opacity = '0.9');
    mainBtn.addEventListener('mouseleave', () => mainBtn.style.opacity = '1');
    mainBtn.textContent = '';
        const span = document.createElement('span');
        span.style.color = '#ffffff';
        span.textContent = 'DigiRisk ▼';
        mainBtn.appendChild(span);

    const dropdown = document.createElement('div');
    dropdown.className = 'doli-dropdown-menu';
    dropdown.style.display = 'none';
    dropdown.style.position = 'absolute';
    dropdown.style.top = '100%';
    dropdown.style.right = '0';
    dropdown.style.backgroundColor = 'white';
    dropdown.style.border = '1px solid #ddd';
    dropdown.style.borderRadius = '4px';
    dropdown.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    dropdown.style.padding = '4px';
    dropdown.style.flexDirection = 'row';
    dropdown.style.gap = '4px';
    dropdown.style.marginTop = '4px';
    
    const actionStyle = `
        padding: 8px 12px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 4px;
        transition: background-color 0.2s;
    `;

    const oppAction = document.createElement('div');
    oppAction.style.cssText = actionStyle;
    oppAction.title = 'Créer une Opportunité depuis ce fil';
    oppAction.textContent = '';
        oppAction.appendChild(createSvgIcon('opp', 20));
    oppAction.addEventListener('mouseenter', () => oppAction.style.backgroundColor = '#f1f5f9');
    oppAction.addEventListener('mouseleave', () => oppAction.style.backgroundColor = 'transparent');
    oppAction.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation(); dropdown.style.display = 'none';
        extractAndOpenGmailReadEntity('opportunite');
    });

    const ticketAction = document.createElement('div');
    ticketAction.style.cssText = actionStyle;
    ticketAction.title = 'Créer un Ticket depuis ce fil';
    ticketAction.textContent = '';
        ticketAction.appendChild(createSvgIcon('ticket', 20));
    ticketAction.addEventListener('mouseenter', () => ticketAction.style.backgroundColor = '#f1f5f9');
    ticketAction.addEventListener('mouseleave', () => ticketAction.style.backgroundColor = 'transparent');
    ticketAction.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation(); dropdown.style.display = 'none';
        extractAndOpenGmailReadEntity('ticket');
    });

    mainBtn.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        dropdown.style.display = dropdown.style.display === 'none' ? 'flex' : 'none';
    });
    document.addEventListener('click', (e) => {
        if (!doliContainer.contains(e.target)) dropdown.style.display = 'none';
    });


    dropdown.appendChild(ticketAction);
    doliContainer.appendChild(mainBtn);
    doliContainer.appendChild(dropdown);

    toolbar.insertBefore(doliContainer, toolbar.firstChild);
}

function extractAndOpenGmailReadEntity(activeTab) {
    let subject = "";
    let message = "";

    const subjectEl = document.querySelector('h2.hP');
    if (subjectEl) subject = subjectEl.innerText.trim();

    // Rapatrier le corps du dernier message du fil
    const messageEls = document.querySelectorAll('.a3s');
    if (messageEls.length > 0) {
        // Le dernier élément visible .a3s correspond souvent au message en cours de lecture
        const lastMsg = Array.from(messageEls).filter(el => el.offsetParent !== null).pop();
        if (lastMsg) message = lastMsg.innerText.trim();
    }

    const defaultSubject = activeTab === 'opportunite' ? 'Nouvelle opp. depuis Gmail' : 'Nouveau ticket depuis Gmail';

    chrome.storage.local.set({ 
        doliActiveTab: activeTab,
        doliPrefillSubject: subject || defaultSubject,
        doliPrefillMessage: message || ''
    }, () => {
        chrome.runtime.sendMessage({ action: "OPEN_EXTENSION_POPUP" });
    });
}

function injectOutlookButton() { /* Omitté car instable, remplace par readButton */ }
function injectOutlookReadButton() {
    if (!window.location.href.includes('outlook.live.com') && !window.location.href.includes('outlook.office.com') && !window.location.href.includes('outlook.office365.com')) return;

    const toolbars = document.querySelectorAll('.fui-Toolbar, [role="toolbar"]');
    
    toolbars.forEach(toolbar => {
        if (toolbar.querySelector('.doli-outlook-read-btn')) return;

        // La vérification via innerHTML permet de contourner les balises exotiques, les divs, spans, titles, ou aria-labels
        const htmlContent = toolbar.innerHTML.toLowerCase();
        const isMailToolbar = htmlContent.includes('répondre') || htmlContent.includes('reply') || 
                              htmlContent.includes('transférer') || htmlContent.includes('forward');
                              
        if (!isMailToolbar) return;

        const doliContainer = document.createElement('div');
        doliContainer.className = 'doli-outlook-read-btn doli-dropdown-container';
    
    doliContainer.style.position = 'relative';
    doliContainer.style.display = 'inline-flex';
    doliContainer.style.alignItems = 'center';
    doliContainer.style.marginRight = '8px';
    doliContainer.style.zIndex = '50';

    const mainBtn = document.createElement('button');
    mainBtn.style.display = 'inline-flex';
    mainBtn.style.alignItems = 'center';
    mainBtn.style.justifyContent = 'space-between';
    mainBtn.style.padding = '0 10px';
    mainBtn.style.width = '95px'; 
    mainBtn.style.flexShrink = '0';
    mainBtn.style.backgroundColor = '#084B54'; 
    mainBtn.style.color = '#ffffff'; 
    mainBtn.style.borderRadius = '10px'; 
    mainBtn.style.border = 'none';
    mainBtn.style.fontWeight = '600';
    mainBtn.style.fontSize = '11px';
    mainBtn.style.cursor = 'pointer';
    mainBtn.style.height = '24px'; 
    mainBtn.style.minHeight = '24px'; 
    mainBtn.style.whiteSpace = 'nowrap';
    mainBtn.title = "Actions DigiRisk";
    
    mainBtn.addEventListener('mouseenter', () => mainBtn.style.opacity = '0.9');
    mainBtn.addEventListener('mouseleave', () => mainBtn.style.opacity = '1');
    mainBtn.textContent = '';
    const span1 = document.createElement('span');
    span1.style.color = '#ffffff';
    span1.textContent = 'DigiRisk';
    const span2 = document.createElement('span');
    span2.style.color = '#ffffff';
    span2.style.fontSize = '8px';
    span2.style.marginTop = '1px';
    span2.textContent = '▼';
    mainBtn.appendChild(span1);
    mainBtn.appendChild(span2);

    const dropdown = document.createElement('div');
    dropdown.className = 'doli-dropdown-menu';
    dropdown.style.display = 'none';
    dropdown.style.position = 'absolute';
    dropdown.style.top = '100%';
    dropdown.style.right = '0';
    dropdown.style.backgroundColor = 'white';
    dropdown.style.border = '1px solid #ddd';
    dropdown.style.borderRadius = '4px';
    dropdown.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    dropdown.style.padding = '4px';
    dropdown.style.flexDirection = 'column';
    dropdown.style.gap = '4px';
    dropdown.style.marginTop = '4px';
    
    const actionStyle = `
        padding: 8px 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        border-radius: 4px;
        font-size: 13px;
        color: #333;
        white-space: nowrap;
        transition: background-color 0.2s;
    `;

    const oppAction = document.createElement('div');
    oppAction.style.cssText = actionStyle;
    oppAction.title = 'Créer une Opportunité depuis ce mail';
    oppAction.textContent = '';
    oppAction.appendChild(createSvgIcon('opp', 16));
    oppAction.appendChild(document.createTextNode(' Opportunité'));
    oppAction.addEventListener('mouseenter', () => oppAction.style.backgroundColor = '#f1f5f9');
    oppAction.addEventListener('mouseleave', () => oppAction.style.backgroundColor = 'transparent');
    
    const handleOpp = (e) => {
        e.preventDefault(); e.stopPropagation(); dropdown.style.display = 'none';
        extractAndOpenOutlookReadEntity('opportunite');
    };
    oppAction.addEventListener('click', handleOpp);

    const ticketAction = document.createElement('div');
    ticketAction.style.cssText = actionStyle;
    ticketAction.title = 'Créer un Ticket depuis ce mail';
    ticketAction.textContent = '';
    ticketAction.appendChild(createSvgIcon('ticket', 16));
    ticketAction.appendChild(document.createTextNode(' Ticket'));
    ticketAction.addEventListener('mouseenter', () => ticketAction.style.backgroundColor = '#f1f5f9');
    ticketAction.addEventListener('mouseleave', () => ticketAction.style.backgroundColor = 'transparent');
    
    const handleTicket = (e) => {
        e.preventDefault(); e.stopPropagation(); dropdown.style.display = 'none';
        extractAndOpenOutlookReadEntity('ticket');
    };
    ticketAction.addEventListener('click', handleTicket);

    const handleMain = (e) => {
        e.preventDefault(); e.stopPropagation();
        document.querySelectorAll('.doli-dropdown-menu').forEach(el => {
            if (el !== dropdown) el.style.display = 'none';
        });
        dropdown.style.display = dropdown.style.display === 'none' ? 'flex' : 'none';
    };
    mainBtn.addEventListener('click', handleMain);
    
    document.addEventListener('click', (e) => {
        if (!doliContainer.contains(e.target)) dropdown.style.display = 'none';
    });


    dropdown.appendChild(ticketAction);
    doliContainer.appendChild(mainBtn);
    doliContainer.appendChild(dropdown);

        // Insertion juste avent la toolbar
        toolbar.insertBefore(doliContainer, toolbar.firstChild);
    });
}

function extractAndOpenOutlookReadEntity(activeTab) {
    let subject = "";
    let message = "";

    if (document.title) {
        subject = document.title.split(' - ')[0];
    }
    
    const bodyElement = document.querySelector('div[aria-label="Corps du message"], div[aria-label="Message body"]');
    if (bodyElement) {
        message = bodyElement.innerText.substring(0, 500);
    } else {
        message = "Corps de l'e-mail non lisible directement.";
    }

    const defaultSubject = activeTab === 'opportunite' ? 'Nouvelle opp. Outlook' : 'Nouveau ticket Outlook';

    chrome.storage.local.set({ 
        doliActiveTab: activeTab,
        doliPrefillSubject: subject || defaultSubject,
        doliPrefillMessage: message
    }, () => {
        chrome.runtime.sendMessage({ action: "OPEN_EXTENSION_POPUP" });
    });
}

let cachedIsRoundcube = null;
function isRoundcube() {
    if (cachedIsRoundcube !== null) return cachedIsRoundcube;

    let hasCookie = false;
    if (window.origin !== 'null') {
        try {
            hasCookie = document.cookie && document.cookie.toLowerCase().includes('roundcube');
        } catch (e) {
            // Ignore SecurityError in sandboxed environments
        }
    }

    // Liste de sélecteurs stricts prouvant qu'on est sur une interface type Webmail/Roundcube
    cachedIsRoundcube = !!document.getElementById('rcmApp') || 
           !!document.getElementById('messagetoolbar') ||
           !!document.querySelector('meta[content*="Roundcube"]') ||
           !!document.querySelector('body.task-mail') ||
           !!document.querySelector('input[name="_task"][value="mail"]') ||
           hasCookie;

    return cachedIsRoundcube;
}

function injectRoundcubeReadButton() {
    if (!isRoundcube()) return;

    // Cibler spécifiquement le conteneur du message (pas le header global de l'interface Eoxia)
    let targetHeader = document.querySelector('#message-header') || document.querySelector('.message-headers');
    
    if (!targetHeader) {
        const candidates = document.querySelectorAll('h2.subject, div.header, div.header-title');
        // Prendre le DOM le plus bas (le dernier de la liste) pour ignorer le "div.header" global du haut de page
        for (let i = candidates.length - 1; i >= 0; i--) {
            if (candidates.length > 1 && i === 0 && candidates[i].tagName === 'DIV') continue; // S'il y on a plusieurs, le premier est fatalement le menu supérieur
            targetHeader = candidates[i];
            break;
        }
    }
    
    if (!targetHeader) {
        return;
    }
    
    if (targetHeader.querySelector('.doli-roundcube-read-btn')) {
        return; // Déjà injecté
    }

    console.log("🛈 Doli-DigiRisk: Roundcube validé. Bouton accroché avec succès sur le conteneur: ", targetHeader);

    // On englobe le doliContainer
    const doliContainer = document.createElement('span');
    doliContainer.className = 'doli-roundcube-read-btn doli-dropdown-container';
    doliContainer.style.position = 'relative';
    doliContainer.style.display = 'inline-flex';
    doliContainer.style.alignItems = 'center';
    doliContainer.style.margin = '0 0 10px 15px';
    doliContainer.style.cssFloat = 'right'; 
    doliContainer.style.verticalAlign = 'middle';

    const mainBtn = document.createElement('button');
    mainBtn.style.display = 'inline-flex';
    mainBtn.style.alignItems = 'center';
    mainBtn.style.justifyContent = 'space-between';
    mainBtn.style.padding = '0 10px';
    mainBtn.style.width = '95px'; 
    mainBtn.style.flexShrink = '0';
    mainBtn.style.backgroundColor = '#084B54'; 
    mainBtn.style.color = '#ffffff'; 
    mainBtn.style.borderRadius = '10px'; 
    mainBtn.style.border = 'none';
    mainBtn.style.fontWeight = '600';
    mainBtn.style.fontSize = '11px';
    mainBtn.style.cursor = 'pointer';
    mainBtn.style.height = '24px'; 
    mainBtn.style.minHeight = '24px'; 
    mainBtn.style.whiteSpace = 'nowrap';
    mainBtn.title = "Actions DigiRisk";
    
    mainBtn.addEventListener('mouseenter', () => mainBtn.style.opacity = '0.9');
    mainBtn.addEventListener('mouseleave', () => mainBtn.style.opacity = '1');
    mainBtn.textContent = '';
    const span1 = document.createElement('span');
    span1.style.color = '#ffffff';
    span1.textContent = 'DigiRisk';
    const span2 = document.createElement('span');
    span2.style.color = '#ffffff';
    span2.style.fontSize = '8px';
    span2.style.marginTop = '1px';
    span2.textContent = '▼';
    mainBtn.appendChild(span1);
    mainBtn.appendChild(span2);

    const dropdown = document.createElement('div');
    dropdown.className = 'doli-dropdown-menu';
    dropdown.style.display = 'none';
    dropdown.style.position = 'absolute';
    dropdown.style.zIndex = '2147483647'; // Maximum absolu
    dropdown.style.backgroundColor = 'white';
    dropdown.style.border = '1px solid #ddd';
    dropdown.style.borderRadius = '4px';
    dropdown.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    dropdown.style.padding = '4px';
    dropdown.style.flexDirection = 'column';
    dropdown.style.gap = '4px';
    dropdown.style.minWidth = '140px';
    
    const actionStyle = `
        padding: 8px 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        border-radius: 4px;
        font-size: 13px;
        color: #333;
        white-space: nowrap;
        transition: background-color 0.2s;
    `;

    const oppAction = document.createElement('div');
    oppAction.style.cssText = actionStyle;
    oppAction.title = 'Créer une Opportunité depuis ce mail';
    oppAction.textContent = '';
    oppAction.appendChild(createSvgIcon('opp', 16));
    oppAction.appendChild(document.createTextNode(' Opportunité'));
    oppAction.addEventListener('mouseenter', () => oppAction.style.backgroundColor = '#f1f5f9');
    oppAction.addEventListener('mouseleave', () => oppAction.style.backgroundColor = 'transparent');
    
    const handleOpp = (e) => {
        e.preventDefault(); e.stopPropagation(); dropdown.style.display = 'none';
        extractAndOpenRoundcubeReadEntity('opportunite');
    };
    oppAction.addEventListener('mousedown', handleOpp);
    oppAction.addEventListener('click', handleOpp);

    const ticketAction = document.createElement('div');
    ticketAction.style.cssText = actionStyle;
    ticketAction.title = 'Créer un Ticket depuis ce mail';
    ticketAction.textContent = '';
    ticketAction.appendChild(createSvgIcon('ticket', 16));
    ticketAction.appendChild(document.createTextNode(' Ticket'));
    ticketAction.addEventListener('mouseenter', () => ticketAction.style.backgroundColor = '#f1f5f9');
    ticketAction.addEventListener('mouseleave', () => ticketAction.style.backgroundColor = 'transparent');
    
    const handleTicket = (e) => {
        e.preventDefault(); e.stopPropagation(); dropdown.style.display = 'none';
        extractAndOpenRoundcubeReadEntity('ticket');
    };
    ticketAction.addEventListener('mousedown', handleTicket);
    ticketAction.addEventListener('click', handleTicket);

    const handleMain = (e) => {
        e.preventDefault(); e.stopPropagation();
        
        // Anti-double toggle
        const now = Date.now();
        if (mainBtn.dataset.lastToggle && (now - parseInt(mainBtn.dataset.lastToggle)) < 150) return;
        mainBtn.dataset.lastToggle = now.toString();
        
        document.querySelectorAll('.doli-dropdown-menu').forEach(el => {
            if (el !== dropdown) el.style.display = 'none';
        });
        
        if (dropdown.style.display === 'none') {
            // Positionnement dynamique absolu pour casser les overflow:hidden
            const rect = mainBtn.getBoundingClientRect();
            dropdown.style.top = (rect.bottom + window.scrollY + 4) + 'px';
            // Alignement par la droite pour éviter les débordements d'écran
            dropdown.style.left = (rect.right + window.scrollX - 140) + 'px'; 
            dropdown.style.display = 'flex';
        } else {
            dropdown.style.display = 'none';
        }
    };
    mainBtn.addEventListener('mousedown', handleMain);
    mainBtn.addEventListener('click', handleMain);
    
    document.addEventListener('mousedown', (e) => {
        if (!mainBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
    
    // Fermer le menu lors du défilement pour qu'il ne reste pas détaché du bouton
    window.addEventListener('scroll', () => {
        if (dropdown.style.display !== 'none') dropdown.style.display = 'none';
    }, true);


    dropdown.appendChild(ticketAction);
    
    // Extrêmement important : on attache le menu au BODY de la page, et pas au bouton !
    // Cela empêche totalement le menu d'être masqué par un "overflow: hidden" du mail.
    document.body.appendChild(dropdown);
    
    doliContainer.appendChild(mainBtn);
    targetHeader.insertBefore(doliContainer, targetHeader.firstChild);
}

function extractAndOpenRoundcubeReadEntity(activeTab) {
    let subject = "";
    let message = "";

    // Trouver le bloc qui contient le titre en évitant le header global
    let subjectEl = document.querySelector('#message-header') || document.querySelector('.message-headers');
    if (!subjectEl) {
        const candidates = document.querySelectorAll('h2.subject, .subject, div.header, div.header-title');
        for (let i = candidates.length - 1; i >= 0; i--) {
            if (candidates.length > 1 && i === 0 && candidates[i].tagName === 'DIV') continue;
            subjectEl = candidates[i];
            break;
        }
    }

    if (subjectEl) {
        const clone = subjectEl.cloneNode(true);
        const btn = clone.querySelector('.doli-roundcube-read-btn');
        if (btn) btn.remove();
        
        // Extraire de préférence dans un heading, sinon prendre la première ligne
        const heading = clone.querySelector('h1, h2, h3, .subject, .title');
        if (heading) {
            subject = heading.innerText.trim();
        } else {
            const lines = clone.innerText.trim().split('\n').filter(l => l.trim().length > 0);
            if (lines.length > 0) subject = lines[0].trim();
        }
    } else if (document.title) {
        subject = document.title.split('::')[0].trim();
    }
    
    // Le corps est soit dans un iFrame (#messagecontframe), soit dans une div
    try {
        const bodyFrame = document.getElementById('messagecontframe') || document.querySelector('iframe[name="messagecontframe"]');
        if (bodyFrame && bodyFrame.contentDocument) {
            const bodyContent = bodyFrame.contentDocument.body;
            if (bodyContent) message = bodyContent.innerText.trim().substring(0, 500);
        } 
    } catch (e) {
        console.warn("Doli-DigiRisk: accès iFrame restreint par la politique CORS locale.");
    }
    
    if (!message || message.length < 5) {
        const bodyElement = document.getElementById('messagebody') || document.querySelector('.message-part') || document.querySelector('.message-htmlpart');
        if (bodyElement) {
            message = bodyElement.innerText.trim().substring(0, 500);
        }
    }

    if (!message) {
        message = "Corps de l'e-mail non lisible (accès iFrame bloqué).";
    }

    const defaultSubject = activeTab === 'opportunite' ? 'Nouvelle opp. Roundcube' : 'Nouveau ticket Roundcube';

    chrome.storage.local.set({ 
        doliActiveTab: activeTab,
        doliPrefillSubject: subject || defaultSubject,
        doliPrefillMessage: message
    }, () => {
        chrome.runtime.sendMessage({ action: "OPEN_EXTENSION_POPUP" });
    });
}

// Observer DOM unifié (multisites)
const mailObserver = new MutationObserver(() => {
    const url = window.location.href;
    if (url.includes('/apps/mail/box')) {
        injectNextcloudButton();
    } else if (url.includes('mail.google.com')) {
        injectGmailButton();
        injectGmailReadButton();
    } else if (url.includes('outlook.live.com') || url.includes('outlook.office.com') || url.includes('outlook.office365.com')) {
        injectOutlookReadButton();
    } else if (isRoundcube()) {
        injectRoundcubeReadButton();
    }
});
mailObserver.observe(document.body, { childList: true, subtree: true });

// Lancement initial
setTimeout(() => {
    const url = window.location.href;
    if (url.includes('/apps/mail/box')) injectNextcloudButton();
    else if (url.includes('mail.google.com')) {
        injectGmailButton();
        injectGmailReadButton();
    } else if (url.includes('outlook.live.com') || url.includes('outlook.office.com') || url.includes('outlook.office365.com')) {
        injectOutlookReadButton();
    } else if (isRoundcube()) {
        injectRoundcubeReadButton();
    }
}, 1500);
