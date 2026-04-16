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
        while (true) {
            if (this.generator.shouldUseAnchor()) {
                [wordCoordMap, neighbors, premises, usedDirCoords, anchorWords] = this.createWordMapAnchor(length, branchesAllowed);
            } else if (numInterleaved > 0) {
                [wordCoordMap, neighbors, premises, usedDirCoords] = this.createWordMapInterleaved(length);
            } else {
                [wordCoordMap, neighbors, premises, usedDirCoords] = this.createWordMap(length, branchesAllowed);
            }
            [startWord, endWord] = this.pairChooser.pickTwoDistantWords(neighbors);
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
        premises = premises.map((p, i) => createPremiseHTML(p, true, i));
        conclusion = createBasicPremiseHTML(conclusionObj);
        [conclusion, isValid] = applyConclusionNegation(conclusion, isValid, conclusionObj);
        const countdown = this.generator.getCountdown();
        const totalTransforms = this.getNumTransformsSplit(length).reduce((a, b) => a + b, 0);
        let modifiers = [];
        if (totalTransforms > 0) {
            modifiers.push(`op${totalTransforms}`);
        }
        if (numInterleaved > 0) {
            modifiers.push(`interleave`);
        }
        // Generate pattern for Anchor Space v2
        let pattern = null;
        if (this.generator.getName() === "Anchor Space v2") {
            pattern = this.generator.generatePattern(wordCoordMap, anchorWords);
        }

        return {
            category: this.generator.getName(),
            type: normalizeString(this.generator.getName()),
            ...((totalTransforms > 0 || savedata.widePremises) && { plen: length }),
            modifiers,
            startedAt: new Date().getTime(),
            wordCoordMap,
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

        let star, circle, triangle, heart, center, ne, nw, sw;
        if (isV2) {
            // Use normal words for v2 - pattern will assign shapes later
            // Create 8 words to allow up to 8 shapes (center + 4 cardinal + 3 diagonal)
            const normalWords = createStimuli(8);
            star = normalWords[0];      // [0, 1] - North
            circle = normalWords[1];    // [1, 0] - East
            triangle = normalWords[2];  // [-1, 0] - West
            heart = normalWords[3];     // [0, -1] - South
            center = normalWords[4];    // [0, 0] - Center
            ne = normalWords[5];        // [1, 1] - Northeast
            nw = normalWords[6];        // [-1, 1] - Northwest
            sw = normalWords[7];        // [-1, -1] - Southwest
        } else {
            // Classic anchor space uses [svg] tag words
            star = '[svg]0[/svg]';
            circle = '[svg]1[/svg]';
            triangle = '[svg]2[/svg]';
            heart = '[svg]3[/svg]';
        }

        let result;
        for (let i = 0; i < 10; i++) {
            const excludedWords = isV2 ? [star, circle, triangle, heart, center, ne, nw, sw] : [star, circle, triangle, heart];
            const words = createStimuli(length, excludedWords);
            let wordCoordMap = {
                [star]: [0, 1],
                [circle]: [1, 0],
                [triangle]: [-1, 0],
                [heart]: [0, -1],
            };
            if (isV2) {
                wordCoordMap[center] = [0, 0];
                wordCoordMap[ne] = [1, 1];
                wordCoordMap[nw] = [-1, 1];
                wordCoordMap[sw] = [-1, -1];
            }

            let starters = isV2 ? [star, circle, triangle, heart, center, ne, nw, sw] : [star, circle, triangle, heart];
            shuffle(starters);
            const bannedFromBranching = isV2 ? [starters[1], starters[2], starters[3], starters[4], starters[5], starters[6], starters[7]] : [starters[1], starters[2], starters[3]];
            let neighbors;
            if (isV2) {
                // For V2 with 8 words, create neighbors for all 8
                if (branchesAllowed) {
                    neighbors = {
                        [starters[0]]: [starters[1], starters[2], starters[3], starters[4], starters[5], starters[6], starters[7]],
                        [starters[1]]: [starters[0]],
                        [starters[2]]: [starters[0]],
                        [starters[3]]: [starters[0]],
                        [starters[4]]: [starters[0]],
                        [starters[5]]: [starters[0]],
                        [starters[6]]: [starters[0]],
                        [starters[7]]: [starters[0]],
                    };
                } else {
                    // Non-branching: center connects to 4 cardinals, diagonals connect to adjacent cardinals
                    neighbors = {
                        [starters[0]]: [starters[1], starters[2], starters[4], starters[6]],
                        [starters[1]]: [starters[0], starters[3], starters[5]],
                        [starters[2]]: [starters[0], starters[7]],
                        [starters[3]]: [starters[1]],
                        [starters[4]]: [starters[0]],
                        [starters[5]]: [starters[1]],
                        [starters[6]]: [starters[0]],
                        [starters[7]]: [starters[2]],
                    };
                }
            } else if (branchesAllowed) {
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

            result = this.buildOntoWordMap(words, wordCoordMap, neighbors, branchesAllowed, bannedFromBranching);
            const anchorConnections = starters.map(s => neighbors[s].length).reduce((a, b) => a + b, 0);
            // For V2 with 8 words: need 14 connections (branching) or 12 (non-branching)
            // For classic with 4 words: need 8 connections (branching) or 6 (non-branching)
            const requiredConnections = isV2 ? (branchesAllowed ? 14 : 12) : (branchesAllowed ? 8 : 6);
            if (anchorConnections >= requiredConnections) {
                break;
            }
        }
        // Return anchor words for V2 so generatePattern can use only those
        const anchorWordsList = isV2 ? [star, circle, triangle, heart, center, ne, nw, sw] : [star, circle, triangle, heart];
        return [...result, anchorWordsList];
    }

    buildOntoWordMap(words, wordCoordMap, neighbors, branchesAllowed, bannedFromBranching=[]) {
        let premiseMap = {};
        let usedDirCoords = [];

        for (const nextWord of words) {
            const baseWord = pickBaseWord(neighbors, branchesAllowed, bannedFromBranching);
            const dirCoord = this.generator.pickDirection(baseWord, neighbors, wordCoordMap);
            wordCoordMap[nextWord] = addCoords(wordCoordMap[baseWord], dirCoord);
            premiseMap[premiseKey(baseWord, nextWord)] = this.generator.createDirectionStatement(baseWord, nextWord, dirCoord);
            usedDirCoords.push(dirCoord);
            neighbors[baseWord] = neighbors[baseWord] ?? [];
            neighbors[baseWord].push(nextWord);
            neighbors[nextWord] = neighbors[nextWord] ?? [];
            neighbors[nextWord].push(baseWord);
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
        // Only select from anchor words to avoid coordinate conflicts with dynamically added words
        const words = anchorWords || Object.keys(wordCoordMap).slice(0, 8);
        const numShapes = Math.min(words.length, savedata.anchorSpaceV2ShapeCount || 4);
        const shapeNames = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star'];

        // Shuffle words to get random selection each time
        const shuffledWords = shuffle([...words]);
        const selectedWords = shuffledWords.slice(0, numShapes);

        // Shuffle colors and shapes for random assignment
        const shuffledColors = shuffle([...this.shapeColors]);
        const shuffledShapes = shuffle([...shapeNames]);

        // Assign colors and shapes to words randomly
        const pattern = {};
        for (let i = 0; i < numShapes; i++) {
            const word = selectedWords[i];
            const color = shuffledColors[i % shuffledColors.length];
            const shape = shuffledShapes[i % shuffledShapes.length];
            pattern[word] = { color, shape, coord: wordCoordMap[word] };
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
