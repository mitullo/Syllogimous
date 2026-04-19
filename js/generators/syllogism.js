function getSyllogism(s, p, m, rule) {
    const _forms = pickNegatable(forms);
    let major = _forms[rule[0]];
    let minor = _forms[rule[1]];
    let conclusion = _forms[rule[2]];

    let figure = +rule[3];

    if (figure === 1) {
        major = major.replace("$", m);
        major = major.replace("$", p);

        minor = minor.replace("$", s);
        minor = minor.replace("$", m);
    } else if (figure === 2) {
        major = major.replace("$", p);
        major = major.replace("$", m);

        minor = minor.replace("$", s);
        minor = minor.replace("$", m);
    } else if (figure === 3) {
        major = major.replace("$", m);
        major = major.replace("$", p);

        minor = minor.replace("$", m);
        minor = minor.replace("$", s);
    } else if (figure === 4) {
        major = major.replace("$", p);
        major = major.replace("$", m);

        minor = minor.replace("$", m);
        minor = minor.replace("$", s);
    }

    conclusion = conclusion.replace("$", s);
    conclusion = conclusion.replace("$", p);

    return [major, minor, conclusion];
}

function getRandomInvalidRule() {
    let rule;
    while (!rule || validRules.includes(rule)) {
        rule = "";
        for (let i = 0; i < 3; i++) {
            rule += Math.floor(Math.random() * 4); // Form
        }
        rule += 1 + Math.floor(Math.random() * 4); // Figure
    }
    return rule;
}


function isPremiseSimilarToConlusion(premises, conclusion) {
    const subjectsOfPremises = premises.map(p => extractSubjects(p));
    const subjectsOfConclusion = extractSubjects(conclusion);
    for (const subjects of subjectsOfPremises) {
        if (subjects[0]+subjects[1] === subjectsOfConclusion[0]+subjectsOfConclusion[1]
         || subjects[1]+subjects[0] === subjectsOfConclusion[0]+subjectsOfConclusion[1])
            return true;
    }
}

function extractSubjects(phrase) {
    return [...phrase.matchAll(/<span class="subject">(.*?)<\/span>/g)].map(a => a[1]);
}

class SyllogismQuestion {
    constructor() {
    }

    create(length) {
        let bucket;
        let isValid;
        let rule;
        let premises = [];
        let conclusion;
        do {
            bucket = createStimuli(length + 1);
            premises = []

            conclusion;
            isValid = coinFlip();
            let a, b;
            if (isValid) {
                rule = validRules[Math.floor(Math.random() * validRules.length)];
                [a, b, conclusion] = getSyllogism(
                    bucket[0],
                    bucket[1],
                    bucket[2],
                    rule
                );
            } else {
                rule = getRandomInvalidRule();
                [a, b, conclusion] = getSyllogism(
                    bucket[0],
                    bucket[1],
                    bucket[2],
                    getRandomInvalidRule()
                );
            }
            premises.push(a);
            premises.push(b);
        } while(isPremiseSimilarToConlusion(premises, conclusion));

        for (let i = 3; i < bucket.length; i++) {
            let rnd = Math.floor(Math.random() * (i - 1));
            let flip = coinFlip();
            let p = flip ? bucket[i] : bucket[rnd];
            let m = flip ? bucket[rnd] : bucket[i];
            premises.push(getSyllogism("#####", p, m, getRandomInvalidRule())[0]);
        }

        premises = scramble(premises);

        // Generate multiple conclusions if mode is enabled
        const numConclusions = (savedata.multipleConclusionsMode && savedata.numConclusions > 1)
            ? savedata.numConclusions
            : 1;

        const conclusionsArr = [];
        const usedTriples = new Set();

        // Build larger term pool for unique triples
        // For multi-conclusion mode, create a larger pool to draw unique triples from
        const termPool = (numConclusions > 1)
            ? createStimuli(Math.max(length * 2, numConclusions * 3 + 3))
            : bucket;

        // Production-ready: add minimum size check and warning
        if (numConclusions > 1 && termPool.length < 3 * numConclusions) {
            console.warn('Syllogism term pool too small for multiple conclusions:', termPool.length, 'vs', numConclusions);
        }

        let generatedCount = 0;
        while (generatedCount < numConclusions) {
            let conclusionIsValid = coinFlip();
            let conclusionRule;
            let conclusionText;
            let c;

            // Pick unique triple from pool
            // For syllogism, term order matters for the logic, so we use ordered keys
            const triple = pickUniqueSubset(
                termPool,
                3,
                usedTriples,
                items => items.join('|')
            ) || [bucket[0], bucket[1], bucket[2]];

            if (conclusionIsValid) {
                conclusionRule = validRules[Math.floor(Math.random() * validRules.length)];
                [, , conclusionText] = getSyllogism(triple[0], triple[1], triple[2], conclusionRule);
            } else {
                conclusionRule = getRandomInvalidRule();
                [, , conclusionText] = getSyllogism(triple[0], triple[1], triple[2], conclusionRule);
            }

            [c, conclusionIsValid] = applyConclusionNegation(conclusionText, conclusionIsValid, null);

            conclusionsArr.push({
                conclusion: c,
                isValid: conclusionIsValid,
            });
            generatedCount++;
        }

        const countdown = this.getCountdown();
        return {
            category: 'Syllogism',
            type: "syllogism",
            startedAt: new Date().getTime(),
            rule,
            bucket,
            isValid: conclusionsArr[0].isValid,
            premises,
            conclusion: conclusionsArr[0].conclusion,
            conclusions: conclusionsArr,
            currentConclusionIndex: 0,
            userAnswers: [],
            ...(countdown && { countdown }),
        };
    }

    getCountdown() {
        return savedata.overrideSyllogismTime;
    }
}

function createSyllogismGenerator(length) {
    return {
        question: new SyllogismQuestion(),
        premiseCount: getPremisesFor('overrideSyllogismPremises', length),
        weight: savedata.overrideSyllogismWeight,
    };
}
