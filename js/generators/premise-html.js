function createPremiseHTML(premise, allowReversal=true, index=null, pattern=null) {
    if (typeof premise === 'string') {
        return premise;
    }
    // Defensive: skip undefined/null premises (can happen with transform stacking)
    if (!premise) {
        return '';
    }
    // For half-minimal mode, odd indices (0, 2, 4...) use minimal text
    const forceMinimal = (index !== null && savedata.halfMinimalMode) ? (index % 2 === 0) : null;
    // Detect stimulus set premise (has startSet/endSet arrays)
    if (premise.startSet && premise.endSet) {
        return createSetPremiseHTML(premise, allowReversal, forceMinimal, pattern);
    }
    if (savedata.widePremises && Array.isArray(premise)) {
        return createWidePremiseHTML(premise, allowReversal, forceMinimal, pattern);
    } else {
        return createBasicPremiseHTML(premise, allowReversal, forceMinimal, pattern);
    }
}

function createBasicPremiseHTML(premise, allowReversal=true, forceMinimal=null, pattern=null) {
    const useMinimal = forceMinimal !== null ? forceMinimal : savedata.minimalMode;
    const useInverted = useMinimal && savedata.invertedMinimalMode;

    // For inverted mode, swap the minimal symbols (arrow direction interpretation is reversed)
    // Normal: "A ↑ B" = "B is north of A" (arrow points to where the second word is relative to first)
    // Inverted: "A ↑ B" = "A is north of B" (arrow shows direction of first word from second)
    let relation, reverse;
    if (useMinimal && useInverted) {
        // Swap relation and reverse for 2D arrows to invert the interpretation
        relation = premise.reverseMinimal;
        reverse = premise.relationMinimal;
    } else {
        relation = useMinimal ? premise.relationMinimal : premise.relation;
        reverse = useMinimal ? premise.reverseMinimal : premise.reverse;
    }

    // Helper to render a subject (word or shape)
    const renderSubject = (word) => {
        if (pattern && pattern[word]) {
            // It's a shape ID, render as SVG
            const { shape, color } = pattern[word];
            const size = 28;
            const svg = createShapeSVG(shape, color, size/2, size/2, size);
            return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="vertical-align: middle; display: inline-block;">${svg}</svg>`;
        }
        return word;
    };

    const start = renderSubject(premise.start);
    const end = renderSubject(premise.end);

    let ps;
    if (!allowReversal || coinFlip()) {
      ps = [
      `<span class="subject">${start}</span> <span class="relation">${relation}</span> <span class="subject">${end}</span>`,
      `<span class="subject">${start}</span> <span class="relation"><span class="is-negated">${reverse}</span></span> <span class="subject">${end}</span>`,
      ];
    } else {
      ps = [
      `<span class="subject">${end}</span> <span class="relation">${reverse}</span> <span class="subject">${start}</span>`,
      `<span class="subject">${end}</span> <span class="relation"><span class="is-negated">${relation}</span></span> <span class="subject">${start}</span>`,
      ];
    }
    const result = pickNegatable(ps);
    return result;
}

function createWidePremiseHTML(premise, allowReversal=true, forceMinimal=null, pattern=null) {
    const useMinimal = forceMinimal !== null ? forceMinimal : savedata.minimalMode;
    const useInverted = useMinimal && savedata.invertedMinimalMode;
    if (premise.length === 1) {
        // Single premise in wide wrapper - delegate to appropriate renderer
        if (premise[0].startSet) {
            return createSetPremiseHTML(premise[0], allowReversal, forceMinimal, pattern);
        }
        return createBasicPremiseHTML(premise[0], allowReversal, forceMinimal, pattern);
    }

    // If either premise is a set premise, render them individually (combining set premises into wide format is complex)
    if (premise[0].startSet || premise[1].startSet) {
        const rendered = premise.map(p => {
            if (p.startSet) {
                return createSetPremiseHTML(p, allowReversal, forceMinimal, pattern);
            }
            return createBasicPremiseHTML(p, allowReversal, forceMinimal, pattern);
        });
        // Return combined HTML from individual renderings
        return rendered.map(r => r.html || r).join(' ');
    }

    // Helper to render a subject (word or shape)
    const renderSubject = (word) => {
        if (pattern && pattern[word]) {
            const { shape, color } = pattern[word];
            const size = 28;
            const svg = createShapeSVG(shape, color, size/2, size/2, size);
            return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="vertical-align: middle; display: inline-block;">${svg}</svg>`;
        }
        return word;
    };

    let [left, right] = premise;
    if (right.end === left.start) {
        [left, right] = [right, left];
    }

    // For inverted mode, swap minimal symbols to reverse arrow interpretation
    let leftRelation, leftReverse, rightRelation, rightReverse;
    if (useMinimal && useInverted) {
        leftRelation = left.reverseMinimal;
        leftReverse = left.relationMinimal;
        rightRelation = right.reverseMinimal;
        rightReverse = right.relationMinimal;
    } else {
        leftRelation = useMinimal ? left.relationMinimal : left.relation;
        leftReverse = useMinimal ? left.reverseMinimal : left.reverse;
        rightRelation = useMinimal ? right.relationMinimal : right.relation;
        rightReverse = useMinimal ? right.reverseMinimal : right.reverse;
    }
    let a, b, c, ab, bc, abRev, bcRev;
    if (left.end === right.start) {
        a = left.start;
        b = left.end;
        c = right.end;
        ab = leftRelation;
        abRev = leftReverse;
        bc = rightRelation;
        bcRev = rightReverse;
    } else if (left.start === right.start) {
        a = left.end;
        b = left.start;
        c = right.end;
        ab = allowReversal ? leftReverse : leftRelation;
        abRev = allowReversal ? leftRelation : leftReverse;
        bc = rightRelation;
        bcRev = rightReverse;
    } else {
        a = left.start;
        b = left.end;
        c = right.start;
        ab = leftRelation;
        abRev = leftReverse;
        bc = allowReversal ? rightReverse : rightRelation;
        bcRev = allowReversal ? rightRelation : rightReverse;
    }

    if (negationRoll()) {
    const tempAb = ab;
    ab = `<span class="is-negated">${abRev}</span>`;
    abRev = `<span class="is-negated">${tempAb}</span>`;
}
    if (negationRoll()) {
        const tempBc = bc;
        bc = `<span class="is-negated">${bcRev}</span>`;
        bcRev = `<span class="is-negated">${tempBc}</span>`;
    }

    // Render subjects (words or shapes)
    const aHtml = renderSubject(a);
    const bHtml = renderSubject(b);
    const cHtml = renderSubject(c);

    // Build options array for pickNegatable (wide premises don't support negation yet, so both are normal)
    const ps = [
        `<span class="subject">${aHtml}</span> <span class="relation">${ab}</span> <span class="subject">${bHtml}</span> <span class="relation">${bc}</span> <span class="subject">${cHtml}</span>`,
        `<span class="subject">${cHtml}</span> <span class="relation">${bcRev}</span> <span class="subject">${bHtml}</span> <span class="relation">${abRev}</span> <span class="subject">${aHtml}</span>`
    ];
    
    const result = pickNegatable(ps);
    return result;
}

// Render a stimulus set premise: "A, B and C are south east of D and E"
function createSetPremiseHTML(premise, allowReversal=true, forceMinimal=null, pattern=null) {
    const useMinimal = forceMinimal !== null ? forceMinimal : savedata.minimalMode;
    const useInverted = useMinimal && savedata.invertedMinimalMode;

    let relation, reverse;
    if (useMinimal && useInverted) {
        relation = premise.reverseMinimal;
        reverse = premise.relationMinimal;
    } else {
        relation = useMinimal ? premise.relationMinimal : premise.relation;
        reverse = useMinimal ? premise.reverseMinimal : premise.reverse;
    }

    // Helper to render a subject (word or shape)
    const renderSubject = (word) => {
        if (pattern && pattern[word]) {
            const { shape, color } = pattern[word];
            const size = 28;
            const svg = createShapeSVG(shape, color, size/2, size/2, size);
            return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="vertical-align: middle; display: inline-block;">${svg}</svg>`;
        }
        return word;
    };

    // Format a set of items as "A, B and C"
    const formatSet = (items) => {
        const rendered = items.map(renderSubject);
        if (rendered.length === 1) return rendered[0];
        if (rendered.length === 2) return `${rendered[0]} <span class="set-op">and</span> ${rendered[1]}`;
        return rendered.slice(0, -1).join('<span class="set-op">,</span> ') + ' <span class="set-op">and</span> ' + rendered[rendered.length - 1];
    };

    // Wrap formatted set in subject span
    const formatSetSpan = (items) => {
        return `<span class="subject">${formatSet(items)}</span>`;
    };

    // Adapt relation for plural: "is" -> "are" when either set has >1 item
    const adaptRelation = (rel, startSet, endSet) => {
        if (useMinimal) return rel; // Minimal symbols don't have is/are
        const hasPlural = startSet.length > 1 || endSet.length > 1;
        if (hasPlural) {
            return rel.replace(/^is\s+/, 'are ');
        }
        return rel;
    };

    const startSet = premise.startSet;
    const endSet = premise.endSet;

    const relationAdapted = adaptRelation(relation, startSet, endSet);
    const reverseAdapted = adaptRelation(reverse, endSet, startSet);

    let ps;
    if (!allowReversal || coinFlip()) {
        ps = [
            `${formatSetSpan(startSet)} <span class="relation">${relationAdapted}</span> ${formatSetSpan(endSet)}`,
            `${formatSetSpan(startSet)} <span class="relation"><span class="is-negated">${reverseAdapted}</span></span> ${formatSetSpan(endSet)}`,
        ];
    } else {
        ps = [
            `${formatSetSpan(endSet)} <span class="relation">${reverseAdapted}</span> ${formatSetSpan(startSet)}`,
            `${formatSetSpan(endSet)} <span class="relation"><span class="is-negated">${relationAdapted}</span></span> ${formatSetSpan(startSet)}`,
        ];
    }
    const result = pickNegatable(ps);
    return result;
}

// Create a negated conclusion HTML - wraps the relation in a "not" indicator
// This is actual negation, not inversion (e.g., "A is not west of B" vs "A is east of B")
function createNegatedConclusionHTML(premise, allowReversal=true, forceMinimal=null, pattern=null) {
    const useMinimal = forceMinimal !== null ? forceMinimal : savedata.minimalMode;
    const useInverted = useMinimal && savedata.invertedMinimalMode;

    // For inverted mode, swap the minimal symbols
    let relation, reverse;
    if (useMinimal && useInverted) {
        relation = premise.reverseMinimal;
        reverse = premise.relationMinimal;
    } else {
        relation = useMinimal ? premise.relationMinimal : premise.relation;
        reverse = useMinimal ? premise.reverseMinimal : premise.reverse;
    }

    // Create the negated relation text
    const negRelation = useMinimal ? `¬${relation}` : relation.replace(/^(is\s+)/, 'is not ').replace(/^(are\s+)/, 'are not ');
    const negReverse = useMinimal ? `¬${reverse}` : reverse.replace(/^(is\s+)/, 'is not ').replace(/^(are\s+)/, 'are not ');

    // Handle set premises (startSet/endSet)
    if (premise.startSet && premise.endSet) {
        const formatSet = (items) => {
            if (items.length === 1) return items[0];
            if (items.length === 2) return `${items[0]} <span class="set-op">and</span> ${items[1]}`;
            return items.slice(0, -1).join('<span class="set-op">,</span> ') + ' <span class="set-op">and</span> ' + items[items.length - 1];
        };
        const startSetHTML = `<span class="subject">${formatSet(premise.startSet)}</span>`;
        const endSetHTML = `<span class="subject">${formatSet(premise.endSet)}</span>`;

        if (!allowReversal || coinFlip()) {
            return `${startSetHTML} <span class="relation">${negRelation}</span> ${endSetHTML}`;
        } else {
            return `${endSetHTML} <span class="relation">${negReverse}</span> ${startSetHTML}`;
        }
    }

    // Helper to render a subject (word or shape)
    const renderSubject = (word) => {
        if (pattern && pattern[word]) {
            const { shape, color } = pattern[word];
            const size = 28;
            const svg = createShapeSVG(shape, color, size/2, size/2, size);
            return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="vertical-align: middle; display: inline-block;">${svg}</svg>`;
        }
        return word;
    };

    const start = renderSubject(premise.start);
    const end = renderSubject(premise.end);

    if (!allowReversal || coinFlip()) {
        return `<span class="subject">${start}</span> <span class="relation">${negRelation}</span> <span class="subject">${end}</span>`;
    } else {
        return `<span class="subject">${end}</span> <span class="relation">${negReverse}</span> <span class="subject">${start}</span>`;
    }
}
