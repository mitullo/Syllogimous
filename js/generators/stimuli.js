function createNonsenseWord() {
    const vowels = ['A', 'E', 'I', 'O', 'U'], consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W'];
    for (string = ''; string.length < savedata.nonsenseWordLength;) {
        if ((string.length + 1) % 2) 
            string += consonants[Math.floor(Math.random() * consonants.length)];
        else 
            string += vowels[Math.floor(Math.random() * vowels.length)];

        if (string.length == savedata.nonsenseWordLength) {
            if (bannedWords.some(d => string.includes(d))) {
                string = '';
            } else {
                return string;
            }
        }
    }
}

function createGarbageWord() {
    const consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'Z'];
    let string = '';
    while (string.length < savedata.garbageWordLength) {
        const c = consonants[Math.floor(Math.random() * consonants.length)]
        if (string.length > 0 && string.endsWith(c)) {
            continue;
        }
        string += c;
    }
    return string;
}

let currentJunkEmojiSequence = [0, 3, 6, 9, 1, 4, 7, 2, 5, 8];
let currentJunkEmojiSequenceId = 0;
function createJunkEmoji() {
    const splitSize = Math.floor(JUNK_EMOJI_COUNT / currentJunkEmojiSequence.length);
    const numSplits = JUNK_EMOJI_COUNT / splitSize;
    let offset = currentJunkEmojiSequence[currentJunkEmojiSequenceId] * splitSize;
    const choice = Math.floor(Math.random() * JUNK_EMOJI_COUNT / numSplits);
    const id = offset + choice;
    currentJunkEmojiSequenceId++;
    if (currentJunkEmojiSequenceId >= currentJunkEmojiSequence.length) {
        currentJunkEmojiSequenceId = 0;
    }
    return `[junk]${id}[/junk]`;
}

function createVisualNoiseTag() {
    const id = Math.floor(Math.random() * 999999);
    const splits = savedata.visualNoiseSplits;
    return `[vnoise]${id},${splits}[/vnoise]`;
}

let topoStimulusNonce = 0;
function createTopoTag(excludePalettes = []) {
    const splits = savedata.visualNoiseSplits;
    const excludeSet = new Set(excludePalettes || []);
    let attempts = 0;
    let id, paletteIdx;
    // Retry until we find a seed that produces a non-excluded palette
    do {
        id = ((++topoStimulusNonce * 0x9e3779b1) ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0;
        if (typeof TopoMap !== 'undefined') {
            const mixed = TopoMap.mix32(id);
            paletteIdx = TopoMap.mix32(mixed ^ 0xcafebabe) % TopoMap.PALETTES.length;
        } else {
            paletteIdx = -1; // Fallback if TopoMap not loaded
        }
        attempts++;
    } while (excludeSet.has(paletteIdx) && attempts < 100);
    const excludeStr = excludePalettes.length ? `,${excludePalettes.join(',')}` : '';
    return `[topo]${id},${splits}${excludeStr}[/topo]`;
}

function maxStimuliAllowed() {
    const stimuliConfigs = createStimuliConfigs();
    return stimuliConfigs.reduce((a, b) => Math.min(a, b.limit), 999) - 1;
}

function createStimuliConfigs() {
    const stimuliConfigs = [];
    if (savedata.useMeaningfulWords && savedata.meaningfulWordNouns) {
        stimuliConfigs.push({
            limit: meaningfulWords.nouns.length,
            generate: () => pickRandomItems(meaningfulWords.nouns, 1).picked[0],
        });
    };
    if (savedata.useMeaningfulWords && savedata.meaningfulWordAdjectives) {
        stimuliConfigs.push({
            limit: meaningfulWords.adjectives.length,
            generate: () => pickRandomItems(meaningfulWords.adjectives, 1).picked[0],
        });
    };
    if (savedata.useEmoji) {
        stimuliConfigs.push({
            limit: emoji.length,
            generate: () => pickRandomItems(emoji, 1).picked[0],
        });
    };
    if (savedata.useJunkEmoji) {
        stimuliConfigs.push({
            limit: JUNK_EMOJI_COUNT,
            generate: () => createJunkEmoji(),
        });
    };
    if (savedata.useVisualNoise) {
        stimuliConfigs.push({
            limit: 1000,
            generate: () => createVisualNoiseTag(),
        });
    };
    if (savedata.useTopo) {
        const usedTopoPalettes = [];
        stimuliConfigs.push({
            limit: 1000,
            generate: () => {
                // Generate a tag with excluded palettes to ensure variety within question
                const tag = createTopoTag([...usedTopoPalettes]);
                // Parse the seed from the tag to determine which palette will be used
                const match = tag.match(/\[topo\](\d+),/);
                if (match && typeof TopoMap !== 'undefined') {
                    const seed = parseInt(match[1], 10);
                    const mixed = TopoMap.mix32(seed);
                    const paletteIdx = TopoMap.mix32(mixed ^ 0xcafebabe) % TopoMap.PALETTES.length;
                    usedTopoPalettes.push(paletteIdx);
                }
                return tag;
            },
        });
    };
    if (savedata.useGarbageWords) {
        stimuliConfigs.push({
            limit: 19 ** (savedata.garbageWordLength),
            generate: createGarbageWord,
        });
    };
    if (savedata.useNonsenseWords || stimuliConfigs.length === 0) {
        let limit;
        if (savedata.nonsenseWordLength % 2)
            limit = (20 ** (Math.floor(savedata.nonsenseWordLength / 2) + 1)) * (5 ** Math.floor(savedata.nonsenseWordLength / 2));
        else 
            limit = (20 ** (savedata.nonsenseWordLength / 2)) * (5 ** (savedata.nonsenseWordLength / 2));
        stimuliConfigs.push({
            limit: limit,
            generate: () => createNonsenseWord(),
        });
    };

    stimuliConfigs.forEach(config => config.unique = new Set());
    return stimuliConfigs;
}

function createStimuli(numberOfStimuli, usedStimuli) {
    let stimuliConfigs = createStimuliConfigs();
    shuffle(stimuliConfigs);
    let configIndex = 0;
    const nextConfig = () => {
        const config = stimuliConfigs[configIndex];
        configIndex++;
        if (configIndex >= stimuliConfigs.length) {
            configIndex = 0;
        }
        return config;
    }

    const stimuliCreated = [];
    for (let i = 0; i < numberOfStimuli; i++) {
        let config = nextConfig();
        for (let j = 0; j < 9999 && config.unique.length >= config.limit; j++)
            config = nextConfig();
        let nextStimuli = config.generate();
        for (let j = 0; j < 9999 && config.unique.has(nextStimuli); j++) {
            nextStimuli = config.generate();
        }
        stimuliCreated.push(nextStimuli);
        config.unique.add(nextStimuli);
    }

    shuffle(stimuliCreated);
    return stimuliCreated
}
