function premiseKey(source, target) {
    return JSON.stringify([source, target].sort());
}

// Util to take a branching (non-linear) graph of premises, and reorder them so
// they mostly appear in connection order.
function orderPremises(premiseMap, neighbors) {
    let premises = [];
    let traversed = new Set();
    let addedPremises = new Set();
    const traverse = (word, parent) => {
        if (traversed.has(word)) {
            return;
        }
        traversed.add(word);

        const key = premiseKey(word, parent);
        if (premiseMap[key]) {
            // Deduplicate: same premise object may be stored under multiple keys (stimulus sets)
            const premise = premiseMap[key];
            if (!addedPremises.has(premise)) {
                premises.push(premise);
                addedPremises.add(premise);
            }
        }
        const wordNeighbors = neighbors[word] || [];
        const traversalOptions = [...wordNeighbors];
        traversalOptions.sort((a,b) => (neighbors[a] || []).length - (neighbors[b] || []).length);
        for (const neighbor of traversalOptions) {
            traverse(neighbor, word);
        }
    }
    const start = Object.keys(neighbors).filter(word => (neighbors[word] || []).length === 1)[0];
    if (!start) {
        // No valid start found (no words with exactly 1 neighbor), return premises in map order
        // Deduplicate: same premise object may be stored under multiple keys (stimulus sets)
        const seen = new Set();
        return Object.values(premiseMap).filter(p => {
            if (seen.has(p)) return false;
            seen.add(p);
            return true;
        });
    }
    traverse(start, null);

    return premises;
}

function scramble(premises) {
    const divisions = premises.length - 1;
    const unbreakableDivisions = Math.floor((100 - savedata.scrambleFactor) * divisions / 100);
    return scrambleWithLimit(premises, unbreakableDivisions);
}

function scrambleWithLimit(premises, unbreakableDivisions) {
    const indices = Array.from({ length: premises.length - 1 }, (_, i) => i + 1);
    const selected = pickRandomItems(indices, unbreakableDivisions).picked;

    let groups = []
    for (let i = 0; i < premises.length; i++) {
        if (!groups || !selected.includes(i)) {
            groups.push([i]);
        } else {
            groups[groups.length - 1].push(i);
        }
    }

    let endIndices;
    let attempts;
    for (attempts = 0; attempts < 100; attempts++) {
        endIndices = shuffle(groups.slice()).flat();
        let neighborCount = 0;
        for (let i = 0; i < endIndices.length - 1; i++) {
            if (Math.abs(endIndices[i] - endIndices[i+1]) === 1) {
                neighborCount += 1;
            }
        }
        const chanceOfLargeLeeway = premises.length <= 5 ? 0.7 : 0.3
        let leeway = Math.random() < chanceOfLargeLeeway ? 2 : 1;
        if (savedata.scrambleFactor >= 95) {
            leeway = 1;
        }
        if (Math.abs(unbreakableDivisions - neighborCount) <= leeway) {
            break;
        }
    }

    const scrambledPremises = endIndices.map(i => premises[i]);
    if (savedata.widePremises) {
        const thinPremiseIndex = scrambledPremises.findIndex(p => Array.isArray(p) && p.length == 1);
        if (thinPremiseIndex !== -1) {
            const thinPremise = scrambledPremises[thinPremiseIndex];
            scrambledPremises.splice(thinPremiseIndex, 1);
            scrambledPremises.push(thinPremise);
        }
    }
    return scrambledPremises;
}
