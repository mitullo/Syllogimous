// Multi-Dimensional RRT Generator
// Adds simultaneous relation layers: time (was/is), quantity (more/less), membership (contains/within)
// on top of spatial relations

function subCoords(a, b) {
    return b.map((c, i) => c - a[i]);
}

// Layer definitions
const temporalLayers = [
    { name: 'was before', reverse: 'will be after', minimal: '←t', reverseMinimal: 't→' },
    { name: 'is simultaneous with', reverse: 'is simultaneous with', minimal: '=t', reverseMinimal: '=t' },
    { name: 'will be after', reverse: 'was before', minimal: 't→', reverseMinimal: '←t' },
];

const quantityLayers = [
    { name: 'has more than', reverse: 'has less than', minimal: '>', reverseMinimal: '<' },
    { name: 'has equal to', reverse: 'has equal to', minimal: '=q', reverseMinimal: '=q' },
    { name: 'has less than', reverse: 'has more than', minimal: '<', reverseMinimal: '>' },
];

const membershipLayers = [
    { name: 'contains', reverse: 'is within', minimal: '⊃', reverseMinimal: '⊂' },
    { name: 'is separate from', reverse: 'is separate from', minimal: '≠m', reverseMinimal: '≠m' },
    { name: 'is within', reverse: 'contains', minimal: '⊂', reverseMinimal: '⊃' },
];

// Helper to create spatial-only direction statement (extracted from dirCoord[0..2])
function createSpatialStatement(a, b, dirCoord) {
    const spatialCoord = dirCoord.slice(0, 3);
    const direction = dirStringFromCoord(spatialCoord);
    const reverseDirection = dirStringFromCoord(inverse(spatialCoord));
    return {
        start: a,
        end: b,
        relation: `is ${direction} of`,
        reverse: `is ${reverseDirection} of`,
        relationMinimal: dirStringMinimal(spatialCoord),
        reverseMinimal: dirStringMinimal(inverse(spatialCoord)),
    };
}

// Create a multi-dimensional premise combining spatial and additional layers
function createMultiDimStatement(a, b, dirCoord, dimensions) {
    // Create spatial-only statement (don't use Direction4D's which includes time)
    const spatialStmt = createSpatialStatement(a, b, dirCoord);
    
    // Add additional layers based on dimension count
    let layers = [spatialStmt];
    let layerMinimals = [
        savedata.minimalMode ? spatialStmt.relationMinimal : spatialStmt.relation
    ];

    // 5D: Add temporal layer
    if (dimensions >= 5) {
        const temporal = temporalLayers[Math.floor(Math.random() * temporalLayers.length)];
        layers.push(temporal);
        layerMinimals.push(savedata.minimalMode ? temporal.minimal : temporal.name);
    }

    // 6D: Add quantity layer
    if (dimensions >= 6) {
        const quantity = quantityLayers[Math.floor(Math.random() * quantityLayers.length)];
        layers.push(quantity);
        layerMinimals.push(savedata.minimalMode ? quantity.minimal : quantity.name);
    }

    // 7D: Add membership layer
    if (dimensions >= 7) {
        const membership = membershipLayers[Math.floor(Math.random() * membershipLayers.length)];
        layers.push(membership);
        layerMinimals.push(savedata.minimalMode ? membership.minimal : membership.name);
    }

    // Combine all layers into a single relation
    if (savedata.minimalMode) {
        return {
            start: a,
            end: b,
            relation: layerMinimals.join(' '),
            reverse: layerMinimals.slice().reverse().join(' '),
            relationMinimal: layerMinimals.join(' '),
            reverseMinimal: layerMinimals.slice().reverse().join(' '),
        };
    } else {
        // Build relation text (just the relation, no words - HTML adds start/end)
        const fullRelations = layers.map((layer, i) => {
            if (i === 0) {
                // Spatial layer: already has "is X of" format
                return layer.relation;
            }
            // Additional layers: just the layer name
            return layer.name;
        });
        
        // Build reverse relation
        const reverseRelations = layers.map((layer, i) => {
            if (i === 0) {
                return layer.reverse;
            }
            return layer.reverse;
        });
        
        return {
            start: a,
            end: b,
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
                const wordCoordMap = { [words[0]]: [0, 0, 0, 0] };
                
                for (let i = 0; i < length; i++) {
                    const baseWord = words[i];
                    const nextWord = words[i + 1];
                    const dirCoord = dir4dGen.pickDirection(baseWord, neighbors, wordCoordMap);
                    wordCoordMap[nextWord] = addCoords(wordCoordMap[baseWord], dirCoord);
                    
                    const premise = createMultiDimStatement(baseWord, nextWord, dirCoord, 5);
                    premises.push(premise);
                    
                    neighbors[baseWord] = neighbors[baseWord] ?? [];
                    neighbors[baseWord].push(nextWord);
                }

                const startIdx = Math.floor(Math.random() * (length - 1));
                const endIdx = startIdx + 1 + Math.floor(Math.random() * (length - startIdx - 1));
                const startWord = words[startIdx];
                const endWord = words[endIdx];
                const diffCoord = subCoords(wordCoordMap[endWord], wordCoordMap[startWord]);
                
                // Normalize diffCoord to direction vector (like Direction4D does)
                const normalizedDiff = diffCoord.map(c => c === 0 ? 0 : (c > 0 ? 1 : -1));
                
                let isValid = coinFlip();
                let conclusionObj;

                if (isValid) {
                    conclusionObj = createMultiDimStatement(startWord, endWord, normalizedDiff, 5);
                } else {
                    const wrongCoord = [...normalizedDiff];
                    
                    // Check for interference (sophisticated false conclusion)
                    const interferenceLevel = savedata.space5DInterference || 0;
                    if (interferenceLevel > 0 && Math.random() * 100 < interferenceLevel) {
                        // Keep spatial dimensions correct, only change time dimension
                        const currentTime = wrongCoord[3];
                        const timeOptions = [-1, 0, 1].filter(t => t !== currentTime);
                        wrongCoord[3] = timeOptions[Math.floor(Math.random() * timeOptions.length)];
                    } else {
                        const axisToChange = Math.floor(Math.random() * 4);
                        wrongCoord[axisToChange] += Math.random() < 0.5 ? 1 : -1;
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
                const wordCoordMap = { [words[0]]: [0, 0, 0, 0] };
                
                for (let i = 0; i < length; i++) {
                    const baseWord = words[i];
                    const nextWord = words[i + 1];
                    const dirCoord = dir4dGen.pickDirection(baseWord, neighbors, wordCoordMap);
                    wordCoordMap[nextWord] = addCoords(wordCoordMap[baseWord], dirCoord);
                    
                    const premise = createMultiDimStatement(baseWord, nextWord, dirCoord, 6);
                    premises.push(premise);
                    
                    neighbors[baseWord] = neighbors[baseWord] ?? [];
                    neighbors[baseWord].push(nextWord);
                }

                const startIdx = Math.floor(Math.random() * (length - 1));
                const endIdx = startIdx + 1 + Math.floor(Math.random() * (length - startIdx - 1));
                const startWord = words[startIdx];
                const endWord = words[endIdx];
                const diffCoord = subCoords(wordCoordMap[endWord], wordCoordMap[startWord]);
                
                // Normalize diffCoord to direction vector
                const normalizedDiff = diffCoord.map(c => c === 0 ? 0 : (c > 0 ? 1 : -1));
                
                let isValid = coinFlip();
                let conclusionObj;

                if (isValid) {
                    conclusionObj = createMultiDimStatement(startWord, endWord, normalizedDiff, 6);
                } else {
                    const wrongCoord = [...normalizedDiff];
                    
                    // Check for interference (sophisticated false conclusion)
                    const interferenceLevel = savedata.space6DInterference || 0;
                    if (interferenceLevel > 0 && Math.random() * 100 < interferenceLevel) {
                        // Keep spatial dimensions correct, only change time dimension
                        const currentTime = wrongCoord[3];
                        const timeOptions = [-1, 0, 1].filter(t => t !== currentTime);
                        wrongCoord[3] = timeOptions[Math.floor(Math.random() * timeOptions.length)];
                    } else {
                        const axisToChange = Math.floor(Math.random() * 4);
                        wrongCoord[axisToChange] += Math.random() < 0.5 ? 1 : -1;
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
