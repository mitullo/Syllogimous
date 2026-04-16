function createGridFromMap(wordCoordMap) {
    const entries = Object.entries(wordCoordMap);
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
    const lengths = grid.flat(Infinity).map(x => x.length > 50 ? 1 : x.length);
    const biggest = lengths.reduce((a, b) => Math.max(a, b));
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
    let s = '<div class="four-d-scene" style="display: flex; gap: 0.5rem;">';
    for (let i = 0; i < grid.length; i++) {
        let time = i + 1;
        s += '<div>';
        s += '<div>Time ' + time + '</div>'
        s += createExplanation3D(grid[i], filler, pattern);
        s += '</div>';
    }
    s += '</div>'
    return s;
}

function createExplanation5D(grid, pattern = null) {
    const filler = createFiller(grid);
    let s = '<div class="five-d-scene" style="display: flex; flex-direction: column; gap: 1rem;">';
    for (let i = 0; i < grid.length; i++) {
        let quantity = i === 0 ? 'Less' : (i === grid.length - 1 ? 'More' : 'Mid');
        s += '<div>';
        s += '<div style="text-align: center; font-weight: bold; margin-bottom: 0.5rem;">Quantity: ' + quantity + '</div>';
        s += createExplanation4D(grid[i], pattern);
        s += '</div>';
    }
    s += '</div>';
    return s;
}

function createExplanation6D(grid, pattern = null) {
    const filler = createFiller(grid);
    let s = '<div class="six-d-scene" style="display: flex; flex-direction: column; gap: 1rem;">';
    for (let i = 0; i < grid.length; i++) {
        let membership = i === 0 ? 'Outside' : (i === grid.length - 1 ? 'Inside' : 'Boundary');
        s += '<div style="border: 1px solid var(--bracket-color); padding: 0.5rem; border-radius: 4px;">';
        s += '<div style="text-align: center; font-weight: bold; margin-bottom: 0.5rem; color: var(--bracket-color);">Membership: ' + membership + '</div>';
        s += createExplanation5D(grid[i], pattern);
        s += '</div>';
    }
    s += '</div>';
    return s;
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
    if (question.buckets && question.buckets.some(b => b.length > 0)) {
        result += '<div class="mixed-distinction-section" style="border: 1px solid var(--bracket-color); padding: 0.5rem; border-radius: 4px;">';
        result += '<div style="font-weight: bold; margin-bottom: 0.5rem;">Distinction Groups:</div>';
        result += createExplanationBuckets({...question, category: 'Distinction'});
        result += '</div>';
    }
    
    // Show direction map if available
    if (question.wordCoordMap && Object.keys(question.wordCoordMap).length > 0) {
        result += '<div class="mixed-direction-section" style="border: 1px solid var(--bracket-color); padding: 0.5rem; border-radius: 4px;">';
        result += '<div style="font-weight: bold; margin-bottom: 0.5rem;">Spatial Map:</div>';
        const pattern = question.pattern || null;
        const grid = createGridFromMap(question.wordCoordMap);
        if (grid && Array.isArray(grid[0]) && Array.isArray(grid[0][0]) && Array.isArray(grid[0][0][0]) && Array.isArray(grid[0][0][0][0]) && Array.isArray(grid[0][0][0][0][0])) {
            result += createExplanation6D(grid, pattern);
        } else if (grid && Array.isArray(grid[0]) && Array.isArray(grid[0][0]) && Array.isArray(grid[0][0][0]) && Array.isArray(grid[0][0][0][0])) {
            result += createExplanation5D(grid, pattern);
        } else if (grid && Array.isArray(grid[0]) && Array.isArray(grid[0][0]) && Array.isArray(grid[0][0][0])) {
            result += createExplanation4D(grid, pattern);
        } else if (grid && Array.isArray(grid[0]) && Array.isArray(grid[0][0])) {
            result += createExplanation3D(grid, undefined, pattern);
        } else {
            result += createExplanation2D(grid, undefined, undefined, pattern);
        }
        result += '</div>';
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
    // Handle mixed mode questions first (they have both wordCoordMap and buckets)
    if (question.type === 'mixed' || question.category?.startsWith('Mixed:')) {
        return createExplanationMixed(question);
    }

    if (question.bucket) {
        return createExplanationBucket(question);
    }

    if (question.buckets) {
        return createExplanationBuckets(question);
    }

    if (question.wordCoordMap) {
        const pattern = question.pattern || null;
        const grid = createGridFromMap(question.wordCoordMap);
        if (grid && Array.isArray(grid[0]) && Array.isArray(grid[0][0]) && Array.isArray(grid[0][0][0]) && Array.isArray(grid[0][0][0][0]) && Array.isArray(grid[0][0][0][0][0])) {
            return createExplanation6D(grid, pattern);
        } else if (grid && Array.isArray(grid[0]) && Array.isArray(grid[0][0]) && Array.isArray(grid[0][0][0]) && Array.isArray(grid[0][0][0][0])) {
            return createExplanation5D(grid, pattern);
        } else if (grid && Array.isArray(grid[0]) && Array.isArray(grid[0][0]) && Array.isArray(grid[0][0][0])) {
            return createExplanation4D(grid, pattern);
        } else if (grid && Array.isArray(grid[0]) && Array.isArray(grid[0][0])) {
            return createExplanation3D(grid, undefined, pattern);
        } else {
            return createExplanation2D(grid, undefined, undefined, pattern);
        }
    }

    if (question.subresults) {
        return question.subresults.map(createExplanation).join('<div class="binary-explainer-separator"></div>');
    }
}

function createExplanationPopup(question, e) {
    const popup = document.createElement("div");
    popup.className = "explanation-popup";
    popup.style.position = "fixed";
    popup.style.top = "50%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.zIndex = "1000";
    popup.style.padding = "20px";
    popup.style.backgroundColor = "var(--background-color)";
    popup.style.borderRadius = "8px";
    popup.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    popup.style.textAlign = "center";
    popup.style.pointerEvents = "none";

    // Mixed mode needs more space and scrolling
    const isMixed = question.type === 'mixed' || question.category?.startsWith('Mixed:');
    if (isMixed) {
        popup.style.width = "95vw";
        popup.style.maxWidth = "1200px";
        popup.style.maxHeight = "95vh";
        popup.style.overflow = "auto";
    } else {
        popup.style.width = "fit-content";
        popup.style.maxWidth = "98vw";
        popup.style.maxHeight = "98vh";
        popup.style.overflow = "hidden";
    }

    const content = document.createElement("pre");
    content.innerHTML = createExplanation(question);
    content.style.margin = "0";
    if (isMixed) {
        content.style.maxHeight = "calc(95vh - 40px)";
        content.style.overflow = "auto";
    }
    popup.appendChild(content);

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

