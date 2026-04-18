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
            create: function(length) {
                const dir4dGen = new Direction4D();
                const words = createStimuli(length + 1);
                const premises = [];
                const neighbors = {};
                
                // Maintain a 4D map for the pathfinder to prevent distance calculation crashes, 
                // and a true 5D map for the logic.
                const wordCoordMap4D = { [words[0]]: [0, 0, 0, 0] };
                const wordCoordMap = { [words[0]]: [0, 0, 0, 0, 0] };
                
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
                    premises.push(premise);
                    
                    neighbors[baseWord] = neighbors[baseWord] ?? [];
neighbors[baseWord].push(nextWord);
neighbors[nextWord] = neighbors[nextWord] ?? [];
neighbors[nextWord].push(baseWord);
                }

                const pairChooser = new DirectionPairChooser();
const pairResult = pairChooser.pickTwoDistantWords(neighbors);
const [startWord, endWord] = pairResult ?? [words[0], words[length]];

const diffCoord = subCoords(wordCoordMap[startWord], wordCoordMap[endWord]);
const normalizedDiff = diffCoord.map(c => c === 0 ? 0 : (c > 0 ? 1 : -1));
                
                let isValid = coinFlip();
                let conclusionObj;

                if (isValid) {
                    conclusionObj = createMultiDimStatement(startWord, endWord, normalizedDiff, 5);
                } else {
                    const wrongCoord = [...normalizedDiff];
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
                    conclusionObj = createMultiDimStatement(startWord, endWord, wrongCoord, 5);
                }

                let conclusion = createPremiseHTML(conclusionObj, true, length);
                [conclusion, isValid] = applyConclusionNegation(conclusion, isValid, conclusionObj);

                return {
                    premises: premises.map((p, i) => createPremiseHTML(p, true, i)),
                    conclusion: conclusion,
                    isValid: isValid,
                    plen: length,
                    type: "space-five-d",
                    category: "SPACE FIVE D",
                    wordCoordMap: wordCoordMap,
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
            create: function(length) {
                const dir4dGen = new Direction4D();
                const words = createStimuli(length + 1);
                const premises = [];
                const neighbors = {};
                
                const wordCoordMap4D = { [words[0]]: [0, 0, 0, 0] };
                const wordCoordMap = { [words[0]]: [0, 0, 0, 0, 0, 0] };
                
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

                const pairChooser = new DirectionPairChooser();
const pairResult = pairChooser.pickTwoDistantWords(neighbors);
const [startWord, endWord] = pairResult ?? [words[0], words[length]];

const diffCoord = subCoords(wordCoordMap[startWord], wordCoordMap[endWord]);
const normalizedDiff = diffCoord.map(c => c === 0 ? 0 : (c > 0 ? 1 : -1));
                
                let isValid = coinFlip();
                let conclusionObj;

                if (isValid) {
                    conclusionObj = createMultiDimStatement(startWord, endWord, normalizedDiff, 6);
                } else {
                    const wrongCoord = [...normalizedDiff];
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
                    conclusionObj = createMultiDimStatement(startWord, endWord, wrongCoord, 6);
                }

                let conclusion = createPremiseHTML(conclusionObj, true, length);
                [conclusion, isValid] = applyConclusionNegation(conclusion, isValid, conclusionObj);

                return {
                    premises: premises.map((p, i) => createPremiseHTML(p, true, i)),
                    conclusion: conclusion,
                    isValid: isValid,
                    plen: length,
                    type: "space-six-d",
                    category: "SPACE SIX D",
                    wordCoordMap: wordCoordMap,
                };
            }
        },
        premiseCount: getPremisesFor('overrideMultiDim6DPremises', length),
        weight: savedata.overrideMultiDim6DWeight,
    };
}