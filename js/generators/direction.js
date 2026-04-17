function diffCoords(a, b) {
    return b.map((c, i) => c - a[i]);
}

function addCoords(a, b) {
    return a.map((c, i) => c + b[i]);
}

function normalize(a) {
    return a.map(c => c/Math.abs(c) || 0);
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
        return "Space 4D";
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
        let conclusionCoord;
        let diffCoord;
        let [wordCoordMap, neighbors, premises, usedDirCoords] = [];
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
                    if (p.start) wordsInPremises.add(p.start);
                    if (p.end) wordsInPremises.add(p.end);
                }
            }
            // For Anchor Space modes, only pick conclusion words from words that appear in premises
            if (this.generator.shouldUseAnchor() && anchorWords) {
                // For Anchor Space v2, also generate pattern for display
                if (this.generator.getName() === "Anchor Space v2") {
                    pattern = this.generator.generatePattern(wordCoordMap, anchorWords);
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
            if (conclusionCoord.slice(0, 3).some(c => c !== 0)) {
                break;
            }
        }

        let operations;
        let hardModeDimensions;
        if (numTransforms > 0) {
            [wordCoordMap, operations, hardModeDimensions] = new SpaceHardMode(numTransforms).basicHardMode(wordCoordMap, startWord, endWord, conclusionCoord);
            [diffCoord, conclusionCoord] = getConclusionCoords(wordCoordMap, startWord, endWord);
            if (numInterleaved > 0) {
                premises.push(...operations);
                operations = [];
                hardModeDimensions = conclusionCoord.map((d,i) => i);
            }
        }

        let isValid;
        let conclusionObj;
        if (coinFlip()) { // correct
            isValid = true;
            conclusionObj = this.generator.createDirectionStatement(startWord, endWord, conclusionCoord);
        }
        else {            // wrong
            isValid = false;
            const incorrectCoord = this.incorrectDirections.chooseIncorrectCoord(usedDirCoords, conclusionCoord, diffCoord, hardModeDimensions);
            conclusionObj = this.generator.createDirectionStatement(startWord, endWord, incorrectCoord);
        }

        if (numInterleaved === 0) {
            premises = scramble(premises);
        }
        premises = premises.map((p, i) => createPremiseHTML(p, true, i, pattern));
        conclusion = createBasicPremiseHTML(conclusionObj, true, null, pattern);
        [conclusion, isValid] = applyConclusionNegation(conclusion, isValid, conclusionObj, pattern);
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
            ...(countdown && { countdown }),
            ...(pattern && { pattern }),
        }
    }

    createAnalogy(length) {
        let isValid;
        let isValidSame;
        let [wordCoordMap, neighbors, premises, usedDirCoords, operations] = [];
        let [a, b, c, d] = [];
        let [numInterleaved, numTransforms] = this.getNumTransformsSplit(length);
        const branchesAllowed = Math.random() > 0.2;
        const flip = coinFlip();
        while (flip !== isValidSame) {
            if (this.generator.shouldUseAnchor()) {
                [wordCoordMap, neighbors, premises, usedDirCoords] = this.createWordMapAnchor(length, branchesAllowed);
            } else if (numInterleaved > 0) {
                [wordCoordMap, neighbors, premises, usedDirCoords] = this.createWordMapInterleaved(length);
            } else {
                [wordCoordMap, neighbors, premises, usedDirCoords] = this.createWordMap(length, branchesAllowed);
            }
            [a, b, c, d] = pickRandomItems(Object.keys(wordCoordMap), 4).picked;
            if (numTransforms > 0) {
                const [startWord, endWord] = pickRandomItems([a, b, c, d], 2).picked;
                const [diffCoord, conclusionCoord] = getConclusionCoords(wordCoordMap, startWord, endWord);
                let _x;
                [wordCoordMap, operations, _x] = new SpaceHardMode(numTransforms).basicHardMode(wordCoordMap, startWord, endWord, conclusionCoord);
                if (numInterleaved > 0) {
                    premises.push(...operations);
                    operations = [];
                }
            }
            isValidSame = arraysEqual(findDirection(wordCoordMap[a], wordCoordMap[b]), findDirection(wordCoordMap[c], wordCoordMap[d]));
        }
        let conclusion = analogyTo(a, b);
        if (coinFlip()) {
            conclusion += pickAnalogyStatementSame();
            isValid = isValidSame;
        } else {
            conclusion += pickAnalogyStatementDifferent();
            isValid = !isValidSame;
        }
        conclusion += analogyTo(c, d);

        premises = premises.map((p, i) => createPremiseHTML(p, true, i));
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
        }
    }

    getNumTransformsSplit(numPremises) {
        const totalTransforms = this.generator.hardModeLevel();
        if (!this.generator.hardModeAllowed() || totalTransforms === 0) {
            return [0, 0];
        }

        if (!savedata.enableTransformInterleave) {
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
        this.shapeColors = [
            { name: 'Red', fill: '#e74c3c', stroke: '#c0392b' },
            { name: 'Blue', fill: '#3498db', stroke: '#2980b9' },
            { name: 'Green', fill: '#2ecc71', stroke: '#27ae60' },
            { name: 'Yellow', fill: '#f1c40f', stroke: '#f39c12' },
            { name: 'Purple', fill: '#9b59b6', stroke: '#8e44ad' },
            { name: 'Orange', fill: '#e67e22', stroke: '#d35400' },
            { name: 'Cyan', fill: '#1abc9c', stroke: '#16a085' },
            { name: 'Pink', fill: '#fd79a8', stroke: '#e84393' }
        ];
    }

    getShapeSVG(index, x, y, size) {
        const color = this.shapeColors[index % this.shapeColors.length];
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
        const shuffledColors = shuffle([...this.shapeColors]);
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
