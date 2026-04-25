// Custom modal helpers — replace native confirm() / alert()

function customConfirm(message, onConfirm, confirmLabel = 'Confirm', cancelLabel = 'Cancel') {

    const overlay = document.getElementById('custom-modal-overlay');

    const iconEl = document.getElementById('custom-modal-icon');

    const msgEl = document.getElementById('custom-modal-message');

    const btnsEl = document.getElementById('custom-modal-buttons');

    iconEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';

    msgEl.textContent = message;

    btnsEl.innerHTML = '';

    const cancelBtn = document.createElement('button');

    cancelBtn.className = 'modal-btn-cancel';

    cancelBtn.textContent = cancelLabel;

    cancelBtn.onclick = () => { overlay.style.display = 'none'; };

    const confirmBtn = document.createElement('button');

    confirmBtn.className = 'modal-btn-confirm';

    confirmBtn.textContent = confirmLabel;

    confirmBtn.onclick = () => { overlay.style.display = 'none'; onConfirm(); };

    btnsEl.appendChild(cancelBtn);

    btnsEl.appendChild(confirmBtn);

    overlay.style.display = 'flex';

}



function customAlert(message, okLabel = 'OK') {

    const overlay = document.getElementById('custom-modal-overlay');

    const iconEl = document.getElementById('custom-modal-icon');

    const msgEl = document.getElementById('custom-modal-message');

    const btnsEl = document.getElementById('custom-modal-buttons');

    iconEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

    msgEl.textContent = message;

    btnsEl.innerHTML = '';

    const okBtn = document.createElement('button');

    okBtn.className = 'modal-btn-ok';

    okBtn.textContent = okLabel;

    okBtn.onclick = () => { overlay.style.display = 'none'; };

    btnsEl.appendChild(okBtn);

    overlay.style.display = 'flex';

}



function updateGamemodeEmptyState() {

    const emptyEl = document.getElementById('gamemode-empty');

    const gameArea = document.getElementById('game-area');

    if (!emptyEl || !gameArea) return;

    const anyActive = savedata.enableDistinction || savedata.enableLinear || savedata.enableDirection ||

        savedata.enableDirection3D || savedata.enableDirection4D || savedata.enableDirection5D ||

        savedata.enableDirection6D || savedata.enableSyllogism || savedata.enableAnalogy ||

        savedata.enableBinary || savedata.enableNestedBinary;

    if (anyActive) {

        emptyEl.style.display = 'none';

        for (const child of gameArea.children) {

            if (child !== emptyEl) child.style.display = '';

        }

    } else {

        emptyEl.style.display = 'flex';

        for (const child of gameArea.children) {

            if (child !== emptyEl) child.style.display = 'none';

        }

    }

}



function filterSection(input) {

    const query = input.value.trim().toLowerCase();

    const content = input.closest('.settings-section-content');

    if (!content) return;

    const items = content.querySelectorAll('.mb-1, .mb-2, .folder, hr.divider');



    if (!query) {

        items.forEach(el => el.style.display = '');

        return;

    }



    items.forEach(el => {

        if (el.classList.contains('divider')) {

            el.style.display = 'none';

            return;

        }

        const text = el.textContent.toLowerCase();

        if (text.includes(query)) {

            el.style.display = '';

        } else {

            el.style.display = 'none';

        }

    });

}



// Get rid of all the PWA stuff

if ('serviceWorker' in navigator)

    navigator.serviceWorker.getRegistrations()

        .then(registrations => {

            if (registrations.length) for (let r of registrations) r.unregister();

        });



// Toggle settings section collapse/expand

function toggleSettingsSection(header) {

    const content = header.nextElementSibling;

    const isCollapsed = header.classList.contains('collapsed');

    

    if (isCollapsed) {

        header.classList.remove('collapsed');

        content.classList.remove('collapsed');

    } else {

        header.classList.add('collapsed');

        content.classList.add('collapsed');

    }

}



const feedbackWrong = document.querySelector(".feedback--wrong");

const feedbackMissed = document.querySelector(".feedback--missed");

const feedbackRight = document.querySelector(".feedback--right");

const trueButton = document.getElementById("true-button");

const falseButton = document.getElementById("false-button");



const correctlyAnsweredEl = document.querySelector(".correctly-answered");

const nextLevelEl = document.querySelector(".next-level");



const backgroundDiv = document.querySelector('.background-image');

let imageChanged = true;



const timerInput = document.querySelector("#timer-input");

const timerToggle = document.querySelector("#timer-toggle");

const timerBar = document.querySelector(".timer__bar");

const customTimeInfo = document.querySelector(".custom-time-info");

let timerToggled = false;

let timerTime = 30;

let timerCount = 30;

let timerInstance;

let isPatternMemorizationPhase = false;

let timerRunning = false;

let processingAnswer = false;



const historyList = document.getElementById("history-list");

const historyButton = document.querySelector(`label.open[for="offcanvas-history"]`);

const historyCheckbox = document.getElementById("offcanvas-history");

const settingsButton = document.querySelector(`label.open[for="offcanvas-settings"]`);

const totalDisplay = document.getElementById("total-display");

const averageDisplay = document.getElementById("average-display");

const averageCorrectDisplay = document.getElementById("average-correct-display");

const percentCorrectDisplay = document.getElementById("percent-correct-display");



let carouselIndex = 0;

let carouselEnabled = false;

let carouselAutoAdvanceTimer = null;

let question;

const carousel = document.querySelector(".carousel");

const carouselDisplayLabelType = carousel.querySelector(".carousel_display_label_type");

const carouselDisplayLabelProgress = carousel.querySelector(".carousel_display_label_progress");

const carouselDisplayText = carousel.querySelector(".carousel_display_text");

const carouselBackButton = carousel.querySelector("#carousel-back");

const carouselNextButton = carousel.querySelector("#carousel-next");



const display = document.querySelector(".display-outer");

const displayLabelType = display.querySelector(".display_label_type");

const displayLabelLevel = display.querySelector(".display_label_level");;

const displayText = display.querySelector(".display_text");;



const liveStyles = document.getElementById('live-styles');

const gameArea = document.getElementById('game-area');

const spoilerArea = document.getElementById('spoiler-area');



const confirmationButtons = document.querySelector(".confirmation-buttons");

let imagePromise = Promise.resolve();



const keySettingMapInverse = Object.entries(keySettingMap)

    .reduce((a, b) => (a[b[1]] = b[0], a), {});



carouselBackButton.addEventListener("click", carouselBack);

carouselNextButton.addEventListener("click", carouselNext);



function isKeyNullable(key) {

    return key.endsWith("premises") || key.endsWith("time") || key.endsWith("optional");

}



function registerEventHandlers() {

    for (const key in keySettingMap) {

        const value = keySettingMap[key];

        const input = document.querySelector("#" + key);

        if (!input) continue;



        // Checkbox handler

        if (input.type === "checkbox") {

            input.addEventListener("change", evt => {

                savedata[value] = !!input.checked;

                // Reset anchor pattern when disabling fixed positions
                if (key === "p-anc-v2-fixed" && !input.checked) {
                    const anchorSpace = new AnchorSpaceV2();
                    anchorSpace.resetPattern();
                }

                // Enable fixed positions when refreshing pattern
                if (key === "p-anc-v2-fixed" && input.checked) {
                    // Pattern will be regenerated on next question
                }

                // Set default numConclusions when enabling multiple conclusions mode
                if (key === "p-multi-conc" && input.checked && !savedata.numConclusions) {
                    savedata.numConclusions = 3;
                    const numInput = document.getElementById("p-num-conc");
                    if (numInput) numInput.value = 3;
                }

                // Set default time bonus when enabling time bonus per conclusion
                if (key === "p-time-bonus-enabled" && input.checked && !savedata.timeBonusPerConclusion) {
                    savedata.timeBonusPerConclusion = 3;
                    const bonusInput = document.getElementById("p-time-bonus-amount");
                    if (bonusInput) bonusInput.value = 3;
                }

                refresh();

            });

        }



        // Number handler

        if (input.type === "number") {

            input.addEventListener("input", evt => {



                let num = input?.value;

                if (num === undefined || num === null || num === '')

                    num = null;

                if (input.min && +num < +input.min)

                    num = null;

                if (input.max && +num > +input.max)

                    num = null;



                if (num == null) {

                    if (isKeyNullable(key)) {

                        savedata[value] = null;

                    } else {

                        // Fix infinite loop on mobile when changing # of premises

                        return;

                    }

                } else {

                    savedata[value] = +num;

                }

                refresh();

            });

        }



        if (input.type === "select-one") {

            input.addEventListener("change", evt => {

                savedata[value] = input.value;

                refresh();

            })

        }

    }

    // Refresh Pattern button for Anchor Space v2
    const refreshPatternBtn = document.getElementById("p-anc-v2-refresh");
    if (refreshPatternBtn) {
        refreshPatternBtn.addEventListener("click", () => {
            const anchorSpace = new AnchorSpaceV2();
            anchorSpace.resetPattern();
            // Enable fixed positions if not already
            if (!savedata.anchorSpaceFixedPositions) {
                savedata.anchorSpaceFixedPositions = true;
                const fixedCheckbox = document.getElementById("p-anc-v2-fixed");
                if (fixedCheckbox) fixedCheckbox.checked = true;
            }
            refresh();
        });
    }

}



function save() {

    PROFILE_STORE.saveProfiles();

    setLocalStorageObj(appStateKey, appState);

}



function appStateStartup() {

    const appStateObj = getLocalStorageObj(appStateKey);

    if (appStateObj) {

        Object.assign(appState, appStateObj);

        setLocalStorageObj(appStateKey, appState);

    }

}



function load() {

    appStateStartup();

    PROFILE_STORE.startup();



    renderHQL();

    renderFolders();

    populateSettings();

    updateGamemodeEmptyState();

}



function populateSettings() {

    for (let key in savedata) {

        if (!(key in keySettingMapInverse)) continue;

        let value = savedata[key];

        let id = keySettingMapInverse[key];

        

        const input = document.querySelector("#" + id);

        if (input.type === "checkbox") {

            if (value === true || value === false) {

                input.checked = value;

            }

        }

        else if (input.type === "number") {

            if (!value && isKeyNullable(id)) {

                input.value = '';

            } else if (typeof value === "number") {

                input.value = +value;

            }

        }

        else if (input.type === "text") {

            input.value = value;

        } else if (input.type === "select-one") {

            input.value = value;

        }

    }



    populateLinearDropdown();

    populateProgressionDropdown();

    populateAppearanceSettings();



    timerInput.value = savedata.timer;

    timerTime = timerInput.value;

}



function refresh() {

    save();

    populateSettings();

    updateGamemodeEmptyState();

    init();

}



function carouselInit() {

    carouselIndex = 0;

    if (carouselAutoAdvanceTimer) {

        clearTimeout(carouselAutoAdvanceTimer);

        carouselAutoAdvanceTimer = null;

    }

    renderCarousel();

}



function displayInit() {

    const q = renderJunkEmojis(question);

    displayLabelType.textContent = q.category.split(":")[0];

    displayLabelLevel.textContent = (q.plen || q.premises.length) + "p";

    const easy = savedata.scrambleFactor < 12 ? ' (easy)' : '';

    // For half-minimal mode, add alternating classes to premises

    const halfMinimal = savedata.halfMinimalMode;



    // Handle Anchor Space v2 pattern display

    if (q.pattern && q.type === 'anchor-space-v2') {

        isPatternMemorizationPhase = true;

        const isMultiPattern = savedata.multipleConclusionsMode && q.conclusions && q.conclusions.length > 1;
        const currentIdxPattern = isMultiPattern ? (q.currentConclusionIndex || 0) : 0;
        const currentConcPattern = isMultiPattern && q.conclusions[currentIdxPattern] ? q.conclusions[currentIdxPattern].conclusion : q.conclusion;
        const concLabelPattern = isMultiPattern ? `Conclusion ${currentIdxPattern + 1} of ${q.conclusions.length}` : 'Conclusion';
        displayText.innerHTML = renderPatternDisplay(q.pattern, q.premises, q.operations, currentConcPattern, easy, halfMinimal, concLabelPattern);

        // Hide TRUE/FALSE buttons during pattern memorization

        disableConfirmationButtons();

        // Pause timer during pattern memorization if setting enabled

        if (savedata.anchorSpaceV2PauseTimer && timerRunning) {

            stopCountDown();

        }

        // Bind the ready button

        const readyBtn = document.getElementById('pattern-ready-btn');

        if (readyBtn) {

            readyBtn.addEventListener('click', () => {

                isPatternMemorizationPhase = false;

                const isMulti = savedata.multipleConclusionsMode && q.conclusions && q.conclusions.length > 1;
                const currentIdx = isMulti ? (q.currentConclusionIndex || 0) : 0;
                const currentConc = isMulti && q.conclusions[currentIdx] ? q.conclusions[currentIdx].conclusion : q.conclusion;
                const concLabel = isMulti ? `Conclusion ${currentIdx + 1} of ${q.conclusions.length}` : 'Conclusion';
                showPremisesAfterPattern(q.premises, q.operations, currentConc, easy, halfMinimal, concLabel);

            });

        }

    } else {

        const isMulti = savedata.multipleConclusionsMode && q.conclusions && q.conclusions.length > 1;
        const currentIdx = isMulti ? (q.currentConclusionIndex || 0) : 0;
        const currentConc = isMulti && q.conclusions[currentIdx] ? q.conclusions[currentIdx].conclusion : q.conclusion;
        const concLabel = isMulti ? `Conclusion ${currentIdx + 1} of ${q.conclusions.length}` : 'Conclusion';
        displayText.innerHTML = buildPremisesHTML(q.premises, q.operations, currentConc, easy, halfMinimal, concLabel);

    }



    const isAnalogy = question?.tags?.includes('analogy');

    const isBinary = question.type === 'binary';

    if (savedata.minimalMode && question.type !== 'syllogism') {

        displayText.classList.add('minimal');

        displayText.classList.remove('half-minimal');

    } else if (savedata.halfMinimalMode) {

        displayText.classList.add('half-minimal');

        displayText.classList.remove('minimal');

    } else {

        displayText.classList.remove('minimal');

        displayText.classList.remove('half-minimal');

    }



    if (savedata.widePremises && question.type !== 'syllogism') {

        displayText.classList.add('wide-premises');

        gameArea.classList.add('wide-premises');

    } else {

        displayText.classList.remove('wide-premises');

        gameArea.classList.remove('wide-premises');

    }



    if (isAnalogy || isBinary) {

        displayText.classList.add('complicated-conclusion');

    } else {

        displayText.classList.remove('complicated-conclusion');

    }



    if (q.premises.length > 12) {

        displayText.classList.add('big-question');

    } else {

        displayText.classList.remove('big-question');

    }



    imagePromise = imagePromise.then(() => updateCustomStyles());



    if (appState.darkMode) {

        document.body.classList.remove('light-mode');

    } else {

        document.body.classList.add('light-mode');

    }



    if (savedata.enableColorless) {

        document.body.classList.add('colorless');

    } else {

        document.body.classList.remove('colorless');

    }

}



function renderPatternDisplay(pattern, premises, operations, conclusion, easy, halfMinimal, conclusionLabel) {

    const entries = Object.entries(pattern);

    if (entries.length === 0) return buildPremisesHTML(premises, operations, conclusion, easy, halfMinimal, conclusionLabel);



    // Find bounds for the grid

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    entries.forEach(([word, data]) => {

        const [x, y] = data.coord;

        minX = Math.min(minX, x);

        maxX = Math.max(maxX, x);

        minY = Math.min(minY, y);

        maxY = Math.max(maxY, y);

    });



    // Create coordinate to pattern data mapping

    const coordMap = new Map();

    entries.forEach(([word, data]) => {

        const key = `${data.coord[0]},${data.coord[1]}`;

        coordMap.set(key, { word, ...data });

    });



    // Build grid cells directly - just shapes, no word names

    const cells = [];

    for (let y = maxY; y >= minY; y--) {

        for (let x = minX; x <= maxX; x++) {

            const key = `${x},${y}`;

            const cellData = coordMap.get(key);

            if (cellData) {

                const shapeSize = 32;

                const shapeSVG = createShapeSVG(cellData.shape, cellData.color, shapeSize/2, shapeSize/2, shapeSize);

                cells.push(`<div class="td" style="padding: 12px; text-align: center; min-width: 60px;">

                    <svg width="${shapeSize}" height="${shapeSize}" viewBox="0 0 ${shapeSize} ${shapeSize}">${shapeSVG}</svg>

                </div>`);

            } else {

                cells.push(`<div class="td" style="padding: 12px; min-width: 60px;"></div>`);

            }

        }

    }



    const numCols = maxX - minX + 1;

    const tableHTML = `<div class="table pattern-table" style="grid-template-columns: repeat(${numCols}, auto); margin: 1rem auto;">${cells.join('')}</div>`;



    // Build legend - just colors, no shape names

    const legend = entries.map(([word, data]) => `

        <span style="display: flex; align-items: center; gap: 0.3rem;">

            <svg width="16" height="16" viewBox="0 0 20 20">${createShapeSVG(data.shape, data.color, 10, 10, 18)}</svg>

            <span style="color: var(--text-color); font-size: 0.85rem;">${data.color.name}</span>

        </span>

    `).join('');



    return `

        <div class="pattern-memorization-phase" style="text-align: center; margin: 1rem 0;">

            <div class="preamble">Memorize the Pattern</div>

            ${tableHTML}

            <div class="pattern-legend" style="margin: 0.5rem 0; display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">

                ${legend}

            </div>

            <button id="pattern-ready-btn" class="explanation-button" style="margin-top: 1rem;">I'm Ready</button>

        </div>

        <div id="premises-phase" style="display: none;">

            ${buildPremisesHTML(premises, operations, conclusion, easy, halfMinimal, conclusionLabel)}

        </div>

    `;

}



function createShapeSVG(shape, color, x, y, size) {

    const halfSize = size / 2;

    // Leave some padding so stroke doesn't get cut off

    const padding = 3;

    const r = halfSize - padding;

    // Use a darker stroke for better contrast

    const strokeColor = color.stroke || '#000000';

    const svgAttrs = `shape-rendering="geometricPrecision"`;

    switch(shape) {

        case 'circle':

            return `<circle cx="${x}" cy="${y}" r="${r}" fill="${color.fill}" stroke="${strokeColor}" stroke-width="2.5" ${svgAttrs}/>`;

        case 'square':

            return `<rect x="${x - r}" y="${y - r}" width="${r * 2}" height="${r * 2}" rx="2" fill="${color.fill}" stroke="${strokeColor}" stroke-width="2.5" ${svgAttrs}/>`;

        case 'triangle':

            // Equilateral triangle pointing up

            const triHeight = r * 1.5;

            const triHalfBase = r * 0.866;

            return `<polygon points="${x},${y - triHeight * 0.6} ${x + triHalfBase},${y + triHeight * 0.4} ${x - triHalfBase},${y + triHeight * 0.4}" fill="${color.fill}" stroke="${strokeColor}" stroke-width="2.5" stroke-linejoin="miter" stroke-linecap="butt" ${svgAttrs}/>`;

        case 'diamond':

            // Perfect diamond (square rotated 45°)

            const dOffset = r * 0.707;

            return `<polygon points="${x},${y - dOffset} ${x + dOffset},${y} ${x},${y + dOffset} ${x - dOffset},${y}" fill="${color.fill}" stroke="${strokeColor}" stroke-width="2.5" stroke-linejoin="miter" stroke-linecap="butt" ${svgAttrs}/>`;

        case 'hexagon':

            // Regular hexagon

            const hexPoints = [];

            for (let i = 0; i < 6; i++) {

                const angle = (Math.PI / 3) * i - Math.PI / 2;

                hexPoints.push(`${x + r * Math.cos(angle)},${y + r * Math.sin(angle)}`);

            }

            return `<polygon points="${hexPoints.join(' ')}" fill="${color.fill}" stroke="${strokeColor}" stroke-width="2.5" stroke-linejoin="miter" stroke-linecap="butt" ${svgAttrs}/>`;

        case 'star':

            // 5-pointed star with proper proportions

            const starPoints = [];

            const outerRadius = r;

            const innerRadius = r * 0.4;

            for (let i = 0; i < 10; i++) {

                const angle = (Math.PI / 5) * i - Math.PI / 2;

                const radius = i % 2 === 0 ? outerRadius : innerRadius;

                starPoints.push(`${x + radius * Math.cos(angle)},${y + radius * Math.sin(angle)}`);

            }

            return `<polygon points="${starPoints.join(' ')}" fill="${color.fill}" stroke="${strokeColor}" stroke-width="2.5" stroke-linejoin="miter" stroke-linecap="butt" ${svgAttrs}/>`;

        default:

            return `<circle cx="${x}" cy="${y}" r="${r}" fill="${color.fill}" stroke="${strokeColor}" stroke-width="2.5" ${svgAttrs}/>`;

    }

}



function showPremisesAfterPattern(premises, operations, conclusion, easy, halfMinimal, conclusionLabel) {

    const patternPhase = document.querySelector('.pattern-memorization-phase');

    const premisesPhase = document.getElementById('premises-phase');

    if (patternPhase) {

        patternPhase.style.display = 'none';

    }

    if (premisesPhase) {

        // Update the premises phase content with the correct conclusion label
        premisesPhase.innerHTML = buildPremisesHTML(premises, operations, conclusion, easy, halfMinimal, conclusionLabel);
        premisesPhase.style.display = 'block';

    }

    // Show TRUE/FALSE buttons now that premises are visible

    enableConfirmationButtons();

    // Resume timer if it was paused during pattern memorization

    if (savedata.anchorSpaceV2PauseTimer && timerToggled && !timerRunning) {

        setTimeout(() => {
            startCountDown();
        }, 500);

    }

}



function buildPremisesHTML(premises, operations, conclusion, easy, halfMinimal, conclusionLabel) {

    const label = conclusionLabel || 'Conclusion';

    return [

        `<div class="preamble">Premises${easy}</div>`,

        ...premises.map((p, i) => `<div class="formatted-premise ${halfMinimal && i % 2 === 0 ? 'minimal-style' : ''}">${p.html ?? p}</div>`),

        ...((operations && operations.length > 0) ? ['<div class="transform-header">Transformations</div>'] : []),

        ...(operations ? operations.map(o => `<div class="formatted-operation">${o}</div>`) : []),

        `<div class="postamble">${label}</div>`,

        '<div class="formatted-conclusion">'+conclusion+'</div>',

    ].join('');

}



function clearBackgroundImage() {

    const fileInput = document.getElementById('image-upload');

    fileInput.value = '';

    delete appState.backgroundImage;

    imageChanged = true;

    save();

    imagePromise = imagePromise.then(() => deleteImage(imageKey));

    imagePromise = imagePromise.then(() => updateCustomStyles());

}



function handleImageChange(event) {

    const file = event.target.files[0];

    if (file) {

        const reader = new FileReader();

        reader.onload = function(event) {

            const base64String = event.target.result;

            appState.backgroundImage = imageKey;

            imagePromise = imagePromise.then(() => storeImage(imageKey, base64String));

            imageChanged = true;

            refresh();

        };

        reader.readAsDataURL(file);

    }

}



function populateAppearanceSettings() {

    document.getElementById('color-input').value = appState.darkMode ? appState.gameAreaColor : appState.gameAreaLightColor;

    document.getElementById('p-sfx').value = appState.sfx;

    document.getElementById('p-fast-ui').checked = appState.fastUi;

    document.getElementById('p-dark-mode').checked = appState.darkMode;

    document.getElementById('p-flat-settings').checked = appState.flatSettings;

    document.getElementById('p-swap-buttons').checked = appState.swapButtons;

    document.getElementById('p-nav-bar').checked = appState.navBar;

    document.getElementById('p-timer-anim').value = appState.timerAnimation;

    document.getElementById('p-font-size').value = appState.fontSize;

    document.getElementById('p-density').value = appState.uiDensity;

    document.getElementById('p-bracket-color').value = appState.bracketColor || '#3377ff';

    document.getElementById('p-bracket-color-picker').value = appState.bracketColor || '#3377ff';

    document.getElementById('p-color-words').checked = appState.colorWords;

    document.getElementById('p-color-timer').checked = appState.colorTimer;

    document.getElementById('p-timer-height').value = appState.timerHeight;

    document.getElementById('p-border-radius').value = appState.borderRadius;

    document.getElementById('p-premise-style').value = appState.premiseStyle;

    document.getElementById('p-conclusion-style').value = appState.conclusionStyle || 'minimal';

    const defaultConclusionInputColor = appState.darkMode ? '#ffffff' : '#000000';

    document.getElementById('p-conclusion-color').value = appState.conclusionColor || defaultConclusionInputColor;

    document.getElementById('p-conclusion-color-picker').value = appState.conclusionColor || defaultConclusionInputColor;

    document.getElementById('p-button-style').value = appState.buttonStyle;

    document.getElementById('p-premise-font').value = appState.premiseFont || 'default';

    document.getElementById('p-score-mode').value = appState.scoreMode || 'net';

    document.getElementById('p-hide-side-buttons').checked = appState.hideSideButtons || false;

    document.getElementById('p-71').value = appState.stimulusSize || 'normal';

    applyAppearanceSettings();

    applyFlatSettings();

    applySwapButtons();

    applyNavBar();

    applyHideSideButtons();

    // Sync palette button highlights with saved theme color
    syncPaletteHighlights();

}



function populateProgressionDropdown() {

    const timeBumper = document.getElementById('time-bumper');

    const timeDropper = document.getElementById('time-dropper');

    const isAuto = savedata.autoProgressionChange === 'auto';



    timeBumper.style.display = isAuto ? 'none' : 'flex';

    timeDropper.style.display = isAuto ? 'none' : 'flex';

}





function handleColorChange(event) {

    const color = event.target.value;

    if (appState.darkMode) {

        appState.gameAreaColor = color;

    } else {

        appState.gameAreaLightColor = color;

    }

    refresh();

}



function handleSfxChange(event) {

    appState.sfx = event.target.value;

    refresh();

}



function handleTimerAnimChange(event) {

    appState.timerAnimation = event.target.value;

    save();

}



function handleFontSizeChange(event) {

    appState.fontSize = event.target.value;

    applyAppearanceSettings();

    save();

}



function handleDensityChange(event) {

    appState.uiDensity = event.target.value;

    applyAppearanceSettings();

    save();

}



function handleBracketColorChange(event) {

    appState.bracketColor = event.target.value;

    applyAppearanceSettings();

    save();

}



function handleTimerHeightChange(event) {

    appState.timerHeight = event.target.value;

    applyAppearanceSettings();

    save();

}



function handleBorderRadiusChange(event) {

    appState.borderRadius = event.target.value;

    applyAppearanceSettings();

    save();

}



function handlePremiseStyleChange(event) {

    appState.premiseStyle = event.target.value;

    applyAppearanceSettings();

    save();

}



function handlePresetColorClick(button) {

    const color = button.getAttribute('data-color');

    document.getElementById('p-bracket-color').value = color;

    document.getElementById('p-bracket-color-picker').value = color;

    appState.bracketColor = color;

    applyAppearanceSettings();

    save();

}

const PALETTE_COLORS = {
    red: '#f42536',
    orange: '#f97a1f',
    yellow: '#f9ce1f',
    green: '#18dc6a',
    blue: '#3377ff',
    indigo: '#7e47eb',
    violet: '#bf4de6'
};

const PALETTE_HUES = {
    red: 0,
    orange: 25,
    yellow: 48,
    green: 145,
    blue: 220,
    indigo: 255,
    violet: 285
};

function handlePaletteChange(palette) {
    const color = PALETTE_COLORS[palette] || '#3377ff';
    const hue = PALETTE_HUES[palette] || 220;
    document.getElementById('p-bracket-color').value = color;
    document.getElementById('p-bracket-color-picker').value = color;
    appState.bracketColor = color;
    // Immediately set CSS variables to ensure change is visible
    const root = document.documentElement;
    root.style.setProperty('--theme-color', color);
    root.style.setProperty('--accent-h', hue);
    root.style.setProperty('--accent-color', color);
    // Highlight selected palette button
    document.querySelectorAll('#palette-picker button').forEach(btn => {
        btn.style.border = '2px solid transparent';
        btn.style.transform = 'scale(1)';
    });
    const selected = document.querySelector(`#palette-picker button[data-palette="${palette}"]`);
    if (selected) {
        selected.style.border = '2px solid #fff';
        selected.style.transform = 'scale(1.2)';
    }
    applyAppearanceSettings();
    save();
}

const CONCLUSION_PALETTE_COLORS = {
    white: '#ffffff',
    red: '#f42536',
    orange: '#f97a1f',
    yellow: '#f9ce1f',
    green: '#18dc6a',
    blue: '#3377ff',
    indigo: '#7e47eb',
    violet: '#bf4de6'
};

function handleConclusionPaletteChange(palette) {
    const color = CONCLUSION_PALETTE_COLORS[palette] || '#ffffff';
    document.getElementById('p-conclusion-color').value = color;
    document.getElementById('p-conclusion-color-picker').value = color;
    appState.conclusionColor = color;
    // Highlight selected palette button
    document.querySelectorAll('#conclusion-palette-picker button').forEach(btn => {
        btn.style.border = '2px solid transparent';
        btn.style.transform = 'scale(1)';
    });
    const selected = document.querySelector(`#conclusion-palette-picker button[data-conclusion-palette="${palette}"]`);
    if (selected) {
        selected.style.border = '2px solid #fff';
        selected.style.transform = 'scale(1.2)';
    }
    applyAppearanceSettings();
    save();
}

function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function syncPaletteHighlights() {
    // Sync theme palette
    const themeColor = (appState.bracketColor || '#3377ff').toLowerCase();
    document.querySelectorAll('#palette-picker button').forEach(btn => {
        const palette = btn.getAttribute('data-palette');
        const color = PALETTE_COLORS[palette];
        if (color && color.toLowerCase() === themeColor) {
            btn.style.border = '2px solid #fff';
            btn.style.transform = 'scale(1.2)';
        } else {
            btn.style.border = '2px solid transparent';
            btn.style.transform = 'scale(1)';
        }
    });
    // Sync conclusion palette
    const conclusionColor = (appState.conclusionColor || '#ffffff').toLowerCase();
    document.querySelectorAll('#conclusion-palette-picker button').forEach(btn => {
        const palette = btn.getAttribute('data-conclusion-palette');
        const color = CONCLUSION_PALETTE_COLORS[palette];
        if (color && color.toLowerCase() === conclusionColor) {
            btn.style.border = '2px solid #fff';
            btn.style.transform = 'scale(1.2)';
        } else {
            btn.style.border = '2px solid transparent';
            btn.style.transform = 'scale(1)';
        }
    });
}



function handleBracketColorChange(event) {

    const color = event.target.value;

    appState.bracketColor = color;

    document.getElementById('p-bracket-color-picker').value = color;

    applyAppearanceSettings();

    save();

}



function handleBracketColorPickerChange(event) {

    const color = event.target.value;

    appState.bracketColor = color;

    document.getElementById('p-bracket-color').value = color;

    applyAppearanceSettings();

    save();

}



function handleColorWordsChange(event) {

    appState.colorWords = event.target.checked;

    applyAppearanceSettings();

    save();

}



function handleColorTimerChange(event) {

    appState.colorTimer = event.target.checked;

    applyAppearanceSettings();

    save();

}



function handleButtonStyleChange(event) {

    appState.buttonStyle = event.target.value;

    applyAppearanceSettings();

    save();

}



function handlePremiseFontChange(event) {

    appState.premiseFont = event.target.value;

    applyAppearanceSettings();

    save();

}



function handleStimulusSizeChange(event) {

    appState.stimulusSize = event.target.value;

    applyAppearanceSettings();

    save();

}



function handleScoreModeChange(event) {

    appState.scoreMode = event.target.value;

    updateScoreDisplay();

    save();

}



function updateScoreDisplay(questions) {

    const qs = questions || appState.questions;

    if (appState.scoreMode === 'correct') {

        const correctCount = qs.filter(q => q.correctness === 'right').length;

        correctlyAnsweredEl.innerText = correctCount;

        nextLevelEl.innerText = qs.length;

    } else {

        correctlyAnsweredEl.innerText = appState.score;

        nextLevelEl.innerText = qs.length;

    }

}



function handleHideSideButtonsChange(event) {

    appState.hideSideButtons = event.target.checked;

    applyHideSideButtons();

    save();

}



function applyHideSideButtons() {

    const shouldHide = appState.hideSideButtons && window.innerWidth > 768;

    if (shouldHide) {

        document.body.classList.add('hide-side-buttons');

        setupProximityDetection();

    } else {

        document.body.classList.remove('hide-side-buttons');

        removeProximityDetection();

    }

}



let proximityCleanup = null;

let stableButtonRects = new Map();



function setupProximityDetection() {

    if (proximityCleanup) return;

    const buttons = document.querySelectorAll('label.side-btn-reveal');

    const proximityRadius = 60;

    

    // Store stable positions from when buttons are revealed

    buttons.forEach(btn => {

        btn.classList.add('revealed');

        stableButtonRects.set(btn, btn.getBoundingClientRect());

        btn.classList.remove('revealed');

    });

    

    const onMouseMove = (e) => {

        buttons.forEach(btn => {

            const rect = stableButtonRects.get(btn);

            if (!rect) return;

            

            const nearestX = Math.max(rect.left, Math.min(e.clientX, rect.right));

            const nearestY = Math.max(rect.top, Math.min(e.clientY, rect.bottom));

            const dist = Math.hypot(e.clientX - nearestX, e.clientY - nearestY);

            

            if (dist < proximityRadius) {

                btn.classList.add('revealed');

            } else {

                btn.classList.remove('revealed');

            }

        });

    };

    

    document.addEventListener('mousemove', onMouseMove);

    

    proximityCleanup = () => {

        document.removeEventListener('mousemove', onMouseMove);

        buttons.forEach(btn => btn.classList.remove('revealed'));

        stableButtonRects.clear();

    };

}



function removeProximityDetection() {

    if (proximityCleanup) {

        proximityCleanup();

        proximityCleanup = null;

    }

}



function handleConclusionStyleChange(event) {

    appState.conclusionStyle = event.target.value;

    applyAppearanceSettings();

    save();

}



function handleConclusionPresetColorClick(button) {

    const color = button.getAttribute('data-color');

    document.getElementById('p-conclusion-color').value = color;

    document.getElementById('p-conclusion-color-picker').value = color;

    appState.conclusionColor = color;

    applyAppearanceSettings();

    save();

}



function handleConclusionColorChange(event) {

    const color = event.target.value;

    appState.conclusionColor = color;

    document.getElementById('p-conclusion-color-picker').value = color;

    applyAppearanceSettings();

    save();

}



function handleConclusionColorPickerChange(event) {

    const color = event.target.value;

    appState.conclusionColor = color;

    document.getElementById('p-conclusion-color').value = color;

    applyAppearanceSettings();

    save();

}



function applyAppearanceSettings() {

    const root = document.documentElement;

    const timerBar = document.querySelector('.timer__bar');

    const settingsContent = document.querySelectorAll('.settings-section-content');

    

    // Font size

    const fontSizes = { smallest: '0.75rem', small: '0.85rem', normal: '1rem', large: '1.15rem', huge: '1.3rem' };

    root.style.setProperty('--base-font-size', fontSizes[appState.fontSize] || '1rem');

    

    // UI Density - apply to multiple spacing elements

    const densities = { 'super-compact': '0.25rem', compact: '0.5rem', normal: '1rem', spacious: '1.5rem' };

    const density = densities[appState.uiDensity] || '1rem';

    root.style.setProperty('--ui-padding', density);

    root.style.setProperty('--section-gap', density);

    root.style.setProperty('--element-gap', `calc(${density} * 0.5)`);

    

    // Apply density to settings sections

    settingsContent.forEach(el => {

        el.style.gap = `calc(${density} * 0.75)`;

    });

    

    // UI Density for premises - scale padding and gap

    root.style.setProperty('--premise-gap', `calc(${density} * 0.5)`);

    root.style.setProperty('--premise-padding-y', `calc(${density} * 0.25)`);

    root.style.setProperty('--premise-padding-x', (appState.uiDensity === 'compact' || appState.uiDensity === 'super-compact') ? '0' : `calc(${density} * 0.25)`);

    

    // Theme color - sets glow, borders, buttons, and bracket colors

    const themeColor = appState.bracketColor || '#3377ff';

    root.style.setProperty('--theme-color', themeColor);

    root.style.setProperty('--bracket-color', themeColor);

    // compute derived accent colors (RGB and translucent variants) so sidebar

    // elements can follow the chosen theme color (works in light/dark modes)

    function hexToRgb(hex) {

        if (!hex) return null;

        hex = (hex + '').trim();

        if (hex[0] === '#') hex = hex.slice(1);

        if (hex.length === 3) {

            hex = hex.split('').map(c => c + c).join('');

        }

        if (hex.length !== 6) return null;

        const r = parseInt(hex.slice(0, 2), 16);

        const g = parseInt(hex.slice(2, 4), 16);

        const b = parseInt(hex.slice(4, 6), 16);

        if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;

        return { r, g, b };

    }

    const rgb = hexToRgb(themeColor) || { r: 33, g: 127, b: 228 };

    root.style.setProperty('--accent-color', themeColor);

    root.style.setProperty('--accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);

    root.style.setProperty('--accent-bg', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.06)`);

    root.style.setProperty('--accent-border', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.18)`);

    root.style.setProperty('--accent-hover', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`);

    root.style.setProperty('--accent-gear-bg', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`);

    root.style.setProperty('--accent-gear-bg-strong', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.18)`);

    // Compute hue for body background gradients
    const rN = rgb.r / 255, gN = rgb.g / 255, bN = rgb.b / 255;
    const max = Math.max(rN, gN, bN), min = Math.min(rN, gN, bN);
    let h = 0;
    if (max !== min) {
        const d = max - min;
        if (max === rN) h = ((gN - bN) / d + (gN < bN ? 6 : 0)) / 6;
        else if (max === gN) h = ((bN - rN) / d + 2) / 6;
        else h = ((rN - gN) / d + 4) / 6;
    }
    root.style.setProperty('--accent-h', Math.round(h * 360));

    

    // Timer height

    const timerHeights = { thin: '10px', normal: '20px', thick: '30px' };

    if (timerBar) timerBar.style.height = timerHeights[appState.timerHeight] || '20px';

    

    // Border radius - set CSS variable that .game-area uses

    const borderRadii = { sharp: '0px', slight: '6px', rounded: '12px', pill: '24px' };

    const radius = borderRadii[appState.borderRadius] || '12px';

    root.style.setProperty('--game-area-radius', radius);

    

    // Premise style - add/remove classes

    document.body.classList.remove('premise-minimal', 'premise-boxed', 'premise-card', 'premise-underline');

    document.body.classList.add('premise-' + appState.premiseStyle);



    // Conclusion style - add/remove classes

    document.body.classList.remove('conclusion-minimal', 'conclusion-boxed', 'conclusion-card', 'conclusion-underline');

    document.body.classList.add('conclusion-' + appState.conclusionStyle);



    // Conclusion color - defaults to white in dark mode, black in light mode

    const defaultConclusionColor = appState.darkMode ? '#ffffff' : '#000000';

    const conclusionColor = appState.conclusionColor || defaultConclusionColor;

    root.style.setProperty('--conclusion-color', conclusionColor);



    // Button style - only Contrast and Solid now

    document.body.classList.remove('btn-solid', 'btn-contrast');

    document.body.classList.add('btn-' + appState.buttonStyle);

    

    // Color words option

    if (appState.colorWords) {

        document.body.classList.add('colored-words');

    } else {

        document.body.classList.remove('colored-words');

    }

    

    // Color timer bar option

    if (appState.colorTimer) {

        document.body.classList.add('colored-timer');

    } else {

        document.body.classList.remove('colored-timer');

    }



    // Premise font

    document.body.classList.remove('premise-mono');

    if (appState.premiseFont === 'mono') {

        document.body.classList.add('premise-mono');

    }



    // Stimulus size (emoji, voronoi, topo)

    const stimulusSizes = { small: '0.85em', normal: '1.125em', large: '1.5em', huge: '2em' };

    root.style.setProperty('--stimulus-size', stimulusSizes[appState.stimulusSize] || '1.125em');

}



function handleFastUiChange(event) {

    appState.fastUi = event.target.checked;

    removeFastFeedback();

    refresh();

}



function handleDarkModeChange(event) {

    const isDarkMode = event.target.checked;

    // Reset conclusion color to mode-appropriate default when switching

    const oldDefault = isDarkMode ? '#000000' : '#ffffff';

    const newDefault = isDarkMode ? '#ffffff' : '#000000';

    if (appState.conclusionColor === oldDefault || !appState.conclusionColor) {

        appState.conclusionColor = newDefault;

    }

    appState.darkMode = isDarkMode;

    refresh();

}



function handleFlatSettingsChange(event) {

    appState.flatSettings = event.target.checked;

    if (appState.flatSettings && appState.navBar) {

        appState.navBar = false;

        document.getElementById('p-nav-bar').checked = false;

        applyNavBar();

    }

    applyFlatSettings();

    save();

}



function applyFlatSettings() {

    const sidebar = document.getElementById('sidebar-settings');

    if (!sidebar) return;

    if (appState.flatSettings) {

        sidebar.classList.add('flat-settings');

    } else {

        sidebar.classList.remove('flat-settings');

    }

}



function handleSwapButtonsChange(event) {

    appState.swapButtons = event.target.checked;

    applySwapButtons();

    save();

}



function applySwapButtons() {

    const btns = document.querySelector('.confirmation-buttons');

    if (!btns) return;

    if (appState.swapButtons) {

        btns.classList.add('swap-buttons');

    } else {

        btns.classList.remove('swap-buttons');

    }

}



function handleNavBarChange(event) {

    appState.navBar = event.target.checked;

    if (appState.navBar && appState.flatSettings) {

        appState.flatSettings = false;

        document.getElementById('p-flat-settings').checked = false;

        applyFlatSettings();

    }

    applyNavBar();

    save();

}



function applyNavBar() {

    const sidebar = document.getElementById('sidebar-settings');

    if (!sidebar) return;

    if (appState.navBar) {

        sidebar.classList.add('section-nav-bar');

    } else {

        sidebar.classList.remove('section-nav-bar');

    }

}



function handleColorlessChange(event) {

    savedata.enableColorless = event.target.checked;

    refresh();

}



async function updateCustomStyles() {

    let styles = '';

    if (imageChanged) {

        if (appState.backgroundImage) {

            const base64String = await getImage(imageKey);

            if (base64String) {

                const [prefix, base64Data] = base64String.split(',');

                const mimeType = prefix.match(/data:(.*?);base64/)[1];

                const binary = atob(base64Data);

                const len = binary.length;

                const bytes = new Uint8Array(len);

                for (let i = 0; i < len; i++) {

                    bytes[i] = binary.charCodeAt(i);

                }



                const blob = new Blob([bytes], { type: mimeType });

                const objectURL = URL.createObjectURL(blob);



                backgroundDiv.style.backgroundImage = `url(${objectURL})`;

            }

        } else {

            backgroundDiv.style.backgroundImage = ``;

        }

        imageChanged = false;

    }

    if (liveStyles.innerHTML !== styles) {

        liveStyles.innerHTML = styles;

    }



    const gameAreaColor = appState.darkMode ? appState.gameAreaColor : appState.gameAreaLightColor;

    const gameAreaImage = `${gameAreaColor}`

    if (gameArea.style.background !== gameAreaImage) {

        gameArea.style.background = '';

        gameArea.style.background = gameAreaImage;

    }

}



function enableConfirmationButtons() {

    confirmationButtons.style.pointerEvents = "all";

    confirmationButtons.style.opacity = 1;

}



function disableConfirmationButtons() {

    confirmationButtons.style.pointerEvents = "none";

    confirmationButtons.style.opacity = 0;

}



function renderCarousel() {

    if (!savedata.enableCarouselMode) {

        display.classList.add("visible");

        carousel.classList.remove("visible");

        enableConfirmationButtons();

        return;

    }

    const q = renderJunkEmojis(question);



    carousel.classList.add("visible");

    display.classList.remove("visible");



    const perPage = Math.max(1, savedata.carouselPremisesPerPage || 1);

    const totalPremises = q.premises.length;

    const premisePages = Math.ceil(totalPremises / perPage);



    // Handle "disable back button" option - hide it entirely

    const disableBack = savedata.carouselDisableBack || false;

    if (disableBack) {

        carouselBackButton.style.display = 'none';

    } else {

        carouselBackButton.style.display = '';

        // carouselIndex now represents "page number" for premises, then operations, then conclusion

        if (carouselIndex == 0) {

            carouselBackButton.disabled = true;

        } else {

            carouselBackButton.disabled = false;

        }

    }



    // Clear any existing auto-advance timer

    if (carouselAutoAdvanceTimer) {

        clearTimeout(carouselAutoAdvanceTimer);

        carouselAutoAdvanceTimer = null;

    }



    const autoSeconds = savedata.carouselAutoAdvanceSeconds || 0;

    const isConclusion = carouselIndex >= premisePages + (q.operations ? q.operations.length : 0);



    if (carouselIndex < premisePages) {

        // Showing premises (multiple per page)

        carouselNextButton.disabled = false;

        disableConfirmationButtons();

        carouselDisplayLabelType.textContent = "Premise";



        const startIdx = carouselIndex * perPage;

        const endIdx = Math.min(startIdx + perPage, totalPremises);

        const displayPremises = q.premises.slice(startIdx, endIdx);



        // Show range in progress (e.g., "1-3/5" or "4/5" for single)

        if (endIdx - startIdx > 1) {

            carouselDisplayLabelProgress.textContent = (startIdx + 1) + "-" + endIdx + "/" + totalPremises;

        } else {

            carouselDisplayLabelProgress.textContent = (startIdx + 1) + "/" + totalPremises;

        }



        // Join premises with line break separator

        carouselDisplayText.innerHTML = displayPremises.join('<br><br>');

    } else if (q.operations && carouselIndex < premisePages + q.operations.length) {

        // Showing operations (one per page, unchanged)

        carouselNextButton.disabled = false;

        const operationIndex = carouselIndex - premisePages;

        disableConfirmationButtons();

        carouselDisplayLabelType.textContent = "Transformation";

        carouselDisplayLabelProgress.textContent = (operationIndex + 1) + "/" + q.operations.length;

        carouselDisplayText.innerHTML = q.operations[operationIndex];

    } else {

        // Conclusion

        carouselNextButton.disabled = true;

        enableConfirmationButtons();

        carouselDisplayLabelType.textContent = "Conclusion";

        carouselDisplayLabelProgress.textContent = "";

        carouselDisplayText.innerHTML = q.conclusion;

    }



    // Set up auto-advance timer if enabled and not on conclusion

    if (autoSeconds > 0 && !isConclusion) {

        carouselAutoAdvanceTimer = setTimeout(() => {

            if (savedata.enableCarouselMode) {

                carouselNext();

            }

        }, autoSeconds * 1000);

    }

}



function carouselBack() {

    carouselIndex--;

    renderCarousel();

}

  

function carouselNext() {

    carouselIndex++;

    renderCarousel();

}



let timerStartTime = 0;

let timerDuration = 0;

let timerAnimationFrame = null;

// Visual-only tween used when bonus time is added
let timerBonusAnimation = null;

function getTimerPctFromElapsed(elapsed) {
    if (!timerDuration || timerDuration <= 0) return 100;

    const clampedElapsed = Math.max(0, Math.min(elapsed, timerDuration));
    const t = clampedElapsed / timerDuration;

    let pct;

    if (appState.timerAnimation === 'stepEaseOut') {
        const totalSeconds = timerDuration / 1000;
        const stepped = t * totalSeconds;
        const currentSecond = Math.floor(stepped);
        const secondProgress = stepped % 1;
        const easedSecondProgress = 1 - Math.pow(1 - Math.min(secondProgress, 0.95), 3);

        pct = (1 - (currentSecond + easedSecondProgress) / totalSeconds) * 100;
    } else {
        const easingFn = easingFunctions[appState.timerAnimation] || easingFunctions.easeOutCubic;
        const easedT = easingFn(t);
        pct = (1 - easedT) * 100;
    }

    return Math.max(0, Math.min(100, pct));
}

function getActualElapsed(now) {
    return Math.max(0, now - timerStartTime);
}

function getVisualElapsed(now) {
    const actualElapsed = getActualElapsed(now);

    if (!timerBonusAnimation) return actualElapsed;

    const animElapsed = now - timerBonusAnimation.startedAt;
    const progress = Math.min(animElapsed / timerBonusAnimation.duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    const visualElapsed =
        timerBonusAnimation.fromElapsed +
        (timerBonusAnimation.toElapsed - timerBonusAnimation.fromElapsed) * eased;

    if (progress >= 1) {
        timerBonusAnimation = null;
        return actualElapsed;
    }

    return visualElapsed;
}


function startCountDown() {
    timerRunning = true;

    if (question) {
        question.startedAt = new Date().getTime();
    }

    timerDuration = findStartingTimerCount() * 1000;
    timerStartTime = performance.now();
    timerBonusAnimation = null;

    renderTimerBar(timerStartTime);

    if (timerAnimationFrame) {
        cancelAnimationFrame(timerAnimationFrame);
    }
    timerAnimationFrame = requestAnimationFrame(animateTimerBarSmooth);
}



function stopCountDown() {
    timerRunning = false;
    timerBonusAnimation = null;

    if (timerAnimationFrame) {
        cancelAnimationFrame(timerAnimationFrame);
        timerAnimationFrame = null;
    }

    timerBar.style.width = '100%';
}

// Add time bonus to the current question timer (for multiple conclusions)
function addTimeBonusToTimer(bonusSeconds) {
    if (!bonusSeconds || bonusSeconds <= 0) return;
    if (!question) return;
    if (!timerRunning || !timerStartTime) return;

    const now = performance.now();

    // Capture current visual state before changing the real timer
    const beforeElapsed = getVisualElapsed(now);
    const currentRemaining = Math.max(0, timerDuration - beforeElapsed);

    // Calculate the maximum bonus that won't exceed original duration
    const maxBonus = timerDuration - currentRemaining;
    const actualBonus = Math.min(bonusSeconds, maxBonus / 1000);

    if (actualBonus <= 0) return; // Already at or above full duration

    // FIX: adding bonus means moving start time forward, not backward
    timerStartTime += (actualBonus * 1000);

    const afterElapsed = getActualElapsed(now);

    // Animate the bar to the new fuller state
    timerBonusAnimation = {
        startedAt: now,
        duration: 450,
        fromElapsed: beforeElapsed,
        toElapsed: afterElapsed
    };

    renderTimerBar(now);

    if (!timerAnimationFrame) {
        timerAnimationFrame = requestAnimationFrame(animateTimerBarSmooth);
    }
}



function renderTimerBar(now = performance.now()) {
    const [mode, startingTimerCount] = findStartingTimerState();

    if (mode === 'override') {
        timerBar.classList.add('override');
        customTimeInfo.classList.add('visible');
        customTimeInfo.innerHTML =  '' + startingTimerCount + 's';
    } else {
        timerBar.classList.remove('override');
        customTimeInfo.classList.remove('visible');
        customTimeInfo.innerHTML = '';
    }

    const visualElapsed = getVisualElapsed(now);
    const pct = getTimerPctFromElapsed(visualElapsed);
    timerBar.style.width = pct + '%';
}



// Easing functions

const easingFunctions = {

    linear: t => t,

    easeOutCubic: t => 1 - Math.pow(1 - t, 3),

    easeOutQuart: t => 1 - Math.pow(1 - t, 4),

    easeOutBack: t => {

        const c1 = 1.70158;

        const c3 = c1 + 1;

        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);

    },

    easeOutBounce: t => {

        const n1 = 7.5625;

        const d1 = 2.75;

        if (t < 1 / d1) {

            return n1 * t * t;

        } else if (t < 2 / d1) {

            return n1 * (t -= 1.5 / d1) * t + 0.75;

        } else if (t < 2.5 / d1) {

            return n1 * (t -= 2.25 / d1) * t + 0.9375;

        } else {

            return n1 * (t -= 2.625 / d1) * t + 0.984375;

        }

    }

};



function animateTimerBarSmooth(now) {
    if (!timerRunning) return;

    const actualElapsed = getActualElapsed(now);
    const remaining = Math.max(0, timerDuration - actualElapsed);

    renderTimerBar(now);

    if (remaining > 0) {
        timerAnimationFrame = requestAnimationFrame(animateTimerBarSmooth);
    } else {
        timerBonusAnimation = null;
        timerAnimationFrame = null;
        timeElapsed();
    }
}



function findStartingTimerCount() {

    const [_, count] = findStartingTimerState();

    return count;

}



function findStartingTimerState() {

    if (question) {

        if (question.countdown) {

            return ['override', Math.max(1, question.countdown)];

        } else if (question.timeOffset) {

            return ['override', Math.max(1, +timerTime + question.timeOffset)];

        }

    }

    return ['default', Math.max(1, +timerTime)];

}



function generateQuestion() {

    const analogyEnable = [

        savedata.enableDistinction,

        savedata.enableLinear,

        savedata.enableDirection,

        savedata.enableDirection3D,

        savedata.enableDirection4D,

        savedata.enableAnchorSpace,

        savedata.enableAnchorSpaceV2,

        savedata.enableMultiDim5D,

        savedata.enableMultiDim6D

    ].reduce((a, c) => a + +c, 0) > 0;



    const binaryEnable = [

        savedata.enableDistinction,

        savedata.enableLinear,

        savedata.enableDirection,

        savedata.enableDirection3D,

        savedata.enableDirection4D,

        savedata.enableAnchorSpace,

        savedata.enableAnchorSpaceV2,

        savedata.enableSyllogism

    ].reduce((a, c) => a + +c, 0) > 1;



    const generators = [];

    let quota = savedata.premises;

    quota = Math.max(2, quota);

    quota = Math.min(quota, maxStimuliAllowed());



    const banNormalModes = savedata.onlyAnalogy || savedata.onlyBinary || savedata.onlyMixedModes;



    if (!banNormalModes) {

        if (savedata.enableDistinction)

            generators.push(createDistinctionGenerator(quota));

        if (savedata.enableLinear)

            generators.push(...createLinearGenerators(quota));

        if (savedata.enableSyllogism)

            generators.push(createSyllogismGenerator(quota));

        if (savedata.enableDirection)

            generators.push(createDirectionGenerator(quota));

        if (savedata.enableDirection3D)

            generators.push(createDirection3DGenerator(quota));

        if (savedata.enableDirection4D)

            generators.push(createDirection4DGenerator(quota));

        if (savedata.enableMultiDim5D)

            generators.push(createMultiDim5DGenerator(quota));

        if (savedata.enableMultiDim6D)

            generators.push(createMultiDim6DGenerator(quota));

        if (savedata.enableAnchorSpace)

            generators.push(createAnchorSpaceGenerator(quota));

        if (savedata.enableAnchorSpaceV2)

            generators.push(createAnchorSpaceV2Generator(quota));

    }



    // Mixed Modes - combines multiple question types

    if (savedata.enableMixedModes && !savedata.onlyAnalogy && !savedata.onlyBinary) {

        const mixedMode = createMixedModeGenerator(quota);

        if (mixedMode.question.getAvailableModes().length >= 2) {

            generators.push(mixedMode);

        }

    }



    if (

     savedata.enableAnalogy

     && !savedata.onlyBinary

     && analogyEnable

    ) {

        generators.push(createAnalogyGenerator(quota));

    }



    const binaryQuota = getPremisesFor('overrideBinaryPremises', quota);

    if (

     savedata.enableBinary

     && (savedata.onlyBinary || !savedata.onlyAnalogy)

     && binaryEnable

    ) {

        if ((savedata.maxNestedBinaryDepth ?? 1) <= 1)

            generators.push(createBinaryGenerator(quota));

        else

            generators.push(createNestedBinaryGenerator(quota));

    }



    if (savedata.enableAnalogy && !analogyEnable) {

        customAlert('ANALOGY needs at least 1 other question class (SYLLOGISM and BINARY do not count).');

        if (savedata.onlyAnalogy)

            return;

    }



    if (savedata.enableBinary && !binaryEnable) {

        customAlert('BINARY needs at least 2 other question classes (ANALOGY does not count).');

        if (savedata.onlyBinary)

            return;

    }

    if (generators.length === 0)

        return;



    const totalWeight = generators.reduce((sum, item) => sum + item.weight, 0);

    const randomValue = Math.random() * totalWeight;

    let cumulativeWeight = 0;

    let q;

    for (let generator of generators) {

        cumulativeWeight += generator.weight;

        if (randomValue < cumulativeWeight) {

            q = generator.question.create(generator.premiseCount);

            break;

        }

    }



    return q;

}



function init() {

    stopCountDown();

    question = generateQuestion();

    if (!question) {

        return;

    }



    stopCountDown();

    if (timerToggled) {

        // Delay timer start so premises can be seen at full time first
        setTimeout(() => {
            startCountDown();
        }, 500);

    } else {

        // Reset timer bar to full width when timer is not active
        const [mode, startingTimerCount] = findStartingTimerState();

        if (mode === 'override') {
            timerBar.classList.add('override');
            customTimeInfo.classList.add('visible');
            customTimeInfo.innerHTML = '' + startingTimerCount + 's';
        } else {
            timerBar.classList.remove('override');
            customTimeInfo.classList.remove('visible');
            customTimeInfo.innerHTML = '';
        }

        timerBar.style.width = '100%';

    }



    carouselInit();

    displayInit();

    PROGRESS_STORE.renderCurrentProgress(question);

    renderConclusionSpoiler();

}



function renderConclusionSpoiler() {

    if (savedata.spoilerConclusion) {

        spoilerArea.classList.add('spoiler');

    } else {

        spoilerArea.classList.remove('spoiler');

    }



    // Handle vanishing premises - only works with spoiler conclusion

    if (savedata.vanishingPremises && savedata.spoilerConclusion) {

        spoilerArea.classList.add('vanish-premises');

    } else {

        spoilerArea.classList.remove('vanish-premises');

    }

}



const DEFAULT_SOUNDS = {

    success: { audio: new Audio('sounds/default/success.mp3'), time: 2000},

    failure: { audio: new Audio('sounds/default/failure.mp3'), time: 1400},

    missed: { audio: new Audio('sounds/default/missed.mp3'), time: 1400},

}



const ZEN_SOUNDS = {

    success: { audio: new Audio('sounds/zen/success.mp3'), time: 2000 },

    failure: { audio: new Audio('sounds/zen/failure.mp3'), time: 1400 },

    missed: { audio: new Audio('sounds/zen/missed.mp3'), time: 1400 },

}



function playSoundFor(sound, duration) {

    sound.currentTime = 0;

    sound.volume = 0.6;

    sound.play();



    setTimeout(() => {

        let fadeOut = setInterval(() => {

            if (sound.volume > 0.10) {

                sound.volume -= 0.10;

            } else {

                clearInterval(fadeOut);

                sound.pause();

                sound.currentTime = 0;

                sound.volume = 0.6;

            }

        }, 100);

    }, duration - 600);

}



function getCurrentSoundPack() {

    if (appState.sfx === 'sfx1') {

        return DEFAULT_SOUNDS;

    } else if (appState.sfx === 'sfx2') {

        return ZEN_SOUNDS;

    }

    return null;

}



function playSound(property) {

    const sounds = getCurrentSoundPack();

    if (sounds) {

        playSoundFor(sounds[property].audio, sounds[property].time);

    }

}



function removeFastFeedback() {

    gameArea.classList.remove('right');

    gameArea.classList.remove('wrong');

    gameArea.classList.remove('missed');

}



let fastFeedbackTimer = null;

function fastFeedback(cb, className) {

    if (fastFeedbackTimer) {

        clearTimeout(fastFeedbackTimer);

        fastFeedbackTimer = null;

    }

    removeFastFeedback();

    gameArea.classList.add(className);

    setTimeout(() => {

        cb();

        processingAnswer = false;

        fastFeedbackTimer = setTimeout(() => {

            removeFastFeedback();

        }, 1000);

    }, 350);

}



// Show per-conclusion feedback (doesn't interfere with processingAnswer state)
// isIntermediate: if true, use faster timing for multi-conclusion mode
function showConclusionResult(isCorrect, callback, isIntermediate = false) {
    playSound(isCorrect ? 'success' : 'failure');

    // Match original timing from oldindex.js
    // wowFeedbackRight/Wrong/Missed used 1000ms
    // fastFeedback used 350ms
    let delay;
    if (savedata.fastUi) {
        delay = 350; // Original fastFeedback timing
    } else if (isIntermediate) {
        delay = 550; // Brief feedback between conclusions
    } else {
        delay = 1000; // Match original wowFeedback timing for final conclusion
    }

    if (appState.fastUi) {
        removeFastFeedback();
        gameArea.classList.add(isCorrect ? 'right' : 'wrong');
        setTimeout(() => {
            removeFastFeedback();
            if (callback) callback();
        }, delay);
    } else {
        const feedbackEl = isCorrect ? feedbackRight : feedbackWrong;
        feedbackEl.classList.add("active");
        setTimeout(() => {
            feedbackEl.classList.remove("active");
            if (callback) callback();
        }, delay);
    }
}

function wowFeedbackRight(cb) {

    playSound('success');

    if (appState.fastUi) {

        fastFeedback(cb, 'right');

    } else {

        feedbackRight.classList.add("active");

        setTimeout(() => {

            feedbackRight.classList.remove("active");

            cb();

            processingAnswer = false;

        }, 1000);

    }

}



function wowFeedbackWrong(cb) {

    playSound('failure');

    if (appState.fastUi) {

        fastFeedback(cb, 'wrong');

    } else {

        feedbackWrong.classList.add("active");

        setTimeout(() => {

            feedbackWrong.classList.remove("active");

            cb();

            processingAnswer = false;

        }, 1000);

    }

}



function wowFeedbackMissed(cb) {

    playSound('missed');

    if (appState.fastUi) {

        fastFeedback(cb, 'missed');

    } else {

        feedbackMissed.classList.add("active");

        setTimeout(() => {

            feedbackMissed.classList.remove("active");

            cb();

            processingAnswer = false;

        }, 1000);

    }

}



function wowFeedback() {
    if (question.correctness === 'right') {
        wowFeedbackRight(init);
    } else if (question.correctness === 'wrong') {
        wowFeedbackWrong(init);
    } else {
        wowFeedbackMissed(init);
    }
}



function storeQuestionAndSave() {

    appState.questions.push(question);

    if (timerToggle.checked) {

        PROGRESS_STORE.storeCompletedQuestion(question)

    }

    save();

}



function checkIfTrue() {
    handleConclusionAnswer(true);
}

function checkIfFalse() {
    handleConclusionAnswer(false);
}

// Single state machine for all answer handling
function handleConclusionAnswer(userAnswer) {
    if (processingAnswer) return;

    trueButton.blur();
    falseButton.blur();
    processingAnswer = true;

    const q = question;
    const isMulti = savedata.multipleConclusionsMode && q.conclusions && q.conclusions.length > 1;

    if (!isMulti) {
        // Single conclusion mode - simple path

        // Defensive: ensure isValid is defined (default to false if somehow undefined)
        const questionIsValid = q.isValid ?? false;
        const isCorrect = userAnswer === questionIsValid;

        q.answerUser = userAnswer;

        if (isCorrect) {

            appState.score++;

            q.correctness = 'right';

        } else {

            appState.score--;

            q.correctness = 'wrong';

        }

        q.answeredAt = new Date().getTime();

        // Immediately update progress display

        updateScoreDisplay(appState.questions.concat(q));

        // Single conclusion - use original wowFeedback flow (1000ms delay)

        storeQuestionAndSave();

        renderHQL(true);

        wowFeedback();

        processingAnswer = false;

        return;

    }

    // Multiple conclusions mode
    if (!q.userAnswers) q.userAnswers = [];
    if (q.currentConclusionIndex === undefined) q.currentConclusionIndex = 0;

    const idx = q.currentConclusionIndex;
    const current = q.conclusions[idx];
    if (!current) {
        processingAnswer = false;
        return;
    }
    // Defensive: ensure isValid is defined (default to false if somehow undefined)
    const conclusionIsValid = current.isValid ?? false;
    const isCorrect = userAnswer === conclusionIsValid;

    q.userAnswers[idx] = userAnswer;

    // Immediately update progress indicator for multiple conclusions
    updateConclusionProgress(q);

    // Check if this is an intermediate conclusion (not the last one)
    const isIntermediateConclusion = idx + 1 < q.conclusions.length;

    // Use faster feedback for intermediate conclusions in multi-conclusion mode
    showConclusionResult(isCorrect, () => {
        const nextIndex = idx + 1;

        if (nextIndex < q.conclusions.length) {
            // More conclusions to answer
            q.currentConclusionIndex = nextIndex;

            // Add time bonus if enabled AND multiple conclusions mode is active
            if (savedata.timeBonusPerConclusionEnabled && savedata.multipleConclusionsMode) {
                addTimeBonusToTimer(savedata.timeBonusPerConclusion);
            }

            refreshDisplayForNextConclusion();
            processingAnswer = false;
        } else {
            // All conclusions answered - calculate final result
            const numCorrect = q.userAnswers.filter(
                (ans, i) => ans === q.conclusions[i].isValid
            ).length;
            q.numCorrect = numCorrect;
            q.currentConclusionIndex = nextIndex; // Mark as finished

            // Question passed only if ALL conclusions correct
            const isQuestionCorrect = numCorrect === q.conclusions.length;

            q.answerUser = isQuestionCorrect;
            if (isQuestionCorrect) {
                appState.score++;
                q.correctness = 'right';
            } else {
                appState.score--;
                q.correctness = 'wrong';
            }
            q.answeredAt = new Date().getTime();

            storeQuestionAndSave();
            renderHQL(true);
            // Move to next puzzle after final conclusion feedback
            init();
            processingAnswer = false;
        }
    }, isIntermediateConclusion);
}

// Refresh display to show next conclusion
function refreshDisplayForNextConclusion() {
    const q = question;
    const isMulti = savedata.multipleConclusionsMode && q.conclusions && q.conclusions.length > 1;

    if (!isMulti) return;

    const currentIdx = q.currentConclusionIndex || 0;
    const conclusionLabel = `Conclusion ${currentIdx + 1} of ${q.conclusions.length}`;
    const currentConclusionObj = q.conclusions[currentIdx];
    if (!currentConclusionObj) return;
    const currentConclusion = renderJunkEmojisText(currentConclusionObj.conclusion, q.pattern);

    // Update the conclusion label and content
    const postambleEl = document.querySelector('.postamble');
    const conclusionEl = document.querySelector('.formatted-conclusion');

    if (postambleEl) {
        postambleEl.textContent = conclusionLabel;
    }
    if (conclusionEl) {
        conclusionEl.innerHTML = currentConclusion;
    }
}

// Update progress indicator immediately during multiple conclusions
function updateConclusionProgress(q) {
    if (!q.conclusions || q.conclusions.length <= 1) return;

    const answeredCount = (q.userAnswers || []).filter(ans => ans !== undefined).length;
    const totalConclusions = q.conclusions.length;

    // Update the score display to show conclusion progress
    // Format: "X / Y" where X is answered, Y is total conclusions
    const progressEl = document.querySelector('.correctly-answered');
    if (progressEl && answeredCount > 0) {
        // Store original score to restore later
        if (!q.originalScoreForProgress) {
            q.originalScoreForProgress = appState.score;
        }
        // Show interim progress (e.g., "3/5" for 3rd of 5 conclusions)
        progressEl.innerText = `${answeredCount}/${totalConclusions}`;
    }
}

function timeElapsed() {

    if (processingAnswer) {

        return;

    }

    processingAnswer = true;

    appState.score--;

    question.correctness = 'missed';

    question.answerUser = undefined;

    question.answeredAt = new Date().getTime();

    storeQuestionAndSave();

    renderHQL(true);

    wowFeedback();

}



function resetApp() {

    customConfirm("Are you sure you want to reset? This cannot be undone.", () => {

        localStorage.removeItem(oldSettingsKey);

        localStorage.removeItem(imageKey);

        localStorage.removeItem(profilesKey);

        localStorage.removeItem(selectedProfileKey);

        localStorage.removeItem(appStateKey);

        document.getElementById("reset-app").innerText = 'Resetting...';

        deleteDatabase("SyllDB").then(() => {

            window.location.reload();

        });

    }, 'Reset', 'Cancel');

}



function clearHistory() {

    customConfirm("Clear session history? (does not remove progress graph history)", () => {

        appState.questions = [];

        appState.score = 0;

        save();

        renderHQL();

    }, 'Clear', 'Cancel');

}



function deleteQuestion(i, isRight) {

    appState.score += (isRight ? -1 : 1);

    appState.questions.splice(i, 1);

    save();

    renderHQL();

}

function renderHQL(didAddSingleQuestion=false) {

    const emptyEl = document.getElementById('history-empty');

    if (didAddSingleQuestion) {

        const index = appState.questions.length - 1;

        const recentQuestion = appState.questions[index];

        const firstChild = historyList.firstElementChild;

        historyList.insertBefore(createHQLI(recentQuestion, index), firstChild);

        // Hide empty state placeholder
        if (emptyEl) emptyEl.style.display = 'none';

    } else {

        historyList.innerHTML = "";


        const len = appState.questions.length;

        const reverseChronological = appState.questions.slice().reverse();



        reverseChronological

            .map((q, i) => {

                const el = createHQLI(q, len - i - 1);

                return el;

            })

            .forEach(el => historyList.appendChild(el));

        // Show/hide empty state based on whether there are questions
        if (emptyEl) emptyEl.style.display = len > 0 ? 'none' : 'flex';

    }



    updateAverage(appState.questions);

    updateScoreDisplay();

}



function updateAverage(reverseChronological) {

    let questions = reverseChronological.filter(q => q.answeredAt && q.startedAt);

    let times = questions.map(q => (q.answeredAt - q.startedAt) / 1000);

    if (times.length == 0) {

        return;

    }

    const totalTime = times.reduce((a,b) => a + b, 0);

    const minutes = Math.floor(totalTime / 60);

    const seconds = totalTime % 60;

    totalDisplay.innerHTML = minutes.toFixed(0) + 'm ' + seconds.toFixed(0) + 's';

    

    const average =  totalTime / times.length;

    averageDisplay.innerHTML = average.toFixed(1) + 's';



    const correctQuestions = questions.filter(q => q.correctness == 'right');

    const percentCorrect = 100 * correctQuestions.length / questions.length;

    percentCorrectDisplay.innerHTML = percentCorrect.toFixed(1) + '%';

    const correctTimes = correctQuestions.map(q => (q.answeredAt - q.startedAt) / 1000);

    if (correctTimes.length == 0) {

        averageCorrectDisplay.innerHTML = 'None yet';

        return;

    }

    const totalTimeBeingCorrect = correctTimes.reduce((a,b) => a + b, 0);

    const averageCorrect = totalTimeBeingCorrect / correctTimes.length;

    averageCorrectDisplay.innerHTML = averageCorrect.toFixed(1) + 's';

}



function createHQLI(question, i) {

    const q = renderJunkEmojis(question);

    const parent = document.createElement("DIV");



    const answerUser = q.answerUser;

    const answerUserClassName = {

        'missed': '',

        'right': String(answerUser).toLowerCase(),

        'wrong': String(answerUser).toLowerCase(),

    }[q.correctness];

    

    const answer = String(q.isValid).toLowerCase();

    let classModifier = {

        'missed': '',

        'right': 'hqli--right',

        'wrong': 'hqli--wrong'

    }[q.correctness];

    

    let answerDisplay = ('' + answer).toUpperCase();

    let answerUserDisplay = {

        'missed': '(TIMED OUT)',

        'right': ('' + answerUser).toUpperCase(),

        'wrong': ('' + answerUser).toUpperCase()

    }[q.correctness];



    const htmlPremises = q.premises

        .map(p => `<div class="hqli-premise" style="margin-bottom:0.4rem">${p}</div>`)

        .join("\n");



    const htmlOperations = q.operations ? q.operations.map(o => `<div class="hqli-operation">${o}</div>`).join("\n") : '';



    let responseTimeHtml = '';

    if (q.startedAt && q.answeredAt)

        responseTimeHtml =

`

        <div class="hqli-response-time">${Math.round((q.answeredAt - q.startedAt) / 1000)} sec</div>

`;

    

    const html =

`<div class="hqli ${classModifier}">

    <div class="inner">

        <div class="index"></div>

        <div class="hqli-premises">

            <div class="hqli-preamble">Premises</div>

            ${htmlPremises}

            ${htmlOperations ? '<div class="hqli-transform-header">Transformations</div>' : ''}

            ${htmlOperations}

        </div>

        ${(q.conclusions && q.conclusions.length > 1)
            ? q.conclusions.map((c, i) => {
                const userAns = (q.userAnswers || [])[i];
                const wasCorrect = userAns === c.isValid;
                const concClass = wasCorrect ? 'correct' : 'wrong';
                const answerText = userAns === true ? 'TRUE' : (userAns === false ? 'FALSE' : '-');
                const correctText = c.isValid ? 'TRUE' : 'FALSE';
                const answerSpanClass = userAns === true ? 'conc-true' : (userAns === false ? 'conc-false' : '');
                const correctSpanClass = c.isValid ? 'conc-true' : 'conc-false';
                return `<div class="hqli-postamble">Conclusion ${i + 1} of ${q.conclusions.length} — You: <span class="${answerSpanClass}">${answerText}</span> (correct: <span class="${correctSpanClass}">${correctText}</span>)</div>
        <div class="hqli-conclusion ${concClass}">${c.conclusion}</div>`;
            }).join('')
            : `<div class="hqli-postamble">Conclusion</div>
        <div class="hqli-conclusion">${q.conclusion}</div>`
        }

        ${(q.conclusions && q.conclusions.length > 1)
            ? `<div class="hqli-answer-user ${classModifier}">${q.numCorrect || 0}/${q.conclusions.length} correct</div>`
            : `<div class="hqli-answer-user ${answerUserClassName}">${answerUserDisplay}</div>

        <div class="hqli-answer ${answer}">${answerDisplay}</div>`
        }

        ${responseTimeHtml}

        <div class="hqli-footer">

            <div>${q.category}</div>

            ${createExplanationButton(q)}

            <button class="delete">X</button>

        </div>

    </div>

</div>`;

    parent.innerHTML = html;

    parent.querySelector(".index").textContent = i + 1;

    parent.querySelector(".delete").addEventListener('click', (e) => {

        e.stopPropagation();

        deleteQuestion(i, q.correctness === 'right');

    });

    const explanationButton = parent.querySelector(".explanation-button");

    if (explanationButton) {
        let isPinned = false;

        explanationButton.addEventListener('mouseenter', (e) => {
            if (!isPinned) {
                createExplanationPopup(q, e, false);
            }
        });

        explanationButton.addEventListener('mouseleave', () => {
            if (!isPinned) {
                removeExplanationPopup();
            }
        });

        // Close pinned popup when clicking anywhere on screen
        const closeOnClick = (e) => {
            if (isPinned) {
                e.stopImmediatePropagation();
                isPinned = false;
                explanationButton.classList.remove('pinned');
                removeExplanationPopup();
                document.removeEventListener('click', closeOnClick, true);
                // Delay clearing flag to ensure sidebar handler doesn't close it
                setTimeout(() => {
                    window.isExplanationPopupOpen = false;
                }, 50);
            }
        };

        explanationButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isPinned) {
                // Already pinned, unpin and close
                isPinned = false;
                explanationButton.classList.remove('pinned');
                removeExplanationPopup();
                document.removeEventListener('click', closeOnClick, true);
                window.isExplanationPopupOpen = false;
            } else {
                // Pin it
                removeExplanationPopup();
                isPinned = true;
                explanationButton.classList.add('pinned');
                createExplanationPopup(q, e, true);
                // Set flag to prevent sidebar from closing
                window.isExplanationPopupOpen = true;
                // Add listener to close on next click anywhere (capture phase)
                setTimeout(() => document.addEventListener('click', closeOnClick, true), 0);
            }
        });
    }

    return parent.firstElementChild;

}



function toggleLegacyFolder() {

    appState.isLegacyOpen = !appState.isLegacyOpen;

    renderFolders();

    save();

}



function toggleExperimentalFolder() {

    appState.isExperimentalOpen = !appState.isExperimentalOpen;

    renderFolders();

    save();

}



function renderFolders() {

    renderFolder('legacy-folder-arrow', 'legacy-folder-content', appState.isLegacyOpen);

    renderFolder('experimental-folder-arrow', 'experimental-folder-content', appState.isExperimentalOpen);

}



function renderFolder(arrowId, contentId, isOpen) {

    const folderArrow = document.getElementById(arrowId);

    const folderContent = document.getElementById(contentId);

    if (isOpen) {

        folderContent.style.display = 'block';

        folderArrow.classList.add('open');

    } else {

        folderContent.style.display = 'none';

        folderArrow.classList.remove('open');

    }

}



// Events

timerInput.addEventListener("input", evt => {

    const el = evt.target;

    timerTime = el.value;

    timerCount = findStartingTimerCount();

    el.style.width = (el.value.length + 4) + 'ch';

    savedata.timer = el.value;

    if (timerToggle.checked) {

        stopCountDown();

        startCountDown();

    }

    save();

});



function handleCountDown() {

    timerToggled = timerToggle.checked;

    if (timerToggled && !isPatternMemorizationPhase)

        startCountDown();

    else

        stopCountDown();

}



timerToggle.addEventListener("click", evt => {

    handleCountDown();

});



let dehoverQueue = [];

function handleKeyPress(event) {

    const tagName = event.target.tagName.toLowerCase();

    const isEditable = event.target.isContentEditable;

    

    if (tagName === "button" || tagName === "input" || tagName === "textarea" || isEditable) {

        return;

    }

    

    switch (event.code) {

        case "KeyH":

            historyCheckbox.checked = !historyCheckbox.checked;

            if (historyCheckbox.checked) {

                const firstEntry = historyList.firstElementChild;

                if (firstEntry) {

                    const explanationButton = firstEntry.querySelector(`button.explanation-button`);

                    if (explanationButton) {

                        explanationButton.dispatchEvent(new Event("mouseenter"));

                        dehoverQueue.push(() => {

                            explanationButton.dispatchEvent(new Event("mouseleave"));

                        });

                    }

                }

            } else {

                dehoverQueue.forEach(callback => {

                    callback();

                });

            }

            break;

        case "KeyA":

            if (savedata.enableCarouselMode) {

                carouselBackButton.click();

            }

            break;

        case "KeyD":

            if (savedata.enableCarouselMode) {

                carouselNextButton.click();

            }

            break;

        case "KeyJ":

        case "Digit1":

        case "ArrowLeft":

            if (appState.swapButtons) checkIfFalse();

            else checkIfTrue();

            break;

        case "KeyK":

        case "Digit2":

        case "ArrowRight":

            if (appState.swapButtons) checkIfTrue();

            else checkIfFalse();

            break;

        case "Space":

            timerToggle.checked = !timerToggle.checked;

            handleCountDown();

            break;

        default:

            break;

    }

}



document.addEventListener("keydown", handleKeyPress);



window.addEventListener("resize", applyHideSideButtons);



registerEventHandlers();

load();

init();

