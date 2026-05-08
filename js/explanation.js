function isRenderableCoord(coord) {
    return Array.isArray(coord)
        && coord.length > 0
        && coord.every(value => typeof value === 'number' && Number.isFinite(value));
}

function createGridFromMap(wordCoordMap) {
    const entries = Object.entries(wordCoordMap || {})
        .filter(([_, coord]) => isRenderableCoord(coord));
    if (entries.length === 0) return [];

    // Find max dimension and normalize all coordinates to same length
    const maxDim = Math.max(...entries.map(([_, coord]) => coord.length));
    const normalizedEntries = entries.map(([word, coord]) => {
        if (coord.length < maxDim) {
            // Pad with zeros to match max dimension
            return [word, [...coord, ...Array(maxDim - coord.length).fill(0)]];
        }
        return [word, coord];
    });

    const low = structuredClone(normalizedEntries[0][1]);
    const high = structuredClone(normalizedEntries[0][1]);

    for (const [word, coord] of normalizedEntries) {
        for (const i in coord) {
            low[i] = Math.min(low[i], coord[i])
            high[i] = Math.max(high[i], coord[i])
        }
    }

    const dimensions = low.map((l, i) => high[i] - l + 1);
    const createNArray = (i) => {
        if (i < 0)
            return '';
        return Array.from({ length: dimensions[i] }, (_, a) => createNArray(i-1));
    };
    const grid = createNArray(dimensions.length - 1);

    for (const [word, coord] of normalizedEntries) {
        let curr = grid
        for (let i = coord.length - 1; i >= 0; i--) {
            const loc = coord[i] - low[i];
            if (!Array.isArray(curr[loc])) {
                curr[loc] += (curr[loc].length > 0 ? ',' : '') + word;
                break;
            }
            curr = curr[loc]
        }
    }

    return grid;
}

// Ensure grid has minimum required depth by wrapping if needed
function ensureGridDepth(grid, minDepth) {
    if (!Array.isArray(grid) || grid.length === 0) {
        return grid;
    }
    
    // Calculate current depth - go until we hit non-array
    let depth = 0;
    let curr = grid;
    while (Array.isArray(curr) && curr.length > 0) {
        depth++;
        curr = curr[0];
    }
    
    // If already at required depth, return as-is
    if (depth === minDepth) {
        return grid;
    }
    
    // If depth is greater than needed, cells are arrays - flatten them
    if (depth > minDepth) {
        return flattenGridCells(grid, depth - minDepth);
    }
    
    // Need to wrap to increase depth
    let result = grid;
    while (depth < minDepth) {
        result = [result];
        depth++;
    }
    
    return result;
}

// Flatten cells that are nested too deep
function flattenGridCells(grid, extraLevels) {
    if (extraLevels <= 0 || !Array.isArray(grid)) {
        return grid;
    }
    
    return grid.map(item => {
        if (Array.isArray(item)) {
            // If this is the level before cells, flatten the cells
            if (extraLevels === 1 && item.length > 0 && Array.isArray(item[0])) {
                // item is an array of cell arrays - flatten each cell
                return item.map(cell => 
                    Array.isArray(cell) ? cell.filter(c => c && c !== '').join(',') : cell
                );
            }
            return flattenGridCells(item, extraLevels - 1);
        }
        return item;
    });
}

function centerText(text, width) {
    if (text.length > 50) {
        const half = Math.floor(width / 2);
        const padding = ' '.repeat(half);
        return padding + text + padding;
    }
    const totalPadding = width - text.length;
    const paddingStart = Math.floor(totalPadding / 2);
    return text.padStart(text.length + paddingStart).padEnd(width);
}

function createFiller(grid) {
    const cells = Array.isArray(grid) ? grid.flat(Infinity) : [];
    const lengths = cells.map(x => {
        const text = String(x ?? '');
        return text.length > 50 ? 1 : text.length;
    });
    const biggest = lengths.length > 0 ? lengths.reduce((a, b) => Math.max(a, b), 0) : 0;
    const neededLength = biggest + 2;
    return '\u00A0'.repeat(neededLength);
}

function fillTable(grid, filler, pattern = null) {
    let s = '';
    for (let i = grid.length - 1; i >= 0; i--) {
        const row = grid[i];
        for (const val of row) {
            let displayVal = val;
            // If pattern exists, replace words with shape+word display
            if (pattern && val) {
                const words = val.split(',').filter(w => w.trim());
                const displayParts = words.map(word => {
                    if (pattern[word]) {
                        const data = pattern[word];
                        const size = 16;
                        const halfSize = size / 2;
                        let shapeSVG = '';
                        switch(data.shape) {
                            case 'circle':
                                shapeSVG = `<circle cx="${halfSize}" cy="${halfSize}" r="${halfSize - 1}" fill="${data.color.fill}" stroke="${data.color.stroke}" stroke-width="1"/>`;
                                break;
                            case 'square':
                                shapeSVG = `<rect x="1" y="1" width="${size - 2}" height="${size - 2}" rx="2" fill="${data.color.fill}" stroke="${data.color.stroke}" stroke-width="1"/>`;
                                break;
                            case 'triangle':
                                shapeSVG = `<polygon points="${halfSize},1 ${size - 1},${size - 1} 1,${size - 1}" fill="${data.color.fill}" stroke="${data.color.stroke}" stroke-width="1"/>`;
                                break;
                            case 'diamond':
                                shapeSVG = `<polygon points="${halfSize},1 ${size - 1},${halfSize} ${halfSize},${size - 1} 1,${halfSize}" fill="${data.color.fill}" stroke="${data.color.stroke}" stroke-width="1"/>`;
                                break;
                            case 'hexagon':
                                const hexPoints = [];
                                for (let i = 0; i < 6; i++) {
                                    const angle = (Math.PI / 3) * i - Math.PI / 2;
                                    hexPoints.push(`${halfSize + (halfSize - 1) * Math.cos(angle)},${halfSize + (halfSize - 1) * Math.sin(angle)}`);
                                }
                                shapeSVG = `<polygon points="${hexPoints.join(' ')}" fill="${data.color.fill}" stroke="${data.color.stroke}" stroke-width="1"/>`;
                                break;
                            case 'star':
                                const starPoints = [];
                                for (let i = 0; i < 10; i++) {
                                    const angle = (Math.PI / 5) * i - Math.PI / 2;
                                    const radius = i % 2 === 0 ? halfSize - 1 : (halfSize - 1) * 0.4;
                                    starPoints.push(`${halfSize + radius * Math.cos(angle)},${halfSize + radius * Math.sin(angle)}`);
                                }
                                shapeSVG = `<polygon points="${starPoints.join(' ')}" fill="${data.color.fill}" stroke="${data.color.stroke}" stroke-width="1"/>`;
                                break;
                        }
                        return `<span style="white-space: nowrap; display: inline-flex; align-items: center; gap: 2px;"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${shapeSVG}</svg>${word}</span>`;
                    }
                    return word;
                });
                displayVal = displayParts.join(',');
            }
            s += '<div class="td">' + (displayVal ? displayVal : filler) + '</div>';
        }
    }
    return s;
}

function createExplanation2D(grid, filler, separatorFn, pattern = null) {
    if (!filler) {
        filler = createFiller(grid);
    }

    if (!separatorFn) {
        separatorFn = (s) => `<div class="table" style="grid-template-columns: repeat(${grid[0].length}, auto)">${s}</div>`;
    }

    return separatorFn(fillTable(grid, filler, pattern));
}

function createExplanation3D(grid, filler, pattern = null) {
    if (!filler) {
        filler = createFiller(grid);
    }
    const gridWidth = grid[0][0].length;
    let s = `<div class="three-d-scene">`
    for (let i = grid.length - 1; i >= 0; i--) {
        s += createExplanation2D(grid[i], filler, (s) => {
            return `<div class="table three-d-plane plane-${grid.length - i}" style="grid-template-columns: repeat(${gridWidth}, minmax(min-content, 1fr))">${s}</div>`
        }, pattern);
    }
    s += '</div>'
    s += `<style>.three-d-plane .td { max-width: ${Math.floor((100 / gridWidth) - 4)}vw; }</style>`
    return s;
}

function createExplanation4D(grid, pattern = null) {
    const filler = createFiller(grid);
    let s = '<div class="four-d-scene" style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 0.5rem; justify-content: center;">';
    for (let i = 0; i < grid.length; i++) {
        let time = i + 1;
        s += '<div style="border: 1px solid rgba(255,255,255,0.2); padding: 0.3rem; border-radius: 4px; background: rgba(255,255,255,0.05);">';
        s += '<div style="text-align: center; font-size: 0.8rem; margin-bottom: 0.2rem; opacity: 0.8;">T' + time + '</div>';
        s += createExplanation3D(grid[i], filler, pattern);
        s += '</div>';
    }
    s += '</div>';
    return s;
}

function createExplanation5D(grid, pattern = null) {
    const filler = createFiller(grid);
    let s = '<div class="five-d-scene" style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 1rem; justify-content: center;">';
    
    for (let qtyIdx = 0; qtyIdx < grid.length; qtyIdx++) {
        let quantity = qtyIdx === 0 ? 'Less' : (qtyIdx === grid.length - 1 ? 'More' : 'Mid');
        const qtyGrid = grid[qtyIdx];
        
        // Softer card-like container
        s += '<div style="border: 1px solid rgba(128, 128, 128, 0.2); padding: 1rem; border-radius: 12px; background: rgba(128, 128, 128, 0.04); box-shadow: 0 2px 8px rgba(0,0,0,0.02);">';
        s += '<div style="text-align: center; font-weight: 600; margin-bottom: 0.75rem; font-size: 0.9rem; color: var(--bracket-color); letter-spacing: 0.5px;">QTY: ' + quantity.toUpperCase() + '</div>';
        
        // Show Time slices horizontally
        s += '<div style="display: flex; flex-direction: row; gap: 0.75rem;">';
        for (let timeIdx = 0; timeIdx < qtyGrid.length; timeIdx++) {
            let timeLabel = 'T' + (timeIdx + 1);
            const timeGrid = qtyGrid[timeIdx];
            
            s += '<div style="text-align: center; display: flex; flex-direction: column; align-items: center;">';
            s += '<div style="font-size: 0.75rem; margin-bottom: 0.4rem; opacity: 0.6; font-weight: 500;">' + timeLabel + '</div>';
            s += createExplanation3D(timeGrid, filler, pattern);
            s += '</div>';
        }
        s += '</div>';
        s += '</div>';
    }
    s += '</div>';
    return s;
}

function createExplanation6D(grid, pattern = null) {
    const filler = createFiller(grid);
    let s = '<div class="six-d-scene" style="display: flex; flex-direction: column; gap: 1.5rem; align-items: center;">';
    
    for (let memIdx = 0; memIdx < grid.length; memIdx++) {
        let membership = memIdx === 0 ? 'Outside' : (memIdx === grid.length - 1 ? 'Inside' : 'Boundary');
        const memGrid = grid[memIdx];
        
        // Outer Membership Section (Clean, visually separated)
        s += '<div style="width: 100%; border: 1px solid rgba(128, 128, 128, 0.15); padding: 1.25rem; border-radius: 16px; background: rgba(128, 128, 128, 0.02);">';
        s += '<div style="text-align: center; font-weight: 700; margin-bottom: 1rem; color: var(--bracket-color); font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px;">' + membership + '</div>';
        
        // Show Quantity rows horizontally
        s += '<div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 1rem; justify-content: center;">';
        for (let qtyIdx = 0; qtyIdx < memGrid.length; qtyIdx++) {
            let quantity = qtyIdx === 0 ? 'Less' : (qtyIdx === memGrid.length - 1 ? 'More' : 'Mid');
            const qtyGrid = memGrid[qtyIdx];
            
            // Inner Quantity Card (Soft backdrop)
            s += '<div style="border: 1px solid rgba(128, 128, 128, 0.1); padding: 0.75rem; border-radius: 12px; background: rgba(128, 128, 128, 0.04);">';
            s += '<div style="text-align: center; font-weight: 600; margin-bottom: 0.5rem; font-size: 0.85rem; opacity: 0.8;">QTY: ' + quantity.toUpperCase() + '</div>';
            
            // Show Time slices
            s += '<div style="display: flex; flex-direction: row; gap: 0.5rem;">';
            for (let timeIdx = 0; timeIdx < qtyGrid.length; timeIdx++) {
                let timeLabel = 'T' + (timeIdx + 1);
                const timeGrid = qtyGrid[timeIdx];
                
                s += '<div style="text-align: center; display: flex; flex-direction: column; align-items: center;">';
                s += '<div style="font-size: 0.7rem; margin-bottom: 0.3rem; opacity: 0.5; font-weight: 500;">' + timeLabel + '</div>';
                s += createExplanation3D(timeGrid, filler, pattern);
                s += '</div>';
            }
            s += '</div>'; // End time slices
            s += '</div>'; // End quantity
        }
        s += '</div>'; // End quantity rows
        s += '</div>'; // End membership
    }
    s += '</div>';
    return s;
}

function createSpatialExplanation(question) {
    const pattern = question.pattern || null;
    const grid = createGridFromMap(question.wordCoordMap);
    if (!Array.isArray(grid) || grid.length === 0) {
        return '';
    }

    const coordDims = Object.values(question.wordCoordMap || {}).find(isRenderableCoord)?.length || 0;
    const is6D = coordDims === 6;
    const is5D = coordDims === 5;

    if (is6D || (Array.isArray(grid[0]) && Array.isArray(grid[0][0]) && Array.isArray(grid[0][0][0]) && Array.isArray(grid[0][0][0][0]) && Array.isArray(grid[0][0][0][0][0]))) {
        return createExplanation6D(ensureGridDepth(grid, 6), pattern);
    } else if (is5D || (Array.isArray(grid[0]) && Array.isArray(grid[0][0]) && Array.isArray(grid[0][0][0]) && Array.isArray(grid[0][0][0][0]))) {
        return createExplanation5D(ensureGridDepth(grid, 5), pattern);
    } else if (Array.isArray(grid[0]) && Array.isArray(grid[0][0]) && Array.isArray(grid[0][0][0])) {
        return createExplanation4D(grid, pattern);
    } else if (Array.isArray(grid[0]) && Array.isArray(grid[0][0])) {
        return createExplanation3D(grid, undefined, pattern);
    } else if (Array.isArray(grid[0])) {
        return createExplanation2D(grid, undefined, undefined, pattern);
    }

    return '';
}

function createExplanationBucket(question) {
    if (question.category === 'Vertical') {
        return question.bucket.map(word => `<div>${word}</div>`).join('');
    } else if (question.category === 'Comparison') {
        return question.bucket.join(' < ');
    } else {
        return question.bucket.join(" ");
    }
}

function createExplanationBuckets(question) {
    if (question.category === 'Vertical') {
        return question.buckets
            .map(bucket => '<div style="justify-self: start;">' + bucket.join(' ') + '</div>')
            .join('<div class="divider"></div>');
    }
    const filler = createFiller(question.buckets);
    const verticalLength = question.buckets.reduce((a, b) => Math.max(a, b));
    let s = '<table class="distinction">';
    s += '<tr>';
    for (const bucket of question.buckets) {
        
        s += '<td>';
        for (const item of bucket) {
            s += '<div>' + centerText(item, filler.length) + '</div>';
        }
        s += '</td>';
    }
    s += '</tr>';
    s += '</table>';
    return s;
}

function createExplanationMixed(question) {
    let result = '<div class="mixed-explanation" style="display: flex; flex-direction: column; gap: 1rem;">';

    // Show mixed type info
    if (question.mixedTypes) {
        result += `<div class="mixed-types-header" style="font-size: 1.1rem; font-weight: bold; margin-bottom: 0.5rem;">Types: ${question.mixedTypes.join(' + ')}</div>`;
    }

    // Show negation indicator if conclusion is negated
    if (question.conclusion && question.conclusion.includes('Not')) {
        result += '<div class="negation-indicator" style="border: 1px solid var(--bracket-color); padding: 0.5rem; border-radius: 4px; text-align: center;">';
        result += '<span style="font-weight: bold;">Conclusion Negation Active</span>';
        result += '<div style="font-size: 0.9rem; margin-top: 0.25rem; opacity: 0.8;">The conclusion uses "Not" - validity is inverted</div>';
        result += '</div>';
    }
    
    // Show distinction buckets if available
    if (Array.isArray(question.buckets) && question.buckets.some(b => Array.isArray(b) && b.length > 0)) {
        result += '<div class="mixed-distinction-section" style="border: 1px solid var(--bracket-color); padding: 0.5rem; border-radius: 4px;">';
        result += '<div style="font-weight: bold; margin-bottom: 0.5rem;">Distinction Groups:</div>';
        result += createExplanationBuckets({...question, category: 'Distinction'});
        result += '</div>';
    }
    
    // Show direction map if available
    if (question.wordCoordMap && Object.keys(question.wordCoordMap).length > 0) {
        const spatialExplanation = createSpatialExplanation(question);
        if (spatialExplanation) {
            result += '<div class="mixed-direction-section" style="border: 1px solid var(--bracket-color); padding: 0.5rem; border-radius: 4px;">';
            result += '<div style="font-weight: bold; margin-bottom: 0.5rem;">Spatial Map:</div>';
            result += spatialExplanation;
            result += '</div>';
        }
    }
    
    // Show linear ordering if available
    if (question.bucket && question.bucket.length > 0) {
        result += '<div class="mixed-linear-section" style="border: 1px solid var(--bracket-color); padding: 0.5rem; border-radius: 4px;">';
        result += '<div style="font-weight: bold; margin-bottom: 0.5rem;">Linear Order:</div>';
        result += '<div style="font-size: 1.2rem; line-height: 2;">' + question.bucket.join(' → ') + '</div>';
        result += '</div>';
    }
    
    result += '</div>';
    return result;
}

function createExplanation(question) {
    if (!question) {
        return '<div style="padding: 1rem;">No explanation available for this question type.</div>';
    }

    // Handle mixed mode questions first (they intentionally show several representations).
    if (question.type === 'mixed' || question.category?.startsWith('Mixed:')) {
        return createExplanationMixed(question);
    }

    // Binary questions carry their real explanation history in subresults. Render those
    // leaves before considering any aggregate bucket/map fields on the wrapper object.
    if (Array.isArray(question.subresults) && question.subresults.length > 0) {
        const renderedSubresults = question.subresults.filter(Boolean).map(createExplanation);
        if (renderedSubresults.length > 0) {
            return renderedSubresults.join('<div class="binary-explainer-separator"></div>');
        }
    }

    // Prefer explicit 2D bucket groups over flat buckets or spatial fallbacks. This keeps
    // distinction and backtracking-style explanations grouped instead of collapsing to one row.
    if (Array.isArray(question.buckets)) {
        return createExplanationBuckets(question);
    }

    // Spatial analogy leaves often also expose a flat bucket for stimulus collection; keep
    // using the coordinate map when no explicit grouped buckets are present.
    if (question.wordCoordMap) {
        const spatialExplanation = createSpatialExplanation(question);
        if (spatialExplanation) {
            return spatialExplanation;
        }
    }

    if (question.bucket) {
        return createExplanationBucket(question);
    }
    
    return '<div style="padding: 1rem;">No explanation available for this question type.</div>';
}

function createExplanationPopup(question, e, isPinned = false) {
    const popup = document.createElement("div");
    popup.className = "explanation-popup";
    popup.dataset.pinned = isPinned ? "true" : "false";
    popup.style.position = "fixed";
    popup.style.top = "50%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.zIndex = "99999";
    popup.style.padding = "30px 24px";
    popup.style.backgroundColor = "var(--background-color)";
    popup.style.borderRadius = "16px";
    popup.style.boxShadow = "0 10px 40px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(128, 128, 128, 0.15)";
    popup.style.textAlign = "center";
    popup.style.pointerEvents = isPinned ? "auto" : "none";

    // Pinned popups get a visible border
    if (isPinned) {
        popup.style.border = "2px solid var(--bracket-color)";
    }

    // All popups need scrolling for large content (especially 5D/6D)
    const isMixed = question.type === 'mixed' || question.category?.startsWith('Mixed:');
    const isMultiDim = question.category?.includes('FIVE D') || question.category?.includes('SIX D');
    popup.style.width = isMixed || isMultiDim ? "98vw" : "fit-content";
    popup.style.maxWidth = isMultiDim ? "1800px" : "1400px";
    popup.style.maxHeight = "95vh";
    popup.style.overflow = "auto";

    const content = document.createElement("pre");
    content.innerHTML = createExplanation(question);
    content.style.margin = "0";
    popup.appendChild(content);

    // Add close hint for pinned popups
    if (isPinned) {
        const closeHint = document.createElement("div");
        closeHint.textContent = "Click anywhere to close";
        closeHint.style.fontSize = "0.75rem";
        closeHint.style.opacity = "0.6";
        closeHint.style.marginTop = "8px";
        closeHint.style.pointerEvents = "none";
        popup.appendChild(closeHint);
    }

    document.body.appendChild(popup);
}

function removeExplanationPopup() {
    for (let i = 0; i < 5; i++) {
        let elems = document.getElementsByClassName("explanation-popup");
        if (elems.length === 0) {
            break;
        }
        for (const el of elems) {
            el.remove();
        }
    }
}

function createExplanationButton(question) {
    if (question.category === 'Syllogism') {
        return '';
    }

    if (question.type === 'mixed' || question.category?.startsWith('Mixed:')) {
        return `<button class="explanation-button">Explanation</button>`;
    }

    if (question.wordCoordMap || question.bucket || question.buckets || question.subresults) {
        return `<button class="explanation-button">Explanation</button>`;
    }

    return ''
}

