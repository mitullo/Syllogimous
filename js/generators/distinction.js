function createSamePremise(a, b) {
    return {
        start: a,
        end: b,
        relation: 'is same as',
        reverse: 'is same as', // Fixed: Same is symmetric
        relationMinimal: '=',
        reverseMinimal: '=', // Fixed
    }
}

function createOppositePremise(a, b) {
    return {
        start: a,
        end: b,
        relation: 'is opposite of',
        reverse: 'is opposite of', // Fixed: Opposite is symmetric
        relationMinimal: '☍',
        reverseMinimal: '☍', // Fixed
    }
}

function createSameSetPremise(startSet, endSet) {
    const hasPlural = startSet.length > 1 || endSet.length > 1;
    const rel = hasPlural ? 'are same as' : 'is same as';
    return {
        startSet: startSet,
        endSet: endSet,
        relation: rel,
        reverse: rel,
        relationMinimal: '=',
        reverseMinimal: '=',
    }
}

function createOppositeSetPremise(startSet, endSet) {
    const hasPlural = startSet.length > 1 || endSet.length > 1;
    const rel = hasPlural ? 'are opposite of' : 'is opposite of';
    return {
        startSet: startSet,
        endSet: endSet,
        relation: rel,
        reverse: rel,
        relationMinimal: '☍',
        reverseMinimal: '☍',
    }
}

class DistinctionQuestion {
    generate(length, transforms = {}) {
        length++;

        // When stimulus sets are enabled, we need more words per premise
        const useStimSets = savedata.enableStimulusSets && savedata.stimulusSetSize >= 2;
        const setSize = useStimSets ? savedata.stimulusSetSize : 1;
        const extraWords = useStimSets ? ((length - 1) * (2 * setSize - 2)) : 0;
        const words = createStimuli(length + extraWords, transforms);

        let premiseMap = {};
        let first = words[0];
        let bucketMap = { [first]: 0 };
        let neighbors = { [first]: [] };

        const chanceOfBranching = {
            5: 0.60,
            6: 0.55,
            7: 0.50,
            8: 0.45,
            9: 0.40,
            10: 0.35,
        }[words.length] ?? (words.length > 10 ? 0.3 : 0.6);

        if (useStimSets) {
            // Stimulus set mode: both sides of each premise have setSize words
            // Each premise needs (setSize-1) source companions + setSize targets = 2*setSize-1 new words
            const wordsPerPremise = 2 * setSize - 1;
            let wordIndex = 1;
            while (wordIndex + wordsPerPremise - 1 < words.length) {
                const source = pickBaseWord(neighbors, Math.random() < chanceOfBranching);
                // Source companions: setSize-1 new words sharing source's bucket
                const sourceCompanions = words.slice(wordIndex, wordIndex + (setSize - 1));
                wordIndex += sourceCompanions.length;
                // Target set: setSize new words
                const targetSet = words.slice(wordIndex, wordIndex + setSize);
                wordIndex += targetSet.length;

                if (targetSet.length < setSize) continue; // Skip partial sets

                const sourceSet = [source, ...sourceCompanions];
                // Source companions share source's bucket
                for (const sc of sourceCompanions) {
                    bucketMap[sc] = bucketMap[source];
                }

                let setPremise;
                if (coinFlip()) {
                    setPremise = createSameSetPremise(sourceSet, targetSet);
                    for (const t of targetSet) {
                        bucketMap[t] = bucketMap[source];
                    }
                } else {
                    setPremise = createOppositeSetPremise(sourceSet, targetSet);
                    for (const t of targetSet) {
                        bucketMap[t] = (bucketMap[source] + 1) % 2;
                    }
                }
                // Store under each word pair key so orderPremises can find the premise
                for (const s of sourceSet) {
                    for (const t of targetSet) {
                        premiseMap[premiseKey(s, t)] = setPremise;
                    }
                }

                neighbors[source] = neighbors?.[source] ?? [];
                // Connect source companions to source and each other
                for (const sc of sourceCompanions) {
                    neighbors[sc] = neighbors?.[sc] ?? [];
                    neighbors[sc].push(source);
                    neighbors[source].push(sc);
                }
                // Connect targets to source and source companions
                for (const t of targetSet) {
                    neighbors[t] = neighbors?.[t] ?? [];
                    neighbors[t].push(source);
                    neighbors[source].push(t);
                    for (const sc of sourceCompanions) {
                        neighbors[t].push(sc);
                        neighbors[sc].push(t);
                    }
                }
            }
        } else {
            for (let i = 1; i < words.length; i++) {
                const source = pickBaseWord(neighbors, Math.random() < chanceOfBranching);
                const target = words[i];

                const key = premiseKey(source, target);
                if (coinFlip()) {
                    premiseMap[key] = createSamePremise(source, target);
                    bucketMap[target] = bucketMap[source];
                } else {
                    premiseMap[key] = createOppositePremise(source, target);
                    bucketMap[target] = (bucketMap[source] + 1) % 2;
                }

                neighbors[source] = neighbors?.[source] ?? [];
                neighbors[target] = neighbors?.[target] ?? [];
                neighbors[target].push(source);
                neighbors[source].push(target);
            }
        }

        let premises = orderPremises(premiseMap, neighbors);
        if (savedata.widePremises) {
            premises = createWidePremises(premises, premiseMap);
        }

        let buckets = [
            Object.keys(bucketMap).filter(w => bucketMap[w] === 0),
            Object.keys(bucketMap).filter(w => bucketMap[w] === 1)
        ]

        premises = scramble(premises);
        premises = premises.map((p, i) => createPremiseHTML(p, false, i));

        if (savedata.enableMeta && !savedata.minimalMode && !savedata.widePremises) {
            premises = applyMeta(premises, p => (p.html ?? p).match(/<span class="relation">(?:<span class="is-negated">)?(.*?)<\/span>/)[1]);
        }

        this.premises = premises;
        this.buckets = buckets;
        this.neighbors = neighbors;
        this.bucketMap = bucketMap;
    }

    createAnalogy(length) {
        this.generate(length);
        const [a, b, c, d] = pickRandomItems([...this.buckets[0], ...this.buckets[1]], 4).picked;

        const [
            indexOfA,
            indexOfB,
            indexOfC,
            indexOfD
        ] = [
            Number(this.buckets[0].indexOf(a) !== -1),
            Number(this.buckets[0].indexOf(b) !== -1),
            Number(this.buckets[0].indexOf(c) !== -1),
            Number(this.buckets[0].indexOf(d) !== -1)
        ];
        const isValidSame = indexOfA === indexOfB && indexOfC === indexOfD
                   || indexOfA !== indexOfB && indexOfC !== indexOfD;

        let conclusion = analogyTo(a, b);
        let isValid;
        if (coinFlip()) {
            conclusion += pickAnalogyStatementSameTwoOptions().html;
            isValid = isValidSame;
        } else {
            conclusion += pickAnalogyStatementDifferentTwoOptions().html;
            isValid = !isValidSame;
        }
        conclusion += analogyTo(c, d);
        const countdown = this.getCountdown();

        return {
            category: "Analogy: Distinction",
            type: "distinction",
            startedAt: new Date().getTime(),
            buckets: this.buckets,
            bucket: [...this.buckets[0], ...this.buckets[1]],
            premises: this.premises,
            ...(savedata.widePremises && { plen: length }),
            isValid,
            conclusion,
            ...(countdown && { countdown }),
        };
    }

    create(length, transforms = {}) {
        this.generate(length, transforms);

        // Generate multiple conclusions if mode is enabled
        const numConclusions = (savedata.multipleConclusionsMode && savedata.numConclusions > 1)
            ? savedata.numConclusions
            : 1;

        const conclusionsArr = [];
        const usedConclusionTexts = new Set();
        const usedPairKeys = new Set();
        const pairChooser = new DirectionPairChooser();

        let generatedCount = 0;
        // Always run to completion - use fallback for pairs when unique ones exhausted
        while (generatedCount < numConclusions) {
            const [startWord, endWord] = getUniquePairOrFallback(this.neighbors, pairChooser, usedPairKeys);

            if (!startWord || !endWord) {
                generatedCount++; // Prevent infinite loop
                continue;
            }

            let conclusionObj;
            let conclusionIsValid;
            if (coinFlip()) {
                conclusionObj = createSamePremise(startWord, endWord);
                conclusionIsValid = this.bucketMap[startWord] === this.bucketMap[endWord];
            } else {
                conclusionObj = createOppositePremise(startWord, endWord);
                conclusionIsValid = this.bucketMap[startWord] !== this.bucketMap[endWord];
            }
            const premiseResult = createPremiseHTML(conclusionObj, true, 0);
            let conclusionHTML = premiseResult.html;
            const wasInvertedByPremiseHTML = premiseResult.isInverted;
            if (wasInvertedByPremiseHTML) {
                conclusionIsValid = !conclusionIsValid;
            }
            [conclusionHTML, conclusionIsValid] = applyConclusionNegation(conclusionHTML, conclusionIsValid, conclusionObj, null, wasInvertedByPremiseHTML);

            // Always add conclusion (may have duplicates if unique ones exhausted)
            usedConclusionTexts.add(conclusionHTML);

            conclusionsArr.push({
                conclusion: conclusionHTML,
                isValid: conclusionIsValid,
                startWord,
                endWord,
            });
            generatedCount++;
        }

        // Primary conclusion for backward compatibility
        const primary = conclusionsArr[0] ?? { conclusion: '', isValid: false };
        this.conclusion = primary.conclusion;
        this.isValid = primary.isValid;

        const countdown = this.getCountdown();
        return {
            category: "Distinction",
            type: "distinction",
            startedAt: new Date().getTime(),
            buckets: this.buckets,
            premises: this.premises,
            isValid: this.isValid,
            conclusion: this.conclusion,
            conclusions: conclusionsArr,
            currentConclusionIndex: 0,
            userAnswers: [],
            ...(savedata.widePremises && { plen: length }),
            ...(countdown && { countdown }),
        };
    }
    
    getCountdown() {
        return savedata.overrideDistinctionTime;
    }
}

function createDistinctionGenerator(length) {
    return {
        question: new DistinctionQuestion(),
        premiseCount: getPremisesFor('overrideDistinctionPremises', length),
        weight: savedata.overrideDistinctionWeight,
    };
}
