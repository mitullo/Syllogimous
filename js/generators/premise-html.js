function createPremiseHTML(premise, allowReversal=true, index=null) {
    if (typeof premise === 'string') {
        return premise;
    }
    // For half-minimal mode, odd indices (0, 2, 4...) use minimal text
    const forceMinimal = (index !== null && savedata.halfMinimalMode) ? (index % 2 === 0) : null;
    if (savedata.widePremises && Array.isArray(premise)) {
        return createWidePremiseHTML(premise, allowReversal, forceMinimal);
    } else {
        return createBasicPremiseHTML(premise, allowReversal, forceMinimal);
    }
}

function createBasicPremiseHTML(premise, allowReversal=true, forceMinimal=null) {
    const useMinimal = forceMinimal !== null ? forceMinimal : savedata.minimalMode;
    const relation = useMinimal ? premise.relationMinimal : premise.relation;
    const reverse = useMinimal ? premise.reverseMinimal : premise.reverse;
    let ps;
    if (!allowReversal || coinFlip()) {
      ps = [
      `<span class="subject">${premise.start}</span> <span class="relation">${relation}</span> <span class="subject">${premise.end}</span>`,
      `<span class="subject">${premise.start}</span> <span class="relation"><span class="is-negated">${reverse}</span></span> <span class="subject">${premise.end}</span>`,
      ];
    } else {
      ps = [
      `<span class="subject">${premise.end}</span> <span class="relation">${reverse}</span> <span class="subject">${premise.start}</span>`,
      `<span class="subject">${premise.end}</span> <span class="relation"><span class="is-negated">${relation}</span></span> <span class="subject">${premise.start}</span>`,
      ];
    }
    return pickNegatable(ps);
}

function createWidePremiseHTML(premise, allowReversal=true, forceMinimal=null) {
    const useMinimal = forceMinimal !== null ? forceMinimal : savedata.minimalMode;
    if (premise.length === 1) {
        return createBasicPremiseHTML(premise[0], allowReversal, forceMinimal);
    }

    let [left, right] = premise;
    if (right.end === left.start) {
        [left, right] = [right, left];
    }
    const leftRelation = useMinimal ? left.relationMinimal : left.relation;
    const leftReverse = useMinimal ? left.reverseMinimal : left.reverse;
    const rightRelation = useMinimal ? right.relationMinimal : right.relation;
    const rightReverse = useMinimal ? right.reverseMinimal : right.reverse;
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

    if (!allowReversal || coinFlip()) {
        return `<span class="subject">${a}</span> <span class="relation">${ab}</span> <span class="subject">${b}</span> <span class="relation">${bc}</span> <span class="subject">${c}</span>`;
    } else {
        return `<span class="subject">${c}</span> <span class="relation">${bcRev}</span> <span class="subject">${b}</span> <span class="relation">${abRev}</span> <span class="subject">${a}</span>`;
    }
}

// Create a negated conclusion HTML - wraps the relation in a "Not" indicator
// This is actual negation, not inversion (e.g., "A is Not west of B" vs "A is east of B")
function createNegatedConclusionHTML(premise, allowReversal=true, forceMinimal=null) {
    const useMinimal = forceMinimal !== null ? forceMinimal : savedata.minimalMode;
    const relation = useMinimal ? premise.relationMinimal : premise.relation;
    const reverse = useMinimal ? premise.reverseMinimal : premise.reverse;

    // Create the negated relation text - capitalize "Not" and format nicely
    // For relations like "is west of", we want "is Not west of"
    // For minimal symbols, we want "Not [symbol]"
    const negRelation = useMinimal ? `Not ${relation}` : relation.replace(/^(is\s+)/, 'is Not ').replace(/^(are\s+)/, 'are Not ');
    const negReverse = useMinimal ? `Not ${reverse}` : reverse.replace(/^(is\s+)/, 'is Not ').replace(/^(are\s+)/, 'are Not ');

    if (!allowReversal || coinFlip()) {
        return `<span class="subject">${premise.start}</span> <span class="relation">${negRelation}</span> <span class="subject">${premise.end}</span>`;
    } else {
        return `<span class="subject">${premise.end}</span> <span class="relation">${negReverse}</span> <span class="subject">${premise.start}</span>`;
    }
}
