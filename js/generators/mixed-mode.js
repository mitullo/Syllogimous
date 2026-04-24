// Mixed Mode Generator - combines multiple question types
// Example: Distinction + Direction (2D/3D/4D)
// If A is same as B, and A is north of C, then B is north of C

class MixedModeQuestion {
    constructor() {
        this.availableModes = this.getAvailableModes();
    }

    getAvailableModes() {
        const modes = [];
        if (savedata.enableDistinction) modes.push('distinction');
        if (savedata.enableDirection) modes.push('direction2D');
        if (savedata.enableDirection3D) modes.push('direction3D');
        if (savedata.enableDirection4D) modes.push('direction4D');
        if (savedata.enableAnchorSpace) modes.push('anchorSpace');
        if (savedata.enableAnchorSpaceV2) modes.push('anchorSpaceV2');
        if (savedata.enableMultiDim5D) modes.push('multiDim5D');
        if (savedata.enableMultiDim6D) modes.push('multiDim6D');
        return modes;
    }

    pickDirectionGenerator(mode) {
        switch(mode) {
            case 'direction2D': return new Direction2D();
            case 'direction3D': return new Direction3D();
            case 'direction4D': return new Direction4D();
            case 'anchorSpace': return new Direction2D(true, true);
            case 'anchorSpaceV2': return new AnchorSpaceV2();
            case 'multiDim5D': return new Direction4D();
            case 'multiDim6D': return new Direction4D();
            default: return new Direction2D();
        }
    }

    create(length) {
        // Need at least distinction + one other mode
        if (this.availableModes.length < 2) {
            return null;
        }

        // Pick which modes to mix (at least 2)
        const numModes = Math.min(this.availableModes.length, 2 + Math.floor(Math.random() * (this.availableModes.length - 1)));
        const shuffled = shuffle([...this.availableModes]);
        const selectedModes = shuffled.slice(0, Math.max(2, numModes));

        // Create shared stimuli
        const totalEntities = length + 2;
        const words = createStimuli(totalEntities);

        // Build mixed premise structure
        const allPremises = [];
        const equivalenceMap = new Map(); // word -> equivalent word (from distinction)
        const coordMap = {}; // word -> coordinates (for direction modes)
        const neighbors = {};

        // Initialize with first word
        const first = words[0];
        coordMap[first] = this.getInitialCoord(selectedModes);
        neighbors[first] = [];

        // Build equivalence groups using distinction
        let bucketMap = { [first]: 0 };
        let currentBucket = 0;

        // Track which words have which relations
        const wordRelations = new Map();
        for (const word of words) {
            wordRelations.set(word, []);
        }

        // Create mixed premises
        for (let i = 1; i < words.length; i++) {
            const target = words[i];
            const source = this.pickSourceWord(neighbors, words.slice(0, i));

            // Pick a relation type for this connection
            const relationType = this.pickRelationType(selectedModes, source, target, wordRelations);

            let premise;
            if (relationType === 'distinction') {
                // Create same/opposite premise
                if (coinFlip()) {
                    premise = createSamePremise(source, target);
                    bucketMap[target] = bucketMap[source];
                    equivalenceMap.set(target, source);
                } else {
                    premise = createOppositePremise(source, target);
                    bucketMap[target] = (bucketMap[source] + 1) % 2;
                }
            } else if (relationType.startsWith('direction') || relationType === 'anchorSpace' || relationType.startsWith('multiDim')) {
                // Create direction premise
                const generator = this.pickDirectionGenerator(relationType);
                if (!coordMap[source]) {
                    coordMap[source] = this.getInitialCoord([relationType]);
                }
                const dirCoord = this.pickDirectionCoord(relationType, source, neighbors, coordMap);
                coordMap[target] = addCoords(coordMap[source], dirCoord);
                if (relationType === 'multiDim5D') {
                    premise = createMultiDimStatement(source, target, dirCoord, 5);
                } else if (relationType === 'multiDim6D') {
                    premise = createMultiDimStatement(source, target, dirCoord, 6);
                } else {
                    premise = generator.createDirectionStatement(source, target, dirCoord);
                }
            }

            if (premise) {
                allPremises.push(premise);
                neighbors[source] = neighbors[source] || [];
                neighbors[target] = neighbors[target] || [];
                neighbors[source].push(target);
                neighbors[target].push(source);
                wordRelations.get(source).push({ type: relationType, target, premise });
                wordRelations.get(target).push({ type: relationType, target: source, premise });
            }
        }

// Generate conclusion that crosses type boundaries
        const { sameSets, bucketMap: dsuBucketMap } = this.buildParityDSU(words, allPremises);

        const [conclusion, isValid, mixedTypes] = this.createMixedConclusion(
            words, allPremises, coordMap, sameSets, dsuBucketMap, neighbors, selectedModes
        );

        if (!conclusion) {
            return null;
        }

        // Generate multiple conclusions if mode is enabled
        const numConclusions = (savedata.multipleConclusionsMode && savedata.numConclusions > 1)
            ? savedata.numConclusions
            : 1;

        const conclusionsArr = [];
        const usedConclusionTexts = new Set();

        // Primary conclusion
        conclusionsArr.push({
            conclusion,
            isValid,
        });
        usedConclusionTexts.add(conclusion);

        // Generate additional mixed conclusions
        let generatedCount = 1; // Start at 1 since primary is already added
        let attempts = 0;
        while (generatedCount < numConclusions) {
            const [addConclusion, addIsValid] = this.createMixedConclusion(
                words, allPremises, coordMap, sameSets, dsuBucketMap, neighbors, selectedModes
            );

            if (!addConclusion) {
                attempts++;
                if (attempts < 5) {
                    continue; // retry without incrementing generatedCount
                }
                // Max attempts reached, skip this conclusion
                generatedCount++; // Prevent infinite loop
                attempts = 0;
                continue;
            }

            attempts = 0; // Reset on success
            // Always add conclusion (may have duplicates if unique ones exhausted)
            usedConclusionTexts.add(addConclusion);

            conclusionsArr.push({
                conclusion: addConclusion,
                isValid: addIsValid,
            });
            generatedCount++;
        }

        // Format premises
        let formattedPremises = allPremises.map((p, i) => createPremiseHTML(p, true, i));

        if (savedata.enableMeta && !savedata.minimalMode && !savedata.widePremises) {
            formattedPremises = applyMeta(formattedPremises, p => 
                (p.html ?? p).match(/<span class="relation">(?:<span class="is-negated">)?(.*?)<\/span>/)[1]
            );
        }

        const countdown = this.getCountdown(selectedModes);
        const typeNames = selectedModes.map(m => this.getModeDisplayName(m)).join(' + ');

        // Build return object with data for explanations
        const result = {
            category: `Mixed: ${typeNames}`,
            type: 'mixed',
            startedAt: new Date().getTime(),
            isValid: conclusionsArr[0].isValid,
            premises: formattedPremises,
            conclusion: conclusionsArr[0].conclusion,
            conclusions: conclusionsArr,
            currentConclusionIndex: 0,
            userAnswers: [],
            mixedTypes,
            ...(savedata.widePremises && { plen: length }),
            ...(countdown && { countdown }),
        };

        // Add explanation data for direction modes - ensure only valid words have coordinates
        const hasDirection = selectedModes.some(m => m.startsWith('direction') || m === 'anchorSpace' || m.startsWith('multiDim'));
        if (hasDirection) {
            const fullCoordMap = {};
            for (const word of words) {
                if (coordMap[word]) {
                    // Word has its own coordinates from a direction premise - use them
                    fullCoordMap[word] = this.normalizeCoord(coordMap[word]);
                }
            }
            // Only look up coordinates from same-set members for words that don't have their own
            for (const word of words) {
                if (fullCoordMap[word]) continue; // Already has coordinates
                
                const same = sameSets[word] || [];
                for (const w of same) {
                    if (coordMap[w]) {
                        fullCoordMap[word] = this.normalizeCoord(coordMap[w]);
                        break;
                    }
                }
            }
            result.wordCoordMap = fullCoordMap;
        }

        // Add explanation data for distinction mode - ensure ALL words are in buckets
        if (selectedModes.includes('distinction')) {
            const buckets = [
                Object.keys(dsuBucketMap).filter(w => dsuBucketMap[w] === 0),
                Object.keys(dsuBucketMap).filter(w => dsuBucketMap[w] === 1)
            ];
            result.buckets = buckets;
            result.bucketMap = dsuBucketMap; // Store for reference
        }

        return result;
    }

    getInitialCoord(modes) {
        if (modes.includes('multiDim6D')) return [0, 0, 0, 0, 0, 0];
        if (modes.includes('multiDim5D')) return [0, 0, 0, 0, 0];
        if (modes.includes('direction4D')) return [0, 0, 0, 0];
        if (modes.includes('direction3D')) return [0, 0, 0];
        return [0, 0];
    }

    pickSourceWord(neighbors, availableWords) {
        // Pick a word that has room for more connections
        const candidates = availableWords.filter(w => (neighbors[w] || []).length < 3);
        if (candidates.length === 0) {
            return availableWords[Math.floor(Math.random() * availableWords.length)];
        }
        // Prefer words with fewer connections
        const weighted = candidates.flatMap(w => {
            const count = (neighbors[w] || []).length;
            const weight = Math.max(1, 4 - count);
            return Array(weight).fill(w);
        });
        return pickRandomItems(weighted, 1).picked[0];
    }

    pickRelationType(selectedModes, source, target, wordRelations) {
        // Pick a random mode from selected, but weight towards creating interesting mixtures
        const sourceRelations = wordRelations.get(source) || [];
        const hasDistinction = sourceRelations.some(r => r.type === 'distinction');
        const hasDirection = sourceRelations.some(r => r.type.startsWith('direction') || r.type === 'anchorSpace' || r.type.startsWith('multiDim'));

        // If source already has a relation type, prefer others to create mixtures
        let weights = selectedModes.map(mode => {
            if (mode === 'distinction' && !hasDistinction) return 2;
            if ((mode.startsWith('direction') || mode === 'anchorSpace' || mode.startsWith('multiDim')) && !hasDirection) return 2;
            return 1;
        });

        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        for (let i = 0; i < selectedModes.length; i++) {
            random -= weights[i];
            if (random <= 0) return selectedModes[i];
        }
        return selectedModes[0];
    }

    pickDirectionCoord(mode, baseWord, neighbors, coordMap) {
        const coords = coordMap[baseWord];
        if (!coords) {
            // Return a default direction based on mode
            if (mode === 'multiDim6D') return [0, 1, 0, 0, 0, 0];
            if (mode === 'multiDim5D') return [0, 1, 0, 0, 0];
            if (mode === 'direction3D') return [0, 1, 0];
            if (mode === 'direction4D') return [0, 1, 0, 0];
            return [0, 1];
        }

        let availableDirs;
        if (mode === 'multiDim6D' || mode === 'multiDim5D') {
            // For multi-dim modes, generate a 4D direction + extra dims
            const spatialDirs = dirCoords4D.filter(c => !arraysEqual(c, [0,0,0,0]));
            const spatial = spatialDirs[Math.floor(Math.random() * spatialDirs.length)];
            const extraDims = mode === 'multiDim6D' ? 2 : 1;
            const extra = Array.from({length: extraDims}, () => Math.floor(Math.random() * 3) - 1);
            return [...spatial, ...extra];
        } else if (mode === 'direction3D') {
            availableDirs = dirCoords3D.filter(c => !arraysEqual(c, [0,0,0]));
        } else if (mode === 'direction4D') {
            availableDirs = dirCoords4D.filter(c => !arraysEqual(c, [0,0,0,0]));
        } else {
            availableDirs = dirCoords.slice(1); // Exclude [0,0]
        }

        // Pick a direction that doesn't conflict with existing neighbors
        const existingTargets = (neighbors[baseWord] || [])
            .map(w => coordMap[w])
            .filter(c => c !== undefined);
        const validDirs = availableDirs.filter(dir => {
            const newCoord = addCoords(coords, dir);
            return !existingTargets.some(existing => arraysEqual(existing, newCoord));
        });

        if (validDirs.length === 0) return availableDirs[Math.floor(Math.random() * availableDirs.length)];
        return validDirs[Math.floor(Math.random() * validDirs.length)];
    }

    // Normalize a coordinate vector to its sign (-1,0,1) per axis
    normalizeCoord(coord) {
        if (!coord) return coord;
        return coord.map(c => (c > 0) ? 1 : (c < 0) ? -1 : 0);
    }

    // Build a parity-enabled DSU (union-find) from distinction premises and equivalenceMap
    // Returns a map: word -> [words that are the same as word] (parity 0 group)
buildParityDSU(words, premises) {
        const parent = {};
        const parity = {};

        const make = (x) => {
            if (parent[x] === undefined) {
                parent[x] = x;
                parity[x] = 0;
            }
        };

        const find = (x) => {
            make(x);
            if (parent[x] !== x) {
                const p = parent[x];
                const r = find(p);
                parity[x] ^= parity[p];
                parent[x] = r;
            }
            return parent[x];
        };

        const union = (a, b, rel) => { // rel: 0 = same, 1 = opposite
            make(a); make(b);
            const ra = find(a);
            const rb = find(b);
            if (ra === rb) return;
            parent[rb] = ra;
            parity[rb] = parity[a] ^ parity[b] ^ rel;
        };

        // initialize all words
        for (const w of words) make(w);

        // process explicit premises
        for (const p of premises) {
            if (!p || !p.relation) continue;
            // Handle both single-word and set premises
            const aList = p.startSet || (p.start ? [p.start] : []);
            const bList = p.endSet || (p.end ? [p.end] : []);
            if (aList.length === 0 || bList.length === 0) continue;
            if (p.relation === 'is same as' || p.relation === 'are same as' || p.reverse === 'is same as' || p.reverse === 'are same as' || p.relationMinimal === '=') {
                // Union all pairs between the two sets
                for (const a of aList) {
                    for (const b of bList) {
                        union(a, b, 0);
                    }
                }
            } else if (p.relation === 'is opposite of' || p.relation === 'are opposite of' || p.reverse === 'is opposite of' || p.reverse === 'are opposite of' || p.relationMinimal === '☍') {
                for (const a of aList) {
                    for (const b of bList) {
                        union(a, b, 1);
                    }
                }
            }
        }

        // finalize roots and collect groups
        for (const k in parent) find(k);
        
        const sameSets = {};
        const bucketMap = {};
        
        for (const w of words) {
            bucketMap[w] = parity[w];
        }

        for (const w of words) {
            sameSets[w] = words.filter(x => parent[x] === parent[w] && parity[x] === parity[w]);
        }

        return { sameSets, bucketMap };
    }

createMixedConclusion(words, premises, coordMap, sameSets, bucketMap, neighbors, selectedModes) {
        const hasDistinction = selectedModes.includes('distinction');
        const hasDirection = selectedModes.some(m => m.startsWith('direction') || m === 'anchorSpace' || m.startsWith('multiDim'));

        if (hasDistinction && hasDirection) {
            const components = [];
            const visited = new Set();
            for (const w of words) {
                if (!visited.has(w)) {
                    const comp = sameSets[w] || [w];
                    if (comp.length > 1) components.push(comp);
                    for (const member of comp) visited.add(member);
                }
            }

            // Find a directional premise that references a member of an equivalence component
            for (const comp of components) {
                for (const original of comp) {
                    const originalDirs = premises.filter(p => p.relation && p.relation.includes('of') && (
                        p.start === original || p.end === original ||
                        (p.startSet && p.startSet.includes(original)) ||
                        (p.endSet && p.endSet.includes(original))
                    ));
                    if (originalDirs.length === 0) continue;
                    for (const dirPremise of originalDirs) {
                        const replacements = comp.filter(x => x !== original);
                        if (replacements.length === 0) continue;
                        const equivWord = pickRandomItems(replacements, 1).picked[0];
                        // Determine which side of the premise contains the original word
                        const originalIsStart = dirPremise.start === original || (dirPremise.startSet && dirPremise.startSet.includes(original));
                        const otherWord = originalIsStart ? (dirPremise.end || (dirPremise.endSet ? dirPremise.endSet[0] : null)) : (dirPremise.start || (dirPremise.startSet ? dirPremise.startSet[0] : null));
                        if (!otherWord) continue;
                        const relation = dirPremise.relation;
                        const reverse = dirPremise.reverse;
                        const relationMin = dirPremise.relationMinimal;
                        const reverseMin = dirPremise.reverseMinimal;

                        if (coinFlip()) {
                            // Valid: preserve relation text but place start/end appropriately
                            const conclusionObj = originalIsStart
                                ? { start: equivWord, end: otherWord, relation, reverse, relationMinimal: relationMin, reverseMinimal: reverseMin }
                                : { start: otherWord, end: equivWord, relation, reverse, relationMinimal: relationMin, reverseMinimal: reverseMin };
                            const premiseResult = createPremiseHTML(conclusionObj, true, 0);
                            let conclusion = premiseResult.html;
                            let isValid = true;
                            const wasInvertedByPremiseHTML = premiseResult.isInverted;
                            if (wasInvertedByPremiseHTML) {
                                isValid = !isValid;
                            }
                            const [finalConclusion, finalIsValid] = this.applyConclusionNegation(conclusion, isValid, conclusionObj, wasInvertedByPremiseHTML);
                            return [finalConclusion, finalIsValid, ['distinction', 'direction']];
                        } else {
                            // Invalid: Generate a proper incorrect coordinate using the correct space generator
                            const startNode = dirPremise.start;
                            const endNode = dirPremise.end;
                            
                            // Safety check: ensure both nodes have coordinates
                            if (!coordMap[startNode] || !coordMap[endNode]) {
                                // Can't generate a valid mixed conclusion without coordinates
                                // Skip this premise and let the code fall through to simple distinction
                                continue;
                            }
                            
                            // Find the actual vector from endNode to startNode
                            const vec = diffCoords(coordMap[endNode], coordMap[startNode]);
                            const actualCoord = this.normalizeCoord(vec);
                            
                            // If both nodes are at the same position, we can't create a direction conclusion
                            if (actualCoord.every(d => d === 0)) {
                                // Can't generate a valid mixed conclusion - skip and fall through to simple distinction
                                continue;
                            }
                            
                            let generator;
                            if (actualCoord.length === 4) generator = new Direction4D();
                            else if (actualCoord.length === 3) generator = new Direction3D();
                            else generator = new Direction2D();
                            
                            let availableDirs = dirCoords.slice(1);
                            if (actualCoord.length === 4) availableDirs = dirCoords4D.filter(c => !arraysEqual(c, [0,0,0,0]));
                            else if (actualCoord.length === 3) availableDirs = dirCoords3D.filter(c => !arraysEqual(c, [0,0,0]));
                            
                            // Pick a wrong coord
                            let wrongCoord;
                            const avoidOpposite = savedata.enableHarderConclusions;
                            const oppositeCoord = actualCoord.map(x => -x);
                            
                            if (avoidOpposite) {
                                const validWrongDirs = availableDirs.filter(c => !arraysEqual(c, actualCoord) && !arraysEqual(c, oppositeCoord));
                                wrongCoord = validWrongDirs.length > 0 
                                    ? validWrongDirs[Math.floor(Math.random() * validWrongDirs.length)] 
                                    : oppositeCoord; // fallback
                            } else {
                                const validWrongDirs = availableDirs.filter(c => !arraysEqual(c, actualCoord));
                                wrongCoord = validWrongDirs[Math.floor(Math.random() * validWrongDirs.length)];
                            }
                            
                            const newStartNode = originalIsStart ? equivWord : (dirPremise.start || dirPremise.startSet?.[0]);
                            const newEndNode = !originalIsStart ? equivWord : (dirPremise.end || dirPremise.endSet?.[0]);
                            
                            const conclusionObj = generator.createDirectionStatement(newEndNode, newStartNode, wrongCoord);
                            const premiseResult = createPremiseHTML(conclusionObj, true, 0);
                            let conclusion = premiseResult.html;
                            let isValid = false;
                            const wasInvertedByPremiseHTML = premiseResult.isInverted;
                            if (wasInvertedByPremiseHTML) {
                                isValid = !isValid;
                            }
                            const [finalConclusion, finalIsValid] = this.applyConclusionNegation(conclusion, isValid, conclusionObj, wasInvertedByPremiseHTML);
                            return [finalConclusion, finalIsValid, ['distinction', 'direction']];
                        }
                    }
                }
            }
        }

        if (hasDistinction) {
            // Simple distinction conclusion
            const [a, b] = pickRandomItems(words, 2).picked;
            const sameBucket = bucketMap[a] === bucketMap[b];
            if (coinFlip()) {
                const conclusionObj = createSamePremise(a, b);
                const premiseResult = createPremiseHTML(conclusionObj, true, 0);
                let conclusion = premiseResult.html;
                let isValid = sameBucket;
                const wasInvertedByPremiseHTML = premiseResult.isInverted;
                if (wasInvertedByPremiseHTML) {
                    isValid = !isValid;
                }
                const [finalConclusion, finalIsValid] = this.applyConclusionNegation(conclusion, isValid, conclusionObj, wasInvertedByPremiseHTML);
                return [finalConclusion, finalIsValid, ['distinction']];
            } else {
                const conclusionObj = createOppositePremise(a, b);
                const premiseResult = createPremiseHTML(conclusionObj, true, 0);
                let conclusion = premiseResult.html;
                let isValid = !sameBucket;
                const wasInvertedByPremiseHTML = premiseResult.isInverted;
                if (wasInvertedByPremiseHTML) {
                    isValid = !isValid;
                }
                const [finalConclusion, finalIsValid] = this.applyConclusionNegation(conclusion, isValid, conclusionObj, wasInvertedByPremiseHTML);
                return [finalConclusion, finalIsValid, ['distinction']];
            }
        }

        if (hasDirection) {
            // Simple direction conclusion
            const validCoords = words.filter(w => coordMap[w]);
            if (validCoords.length >= 2) {
                const [a, b] = pickRandomItems(validCoords, 2).picked;
                const rawDir = findDirection(coordMap[a], coordMap[b]);
                if (!rawDir) return [null, false, []];
                const actualCoord = this.normalizeCoord(rawDir);

                let generator;
                if (actualCoord.length === 4) generator = new Direction4D();
                else if (actualCoord.length === 3) generator = new Direction3D();
                else generator = new Direction2D();

                if (coinFlip()) {
                    const conclusionObj = generator.createDirectionStatement(a, b, actualCoord);
                    const premiseResult = createPremiseHTML(conclusionObj, true, 0);
                    let conclusion = premiseResult.html;
                    let isValid = true;
                    const wasInvertedByPremiseHTML = premiseResult.isInverted;
                    if (wasInvertedByPremiseHTML) {
                        isValid = !isValid;
                    }
                    const [finalConclusion, finalIsValid] = this.applyConclusionNegation(conclusion, isValid, conclusionObj, wasInvertedByPremiseHTML);
                    return [finalConclusion, finalIsValid, ['direction']];
                } else {
                    let availableDirs = dirCoords.slice(1);
                    if (actualCoord.length === 4) availableDirs = dirCoords4D.filter(c => !arraysEqual(c, [0,0,0,0]));
                    else if (actualCoord.length === 3) availableDirs = dirCoords3D.filter(c => !arraysEqual(c, [0,0,0]));

                    const wrongCoord = availableDirs[Math.floor(Math.random() * availableDirs.length)];
                    const conclusionObj = generator.createDirectionStatement(a, b, wrongCoord);
                    const premiseResult = createPremiseHTML(conclusionObj, true, 0);
                    let conclusion = premiseResult.html;
                    let isValid = false;
                    const wasInvertedByPremiseHTML = premiseResult.isInverted;
                    if (wasInvertedByPremiseHTML) {
                        isValid = !isValid;
                    }
                    const [finalConclusion, finalIsValid] = this.applyConclusionNegation(conclusion, isValid, conclusionObj, wasInvertedByPremiseHTML);
                    return [finalConclusion, finalIsValid, ['direction']];
                }
            }
        }

        return [null, false, []];
    }

// Apply conclusion negation if enabled - wraps the conclusion in a "Not" form
    // and flips the validity. This is actual negation, not inversion.
    // alreadyNegated: if true, don't flip validity again (prevents double-negation)
    applyConclusionNegation(conclusion, isValid, premiseObj, alreadyNegated=false) {
        if (!savedata.enableConclusionNegation || !conclusion) {
            return [conclusion, isValid];
        }

        // Use frequency setting (default 50%)
        const freq = savedata.conclusionNegationFrequency || 50;
        if (Math.random() * 100 < freq) {
            const negatedConclusion = createNegatedConclusionHTML(premiseObj, false);
            // Negation flips the validity - "A is Not west of B" is true when "A is west of B" is false
            // But if already negated by pickNegatable, don't flip again
            return [negatedConclusion, alreadyNegated ? isValid : !isValid];
        }

        return [conclusion, isValid];
    }

    oppositeDirection(dir) {
        const opposites = {
            'North': 'South',
            'South': 'North',
            'East': 'West',
            'West': 'East',
            'North-East': 'South-West',
            'South-West': 'North-East',
            'North-West': 'South-East',
            'South-East': 'North-West',
            'Above': 'Below',
            'Below': 'Above'
        };
        if (opposites[dir]) return opposites[dir];
        if (typeof nameInverseDir !== 'undefined' && nameInverseDir[dir]) return nameInverseDir[dir];
        if (typeof nameInverseDir !== 'undefined') {
            for (const k in nameInverseDir) {
                if (k.toLowerCase() === String(dir).toLowerCase()) return nameInverseDir[k];
            }
        }
        return dir;
    }

    getModeDisplayName(mode) {
        const names = {
            'distinction': 'Distinction',
            'direction2D': '2D',
            'direction3D': '3D',
            'direction4D': '4D',
            'anchorSpace': 'Anchor',
            'anchorSpaceV2': 'AnchorV2',
            'multiDim5D': '5D',
            'multiDim6D': '6D',
        };
        return names[mode] || mode;
    }

    getCountdown(modes) {
        // Return the countdown from the first direction mode, or null
        for (const mode of modes) {
            if (mode === 'direction2D') return savedata.overrideDirectionTime;
            if (mode === 'direction3D') return savedata.overrideDirection3DTime;
            if (mode === 'direction4D') return savedata.overrideDirection4DTime;
            if (mode === 'anchorSpace') return savedata.overrideAnchorSpaceTime;
            if (mode === 'anchorSpaceV2') return savedata.overrideAnchorSpaceV2Time;
            if (mode === 'multiDim5D') return savedata.overrideMultiDim5DTime;
            if (mode === 'multiDim6D') return savedata.overrideMultiDim6DTime;
        }
        return savedata.overrideDistinctionTime;
    }
}

function createMixedModeGenerator(length) {
    return {
        question: new MixedModeQuestion(),
        premiseCount: length,
        weight: 100,
    };
}
