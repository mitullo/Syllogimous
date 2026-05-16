function diffCoords(a, b) {
    return b.map((c, i) => c - a[i]);
}

function addCoords(a, b) {
    return a.map((c, i) => c + b[i]);
}

function normalize(a) {
    if (a.every(c => c === 0)) return null;
    return a.map(c => c === 0 ? 0 : c / Math.abs(c));
}

let _cachedDirectionLimit = null;

function resetDirectionLimit() {
    if (!savedata.enableDoubleDistance) {
        _cachedDirectionLimit = 1;
    } else if (Math.random() * 100 < (savedata.doubleDistanceFrequency ?? 100)) {
        _cachedDirectionLimit = 2;
    } else {
        _cachedDirectionLimit = 1;
    }
}

function directionLimit() {
    if (_cachedDirectionLimit === null) resetDirectionLimit();
    return _cachedDirectionLimit;
}

function normalizeDirectionCoord(a) {
    if (a.every(c => c === 0)) return null;
    const limit = directionLimit();
    return a.map(c => Math.max(-limit, Math.min(limit, c)));
}

function conclusionDimensionLimit(coordLength, index) {
    // 4D uses the last axis as time; premise generation only supports -1/0/1 there.
    // Do not let double-distance conclusion clamping create impossible time coords like 2.
    if (coordLength === 4 && index === 3) return 1;
    return directionLimit();
}

function normalizeConclusionCoord(a) {
    if (a.every(c => c === 0)) return null;
    if (savedata.enableDoubleDistanceConclusions) {
        return a.map((c, i) => {
            const limit = conclusionDimensionLimit(a.length, i);
            return Math.max(-limit, Math.min(limit, c));
        });
    }
    return a.map(c => c === 0 ? 0 : c / Math.abs(c));
}

function directionValues() {
    const limit = directionLimit();
    let values = [];
    for (let i = -limit; i <= limit; i++) {
        values.push(i);
    }
    return values;
}

function createDirectionCoords(dimensions, spatialDimensions=dimensions) {
    const values = directionValues();
    let coords = [];
    const build = (current) => {
        if (current.length === dimensions) {
            if (current.every(c => c === 0)) return;
            coords.push(current.slice());
            return;
        }
        const dimension = current.length;
        const dimensionValues = dimension < spatialDimensions ? values : [-1, 0, 1];
        for (const value of dimensionValues) {
            current.push(value);
            build(current);
            current.pop();
        }
    };
    build([]);
    return coords;
}

function get2DDirCoords() {
    return savedata.enableDoubleDistance ? createDirectionCoords(2) : dirCoords.slice(1);
}

function get3DDirCoords() {
    return savedata.enableDoubleDistance ? createDirectionCoords(3) : dirCoords3D;
}

function get4DDirCoords() {
    return savedata.enableDoubleDistance ? createDirectionCoords(4, 3) : dirCoords4D;
}

function getDirectionCoordsForLength(length) {
    if (length === 4) return get4DDirCoords();
    if (length === 3) return get3DDirCoords();
    return get2DDirCoords();
}

function inverse(a) {
    if (!a) return null;
    return a.map(c => -c);
}

function dirCoordsEqual(a, b) {
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    return a.every((c, i) => c === b[i]);
}

function findDirection(a, b) {
    return normalizeDirectionCoord(diffCoords(a, b));
}

function getConclusionCoords(wordCoordMap, startWord, endWord) {
    const [start, end] = [wordCoordMap[startWord], wordCoordMap[endWord]];
    const diffCoord = diffCoords(start, end);
    const conclusionCoord = normalizeConclusionCoord(diffCoord);
    return [diffCoord, conclusionCoord];
}

function isRepresentableConclusionCoord(diffCoord, conclusionCoord) {
    if (!isNonZeroConclusion(conclusionCoord)) return false;

    // In the original +/-1 mode, directions are intentionally broad: any amount west
    // normalizes to West. In double-distance conclusion mode, however, West² means an
    // exact two-step relation. Reject larger deltas that merely got clamped to +/-2.
    if (!savedata.enableDoubleDistanceConclusions) return true;

    return conclusionCoord.every((coord, i) => diffCoord[i] === coord);
}

function getRepresentableConclusionCoords(wordCoordMap, startWord, endWord) {
    const [diffCoord, conclusionCoord] = getConclusionCoords(wordCoordMap, startWord, endWord);
    if (!isRepresentableConclusionCoord(diffCoord, conclusionCoord)) {
        return [diffCoord, null];
    }
    return [diffCoord, conclusionCoord];
}

function findRepresentableDirection(a, b) {
    const diffCoord = diffCoords(a, b);
    const directionCoord = normalizeDirectionCoord(diffCoord);
    if (!isNonZeroConclusion(directionCoord)) return null;

    // With double-distance directions, do not let a three-or-more-step gap masquerade
    // as a two-step West²/East² style relation. Without double-distance, retain the
    // legacy broad semantics where any amount west normalizes to West.
    if (savedata.enableDoubleDistance && !directionCoord.every((coord, i) => diffCoord[i] === coord)) {
        return null;
    }
    return directionCoord;
}

function isNonZeroConclusion(conclusionCoord) {
    return conclusionCoord != null && Array.isArray(conclusionCoord) && conclusionCoord.some(c => c !== 0);
}

function taxicabDistance(a, b) {
    return a.map((v,i) => Math.abs(b[i] - v)).reduce((left,right) => left + right)
}

function pickWeightedRandomDirection(dirCoords, baseWord, neighbors, wordCoordMap) {
    const badTargets = (neighbors[baseWord] ?? []).map(word => wordCoordMap[word]).filter(Boolean);
    const base = wordCoordMap[baseWord];
    if (!base) return dirCoords[Math.floor(Math.random() * dirCoords.length)];
    let pool = [];
    for (const dirCoord of dirCoords) {
        const endLocation = dirCoord.map((d,i) => d + base[i]);
        const distanceToClosest = badTargets
            .map(badTarget => taxicabDistance(badTarget, endLocation))
            .reduce((a,b) => Math.min(a,b), 999);
        if (distanceToClosest == 0) {
            pool.push(dirCoord)
        } else if (distanceToClosest == 1) {
            pool.push(dirCoord);
            pool.push(dirCoord);
            pool.push(dirCoord);
            pool.push(dirCoord);
            pool.push(dirCoord);
        } else if (distanceToClosest == 2) {
            pool.push(dirCoord);
            pool.push(dirCoord);
            pool.push(dirCoord);
            pool.push(dirCoord);
        } else if (distanceToClosest == 3) {
            pool.push(dirCoord);
            pool.push(dirCoord);
        } else {
            pool.push(dirCoord);
        }
    }

    return pickRandomItems(pool, 1).picked[0];
}

class Direction2D {
    constructor(enableHardMode=true, enableAnchor=false) {
        this.enableHardMode = enableHardMode;
        this.enableAnchor = enableAnchor;
    }

    pickDirection(baseWord, neighbors, wordCoordMap) {
        return pickWeightedRandomDirection(get2DDirCoords(), baseWord, neighbors, wordCoordMap);
    }

    createDirectionStatement(a, b, dirCoord) {
        // Handle null dirCoord (can happen when transforms result in zero vector)
        if (!dirCoord) {
            return {
                start: b,
                end: a,
                relation: `is at of`,
                reverse: `is at of`,
                relationMinimal: '',
                reverseMinimal: '',
            }
        }
        const direction = dirStringFromCoord(dirCoord);
        const reverseDirection = dirStringFromCoord(inverse(dirCoord));
        return {
            start: b,
            end: a,
            relation: `is ${direction} of`,
            reverse: `is ${reverseDirection} of`,
            relationMinimal: dirStringMinimal(dirCoord),
            reverseMinimal: dirStringMinimal(inverse(dirCoord)),
        }
    }

    initialCoord() {
        return [0, 0];
    }

    getName() {
        if (this.enableAnchor) {
            return "Anchor Space"
        } else {
            return "Space Two D";
        }
    }

    hardModeAllowed() {
        if (this.enableAnchor) {
            return savedata.anchorSpaceHardModeLevel > 0;
        }
        return this.enableHardMode;
    }

    hardModeLevel() {
        if (this.enableAnchor) {
            return savedata.anchorSpaceHardModeLevel;
        }
        return savedata.space2DHardModeLevel;
    }

    getCountdown() {
        if (this.enableAnchor) {
            return savedata.overrideAnchorSpaceTime;
        } else {
            return savedata.overrideDirectionTime;
        }
    }

    shouldUseAnchor() {
        return this.enableAnchor;
    }
}

class Direction3D {
    constructor(enableHardMode=true) {
        this.enableHardMode = enableHardMode;
    }

    pickDirection(baseWord, neighbors, wordCoordMap) {
        return pickWeightedRandomDirection(get3DDirCoords(), baseWord, neighbors, wordCoordMap);
    }

    createDirectionStatement(a, b, dirCoord) {
        // Handle null dirCoord (can happen when transforms result in zero vector)
        if (!dirCoord) {
            return {
                start: b,
                end: a,
                relation: `is at of`,
                reverse: `is at of`,
                relationMinimal: '',
                reverseMinimal: '',
            }
        }
        const direction = dirStringFromCoord(dirCoord);
        const reverseDirection = dirStringFromCoord(inverse(dirCoord));
        return {
            start: b,
            end: a,
            relation: `is ${direction} of`,
            reverse: `is ${reverseDirection} of`,
            relationMinimal: dirStringMinimal(dirCoord),
            reverseMinimal: dirStringMinimal(inverse(dirCoord)),
        }
    }

    initialCoord() {
        return [0, 0, 0];
    }

    getName() {
        return "Space Three D";
    }

    hardModeAllowed() {
        return this.enableHardMode;
    }

    hardModeLevel() {
        return savedata.space3DHardModeLevel;
    }

    getCountdown() {
        return savedata.overrideDirection3DTime;
    }

    shouldUseAnchor() {
        return false;
    }
}

class Direction4D {
    constructor(enableHardMode=true) {
        this.enableHardMode = enableHardMode;
    }

    pickDirection(baseWord, neighbors, wordCoordMap) {
        let dirCoord
        do {
            dirCoord = pickWeightedRandomDirection(get4DDirCoords(), baseWord, neighbors, wordCoordMap);
        } while (dirCoord.slice(0, 3).every(c => c === 0))
        return dirCoord
    }

    createDirectionStatement(a, b, dirCoord) {
        // Handle null dirCoord (can happen when transforms result in zero vector)
        if (!dirCoord) {
            return {
                start: b,
                end: a,
                relation: `is at of`,
                reverse: `is at of`,
                relationMinimal: '',
                reverseMinimal: '',
            }
        }
        const direction = dirStringFromCoord(dirCoord);
        const reverseDirection = dirStringFromCoord(inverse(dirCoord));
        // Use temporalLayers (same as 5D/6D) for consistent time vocabulary:
        // "was before" / "is simultaneous with" / "will be after"
        const temporal = temporalLayers[dirCoord[3] + 1];
        const spatialRelation = `is ${direction} of`;
        const reverseSpatialRelation = `is ${reverseDirection} of`;
        return {
            start: b,
            end: a,
            relation: `${spatialRelation}, ${temporal.name}`,
            reverse: `${reverseSpatialRelation}, ${temporal.reverse}`,
            relationMinimal: dirStringMinimal(dirCoord),
            reverseMinimal: dirStringMinimal(inverse(dirCoord)),
        }
    }

    initialCoord() {
        return [0, 0, 0, 0];
    }

    getName() {
        return "SPACE FOUR D";
    }

    hardModeAllowed() {
        return this.enableHardMode;
    }

    hardModeLevel() {
        return savedata.space4DHardModeLevel;
    }

    getCountdown() {
        return savedata.overrideDirection4DTime;
    }

    shouldUseAnchor() {
        return false;
    }
}

function pickBaseWord(neighbors, branchesAllowed, bannedFromBranching=[]) {
    if (savedata.enableConnectionBranching === false) {
        branchesAllowed = false;
    }
    if (Object.values(neighbors).filter(list => list.length == 3).length >= 2) {
        branchesAllowed = false;
    }
    const options = Object.keys(neighbors);
    const useStimSets = savedata.enableStimulusSets && savedata.stimulusSetSize >= 2;
    const setSize = useStimSets ? savedata.stimulusSetSize : 1;
    // When stimulus sets are enabled, each premise adds setSize neighbors, so increase the limit
    const baseLimit = (!branchesAllowed || options.length <= 3) ? 1 : 2;
    const neighborLimit = useStimSets ? baseLimit + setSize - 1 : baseLimit;
    let pool = [];
    for (const word of options) {
        if (neighbors[word] && neighbors[word].length > neighborLimit) {
            continue;
        }

        if (bannedFromBranching.includes(word) && neighbors[word].length > 1) {
            continue;
        }

        pool.push(word);
        pool.push(word);
        pool.push(word);
        if (neighbors[word] && neighbors[word].length == 1) {
            pool.push(word);
            pool.push(word);
            if (options.length >= 6) {
                pool.push(word);
                pool.push(word);
                pool.push(word);
                pool.push(word);
                pool.push(word);
            }
        }
    }
    const baseWord = pickRandomItems(pool, 1).picked[0];
    if (!baseWord && options.length > 0) {
        // Fallback: pick any word from neighbors if pool was empty
        return pickRandomItems(options, 1).picked[0];
    }
    return baseWord;
}

class DirectionQuestion {
    constructor(directionGenerator) {
        this.generator = directionGenerator;
        this.pairChooser = new DirectionPairChooser();
        this.incorrectDirections = new IncorrectDirections();
    }

    create(length) {
        let startWord;
        let endWord;

        let conclusion;
        let isValid;
        let conclusionCoord;
        let diffCoord;
        let wordCoordMap = {};
        let neighbors = {};
        let premises = [];
        let usedDirCoords = [];
        let [numInterleaved, numTransforms] = this.getNumTransformsSplit(length);
        const branchesAllowed = Math.random() < 0.75;
        resetDirectionLimit();
        let anchorWords = null;
        let pattern = null;
        let wordsInPremises = new Set();
        let continuousOps = [];
        
        // Create unified transform state if any transforms are needed
        // This will be initialized with wordCoordMap once it's created
        let transformState = (numInterleaved > 0 || numTransforms > 0) ? new TransformState({}, []) : null;
        let operations = []; // Declare outside while loop for access in return statement
        let hardModeDimensions = []; // Declare outside while loop
        let retryCount = 0;
        const maxRetries = 50;
        
        while (retryCount < maxRetries) {
            retryCount++;
            // Reset transformState at start of each iteration to clear stale data from failed attempts
            // But preserve the wordCoordMap as a reference (will be repopulated by createWordMapInterleaved)
            if (transformState) {
                transformState.transformedWords.clear();
                transformState.usedDimensions.clear();
                transformState.operations = [];
                transformState.extraDimensions = [];
                // Clear wordCoordMap contents but preserve the reference
                for (let key in transformState.wordCoordMap) {
                    delete transformState.wordCoordMap[key];
                }
            }
            
            continuousOps = [];
            operations = [];
            if (this.generator.shouldUseAnchor()) {
                if (numInterleaved > 0) {
                    // Use interleaved version for anchor spaces when interleave mode is on
                    [wordCoordMap, neighbors, premises, usedDirCoords, anchorWords] = this.createWordMapAnchorInterleaved(length, numInterleaved, transformState, branchesAllowed);
                } else {
                    [wordCoordMap, neighbors, premises, usedDirCoords, continuousOps, anchorWords] = this.createWordMapAnchor(length, branchesAllowed);
                }
            } else if (numInterleaved > 0) {
                [wordCoordMap, neighbors, premises, usedDirCoords] = this.createWordMapInterleaved(length, numInterleaved, transformState, null);
            } else {
                [wordCoordMap, neighbors, premises, usedDirCoords, continuousOps] = this.createWordMap(length, branchesAllowed);
            }
            // Extract all words that actually appear in premises
            wordsInPremises = new Set();
            for (const premise of premises) {
                // Handle wide premises (arrays) and regular premises (objects)
                const premiseList = Array.isArray(premise) ? premise : [premise];
                for (const p of premiseList) {
                    if (!p) continue; // Skip undefined/null premises
                    if (p.startSet) {
                        for (const w of p.startSet) wordsInPremises.add(w);
                    } else if (p.start) {
                        wordsInPremises.add(p.start);
                    }
                    if (p.endSet) {
                        for (const w of p.endSet) wordsInPremises.add(w);
                    } else if (p.end) {
                        wordsInPremises.add(p.end);
                    }
                }
            }
            // For Anchor Space modes, only pick conclusion words from words that appear in premises
            if (this.generator.shouldUseAnchor() && anchorWords) {
                // For Anchor Space v2, also generate pattern for display
                if (this.generator.getName() === "Anchor Space v2") {
                    pattern = this.generator.getPattern(wordCoordMap, anchorWords);
                }
                // Build constrained neighbor map from only words in premises
                const premiseNeighbors = {};
                for (const word of wordsInPremises) {
                    if (neighbors[word]) {
                        premiseNeighbors[word] = neighbors[word].filter(n => wordsInPremises.has(n));
                    }
                }
                // Check if we have valid pairs with distance > 1 (required by pickTwoDistantWords)
                const hasValidPairs = this._hasValidDistantPairs(premiseNeighbors);
                if (hasValidPairs) {
                    let pairResult = this.pairChooser.pickTwoDistantWords(premiseNeighbors);
                    if (pairResult) {
                        [startWord, endWord] = pairResult;
                    }
                }
                // Fallback: pick any two words with non-zero coordinate difference
                if (!startWord || !endWord) {
                    const allWords = Array.from(wordsInPremises);
                    for (let attempts = 0; attempts < 20 && (!startWord || !endWord); attempts++) {
                        const [a, b] = pickRandomItems(allWords, 2).picked;
                        if (wordCoordMap[a] && wordCoordMap[b]) {
                            const [diffCoord, conclusionCoord] = getRepresentableConclusionCoords(wordCoordMap, a, b);
                            if (isNonZeroConclusion(conclusionCoord)) {
                                startWord = a;
                                endWord = b;
                            }
                        }
                    }
                }
                if (!startWord || !endWord) {
                    continue; // Retry with new word map
                }
                
                // Ensure conclusion has at least one non-anchor word (to avoid trivial answers)
                const isStartAnchor = anchorWords.includes(startWord);
                const isEndAnchor = anchorWords.includes(endWord);
                if (isStartAnchor && isEndAnchor) {
                    // Both are anchors - try to find a pair with at least one non-anchor
                    const nonAnchorWords = Array.from(wordsInPremises).filter(w => !anchorWords.includes(w));
                    if (nonAnchorWords.length > 0) {
                        // Try to find a valid pair replacing one anchor with a non-anchor
                        // Build alternative neighbor map that includes non-anchors
                        const alternativePair = this._findPairWithNonAnchor(
                            premiseNeighbors, anchorWords, nonAnchorWords
                        );
                        if (alternativePair) {
                            [startWord, endWord] = alternativePair;
                        }
                        // If no alternative found, continue with the anchor pair (better than failing)
                    }
                }
            } else {
                const pairResult = this.pairChooser.pickTwoDistantWords(neighbors);
                if (!pairResult) {
                    // No distant pairs found - fall back to any pair with non-zero coordinate difference
                    const allWords = Object.keys(wordCoordMap);
                    let fallbackPair = null;
                    for (let attempts = 0; attempts < 20 && !fallbackPair; attempts++) {
                        const [a, b] = pickRandomItems(allWords, 2).picked;
                        if (wordCoordMap[a] && wordCoordMap[b]) {
                            const [, conclusionCoord] = getRepresentableConclusionCoords(wordCoordMap, a, b);
                            if (isNonZeroConclusion(conclusionCoord)) {
                                fallbackPair = [a, b];
                            }
                        }
                    }
                    if (!fallbackPair) {
                        continue; // Retry with new word map
                    }
                    [startWord, endWord] = fallbackPair;
                } else {
                    [startWord, endWord] = pairResult;
                }
            }
            
            // Get initial conclusion coords (before transforms) for validation
            [diffCoord, conclusionCoord] = getRepresentableConclusionCoords(wordCoordMap, startWord, endWord);
            if (!isNonZeroConclusion(conclusionCoord)) {
                continue; // No valid conclusion possible with this word map
            }
            
            // Initialize transformState with wordCoordMap for coordinated transforms
            if (transformState) {
                // For interleaved mode, wordCoordMap IS transformState.wordCoordMap (same reference)
                // For non-interleaved, we need to copy contents
                if (numInterleaved === 0) {
                    // Copy all keys from wordCoordMap to transformState.wordCoordMap
                    for (let key in transformState.wordCoordMap) {
                        delete transformState.wordCoordMap[key];
                    }
                    Object.assign(transformState.wordCoordMap, wordCoordMap);
                }
                // For interleaved, they're already the same reference, nothing to do
                transformState.anchorWords = anchorWords || [];
            }
            
            // Apply remaining basic transforms (interleaved were already applied via transformState)
            operations = []; // Reset for this iteration
            hardModeDimensions = []; // Reset for this iteration
            if (numTransforms > 0) {
                // Clear any stale operations from transformState before basicHardMode
                if (transformState) {
                    transformState.operations = [];
                }
                // Use unified transformState so basic transforms coordinate with interleaved
                const hardMode = new SpaceHardMode(numTransforms, anchorWords || [], transformState);
                [wordCoordMap, operations, hardModeDimensions] = hardMode.basicHardMode(
                    transformState ? transformState.wordCoordMap : wordCoordMap, 
                    startWord, endWord, conclusionCoord
                );
                
                if (numInterleaved > 0) {
                    // Only add basic operations - interleaved ones are already in premises
                    premises.push(...operations);
                    operations = [];
                }
            }
            
            // Add continuous transform operations to operations list only (not premises)
            // Continuous transforms apply silently to coordinates; their descriptions go in the Transformations section
            if (continuousOps.length > 0) {
                operations.push(...continuousOps);
            }
            
            // Recalculate conclusion coords AFTER transforms
            // Defensive: ensure words still exist in map (transforms might have affected them)
            if (!wordCoordMap[startWord] || !wordCoordMap[endWord]) {
                // Words lost from map due to transforms, retry
                if (transformState) {
                    transformState.transformedWords.clear();
                    transformState.usedDimensions.clear();
                    transformState.operations = [];
                    transformState.extraDimensions = [];
                    for (let key in transformState.wordCoordMap) {
                        delete transformState.wordCoordMap[key];
                    }
                }
                continue;
            }
            [diffCoord, conclusionCoord] = getRepresentableConclusionCoords(wordCoordMap, startWord, endWord);
            
            // Check if we have valid conclusion after transforms - if not, retry
            if (!isNonZeroConclusion(conclusionCoord)) {
                // Reset transformState for retry
                if (transformState) {
                    transformState.transformedWords.clear();
                    transformState.usedDimensions.clear();
                    transformState.operations = [];
                    transformState.extraDimensions = [];
                    for (let key in transformState.wordCoordMap) {
                        delete transformState.wordCoordMap[key];
                    }
                }
                continue; // Go back to start of while loop
            }
            
            // Valid conclusion found, exit loop
            break;
        }

        // Generate multiple conclusions if mode is enabled
        const numConclusions = (savedata.multipleConclusionsMode && savedata.numConclusions > 1)
            ? savedata.numConclusions
            : 1;

        const conclusionsArr = [];
        const usedConclusionTexts = new Set();
        const usedPairKeys = new Set();

        let generatedCount = 0;
        let isFirstConclusion = true;

        // Always run to completion - use fallback for pairs when unique ones exhausted
        while (generatedCount < numConclusions) {
            let sw, ew, dCoord, cCoord;

            // For first conclusion, use the already-selected pair
            if (isFirstConclusion) {
                sw = startWord;
                ew = endWord;
                dCoord = diffCoord;
                cCoord = conclusionCoord;
                isFirstConclusion = false;
                // Skip if conclusion is invalid after transforms
                if (!isNonZeroConclusion(cCoord)) {
                    generatedCount++; // Prevent infinite loop
                    continue;
                }
            } else {
                // Get pair with fallback when unique ones exhausted
                [sw, ew] = getUniquePairOrFallback(neighbors, this.pairChooser, usedPairKeys);

                if (!sw || !ew || !wordCoordMap[sw] || !wordCoordMap[ew]) {
                    generatedCount++; // Prevent infinite loop
                    continue;
                }

                [dCoord, cCoord] = getRepresentableConclusionCoords(wordCoordMap, sw, ew);
                if (!isNonZeroConclusion(cCoord)) {
                    generatedCount++; // Prevent infinite loop
                    continue;
                }
            }

            let conclusionIsValid;
            let conclusionHTML;
            let conclusionObj;
            if (coinFlip()) { // correct
                conclusionIsValid = true;
                conclusionObj = this.generator.createDirectionStatement(sw, ew, cCoord);
            } else { // wrong
                conclusionIsValid = false;
                let incorrectCoord;

                const interferenceLevel = this.getInterferenceLevel();
                const coordLength = cCoord.length;
                if (interferenceLevel > 0 && coordLength > 3 && Math.random() * 100 < interferenceLevel) {
                    incorrectCoord = [...cCoord];
                    const currentTime = incorrectCoord[3];
                    const timeOptions = [-1, 0, 1].filter(t => t !== currentTime);
                    incorrectCoord[3] = timeOptions[Math.floor(Math.random() * timeOptions.length)];
                } else if (interferenceLevel > 0 && coordLength === 3 && Math.random() * 100 < interferenceLevel) {
                    incorrectCoord = [...cCoord];
                    const currentZ = incorrectCoord[2];
                    const zOptions = [-1, 0, 1].filter(z => z !== currentZ);
                    incorrectCoord[2] = zOptions[Math.floor(Math.random() * zOptions.length)];
                } else {
                    incorrectCoord = this.incorrectDirections.chooseIncorrectCoord(usedDirCoords, cCoord, dCoord, hardModeDimensions);
                }
                conclusionObj = this.generator.createDirectionStatement(sw, ew, incorrectCoord);
            }

            const premiseResult = createPremiseHTML(conclusionObj, true, 0, pattern);
            conclusionHTML = premiseResult.html;
            // Flip validity if visual inversion was applied by pickNegatable
            // NOTE: This represents the same logical negation as conclusion negation,
            // so we track it to avoid double-flipping
            const wasInvertedByPremiseHTML = premiseResult.isInverted;
            if (wasInvertedByPremiseHTML) {
                conclusionIsValid = !conclusionIsValid;
            }
            // Apply conclusion negation, but pass flag to avoid double-flipping
            [conclusionHTML, conclusionIsValid] = applyConclusionNegation(conclusionHTML, conclusionIsValid, conclusionObj, pattern, wasInvertedByPremiseHTML);

            // Always add conclusion (may have duplicates if unique ones exhausted)
            usedConclusionTexts.add(conclusionHTML);


            if (conclusionsArr.length == 0) { // First conclusion wasn't getting added to used keys.
                const key = [sw, ew].sort().join('|');
                usedPairKeys.add(key);
            }
            conclusionsArr.push({
                conclusion: conclusionHTML,
                isValid: conclusionIsValid,
                startWord: sw,
                endWord: ew,
            });
            generatedCount++;
        }

        // Primary conclusion for backward compatibility
        const primaryConclusion = conclusionsArr[0] ?? { conclusion: '', isValid: false };
        isValid = primaryConclusion.isValid;
        conclusion = primaryConclusion.conclusion;

        if (numInterleaved === 0) {
            premises = scramble(premises, getScrambleFactor('overrideAnalogyScramble'));
        }
        // Filter out any undefined/null premises (can happen with transform stacking)
        premises = premises.filter(p => p != null).map((p, i) => createPremiseHTML(p, true, i, pattern));
        const countdown = this.generator.getCountdown();
        const totalTransforms = this.getNumTransformsSplit(length).reduce((a, b) => a + b, 0);
        let modifiers = [];
        if (totalTransforms > 0) {
            modifiers.push(`op${totalTransforms}`);
        }
        if (numInterleaved > 0) {
            modifiers.push(`interleave`);
        }
        if (continuousOps.length > 0) {
            modifiers.push(`continuous`);
        }
        // Pattern already generated above for v2, regular Anchor Space doesn't need pattern

        // For V2, filter wordCoordMap to only include words that appear in premises
        // For classic Anchor Space, keep all anchor words for the explanation grid
        const isV2 = this.generator.getName() === "Anchor Space v2";
        const finalWordCoordMap = isV2 ? {} : wordCoordMap;
        if (isV2) {
            // Include all words that appear in premises
            for (const word of wordsInPremises) {
                if (wordCoordMap[word]) {
                    finalWordCoordMap[word] = wordCoordMap[word];
                }
            }
            // Also include anchor words used as reference points in transforms
            // Parse operations AND premises (when interleaved, transforms are in premises)
            const allTransformStrings = [...operations];
            // Also check premises for transform patterns (interleaved transforms appear as premise strings)
            for (const premise of premises) {
                if (typeof premise === 'string' && 
                    (premise.includes('🪞') || premise.includes('↔️') || premise.includes(':=') || 
                     premise.includes('mirrored') || premise.includes('scaled') || 
                     premise.includes('rotated') || premise.includes('set to'))) {
                    allTransformStrings.push(premise);
                }
            }
            // Parse to find which words are used as reference (the 'a' in 'b is mirrored across a')
            for (const op of allTransformStrings) {
                if (!op) continue;
                // In HTML mode: look for <span class="subject">word</span>
                const spanMatches = op.match(/<span class="subject">([^<]+)<\/span>/g);
                if (spanMatches && spanMatches.length >= 2) {
                    // Last span is the reference word (a)
                    const lastMatch = spanMatches[spanMatches.length - 1];
                    const refWord = lastMatch.replace(/<[^>]+>/g, '');
                    if (wordCoordMap[refWord] && !finalWordCoordMap[refWord]) {
                        finalWordCoordMap[refWord] = wordCoordMap[refWord];
                    }
                } else {
                    // Minimal mode: no HTML spans, parse by finding known words
                    // The format is: movingWord dimension symbol refWord
                    // e.g., "NEC X🪞 Orange" or "NEC X↔️ Green"
                    // Find all words from wordCoordMap that appear in this operation
                    const knownWords = Object.keys(wordCoordMap);
                    for (const word of knownWords) {
                        // Skip if already in map
                        if (finalWordCoordMap[word]) continue;
                        // Check if this word appears in the operation
                        // Use word boundary check to avoid partial matches
                        const wordRegex = new RegExp(`\\b${word}\\b`);
                        if (wordRegex.test(op) && wordCoordMap[word]) {
                            finalWordCoordMap[word] = wordCoordMap[word];
                        }
                    }
                }
            }
        }

        return {
            category: this.generator.getName(),
            type: normalizeString(this.generator.getName()),
            ...((totalTransforms > 0 || savedata.widePremises) && { plen: length }),
            modifiers,
            startedAt: new Date().getTime(),
            wordCoordMap: finalWordCoordMap,
            isValid,
            premises,
            operations,
            conclusion,
            conclusions: conclusionsArr,
            currentConclusionIndex: 0,
            userAnswers: [],
            ...(countdown && { countdown }),
            ...(pattern && { pattern }),
        }
    }

    createAnalogy(length) {
        length = Math.max(2, length);

        let isValid;
        let isValidSame;
        resetDirectionLimit();
        let wordCoordMap = {};
        let neighbors = {};
        let premises = [];
        let usedDirCoords = [];
        let operations = [];
        let anchorWords = null;
        let pattern = null;
        let a, b, c, d;
        let continuousOps = [];
        let wordsInPremises = new Set();
        let [numInterleaved, numTransforms] = this.getNumTransformsSplit(length);
        const branchesAllowed = Math.random() > 0.2;
        const flip = coinFlip();
        const isV2 = this.generator.getName() === 'Anchor Space v2';
        let retryCount = 0;
        const maxRetries = 80;
        
        // Create unified transform state if any transforms are needed
        let transformState = (numInterleaved > 0 || numTransforms > 0) ? new TransformState({}, []) : null;
        
        while (flip !== isValidSame && retryCount < maxRetries) {
            retryCount++;
            // Reset transformState at start of each iteration to clear stale data
            // But preserve the wordCoordMap as a reference (will be repopulated by createWordMapInterleaved)
            if (transformState) {
                transformState.transformedWords.clear();
                transformState.usedDimensions.clear();
                transformState.operations = [];
                transformState.extraDimensions = [];
                // Clear wordCoordMap contents but preserve the reference
                for (let key in transformState.wordCoordMap) {
                    delete transformState.wordCoordMap[key];
                }
            }
            
            continuousOps = [];
            operations = [];
            if (this.generator.shouldUseAnchor()) {
                if (numInterleaved > 0) {
                    // Use interleaved version for anchor spaces when interleave mode is on
                    [wordCoordMap, neighbors, premises, usedDirCoords, anchorWords] = this.createWordMapAnchorInterleaved(length, numInterleaved, transformState, branchesAllowed);
                } else {
                    // Capture anchorWords (6th return value) and continuousOps (5th) for transform protection
                    [wordCoordMap, neighbors, premises, usedDirCoords, continuousOps, anchorWords] = this.createWordMapAnchor(length, branchesAllowed);
                }
                // Generate pattern for V2 to show memorization stage
                if (isV2 && anchorWords) {
                    pattern = this.generator.getPattern(wordCoordMap, anchorWords);
                }
            } else if (numInterleaved > 0) {
                [wordCoordMap, neighbors, premises, usedDirCoords] = this.createWordMapInterleaved(length, numInterleaved, transformState, null);
                anchorWords = null;
            } else {
                [wordCoordMap, neighbors, premises, usedDirCoords, continuousOps] = this.createWordMap(length, branchesAllowed);
                anchorWords = null;
            }
            // Extract all words that actually appear in premises
            wordsInPremises = new Set();
            for (const premise of premises) {
                const premiseList = Array.isArray(premise) ? premise : [premise];
                for (const p of premiseList) {
                    if (!p) continue;
                    if (p.startSet) {
                        for (const w of p.startSet) wordsInPremises.add(w);
                    } else if (p.start) {
                        wordsInPremises.add(p.start);
                    }
                    if (p.endSet) {
                        for (const w of p.endSet) wordsInPremises.add(w);
                    } else if (p.end) {
                        wordsInPremises.add(p.end);
                    }
                }
            }
            [a, b, c, d] = pickRandomItems(Object.keys(wordCoordMap), 4).picked;
            if (!a || !b || !c || !d) continue;

            // Ensure each conclusion pair has at least one non-anchor word (avoid trivial anchor-only conclusions)
            if (this.generator.shouldUseAnchor() && anchorWords) {
                const nonAnchorWords = Array.from(wordsInPremises).filter(w => !anchorWords.includes(w));
                if (nonAnchorWords.length > 0) {
                    // Fix pair (a, b) if both are anchors
                    if (anchorWords.includes(a) && anchorWords.includes(b)) {
                        a = nonAnchorWords[Math.floor(Math.random() * nonAnchorWords.length)];
                    }
                    // Fix pair (c, d) if both are anchors
                    if (anchorWords.includes(c) && anchorWords.includes(d)) {
                        c = nonAnchorWords[Math.floor(Math.random() * nonAnchorWords.length)];
                    }
                }
            }
            
            // Initialize transformState with final wordCoordMap and anchorWords
            if (transformState) {
                // For interleaved mode, wordCoordMap IS transformState.wordCoordMap (same reference)
                // For non-interleaved, we need to copy contents
                if (numInterleaved === 0) {
                    // Copy all keys from wordCoordMap to transformState.wordCoordMap
                    for (let key in transformState.wordCoordMap) {
                        delete transformState.wordCoordMap[key];
                    }
                    Object.assign(transformState.wordCoordMap, wordCoordMap);
                }
                // For interleaved, they're already the same reference, nothing to do
                transformState.anchorWords = anchorWords || [];
            }
            
            if (numTransforms > 0) {
                const [startWord, endWord] = pickRandomItems([a, b, c, d], 2).picked;
                const [diffCoord, conclusionCoord] = getRepresentableConclusionCoords(wordCoordMap, startWord, endWord);
                if (!conclusionCoord) continue;
                let _x;
                // Pass transformState to SpaceHardMode for coordinated transforms
                [wordCoordMap, operations, _x] = new SpaceHardMode(numTransforms, anchorWords || [], transformState)
                    .basicHardMode(transformState ? transformState.wordCoordMap : wordCoordMap, startWord, endWord, conclusionCoord);
                if (numInterleaved > 0) {
                    // Only add basic operations - interleaved ones are already in premises from createWordMapInterleaved
                    // transformState.operations includes BOTH, so we must use the returned operations (basic only)
                    premises.push(...operations);
                    operations = [];
                }
            }
            // Add continuous transform operations to operations list only (not premises)
            if (continuousOps.length > 0) {
                operations.push(...continuousOps);
            }
            const dirAB = findRepresentableDirection(wordCoordMap[a], wordCoordMap[b]);
            const dirCD = findRepresentableDirection(wordCoordMap[c], wordCoordMap[d]);
            // Handle null directions (words at same position or clamped double-distance) as not equal.
            isValidSame = dirAB !== null && dirCD !== null && arraysEqual(dirAB, dirCD);
        }
        if (flip !== isValidSame) return null;

        let conclusion = analogyTo(a, b);
        if (coinFlip()) {
            [conclusion, isValid] = applyAnalogyStatementChoice(conclusion, pickAnalogyStatementSame(), isValidSame);
        } else {
            [conclusion, isValid] = applyAnalogyStatementChoice(conclusion, pickAnalogyStatementDifferent(), !isValidSame);
        }
        conclusion += analogyTo(c, d);

        premises = premises.map((p, i) => createPremiseHTML(p, true, i, pattern));
        const countdown = this.generator.getCountdown();
        const totalTransforms = this.getNumTransformsSplit(length).reduce((a, b) => a + b, 0);
        let modifiers = [];
        if (totalTransforms > 0) {
            modifiers.push(`op${totalTransforms}`);
        }
        if (numInterleaved > 0) {
            modifiers.push(`interleave`);
        }
        if (continuousOps.length > 0) {
            modifiers.push(`continuous`);
        }
        // For V2, filter wordCoordMap to only include words that appear in premises
        // For classic Anchor Space, keep all anchor words for the explanation grid
        const finalWordCoordMap = isV2 ? {} : wordCoordMap;
        if (isV2) {
            for (const word of wordsInPremises) {
                if (wordCoordMap[word]) {
                    finalWordCoordMap[word] = wordCoordMap[word];
                }
            }
            // Also include anchor words used as reference points in transforms
            const allTransformStrings = [...operations];
            for (const premise of premises) {
                if (typeof premise === 'string' && 
                    (premise.includes('🪞') || premise.includes('↔️') || premise.includes(':=') || 
                     premise.includes('mirrored') || premise.includes('scaled') || 
                     premise.includes('rotated') || premise.includes('set to'))) {
                    allTransformStrings.push(premise);
                }
            }
            for (const op of allTransformStrings) {
                if (!op) continue;
                const spanMatches = op.match(/<span class="subject">([^<]+)<\/span>/g);
                if (spanMatches && spanMatches.length >= 2) {
                    const lastMatch = spanMatches[spanMatches.length - 1];
                    const refWord = lastMatch.replace(/<[^>]+>/g, '');
                    if (wordCoordMap[refWord] && !finalWordCoordMap[refWord]) {
                        finalWordCoordMap[refWord] = wordCoordMap[refWord];
                    }
                } else {
                    const knownWords = Object.keys(wordCoordMap);
                    for (const word of knownWords) {
                        if (finalWordCoordMap[word]) continue;
                        const wordRegex = new RegExp(`\\b${word}\\b`);
                        if (wordRegex.test(op) && wordCoordMap[word]) {
                            finalWordCoordMap[word] = wordCoordMap[word];
                        }
                    }
                }
            }
        }
        return {
            category: 'Analogy: ' + this.generator.getName(),
            type: normalizeString(this.generator.getName()),
            modifiers,
            startedAt: new Date().getTime(),
            wordCoordMap: finalWordCoordMap,
            bucket: Object.keys(wordCoordMap),
            isValid,
            premises,
            ...(savedata.widePremises && { plen: length }),
            operations,
            conclusion,
            ...(countdown && { countdown }),
            ...(pattern && { pattern }),
        }
    }

    createCompactAnalogy(length = 2) {
        // Binary analogy needs 2-premise leaves to keep the whole question at 4p.
        // Keep that minimum, but make the compact leaf a connected chain instead
        // of two unrelated edges. The analogy becomes A:B :: B:C, so the two
        // premises share a pivot and cannot be treated as isolated packages.
        resetDirectionLimit();

        const words = createStimuli(3);
        const [a, b, c] = words;
        const initialCoord = this.generator.initialCoord();
        const zero = initialCoord.map(() => 0);
        const wordCoordMap = {
            [a]: initialCoord.slice(),
        };
        const neighbors = { [a]: [], [b]: [], [c]: [] };

        const dir1 = this.generator.pickDirection(a, neighbors, wordCoordMap);
        wordCoordMap[b] = addCoords(wordCoordMap[a], dir1 || zero);
        neighbors[a].push(b);
        neighbors[b].push(a);

        const wantSame = coinFlip();
        let dir2 = dir1;
        let guard = 0;
        while (!wantSame && arraysEqual(dir2, dir1) && guard < 25) {
            dir2 = this.generator.pickDirection(b, neighbors, wordCoordMap);
            guard++;
        }
        if (!wantSame && arraysEqual(dir2, dir1)) {
            dir2 = inverse(dir1) || dir1;
        }

        wordCoordMap[c] = addCoords(wordCoordMap[b], dir2 || zero);
        neighbors[b].push(c);
        neighbors[c].push(b);

        const premiseObjs = [
            this.generator.createDirectionStatement(a, b, dir1),
            this.generator.createDirectionStatement(b, c, dir2),
        ];
        const premises = premiseObjs.map((p, i) => createPremiseHTML(p, true, i));

        const isValidSame = dir1 !== null && dir2 !== null && arraysEqual(dir1, dir2);
        let conclusion = analogyTo(a, b);
        let isValid;
        if (coinFlip()) {
            [conclusion, isValid] = applyAnalogyStatementChoice(conclusion, pickAnalogyStatementSame(), isValidSame);
        } else {
            [conclusion, isValid] = applyAnalogyStatementChoice(conclusion, pickAnalogyStatementDifferent(), !isValidSame);
        }
        conclusion += analogyTo(b, c);

        return {
            category: 'Analogy: ' + this.generator.getName(),
            type: normalizeString(this.generator.getName()),
            modifiers: ['compact', 'connected'],
            startedAt: new Date().getTime(),
            wordCoordMap,
            bucket: Object.keys(wordCoordMap),
            isValid,
            premises,
            operations: [],
            conclusion,
            ...(this.generator.getCountdown() && { countdown: this.generator.getCountdown() }),
        };
    }

    getInterferenceLevel() {
        const name = this.generator.getName();
        if (name.includes('Three D') || name.includes('3D')) {
            return savedata.space3DInterference || 0;
        } else if (name.includes('4D')) {
            return savedata.space4DInterference || 0;
        } else if (name.includes('Five D') || name.includes('5D')) {
            return savedata.space5DInterference || 0;
        } else if (name.includes('Six D') || name.includes('6D')) {
            return savedata.space6DInterference || 0;
        }
        return 0;
    }

    getNumTransformsSplit(numPremises) {
        let totalTransforms = this.generator.hardModeLevel();
        if (!this.generator.hardModeAllowed() || totalTransforms === 0) {
            return [0, 0];
        }

        // When continuous transforms are enabled, reserve one slot for the continuous transform
        if (savedata.enableTransformContinuous && totalTransforms > 0) {
            totalTransforms = Math.max(0, totalTransforms - 1);
        }

        if (!savedata.enableTransformInterleave) {
            return [0, totalTransforms];
        }

        // OVERRIDE: Anchor Space with fixed positions needs constant transforms
        // regardless of premise count. Put all transforms through basicHardMode
        // for maximum predictability with restricted word pools.
        // NOTE: This override is skipped when interleave mode is enabled to allow
        // transforms to be interleaved with premises.
        if (this.generator.shouldUseAnchor() && savedata.anchorSpaceFixedPositions && !savedata.enableTransformInterleave) {
            return [0, totalTransforms];
        }

        let interleaveCount = Math.max(0, Math.min(totalTransforms - 1, numPremises - 1));
        return [interleaveCount, totalTransforms - interleaveCount];
    }

    createSetDirectionStatement(startSet, endSet, dirCoord) {
        if (!dirCoord) {
            return {
                startSet: startSet,
                endSet: endSet,
                relation: `are at of`,
                reverse: `are at of`,
                relationMinimal: '',
                reverseMinimal: '',
            }
        }
        const direction = dirStringFromCoord(dirCoord);
        const reverseDirection = dirStringFromCoord(inverse(dirCoord));
        return {
            startSet: endSet,   // subject set (the set that "is [direction] of" the other)
            endSet: startSet,   // object set (the reference set)
            relation: `are ${direction} of`,
            reverse: `are ${reverseDirection} of`,
            relationMinimal: dirStringMinimal(dirCoord),
            reverseMinimal: dirStringMinimal(inverse(dirCoord)),
        }
    }

    createWordMapCommands(length, forcedInterleaveCount = null) {
        // When stimulus sets are enabled, we need more words per premise
        const useStimSets = savedata.enableStimulusSets && savedata.stimulusSetSize >= 2;
        const setSize = useStimSets ? savedata.stimulusSetSize : 1;
        const extraWords = useStimSets ? (length * (2 * setSize - 2)) : 0;
        const words = createStimuli(length + 1 + extraWords);
        let commands = words.map(w => ['move', w]);
        // Use forced interleave count if provided (from createWordMapInterleaved), otherwise calculate
        let interleaveCount = forcedInterleaveCount !== null 
            ? forcedInterleaveCount 
            : this.getNumTransformsSplit(length)[0];
        if (interleaveCount === 0) {
            return [words, commands];
        }

        let transformCommands = []
        for (let i = 0; i < interleaveCount; i++) {
            transformCommands.push(['transform']);
        }
        let tailCommands = commands.slice(1, commands.length);
        let merged = frontHeavyIntervalMerge(tailCommands, transformCommands);
        merged.unshift(commands[0]);

        return [words, merged];
    }

    createWordMapInterleaved(length, numInterleaved, transformState = null, anchorWords = null) {
        let [words, commands] = this.createWordMapCommands(length, numInterleaved);
        const initialCoord = this.generator.initialCoord();

        // Stimulus sets: group words into sets of stimulusSetSize
        const useStimSets = savedata.enableStimulusSets && savedata.stimulusSetSize >= 2;
        const setSize = useStimSets ? savedata.stimulusSetSize : 1;

        // When using coordinated transforms, use transformState's wordCoordMap as base
        // to maintain reference consistency
        let wordCoordMap;
        if (transformState) {
            transformState.wordCoordMap[words[0]] = initialCoord;
            wordCoordMap = transformState.wordCoordMap;
        } else {
            wordCoordMap = {[words[0]]: initialCoord };
        }

        let neighbors = {[words[0]]: []};
        let premiseChunks = [[]];
        let operations = [];
        let usedDirCoords = [];

        let lastWord = words[0];
        let dimensionPool = repeatArrayUntil(shuffle(initialCoord.map((d, i) => i)), commands.length * 2);
        let dimensionIndex = 0;

        // Create local transformState if not provided (for coordination)
        const localTransformState = transformState || (numInterleaved > 0 ? new TransformState(wordCoordMap, []) : null);
        let continuousTransforms = [];
        const continuousHardMode = new SpaceHardMode(1, anchorWords || [], localTransformState);

        let baseCompanionBuffer = [];  // Buffer for base companion words
        let targetBuffer = [];  // Buffer for target words
        let setBaseWord = null;

        for (let i = 1; i < commands.length; i++) {
            let command = commands[i];
            let action = command[0];
            if (action === 'transform') {
                // Flush any buffered set words before transform (only if full set)
                if (useStimSets && targetBuffer.length >= setSize) {
                    const baseSet = [setBaseWord, ...baseCompanionBuffer];
                    const dirCoord = this.generator.pickDirection(setBaseWord, neighbors, wordCoordMap);
                    for (const bc of baseCompanionBuffer) {
                        wordCoordMap[bc] = [...wordCoordMap[setBaseWord]];
                    }
                    for (const w of targetBuffer) {
                        wordCoordMap[w] = addCoords(wordCoordMap[setBaseWord], dirCoord);
                    }
                    const setStatement = this.createSetDirectionStatement(baseSet, targetBuffer, dirCoord);
                    premiseChunks[premiseChunks.length - 1].push(setStatement);
                    usedDirCoords.push(dirCoord);
                    neighbors[setBaseWord] = neighbors[setBaseWord] ?? [];
                    for (const bc of baseCompanionBuffer) {
                        neighbors[setBaseWord].push(bc);
                        neighbors[bc] = neighbors[bc] ?? [];
                        neighbors[bc].push(setBaseWord);
                    }
                    for (const w of targetBuffer) {
                        neighbors[setBaseWord].push(w);
                        neighbors[w] = neighbors[w] ?? [];
                        neighbors[w].push(setBaseWord);
                        for (const bc of baseCompanionBuffer) {
                            neighbors[w].push(bc);
                            neighbors[bc].push(w);
                        }
                    }
                    lastWord = targetBuffer[targetBuffer.length - 1];
                    baseCompanionBuffer = [];
                    targetBuffer = [];
                    setBaseWord = null;
                }
                if (premiseChunks[premiseChunks.length - 1].length !== 0) {
                    premiseChunks.push([]);
                }
                const hardMode = new SpaceHardMode(1, anchorWords || [], localTransformState);
                let operation;
                if (savedata.enableTransformContinuous && continuousTransforms.length === 0 && Math.random() < 0.5) {
                    const continuous = hardMode.createContinuousTransform(localTransformState ? localTransformState.wordCoordMap : wordCoordMap, dimensionPool[dimensionIndex]);
                    if (continuous) {
                        continuousTransforms.push(continuous);
                        operation = continuous.operation;
                    }
                }
                if (!operation) {
                    let newWordMap;
                    [newWordMap, operation] = hardMode.oneTransform(
                        localTransformState ? localTransformState.wordCoordMap : wordCoordMap,
                        lastWord,
                        dimensionPool[dimensionIndex],
                        dimensionPool[dimensionIndex+1]
                    );
                    wordCoordMap = newWordMap;
                }
                dimensionIndex++;
                operations.push(operation);
            } else {
                const nextWord = command[1];
                let didCreatePremise = false;

                if (useStimSets) {
                    // Buffer words for set grouping
                    // First (setSize-1) words are base companions, next setSize words are targets
                    if (baseCompanionBuffer.length === 0 && targetBuffer.length === 0) {
                        setBaseWord = lastWord;
                    }
                    if (baseCompanionBuffer.length < (setSize - 1)) {
                        baseCompanionBuffer.push(nextWord);
                    } else {
                        targetBuffer.push(nextWord);
                    }
                    // When we have all words for a complete set premise, flush
                    if (targetBuffer.length >= setSize) {
                        const baseSet = [setBaseWord, ...baseCompanionBuffer];
                        const dirCoord = this.generator.pickDirection(setBaseWord, neighbors, wordCoordMap);
                        // Place base companions at baseWord's coordinate
                        for (const bc of baseCompanionBuffer) {
                            wordCoordMap[bc] = [...wordCoordMap[setBaseWord]];
                        }
                        // Place target words at offset coordinate
                        for (const w of targetBuffer) {
                            wordCoordMap[w] = addCoords(wordCoordMap[setBaseWord], dirCoord);
                        }
                        const setStatement = this.createSetDirectionStatement(baseSet, targetBuffer, dirCoord);
                        premiseChunks[premiseChunks.length - 1].push(setStatement);
                        usedDirCoords.push(dirCoord);
                        neighbors[setBaseWord] = neighbors[setBaseWord] ?? [];
                        for (const bc of baseCompanionBuffer) {
                            neighbors[setBaseWord].push(bc);
                            neighbors[bc] = neighbors[bc] ?? [];
                            neighbors[bc].push(setBaseWord);
                        }
                        for (const w of targetBuffer) {
                            neighbors[setBaseWord].push(w);
                            neighbors[w] = neighbors[w] ?? [];
                            neighbors[w].push(setBaseWord);
                            for (const bc of baseCompanionBuffer) {
                                neighbors[w].push(bc);
                                neighbors[bc].push(w);
                            }
                        }
                        lastWord = targetBuffer[targetBuffer.length - 1];
                        baseCompanionBuffer = [];
                        targetBuffer = [];
                        setBaseWord = null;
                        didCreatePremise = true;
                    }
                } else {
                    // Standard single-word premise
                    const baseWord = lastWord;
                    const dirCoord = this.generator.pickDirection(baseWord, neighbors, wordCoordMap);
                    wordCoordMap[nextWord] = addCoords(wordCoordMap[baseWord], dirCoord);
                    const premise = this.generator.createDirectionStatement(baseWord, nextWord, dirCoord);
                    premiseChunks[premiseChunks.length - 1].push(premise);
                    usedDirCoords.push(dirCoord);
                    neighbors[baseWord] = neighbors[baseWord] ?? [];
                    neighbors[baseWord].push(nextWord);
                    neighbors[nextWord] = neighbors[nextWord] ?? [];
                    neighbors[nextWord].push(baseWord);
                    lastWord = nextWord;
                    didCreatePremise = true;
                }
                if (didCreatePremise) {
                    for (const continuous of continuousTransforms) {
                        continuousHardMode.applyContinuousTransform(wordCoordMap, continuous);
                    }
                }
            }
        }

        if (premiseChunks[premiseChunks.length - 1].length === 0) {
            premiseChunks.pop();
        }

        premiseChunks = scramblePremiseChunks(premiseChunks, getScrambleFactor('overrideAnalogyScramble'));

        let merged = interleaveArrays(premiseChunks, operations);
        let premises = merged.flatMap(p => {
            if (Array.isArray(p)) {
                return p;
            } else {
                return [p];
            }
        });

        return [wordCoordMap, neighbors, premises, usedDirCoords];
    }

    createWordMap(length, branchesAllowed) {
        // When stimulus sets are enabled, we need more words per premise
        const useStimSets = savedata.enableStimulusSets && savedata.stimulusSetSize >= 2;
        const setSize = useStimSets ? savedata.stimulusSetSize : 1;
        const extraWords = useStimSets ? (length * (2 * setSize - 2)) : 0;
        const baseWords = createStimuli(length + 1 + extraWords);
        const start = baseWords[0];
        const words = baseWords.slice(1, baseWords.length);
        let wordCoordMap = {[start]: this.generator.initialCoord() };
        let neighbors = {[start]: []};

        return this.buildOntoWordMap(words, wordCoordMap, neighbors, branchesAllowed);
    }

    createWordMapAnchor(length, branchesAllowed) {
        // For Anchor Space v2, use normal words instead of [svg] tag words
        const isV2 = this.generator.getName() === 'Anchor Space v2';

        if (isV2) {
            // V2 uses shape IDs that will be mapped to actual shapes by generatePattern
            const numShapes = savedata.anchorSpaceV2ShapeCount || 4;
            const star = numShapes > 0 ? 'shape_0' : null;      // [0, 1] - North
            const circle = numShapes > 1 ? 'shape_1' : null;    // [1, 0] - East
            const triangle = numShapes > 2 ? 'shape_2' : null;  // [-1, 0] - West
            const heart = numShapes > 3 ? 'shape_3' : null;     // [0, -1] - South
            const center = numShapes > 4 ? 'shape_4' : null;     // [0, 0] - Center
            const ne = numShapes > 5 ? 'shape_5' : null;           // [1, 1] - Northeast
            const nw = numShapes > 6 ? 'shape_6' : null;           // [-1, 1] - Northwest
            const se = numShapes > 7 ? 'shape_7' : null;           // [1, -1] - Southeast

            let result;
            for (let i = 0; i < 10; i++) {
                const excludedWords = [star, circle, triangle, heart, center, ne, nw, se].filter(w => w);
                const useStimSets = savedata.enableStimulusSets && savedata.stimulusSetSize >= 2;
                const extraWords = useStimSets ? (length * (2 * savedata.stimulusSetSize - 2)) : 0;
                const words = createStimuli(length + extraWords, excludedWords);
                let wordCoordMap = {};
                if (star) wordCoordMap[star] = [0, 1];
                if (circle) wordCoordMap[circle] = [1, 0];
                if (triangle) wordCoordMap[triangle] = [-1, 0];
                if (heart) wordCoordMap[heart] = [0, -1];
                if (center) wordCoordMap[center] = [0, 0];
                if (ne) wordCoordMap[ne] = [1, 1];
                if (nw) wordCoordMap[nw] = [-1, 1];
                if (se) wordCoordMap[se] = [1, -1];

                let starters = [star, circle, triangle, heart, center, ne, nw, se].filter(w => w);
                shuffle(starters);
                const bannedFromBranching = starters.slice(1);
                let neighbors;
                const numStarters = starters.length;
                if (branchesAllowed) {
                    // Hub and spoke: first connects to all others
                    neighbors = { [starters[0]]: starters.slice(1) };
                    for (let i = 1; i < numStarters; i++) {
                        neighbors[starters[i]] = [starters[0]];
                    }
                } else {
                    // Linear chain
                    neighbors = { [starters[0]]: numStarters > 1 ? [starters[1]] : [] };
                    for (let i = 1; i < numStarters - 1; i++) {
                        neighbors[starters[i]] = [starters[i-1], starters[i+1]];
                    }
                    if (numStarters > 1) {
                        neighbors[starters[numStarters-1]] = [starters[numStarters-2]];
                    }
                }

                result = this.buildOntoWordMap(words, wordCoordMap, neighbors, branchesAllowed, bannedFromBranching, isV2, length);
                const anchorConnections = starters.map(s => neighbors[s]?.length || 0).reduce((a, b) => a + b, 0);
                const requiredConnections = branchesAllowed ? (numStarters - 1) * 2 : numStarters * 2 - 2;
                if (anchorConnections >= requiredConnections) {
                    break;
                }
            }
            const anchorWordsList = [star, circle, triangle, heart, center, ne, nw, se].filter(w => w);
            return [...result, anchorWordsList];
        }

        // Classic Anchor Space - original working code
        const star = '[svg]0[/svg]';
        const circle = '[svg]1[/svg]';
        const triangle = '[svg]2[/svg]';
        const heart = '[svg]3[/svg]';

        let result;
        for (let i = 0; i < 10; i++) {
            const excludedWords = [star, circle, triangle, heart];
            const useStimSets = savedata.enableStimulusSets && savedata.stimulusSetSize >= 2;
            const extraWords = useStimSets ? (length * (2 * savedata.stimulusSetSize - 2)) : 0;
            const words = createStimuli(length + extraWords, excludedWords);
            let wordCoordMap = {
                [star]: [0, 1],
                [circle]: [1, 0],
                [triangle]: [-1, 0],
                [heart]: [0, -1],
            };

            let starters = [star, circle, triangle, heart];
            shuffle(starters);
            const bannedFromBranching = [starters[1], starters[2], starters[3]];
            let neighbors;
            if (branchesAllowed) {
                neighbors = {
                    [starters[0]]: [starters[1], starters[2], starters[3]],
                    [starters[1]]: [starters[0]],
                    [starters[2]]: [starters[0]],
                    [starters[3]]: [starters[0]],
                };
            } else {
                neighbors = {
                    [starters[0]]: [starters[1], starters[2]],
                    [starters[1]]: [starters[0], starters[3]],
                    [starters[2]]: [starters[0]],
                    [starters[3]]: [starters[1]],
                };
            }

            result = this.buildOntoWordMap(words, wordCoordMap, neighbors, branchesAllowed, bannedFromBranching, false, length);
            const anchorConnections = starters.map(s => neighbors[s].length).reduce((a, b) => a + b, 0);
            const requiredConnections = branchesAllowed ? 8 : 6;
            if (anchorConnections >= requiredConnections) {
                break;
            }
        }
        return [...result, [star, circle, triangle, heart]];
    }

    createWordMapAnchorInterleaved(length, numInterleaved, transformState = null, branchesAllowed) {
        const isV2 = this.generator.getName() === 'Anchor Space v2';
        const isV2Pattern = savedata.anchorSpaceV2PatternMode !== false;

        // Pre-calculate evenly distributed positions for interleaved transforms
        let interleavePositions = [];
        for (let j = 0; j < numInterleaved; j++) {
            interleavePositions.push(Math.floor((j + 1) * length / (numInterleaved + 1)));
        }

        // Set up dimension pool for transforms
        const initialCoord = this.generator.initialCoord();
        let dimensionPool = repeatArrayUntil(shuffle(initialCoord.map((d, i) => i)), length * 2);
        let dimensionIndex = 0;

        let interleavedOps = [];
        let premiseChunks = [[]];
        let usedDirCoords = [];
        let nextInterleaveIdx = 0;

        // Create local transformState if not provided
        const localTransformState = transformState || (numInterleaved > 0 ? new TransformState({}, []) : null);

        if (isV2) {
            const numShapes = savedata.anchorSpaceV2ShapeCount || 4;
            const star = numShapes > 0 ? 'shape_0' : null;
            const circle = numShapes > 1 ? 'shape_1' : null;
            const triangle = numShapes > 2 ? 'shape_2' : null;
            const heart = numShapes > 3 ? 'shape_3' : null;
            const center = numShapes > 4 ? 'shape_4' : null;
            const ne = numShapes > 5 ? 'shape_5' : null;
            const nw = numShapes > 6 ? 'shape_6' : null;
            const se = numShapes > 7 ? 'shape_7' : null;

            const excludedWords = [star, circle, triangle, heart, center, ne, nw, se].filter(w => w);
            const useStimSets = savedata.enableStimulusSets && savedata.stimulusSetSize >= 2;
            const extraWords = useStimSets ? (length * (2 * savedata.stimulusSetSize - 2)) : 0;
            const words = createStimuli(length + extraWords, excludedWords);

            // Initialize wordCoordMap - use transformState's map as base if available
            let wordCoordMap;
            if (localTransformState) {
                // Use transformState's wordCoordMap as the base to maintain reference consistency
                if (star) localTransformState.wordCoordMap[star] = [0, 1];
                if (circle) localTransformState.wordCoordMap[circle] = [1, 0];
                if (triangle) localTransformState.wordCoordMap[triangle] = [-1, 0];
                if (heart) localTransformState.wordCoordMap[heart] = [0, -1];
                if (center) localTransformState.wordCoordMap[center] = [0, 0];
                if (ne) localTransformState.wordCoordMap[ne] = [1, 1];
                if (nw) localTransformState.wordCoordMap[nw] = [-1, 1];
                if (se) localTransformState.wordCoordMap[se] = [1, -1];
                wordCoordMap = localTransformState.wordCoordMap;
            } else {
                wordCoordMap = {};
                if (star) wordCoordMap[star] = [0, 1];
                if (circle) wordCoordMap[circle] = [1, 0];
                if (triangle) wordCoordMap[triangle] = [-1, 0];
                if (heart) wordCoordMap[heart] = [0, -1];
                if (center) wordCoordMap[center] = [0, 0];
                if (ne) wordCoordMap[ne] = [1, 1];
                if (nw) wordCoordMap[nw] = [-1, 1];
                if (se) wordCoordMap[se] = [1, -1];
            }

            let starters = [star, circle, triangle, heart, center, ne, nw, se].filter(w => w);
            shuffle(starters);
            const bannedFromBranching = starters.slice(1);
            let neighbors;
            const numStarters = starters.length;
            if (branchesAllowed) {
                neighbors = { [starters[0]]: starters.slice(1) };
                for (let i = 1; i < numStarters; i++) {
                    neighbors[starters[i]] = [starters[0]];
                }
            } else {
                neighbors = { [starters[0]]: numStarters > 1 ? [starters[1]] : [] };
                for (let i = 1; i < numStarters - 1; i++) {
                    neighbors[starters[i]] = [starters[i-1], starters[i+1]];
                }
                if (numStarters > 1) {
                    neighbors[starters[numStarters-1]] = [starters[numStarters-2]];
                }
            }

            const anchorWords = new Set(Object.keys(wordCoordMap));
            const usedShapes = new Set();
            const anchorWordList = [...anchorWords];

            // Build premises with interleaved transforms
            const setSize = useStimSets ? savedata.stimulusSetSize : 1;
            const wordsPerPremise = useStimSets ? (2 * setSize - 1) : 1;
            let wordIdx = 0;
            let premiseCount = 0;
            while (wordIdx + wordsPerPremise - 1 < words.length) {
                let baseWord;

                // Same logic as buildOntoWordMap for V2
                if (usedShapes.size < anchorWords.size) {
                    for (const shape of anchorWordList) {
                        if (!usedShapes.has(shape) && neighbors[shape] && neighbors[shape].length > 0) {
                            baseWord = shape;
                            break;
                        }
                    }
                }
                if (!baseWord) {
                    const availableAnchors = anchorWordList.filter(w => neighbors[w] && neighbors[w].length > 0);
                    if (availableAnchors.length > 0) {
                        baseWord = pickRandomItems(availableAnchors, 1).picked[0];
                    }
                }
                if (!baseWord) {
                    baseWord = pickBaseWord(neighbors, branchesAllowed, bannedFromBranching);
                }

                const dirCoord = this.generator.pickDirection(baseWord, neighbors, wordCoordMap);
                usedDirCoords.push(dirCoord);

                if (useStimSets) {
                    const baseCompanions = words.slice(wordIdx, wordIdx + (setSize - 1));
                    wordIdx += baseCompanions.length;
                    const targetSet = words.slice(wordIdx, wordIdx + setSize);
                    wordIdx += targetSet.length;

                    if (targetSet.length < setSize) continue;

                    const baseSet = [baseWord, ...baseCompanions];
                    for (const bc of baseCompanions) {
                        wordCoordMap[bc] = [...wordCoordMap[baseWord]];
                    }
                    for (const w of targetSet) {
                        wordCoordMap[w] = addCoords(wordCoordMap[baseWord], dirCoord);
                    }
                    const setStatement = this.createSetDirectionStatement(baseSet, targetSet, dirCoord);
                    premiseChunks[premiseChunks.length - 1].push(setStatement);
                    neighbors[baseWord] = neighbors[baseWord] ?? [];
                    for (const bc of baseCompanions) {
                        neighbors[baseWord].push(bc);
                        neighbors[bc] = neighbors[bc] ?? [];
                        neighbors[bc].push(baseWord);
                    }
                    for (const w of targetSet) {
                        neighbors[baseWord].push(w);
                        neighbors[w] = neighbors[w] ?? [];
                        neighbors[w].push(baseWord);
                        for (const bc of baseCompanions) {
                            neighbors[w].push(bc);
                            neighbors[bc].push(w);
                        }
                    }
                } else {
                    const nextWord = words[wordIdx];
                    wordIdx++;
                    wordCoordMap[nextWord] = addCoords(wordCoordMap[baseWord], dirCoord);
                    const premise = this.generator.createDirectionStatement(baseWord, nextWord, dirCoord);
                    premiseChunks[premiseChunks.length - 1].push(premise);
                    neighbors[baseWord] = neighbors[baseWord] ?? [];
                    neighbors[baseWord].push(nextWord);
                    neighbors[nextWord] = neighbors[nextWord] ?? [];
                    neighbors[nextWord].push(baseWord);
                }
                if (anchorWords.has(baseWord)) {
                    usedShapes.add(baseWord);
                }
                premiseCount++;

                // Apply interleaved transform if due
                if (nextInterleaveIdx < interleavePositions.length && premiseCount === interleavePositions[nextInterleaveIdx]) {
                    premiseChunks.push([]);
                    const nonAnchorWords = Object.keys(wordCoordMap).filter(w => !anchorWords.has(w));
                    if (nonAnchorWords.length > 0) {
                        const movingWord = pickRandomItems(nonAnchorWords, 1).picked[0];
                        const hardMode = new SpaceHardMode(1, [...anchorWords], localTransformState);
                        let [newWordMap, operation] = hardMode.oneTransform(
                            localTransformState ? localTransformState.wordCoordMap : wordCoordMap,
                            movingWord,
                            dimensionPool[dimensionIndex],
                            dimensionPool[dimensionIndex + 1]
                        );
                        dimensionIndex++;
                        wordCoordMap = newWordMap;
                        if (operation) {
                            interleavedOps.push(operation);
                        }
                    }
                    nextInterleaveIdx++;
                }
            }

            if (premiseChunks[premiseChunks.length - 1].length === 0) {
                premiseChunks.pop();
            }

            let merged = interleaveArrays(premiseChunks, interleavedOps);
            let premises = merged.flatMap(p => Array.isArray(p) ? p : [p]);

            const anchorWordsList = [star, circle, triangle, heart, center, ne, nw, se].filter(w => w);
            return [wordCoordMap, neighbors, premises, usedDirCoords, anchorWordsList];
        }

        // Classic Anchor Space v1
        const star = '[svg]0[/svg]';
        const circle = '[svg]1[/svg]';
        const triangle = '[svg]2[/svg]';
        const heart = '[svg]3[/svg]';

        const excludedWords = [star, circle, triangle, heart];
        const useStimSets = savedata.enableStimulusSets && savedata.stimulusSetSize >= 2;
        const extraWords = useStimSets ? (length * (2 * savedata.stimulusSetSize - 2)) : 0;
        const words = createStimuli(length + extraWords, excludedWords);

        // Initialize wordCoordMap - use transformState's map as base if available
        let wordCoordMap;
        if (localTransformState) {
            // Use transformState's wordCoordMap as the base to maintain reference consistency
            localTransformState.wordCoordMap[star] = [0, 1];
            localTransformState.wordCoordMap[circle] = [1, 0];
            localTransformState.wordCoordMap[triangle] = [-1, 0];
            localTransformState.wordCoordMap[heart] = [0, -1];
            wordCoordMap = localTransformState.wordCoordMap;
        } else {
            wordCoordMap = {
                [star]: [0, 1],
                [circle]: [1, 0],
                [triangle]: [-1, 0],
                [heart]: [0, -1],
            };
        }

        let starters = [star, circle, triangle, heart];
        shuffle(starters);
        const bannedFromBranching = [starters[1], starters[2], starters[3]];
        let neighbors;
        if (branchesAllowed) {
            neighbors = {
                [starters[0]]: [starters[1], starters[2], starters[3]],
                [starters[1]]: [starters[0]],
                [starters[2]]: [starters[0]],
                [starters[3]]: [starters[0]],
            };
        } else {
            neighbors = {
                [starters[0]]: [starters[1], starters[2]],
                [starters[1]]: [starters[0], starters[3]],
                [starters[2]]: [starters[0]],
                [starters[3]]: [starters[1]],
            };
        }

        const anchorWords = new Set([star, circle, triangle, heart]);

        // Build premises with interleaved transforms
        const setSize = useStimSets ? savedata.stimulusSetSize : 1;
        const wordsPerPremise = useStimSets ? (2 * setSize - 1) : 1;
        let wordIdx = 0;
        let premiseCount = 0;
        while (wordIdx + wordsPerPremise - 1 < words.length) {
            const baseWord = pickBaseWord(neighbors, branchesAllowed, bannedFromBranching);

            const dirCoord = this.generator.pickDirection(baseWord, neighbors, wordCoordMap);
            usedDirCoords.push(dirCoord);

            if (useStimSets) {
                const baseCompanions = words.slice(wordIdx, wordIdx + (setSize - 1));
                wordIdx += baseCompanions.length;
                const targetSet = words.slice(wordIdx, wordIdx + setSize);
                wordIdx += targetSet.length;

                if (targetSet.length < setSize) continue;

                const baseSet = [baseWord, ...baseCompanions];
                for (const bc of baseCompanions) {
                    wordCoordMap[bc] = [...wordCoordMap[baseWord]];
                }
                for (const w of targetSet) {
                    wordCoordMap[w] = addCoords(wordCoordMap[baseWord], dirCoord);
                }
                const setStatement = this.createSetDirectionStatement(baseSet, targetSet, dirCoord);
                premiseChunks[premiseChunks.length - 1].push(setStatement);
                neighbors[baseWord] = neighbors[baseWord] ?? [];
                for (const bc of baseCompanions) {
                    neighbors[baseWord].push(bc);
                    neighbors[bc] = neighbors[bc] ?? [];
                    neighbors[bc].push(baseWord);
                }
                for (const w of targetSet) {
                    neighbors[baseWord].push(w);
                    neighbors[w] = neighbors[w] ?? [];
                    neighbors[w].push(baseWord);
                    for (const bc of baseCompanions) {
                        neighbors[w].push(bc);
                        neighbors[bc].push(w);
                    }
                }
            } else {
                const nextWord = words[wordIdx];
                wordIdx++;
                wordCoordMap[nextWord] = addCoords(wordCoordMap[baseWord], dirCoord);
                const premise = this.generator.createDirectionStatement(baseWord, nextWord, dirCoord);
                premiseChunks[premiseChunks.length - 1].push(premise);
                neighbors[baseWord] = neighbors[baseWord] ?? [];
                neighbors[baseWord].push(nextWord);
                neighbors[nextWord] = neighbors[nextWord] ?? [];
                neighbors[nextWord].push(baseWord);
            }

            premiseCount++;

            // Apply interleaved transform if due
            if (nextInterleaveIdx < interleavePositions.length && premiseCount === interleavePositions[nextInterleaveIdx]) {
                premiseChunks.push([]);
                const nonAnchorWords = Object.keys(wordCoordMap).filter(w => !anchorWords.has(w));
                if (nonAnchorWords.length > 0) {
                    const movingWord = pickRandomItems(nonAnchorWords, 1).picked[0];
                    const hardMode = new SpaceHardMode(1, [...anchorWords], localTransformState);
                    let [newWordMap, operation] = hardMode.oneTransform(
                        localTransformState ? localTransformState.wordCoordMap : wordCoordMap,
                        movingWord,
                        dimensionPool[dimensionIndex],
                        dimensionPool[dimensionIndex + 1]
                    );
                    dimensionIndex++;
                    wordCoordMap = newWordMap;
                    if (operation) {
                        interleavedOps.push(operation);
                    }
                }
                nextInterleaveIdx++;
            }
        }

        if (premiseChunks[premiseChunks.length - 1].length === 0) {
            premiseChunks.pop();
        }

        let merged = interleaveArrays(premiseChunks, interleavedOps);
        let premises = merged.flatMap(p => Array.isArray(p) ? p : [p]);

        return [wordCoordMap, neighbors, premises, usedDirCoords, [star, circle, triangle, heart]];
    }

    _hasValidDistantPairs(neighbors) {
        const words = Object.keys(neighbors);
        if (words.length < 2) return false;

        // Check if any pair has distance > 1
        for (let i = 0; i < words.length; i++) {
            for (let j = i + 1; j < words.length; j++) {
                const dist = this._distanceBetween(words[i], words[j], neighbors);
                if (dist > 1) return true;
            }
        }
        return false;
    }

    _distanceBetween(start, end, neighbors) {
        let distance = 0;
        let layer = [start];
        let found = {[start]: true};
        while (layer.length > 0) {
            distance++;
            let newLayer = [];
            for (const node of layer) {
                for (const neighbor of (neighbors[node] || [])) {
                    if (found[neighbor]) continue;
                    if (neighbor === end) return distance;
                    newLayer.push(neighbor);
                    found[neighbor] = true;
                }
            }
            layer = newLayer;
        }
        return distance;
    }

    _findPairWithNonAnchor(neighbors, anchorWords, nonAnchorWords) {
        // Find a valid pair where at least one word is a non-anchor
        // Prefer pairs with one anchor and one non-anchor for maximum variety
        const allWords = Object.keys(neighbors);
        let validPairs = [];
        
        for (const word1 of allWords) {
            for (const word2 of allWords) {
                if (word1 === word2) continue;
                const isWord1Anchor = anchorWords.includes(word1);
                const isWord2Anchor = anchorWords.includes(word2);
                
                // We want at least one non-anchor
                if (!isWord1Anchor || !isWord2Anchor) {
                    const dist = this._distanceBetween(word1, word2, neighbors);
                    if (dist > 1) {
                        validPairs.push([word1, word2, dist]);
                    }
                }
            }
        }
        
        if (validPairs.length === 0) return null;
        
        // Sort by distance (prefer distant pairs like the regular chooser)
        validPairs.sort((a, b) => b[2] - a[2]);
        
        // Return the pair with maximum distance
        return [validPairs[0][0], validPairs[0][1]];
    }

    buildOntoWordMap(words, wordCoordMap, neighbors, branchesAllowed, bannedFromBranching=[], isAnchorSpaceV2=false, numPremisesNeeded=0) {
        let premiseMap = {};
        let usedDirCoords = [];

        // Continuous transforms: create after first premise when enough words exist
        let continuousTransforms = [];
        let transformState = null;
        let continuousHardMode = null;
        let continuousCreated = false;
        if (savedata.enableTransformContinuous && this.generator.hardModeAllowed() && this.generator.hardModeLevel() > 0) {
            transformState = new TransformState(wordCoordMap, []);
            continuousHardMode = new SpaceHardMode(1, [], transformState);
        }

        // Get the set of anchor words (shapes) - these are the words already in wordCoordMap
        const anchorWords = new Set(Object.keys(wordCoordMap));
        const wordsInPremises = new Set(anchorWords);

        // Track which shapes have been used in premises - ensure all shapes get used
        const usedShapes = new Set();
        const anchorWordList = [...anchorWords];
        let shapeIndex = 0;

        // Stimulus sets: group words into sets of stimulusSetSize
        const useStimSets = savedata.enableStimulusSets && savedata.stimulusSetSize >= 2;
        const setSize = useStimSets ? savedata.stimulusSetSize : 1;
        // Each set premise needs (setSize-1) base companions + setSize targets = 2*setSize-1 words
        const wordsPerPremise = useStimSets ? (2 * setSize - 1) : 1;

        // For each new word (or set of words), connect it to the graph
        let wordIndex = 0;
        while (wordIndex + wordsPerPremise - 1 < words.length) {
            // Pick the next word or group of words for this premise
            let baseWord;
            if (isAnchorSpaceV2) {
                // For V2, cycle through shapes to ensure all appear in premises
                // First ensure each shape is used at least once
                if (usedShapes.size < anchorWords.size) {
                    // Find a shape that hasn't been used yet
                    for (const shape of anchorWordList) {
                        if (!usedShapes.has(shape) && neighbors[shape] && neighbors[shape].length > 0) {
                            baseWord = shape;
                            break;
                        }
                    }
                }
                // If all shapes used or no unused shape available, pick randomly from available shapes
                if (!baseWord) {
                    const availableAnchors = anchorWordList.filter(w => neighbors[w] && neighbors[w].length > 0);
                    if (availableAnchors.length > 0) {
                        baseWord = pickRandomItems(availableAnchors, 1).picked[0];
                    }
                }
                // Fallback to standard selection if no anchor available
                if (!baseWord) {
                    baseWord = pickBaseWord(neighbors, branchesAllowed, bannedFromBranching);
                }
            } else {
                baseWord = pickBaseWord(neighbors, branchesAllowed, bannedFromBranching);
            }
            const dirCoord = this.generator.pickDirection(baseWord, neighbors, wordCoordMap);

            if (useStimSets) {
                // Base companions: setSize-1 new words placed at baseWord's coordinate
                const baseCompanions = words.slice(wordIndex, wordIndex + (setSize - 1));
                wordIndex += baseCompanions.length;
                // Target set: setSize new words placed at offset coordinate
                const targetSet = words.slice(wordIndex, wordIndex + setSize);
                wordIndex += targetSet.length;

                if (targetSet.length < setSize) continue; // Skip partial sets

                const baseSet = [baseWord, ...baseCompanions];
                // Place base companions at baseWord's coordinate
                for (const bc of baseCompanions) {
                    wordCoordMap[bc] = [...wordCoordMap[baseWord]];
                }
                // Place target words at offset coordinate
                for (const w of targetSet) {
                    wordCoordMap[w] = addCoords(wordCoordMap[baseWord], dirCoord);
                }
                // Create a set premise with both sides having setSize words
                const setStatement = this.createSetDirectionStatement(baseSet, targetSet, dirCoord);
                // Store under each word pair key so orderPremises can find the premise
                for (const b of baseSet) {
                    for (const t of targetSet) {
                        premiseMap[premiseKey(b, t)] = setStatement;
                    }
                }
                usedDirCoords.push(dirCoord);
                // Update neighbors
                neighbors[baseWord] = neighbors[baseWord] ?? [];
                // Connect base companions to baseWord
                for (const bc of baseCompanions) {
                    neighbors[baseWord].push(bc);
                    neighbors[bc] = neighbors[bc] ?? [];
                    neighbors[bc].push(baseWord);
                    wordsInPremises.add(bc);
                }
                // Connect targets to baseWord and base companions
                for (const w of targetSet) {
                    neighbors[baseWord].push(w);
                    neighbors[w] = neighbors[w] ?? [];
                    neighbors[w].push(baseWord);
                    for (const bc of baseCompanions) {
                        neighbors[w].push(bc);
                        neighbors[bc].push(w);
                    }
                    wordsInPremises.add(w);
                }
                wordsInPremises.add(baseWord);
                if (anchorWords.has(baseWord)) {
                    usedShapes.add(baseWord);
                }
                // Apply continuous transforms after each set premise
                if (continuousHardMode) {
                    if (!continuousCreated && Object.keys(wordCoordMap).length >= 2) {
                        const initialCoord = this.generator.initialCoord();
                        const preferredDim = Math.floor(Math.random() * initialCoord.length);
                        const continuous = continuousHardMode.createContinuousTransform(wordCoordMap, preferredDim);
                        if (continuous) {
                            continuousTransforms.push(continuous);
                        }
                        continuousCreated = true;
                    }
                    for (const continuous of continuousTransforms) {
                        continuousHardMode.applyContinuousTransform(wordCoordMap, continuous);
                    }
                }
            } else {
                // Standard single-word premise
                const nextWord = words[wordIndex];
                wordIndex++;
                wordCoordMap[nextWord] = addCoords(wordCoordMap[baseWord], dirCoord);
                premiseMap[premiseKey(baseWord, nextWord)] = this.generator.createDirectionStatement(baseWord, nextWord, dirCoord);
                usedDirCoords.push(dirCoord);
                neighbors[baseWord] = neighbors[baseWord] ?? [];
                neighbors[baseWord].push(nextWord);
                neighbors[nextWord] = neighbors[nextWord] ?? [];
                neighbors[nextWord].push(baseWord);
                wordsInPremises.add(baseWord);
                wordsInPremises.add(nextWord);
                if (anchorWords.has(baseWord)) {
                    usedShapes.add(baseWord);
                }
                // Apply continuous transforms after each premise
                if (continuousHardMode) {
                    if (!continuousCreated && Object.keys(wordCoordMap).length >= 2) {
                        const initialCoord = this.generator.initialCoord();
                        const preferredDim = Math.floor(Math.random() * initialCoord.length);
                        const continuous = continuousHardMode.createContinuousTransform(wordCoordMap, preferredDim);
                        if (continuous) {
                            continuousTransforms.push(continuous);
                        }
                        continuousCreated = true;
                    }
                    for (const continuous of continuousTransforms) {
                        continuousHardMode.applyContinuousTransform(wordCoordMap, continuous);
                    }
                }
            }
        }

        let premises = orderPremises(premiseMap, neighbors);
        if (savedata.widePremises) {
            premises = createWidePremises(premises, premiseMap);
        }

        // Collect continuous transform operation strings
        const continuousOps = continuousTransforms.map(ct => ct.operation).filter(Boolean);

        return [wordCoordMap, neighbors, premises, usedDirCoords, continuousOps];
    }
}

function createDirectionGenerator(length) {
    return {
        question: new DirectionQuestion(new Direction2D()),
        premiseCount: getPremisesFor('overrideDirectionPremises', length),
        weight: savedata.overrideDirectionWeight,
    };
}

function createDirection3DGenerator(length) {
    return {
        question: new DirectionQuestion(new Direction3D()),
        premiseCount: getPremisesFor('overrideDirection3DPremises', length),
        weight: savedata.overrideDirection3DWeight,
    };
}

function createDirection4DGenerator(length) {
    return {
        question: new DirectionQuestion(new Direction4D()),
        premiseCount: getPremisesFor('overrideDirection4DPremises', length),
        weight: savedata.overrideDirection4DWeight,
    };
}

function createAnchorSpaceGenerator(length) {
    return {
        question: new DirectionQuestion(new Direction2D(true, true)),
        premiseCount: getPremisesFor('overrideAnchorSpacePremises', length),
        weight: savedata.overrideAnchorSpaceWeight,
    };
}

class AnchorSpaceV2 {
    constructor() {
        this.patternKey = 'anchorSpaceV2Pattern_v1';
        // More distinct colors using HSL - evenly spaced around hue wheel
        // Red(0), Yellow(60), Green(120), Cyan(180), Blue(240), Magenta(300), Orange(30), Chartreuse(90)
        this.distinctColors = [
            { name: 'Red', fill: 'hsl(0, 70%, 50%)', stroke: 'hsl(0, 70%, 35%)' },
            { name: 'Yellow', fill: 'hsl(60, 70%, 50%)', stroke: 'hsl(60, 70%, 35%)' },
            { name: 'Green', fill: 'hsl(120, 70%, 50%)', stroke: 'hsl(120, 70%, 35%)' },
            { name: 'Cyan', fill: 'hsl(180, 70%, 50%)', stroke: 'hsl(180, 70%, 35%)' },
            { name: 'Blue', fill: 'hsl(240, 70%, 60%)', stroke: 'hsl(240, 70%, 45%)' },
            { name: 'Magenta', fill: 'hsl(300, 70%, 50%)', stroke: 'hsl(300, 70%, 35%)' },
            { name: 'Orange', fill: 'hsl(30, 70%, 50%)', stroke: 'hsl(30, 70%, 35%)' },
            { name: 'Pink', fill: 'hsl(330, 70%, 60%)', stroke: 'hsl(330, 70%, 45%)' }
        ];
        // Legacy fallback colors for compatibility
        this.shapeColors = this.distinctColors;
    }

    // Get stored pattern or generate new one
    getPattern(wordCoordMap, anchorWords) {
        // If fixed positions enabled, try to load existing pattern
        if (savedata.anchorSpaceFixedPositions) {
            const saved = localStorage.getItem(this.patternKey);
            if (saved) {
                let pattern;
                try {
                    pattern = JSON.parse(saved);
                } catch (error) {
                    localStorage.removeItem(this.patternKey);
                    pattern = null;
                }
                if (!pattern || typeof pattern !== 'object') {
                    localStorage.removeItem(this.patternKey);
                } else {
                // Update coordinates in case wordCoordMap changed
                const updatedPattern = {};
                for (const shapeId in pattern) {
                    if (wordCoordMap[shapeId]) {
                        updatedPattern[shapeId] = {
                            ...pattern[shapeId],
                            coord: wordCoordMap[shapeId]
                        };
                    }
                }
                return updatedPattern;
                }
            }
        }

        // Generate new pattern
        const pattern = this.generatePattern(wordCoordMap, anchorWords);

        // Save if fixed positions enabled
        if (savedata.anchorSpaceFixedPositions) {
            localStorage.setItem(this.patternKey, JSON.stringify(pattern));
        }

        return pattern;
    }

    // Reset stored pattern (call when disabling fixed positions)
    resetPattern() {
        localStorage.removeItem(this.patternKey);
    }

    getShapeSVG(index, x, y, size) {
        const color = this.distinctColors[index % this.distinctColors.length];
        const shapes = [
            // Circle
            `<circle cx="${x}" cy="${y}" r="${size/2}" fill="${color.fill}" stroke="${color.stroke}" stroke-width="2"/>`,
            // Square
            `<rect x="${x-size/2}" y="${y-size/2}" width="${size}" height="${size}" fill="${color.fill}" stroke="${color.stroke}" stroke-width="2"/>`,
            // Triangle
            `<polygon points="${x},${y-size/2} ${x+size/2},${y+size/2} ${x-size/2},${y+size/2}" fill="${color.fill}" stroke="${color.stroke}" stroke-width="2"/>`,
            // Diamond
            `<polygon points="${x},${y-size/2} ${x+size/2},${y} ${x},${y+size/2} ${x-size/2},${y}" fill="${color.fill}" stroke="${color.stroke}" stroke-width="2"/>`,
            // Hexagon
            `<polygon points="${x-size/3},${y-size/2} ${x+size/3},${y-size/2} ${x+size/2},${y} ${x+size/3},${y+size/2} ${x-size/3},${y+size/2} ${x-size/2},${y}" fill="${color.fill}" stroke="${color.stroke}" stroke-width="2"/>`,
            // Star
            `<polygon points="${x},${y-size/2} ${x+size/6},${y-size/6} ${x+size/2},${y-size/6} ${x+size/4},${y+size/8} ${x+size/3},${y+size/2} ${x},${y+size/4} ${x-size/3},${y+size/2} ${x-size/4},${y+size/8} ${x-size/2},${y-size/6} ${x-size/6},${y-size/6}" fill="${color.fill}" stroke="${color.stroke}" stroke-width="2"/>`
        ];
        return shapes[index % shapes.length];
    }

    generatePattern(wordCoordMap, anchorWords) {
        // Get all shape IDs from wordCoordMap (keys starting with 'shape_')
        const allKeys = Object.keys(wordCoordMap);
        const shapeIds = anchorWords?.filter(id => id.startsWith('shape_')) ||
                        allKeys.filter(k => k.startsWith('shape_'));
        const numShapes = shapeIds.length;
        const shapeNames = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star'];

        // Shuffle colors and shapes for random assignment
        const shuffledColors = shuffle([...this.distinctColors]);
        const shuffledShapes = shuffle([...shapeNames]);

        // Assign colors and shapes to ALL shape IDs
        const pattern = {};
        for (let i = 0; i < numShapes; i++) {
            const shapeId = shapeIds[i];
            const color = shuffledColors[i % shuffledColors.length];
            const shape = shuffledShapes[i % shuffledShapes.length];
            pattern[shapeId] = { color, shape, coord: wordCoordMap[shapeId] };
        }

        return pattern;
    }

    getName() {
        return "Anchor Space v2";
    }

    hardModeAllowed() {
        return savedata.anchorSpaceV2HardModeLevel > 0;
    }

    hardModeLevel() {
        return savedata.anchorSpaceV2HardModeLevel;
    }

    getCountdown() {
        return savedata.overrideAnchorSpaceV2Time;
    }

    shouldUseAnchor() {
        return true;
    }

    initialCoord() {
        return [0, 0];
    }

    pickDirection(baseWord, neighbors, wordCoordMap) {
        return pickWeightedRandomDirection(get2DDirCoords(), baseWord, neighbors, wordCoordMap);
    }

    createDirectionStatement(a, b, dirCoord) {
        const direction = dirStringFromCoord(dirCoord);
        const reverseDirection = dirStringFromCoord(inverse(dirCoord));
        return {
            start: b,
            end: a,
            relation: `is ${direction} of`,
            reverse: `is ${reverseDirection} of`,
            relationMinimal: dirStringMinimal(dirCoord),
            reverseMinimal: dirStringMinimal(inverse(dirCoord)),
        };
    }
}

function createAnchorSpaceV2Generator(length) {
    return {
        question: new DirectionQuestion(new AnchorSpaceV2()),
        premiseCount: getPremisesFor('overrideAnchorSpaceV2Premises', length),
        weight: savedata.overrideAnchorSpaceV2Weight,
    };
}
