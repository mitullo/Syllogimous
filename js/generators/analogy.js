function pickAnalogyStatementSameTwoOptions() {
    return pickNegatable([
        '<div class="analogy-statement">is the same as</div>',
        '<div class="analogy-statement" style="color: red;">is different from</div>'
    ]);
}

function pickAnalogyStatementDifferentTwoOptions() {
    return pickNegatable([
        '<div class="analogy-statement">is different from</div>',
        '<div class="analogy-statement" style="color: red;">is the same as</div>'
    ]);
}

function pickAnalogyStatementSame() {
    return pickNegatable([
        '<div class="analogy-statement">has the same relation as</div>',
        '<div class="analogy-statement" style="color: red">has a different relation from</div>',
    ]);
}

function pickAnalogyStatementDifferent() {
    return pickNegatable([
        '<div class="analogy-statement">has a different relation from</div>',
        '<div class="analogy-statement" style="color: red">has the same relation as</div>',
    ]);
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

        const totalWeight = generators.reduce((sum, item) => sum + item.weight, 0);
        const randomValue = Math.random() * totalWeight;
        let cumulativeWeight = 0;
        let g;
        for (let generator of generators) {
            cumulativeWeight += generator.weight;
            if (randomValue < cumulativeWeight) {
                g = generator;
                break;
            }
        }

        let question = g.question.createAnalogy(Math.max(g.premiseCount + premiseOffset, 3));
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
            const primarySubjects = extractSubjects(question.conclusion);
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
                const sourceBucket = question.fullBucket;

                const [indexOfA, indexOfB] = [sourceBucket.indexOf(a), sourceBucket.indexOf(b)];
                const [indexOfC, indexOfD] = [sourceBucket.indexOf(c), sourceBucket.indexOf(d)];
                const isValidSame =
                    (indexOfA > indexOfB && indexOfC > indexOfD) ||
                    (indexOfA < indexOfB && indexOfC < indexOfD) ||
                    (indexOfA === indexOfB && indexOfC === indexOfD);

                let conclusion = analogyTo(a, b);
                let conclusionIsValid;

                if (coinFlip()) {
                    conclusion += pickAnalogyStatementSame();
                    conclusionIsValid = isValidSame;
                } else {
                    conclusion += pickAnalogyStatementDifferent();
                    conclusionIsValid = !isValidSame;
                }

                conclusion += analogyTo(c, d);

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
