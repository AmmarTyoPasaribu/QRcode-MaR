/**
 * QR Code MaR — Main Script v3
 * QR generation with multiple data types, dot styles, logo overlay, 
 * color presets, transparent BG, and history
 */

(function () {
    'use strict';

    // --- DOM Elements ---
    const urlInput = document.getElementById('url-input');
    const textInput = document.getElementById('text-input');
    const wifiSsid = document.getElementById('wifi-ssid');
    const wifiPassword = document.getElementById('wifi-password');
    const wifiEncryption = document.getElementById('wifi-encryption');
    const emailTo = document.getElementById('email-to');
    const emailSubject = document.getElementById('email-subject');
    const emailBody = document.getElementById('email-body');
    const ecLevelSelect = document.getElementById('ec-level');
    const fgColorInput = document.getElementById('fg-color');
    const bgColorInput = document.getElementById('bg-color');
    const fgHex = document.getElementById('fg-hex');
    const bgHex = document.getElementById('bg-hex');
    const transparentBgCheckbox = document.getElementById('transparent-bg');
    const qrSizeSlider = document.getElementById('qr-size');
    const qrSizeValue = document.getElementById('qr-size-value');
    const qrMarginSlider = document.getElementById('qr-margin');
    const qrMarginValue = document.getElementById('qr-margin-value');
    const logoInput = document.getElementById('logo-input');
    const logoDropArea = document.getElementById('logo-drop-area');
    const uploadContent = document.getElementById('upload-content');
    const logoPreview = document.getElementById('logo-preview');
    const logoPreviewImg = document.getElementById('logo-preview-img');
    const removeLogoBtn = document.getElementById('remove-logo-btn');
    const logoOptions = document.getElementById('logo-options');
    const logoSizeSlider = document.getElementById('logo-size');
    const logoSizeValue = document.getElementById('logo-size-value');
    const logoPaddingSlider = document.getElementById('logo-padding');
    const logoPaddingValue = document.getElementById('logo-padding-value');
    const logoRoundCheckbox = document.getElementById('logo-round');
    const showLabelCheckbox = document.getElementById('show-label');
    const labelOptions = document.getElementById('label-options');
    const labelTextInput = document.getElementById('label-text');
    const generateBtn = document.getElementById('generate-btn');
    const previewPlaceholder = document.getElementById('preview-placeholder');
    const canvas = document.getElementById('qr-canvas');
    const downloadActions = document.getElementById('download-actions');
    const downloadPngBtn = document.getElementById('download-png-btn');
    const downloadSvgBtn = document.getElementById('download-svg-btn');
    const copyBtn = document.getElementById('copy-btn');
    const historyGrid = document.getElementById('history-grid');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    // --- State ---
    let logoImage = null;
    let currentQR = null;
    let currentDataType = 'url';
    let currentDotStyle = 'square';

    const HISTORY_KEY = 'qrmar_history';
    const MAX_HISTORY = 8;

    // --- Utilities ---
    function showToast(message, type = '') {
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.className = 'toast' + (type ? ` toast-${type}` : '');
        void toast.offsetWidth;
        toast.classList.add('toast-show');
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.classList.remove('toast-show');
        }, 3000);
    }

    // --- Data Type Tabs ---
    const dataTypeTabs = document.querySelectorAll('#data-type-tabs .tab-btn');
    const dataInputSections = document.querySelectorAll('.data-input');

    dataTypeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            dataTypeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentDataType = tab.dataset.type;
            dataInputSections.forEach(s => s.style.display = 'none');
            document.getElementById(`input-${currentDataType}`).style.display = 'block';
        });
    });

    // --- Dot Style ---
    const dotStyleBtns = document.querySelectorAll('#dot-style-group .dot-style-btn');
    dotStyleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            dotStyleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDotStyle = btn.dataset.style;
            if (currentQR) renderQRToCanvas(currentQR);
        });
    });

    // --- Color Presets ---
    const presetBtns = document.querySelectorAll('#preset-group .preset-btn');
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const fg = btn.dataset.fg;
            const bg = btn.dataset.bg;
            fgColorInput.value = fg;
            bgColorInput.value = bg;
            fgHex.textContent = fg;
            bgHex.textContent = bg;
            if (currentQR) renderQRToCanvas(currentQR);
        });
    });

    // Deselect preset when user manually picks a color
    function deselectPresets() {
        presetBtns.forEach(b => b.classList.remove('active'));
    }

    // --- Color Hex Sync ---
    fgColorInput.addEventListener('input', () => {
        fgHex.textContent = fgColorInput.value;
        deselectPresets();
    });
    bgColorInput.addEventListener('input', () => {
        bgHex.textContent = bgColorInput.value;
        deselectPresets();
    });

    // --- Transparent BG ---
    transparentBgCheckbox.addEventListener('change', () => {
        if (currentQR) renderQRToCanvas(currentQR);
    });

    // --- Slider Value Sync ---
    qrSizeSlider.addEventListener('input', () => { qrSizeValue.textContent = qrSizeSlider.value; });
    qrMarginSlider.addEventListener('input', () => { qrMarginValue.textContent = qrMarginSlider.value; });
    logoSizeSlider.addEventListener('input', () => { logoSizeValue.textContent = logoSizeSlider.value; });
    logoPaddingSlider.addEventListener('input', () => { logoPaddingValue.textContent = logoPaddingSlider.value; });

    // --- Label Toggle ---
    showLabelCheckbox.addEventListener('change', () => {
        labelOptions.style.display = showLabelCheckbox.checked ? 'block' : 'none';
        if (currentQR) renderQRToCanvas(currentQR);
    });
    labelTextInput.addEventListener('input', () => {
        if (currentQR) renderQRToCanvas(currentQR);
    });

    // --- Logo Upload ---
    logoDropArea.addEventListener('click', () => logoInput.click());

    logoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleLogoFile(file);
    });

    ['dragenter', 'dragover'].forEach(evt => {
        logoDropArea.addEventListener(evt, (e) => {
            e.preventDefault(); e.stopPropagation();
            logoDropArea.classList.add('drag-over');
        });
    });
    ['dragleave', 'drop'].forEach(evt => {
        logoDropArea.addEventListener(evt, (e) => {
            e.preventDefault(); e.stopPropagation();
            logoDropArea.classList.remove('drag-over');
        });
    });
    logoDropArea.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) handleLogoFile(file);
    });

    function handleLogoFile(file) {
        if (file.size > 2 * 1024 * 1024) {
            showToast('File too large! Max 2MB.', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                logoImage = img;
                logoPreviewImg.src = e.target.result;
                uploadContent.style.display = 'none';
                logoPreview.style.display = 'flex';
                logoOptions.style.display = 'block';
                if (ecLevelSelect.value !== 'H') {
                    ecLevelSelect.value = 'H';
                    showToast('Error correction set to H for best logo support', 'success');
                }
                if (currentQR) renderQRToCanvas(currentQR);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    removeLogoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        logoImage = null;
        logoInput.value = '';
        logoPreviewImg.src = '';
        uploadContent.style.display = 'flex';
        logoPreview.style.display = 'none';
        logoOptions.style.display = 'none';
        if (currentQR) renderQRToCanvas(currentQR);
    });

    // --- Build Data String ---
    function buildDataString() {
        switch (currentDataType) {
            case 'url':
                return urlInput.value.trim();
            case 'text':
                return textInput.value.trim();
            case 'wifi': {
                const ssid = wifiSsid.value.trim();
                const pass = wifiPassword.value.trim();
                const enc = wifiEncryption.value;
                if (!ssid) return '';
                return `WIFI:T:${enc};S:${ssid};P:${pass};;`;
            }
            case 'email': {
                const to = emailTo.value.trim();
                if (!to) return '';
                const subj = emailSubject.value.trim();
                const body = emailBody.value.trim();
                let mailto = `mailto:${to}`;
                const params = [];
                if (subj) params.push(`subject=${encodeURIComponent(subj)}`);
                if (body) params.push(`body=${encodeURIComponent(body)}`);
                if (params.length) mailto += '?' + params.join('&');
                return mailto;
            }
            default: return '';
        }
    }

    // --- QR Code Generation ---
    generateBtn.addEventListener('click', generateQR);
    urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); generateQR(); } });

    function generateQR() {
        const data = buildDataString();
        if (!data) {
            showToast('Please fill in the required fields!', 'error');
            return;
        }

        try {
            const qr = qrcode(0, ecLevelSelect.value);
            qr.addData(data);
            qr.make();
            currentQR = qr;

            renderQRToCanvas(qr);

            previewPlaceholder.style.display = 'none';
            canvas.style.display = 'block';
            downloadActions.style.display = 'flex';

            saveToHistory(data);
            showToast('QR code generated!', 'success');
        } catch (err) {
            console.error(err);
            showToast('Error generating QR code. Try shorter data or lower error correction.', 'error');
        }
    }

    function renderQRToCanvas(qr) {
        const baseSize = parseInt(qrSizeSlider.value, 10);
        const margin = parseInt(qrMarginSlider.value, 10);
        const moduleCount = qr.getModuleCount();
        const cellSize = baseSize / (moduleCount + margin * 2);
        const marginPx = cellSize * margin;
        const fgColor = fgColorInput.value;
        const bgColor = bgColorInput.value;
        const isTransparent = transparentBgCheckbox.checked;
        const showLabel = showLabelCheckbox.checked;
        const labelText = labelTextInput.value.trim() || 'Scan Me';

        const labelHeight = showLabel ? Math.max(36, baseSize * 0.08) : 0;
        const totalWidth = baseSize;
        const totalHeight = baseSize + labelHeight;

        canvas.width = totalWidth;
        canvas.height = totalHeight;
        const ctx = canvas.getContext('2d');

        // Background
        if (!isTransparent) {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, totalWidth, totalHeight);
        } else {
            ctx.clearRect(0, 0, totalWidth, totalHeight);
        }

        // Draw QR modules
        ctx.fillStyle = fgColor;
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (qr.isDark(row, col)) {
                    const x = marginPx + col * cellSize;
                    const y = marginPx + row * cellSize;
                    drawModule(ctx, x, y, cellSize, cellSize, currentDotStyle);
                }
            }
        }

        // Logo
        if (logoImage) drawLogo(ctx, baseSize, isTransparent);

        // Label
        if (showLabel) drawLabel(ctx, labelText, totalWidth, baseSize, labelHeight, fgColor, bgColor, isTransparent);
    }

    function drawModule(ctx, x, y, w, h, style) {
        const pad = 0.1;
        const px = x + w * pad;
        const py = y + h * pad;
        const pw = w * (1 - pad * 2);
        const ph = h * (1 - pad * 2);

        switch (style) {
            case 'rounded': {
                const r = Math.min(pw, ph) * 0.3;
                ctx.beginPath();
                ctx.moveTo(px + r, py);
                ctx.lineTo(px + pw - r, py);
                ctx.quadraticCurveTo(px + pw, py, px + pw, py + r);
                ctx.lineTo(px + pw, py + ph - r);
                ctx.quadraticCurveTo(px + pw, py + ph, px + pw - r, py + ph);
                ctx.lineTo(px + r, py + ph);
                ctx.quadraticCurveTo(px, py + ph, px, py + ph - r);
                ctx.lineTo(px, py + r);
                ctx.quadraticCurveTo(px, py, px + r, py);
                ctx.closePath();
                ctx.fill();
                break;
            }
            case 'dots': {
                ctx.beginPath();
                ctx.arc(px + pw / 2, py + ph / 2, Math.min(pw, ph) / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            }
            case 'diamond': {
                const cx = px + pw / 2;
                const cy = py + ph / 2;
                ctx.beginPath();
                ctx.moveTo(cx, py);
                ctx.lineTo(px + pw, cy);
                ctx.lineTo(cx, py + ph);
                ctx.lineTo(px, cy);
                ctx.closePath();
                ctx.fill();
                break;
            }
            default:
                ctx.fillRect(x, y, w, h);
        }
    }

    function drawLogo(ctx, canvasSize, isTransparent) {
        const logoSizePercent = parseInt(logoSizeSlider.value, 10) / 100;
        const padding = parseInt(logoPaddingSlider.value, 10);
        const isRound = logoRoundCheckbox.checked;

        const logoDisplaySize = canvasSize * logoSizePercent;
        const totalSize = logoDisplaySize + padding * 2;
        const x = (canvasSize - totalSize) / 2;
        const y = (canvasSize - totalSize) / 2;

        const bgColor = bgColorInput.value;

        // Clear / fill behind logo
        if (isTransparent) {
            // For transparent, clear the area
            if (isRound) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(x + totalSize / 2, y + totalSize / 2, totalSize / 2, 0, Math.PI * 2);
                ctx.clip();
                ctx.clearRect(x, y, totalSize, totalSize);
                ctx.restore();
            } else {
                ctx.clearRect(x, y, totalSize, totalSize);
            }
        } else {
            ctx.fillStyle = bgColor;
            if (isRound) {
                ctx.beginPath();
                ctx.arc(x + totalSize / 2, y + totalSize / 2, totalSize / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                const cr = 8;
                ctx.beginPath();
                ctx.moveTo(x + cr, y);
                ctx.lineTo(x + totalSize - cr, y);
                ctx.quadraticCurveTo(x + totalSize, y, x + totalSize, y + cr);
                ctx.lineTo(x + totalSize, y + totalSize - cr);
                ctx.quadraticCurveTo(x + totalSize, y + totalSize, x + totalSize - cr, y + totalSize);
                ctx.lineTo(x + cr, y + totalSize);
                ctx.quadraticCurveTo(x, y + totalSize, x, y + totalSize - cr);
                ctx.lineTo(x, y + cr);
                ctx.quadraticCurveTo(x, y, x + cr, y);
                ctx.closePath();
                ctx.fill();
            }
        }

        // Draw logo image
        const logoX = x + padding;
        const logoY = y + padding;

        if (isRound) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(logoX + logoDisplaySize / 2, logoY + logoDisplaySize / 2, logoDisplaySize / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(logoImage, logoX, logoY, logoDisplaySize, logoDisplaySize);
            ctx.restore();
        } else {
            ctx.drawImage(logoImage, logoX, logoY, logoDisplaySize, logoDisplaySize);
        }

        ctx.fillStyle = fgColorInput.value;
    }

    function drawLabel(ctx, text, width, yStart, height, fgColor, bgColor, isTransparent) {
        if (!isTransparent) {
            ctx.fillStyle = fgColor;
            ctx.fillRect(0, yStart, width, height);
        } else {
            ctx.fillStyle = fgColor;
            ctx.fillRect(0, yStart, width, height);
        }

        ctx.fillStyle = isTransparent ? '#ffffff' : bgColor;
        const fontSize = Math.min(height * 0.55, 28);
        ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, width / 2, yStart + height / 2);
    }

    // --- Download PNG ---
    downloadPngBtn.addEventListener('click', () => {
        if (!canvas.width) return;
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'qrcode-mar.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('PNG downloaded!', 'success');
        }, 'image/png');
    });

    // --- Copy to Clipboard ---
    copyBtn.addEventListener('click', () => {
        if (!canvas.width) return;
        canvas.toBlob(async (blob) => {
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                showToast('Copied to clipboard!', 'success');
            } catch {
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
                showToast('Opened in new tab (clipboard not supported)', 'error');
            }
        }, 'image/png');
    });

    // --- Download SVG ---
    downloadSvgBtn.addEventListener('click', () => {
        if (!currentQR) return;

        const baseSize = parseInt(qrSizeSlider.value, 10);
        const margin = parseInt(qrMarginSlider.value, 10);
        const moduleCount = currentQR.getModuleCount();
        const cellSize = baseSize / (moduleCount + margin * 2);
        const marginPx = cellSize * margin;
        const fgColor = fgColorInput.value;
        const bgColor = bgColorInput.value;
        const isTransparent = transparentBgCheckbox.checked;

        let parts = [];
        parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${baseSize}" height="${baseSize}" viewBox="0 0 ${baseSize} ${baseSize}">`);

        if (!isTransparent) {
            parts.push(`<rect width="${baseSize}" height="${baseSize}" fill="${bgColor}"/>`);
        }

        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (currentQR.isDark(row, col)) {
                    const x = marginPx + col * cellSize;
                    const y = marginPx + row * cellSize;

                    if (currentDotStyle === 'dots') {
                        const r = cellSize * 0.4;
                        parts.push(`<circle cx="${(x + cellSize / 2).toFixed(2)}" cy="${(y + cellSize / 2).toFixed(2)}" r="${r.toFixed(2)}" fill="${fgColor}"/>`);
                    } else if (currentDotStyle === 'rounded') {
                        const rx = cellSize * 0.3;
                        parts.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" rx="${rx.toFixed(2)}" fill="${fgColor}"/>`);
                    } else if (currentDotStyle === 'diamond') {
                        const cx = x + cellSize / 2;
                        const cy = y + cellSize / 2;
                        parts.push(`<polygon points="${cx},${y} ${x + cellSize},${cy} ${cx},${y + cellSize} ${x},${cy}" fill="${fgColor}"/>`);
                    } else {
                        parts.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" fill="${fgColor}"/>`);
                    }
                }
            }
        }
        parts.push('</svg>');

        const blob = new Blob([parts.join('')], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'qrcode-mar.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('SVG downloaded!', 'success');
    });

    // --- Auto re-render ---
    [fgColorInput, bgColorInput, qrSizeSlider, qrMarginSlider, logoSizeSlider, logoPaddingSlider].forEach(input => {
        input.addEventListener('input', () => { if (currentQR) renderQRToCanvas(currentQR); });
    });
    logoRoundCheckbox.addEventListener('change', () => { if (currentQR) renderQRToCanvas(currentQR); });

    // --- History ---
    function getHistory() {
        try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
        catch { return []; }
    }

    function saveToHistory(data) {
        const history = getHistory();
        if (history.length && history[0].data === data) return;

        const thumbSize = 120;
        const tc = document.createElement('canvas');
        tc.width = thumbSize; tc.height = thumbSize;
        tc.getContext('2d').drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, thumbSize, thumbSize);

        history.unshift({
            data,
            type: currentDataType,
            thumbnail: tc.toDataURL('image/png', 0.6),
            timestamp: Date.now()
        });

        while (history.length > MAX_HISTORY) history.pop();
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        const history = getHistory();
        historyGrid.innerHTML = '';

        if (!history.length) {
            const p = document.createElement('p');
            p.className = 'history-empty';
            p.textContent = 'No history yet';
            historyGrid.appendChild(p);
            return;
        }

        history.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.style.animationDelay = `${idx * 0.05}s`;
            div.title = item.data;

            const img = document.createElement('img');
            img.src = item.thumbnail;
            img.alt = 'QR ' + (idx + 1);
            div.appendChild(img);

            const tooltip = document.createElement('div');
            tooltip.className = 'history-tooltip';
            tooltip.textContent = item.data.length > 30 ? item.data.substring(0, 30) + '...' : item.data;
            div.appendChild(tooltip);

            div.addEventListener('click', () => {
                selectDataType(item.type === 'wifi' || item.type === 'email' ? 'url' : item.type);
                if (item.type === 'url' || item.type === 'wifi' || item.type === 'email') urlInput.value = item.data;
                else textInput.value = item.data;
                generateQR();
            });

            historyGrid.appendChild(div);
        });
    }

    function selectDataType(type) {
        currentDataType = type;
        dataTypeTabs.forEach(t => t.classList.toggle('active', t.dataset.type === type));
        dataInputSections.forEach(s => s.style.display = 'none');
        document.getElementById(`input-${type}`).style.display = 'block';
    }

    clearHistoryBtn.addEventListener('click', () => {
        localStorage.removeItem(HISTORY_KEY);
        renderHistory();
        showToast('History cleared', 'success');
    });

    // Init
    renderHistory();

})();
