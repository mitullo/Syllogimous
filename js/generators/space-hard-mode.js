class TransformState {
    constructor(wordCoordMap = {}, anchorWords = []) {
        this.wordCoordMap = structuredClone(wordCoordMap);
        this.anchorWords = anchorWords;
        this.transformedWords = new Set();
        this.usedDimensions = new Set();
        this.operations = [];
        this.extraDimensions = [];
    }

    markTransformed(word) {
        if (!this.anchorWords.includes(word)) {
            this.transformedWords.add(word);
        }
    }

    markDimensionUsed(dim) {
        this.usedDimensions.add(dim);
    }

    getEligiblePool() {
        // Pool is for REFERENCE points (axisWord / 'a' in chains), not moving words.
        // All words including anchors and previously transformed words can be reference points.
        // Anchors are protected from being MOVING words via isAnchorWord() check in applyChain.
        return Object.keys(this.wordCoordMap);
    }

    updateWordCoordMap(newMap) {
        this.wordCoordMap = structuredClone(newMap);
    }
}

class SpaceHardMode {
    constructor(numTransforms, anchorWords = [], transformState = null) {
        this.numTransforms = numTransforms;
        this.anchorWords = anchorWords;
        this.transformState = transformState;
    }

    isAnchorWord(word) {
        return savedata.anchorSpaceFixedPositions && this.anchorWords.includes(word);
    }

    basicHardMode(wordCoordMap, startWord, endWord, originalConclusionCoord) {
        // Use transformState's wordCoordMap as base if available (for coordinated transforms)
        const baseWordMap = this.transformState ? this.transformState.wordCoordMap : wordCoordMap;
        
        // Pre-flight check for transform feasibility
        // Use transformState pool if available for coordination
        let eligiblePool;
        if (this.transformState) {
            eligiblePool = this.transformState.getEligiblePool().filter(w => w !== startWord && w !== endWord);
        }
        
        // Fallback: local calculation
        if (!eligiblePool || eligiblePool.length === 0) {
            const bannedFromPool = new Set([startWord, endWord]);
            eligiblePool = Object.keys(baseWordMap).filter(w => !bannedFromPool.has(w));
        }

        // SAFEGUARD: If pool is too small but we MUST transform, relax start/end ban
        if (this.numTransforms > 0 && eligiblePool.length < this.numTransforms) {
            console.warn(`Anchor Space: Pool too small (${eligiblePool.length} < ${this.numTransforms}). Relaxing start/end restrictions.`);
            if (this.transformState) {
                eligiblePool = this.transformState.getEligiblePool();
            } else {
                eligiblePool = Object.keys(baseWordMap);
            }

            // If pool is empty, fail out safely
            if (eligiblePool.length === 0) {
                console.error(`Anchor Space: No words available for transforms.`);
                return [baseWordMap, this.transformState ? this.transformState.operations : [], []];
            }
        }

        let newWordMap;
        let newDiffCoord;
        let newConclusionCoord;
        let operations;
        let usedDimensions;
        // Store the resolved eligible pool for createChains to use
        this.resolvedEligiblePool = eligiblePool;

        // Small pool: skip demandChange/demandClose - transforms likely won't shift conclusion
        const isSmallPool = eligiblePool.length <= 2;
        const demandClose = isSmallPool ? false : Math.random() > 0.4;
        const demandChange = isSmallPool ? false : Math.random() > 0.2;
        let closeTries = 10;
        let changeTries = 10;
        
        // Build base dimensions from transformState if available
        let baseDimensions = [];
        if (this.transformState) {
            baseDimensions = Array.from(this.transformState.usedDimensions);
        }
        
        for (let i = 0; i < 10000; i++) {
            // When using transformState, mutate directly to maintain reference sync
            if (this.transformState) {
                newWordMap = baseWordMap; // Use same reference for coordination
            } else {
                newWordMap = structuredClone(baseWordMap);
            }
            [operations, usedDimensions] = this.applyHardMode(newWordMap, startWord, endWord, baseDimensions);
            [newDiffCoord, newConclusionCoord] = getConclusionCoords(newWordMap, startWord, endWord);
            if (newConclusionCoord === null || newConclusionCoord.every(c => c === 0)) {
                continue;
            }
            const distance = newDiffCoord.map(Math.abs).reduce((a, b) => a + b);
            const distanceLimit = Math.max(3, Math.floor(Object.keys(newWordMap).length / 2));
            const isClose = distance < distanceLimit;
            if (demandClose && !isClose && closeTries > 0) {
                closeTries--;
                continue;
            }
            const isChanged = !arraysEqual(originalConclusionCoord, newConclusionCoord);
            if (demandChange && !isChanged && changeTries > 0) {
                changeTries--;
                continue;
            }
            break;
        }
        // Post-loop validation: if conclusion is still invalid after exhaustion, return original
        if (newConclusionCoord === null || newConclusionCoord.every(c => c === 0)) {
            console.warn('SpaceHardMode: Failed to find valid transform after 10000 iterations');
            // When using transformState, baseWordMap is already mutated, so return it directly
            return [baseWordMap, this.transformState ? this.transformState.operations : [], []];
        }
        
        // Update transformState with results if available
        if (this.transformState) {
            // No need to update wordCoordMap reference since we mutated directly
            this.transformState.operations.push(...operations);
            usedDimensions.forEach(d => this.transformState.markDimensionUsed(d));
        }
        
        return [newWordMap, operations, usedDimensions];
    }

    oneTransform(wordCoordMap, movingWord, dimension, backupDimension) {
        const demandChange = Math.random() < 0.92;
        let changeTries = 8;
        let backupTries = 8;
        let useBackup = false;

        let operation;
        let newWordMap;
        
        // Use transformState for coordinated pool if available, otherwise fallback
        let pool;
        if (this.transformState) {
            pool = this.transformState.getEligiblePool().filter(w => w !== movingWord);
        }
        
        // Fallback: local pool calculation
        if (!pool || pool.length === 0) {
            const bannedFromPool = new Set([movingWord]);
            pool = Object.keys(wordCoordMap).filter(w => !bannedFromPool.has(w));
            if (pool.length === 0) {
                pool = Object.keys(wordCoordMap).filter(w => w !== movingWord);
            }
        }
        
        let originalCoord = wordCoordMap[movingWord];
        for (let i = 0; i < 100; i++) {
            // When using transformState, mutate directly to maintain reference sync
            // Otherwise clone to avoid side effects
            if (this.transformState) {
                newWordMap = wordCoordMap; // Use same reference for coordination
            } else {
                newWordMap = structuredClone(wordCoordMap);
            }
            
            let axisWord = pickRandomItems(pool, 1).picked[0];
            
            // Safety check: ensure both words exist in the map
            if (!newWordMap[axisWord] || !newWordMap[movingWord]) {
                console.warn('oneTransform: word not in map, retrying', { axisWord, movingWord, hasAxis: !!newWordMap[axisWord], hasMoving: !!newWordMap[movingWord] });
                continue;
            }
            
            // Build dimensionsUsed from transformState if available
            let dimensionsUsed = [];
            if (this.transformState) {
                dimensionsUsed = Array.from(this.transformState.usedDimensions);
            }
            
            const chainResult = this.applyChain(newWordMap, dimensionsUsed, [[[axisWord, movingWord], useBackup ? backupDimension : dimension]]);
            operation = chainResult.ops[0] || null;
            
            // Update transformState if available (wordCoordMap is already mutated if using transformState)
            if (this.transformState && operation) {
                this.transformState.markTransformed(movingWord);
                this.transformState.markDimensionUsed(useBackup ? backupDimension : dimension);
                this.transformState.operations.push(operation);
                if (chainResult.extraDimensions) {
                    chainResult.extraDimensions.forEach(d => this.transformState.markDimensionUsed(d));
                }
                // No need to update wordCoordMap reference since we mutated directly
            }
            
            let newCoord = newWordMap[movingWord];
            if (demandChange && changeTries > 0 && arraysEqual(originalCoord, newCoord)) {
                changeTries--;
                if (changeTries === 0) {
                    useBackup = true;
                }
                continue;
            }

            if (demandChange && useBackup && backupTries > 0 && arraysEqual(originalCoord, newCoord)) {
                backupTries--;
                continue;
            }
            break;
        }

        return [newWordMap, operation];
    }

    createContinuousTransform(wordCoordMap, preferredDimension = 0) {
        const words = Object.keys(wordCoordMap);
        if (words.length < 2) {
            return null;
        }

        const [axisWord, movingWord] = pickRandomItems(words, 2).picked;
        const coordLength = wordCoordMap[movingWord].length;
        const dimensions = Array.from({ length: Math.min(coordLength, 4) }, (_, i) => i);
        const canRotate = savedata.enableTransformRotate && dimensions.length >= 2;
        const canOscillate = savedata.enableTransformMirror;
        if (!canRotate && !canOscillate) {
            return null;
        }

        if (canRotate && (!canOscillate || coinFlip())) {
            let plane = pickRandomItems(dimensions, 2).picked;
            plane.sort();
            const clockwise = coinFlip();
            const planeName = dimensionNames[plane[0]] + dimensionNames[plane[1]];
            return {
                type: 'rotate',
                axisWord,
                movingWord,
                plane,
                clockwise,
                operation: createContinuousRotationTemplate(axisWord, movingWord, planeName, clockwise),
            };
        }

        const dimension = dimensions.includes(preferredDimension) ? preferredDimension : pickRandomItems(dimensions, 1).picked[0];
        const originalCoord = wordCoordMap[movingWord].slice();
        const alternateCoord = wordCoordMap[movingWord].slice();
        const diff = wordCoordMap[movingWord][dimension] - wordCoordMap[axisWord][dimension];
        alternateCoord[dimension] = wordCoordMap[axisWord][dimension] - diff;
        return {
            type: 'oscillate',
            axisWord,
            movingWord,
            dimension,
            originalCoord,
            alternateCoord,
            step: 0,
            operation: createOscillationTemplate(axisWord, movingWord, dimensionNames[dimension]),
        };
    }

    applyContinuousTransform(wordCoordMap, transform) {
        if (!transform || !wordCoordMap[transform.axisWord] || !wordCoordMap[transform.movingWord]) {
            return wordCoordMap;
        }

        if (transform.type === 'rotate') {
            const [m, n] = transform.plane;
            const axisCoord = wordCoordMap[transform.axisWord];
            const movingCoord = wordCoordMap[transform.movingWord];
            const newCoord = movingCoord.slice();
            const diffM = movingCoord[m] - axisCoord[m];
            const diffN = movingCoord[n] - axisCoord[n];
            if (transform.clockwise) {
                newCoord[m] = axisCoord[m] + diffN;
                newCoord[n] = axisCoord[n] - diffM;
            } else {
                newCoord[m] = axisCoord[m] - diffN;
                newCoord[n] = axisCoord[n] + diffM;
            }
            wordCoordMap[transform.movingWord] = newCoord;
        } else if (transform.type === 'oscillate') {
            transform.step++;
            if (transform.step % 2 === 0) {
                const currentlyAlternate = arraysEqual(wordCoordMap[transform.movingWord], transform.alternateCoord);
                wordCoordMap[transform.movingWord] = (currentlyAlternate ? transform.originalCoord : transform.alternateCoord).slice();
            }
        }

        return wordCoordMap;
    }

    applyHardMode(wordCoordMap, leftStart, rightStart, existingDimensions = []) {
        const [leftChains, rightChains] = this.createChains(wordCoordMap, leftStart, rightStart);
        // Use existingDimensions as base if provided (for coordinated transforms), otherwise build from chains
        const baseDimensions = existingDimensions.length > 0 
            ? existingDimensions 
            : [...leftChains.map(([words, dimension]) => dimension), ...rightChains.map(([words, dimension]) => dimension)];
        // Pass copies to each applyChain to prevent mutation cross-contamination
        const leftOperations = this.applyChain(wordCoordMap, [...baseDimensions], leftChains);
        const rightOperations = this.applyChain(wordCoordMap, [...baseDimensions], rightChains);
        // Merge dimensions from both sides (rotation may add new planes)
        const allDimensions = [...new Set([...baseDimensions, ...leftOperations.extraDimensions || [], ...rightOperations.extraDimensions || []])];
        return [[...leftOperations.ops, ...rightOperations.ops], allDimensions];
    }

    createChains(wordCoordMap, leftStart, rightStart) {
        let leftChains = [];
        let rightChains = [];
        let leftDimensions = [];
        let rightDimensions = [];

        // Use the pre-resolved eligible pool from basicHardMode if available
        // This ensures the safeguard fallback (relaxing start/end ban) is respected
        let pool;
        if (this.resolvedEligiblePool && this.resolvedEligiblePool.length > 0) {
            pool = this.resolvedEligiblePool;
        } else {
            // Fallback: recalculate (shouldn't happen in normal flow)
            const bannedFromPool = new Set([leftStart, rightStart]);
            pool = Object.keys(wordCoordMap).filter(word => !bannedFromPool.has(word));
        }

        // Store eligible pool for applyChain to use as replacement source
        this.eligiblePool = pool;
        const dimensionPool = wordCoordMap[leftStart].map((c, i) => i);

        // Guard: return empty chains if no eligible words
        if (pool.length === 0) {
            return [[], []];
        }

        // FAIR DISTRIBUTION: Ensure transforms are spread evenly across available words
        // Split pool into anchors and non-anchors for better variety
        let anchorPool = shuffle(pool.filter(w => this.anchorWords.includes(w)));
        let nonAnchorPool = shuffle(pool.filter(w => !this.anchorWords.includes(w)));
        
        // Build sequence with fair round-robin distribution
        let wordSequence = [];
        let lastPicked = null;
        let anchorIdx = 0;
        let nonAnchorIdx = 0;
        
        for (let i = 0; i < this.numTransforms; i++) {
            let picked = null;
            
            // Alternate between anchor and non-anchor pools (50/50 when both available)
            if (anchorPool.length > 0 && nonAnchorPool.length > 0) {
                // Decide which pool to use this round
                const useAnchor = (i % 2 === 0) ? 
                    anchorPool.length >= nonAnchorPool.length : 
                    anchorPool.length < nonAnchorPool.length;
                
                if (useAnchor) {
                    // Cycle through anchors fairly
                    picked = anchorPool[anchorIdx % anchorPool.length];
                    anchorIdx++;
                } else {
                    // Cycle through non-anchors fairly
                    picked = nonAnchorPool[nonAnchorIdx % nonAnchorPool.length];
                    nonAnchorIdx++;
                }
            } else if (anchorPool.length > 0) {
                // Only anchors - cycle through them
                picked = anchorPool[anchorIdx % anchorPool.length];
                anchorIdx++;
            } else if (nonAnchorPool.length > 0) {
                // Only non-anchors - cycle through them fairly
                picked = nonAnchorPool[nonAnchorIdx % nonAnchorPool.length];
                nonAnchorIdx++;
            }
            
            // Avoid consecutive same word if possible
            if (picked === lastPicked && i > 0) {
                // Try to pick a different word from the same pool
                if (anchorPool.length > 1 && this.anchorWords.includes(picked)) {
                    picked = anchorPool[(anchorIdx + 1) % anchorPool.length];
                } else if (nonAnchorPool.length > 1 && !this.anchorWords.includes(picked)) {
                    picked = nonAnchorPool[(nonAnchorIdx + 1) % nonAnchorPool.length];
                }
            }
            
            if (picked) {
                wordSequence.push(picked);
                lastPicked = picked;
            }
        }

        // ALWAYS single-side for anchor space (v1/v2) - prevents left+right double
        const isAnchorSpace = this.anchorWords.length > 0;
        if (isAnchorSpace) {
            // All on LEFT, regardless of fixedPositions
            // DISTRIBUTE transforms across different moving words for variety
            // Build separate pool of "other words" (non-conclusion, non-anchor words that can be transformed)
            const otherMovingWords = wordSequence.filter(w => 
                w !== leftStart && w !== rightStart && !this.isAnchorWord(w)
            );
            
            // Track which words have been used as moving words to prevent duplicates
            const usedMovingWords = new Set();
            
            for (let i = 0; i < this.numTransforms && wordSequence.length > 0; i++) {
                const target = wordSequence.shift(); // Reference word (what we transform around)
                
                // Alternate between conclusion word and other words for variety
                // 50% conclusion word, 50% other words (but NEVER use anchor as moving word)
                let movingWord;
                if (i % 2 === 0 || otherMovingWords.length === 0) {
                    movingWord = leftStart; // Conclusion word
                } else {
                    // Use a different non-anchor word from pool
                    const idx = Math.floor((i / 2) % otherMovingWords.length);
                    movingWord = otherMovingWords[idx];
                }
                
                // FINAL SAFETY CHECK: Never use an anchor as moving word
                if (this.isAnchorWord(movingWord)) {
                    // Find any non-anchor replacement
                    const safeWords = Object.keys(wordCoordMap).filter(w => !this.isAnchorWord(w));
                    if (safeWords.length > 0) {
                        movingWord = safeWords[Math.floor(Math.random() * safeWords.length)];
                    }
                }
                
                // CRITICAL FIX: Skip if this movingWord+target combination was already used
                // This prevents the same word from being transformed twice in the same direction
                const transformKey = `${movingWord}-${target}`;
                if (usedMovingWords.has(transformKey)) {
                    // Skip this transform to avoid duplicate movement
                    continue;
                }
                usedMovingWords.add(transformKey);
                
                const chain = this.directionize([target], movingWord, leftDimensions, rightDimensions, dimensionPool, wordCoordMap);
                leftChains.push(chain);
                leftDimensions.push(chain[1]);
            }
            rightChains = [];  // Critical: empty right
        } else {
            // Regular ONLY: alternate sides
            let useLeft = true;
            for (let i = 0; i < this.numTransforms && wordSequence.length > 0; i++) {
                const target = wordSequence.shift();
                if (useLeft) {
                    leftChains.push(this.directionize([target], leftStart, leftDimensions, rightDimensions, dimensionPool, wordCoordMap));
                    leftDimensions.push(leftChains[leftChains.length - 1][1]);
                } else {
                    rightChains.push(this.directionize([target], rightStart, rightDimensions, leftDimensions, dimensionPool, wordCoordMap));
                    rightDimensions.push(rightChains[rightChains.length - 1][1]);
                }
                useLeft = !useLeft;
            }
        }

        return [leftChains, rightChains];
    }

    directionize(words, start, usedDimensions, otherDimensions, dimensionPool, wordCoordMap) {
        let chainWords = words.slice();
        chainWords.push(start);

        let allShifts = dimensionPool.map(c => 0);
        pairwise(chainWords, (a, b) => {
            const norm = normalize(diffCoords(wordCoordMap[a], wordCoordMap[b]));
            if (norm) {
                allShifts = addCoords(allShifts, norm.map(c => Math.abs(c)));
            }
        })

        const lastUsed = usedDimensions.length > 0 ? usedDimensions[usedDimensions.length - 1] : -1;
        const lastOther = otherDimensions.length > 0 ? otherDimensions[otherDimensions.length - 1] : -1;
        const noLastUsed = dimensionPool.filter((v, i) => i !== lastUsed);
        const noLastOther = noLastUsed.filter((v, i) => i !== lastOther);

        const pool = new Set(noLastOther.length > 0 ? noLastOther : noLastUsed);
        const available = allShifts.map((v, i) => [v, i]).filter(([v, i]) => pool.has(i));
        shuffle(available);
        const sorted = available.sort((a, b) => b[0] - a[0]);
        if (Math.random() < 0.95) {
            return [chainWords, sorted[0][1]];
        } else {
            return [chainWords, pickRandomItems(sorted, 1).picked[0][1]];
        }
    }

    applyChain(wordCoordMap, dimensionsUsed, chains) {
        if (chains.length === 0) {
            return { ops: [], extraDimensions: [] };
        }
        // Track rotation planes discovered during this chain application
        let rotationDimensions = [];

        const mirrorPoint = (a, b, index) => {
            const p1 = wordCoordMap[a];
            const p2 = wordCoordMap[b];
            const diff = p2[index] - p1[index];
            const newPoint = p2.slice();
            newPoint[index] = p1[index] - diff;
            operations.push(createMirrorTemplate(a, b, dimensionNames[index]));
            return newPoint;
        }

        const setPoint = (a, b, index) => {
            const p1 = wordCoordMap[a];
            const p2 = wordCoordMap[b];
            const newPoint = p2.slice();
            newPoint[index] = p1[index];
            operations.push(createSetTemplate(a, b, dimensionNames[index]));
            return newPoint;
        }

        const scalePoint = (a, b, index) => {
            const p1 = wordCoordMap[a];
            const p2 = wordCoordMap[b];
            const diff = p2[index] - p1[index];
            const newPoint = p2.slice();
            const magnifier = 2;
            operations.push(createScaleTemplate(a, b, dimensionNames[index], magnifier));
            newPoint[index] = p1[index] + magnifier * diff;
            return newPoint;
        }

        const rotatePoint = (a, b, index) => {
            const p1 = wordCoordMap[a];
            const p2 = wordCoordMap[b];
            // Use all spatial dimensions (exclude non-spatial dims like time/quantity/membership)
            // For 3D: [0,1,2], for 4D: [0,1,2,3], for 5D+: still only spatial [0,1,2,3]
            const spatialDimCount = Math.min(p1.length, 4);
            const dimensionPool = p1.map((p, i) => i).slice(0, spatialDimCount);
            const plane = pickRandomItems(dimensionPool, 2).picked;
            plane.sort();
            let [m, n] = plane;
            // Track rotation plane dimensions without mutating the input array
            const newDims = plane.filter(d => dimensionsUsed.indexOf(d) === -1 && rotationDimensions.indexOf(d) === -1);
            rotationDimensions.push(...newDims);
            // Track whether the plane axes were swapped from the standard sorted order.
            // When axes are swapped (e.g., XZ→ZX), the rotation direction is reversed,
            // so we need to swap the CW/CCW labels to keep them visually correct.
            let swappedAxes = false;
            if (m === 0 && n === 2) {
                // ZX plane: swap to match right-hand rule convention (planeName = ZX)
                [m, n] = [n, m];
                swappedAxes = true;
            }
            const planeName = dimensionNames[m] + dimensionNames[n];
            const planeOp = (dimensionPool.length === 2) ? 'rotated' : (`<span class="highlight">${planeName}</span>-rotated`);
            let newPoint = p2.slice();
            let diffM = p2[m] - p1[m];
            let diffN = p2[n] - p1[n];
            newPoint[m] -= diffM;
            newPoint[n] -= diffN;
            // When axes are swapped, the mathematical rotation direction is reversed,
            // so we swap the CW/CCW labels to match the visual direction on screen.
            const isClockwise = coinFlip() !== swappedAxes;
            if (isClockwise) {
                newPoint[m] += diffN
                newPoint[n] += -diffM
                operations.push(createRotationTemplate(a, b, planeOp, planeName, `<span class="pos-degree">90°↷</span>`));
            } else {
                newPoint[m] += -diffN
                newPoint[n] += diffM
                operations.push(createRotationTemplate(a, b, planeOp, planeName, `<span class="neg-degree">-90°↺</span>`));
            }
            return newPoint;
        }

        const customizeCommands = (pool) => {
            let newPool = pool.filter(command => {
                if (command === setPoint && savedata.enableTransformSet) {
                    return true;
                } else if (command === mirrorPoint && savedata.enableTransformMirror) {
                    return true;
                } else if (command === scalePoint && savedata.enableTransformScale) {
                    return true;
                } else if (command === rotatePoint && savedata.enableTransformRotate) {
                    return true;
                } else {
                    return false;
                }
            });

            if (newPool.length === 0) {
                return [mirrorPoint];
            }

            return newPool;
        }

        let operations = [];
        // Variety boost: rotate/mirror/scale cycle for more unique transforms
        let starterCommandPool = customizeCommands([rotatePoint, mirrorPoint, scalePoint, setPoint]);
        let commandPool = customizeCommands([rotatePoint, mirrorPoint, scalePoint, rotatePoint, mirrorPoint, scalePoint, setPoint]);
        let usedCommands = [];
        let appliedTransforms = 0;

        let count = 0;
        let cpool = starterCommandPool;
        for (const [chain, dimension] of chains) {
            for (let i = 1; i < chain.length; i++) {
                // Stop once we've applied the requested number of transforms
                if (appliedTransforms >= this.numTransforms) {
                    break;
                }
                let a = chain[i-1];
                let b = chain[i];

                // If target is anchor OR self-transform, replace with valid non-anchor word
                if (this.isAnchorWord(b) || a === b) {
                    // Never let an anchor become the moving word via replacement
                    const candidates = this.eligiblePool.filter(w => w !== a && !this.anchorWords.includes(w));
                    if (candidates.length > 0) {
                        b = pickRandomItems(candidates, 1).picked[0];
                    } else {
                        // No valid non-anchor found - skip this transform by using 'a' (reference word)
                        // This effectively cancels the transform since a→a is identity
                        b = a;
                    }
                }

                const lastUsed = usedCommands?.[usedCommands.length - 1];
                const filteredPool = cpool.filter(c => c !== lastUsed);
                if (filteredPool.length !== 0) {
                    cpool = filteredPool;
                }

                const command = pickRandomItems(cpool, 1).picked[0];
                wordCoordMap[b] = command.call(null, a, b, dimension);
                appliedTransforms++;
                usedCommands.push(command);
                cpool = commandPool;
            }
            if (appliedTransforms >= this.numTransforms) {
                break;
            }
        }

        return { ops: operations, extraDimensions: rotationDimensions };
    }

}

function createMirrorTemplate(a, b, dimension) {
    const relation = savedata.minimalMode ? (dimension + '🪞') : `is <span class="highlight">${dimension}</span>-mirrored across`;
    return `<span class="subject">${b}</span> <span class="relation">${relation}</span> <span class="subject">${a}</span>`;
}

function createScaleTemplate(a, b, dimension, scale) {
    const relation = savedata.minimalMode ? (dimension + '↔️') : `is <span class="highlight">${dimension}</span>-scaled <span class="highlight">${scale}×</span> from`;
    return `<span class="subject">${b}</span> <span class="relation">${relation}</span> <span class="subject">${a}</span>`;
}

function createSetTemplate(a, b, dimension) {
    if (savedata.minimalMode) {
        const relation = dimension + ' :=';
        return `<span class="subject">${b}</span> <span class="relation">${relation}</span> <span class="subject">${a}</span>`;
    } else {
        return `<span class="highlight">${dimension}</span> of <span class="subject">${b}</span> is set to <span class="highlight">${dimension}</span> of <span class="subject">${a}</span>`;
    }
}

function createRotationTemplate(a, b, planeOp, planeName, degree) {
    const relation = savedata.minimalMode ? `${planeName} ${degree}` : `is ${planeOp} ${degree} around`;
    return `<span class="subject">${b}</span> <span class="relation">${relation}</span> <span class="subject">${a}</span>`;
}

function createContinuousRotationTemplate(a, b, planeName, clockwise) {
    const degree = clockwise ? `<span class="pos-degree">90°↷</span>` : `<span class="neg-degree">-90°↺</span>`;
    const relation = savedata.minimalMode ? `${planeName} ${degree} each` : `<span class="highlight">${planeName}</span>-rotates ${degree} around with every new premise`;
    return `<span class="subject">${b}</span> <span class="relation">${relation}</span> <span class="subject">${a}</span>`;
}

function createOscillationTemplate(a, b, dimension) {
    const relation = savedata.minimalMode ? `${dimension} ⇄ each2` : `oscillates across <span class="highlight">${dimension}</span> every other premise from`;
    return `<span class="subject">${b}</span> <span class="relation">${relation}</span> <span class="subject">${a}</span>`;
}
