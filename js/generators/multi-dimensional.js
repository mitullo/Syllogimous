// Multi-Dimensional RRT Generator
// Adds simultaneous relation layers: time (was/is), quantity (more/less), membership (contains/within)
// on top of spatial relations

function subCoords(a, b) {
    return b.map((c, i) => c - a[i]);
}

// Layer definitions perfectly aligned to map vector values [-1, 0, 1] to indices [0, 1, 2]
const temporalLayers = [
    { name: 'was before', reverse: 'will be after', minimal: '←t', reverseMinimal: 't→' }, // -1
    { name: 'is simultaneous with', reverse: 'is simultaneous with', minimal: '=t', reverseMinimal: '=t' }, // 0
    { name: 'will be after', reverse: 'was before', minimal: 't→', reverseMinimal: '←t' }, // 1
];

const quantityLayers = [
    { name: 'has less than', reverse: 'has more than', minimal: '<', reverseMinimal: '>' }, // -1
    { name: 'has equal to', reverse: 'has equal to', minimal: '=q', reverseMinimal: '=q' }, // 0
    { name: 'has more than', reverse: 'has less than', minimal: '>', reverseMinimal: '<' }, // 1
];

const membershipLayers = [
    { name: 'is within', reverse: 'contains', minimal: '⊂', reverseMinimal: '⊃' }, // -1
    { name: 'is separate from', reverse: 'is separate from', minimal: '≠m', reverseMinimal: '≠m' }, // 0
    { name: 'contains', reverse: 'is within', minimal: '⊃', reverseMinimal: '⊂' }, // 1
];

// Helper to create spatial-only direction statement (extracted from dirCoord[0..2])
function createSpatialStatement(a, b, dirCoord) {
    const spatialCoord = dirCoord.slice(0, 3);
    const direction = dirStringFromCoord(spatialCoord);
    const reverseDirection = dirStringFromCoord(inverse(spatialCoord));
    return {
        start: b, // Fixed: Next word is the subject
        end: a,   // Fixed: Base word is the object
        relation: `is ${direction} of`,
        reverse: `is ${reverseDirection} of`,
        relationMinimal: dirStringMinimal(spatialCoord),
        reverseMinimal: dirStringMinimal(inverse(spatialCoord)),
    };
}

// Create a multi-dimensional premise combining spatial and additional layers
function createMultiDimStatement(a, b, dirCoord, dimensions) {
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
    
    const spatialStmt = createSpatialStatement(a, b, dirCoord);
    
    let layers = [spatialStmt];
    let layerMinimals = [
        savedata.minimalMode ? spatialStmt.relationMinimal : spatialStmt.relation
    ];

    // 5D: Add temporal layer using the actual coordinate
    if (dimensions >= 5) {
        const temporal = temporalLayers[dirCoord[3] + 1]; 
        layers.push(temporal);
        layerMinimals.push(savedata.minimalMode ? temporal.minimal : temporal.name);
    }

    // 6D: Add quantity layer using the actual coordinate
    if (dimensions >= 6) {
        const quantity = quantityLayers[dirCoord[4] + 1];
        layers.push(quantity);
        layerMinimals.push(savedata.minimalMode ? quantity.minimal : quantity.name);
    }

    // 7D: Add membership layer using the actual coordinate
    if (dimensions >= 7) {
        const membership = membershipLayers[dirCoord[5] + 1];
        layers.push(membership);
        layerMinimals.push(savedata.minimalMode ? membership.minimal : membership.name);
    }

    // Combine all layers into a single relation
    if (savedata.minimalMode) {
        return {
            start: b, // Fixed
            end: a,   // Fixed
            relation: layerMinimals.join(' '),
            reverse: layerMinimals.slice().reverse().join(' '),
            relationMinimal: layerMinimals.join(' '),
            reverseMinimal: layerMinimals.slice().reverse().join(' '),
        };
    } else {
        const fullRelations = layers.map((layer, i) => i === 0 ? layer.relation : layer.name);
        const reverseRelations = layers.map((layer, i) => layer.reverse);
        
        return {
            start: b, // Fixed
            end: a,   // Fixed
            relation: fullRelations.join(', '),
            reverse: reverseRelations.join(', '),
            relationMinimal: layerMinimals.join(' '),
            reverseMinimal: layerMinimals.slice().reverse().join(' '),
        };
    }
}

// 5D Question generator (Spatial + Temporal)
function createMultiDim5DGenerator(length) {
    return {
        question: {
            category: "SPACE FIVE D",
            getCountdown: function() {
                return countdownFromOverride(savedata.overrideMultiDim5DPremises, savedata.overrideMultiDim5DTime);
            },
            hardModeAllowed: function() {
                return savedata.space5DHardModeLevel > 0;
            },
            hardModeLevel: function() {
                return savedata.space5DHardModeLevel;
            },
            getNumTransformsSplit: function(numPremises) {
                const totalTransforms = this.hardModeLevel();
                if (!this.hardModeAllowed() || totalTransforms === 0) {
                    return [0, 0];
                }
                if (!savedata.enableTransformInterleave) {
                    return [0, totalTransforms];
                }
                let interleaveCount = Math.max(0, Math.min(totalTransforms - 1, numPremises - 1));
                return [interleaveCount, totalTransforms - interleaveCount];
            },
            create: function(length) {
                const dir4dGen = new Direction4D();
                const words = createStimuli(length + 1);
                const neighbors = {};
                
                // Transform split for interleave mode
                const [numInterleaved, numTransforms] = this.getNumTransformsSplit(length);
                
                // Create unified transform state for coordinated transforms
                let transformState = (numInterleaved > 0 || numTransforms > 0) ? new TransformState({}, []) : null;
                
                // Maintain a 4D map for the pathfinder to prevent distance calculation crashes, 
                // and a true 5D map for the logic.
                const wordCoordMap4D = { [words[0]]: [0, 0, 0, 0] };
                let wordCoordMap = { [words[0]]: [0, 0, 0, 0, 0] };
                
                // When using transforms, initialize transformState with the wordCoordMap reference
                if (transformState) {
                    transformState.wordCoordMap = wordCoordMap;
                }
                
                // Interleave transforms during premise generation
                // Pre-calculate evenly distributed positions for interleaved transforms
                let interleavePositions = [];
                for (let j = 0; j < numInterleaved; j++) {
                    interleavePositions.push(Math.floor((j + 1) * length / (numInterleaved + 1)));
                }
                let nextInterleaveIdx = 0;
                let interleavedOps = [];
                let anchorWords = [];
                // Dimension pool for interleaved transforms (like direction.js)
                const dimPool5D = repeatArrayUntil(shuffle([0, 1, 2, 3, 4]), numInterleaved * 2);
                let dimIndex = 0;
                
                // Build premise chunks for interleaving (like direction.js createWordMapInterleaved)
                let premiseChunks = [[]];
                
                for (let i = 0; i < length; i++) {
                    const baseWord = words[i];
                    const nextWord = words[i + 1];
                    const dirCoord4D = dir4dGen.pickDirection(baseWord, neighbors, wordCoordMap4D);
                    
                    // Generate actual coordinate for 5th dimension
                    const dim5 = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
                    const dirCoord = [...dirCoord4D, dim5];
                    
                    wordCoordMap4D[nextWord] = addCoords(wordCoordMap4D[baseWord], dirCoord4D);
                    wordCoordMap[nextWord] = addCoords(wordCoordMap[baseWord], dirCoord);
                    
                    const premise = createMultiDimStatement(baseWord, nextWord, dirCoord, 5);
                    premiseChunks[premiseChunks.length - 1].push(premise);
                    
                    neighbors[baseWord] = neighbors[baseWord] ?? [];
                    neighbors[baseWord].push(nextWord);
                    neighbors[nextWord] = neighbors[nextWord] ?? [];
                    neighbors[nextWord].push(baseWord);
                    
                    // Apply interleaved transform if due
                    if (nextInterleaveIdx < interleavePositions.length && i === interleavePositions[nextInterleaveIdx]) {
                        // Start a new premise chunk after the transform
                        premiseChunks.push([]);
                        // Pick random moving word (not anchor)
                        const availableWords = Object.keys(wordCoordMap).filter(w => !anchorWords.includes(w));
                        if (availableWords.length > 0) {
                            const movingWord = availableWords[Math.floor(Math.random() * availableWords.length)];
                            const [newMap, operation] = new SpaceHardMode(1, anchorWords, transformState)
                                .oneTransform(wordCoordMap, movingWord, dimPool5D[dimIndex], dimPool5D[dimIndex + 1]);
                            dimIndex++;
                            wordCoordMap = newMap;
                            if (operation) {
                                interleavedOps.push(operation);
                            }
                        }
                        nextInterleaveIdx++;
                    }
                }
                
                // Remove empty trailing chunk
                if (premiseChunks[premiseChunks.length - 1].length === 0) {
                    premiseChunks.pop();
                }
                
                // Merge premise chunks with interleaved operations (same as direction.js)
                let premises;
                if (numInterleaved > 0 && interleavedOps.length > 0) {
                    let merged = interleaveArrays(premiseChunks, interleavedOps);
                    premises = merged.flatMap(p => Array.isArray(p) ? p : [p]);
                } else {
                    premises = premiseChunks.flat();
                }

                // Transform support: pick primary conclusion words first
                const pairChooser = new DirectionPairChooser();
                let startWord, endWord;
                let operations = [];

                // Pick primary conclusion words
                const primaryPair = pairChooser.pickTwoDistantWords(neighbors);
                if (primaryPair) {
                    [startWord, endWord] = primaryPair;
                }

                // Apply remaining basic transforms (interleaved were already applied via transformState)
                if (numTransforms > 0 && startWord && endWord) {
                    const [diffCoord, conclusionCoord] = getConclusionCoords(wordCoordMap, startWord, endWord);
                    let _x;
                    // Pass transformState for coordinated transforms
                    [wordCoordMap, operations, _x] = new SpaceHardMode(numTransforms, anchorWords, transformState)
                        .basicHardMode(wordCoordMap, startWord, endWord, conclusionCoord);
                    if (numInterleaved > 0) {
                        // Interleave mode: push basic ops to premises, hide Transformations section
                        premises.push(...operations);
                        operations = [];
                    }
                }

                const conclusionsArr = [];
                const usedPairsSet = new Set();
                const usedConclusionTexts = new Set();

                const numConclusions = (savedata.multipleConclusionsMode && savedata.numConclusions > 1)
                    ? savedata.numConclusions
                    : 1;

                let generatedCount = 0;
                let isFirstConclusion = true;

                while (generatedCount < numConclusions) {
                    let sw, ew;

                    if (isFirstConclusion && startWord && endWord) {
                        sw = startWord;
                        ew = endWord;
                        isFirstConclusion = false;
                    } else {
                        let attempts = 0;
                        do {
                            const pr = pairChooser.pickTwoDistantWords(neighbors);
                            if (!pr) break;
                            [sw, ew] = pr;
                            attempts++;
                        } while (usedPairsSet.has(`${sw}-${ew}`) && attempts < 5);
                    }

                    if (!sw || !ew) {
                        generatedCount++; // Prevent infinite loop
                        continue;
                    }
                    usedPairsSet.add(`${sw}-${ew}`);

                    const diff = subCoords(wordCoordMap[sw], wordCoordMap[ew]);
                    const normDiff = diff.map(c => c === 0 ? 0 : (c > 0 ? 1 : -1));

                    let conclusionIsValid = coinFlip();
                    let conclusionObj;

                    if (conclusionIsValid) {
                        conclusionObj = createMultiDimStatement(sw, ew, normDiff, 5);
                    } else {
                        const wrongCoord = [...normDiff];
                        const interferenceLevel = savedata.space5DInterference || 0;

                        if (interferenceLevel > 0 && Math.random() * 100 < interferenceLevel) {
                            const currentVal = wrongCoord[3];
                            const options = [-1, 0, 1].filter(v => v !== currentVal);
                            wrongCoord[3] = options[Math.floor(Math.random() * options.length)];
                        } else {
                            const axisToChange = Math.floor(Math.random() * 5);
                            const currentVal = wrongCoord[axisToChange];
                            const options = [-1, 0, 1].filter(v => v !== currentVal);
                            wrongCoord[axisToChange] = options[Math.floor(Math.random() * options.length)];
                        }
                        conclusionObj = createMultiDimStatement(sw, ew, wrongCoord, 5);
                    }

                    const premiseResult = createPremiseHTML(conclusionObj, true, length);
                    let conclusionHTML = premiseResult.html;
                    if (premiseResult.isInverted) {
                        conclusionIsValid = !conclusionIsValid;
                    }
                    [conclusionHTML, conclusionIsValid] = applyConclusionNegation(
                        conclusionHTML, conclusionIsValid, conclusionObj
                    );

                    usedConclusionTexts.add(conclusionHTML);

                    conclusionsArr.push({
                        conclusion: conclusionHTML,
                        isValid: conclusionIsValid,
                        startWord: sw,
                        endWord: ew,
                    });
                    generatedCount++;
                }

                const primary = conclusionsArr[0] ?? { conclusion: '', isValid: false };

                const totalTransforms = this.getNumTransformsSplit(length).reduce((a, b) => a + b, 0);
                let modifiers = [];
                if (totalTransforms > 0) {
                    modifiers.push(`op${totalTransforms}`);
                }

                return {
                    premises: premises.map((p, i) => createPremiseHTML(p, true, i)),
                    conclusion: primary.conclusion,
                    isValid: primary.isValid,
                    conclusions: conclusionsArr,
                    currentConclusionIndex: 0,
                    userAnswers: [],
                    plen: length,
                    type: "space-five-d",
                    category: "SPACE FIVE D",
                    wordCoordMap: wordCoordMap,
                    modifiers,
                    operations,
                };
            },
            createAnalogy: function(length) {
                const dir4dGen = new Direction4D();
                const words = createStimuli(length + 1);
                const premises = [];
                const neighbors = {};

                const wordCoordMap4D = { [words[0]]: [0, 0, 0, 0] };
                let wordCoordMap = { [words[0]]: [0, 0, 0, 0, 0] };

                for (let i = 0; i < length; i++) {
                    const baseWord = words[i];
                    const nextWord = words[i + 1];
                    const dirCoord4D = dir4dGen.pickDirection(baseWord, neighbors, wordCoordMap4D);
                    const dim5 = Math.floor(Math.random() * 3) - 1;
                    const dirCoord = [...dirCoord4D, dim5];

                    wordCoordMap4D[nextWord] = addCoords(wordCoordMap4D[baseWord], dirCoord4D);
                    wordCoordMap[nextWord] = addCoords(wordCoordMap[baseWord], dirCoord);

                    const premise = createMultiDimStatement(baseWord, nextWord, dirCoord, 5);
                    premises.push(premise);

                    neighbors[baseWord] = neighbors[baseWord] ?? [];
                    neighbors[baseWord].push(nextWord);
                    neighbors[nextWord] = neighbors[nextWord] ?? [];
                    neighbors[nextWord].push(baseWord);
                }

                // Transform support
                const [numInterleaved, numTransforms] = this.getNumTransformsSplit(length);
                let [a, b, c, d] = pickRandomItems(Object.keys(wordCoordMap), 4).picked;
                let operations = [];

                if (numTransforms > 0) {
                    const [startWord, endWord] = pickRandomItems([a, b, c, d], 2).picked;
                    const [diffCoord, conclusionCoord] = getConclusionCoords(wordCoordMap, startWord, endWord);
                    let _x;
                    [wordCoordMap, operations, _x] = new SpaceHardMode(numTransforms).basicHardMode(
                        wordCoordMap, startWord, endWord, conclusionCoord
                    );
                    if (numInterleaved > 0) {
                        premises.push(...operations);
                        operations = [];
                    }
                }

                const isValidSame = arraysEqual(
                    findDirection(wordCoordMap[a], wordCoordMap[b]),
                    findDirection(wordCoordMap[c], wordCoordMap[d])
                );

                let conclusion = analogyTo(a, b);
                let isValid;
                if (coinFlip()) {
                    conclusion += pickAnalogyStatementSame().html;
                    isValid = isValidSame;
                } else {
                    conclusion += pickAnalogyStatementDifferent().html;
                    isValid = !isValidSame;
                }
                conclusion += analogyTo(c, d);

                const totalTransforms = this.getNumTransformsSplit(length).reduce((a, b) => a + b, 0);
                let modifiers = [];
                if (totalTransforms > 0) {
                    modifiers.push(`op${totalTransforms}`);
                }

                return {
                    category: 'Analogy: SPACE FIVE D',
                    type: 'space-five-d',
                    startedAt: new Date().getTime(),
                    bucket: Object.keys(wordCoordMap),
                    premises: premises.map((p, i) => createPremiseHTML(p, true, i)),
                    isValid,
                    conclusion,
                    modifiers,
                    operations,
                    wordCoordMap,
                };
            }
        },
        premiseCount: getPremisesFor('overrideMultiDim5DPremises', length),
        weight: savedata.overrideMultiDim5DWeight,
    };
}

// 6D Question generator (Spatial + Temporal + Quantity)
function createMultiDim6DGenerator(length) {
    return {
        question: {
            category: "SPACE SIX D",
            getCountdown: function() {
                return countdownFromOverride(savedata.overrideMultiDim6DPremises, savedata.overrideMultiDim6DTime);
            },
            hardModeAllowed: function() {
                return savedata.space6DHardModeLevel > 0;
            },
            hardModeLevel: function() {
                return savedata.space6DHardModeLevel;
            },
            getNumTransformsSplit: function(numPremises) {
                const totalTransforms = this.hardModeLevel();
                if (!this.hardModeAllowed() || totalTransforms === 0) {
                    return [0, 0];
                }
                if (!savedata.enableTransformInterleave) {
                    return [0, totalTransforms];
                }
                let interleaveCount = Math.max(0, Math.min(totalTransforms - 1, numPremises - 1));
                return [interleaveCount, totalTransforms - interleaveCount];
            },
            create: function(length) {
                const dir4dGen = new Direction4D();
                const words = createStimuli(length + 1);
                const neighbors = {};
                
                // Transform split for interleave mode
                const [numInterleaved, numTransforms] = this.getNumTransformsSplit(length);
                
                // Create unified transform state for coordinated transforms
                let transformState = (numInterleaved > 0 || numTransforms > 0) ? new TransformState({}, []) : null;
                
                const wordCoordMap4D = { [words[0]]: [0, 0, 0, 0] };
                let wordCoordMap = { [words[0]]: [0, 0, 0, 0, 0, 0] };
                
                // When using transforms, initialize transformState with the wordCoordMap reference
                if (transformState) {
                    transformState.wordCoordMap = wordCoordMap;
                }
                
                // Interleave transforms during premise generation
                // Pre-calculate evenly distributed positions for interleaved transforms
                let interleavePositions = [];
                for (let j = 0; j < numInterleaved; j++) {
                    interleavePositions.push(Math.floor((j + 1) * length / (numInterleaved + 1)));
                }
                let nextInterleaveIdx = 0;
                let interleavedOps = [];
                let anchorWords = [];
                // Dimension pool for interleaved transforms (like direction.js)
                const dimPool6D = repeatArrayUntil(shuffle([0, 1, 2, 3, 4, 5]), numInterleaved * 2);
                let dimIndex = 0;
                
                // Build premise chunks for interleaving (like direction.js createWordMapInterleaved)
                let premiseChunks = [[]];
                
                for (let i = 0; i < length; i++) {
                    const baseWord = words[i];
                    const nextWord = words[i + 1];
                    const dirCoord4D = dir4dGen.pickDirection(baseWord, neighbors, wordCoordMap4D);
                    
                    const dim5 = Math.floor(Math.random() * 3) - 1;
                    const dim6 = Math.floor(Math.random() * 3) - 1;
                    const dirCoord = [...dirCoord4D, dim5, dim6];
                    
                    wordCoordMap4D[nextWord] = addCoords(wordCoordMap4D[baseWord], dirCoord4D);
                    wordCoordMap[nextWord] = addCoords(wordCoordMap[baseWord], dirCoord);
                    
                    const premise = createMultiDimStatement(baseWord, nextWord, dirCoord, 6);
                    premiseChunks[premiseChunks.length - 1].push(premise);
                    
                    neighbors[baseWord] = neighbors[baseWord] ?? [];
                    neighbors[baseWord].push(nextWord);
                    neighbors[nextWord] = neighbors[nextWord] ?? [];
                    neighbors[nextWord].push(baseWord);
                    
                    // Apply interleaved transform if due
                    if (nextInterleaveIdx < interleavePositions.length && i === interleavePositions[nextInterleaveIdx]) {
                        // Start a new premise chunk after the transform
                        premiseChunks.push([]);
                        // Pick random moving word (not anchor)
                        const availableWords = Object.keys(wordCoordMap).filter(w => !anchorWords.includes(w));
                        if (availableWords.length > 0) {
                            const movingWord = availableWords[Math.floor(Math.random() * availableWords.length)];
                            const [newMap, operation] = new SpaceHardMode(1, anchorWords, transformState)
                                .oneTransform(wordCoordMap, movingWord, dimPool6D[dimIndex], dimPool6D[dimIndex + 1]);
                            dimIndex++;
                            wordCoordMap = newMap;
                            if (operation) {
                                interleavedOps.push(operation);
                            }
                        }
                        nextInterleaveIdx++;
                    }
                }
                
                // Remove empty trailing chunk
                if (premiseChunks[premiseChunks.length - 1].length === 0) {
                    premiseChunks.pop();
                }
                
                // Merge premise chunks with interleaved operations (same as direction.js)
                let premises;
                if (numInterleaved > 0 && interleavedOps.length > 0) {
                    let merged = interleaveArrays(premiseChunks, interleavedOps);
                    premises = merged.flatMap(p => Array.isArray(p) ? p : [p]);
                } else {
                    premises = premiseChunks.flat();
                }

                // Transform support: pick primary conclusion words first
                const pairChooser = new DirectionPairChooser();
                let startWord, endWord;
                let operations = [];

                // Pick primary conclusion words
                const primaryPair = pairChooser.pickTwoDistantWords(neighbors);
                if (primaryPair) {
                    [startWord, endWord] = primaryPair;
                }

                // Apply remaining basic transforms (interleaved were already applied via transformState)
                if (numTransforms > 0 && startWord && endWord) {
                    const [diffCoord, conclusionCoord] = getConclusionCoords(wordCoordMap, startWord, endWord);
                    let _x;
                    // Pass transformState for coordinated transforms
                    [wordCoordMap, operations, _x] = new SpaceHardMode(numTransforms, anchorWords, transformState)
                        .basicHardMode(wordCoordMap, startWord, endWord, conclusionCoord);
                    if (numInterleaved > 0) {
                        // Interleave mode: push basic ops to premises, hide Transformations section
                        premises.push(...operations);
                        operations = [];
                    }
                }

                const conclusionsArr = [];
                const usedPairsSet = new Set();
                const usedConclusionTexts = new Set();

                const numConclusions = (savedata.multipleConclusionsMode && savedata.numConclusions > 1)
                    ? savedata.numConclusions
                    : 1;

                let generatedCount = 0;
                let isFirstConclusion = true;

                while (generatedCount < numConclusions) {
                    let sw, ew;

                    if (isFirstConclusion && startWord && endWord) {
                        sw = startWord;
                        ew = endWord;
                        isFirstConclusion = false;
                    } else {
                        let attempts = 0;
                        do {
                            const pr = pairChooser.pickTwoDistantWords(neighbors);
                            if (!pr) break;
                            [sw, ew] = pr;
                            attempts++;
                        } while (usedPairsSet.has(`${sw}-${ew}`) && attempts < 5);
                    }

                    if (!sw || !ew) {
                        generatedCount++; // Prevent infinite loop
                        continue;
                    }
                    usedPairsSet.add(`${sw}-${ew}`);

                    const diff = subCoords(wordCoordMap[sw], wordCoordMap[ew]);
                    const normDiff = diff.map(c => c === 0 ? 0 : (c > 0 ? 1 : -1));

                    let conclusionIsValid = coinFlip();
                    let conclusionObj;

                    if (conclusionIsValid) {
                        conclusionObj = createMultiDimStatement(sw, ew, normDiff, 6);
                    } else {
                        const wrongCoord = [...normDiff];
                        const interferenceLevel = savedata.space6DInterference || 0;

                        if (interferenceLevel > 0 && Math.random() * 100 < interferenceLevel) {
                            const currentVal = wrongCoord[3];
                            const options = [-1, 0, 1].filter(v => v !== currentVal);
                            wrongCoord[3] = options[Math.floor(Math.random() * options.length)];
                        } else {
                            const axisToChange = Math.floor(Math.random() * 6);
                            const currentVal = wrongCoord[axisToChange];
                            const options = [-1, 0, 1].filter(v => v !== currentVal);
                            wrongCoord[axisToChange] = options[Math.floor(Math.random() * options.length)];
                        }
                        conclusionObj = createMultiDimStatement(sw, ew, wrongCoord, 6);
                    }

                    const premiseResult = createPremiseHTML(conclusionObj, true, length);
                    let conclusionHTML = premiseResult.html;
                    if (premiseResult.isInverted) {
                        conclusionIsValid = !conclusionIsValid;
                    }
                    [conclusionHTML, conclusionIsValid] = applyConclusionNegation(
                        conclusionHTML, conclusionIsValid, conclusionObj
                    );

                    usedConclusionTexts.add(conclusionHTML);

                    conclusionsArr.push({
                        conclusion: conclusionHTML,
                        isValid: conclusionIsValid,
                        startWord: sw,
                        endWord: ew,
                    });
                    generatedCount++;
                }

                const primary = conclusionsArr[0] ?? { conclusion: '', isValid: false };

                const totalTransforms = this.getNumTransformsSplit(length).reduce((a, b) => a + b, 0);
                let modifiers = [];
                if (totalTransforms > 0) {
                    modifiers.push(`op${totalTransforms}`);
                }

                return {
                    premises: premises.map((p, i) => createPremiseHTML(p, true, i)),
                    conclusion: primary.conclusion,
                    isValid: primary.isValid,
                    conclusions: conclusionsArr,
                    currentConclusionIndex: 0,
                    userAnswers: [],
                    plen: length,
                    type: "space-six-d",
                    category: "SPACE SIX D",
                    wordCoordMap: wordCoordMap,
                    modifiers,
                    operations,
                };
            },
            createAnalogy: function(length) {
                const dir4dGen = new Direction4D();
                const words = createStimuli(length + 1);
                const premises = [];
                const neighbors = {};

                const wordCoordMap4D = { [words[0]]: [0, 0, 0, 0] };
                let wordCoordMap = { [words[0]]: [0, 0, 0, 0, 0, 0] };

                for (let i = 0; i < length; i++) {
                    const baseWord = words[i];
                    const nextWord = words[i + 1];
                    const dirCoord4D = dir4dGen.pickDirection(baseWord, neighbors, wordCoordMap4D);
                    const dim5 = Math.floor(Math.random() * 3) - 1;
                    const dim6 = Math.floor(Math.random() * 3) - 1;
                    const dirCoord = [...dirCoord4D, dim5, dim6];

                    wordCoordMap4D[nextWord] = addCoords(wordCoordMap4D[baseWord], dirCoord4D);
                    wordCoordMap[nextWord] = addCoords(wordCoordMap[baseWord], dirCoord);

                    const premise = createMultiDimStatement(baseWord, nextWord, dirCoord, 6);
                    premises.push(premise);

                    neighbors[baseWord] = neighbors[baseWord] ?? [];
                    neighbors[baseWord].push(nextWord);
                    neighbors[nextWord] = neighbors[nextWord] ?? [];
                    neighbors[nextWord].push(baseWord);
                }

                // Transform support
                const [numInterleaved, numTransforms] = this.getNumTransformsSplit(length);
                let [a, b, c, d] = pickRandomItems(Object.keys(wordCoordMap), 4).picked;
                let operations = [];

                if (numTransforms > 0) {
                    const [startWord, endWord] = pickRandomItems([a, b, c, d], 2).picked;
                    const [diffCoord, conclusionCoord] = getConclusionCoords(wordCoordMap, startWord, endWord);
                    let _x;
                    [wordCoordMap, operations, _x] = new SpaceHardMode(numTransforms).basicHardMode(
                        wordCoordMap, startWord, endWord, conclusionCoord
                    );
                    if (numInterleaved > 0) {
                        premises.push(...operations);
                        operations = [];
                    }
                }

                const isValidSame = arraysEqual(
                    findDirection(wordCoordMap[a], wordCoordMap[b]),
                    findDirection(wordCoordMap[c], wordCoordMap[d])
                );

                let conclusion = analogyTo(a, b);
                let isValid;
                if (coinFlip()) {
                    conclusion += pickAnalogyStatementSame().html;
                    isValid = isValidSame;
                } else {
                    conclusion += pickAnalogyStatementDifferent().html;
                    isValid = !isValidSame;
                }
                conclusion += analogyTo(c, d);

                const totalTransforms = this.getNumTransformsSplit(length).reduce((a, b) => a + b, 0);
                let modifiers = [];
                if (totalTransforms > 0) {
                    modifiers.push(`op${totalTransforms}`);
                }

                return {
                    category: 'Analogy: SPACE SIX D',
                    type: 'space-six-d',
                    startedAt: new Date().getTime(),
                    bucket: Object.keys(wordCoordMap),
                    premises: premises.map((p, i) => createPremiseHTML(p, true, i)),
                    isValid,
                    conclusion,
                    modifiers,
                    operations,
                    wordCoordMap,
                };
            }
        },
        premiseCount: getPremisesFor('overrideMultiDim6DPremises', length),
        weight: savedata.overrideMultiDim6DWeight,
    };
}