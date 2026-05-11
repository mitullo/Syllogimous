function extractAnalogySubjects(conclusion) {
    return [...conclusion.matchAll(/<span\s+class="subject"[^>]*>(.*?)<\/span>/g)].map(match => match[1]);
}

function analogySubjectSpan(subject, isInverted = false) {
    const invertedStyle = isInverted ? ' style="color: #e84057;"' : '';
    return `<span class="subject"${invertedStyle}>${subject}</span>`;
}

function analogyToStyled(a, b, isInverted = false) {
    if (!isInverted) return analogyTo(a, b);
    return `${analogySubjectSpan(a, true)} to ${analogySubjectSpan(b, true)}`;
}

function analogyStatementAsksSame(conclusion) {
    const statementMatch = conclusion.match(/<div class="analogy-statement"[^>]*>(.*?)<\/div>/);
    if (!statementMatch) return null;

    const statementText = statementMatch[1]
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

    if (statementText.includes('different')) return false;
    if (statementText.includes('same')) return true;
    return null;
}

function getAnalogyConclusionValidity(question, conclusion, fallbackIsValid) {
    const subjects = extractAnalogySubjects(conclusion);
    const asksSame = analogyStatementAsksSame(conclusion);
    if (subjects.length < 4 || asksSame === null) return fallbackIsValid;

    const [a, b, c, d] = subjects;
    const isSameRelation = getAnalogyIsValidSame(question, a, b, c, d);
    return asksSame ? isSameRelation : !isSameRelation;
}

function invertAnalogyConclusion(conclusion, isValid, question = null) {
    // Find all subject spans: first two are (a, b), last two are (c, d).
    // After swapping, recompute validity from the displayed subjects instead of
    // blindly toggling. Pair inversion is not a guaranteed boolean inverse:
    // distinction relations are symmetric, and a spatial/linear opposite is only
    // valid when it exactly matches the other pair's reverse.
    const subjects = [...conclusion.matchAll(/<span\s+class="subject"[^>]*>(.*?)<\/span>/g)];
    if (subjects.length < 4) return { conclusion, isValid };

    const invertFirstPair = coinFlip(); // randomly choose which pair to invert

    let result = conclusion;

    if (invertFirstPair) {
        // Swap a and b (first pair)
        const aMatch = subjects[0];
        const bMatch = subjects[1];
        const aReplacement = analogySubjectSpan(bMatch[1], true);
        const bReplacement = analogySubjectSpan(aMatch[1], true);
        // Replace from end to preserve indices
        result = result.substring(0, bMatch.index) + bReplacement + result.substring(bMatch.index + bMatch[0].length);
        result = result.substring(0, aMatch.index) + aReplacement + result.substring(aMatch.index + aMatch[0].length);
    } else {
        // Swap c and d (second pair)
        const cMatch = subjects[2];
        const dMatch = subjects[3];
        const cReplacement = analogySubjectSpan(dMatch[1], true);
        const dReplacement = analogySubjectSpan(cMatch[1], true);
        result = result.substring(0, dMatch.index) + dReplacement + result.substring(dMatch.index + dMatch[0].length);
        result = result.substring(0, cMatch.index) + cReplacement + result.substring(cMatch.index + cMatch[0].length);
    }

    const nextIsValid = question
        ? getAnalogyConclusionValidity(question, result, isValid)
        : !isValid;
    return { conclusion: result, isValid: nextIsValid };
}

function shouldInvertAnalogy() {
    if (!savedata.invertAnalogyConclusion) return false;
    const freq = savedata.invertAnalogyConclusionFreq || 50;
    return Math.random() * 100 < freq;
}

function pickAnalogyStatementOptions(normalHtml, invertedHtml) {
    if (!savedata.enableNegation) {
        return { html: normalHtml, isInverted: false };
    }
    const freq = savedata.negationFrequency || 50;
    if (Math.random() * 100 < freq && coinFlip()) {
        return { html: invertedHtml, isInverted: true };
    }
    return { html: normalHtml, isInverted: false };
}

function applyAnalogyStatementChoice(conclusion, statement, isValid) {
    return [conclusion + statement.html, statement.isInverted ? !isValid : isValid];
}

function getAnalogyIsValidSame(question, a, b, c, d) {
    if (question.wordCoordMap && question.wordCoordMap[a] && question.wordCoordMap[b] && question.wordCoordMap[c] && question.wordCoordMap[d]) {
        const useExactDirection = question.type === 'space-five-d' || question.type === 'space-six-d';
        const ab = useExactDirection
            ? findDirection(question.wordCoordMap[a], question.wordCoordMap[b])
            : findRepresentableDirection(question.wordCoordMap[a], question.wordCoordMap[b]);
        const cd = useExactDirection
            ? findDirection(question.wordCoordMap[c], question.wordCoordMap[d])
            : findRepresentableDirection(question.wordCoordMap[c], question.wordCoordMap[d]);
        return ab !== null && cd !== null && arraysEqual(ab, cd);
    }

    if (question.type === 'distinction' && question.buckets && question.buckets.length >= 2) {
        const indexOfA = Number(question.buckets[0].indexOf(a) !== -1);
        const indexOfB = Number(question.buckets[0].indexOf(b) !== -1);
        const indexOfC = Number(question.buckets[0].indexOf(c) !== -1);
        const indexOfD = Number(question.buckets[0].indexOf(d) !== -1);
        return indexOfA === indexOfB && indexOfC === indexOfD
            || indexOfA !== indexOfB && indexOfC !== indexOfD;
    }

    if (question.bucketMap) {
        const [indexOfA, indexOfB] = [question.bucketMap[a], question.bucketMap[b]];
        const [indexOfC, indexOfD] = [question.bucketMap[c], question.bucketMap[d]];
        if ([indexOfA, indexOfB, indexOfC, indexOfD].some(v => v === undefined)) return false;
        return (indexOfA > indexOfB && indexOfC > indexOfD) ||
            (indexOfA < indexOfB && indexOfC < indexOfD) ||
            (indexOfA === indexOfB && indexOfC === indexOfD);
    }

    const sourceBucket = question.fullBucket || question.bucket || [];
    const [indexOfA, indexOfB] = [sourceBucket.indexOf(a), sourceBucket.indexOf(b)];
    const [indexOfC, indexOfD] = [sourceBucket.indexOf(c), sourceBucket.indexOf(d)];
    if (indexOfA < 0 || indexOfB < 0 || indexOfC < 0 || indexOfD < 0) return false;
    return (indexOfA > indexOfB && indexOfC > indexOfD) ||
        (indexOfA < indexOfB && indexOfC < indexOfD) ||
        (indexOfA === indexOfB && indexOfC === indexOfD);
}

function pickAnalogyStatementSameTwoOptions() {
    return pickAnalogyStatementOptions(
        '<div class="analogy-statement">is the same as</div>',
        '<div class="analogy-statement" style="color: red;">is different from</div>'
    );
}

function pickAnalogyStatementDifferentTwoOptions() {
    return pickAnalogyStatementOptions(
        '<div class="analogy-statement">is different from</div>',
        '<div class="analogy-statement" style="color: red;">is the same as</div>'
    );
}

function pickAnalogyStatementSame() {
    return pickAnalogyStatementOptions(
        '<div class="analogy-statement">has the same relation as</div>',
        '<div class="analogy-statement" style="color: red">has a different relation from</div>',
    );
}

function pickAnalogyStatementDifferent() {
    return pickAnalogyStatementOptions(
        '<div class="analogy-statement">has a different relation from</div>',
        '<div class="analogy-statement" style="color: red">has the same relation as</div>',
    );
}

function analogyTo(a, b) {
    return `<span class="subject">${a}</span> to <span class="subject">${b}</span>`;
}

class AnalogyQuestion {
     create(length) {
        const timeOffset = savedata.offsetAnalogyTime;
        const premiseOffset = getPremisesFor('offsetAnalogyPremises', 0);
        const choiceIndices = [];

        let generators = [];
        if (savedata.enableDistinction)
            generators.push(createDistinctionGenerator(length));
        if (savedata.enableLinear)
            generators.push(...createLinearGenerators(length));
        if (savedata.enableDirection)
            generators.push(createDirectionGenerator(length));
        if (savedata.enableDirection3D)
            generators.push(createDirection3DGenerator(length));
        if (savedata.enableDirection4D)
            generators.push(createDirection4DGenerator(length));
        if (savedata.enableAnchorSpace)
            generators.push(createAnchorSpaceGenerator(length));
        if (savedata.enableAnchorSpaceV2)
            generators.push(createAnchorSpaceV2Generator(length));
        if (savedata.enableMultiDim5D)
            generators.push(createMultiDim5DGenerator(length));
        if (savedata.enableMultiDim6D)
            generators.push(createMultiDim6DGenerator(length));

        if (generators.length === 0) return null;

        const totalWeight = generators.reduce((sum, item) => sum + item.weight, 0);
        let g;
        let question;

        for (let attempt = 0; attempt < Math.max(8, generators.length * 2); attempt++) {
            const randomValue = Math.random() * totalWeight;
            let cumulativeWeight = 0;
            for (let generator of generators) {
                cumulativeWeight += generator.weight;
                if (randomValue < cumulativeWeight) {
                    g = generator;
                    question = g.question.createAnalogy(Math.max(g.premiseCount + premiseOffset, 3));
                    break;
                }
            }
            if (question) break;
        }

        if (!question) return null;

        // Invert conclusion pair if option is enabled (frequency-based)
        if (shouldInvertAnalogy() && question.conclusion) {
            const inverted = invertAnalogyConclusion(question.conclusion, question.isValid, question);
            question.conclusion = inverted.conclusion;
            question.isValid = inverted.isValid;
        }

        question.plen = g.premiseCount;
        question.tlen = question.countdown || savedata.timer;
        question.tags = ['analogy'];
        if (question.countdown) {
            question.countdown += timeOffset;
        } else {
            question.timeOffset = timeOffset;
        }

        // Generate multiple conclusions if mode is enabled
        const numConclusions = (savedata.multipleConclusionsMode && savedata.numConclusions > 1)
            ? savedata.numConclusions
            : 1;

        if (numConclusions > 1 && question.bucket) {
            const conclusionsArr = [];
            const usedQuadruples = new Set();

            // Store fullBucket for multiple conclusions (use existing bucket as source)
            question.fullBucket = question.bucket;

            // Extract a/b/c/d from primary conclusion for tracking
            const primarySubjects = extractAnalogySubjects(question.conclusion);
            if (primarySubjects.length >= 4) {
                question.a = primarySubjects[0];
                question.b = primarySubjects[1];
                question.c = primarySubjects[2];
                question.d = primarySubjects[3];
            }

            // Primary conclusion
            conclusionsArr.push({
                conclusion: question.conclusion,
                isValid: question.isValid,
            });

            // Track the primary conclusion's quadruple
            if (question.a && question.b && question.c && question.d) {
                usedQuadruples.add([question.a, question.b, question.c, question.d].join('|'));
            }

            // Generate additional analogy conclusions
            let generatedCount = 1; // Start at 1 since primary is already added
            while (generatedCount < numConclusions) {
                const picked = pickUniqueSubsetOrFallback(
                    question.fullBucket,
                    4,
                    usedQuadruples,
                    items => items.join('|')
                );

                // Use fallback if unique subset not available
                const finalPicked = picked || shuffleCopy(question.bucket).slice(0, 4);
                if (!finalPicked || finalPicked.length < 4) {
                    generatedCount++; // Prevent infinite loop
                    continue;
                }

                const [a, b, c, d] = finalPicked;

                // Invert by changing the displayed pairs first, then compute truth
                // from those displayed pairs. Do not assume inversion flips validity.
                const doInvert = shouldInvertAnalogy();
                const invertFirst = doInvert && coinFlip();
                const invertSecond = doInvert && !invertFirst;
                const leftA = invertFirst ? b : a;
                const leftB = invertFirst ? a : b;
                const rightC = invertSecond ? d : c;
                const rightD = invertSecond ? c : d;
                const isValidSame = getAnalogyIsValidSame(question, leftA, leftB, rightC, rightD);

                let conclusion = analogyToStyled(leftA, leftB, invertFirst);
                let conclusionIsValid;

                if (coinFlip()) {
                    [conclusion, conclusionIsValid] = applyAnalogyStatementChoice(conclusion, pickAnalogyStatementSame(), isValidSame);
                } else {
                    [conclusion, conclusionIsValid] = applyAnalogyStatementChoice(conclusion, pickAnalogyStatementDifferent(), !isValidSame);
                }

                conclusion += analogyToStyled(rightC, rightD, invertSecond);

                conclusionsArr.push({
                    conclusion,
                    isValid: conclusionIsValid,
                });
                generatedCount++;
            }

            question.conclusions = conclusionsArr;
            question.currentConclusionIndex = 0;
            question.userAnswers = [];
        }

        return question;
    }
}

function createAnalogyGenerator(length) {
    return {
        question: new AnalogyQuestion(),
        premiseCount: length,
        weight: 100,
    };
}
