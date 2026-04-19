function pickRandomItems(array, n) {
    const copy = [...array];
    const picked = [];
    while (n > 0) {
        const rnd = Math.floor(Math.random()*copy.length);
        picked.push(copy.splice(rnd, 1)[0]);
        n--;
    }
    return { picked, remaining: copy };
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

function coinFlip() {
    return Math.random() > 0.5;
}

function negationRoll() {
    if (!savedata.enableNegation) {
        return false;
    }
    const freq = savedata.negationFrequency || 50;
    return Math.random() * 100 < freq;
}

// Apply conclusion negation if enabled - wraps the conclusion in a "Not" form
// and flips the validity. This is actual negation, not inversion.
// Returns [conclusionHTML, isValid] tuple
function applyConclusionNegation(conclusion, isValid, premiseObj, pattern=null) {
    if (!savedata.enableConclusionNegation || !conclusion || !premiseObj) {
        return [conclusion, isValid];
    }

    // Use frequency setting (default 50%)
    const freq = savedata.conclusionNegationFrequency || 50;
    if (Math.random() * 100 < freq) {
        const negatedConclusion = createNegatedConclusionHTML(premiseObj, false, null, pattern);
        // Negation flips the validity - "A is Not west of B" is true when "A is west of B" is false
        return [negatedConclusion, !isValid];
    }

    return [conclusion, isValid];
}

function randomInclusive(start, end) {
    if (start >= end) {
        return start;
    }
    return Math.floor(Math.random() * (end - start + 1)) + start;
}

function arraysEqual(arr1, arr2) {
    return arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);
}

function removeDuplicateArrays(arrays) {
    const uniqueArrays = arrays.filter((arr, index, self) =>
      index === self.findIndex(otherArr => arraysEqual(arr, otherArr))
    );

    return uniqueArrays;
}

function removeDuplicates(arr) {
  const seen = new Set();
  return arr.filter(item => {
    if (seen.has(item))
        return false;
    seen.add(item);
    return true;
  });
}

function getPremisesFor(key, defaultQuota) {
    if (savedata[key] && typeof savedata[key] === 'number' && isFinite(savedata[key])) {
        return defaultQuota >= 2 ? Math.max(2, savedata[key]) : savedata[key];
    } else {
        return defaultQuota;
    }
}

function pickNegatable(cs) {
    if (!savedata.enableNegation) {
        return { html: cs[0], isInverted: false };
    }
    const freq = savedata.negationFrequency || 50;
    // For 50% frequency, use random pick. Otherwise, weighted choice based on frequency
    if (Math.random() * 100 < freq) {
        const picked = pickRandomItems(cs, 1).picked[0];
        // cs[1] is the inverted version (with is-negated span)
        return { html: picked, isInverted: picked === cs[1] };
    }
    return { html: cs[0], isInverted: false };
}

function interleaveArrays(arr1, arr2) {
    const maxLength = Math.max(arr1.length, arr2.length); // Get the longer array's length
    const result = [];

    for (let i = 0; i < maxLength; i++) {
        if (i < arr1.length) {
            result.push(arr1[i]); // Add element from the first array if it exists
        }
        if (i < arr2.length) {
            result.push(arr2[i]); // Add element from the second array if it exists
        }
    }

    return result;
}

function frontHeavyIntervalMerge(left, right) {
    const result = [];
    const totalIntervals = right.length + 1;
    const lowInterval = Math.floor(left.length / totalIntervals);
    const highInterval = Math.ceil(left.length / totalIntervals);
    const numHigh = left.length % totalIntervals;

    let m = 0;
    let n = 0;

    for (let i = 0; i < numHigh; i++) {
        for (let j = 0; j < highInterval; j++) {
            result.push(left[m++]);
        }
        if (n < right.length) {
            result.push(right[n++]);
        }
    }

    for (let i = numHigh; i < totalIntervals; i++) {
        for (let j = 0; j < lowInterval; j++) {
            result.push(left[m++]);
        }
        if (n < right.length) {
            result.push(right[n++]);
        }
    }

    return result;
}

function pairwise(arr, callback) {
    for (let i = 0; i < arr.length - 1; i++) {
        callback(arr[i], arr[i + 1], i, arr);
    }
}

function repeatArrayUntil(arr, n) {
    const result = [];
    while (result.length < n) {
        result.push(...arr); // Spread the array and append it to the result
    }
    return result.slice(0, n); // Trim the array to exactly 'n' elements
}

function getLocalStorageObj(key) {
    const entry = localStorage.getItem(key);
    if (entry) {
        return JSON.parse(entry);
    } else {
        return null;
    }
}

function setLocalStorageObj(key, obj) {
    localStorage.setItem(key, JSON.stringify(obj));
}

function normalizeString(input) {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function oneOutOf(n) {
    return Math.random() < 1 / n;
}

// Helper functions for multiple conclusions uniqueness (sample without replacement)
// Fisher-Yates shuffle that returns a new array (non-mutating)
function shuffleCopy(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Pick unique subset from pool without replacement
function pickUniqueSubset(pool, size, usedKeys, normalizeFn = items => items.join('|')) {
    if (!Array.isArray(pool) || pool.length < size) return null;

    for (let attempts = 0; attempts < 20; attempts++) {
        const picked = shuffleCopy(pool).slice(0, size);
        const key = normalizeFn(picked);
        if (!usedKeys.has(key)) {
            usedKeys.add(key);
            return picked;
        }
    }

    return shuffleCopy(pool).slice(0, size);
}

// Build unique pairs from neighbors using pairChooser
function buildUniquePairs(neighbors, pairChooser, maxPairs = 20) {
    const pairs = [];
    const seen = new Set();

    for (let i = 0; i < maxPairs; i++) {
        const pr = pairChooser.pickTwoDistantWords(neighbors);
        if (!pr) continue;

        const [a, b] = pr;
        const key = [a, b].sort().join('|');
        if (seen.has(key)) continue;

        seen.add(key);
        pairs.push([a, b]);
    }

    return shuffleCopy(pairs);
}

// Fallback helper functions for consistent multiple conclusions generation
// Always returns a subset, preferring unique but falling back to any random subset
function pickUniqueSubsetOrFallback(pool, size, usedKeys, normalizeFn = items => items.join('|'), maxAttempts = 50) {
    if (!Array.isArray(pool) || pool.length < size) return null;

    for (let attempts = 0; attempts < maxAttempts; attempts++) {
        const picked = shuffleCopy(pool).slice(0, size);
        const key = normalizeFn(picked);
        if (!usedKeys.has(key)) {
            usedKeys.add(key);
            return picked;
        }
    }

    // Fallback: return any random subset (may repeat)
    return shuffleCopy(pool).slice(0, size);
}

// Always returns a pair, preferring unique but falling back to any random pair
function getUniquePairOrFallback(neighbors, pairChooser, usedPairKeys, maxAttempts = 20) {
    for (let attempts = 0; attempts < maxAttempts; attempts++) {
        const pr = pairChooser.pickTwoDistantWords(neighbors);
        if (!pr) continue;

        const [a, b] = pr;
        const key = [a, b].sort().join('|');
        if (!usedPairKeys.has(key)) {
            usedPairKeys.add(key);
            return pr;
        }
    }

    // Fallback: plain random pair (may repeat)
    return pairChooser.pickTwoDistantWords(neighbors);
}
