class SpaceHardMode {
    constructor(numTransforms, anchorWords = []) {
        this.numTransforms = numTransforms;
        this.anchorWords = anchorWords;
    }

    isAnchorWord(word) {
        return savedata.anchorSpaceFixedPositions && this.anchorWords.includes(word);
    }

    basicHardMode(wordCoordMap, startWord, endWord, originalConclusionCoord) {
        // Pre-flight check for transform feasibility
        const bannedFromPool = new Set([startWord, endWord]);
        if (savedata.anchorSpaceFixedPositions && this.anchorWords.length > 0) {
            this.anchorWords.forEach(w => bannedFromPool.add(w));
        }
        let eligiblePool = Object.keys(wordCoordMap).filter(w => !bannedFromPool.has(w));

        // SAFEGUARD: If pool is too small but we MUST transform, relax start/end ban
        // NEVER relax anchor ban when fixed positions is enabled
        if (this.numTransforms > 0 && eligiblePool.length < this.numTransforms) {
            console.warn(`Anchor Space: Pool too small (${eligiblePool.length} < ${this.numTransforms}). Relaxing start/end restrictions.`);
            const fallbackBanned = new Set();
            if (savedata.anchorSpaceFixedPositions && this.anchorWords.length > 0) {
                this.anchorWords.forEach(w => fallbackBanned.add(w));
            }
            eligiblePool = Object.keys(wordCoordMap).filter(w => !fallbackBanned.has(w));

            // If STILL empty (e.g., literally only anchors exist), fail out safely
            if (eligiblePool.length === 0) {
                console.error(`Anchor Space: No non-anchor words available at all.`);
                return [wordCoordMap, [], []];
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
        for (let i = 0; i < 10000; i++) {
            newWordMap = structuredClone(wordCoordMap);
            [operations, usedDimensions] = this.applyHardMode(newWordMap, startWord, endWord);
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
            return [structuredClone(wordCoordMap), [], []];
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
        // Exclude anchor words from pool to prevent anchor grid corruption
        const bannedFromPool = new Set([movingWord]);
        if (savedata.anchorSpaceFixedPositions && this.anchorWords.length > 0) {
            this.anchorWords.forEach(w => bannedFromPool.add(w));
        }
        let pool = Object.keys(wordCoordMap).filter(w => !bannedFromPool.has(w));
        // Fallback if pool is empty after banning anchors
        if (pool.length === 0) {
            pool = Object.keys(wordCoordMap).filter(w => w !== movingWord);
        }
        let originalCoord = wordCoordMap[movingWord];
        for (let i = 0; i < 100; i++) {
            newWordMap = structuredClone(wordCoordMap);
            let axisWord = pickRandomItems(pool, 1).picked[0];
            const chainResult = this.applyChain(newWordMap, [], [[[axisWord, movingWord], useBackup ? backupDimension : dimension]]);
            operation = chainResult.ops[0] || null;
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

    applyHardMode(wordCoordMap, leftStart, rightStart) {
        const [leftChains, rightChains] = this.createChains(wordCoordMap, leftStart, rightStart);
        const baseDimensions = [...leftChains.map(([words, dimension]) => dimension), ...rightChains.map(([words, dimension]) => dimension)];
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
            if (savedata.anchorSpaceFixedPositions && this.anchorWords.length > 0) {
                this.anchorWords.forEach(w => bannedFromPool.add(w));
            }
            pool = Object.keys(wordCoordMap).filter(word => !bannedFromPool.has(word));
        }

        // Store eligible pool for applyChain to use as replacement source
        this.eligiblePool = pool;
        const dimensionPool = wordCoordMap[leftStart].map((c, i) => i);

        // Guard: return empty chains if no eligible words
        if (pool.length === 0) {
            return [[], []];
        }

        // STACKING: Allow multiple transforms per word by cycling through pool
        // This enables N transforms even with fewer than N words available
        const shuffledPool = shuffle(pool.slice());
        let wordSequence = [];
        for (let i = 0; i < this.numTransforms; i++) {
            wordSequence.push(shuffledPool[i % shuffledPool.length]);
        }

        // ALWAYS single-side for anchor space (v1/v2) - prevents left+right double
        const isAnchorSpace = this.anchorWords.length > 0;
        if (isAnchorSpace) {
            // All on LEFT, regardless of fixedPositions
            for (let i = 0; i < this.numTransforms && wordSequence.length > 0; i++) {
                const target = wordSequence.shift();
                // Pass just [target] like regular mode - directionize adds leftStart
                const chain = this.directionize([target], leftStart, leftDimensions, rightDimensions, dimensionPool, wordCoordMap);
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

                // If target is anchor OR self-transform, replace with valid word
                if (this.isAnchorWord(b) || a === b) {
                    const candidates = this.eligiblePool.filter(w => w !== a);
                    b = candidates.length > 0 ?
                        pickRandomItems(candidates, 1).picked[0] :
                        this.eligiblePool[0] || b;  // Guaranteed pick
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
