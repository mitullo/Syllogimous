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

function inverse(a) {
    return a.map(c => -c);
}

function findDirection(a, b) {
    return normalize(diffCoords(a, b));
}

function getConclusionCoords(wordCoordMap, startWord, endWord) {
    const [start, end] = [wordCoordMap[startWord], wordCoordMap[endWord]];
    const diffCoord = diffCoords(start, end);
    const conclusionCoord = normalize(diffCoord);
    return [diffCoord, conclusionCoord];
}

function isNonZeroConclusion(conclusionCoord) {
    return conclusionCoord !== null && conclusionCoord.some(c => c !== 0);
}

function taxicabDistance(a, b) {
    return a.map((v,i) => Math.abs(b[i] - v)).reduce((left,right) => left + right)
}

function pickWeightedRandomDirection(dirCoords, baseWord, neighbors, wordCoordMap) {
    const badTargets = (neighbors[baseWord] ?? []).map(word => wordCoordMap[word]);
    const base = wordCoordMap[baseWord];
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
        return pickWeightedRandomDirection(dirCoords.slice(1), baseWord, neighbors, wordCoordMap);
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
        return pickWeightedRandomDirection(dirCoords3D, baseWord, neighbors, wordCoordMap);
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
            dirCoord = pickWeightedRandomDirection(dirCoords4D, baseWord, neighbors, wordCoordMap);
        } while (dirCoord.slice(0, 3).every(c => c === 0))
        return dirCoord
    }

    createDirectionStatement(a, b, dirCoord) {
        const direction = dirStringFromCoord(dirCoord);
        const reverseDirection = dirStringFromCoord(inverse(dirCoord));
        const timeName = timeMapping[dirCoord[3]];
        const reverseTimeName = reverseTimeNames[timeName];
        return {
            start: b,
            end: a,
            relation: `${timeName} ${direction} of`,
            reverse: `${reverseTimeName} ${reverseDirection} of`,
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
    const neighborLimit = (!branchesAllowed || options.length <= 3) ? 1 : 2;
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
        let anchorWords = null;
        let pattern = null;
        let wordsInPremises = new Set();
        while (true) {
            if (this.generator.shouldUseAnchor()) {
                [wordCoordMap, neighbors, premises, usedDirCoords, anchorWords] = this.createWordMapAnchor(length, branchesAllowed);
            } else if (numInterleaved > 0) {
                [wordCoordMap, neighbors, premises, usedDirCoords] = this.createWordMapInterleaved(length);
            } else {
                [wordCoordMap, neighbors, premises, usedDirCoords] = this.createWordMap(length, branchesAllowed);
            }
            // Extract all words that actually appear in premises
            wordsInPremises = new Set();
            for (const premise of premises) {
                // Handle wide premises (arrays) and regular premises (objects)
                const premiseList = Array.isArray(premise) ? premise : [premise];
                for (const p of premiseList) {
                    if (!p) continue; // Skip undefined/null premises
                    if (p.start) wordsInPremises.add(p.start);
                    if (p.end) wordsInPremises.add(p.end);
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
                if (!hasValidPairs) {
                    // Words in premises don't form valid distant pairs, retry with new word map
                    continue;
                }
                const pairResult = this.pairChooser.pickTwoDistantWords(premiseNeighbors);
                if (!pairResult) {
                    // No valid pairs found, retry with new word map
                    continue;
                }
                [startWord, endWord] = pairResult;
            } else {
                const pairResult = this.pairChooser.pickTwoDistantWords(neighbors);
                if (!pairResult) {
                    // No valid pairs found, retry with new word map
                    continue;
                }
                [startWord, endWord] = pairResult;
            }
            [diffCoord, conclusionCoord] = getConclusionCoords(wordCoordMap, startWord, endWord);
            if (isNonZeroConclusion(conclusionCoord)) {
                break;
            }
        }

        let operations;
        let hardModeDimensions;
        if (numTransforms > 0) {
            [wordCoordMap, operations, hardModeDimensions] = new SpaceHardMode(numTransforms, anchorWords || []).basicHardMode(wordCoordMap, startWord, endWord, conclusionCoord);
            [diffCoord, conclusionCoord] = getConclusionCoords(wordCoordMap, startWord, endWord);
            if (numInterleaved > 0) {
                premises.push(...operations);
                operations = [];
                hardModeDimensions = conclusionCoord.map((d,i) => i);
            }
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
            } else {
                // Get pair with fallback when unique ones exhausted
                [sw, ew] = getUniquePairOrFallback(neighbors, this.pairChooser, usedPairKeys);

                if (!sw || !ew) {
                    generatedCount++; // Prevent infinite loop
                    continue;
                }

                [dCoord, cCoord] = getConclusionCoords(wordCoordMap, sw, ew);
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
            // Flip validity if visual inversion was applied
            if (premiseResult.isInverted) {
                conclusionIsValid = !conclusionIsValid;
            }
            [conclusionHTML, conclusionIsValid] = applyConclusionNegation(conclusionHTML, conclusionIsValid, conclusionObj, pattern);

            // Always add conclusion (may have duplicates if unique ones exhausted)
            usedConclusionTexts.add(conclusionHTML);

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
            premises = scramble(premises);
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
        // Pattern already generated above for v2, regular Anchor Space doesn't need pattern

        // For V2, filter wordCoordMap to only include words that appear in premises
        // For classic Anchor Space, keep all anchor words for the explanation grid
        const isV2 = this.generator.getName() === "Anchor Space v2";
        const finalWordCoordMap = isV2 ? {} : wordCoordMap;
        if (isV2) {
            for (const word of wordsInPremises) {
                if (wordCoordMap[word]) {
                    finalWordCoordMap[word] = wordCoordMap[word];
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
        let isValid;
        let isValidSame;
        let wordCoordMap = {};
        let neighbors = {};
        let premises = [];
        let usedDirCoords = [];
        let operations = [];
        let anchorWords = null;
        let pattern = null;
        let a, b, c, d;
        let [numInterleaved, numTransforms] = this.getNumTransformsSplit(length);
        const branchesAllowed = Math.random() > 0.2;
        const flip = coinFlip();
        const isV2 = this.generator.getName() === 'Anchor Space v2';
        while (flip !== isValidSame) {
            if (this.generator.shouldUseAnchor()) {
                // Capture anchorWords (5th return value) for transform protection
                [wordCoordMap, neighbors, premises, usedDirCoords, anchorWords] = this.createWordMapAnchor(length, branchesAllowed);
                // Generate pattern for V2 to show memorization stage
                if (isV2 && anchorWords) {
                    pattern = this.generator.getPattern(wordCoordMap, anchorWords);
                }
            } else if (numInterleaved > 0) {
                [wordCoordMap, neighbors, premises, usedDirCoords] = this.createWordMapInterleaved(length);
                anchorWords = null;
            } else {
                [wordCoordMap, neighbors, premises, usedDirCoords] = this.createWordMap(length, branchesAllowed);
                anchorWords = null;
            }
            [a, b, c, d] = pickRandomItems(Object.keys(wordCoordMap), 4).picked;
            if (numTransforms > 0) {
                const [startWord, endWord] = pickRandomItems([a, b, c, d], 2).picked;
                const [diffCoord, conclusionCoord] = getConclusionCoords(wordCoordMap, startWord, endWord);
                let _x;
                // Pass anchorWords to SpaceHardMode to protect them from transforms
                [wordCoordMap, operations, _x] = new SpaceHardMode(numTransforms, anchorWords || []).basicHardMode(wordCoordMap, startWord, endWord, conclusionCoord);
                if (numInterleaved > 0) {
                    premises.push(...operations);
                    operations = [];
                }
            }
            const dirAB = findDirection(wordCoordMap[a], wordCoordMap[b]);
            const dirCD = findDirection(wordCoordMap[c], wordCoordMap[d]);
            // Handle null directions (words at same position) - treat as not equal
            isValidSame = dirAB !== null && dirCD !== null && arraysEqual(dirAB, dirCD);
        }
        let conclusion = analogyTo(a, b);
        if (coinFlip()) {
            conclusion += pickAnalogyStatementSame().html;
            isValid = isValidSame;
        } else {
            conclusion += pickAnalogyStatementDifferent().html;
            isValid = !isValidSame;
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
        return {
            category: 'Analogy: ' + this.generator.getName(),
            type: normalizeString(this.generator.getName()),
            modifiers,
            startedAt: new Date().getTime(),
            wordCoordMap,
            isValid,
            premises,
            ...(savedata.widePremises && { plen: length }),
            operations,
            conclusion,
            ...(countdown && { countdown }),
            ...(pattern && { pattern }),
        }
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
        const totalTransforms = this.generator.hardModeLevel();
        if (!this.generator.hardModeAllowed() || totalTransforms === 0) {
            return [0, 0];
        }

        if (!savedata.enableTransformInterleave) {
            return [0, totalTransforms];
        }

        // OVERRIDE: Anchor Space with fixed positions needs constant transforms
        // regardless of premise count. Put all transforms through basicHardMode
        // for maximum predictability with restricted word pools.
        if (this.generator.shouldUseAnchor() && savedata.anchorSpaceFixedPositions) {
            return [0, totalTransforms];
        }

        let interleaveCount = Math.max(0, Math.min(totalTransforms - 1, numPremises - 1));
        return [interleaveCount, totalTransforms - interleaveCount];
    }

    createWordMapCommands(length) {
        const words = createStimuli(length + 1);
        let commands = words.map(w => ['move', w]);
        let [interleaveCount, _] = this.getNumTransformsSplit(length);
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

    createWordMapInterleaved(length) {
        let [words, commands] = this.createWordMapCommands(length);
        const initialCoord = this.generator.initialCoord();
        let wordCoordMap = {[words[0]]: initialCoord };
        let neighbors = {[words[0]]: []};
        let premiseChunks = [[]];
        let operations = [];
        let usedDirCoords = [];

        let lastWord = words[0];
        let dimensionPool = repeatArrayUntil(shuffle(initialCoord.map((d, i) => i)), commands.length * 2);
        let dimensionIndex = 0;
        for (let i = 1; i < commands.length; i++) {
            let command = commands[i];
            let action = command[0];
            if (action === 'transform') {
                if (premiseChunks[premiseChunks.length - 1].length !== 0) {
                    premiseChunks.push([]);
                }
                let [newWordMap, operation] = new SpaceHardMode(0).oneTransform(wordCoordMap, lastWord, dimensionPool[dimensionIndex], dimensionPool[dimensionIndex+1]);
                dimensionIndex++;
                wordCoordMap = newWordMap;
                operations.push(operation);
            } else {
                const baseWord = lastWord;
                const nextWord = command[1];
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
            }
        }

        if (premiseChunks[premiseChunks.length - 1].length === 0) {
            premiseChunks.pop();
        }

        let divisions = words.length - 2;
        let unbreakableDivisions = Math.round((100 - savedata.scrambleFactor) * divisions / 100);
        premiseChunks = premiseChunks.map(chunk => {
            let chosenDivisions = Math.min(unbreakableDivisions, chunk.length - 1);
            unbreakableDivisions -= chosenDivisions;
            return scrambleWithLimit(chunk, chosenDivisions);
        });

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
        const baseWords = createStimuli(length + 1);
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
                const words = createStimuli(length, excludedWords);
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
            const words = createStimuli(length, excludedWords);
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

    buildOntoWordMap(words, wordCoordMap, neighbors, branchesAllowed, bannedFromBranching=[], isAnchorSpaceV2=false, numPremisesNeeded=0) {
        let premiseMap = {};
        let usedDirCoords = [];

        // Get the set of anchor words (shapes) - these are the words already in wordCoordMap
        const anchorWords = new Set(Object.keys(wordCoordMap));
        const wordsInPremises = new Set(anchorWords);

        // Track which shapes have been used in premises - ensure all shapes get used
        const usedShapes = new Set();
        const anchorWordList = [...anchorWords];
        let shapeIndex = 0;

        // For each new word, connect it to the graph
        for (const nextWord of words) {
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
            wordCoordMap[nextWord] = addCoords(wordCoordMap[baseWord], dirCoord);
            premiseMap[premiseKey(baseWord, nextWord)] = this.generator.createDirectionStatement(baseWord, nextWord, dirCoord);
            usedDirCoords.push(dirCoord);
            neighbors[baseWord] = neighbors[baseWord] ?? [];
            neighbors[baseWord].push(nextWord);
            neighbors[nextWord] = neighbors[nextWord] ?? [];
            neighbors[nextWord].push(baseWord);
            wordsInPremises.add(baseWord);
            wordsInPremises.add(nextWord);
            // Track that this shape was used
            if (anchorWords.has(baseWord)) {
                usedShapes.add(baseWord);
            }
        }

        let premises = orderPremises(premiseMap, neighbors);
        if (savedata.widePremises) {
            premises = createWidePremises(premises, premiseMap);
        }

        return [wordCoordMap, neighbors, premises, usedDirCoords];
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
                const pattern = JSON.parse(saved);
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
        return pickWeightedRandomDirection(dirCoords.slice(1), baseWord, neighbors, wordCoordMap);
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
