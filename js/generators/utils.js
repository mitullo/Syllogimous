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
        return cs[0];
    }
    const freq = savedata.negationFrequency || 50;
    // For 50% frequency, use random pick. Otherwise, weighted choice based on frequency
    if (Math.random() * 100 < freq) {
        return pickRandomItems(cs, 1).picked[0];
    }
    return cs[0];
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
