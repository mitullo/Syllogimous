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
    create(length) {
        length = Math.max(4, length);
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

        const pool = createBinaryGeneratorPool();
        let choice;
        let choice2;
        let premises;
        let conclusion = "";
        const flip = coinFlip();
        let isValid;
        const operandIndex = Math.floor(Math.random()*operands.length);
        const operand = operands[operandIndex];
        while (flip !== isValid) {
            let [generator, generator2] = pickRandomItems(pool, 2).picked;

            [choice, choice2] = [
                generator.question.create(Math.floor(length/2)),
                generator2.question.create(Math.ceil(length/2))
            ];
    
            premises = [...choice.premises, ...choice2.premises];
            premises = scramble(premises);
    
            conclusion = operandTemplates[operandIndex]
                .replace("$a", choice.conclusion)
                .replace("$b", choice2.conclusion);

            isValid = evalBoolOperand(operand, choice.isValid, choice2.isValid);
        }

        const countdown = getBinaryCountdown();
        return {
            category: `Binary: ${choice.category} ${operandNames[operandIndex]} ${choice2.category}`,
            type: "binary",
            modifiers: ['op1'],
            startedAt: new Date().getTime(),
            subresults: [choice, choice2],
            isValid,
            premises,
            conclusion,
            ...(countdown && { countdown }),
        };
    }
}

class NestedBinaryQuestion {
    create(length) {
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

        const pool = createBinaryGeneratorPool();

        length = Math.max(4, length);
        const halfLength = Math.floor(length / 2);
        const questions = Array(halfLength).fill(0)
            .map(() => pool[Math.floor(Math.random() * pool.length)].question.create(2));

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
        const premises = questions.reduce((a, q) => [ ...a, ...q.premises ], [])
        const conclusion = generated.human.replaceAll(/(\d+)/g, m => questions[m].conclusion);
        const countdown = getBinaryCountdown();

        return {
            category: `Nested Binary: ${category}`,
            type: "binary",
            modifiers: [`op${numOperands}`],
            startedAt: new Date().getTime(),
            subresults: questions,
            isValid,
            premises,
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
