// Safe boolean operand evaluation - replaces fragile eval() with string replacement
function evalBoolOperand(operand, a, b) {
    const va = Boolean(a);
    const vb = Boolean(b);
    switch (operand) {
        case "a&&b": return va && vb;
        case "!(a&&b)": return !(va && vb);
        case "a||b": return va || vb;
        case "!(a||b)": return !(va || vb);
        case "!(a&&b)&&(a||b)": return !(va && vb) && (va || vb);
        case "!(!(a&&b)&&(a||b))": return !(!(va && vb) && (va || vb));
        default: return false;
    }
}

// Safe nested boolean evaluation - replaces eval() for nested binary expressions
function evalNestedBool(expr, questions) {
    // Replace digit references with their boolean isValid values, then evaluate safely
    const boolExpr = expr.replaceAll(/(\d+)/g, m => Boolean(questions[+m]?.isValid));
    // Parse and evaluate the boolean expression without eval
    return evalBoolExpr(boolExpr);
}

function evalBoolExpr(expr) {
    // Tokenize: handle true, false, &&, ||, !, (, )
    const tokens = [];
    let i = 0;
    while (i < expr.length) {
        if (expr[i] === ' ') { i++; continue; }
        if (expr.substr(i, 4) === 'true') { tokens.push(true); i += 4; }
        else if (expr.substr(i, 5) === 'false') { tokens.push(false); i += 5; }
        else if (expr.substr(i, 2) === '&&') { tokens.push('&&'); i += 2; }
        else if (expr.substr(i, 2) === '||') { tokens.push('||'); i += 2; }
        else if (expr[i] === '!') { tokens.push('!'); i++; }
        else if (expr[i] === '(') { tokens.push('('); i++; }
        else if (expr[i] === ')') { tokens.push(')'); i++; }
        else { i++; } // skip unknown
    }
    // Recursive descent parser
    let pos = 0;
    function parseOr() {
        let left = parseAnd();
        while (pos < tokens.length && tokens[pos] === '||') {
            pos++;
            left = parseAnd() || left;
        }
        return left;
    }
    function parseAnd() {
        let left = parseNot();
        while (pos < tokens.length && tokens[pos] === '&&') {
            pos++;
            left = parseNot() && left;
        }
        return left;
    }
    function parseNot() {
        if (pos < tokens.length && tokens[pos] === '!') {
            pos++;
            return !parseNot();
        }
        return parsePrimary();
    }
    function parsePrimary() {
        if (pos < tokens.length && tokens[pos] === '(') {
            pos++;
            const val = parseOr();
            if (pos < tokens.length && tokens[pos] === ')') pos++;
            return val;
        }
        if (pos < tokens.length && (tokens[pos] === true || tokens[pos] === false)) {
            return tokens[pos++];
        }
        return false;
    }
    return Boolean(parseOr());
}

function createBinaryGeneratorPool(length) {
    let generators = [];
    if (savedata.enableDistinction)
        generators.push(createDistinctionGenerator(length));
    if (savedata.enableLinear)
        generators.push(...createLinearGenerators(length));
    if (savedata.enableSyllogism)
        generators.push(createSyllogismGenerator(length));
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
    return generators;
}


function getBinaryCountdown(offset=0) {
    return savedata.overrideBinaryTime ? savedata.overrideBinaryTime + offset : null;
}

class BinaryQuestion {
    create(length, transforms = {}) {
        length = Math.max(4, length);

        // When binaryHardModeLevel > 0, temporarily override sub-generators' hard mode levels
        // Split the level between the two sub-questions so total transforms = btfm
        const btfm = savedata.binaryHardModeLevel || 0;
        const firstHalf = Math.ceil(btfm / 2);
        const secondHalf = Math.floor(btfm / 2);
        const hardModeKeys = [
            'space2DHardModeLevel', 'space3DHardModeLevel', 'space4DHardModeLevel',
            'space5DHardModeLevel', 'space6DHardModeLevel', 'anchorSpaceHardModeLevel'
        ];
        // Save original values once before any overrides
        const originalValues = {};
        for (const key of hardModeKeys) {
            originalValues[key] = savedata[key];
        }
        function applyOverride(level) {
            for (const key of hardModeKeys) {
                savedata[key] = originalValues[key];
                if (savedata[key] < level) {
                    savedata[key] = level;
                }
            }
        }
        function restoreOverride() {
            for (const key of hardModeKeys) {
                savedata[key] = originalValues[key];
            }
        }
        const operands = [
            "a&&b",                 // and
            "!(a&&b)",              // nand
            "a||b",                 // or
            "!(a||b)",              // nor
            "!(a&&b)&&(a||b)",      // xor
            "!(!(a&&b)&&(a||b))"    // xnor
        ];

        const operandNames = [
            "AND",
            "NAND",
            "OR",
            "NOR",
            "XOR",
            "XNOR"
        ];

        const operandTemplates = [
            '$a <div class="is-connector">and</div> $b',
            '<div class="is-connector"></div> $a <div class="is-connector">nand</div> $b <div class="is-connector">are true</div>',
            '$a <div class="is-connector">or</div> $b',
            '<div class="is-connector">Neither</div> $a <div class="is-connector">nor</div> $b',
            '<div class="is-connector">Either</div> $a <div class="is-connector">or</div> $b',
            '<div class="is-connector">Both</div> $a <div class="is-connector">and</div> $b <div class="is-connector">are the same</div>'
        ];

        const pool = createBinaryGeneratorPool(length);

        if (pool.length === 0) return null;

        let choice;
        let choice2;
        let premises;
        let conclusion = "";
        const flip = coinFlip();
        let isValid;
        const operandIndex = Math.floor(Math.random()*operands.length);
        const operand = operands[operandIndex];
        while (flip !== isValid) {
            const generator = pool[Math.floor(Math.random() * pool.length)];
            const generator2 = pool[Math.floor(Math.random() * pool.length)];

            // Create first sub-question with firstHalf override level
            if (btfm > 0) applyOverride(firstHalf);
            choice = generator.question.create(Math.floor(length/2), transforms);
            if (btfm > 0) restoreOverride();

            // Create second sub-question with secondHalf override level
            if (btfm > 0) applyOverride(secondHalf);
            choice2 = generator2.question.create(Math.ceil(length/2), transforms);
            if (btfm > 0) restoreOverride();
    
            premises = scramble([...choice.premises, ...choice2.premises], getScrambleFactor('overrideBinaryScramble'));
    
            conclusion = operandTemplates[operandIndex]
                .replace("$a", choice.conclusion)
                .replace("$b", choice2.conclusion);

            isValid = evalBoolOperand(operand, choice.isValid, choice2.isValid);
        }

        const countdown = getBinaryCountdown();

        const operations = [choice, choice2].flatMap(q => q.operations || []);
        const transformCount = btfm || (operations.length ? Math.round(operations.length / 2) : 0);

        return {
            category: "Binary: " + choice.category + " " + operandNames[operandIndex] + " " + choice2.category,
            type: "binary",
            modifiers: transformCount > 0 ? ['op1', 'tfm' + transformCount] : ['op1'],
            startedAt: new Date().getTime(),
            subresults: [choice, choice2],
            subOperations: [choice.operations || [], choice2.operations || []],
            isValid,
            premises,
            operations,
            conclusion,
            ...(countdown && { countdown }),
        };
    }
}

class NestedBinaryQuestion {
    create(length, transforms = {}) {

        // When binaryHardModeLevel > 0, temporarily override sub-generators' hard mode levels
        // Distribute level across sub-questions so total transforms ≈ btfm
        const btfm = savedata.binaryHardModeLevel || 0;
        const hardModeKeys = [
            'space2DHardModeLevel', 'space3DHardModeLevel', 'space4DHardModeLevel',
            'space5DHardModeLevel', 'space6DHardModeLevel', 'anchorSpaceHardModeLevel'
        ];
        const originalValues = {};
        for (const key of hardModeKeys) {
            originalValues[key] = savedata[key];
        }
        function applyOverride(level) {
            for (const key of hardModeKeys) {
                savedata[key] = originalValues[key];
                if (savedata[key] < level) {
                    savedata[key] = level;
                }
            }
        }
        function restoreOverride() {
            for (const key of hardModeKeys) {
                savedata[key] = originalValues[key];
            }
        }

        const humanOperands = [
            '<span class="is-connector DEPTH">(</span>à<span class="is-connector DEPTH">)</span> <span class="is-connector DEPTH">AND</span><br><span class="INDENT"></span><span class="is-connector DEPTH">(</span>ò<span class="is-connector DEPTH">)</span>',
            '<span class="is-connector DEPTH">(</span>à<span class="is-connector DEPTH">)</span> <span class="is-connector DEPTH">NAND</span><br><span class="INDENT"></span><span class="is-connector DEPTH">(</span>ò<span class="is-connector DEPTH">)</span>',
            '<span class="is-connector DEPTH">(</span>à<span class="is-connector DEPTH">)</span> <span class="is-connector DEPTH">OR</span><br><span class="INDENT"></span><span class="is-connector DEPTH">(</span>ò<span class="is-connector DEPTH">)</span>',
            '<span class="is-connector DEPTH">(</span>à<span class="is-connector DEPTH">)</span> <span class="is-connector DEPTH">NOR</span><br><span class="INDENT"></span><span class="is-connector DEPTH">(</span>ò<span class="is-connector DEPTH">)</span>',
            '<span class="is-connector DEPTH">(</span>à<span class="is-connector DEPTH">)</span> <span class="is-connector DEPTH">XOR</span><br><span class="INDENT"></span><span class="is-connector DEPTH">(</span>ò<span class="is-connector DEPTH">)</span>',
            '<span class="is-connector DEPTH">(</span>à<span class="is-connector DEPTH">)</span> <span class="is-connector DEPTH">XNOR</span><br><span class="INDENT"></span><span class="is-connector DEPTH">(</span>ò<span class="is-connector DEPTH">)</span>'
        ];

        const evalOperands =[
            "(a)&&(b)",
            "!((a)&&(b))",
            "(a)||(b)",
            "!((a)||(b))",
            "!((a)&&(b))&&((a)||(b))",
            "!(!((a)&&(b))&&((a)||(b)))"
        ];

        const pool = createBinaryGeneratorPool(length);

        if (pool.length === 0) return null;

        length = Math.max(4, length);
        const halfLength = Math.floor(length / 2);
        // Distribute btfm across sub-questions so total transforms ≈ btfm
        const perSubLevel = btfm > 0 && halfLength > 0 ? Math.max(1, Math.ceil(btfm / halfLength)) : 0;
        const questions = Array(halfLength).fill(0)
            .map(() => {
                if (btfm > 0) applyOverride(perSubLevel);
                const q = pool[Math.floor(Math.random() * pool.length)].question.create(2, transforms);
                if (btfm > 0) restoreOverride();
                return q;
            });

        let numOperands = +savedata.maxNestedBinaryDepth;
        let leafIndex = 0;
        function generator(remaining, depth) {
            remaining--;
            const left = Math.floor(Math.random() * remaining);
            const right = remaining - left;
            const rndIndex = Math.floor(Math.random() * humanOperands.length);
            const humanOperand = humanOperands[rndIndex];
            const evalOperand = evalOperands[rndIndex];
            const val = (left > 0)
                ? generator(left, depth+1)
                : { leaf: (leafIndex++) % halfLength };
            const val2 = (right > 0)
                ? generator(right, depth+1)
                : { leaf: (leafIndex++) % halfLength };
            const letter = String.fromCharCode(97 + depth);
            return {
                human: humanOperand
                    .replaceAll('DEPTH', 'depth-' + letter)
                    .replaceAll('INDENT', 'indent-' + letter)
                    .replace('à', val.leaf !== undefined ? val.leaf : val.human)
                    .replace('ò', val2.leaf !== undefined ? val2.leaf : val2.human),
                eval: evalOperand
                    .replaceAll('a', val.leaf !== undefined ? val.leaf : val.eval)
                    .replaceAll('b', val2.leaf !== undefined ? val2.leaf : val2.eval),
            };
        }

        const generated = generator(numOperands, 0);

        const category = Object.keys(
            questions
                .map(q => q.category)
                .reduce((a, c) => (a[c] = 1, a), {})
        )
        .join('/');
        const isValid = evalNestedBool(generated.eval, questions);
        const premises = scramble(questions.reduce((a, q) => [ ...a, ...q.premises ], []), getScrambleFactor('overrideBinaryScramble'));
        const operations = questions.flatMap(q => q.operations || []);
        const conclusion = generated.human.replaceAll(/(\d+)/g, m => questions[m].conclusion);
        const countdown = getBinaryCountdown();

        return {
            category: `Nested Binary: ${category}`,
            type: "binary",
            modifiers: btfm > 0 ? ['op' + numOperands, 'tfm' + btfm] : (operations.length > 0 ? ['op' + numOperands, 'tfm' + operations.length] : ['op' + numOperands]),
            startedAt: new Date().getTime(),
            subresults: questions,
            subOperations: questions.map(q => q.operations || []),
            isValid,
            premises,
            operations,
            conclusion,
            ...(countdown && { countdown }),
        };
    }
}

function createBinaryGenerator(length) {
    return {
        question: new BinaryQuestion(),
        premiseCount: getPremisesFor('overrideBinaryPremises', length),
        weight: 100,
    };
}

function createNestedBinaryGenerator(length) {
    return {
        question: new NestedBinaryQuestion(),
        premiseCount: getPremisesFor('overrideBinaryPremises', length),
        weight: 100,
    };
}

class BinaryAnalogyQuestion {
    createAnalogyLeaf(generator, length) {
        const question = generator.question;
        if (length <= 2 && typeof question.createCompactAnalogy === 'function') {
            return question.createCompactAnalogy(length);
        }
        return question.createAnalogy(Math.max(length, 3));
    }

    create(length, transforms = {}) {
        // Binary analogy should still be able to bottom out at 4 premises:
        // two 2-premise analogy leaves combined by one binary operator.
        length = Math.max(4, length);

        const btfm = savedata.binaryHardModeLevel || 0;
        const firstHalf = Math.ceil(btfm / 2);
        const secondHalf = Math.floor(btfm / 2);
        const hardModeKeys = [
            'space2DHardModeLevel', 'space3DHardModeLevel', 'space4DHardModeLevel',
            'space5DHardModeLevel', 'space6DHardModeLevel', 'anchorSpaceHardModeLevel'
        ];
        const originalValues = {};
        for (const key of hardModeKeys) {
            originalValues[key] = savedata[key];
        }
        function applyOverride(level) {
            for (const key of hardModeKeys) {
                savedata[key] = originalValues[key];
                if (savedata[key] < level) {
                    savedata[key] = level;
                }
            }
        }
        function restoreOverride() {
            for (const key of hardModeKeys) {
                savedata[key] = originalValues[key];
            }
        }

        const operands = [
            "a&&b",                 // and
            "!(a&&b)",              // nand
            "a||b",                 // or
            "!(a||b)",              // nor
            "!(a&&b)&&(a||b)",      // xor
            "!(!(a&&b)&&(a||b))"    // xnor
        ];

        const operandNames = [
            "AND",
            "NAND",
            "OR",
            "NOR",
            "XOR",
            "XNOR"
        ];

        const operandTemplates = [
            '<div class="binary-analogy-conclusion">$a <div class="is-connector binary-operator">AND</div> $b</div>',
            '<div class="binary-analogy-conclusion">$a <div class="is-connector binary-operator">NAND</div> $b</div>',
            '<div class="binary-analogy-conclusion">$a <div class="is-connector binary-operator">OR</div> $b</div>',
            '<div class="binary-analogy-conclusion">$a <div class="is-connector binary-operator">NOR</div> $b</div>',
            '<div class="binary-analogy-conclusion">$a <div class="is-connector binary-operator">XOR</div> $b</div>',
            '<div class="binary-analogy-conclusion">$a <div class="is-connector binary-operator">XNOR</div> $b</div>'
        ];

        // Build analogy generator pool (same as AnalogyQuestion)
        let analogyGenerators = [];
        if (savedata.enableDistinction)
            analogyGenerators.push(createDistinctionGenerator(length));
        if (savedata.enableLinear)
            analogyGenerators.push(...createLinearGenerators(length));
        if (savedata.enableDirection)
            analogyGenerators.push(createDirectionGenerator(length));
        if (savedata.enableDirection3D)
            analogyGenerators.push(createDirection3DGenerator(length));
        if (savedata.enableDirection4D)
            analogyGenerators.push(createDirection4DGenerator(length));
        if (savedata.enableAnchorSpace)
            analogyGenerators.push(createAnchorSpaceGenerator(length));
        if (savedata.enableAnchorSpaceV2)
            analogyGenerators.push(createAnchorSpaceV2Generator(length));
        if (savedata.enableMultiDim5D)
            analogyGenerators.push(createMultiDim5DGenerator(length));
        if (savedata.enableMultiDim6D)
            analogyGenerators.push(createMultiDim6DGenerator(length));

        if (analogyGenerators.length === 0) return null;

        // Filter to only generators that support createAnalogy
        analogyGenerators = analogyGenerators.filter(g => typeof g.question.createAnalogy === 'function');
        if (analogyGenerators.length === 0) return null;

        // For 4-premise binary analogy, each side must be a 2-premise analogy leaf.
        // Only Direction/Anchor-style analogy generators currently expose that compact path.
        // Without this filter, a non-compact leaf falls back to 3 premises, so the whole
        // binary analogy silently becomes 6 premises again.
        if (length <= 4) {
            const compactAnalogyGenerators = analogyGenerators.filter(
                g => typeof g.question.createCompactAnalogy === 'function'
            );
            if (compactAnalogyGenerators.length > 0) {
                analogyGenerators = compactAnalogyGenerators;
            }
        }

        // The analogy-premise offset is meant for regular analogies. In binary analogy
        // it gets applied to each sub-length independently, doubling its effect and
        // inflating the total. The user already controls premise count via
        // overrideBinaryPremises, so skip the offset here.
        const premiseOffset = 0;

        let choice, choice2;
        let premises;
        let conclusion = "";
        const flip = coinFlip();
        let isValid;
        const operandIndex = Math.floor(Math.random() * operands.length);
        const operand = operands[operandIndex];

        let attempts = 0;
        const maxAttempts = 120;
        while (flip !== isValid && attempts < maxAttempts) {
            attempts++;
            // Pick two random analogy generators
            const g1 = analogyGenerators[Math.floor(Math.random() * analogyGenerators.length)];
            const g2 = analogyGenerators[Math.floor(Math.random() * analogyGenerators.length)];

            const subLength1 = Math.max(Math.floor(length / 2) + premiseOffset, 2);
            const subLength2 = Math.max(Math.ceil(length / 2) + premiseOffset, 2);

            // Create first analogy sub-question
            if (btfm > 0) applyOverride(firstHalf);
            choice = this.createAnalogyLeaf(g1, subLength1);
            if (btfm > 0) restoreOverride();

            // Create second analogy sub-question
            if (btfm > 0) applyOverride(secondHalf);
            choice2 = this.createAnalogyLeaf(g2, subLength2);
            if (btfm > 0) restoreOverride();

            if (!choice || !choice2) continue;

            const scrambleFactor = getScrambleFactor('overrideBinaryScramble');
            // Do not preserve the two leaf packages in premise order. Keeping each
            // two-premise analogy leaf adjacent makes binary analogy solvable by
            // locally comparing the two visible arrows/relations.
            premises = scramble([...choice.premises, ...choice2.premises], scrambleFactor);

            conclusion = operandTemplates[operandIndex]
                .replace("$a", '<div class="binary-sub-conclusion">' + choice.conclusion + '</div>')
                .replace("$b", '<div class="binary-sub-conclusion">' + choice2.conclusion + '</div>');

            isValid = evalBoolOperand(operand, choice.isValid, choice2.isValid);
        }

        if (flip !== isValid || !choice || !choice2) return null;

        const countdown = getBinaryCountdown();
        const operations = [choice, choice2].flatMap(q => q.operations || []);
        const transformCount = btfm || (operations.length ? Math.round(operations.length / 2) : 0);

        return {
            category: "Binary Analogy: " + choice.category + " " + operandNames[operandIndex] + " " + choice2.category,
            type: "binary-analogy",
            modifiers: transformCount > 0 ? ['op1', 'tfm' + transformCount] : ['op1'],
            startedAt: new Date().getTime(),
            subresults: [choice, choice2],
            subOperations: [choice.operations || [], choice2.operations || []],
            tags: ['analogy'],
            isValid,
            premises,
            operations,
            conclusion,
            ...(countdown && { countdown }),
        };
    }
}

function createBinaryAnalogyGenerator(length) {
    return {
        question: new BinaryAnalogyQuestion(),
        premiseCount: getPremisesFor('overrideBinaryPremises', length),
        weight: 100,
    };
}
