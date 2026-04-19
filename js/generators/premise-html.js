function createPremiseHTML(premise, allowReversal=true, index=null, pattern=null) {
    if (typeof premise === 'string') {
        return premise;
    }
    // For half-minimal mode, odd indices (0, 2, 4...) use minimal text
    const forceMinimal = (index !== null && savedata.halfMinimalMode) ? (index % 2 === 0) : null;
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
        return createBasicPremiseHTML(premise[0], allowReversal, forceMinimal, pattern);
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

    if (!allowReversal || coinFlip()) {
        return `<span class="subject">${aHtml}</span> <span class="relation">${ab}</span> <span class="subject">${bHtml}</span> <span class="relation">${bc}</span> <span class="subject">${cHtml}</span>`;
    } else {
        return `<span class="subject">${cHtml}</span> <span class="relation">${bcRev}</span> <span class="subject">${bHtml}</span> <span class="relation">${abRev}</span> <span class="subject">${aHtml}</span>`;
    }
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

    // Create the negated relation text - lowercase "not" and format nicely
    // For relations like "is west of", we want "is not west of"
    // For minimal symbols, we want "¬[symbol]" (negation symbol prefix)
    const negRelation = useMinimal ? `¬${relation}` : relation.replace(/^(is\s+)/, 'is not ').replace(/^(are\s+)/, 'are not ');
    const negReverse = useMinimal ? `¬${reverse}` : reverse.replace(/^(is\s+)/, 'is not ').replace(/^(are\s+)/, 'are not ');

    if (!allowReversal || coinFlip()) {
        return `<span class="subject">${start}</span> <span class="relation">${negRelation}</span> <span class="subject">${end}</span>`;
    } else {
        return `<span class="subject">${end}</span> <span class="relation">${negReverse}</span> <span class="subject">${start}</span>`;
    }
}
