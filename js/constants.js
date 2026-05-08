const oldSettingsKey = "sllgms-v3";

const imageKey = 'sllgms-v3-background';

const profilesKey = 'sllgms-v3-profiles';

const selectedProfileKey = 'sllgms-v3-selected-profile';

const appStateKey = 'sllgms-v3-app-state';



let appState = {

    "score": 0,

    "questions": [],

    "backgroundImage": null,

    "gameAreaColor": "#293247CC",

    "gameAreaLightColor": "#EFEFEF",

    "isExperimentalOpen": false,

    "isLegacyOpen": false,

    "sfx": "none",

    "fastUi": true,

    "hideFeedback": false,

    "manualSettings": false,

    "staticButtons": true,

    "darkMode": true,

    "flatSettings": false,

    "swapButtons": false,

    "dynamicSwapButtons": false,

    "cyanPreset": false,

    "navBar": false,

    "sideTabStyle": "classic",

    "timerAnimation": "stepEaseOut",

    "fontSize": 1,

    "uiFont": "inter",

    "uiFontCustom": "",

    "uiFontFileData": "",

    "uiFontFileName": "",

    "uiDensity": 1,

    "multipleConclusionsMode": false,

    "numConclusions": 3,

    "timeBonusPerConclusionEnabled": false,

    "timeBonusPerConclusion": 3,

    "bracketColor": "#3377ff",

    "colorWords": false,

    "colorTimer": false,

    "timerHeight": 20,

    "borderRadius": "rounded",

    "premiseStyle": "minimal",

    "conclusionStyle": "minimal",

    "conclusionColor": "#ffffff",

    "buttonStyle": "contrast",

    "premiseFont": "default",

    "premiseFontCustom": "",

    "premiseFontFileData": "",

    "premiseFontFileName": "",

    "scoreMode": "correct",

    "hideSideButtons": false,

    "stimulusSize": 1.125,

};



let savedata = {

    "version": 3,

    "premises": 2,

    "timer": 30,

    "enableDistinction": true,

    "enableLinear": true,

    "linearWording": 'topunder,comparison,contains',

    "enableSyllogism": false,

    "enableAnalogy": false,

    "invertAnalogyConclusion": false,

    "invertAnalogyConclusionFreq": 50,

    "enableDirection": true,

    "enableDirection3D": false,

    "enableDirection4D": false,

    "enableMultiDim5D": false,

    "enableMultiDim6D": false,

    "enableAnchorSpace": false,

    "enableBinary": false,

    "enableBinaryAnalogy": false,

    "useMeaningfulWords": false,

    "enableCarouselMode": false,

    "carouselPremisesPerPage": 1,

    "carouselDisableBack": false,

    "carouselAutoAdvanceSeconds": 0,

    "enableNegation": false,

    "negationFrequency": 50,

    "enableConclusionNegation": false,

    "conclusionNegationFrequency": 50,

    "vanishingPremises": false,

    "enableMeta": false,

    "onlyAnalogy": false,

    "onlyBinary": false,

    "maxNestedBinaryDepth": 1,

    "nonsenseWordLength": 3,

    "useNonsenseWords": true,

    "garbageWordLength": 3,

    "useGarbageWords": true,

    "useEmoji": true,

    "meaningfulWordNouns": true,

    "meaningfulWordAdjectives": false,

    "overrideDistinctionPremises": null,

    "overrideLinearPremises": null,

    "overrideSyllogismPremises": null,

    "offsetAnalogyPremises": null,

    "overrideBinaryPremises": null,

    "overrideDirectionPremises": null,

    "overrideDirection3DPremises": null,

    "overrideDirection4DPremises": null,

    "overrideAnchorSpacePremises": null,

    "overrideMultiDim5DPremises": null,

    "overrideMultiDim6DPremises": null,

    "overrideDistinctionTime": null,

    "overrideLinearTime": null,

    "overrideSyllogismTime": null,

    "offsetAnalogyTime": null,

    "overrideBinaryTime": null,

    "overrideDirectionTime": null,

    "overrideDirection3DTime": null,

    "overrideDirection4DTime": null,

    "overrideAnchorSpaceTime": null,

    "overrideMultiDim5DTime": null,

    "overrideMultiDim6DTime": null,

    "overrideDistinctionWeight": 150,

    "overrideLeftRightWeight": 100,

    "overrideTopUnderWeight": 100,

    "overrideComparisonWeight": 100,

    "overrideTemporalWeight": 100,

    "overrideContainsWeight": 100,

    "overrideSyllogismWeight": 100,

    "overrideDirectionWeight": 100,

    "overrideDirection3DWeight": 100,

    "overrideDirection4DWeight": 100,

    "overrideMultiDim5DWeight": 100,

    "overrideMultiDim6DWeight": 100,

    "overrideAnchorSpaceWeight": 100,

    "overrideAnchorSpaceV2Premises": null,

    "overrideAnchorSpaceV2Time": null,

    "overrideAnchorSpaceV2Weight": 100,

    "overrideSpace5DScramble": null,

    "overrideSpace6DScramble": null,

    "useJunkEmoji": true,

    "useVisualNoise": false,

    "useTopo": false,

    "visualNoiseSplits": 5,

    "space2DHardModeLevel": 0,

    "space3DHardModeLevel": 0,

    "space4DHardModeLevel": 0,

    "space5DHardModeLevel": 0,

    "space6DHardModeLevel": 0,

    "binaryHardModeLevel": 0,

    "anchorSpaceHardModeLevel": 0,

    "space3DInterference": 0,

    "space4DInterference": 0,

    "space5DInterference": 0,

    "space6DInterference": 0,

    "enableAnchorSpaceV2": false,

    "anchorSpaceV2ShapeCount": 4,

    "anchorSpaceV2HardModeLevel": 0,

    "anchorSpaceV2PauseTimer": true,

    "scrambleFactor": 80,

    "enableConnectionBranching": true,

    "enableTransformSet": true,

    "enableTransformMirror": true,

    "enableTransformScale": true,

    "enableTransformRotate": false,

    "enableTransformInterleave": false,

    "enableTransformContinuous": false,

    "autoProgression": true,

    "autoProgressionGoal": 10,

    "autoProgressionTrailing": 30,

    "autoProgressionPercentSuccess": 90,

    "autoProgressionPercentFail": 65,

    "autoProgressionGrouping": 'all-separate',

    "spoilerConclusion": false,

    "enableBacktrackingLinear": false,

    "minimalMode": false,

    "halfMinimalMode": false,

    "invertedMinimalMode": false,

    "dailyProgressGoal": null,

    "weeklyProgressGoal": null,

    "widePremises": false,

    "enableColorless": false,

    "enableMixedModes": false,

    "onlyMixedModes": false,

    "enableHarderConclusions": false,

    "autoProgressionChange": 'custom',

    "autoProgressionTimeDrop": 5,

    "autoProgressionTimeBump": 5,

    "anchorSpaceFixedPositions": false,

    "enableStimulusSets": false,

    "stimulusSetSize": 2,

    "enableDoubleDistance": false,

    "doubleDistanceFrequency": 100,

    "enableDoubleDistanceConclusions": false,

};



const defaultSavedata = structuredClone(savedata);



const compressedSettings = {

    "enableDistinction": "dist",

    "enableComparison": "comp",

    "enableSyllogism": "syll",

    "enableAnalogy": "ana",

    "enableDirection": "dir2D",

    "enableDirection3D": "dir3D",

    "enableDirection4D": "dir4D",

    "enableMultiDim5D": "md5D",

    "enableMultiDim6D": "md6D",

    "enableAnchorSpace": "anc",

    "enableBinary": "bin",

    "enableBinaryAnalogy": "binanl",

    "useMeaningfulWords": "words",

    "enableCarouselMode": "carousel",

    "carouselPremisesPerPage": "carouselPPP",

    "carouselDisableBack": "carouselNoBack",

    "carouselAutoAdvanceSeconds": "carouselAuto",

    "enableTemporal": "temp",

    "enableNegation": "neg",

    "negationFrequency": "negFreq",

    "enableConclusionNegation": "concNeg",

    "conclusionNegationFrequency": "concNegFreq",

    "vanishingPremises": "vanishPrem",

    "enableMeta": "meta",

    "onlyAnalogy": "onlyAna",

    "onlyBinary": "onlyBin",

    "maxNestedBinaryDepth": "binDepth",

    "nonsenseWordLength": "nonsenseLen",

    "useNonsenseWords": "nonsense",

    "garbageWordLength": "garbageLen",

    "useGarbageWords": "garbage",

    "useEmoji": "emoji",

    "meaningfulWordNouns": "nouns",

    "meaningfulWordAdjectives": "adjectives",

    "overrideDistinctionPremises": "distP",

    "overrideComparisonPremises": "compP",

    "overrideTemporalPremises": "tempP",

    "overrideSyllogismPremises": "syllP",

    "offsetAnalogyPremises": "anaP",

    "overrideBinaryPremises": "binP",

    "overrideDirectionPremises": "dir2DP",

    "overrideDirection3DPremises": "dir3DP",

    "overrideDirection4DPremises": "dir4DP",

    "overrideMultiDim5DPremises": "md5DP",

    "overrideMultiDim6DPremises": "md6DP",

    "overrideAnchorSpacePremises": "ancP",

    "overrideDistinctionTime": "distT",

    "overrideComparisonTime": "compT",

    "overrideTemporalTime": "tempT",

    "overrideSyllogismTime": "syllT",

    "offsetAnalogyTime": "anaT",

    "overrideBinaryTime": "binT",

    "overrideDirectionTime": "dir2DT",

    "overrideDirection3DTime": "dir3DT",

    "overrideDirection4DTime": "dir4DT",

    "overrideMultiDim5DTime": "md5DT",

    "overrideMultiDim6DTime": "md6DT",

    "overrideAnchorSpaceTime": "ancT",

    "overrideDistinctionWeight": "distW",

    "overrideLeftRightWeight": "lrW",

    "overrideTopUnderWeight": "tuW",

    "overrideComparisonWeight": "compW",

    "overrideTemporalWeight": "tempW",

    "overrideContainsWeight": "contW",

    "overrideSyllogismWeight": "syllW",

    "overrideDirectionWeight": "dir2DW",

    "overrideDirection3DWeight": "dir3DW",

    "overrideDirection4DWeight": "dir4DW",

    "overrideMultiDim5DWeight": "md5dW",

    "overrideMultiDim6DWeight": "md6dW",

    "overrideAnchorSpaceWeight": "ancW",

    "overrideDistinctionScramble": "distScr",

    "overrideLinearScramble": "linScr",

    "overrideSpace2DScramble": "dir2DScr",

    "overrideSpace3DScramble": "dir3DScr",

    "overrideSpace4DScramble": "dir4DScr",

    "overrideSpace5DScramble": "md5DScr",

    "overrideSpace6DScramble": "md6DScr",

    "overrideSyllogismScramble": "syllScr",

    "overrideAnalogyScramble": "anaScr",

    "overrideAnchorSpaceScramble": "ancScr",

    "overrideAnchorSpaceV2Scramble": "ancV2Scr",

    "overrideBinaryScramble": "binScr",

    "useJunkEmoji": "junk",

    "useVisualNoise": "vnoise",

    "useTopo": "topo",

    "visualNoiseSplits": "vsplits",

    "space2DHardModeLevel": "transform2D",

    "space3DHardModeLevel": "transform3D",

    "space4DHardModeLevel": "transform4D",

    "space5DHardModeLevel": "transform5D",

    "space6DHardModeLevel": "transform6D",

    "binaryHardModeLevel": "transformBinary",

    "anchorSpaceHardModeLevel": "ancTfm",

    "space3DInterference": "i3D",

    "space4DInterference": "i4D",

    "space5DInterference": "i5D",

    "space6DInterference": "i6D",

    "enableAnchorSpaceV2": "ancV2",

    "anchorSpaceV2ShapeCount": "ancV2C",

    "anchorSpaceV2HardModeLevel": "ancV2T",

    "anchorSpaceV2PauseTimer": "ancV2P",

    "scrambleFactor": "scrambleF",

    "enableConnectionBranching": "branch",

    "enableTransformSet": "tset",

    "enableTransformMirror": "tMirror",

    "enableTransformScale": "tScale",

    "enableTransformRotate": "tRotate",

    "enableTransformInterleave": "tInterleave",

    "enableTransformContinuous": "tContinuous",

    "autoProgression": "auto",

    "autoProgressionGoal": "goal",

    "autoProgressionTrailing": "autoT",

    "autoProgressionPercentSuccess": "autoS",

    "autoProgressionPercentFail": "autoF",

    "autoProgressionGrouping": 'autoG',

    "autoProgressionChange": 'autoC',

    "autoProgressionTimeDrop": 'autoTD',

    "autoProgressionTimeBump": 'autoTB',

    "spoilerConclusion": "spoiler",

    "enableBacktrackingComparison": "backC",

    "enableBacktrackingTemporal": "backT",

    "enableLinear": "lin",

    "linearWording": 'linW',

    "overrideLinearPremises": "linP",

    "overrideLinearTime": "linT",

    "enableBacktrackingLinear": "backL",

    "minimalMode": "min",

    "halfMinimalMode": "halfMin",

    "invertedMinimalMode": "invMin",

    "multipleConclusionsMode": "multiConc",

    "numConclusions": "numConc",

    "timeBonusPerConclusionEnabled": "timeBonusEnabled",

    "timeBonusPerConclusion": "timeBonus",

    "dailyProgressGoal": "dGoal",

    "weeklyProgressGoal": "wGoal",

    "widePremises": "wide",

    "enableColorless": "colorless",

    "enableMixedModes": "mixed",

    "onlyMixedModes": "onlyMixed",

    "enableHarderConclusions": "hardConc",

    "enableStimulusSets": "stimSets",

    "stimulusSetSize": "stimSetSize",

};



const keySettingMap = {
    "p-1": "enableDistinction",
    "p-1-premises": "overrideDistinctionPremises",
    "p-1-time": "overrideDistinctionTime",
    "p-1-scramble": "overrideDistinctionScramble",
    "p-2": "enableLinear",
    "p-2-premises": "overrideLinearPremises",
    "p-2-time": "overrideLinearTime",
    "p-2-scramble": "overrideLinearScramble",
    "p-3": "enableSyllogism",
    "p-3-premises": "overrideSyllogismPremises",
    "p-3-time": "overrideSyllogismTime",
    "p-3-scramble": "overrideSyllogismScramble",
    "p-4": "enableAnalogy",
    "p-4-premises": "offsetAnalogyPremises",
    "p-4-time": "offsetAnalogyTime",
    "p-4-scramble": "overrideAnalogyScramble",
    "p-4-invert": "invertAnalogyConclusion",
    "p-4-invert-freq": "invertAnalogyConclusionFreq",
    "p-5": "premises",
    "p-6": "enableDirection",
    "p-6-premises": "overrideDirectionPremises",
    "p-6-time": "overrideDirectionTime",
    "p-6-scramble": "overrideSpace2DScramble",
    "p-7": "enableBinary",

    "p-7a": "enableBinaryAnalogy",
    "p-7-premises": "overrideBinaryPremises",
    "p-7-time": "overrideBinaryTime",
    "p-7-scramble": "overrideBinaryScramble",
    "p-8": "useMeaningfulWords",
    "p-9": "enableCarouselMode",
    "p-9-premises": "carouselPremisesPerPage",
    "p-9-noback": "carouselDisableBack",
    "p-9-auto": "carouselAutoAdvanceSeconds",
    "p-11": "enableNegation",
    "p-11-freq": "negationFrequency",
    "p-11-conc": "enableConclusionNegation",
    "p-11-conc-freq": "conclusionNegationFrequency",
    "p-11-vanish": "vanishingPremises",
    "p-12": "enableDirection3D",
    "p-12-premises": "overrideDirection3DPremises",
    "p-12-time": "overrideDirection3DTime",
    "p-12-scramble": "overrideSpace3DScramble",
    "p-13": "enableDirection4D",
    "p-13-premises": "overrideDirection4DPremises",
    "p-13-time": "overrideDirection4DTime",
    "p-13-scramble": "overrideSpace4DScramble",
    "p-13-5d": "enableMultiDim5D",
    "p-13-5d-premises": "overrideMultiDim5DPremises",
    "p-md5d-weight": "overrideMultiDim5DWeight",
    "p-13-5d-time": "overrideMultiDim5DTime",
    "p-13-5d-scramble": "overrideSpace5DScramble",
    "p-13-6d": "enableMultiDim6D",
    "p-13-6d-premises": "overrideMultiDim6DPremises",
    "p-md6d-weight": "overrideMultiDim6DWeight",
    "p-13-6d-time": "overrideMultiDim6DTime",
    "p-13-6d-scramble": "overrideSpace6DScramble",
    "p-14": "onlyAnalogy",
    "p-15": "onlyBinary",
    "p-16": "enableMeta",
    "p-17": "maxNestedBinaryDepth",
    "p-19": "nonsenseWordLength",
    "p-20": "useNonsenseWords",
    "p-21": "useEmoji",
    "p-22": "meaningfulWordNouns",
    "p-23": "meaningfulWordAdjectives",
    "p-26": "garbageWordLength",
    "p-27": "useGarbageWords",
    "p-28": "useJunkEmoji",
    "p-29": "space2DHardModeLevel",
    "p-30": "space3DHardModeLevel",
    "p-30-int": "space3DInterference",
    "p-31": "scrambleFactor",
    "p-32": "enableConnectionBranching",
    "p-33": "space4DHardModeLevel",
    "p-33-int": "space4DInterference",
    "p-33-5d": "space5DHardModeLevel",
    "p-33-5d-int": "space5DInterference",
    "p-33-6d": "space6DHardModeLevel",
    "p-33-6d-int": "space6DInterference",
    "p-33-anc": "anchorSpaceHardModeLevel",
    "p-34": "enableTransformSet",
    "p-35": "enableTransformMirror",
    "p-36": "enableTransformScale",
    "p-37": "enableTransformRotate",
    "p-38": "useVisualNoise",
    "p-39": "visualNoiseSplits",
    "p-70": "useTopo",
    "p-71": "stimulusSize",
    "p-40": "enableTransformInterleave",

    "p-40c": "enableTransformContinuous",
    "p-41": "autoProgression",
    "p-42": "autoProgressionGoal",
    "p-43": "enableAnchorSpace",
    "p-44-premises": "overrideAnchorSpacePremises",
    "p-45-time": "overrideAnchorSpaceTime",
    "p-43-scramble": "overrideAnchorSpaceScramble",
    "p-anc-v2": "enableAnchorSpaceV2",
    "p-anc-v2-count": "anchorSpaceV2ShapeCount",
    "p-anc-v2-hard": "anchorSpaceV2HardModeLevel",
    "p-anc-v2-pause": "anchorSpaceV2PauseTimer",
    "p-anc-v2-premises": "overrideAnchorSpaceV2Premises",
    "p-anc-v2-time": "overrideAnchorSpaceV2Time",
    "p-anc-v2-weight": "overrideAnchorSpaceV2Weight",
    "p-anc-v2-scramble": "overrideAnchorSpaceV2Scramble",
    "p-anc-v2-fixed": "anchorSpaceFixedPositions",
    "p-46": "spoilerConclusion",
    "p-47": "enableBacktrackingLinear",
    "p-48": "minimalMode",
    "p-48-half": "halfMinimalMode",
    "p-48-inverted": "invertedMinimalMode",
    "p-multi-conc": "multipleConclusionsMode",
    "p-num-conc": "numConclusions",
    "p-time-bonus-enabled": "timeBonusPerConclusionEnabled",
    "p-time-bonus-amount": "timeBonusPerConclusion",
    "p-49": "autoProgressionTrailing",
    "p-50": "autoProgressionPercentSuccess",
    "p-51": "autoProgressionPercentFail",
    "p-52": "autoProgressionGrouping",
    "p-53": "overrideDistinctionWeight",
    "p-54": "overrideLeftRightWeight",
    "p-55": "overrideTopUnderWeight",
    "p-56": "overrideComparisonWeight",
    "p-57": "overrideTemporalWeight",
    "p-58": "overrideSyllogismWeight",
    "p-59": "overrideDirectionWeight",
    "p-60": "overrideDirection3DWeight",
    "p-61": "overrideDirection4DWeight",
    "p-62": "overrideAnchorSpaceWeight",
    "p-63-optional": "dailyProgressGoal",
    "p-64-optional": "weeklyProgressGoal",
    "p-65": "overrideContainsWeight",
    "p-66": "widePremises",
    "p-colorless": "enableColorless",
    "p-mixed": "enableMixedModes",
    "p-mixed-only": "onlyMixedModes",
    "p-hard-conc": "enableHarderConclusions",
    "p-67": "autoProgressionChange",
    "p-68": "autoProgressionTimeDrop",
    "p-69": "autoProgressionTimeBump",
    "p-stim-sets": "enableStimulusSets",
    "p-stim-set-size": "stimulusSetSize",
    "p-double-distance": "enableDoubleDistance",
    "p-double-distance-freq": "doubleDistanceFrequency",
    "p-double-distance-conclusions": "enableDoubleDistanceConclusions",
    "p-binary-transform": "binaryHardModeLevel",
};



const legacySettings = [

    "enableDirection4D",

    "enableAnchorSpace",

    "enableAnchorSpaceV2",

    "enableBinary",

    "enableBinaryAnalogy",

    "enableCarouselMode",

    "enableNegation",

    "enableMeta",

    "onlyAnalogy",

    "onlyBinary",

    "maxNestedBinaryDepth",

    "offsetAnalogyPremises",

    "overrideBinaryPremises",

    "overrideDirection4DPremises",

    "overrideAnchorSpacePremises",

    "overrideAnchorSpaceV2Premises",

    "offsetAnalogyTime",

    "overrideBinaryTime",

    "overrideDirection4DTime",

    "overrideAnchorSpaceTime",

    "overrideAnchorSpaceV2Time",

    "overrideDirection4DWeight",

    "overrideAnchorSpaceV2Weight",

    "overrideAnchorSpaceWeight",

    "space2DHardModeLevel",

    "space3DHardModeLevel",

    "space4DHardModeLevel",

    "anchorSpaceHardModeLevel",

    "anchorSpaceV2HardModeLevel",

    "anchorSpaceV2ShapeCount",

    "enableTransformSet",

    "enableTransformMirror",

    "enableTransformScale",

    "enableTransformRotate",

    "enableTransformInterleave",

    "enableTransformContinuous",

    "enableStimulusSets",

    "stimulusSetSize",

];



const meaningfulWords = {

    nouns: [

        "People",

        "History",

        "Way",

        "Art",

        "World",

        "Information",

        "Map",

        "Two",

        "Family",

        "Government",

        "Health",

        "System",

        "Computer",

        "Meat",

        "Year",

        "Thanks",

        "Music",

        "Person",

        "Reading",

        "Method",

        "Data",

        "Food",

        "Understanding",

        "Theory",

        "Law",

        "Bird",

        "Literature",

        "Problem",

        "Software",

        "Control",

        "Knowledge",

        "Power",

        "Ability",

        "Economics",

        "Love",

        "Internet",

        "Television",

        "Science",

        "Library",

        "Nature",

        "Fact",

        "Product",

        "Idea",

        "Temperature",

        "Investment",

        "Area",

        "Society",

        "Activity",

        "Story",

        "Industry",

        "Media",

        "Thing",

        "Oven",

        "Community",

        "Definition",

        "Safety",

        "Quality",

        "Development",

        "Language",

        "Management",

        "Player",

        "Variety",

        "Video",

        "Week",

        "Security",

        "Country",

        "Exam",

        "Movie",

        "Organization",

        "Equipment",

        "Physics",

        "Analysis",

        "Policy",

        "Series",

        "Thought",

        "Basis",

        "Boyfriend",

        "Direction",

        "Strategy",

        "Technology",

        "Army",

        "Camera",

        "Freedom",

        "Paper",

        "Environment",

        "Child",

        "Instance",

        "Month",

        "Truth",

        "Marketing",

        "University",

        "Writing",

        "Article",

        "Department",

        "Difference",

        "Goal",

        "News",

        "Audience",

        "Fishing",

        "Growth",

        "Income",

        "Marriage",

        "User",

        "Combination",

        "Failure",

        "Meaning",

        "Medicine",

        "Philosophy",

        "Teacher",

        "Communication",

        "Night",

        "Chemistry",

        "Disease",

        "Disk",

        "Energy",

        "Nation",

        "Road",

        "Role",

        "Soup",

        "Advertising",

        "Location",

        "Success",

        "Addition",

        "Apartment",

        "Education",

        "Math",

        "Moment",

        "Painting",

        "Politics",

        "Attention",

        "Decision",

        "Event",

        "Property",

        "Shopping",

        "Student",

        "Wood",

        "Competition",

        "Distribution",

        "Entertainment",

        "Office",

        "Population",

        "President",

        "Unit",

        "Category",

        "Cigarette",

        "Context",

        "Introduction",

        "Opportunity",

        "Performance",

        "Driver",

        "Flight",

        "Length",

        "Magazine",

        "Newspaper",

        "Relationship",

        "Teaching",

        "Cell",

        "Dealer",

        "Finding",

        "Lake",

        "Member",

        "Message",

        "Phone",

        "Scene",

        "Appearance",

        "Association",

        "Concept",

        "Customer",

        "Death",

        "Discussion",

        "Housing",

        "Inflation",

        "Insurance",

        "Mood",

        "Woman",

        "Advice",

        "Blood",

        "Effort",

        "Expression",

        "Importance",

        "Opinion",

        "Payment",

        "Reality",

        "Responsibility",

        "Situation",

        "Skill",

        "Statement",

        "Wealth",

        "Application",

        "City",

        "County",

        "Depth",

        "Estate",

        "Foundation",

        "Grandmother",

        "Heart",

        "Perspective",

        "Photo",

        "Recipe",

        "Studio",

        "Topic",

        "Collection",

        "Depression",

        "Imagination",

        "Passion",

        "Percentage",

        "Resource",

        "Setting",

        "Ad",

        "Agency",

        "College",

        "Connection",

        "Criticism",

        "Debt",

        "Description",

        "Memory",

        "Patience",

        "Secretary",

        "Solution",

        "Administration",

        "Aspect",

        "Attitude",

        "Director",

        "Personality",

        "Psychology",

        "Recommendation",

        "Response",

        "Selection",

        "Storage",

        "Version",

        "Alcohol",

        "Argument",

        "Complaint",

        "Contract",

        "Emphasis",

        "Highway",

        "Loss",

        "Membership",

        "Possession",

        "Preparation",

        "Steak",

        "Union",

        "Agreement",

        "Cancer",

        "Currency",

        "Employment",

        "Engineering",

        "Entry",

        "Interaction",

        "Mixture",

        "Preference",

        "Region",

        "Republic",

        "Tradition",

        "Virus",

        "Actor",

        "Classroom",

        "Delivery",

        "Device",

        "Difficulty",

        "Drama",

        "Election",

        "Engine",

        "Football",

        "Guidance",

        "Hotel",

        "Owner",

        "Priority",

        "Protection",

        "Suggestion",

        "Tension",

        "Variation",

        "Anxiety",

        "Atmosphere",

        "Awareness",

        "Bath",

        "Bread",

        "Candidate",

        "Climate",

        "Comparison",

        "Confusion",

        "Construction",

        "Elevator",

        "Emotion",

        "Employee",

        "Employer",

        "Guest",

        "Height",

        "Leadership",

        "Mall",

        "Manager",

        "Operation",

        "Recording",

        "Sample",

        "Transportation",

        "Charity",

        "Cousin",

        "Disaster",

        "Editor",

        "Efficiency",

        "Excitement",

        "Extent",

        "Feedback",

        "Guitar",

        "Homework",

        "Leader",

        "Mom",

        "Outcome",

        "Permission",

        "Presentation",

        "Promotion",

        "Reflection",

        "Refrigerator",

        "Resolution",

        "Revenue",

        "Session",

        "Singer",

        "Tennis",

        "Basket",

        "Bonus",

        "Cabinet",

        "Childhood",

        "Church",

        "Clothes",

        "Coffee",

        "Dinner",

        "Drawing",

        "Hair",

        "Hearing",

        "Initiative",

        "Judgment",

        "Lab",

        "Measurement",

        "Mode",

        "Mud",

        "Orange",

        "Poetry",

        "Police",

        "Possibility",

        "Procedure",

        "Queen",

        "Ratio",

        "Relation",

        "Restaurant",

        "Satisfaction",

        "Sector",

        "Signature",

        "Significance",

        "Song",

        "Tooth",

        "Town",

        "Vehicle",

        "Volume",

        "Wife",

        "Accident",

        "Airport",

        "Appointment",

        "Arrival",

        "Assumption",

        "Baseball",

        "Chapter",

        "Committee",

        "Conversation",

        "Database",

        "Enthusiasm",

        "Error",

        "Explanation",

        "Farmer",

        "Gate",

        "Girl",

        "Hall",

        "Historian",

        "Hospital",

        "Injury",

        "Instruction",

        "Maintenance",

        "Manufacturer",

        "Meal",

        "Perception",

        "Pie",

        "Poem",

        "Presence",

        "Proposal",

        "Reception",

        "Replacement",

        "Revolution",

        "River",

        "Son",

        "Speech",

        "Tea",

        "Village",

        "Warning",

        "Winner",

        "Worker",

        "Writer",

        "Assistance",

        "Breath",

        "Buyer",

        "Chest",

        "Chocolate",

        "Conclusion",

        "Contribution",

        "Cookie",

        "Courage",

        "Dad",

        "Desk",

        "Drawer",

        "Establishment",

        "Examination",

        "Garbage",

        "Grocery",

        "Honey",

        "Impression",

        "Improvement",

        "Independence",

        "Insect",

        "Inspection",

        "Inspector",

        "King",

        "Ladder",

        "Menu",

        "Penalty",

        "Piano",

        "Potato",

        "Profession",

        "Professor",

        "Quantity",

        "Reaction",

        "Requirement",

        "Salad",

        "Sister",

        "Supermarket",

        "Tongue",

        "Weakness",

        "Wedding",

        "Affair",

        "Ambition",

        "Analyst",

        "Apple",

        "Assignment",

        "Assistant",

        "Bathroom",

        "Bedroom",

        "Beer",

        "Birthday",

        "Celebration",

        "Championship",

        "Cheek",

        "Client",

        "Consequence",

        "Departure",

        "Diamond",

        "Dirt",

        "Ear",

        "Fortune",

        "Friendship",

        "Funeral",

        "Gene",

        "Girlfriend",

        "Hat",

        "Indication",

        "Intention",

        "Lady",

        "Midnight",

        "Negotiation",

        "Obligation",

        "Passenger",

        "Pizza",

        "Platform",

        "Poet",

        "Pollution",

        "Recognition",

        "Reputation",

        "Shirt",

        "Sir",

        "Speaker",

        "Stranger",

        "Surgery",

        "Sympathy",

        "Tale",

        "Throat",

        "Trainer",

        "Uncle",

        "Youth",

        "Time",

        "Work",

        "Film",

        "Water",

        "Money",

        "Example",

        "While",

        "Business",

        "Study",

        "Game",

        "Life",

        "Form",

        "Air",

        "Day",

        "Place",

        "Number",

        "Part",

        "Field",

        "Fish",

        "Back",

        "Process",

        "Heat",

        "Hand",

        "Experience",

        "Job",

        "Book",

        "End",

        "Point",

        "Type",

        "Home",

        "Economy",

        "Value",

        "Body",

        "Market",

        "Guide",

        "Interest",

        "State",

        "Radio",

        "Course",

        "Company",

        "Price",

        "Size",

        "Card",

        "List",

        "Mind",

        "Trade",

        "Line",

        "Care",

        "Group",

        "Risk",

        "Word",

        "Fat",

        "Force",

        "Key",

        "Light",

        "Training",

        "Name",

        "School",

        "Top",

        "Amount",

        "Level",

        "Order",

        "Practice",

        "Research",

        "Sense",

        "Service",

        "Piece",

        "Web",

        "Boss",

        "Sport",

        "Fun",

        "House",

        "Page",

        "Term",

        "Test",

        "Answer",

        "Sound",

        "Focus",

        "Matter",

        "Kind",

        "Soil",

        "Board",

        "Oil",

        "Picture",

        "Access",

        "Garden",

        "Range",

        "Rate",

        "Reason",

        "Future",

        "Site",

        "Demand",

        "Exercise",

        "Image",

        "Case",

        "Cause",

        "Coast",

        "Action",

        "Age",

        "Bad",

        "Boat",

        "Record",

        "Result",

        "Section",

        "Building",

        "Mouse",

        "Cash",

        "Class",

        "Nothing",

        "Period",

        "Plan",

        "Store",

        "Tax",

        "Side",

        "Subject",

        "Space",

        "Rule",

        "Stock",

        "Weather",

        "Chance",

        "Figure",

        "Man",

        "Model",

        "Source",

        "Beginning",

        "Earth",

        "Program",

        "Chicken",

        "Design",

        "Feature",

        "Head",

        "Material",

        "Purpose",

        "Question",

        "Rock",

        "Salt",

        "Act",

        "Birth",

        "Car",

        "Dog",

        "Object",

        "Scale",

        "Sun",

        "Note",

        "Profit",

        "Rent",

        "Speed",

        "Style",

        "War",

        "Bank",

        "Craft",

        "Half",

        "Inside",

        "Outside",

        "Standard",

        "Bus",

        "Exchange",

        "Eye",

        "Fire",

        "Position",

        "Pressure",

        "Stress",

        "Advantage",

        "Benefit",

        "Box",

        "Frame",

        "Issue",

        "Step",

        "Cycle",

        "Face",

        "Item",

        "Metal",

        "Paint",

        "Review",

        "Room",

        "Screen",

        "Structure",

        "View",

        "Account",

        "Ball",

        "Discipline",

        "Medium",

        "Share",

        "Balance",

        "Bit",

        "Black",

        "Bottom",

        "Choice",

        "Gift",

        "Impact",

        "Machine",

        "Shape",

        "Tool",

        "Wind",

        "Address",

        "Average",

        "Career",

        "Culture",

        "Morning",

        "Pot",

        "Sign",

        "Table",

        "Task",

        "Condition",

        "Contact",

        "Credit",

        "Egg",

        "Hope",

        "Ice",

        "Network",

        "North",

        "Square",

        "Attempt",

        "Date",

        "Effect",

        "Link",

        "Post",

        "Star",

        "Voice",

        "Capital",

        "Challenge",

        "Friend",

        "Self",

        "Shot",

        "Brush",

        "Couple",

        "Debate",

        "Exit",

        "Front",

        "Function",

        "Lack",

        "Living",

        "Plant",

        "Plastic",

        "Spot",

        "Summer",

        "Taste",

        "Theme",

        "Track",

        "Wing",

        "Brain",

        "Button",

        "Click",

        "Desire",

        "Foot",

        "Gas",

        "Influence",

        "Notice",

        "Rain",

        "Wall",

        "Base",

        "Damage",

        "Distance",

        "Feeling",

        "Pair",

        "Savings",

        "Staff",

        "Sugar",

        "Target",

        "Text",

        "Animal",

        "Author",

        "Budget",

        "Discount",

        "File",

        "Ground",

        "Lesson",

        "Minute",

        "Officer",

        "Phase",

        "Reference",

        "Register",

        "Sky",

        "Stage",

        "Stick",

        "Title",

        "Trouble",

        "Bowl",

        "Bridge",

        "Campaign",

        "Character",

        "Club",

        "Edge",

        "Evidence",

        "Fan",

        "Letter",

        "Lock",

        "Maximum",

        "Novel",

        "Option",

        "Pack",

        "Park",

        "Plenty",

        "Quarter",

        "Skin",

        "Sort",

        "Weight",

        "Baby",

        "Background",

        "Carry",

        "Dish",

        "Factor",

        "Fruit",

        "Glass",

        "Joint",

        "Master",

        "Muscle",

        "Red",

        "Strength",

        "Traffic",

        "Trip",

        "Vegetable",

        "Appeal",

        "Chart",

        "Gear",

        "Ideal",

        "Kitchen",

        "Land",

        "Log",

        "Mother",

        "Net",

        "Party",

        "Principle",

        "Relative",

        "Sale",

        "Season",

        "Signal",

        "Spirit",

        "Street",

        "Tree",

        "Wave",

        "Belt",

        "Bench",

        "Commission",

        "Copy",

        "Drop",

        "Minimum",

        "Path",

        "Progress",

        "Project",

        "Sea",

        "South",

        "Status",

        "Stuff",

        "Ticket",

        "Tour",

        "Angle",

        "Blue",

        "Breakfast",

        "Confidence",

        "Daughter",

        "Degree",

        "Doctor",

        "Dot",

        "Dream",

        "Duty",

        "Essay",

        "Father",

        "Fee",

        "Finance",

        "Hour",

        "Juice",

        "Limit",

        "Luck",

        "Milk",

        "Mouth",

        "Peace",

        "Pipe",

        "Seat",

        "Stable",

        "Storm",

        "Substance",

        "Team",

        "Trick",

        "Afternoon",

        "Bat",

        "Beach",

        "Blank",

        "Catch",

        "Chain",

        "Consideration",

        "Cream",

        "Crew",

        "Detail",

        "Gold",

        "Interview",

        "Kid",

        "Mark",

        "Match",

        "Mission",

        "Pain",

        "Pleasure",

        "Score",

        "Screw",

        "Sex",

        "Shop",

        "Shower",

        "Suit",

        "Tone",

        "Window",

        "Agent",

        "Band",

        "Block",

        "Bone",

        "Calendar",

        "Cap",

        "Coat",

        "Contest",

        "Corner",

        "Court",

        "Cup",

        "District",

        "Door",

        "East",

        "Finger",

        "Garage",

        "Guarantee",

        "Hole",

        "Hook",

        "Implement",

        "Layer",

        "Lecture",

        "Lie",

        "Manner",

        "Meeting",

        "Nose",

        "Parking",

        "Partner",

        "Profile",

        "Respect",

        "Rice",

        "Routine",

        "Schedule",

        "Swimming",

        "Telephone",

        "Tip",

        "Winter",

        "Airline",

        "Bag",

        "Battle",

        "Bed",

        "Bill",

        "Bother",

        "Cake",

        "Code",

        "Curve",

        "Designer",

        "Dimension",

        "Dress",

        "Ease",

        "Emergency",

        "Evening",

        "Extension",

        "Farm",

        "Fight",

        "Gap",

        "Grade",

        "Holiday",

        "Horror",

        "Horse",

        "Host",

        "Husband",

        "Loan",

        "Mistake",

        "Mountain",

        "Nail",

        "Noise",

        "Occasion",

        "Package",

        "Patient",

        "Pause",

        "Phrase",

        "Proof",

        "Race",

        "Relief",

        "Sand",

        "Sentence",

        "Shoulder",

        "Smoke",

        "Stomach",

        "String",

        "Tourist",

        "Towel",

        "Vacation",

        "West",

        "Wheel",

        "Wine",

        "Arm",

        "Aside",

        "Associate",

        "Bet",

        "Blow",

        "Border",

        "Branch",

        "Breast",

        "Brother",

        "Buddy",

        "Bunch",

        "Chip",

        "Coach",

        "Cross",

        "Document",

        "Draft",

        "Dust",

        "Expert",

        "Floor",

        "God",

        "Golf",

        "Habit",

        "Iron",

        "Judge",

        "Knife",

        "Landscape",

        "League",

        "Mail",

        "Mess",

        "Native",

        "Opening",

        "Parent",

        "Pattern",

        "Pin",

        "Pool",

        "Pound",

        "Request",

        "Salary",

        "Shame",

        "Shelter",

        "Shoe",

        "Silver",

        "Tackle",

        "Tank",

        "Trust",

        "Assist",

        "Bake",

        "Bar",

        "Bell",

        "Bike",

        "Blame",

        "Boy",

        "Brick",

        "Chair",

        "Closet",

        "Clue",

        "Collar",

        "Comment",

        "Conference",

        "Devil",

        "Diet",

        "Fear",

        "Fuel",

        "Glove",

        "Jacket",

        "Lunch",

        "Monitor",

        "Mortgage",

        "Nurse",

        "Pace",

        "Panic",

        "Peak",

        "Plane",

        "Reward",

        "Row",

        "Sandwich",

        "Shock",

        "Spite",

        "Spray",

        "Surprise",

        "Till",

        "Transition",

        "Weekend",

        "Welcome",

        "Yard",

        "Alarm",

        "Bend",

        "Bicycle",

        "Bite",

        "Blind",

        "Bottle",

        "Cable",

        "Candle",

        "Clerk",

        "Cloud",

        "Concert",

        "Counter",

        "Flower",

        "Grandfather",

        "Harm",

        "Knee",

        "Lawyer",

        "Leather",

        "Load",

        "Mirror",

        "Neck",

        "Pension",

        "Plate",

        "Purple",

        "Ruin",

        "Ship",

        "Skirt",

        "Slice",

        "Snow",

        "Specialist",

        "Stroke",

        "Switch",

        "Trash",

        "Tune",

        "Zone",

        "Anger",

        "Award",

        "Bid",

        "Bitter",

        "Boot",

        "Bug",

        "Camp",

        "Candy",

        "Carpet",

        "Cat",

        "Champion",

        "Channel",

        "Clock",

        "Comfort",

        "Cow",

        "Crack",

        "Engineer",

        "Entrance",

        "Fault",

        "Grass",

        "Guy",

        "Hell",

        "Highlight",

        "Incident",

        "Island",

        "Joke",

        "Jury",

        "Leg",

        "Lip",

        "Mate",

        "Motor",

        "Nerve",

        "Passage",

        "Pen",

        "Pride",

        "Priest",

        "Prize",

        "Promise",

        "Resident",

        "Resort",

        "Ring",

        "Roof",

        "Rope",

        "Sail",

        "Scheme",

        "Script",

        "Sock",

        "Station",

        "Toe",

        "Tower",

        "Truck",

        "Witness",

        "A",

        "You",

        "It",

        "Can",

        "Will",

        "If",

        "One",

        "Many",

        "Most",

        "Other",

        "Use",

        "Make",

        "Good",

        "Look",

        "Help",

        "Go",

        "Great",

        "Being",

        "Few",

        "Might",

        "Still",

        "Public",

        "Read",

        "Keep",

        "Start",

        "Give",

        "Human",

        "Local",

        "General",

        "She",

        "Specific",

        "Long",

        "Play",

        "Feel",

        "High",

        "Tonight",

        "Put",

        "Common",

        "Set",

        "Change",

        "Simple",

        "Past",

        "Big",

        "Possible",

        "Particular",

        "Today",

        "Major",

        "Personal",

        "Current",

        "National",

        "Cut",

        "Natural",

        "Physical",

        "Show",

        "Try",

        "Check",

        "Second",

        "Call",

        "Move",

        "Pay",

        "Let",

        "Increase",

        "Single",

        "Individual",

        "Turn",

        "Ask",

        "Buy",

        "Guard",

        "Hold",

        "Main",

        "Offer",

        "Potential",

        "Professional",

        "International",

        "Travel",

        "Cook",

        "Alternative",

        "Following",

        "Special",

        "Working",

        "Whole",

        "Dance",

        "Excuse",

        "Cold",

        "Commercial",

        "Low",

        "Purchase",

        "Deal",

        "Primary",

        "Worth",

        "Fall",

        "Necessary",

        "Positive",

        "Produce",

        "Search",

        "Present",

        "Spend",

        "Talk",

        "Creative",

        "Tell",

        "Cost",

        "Drive",

        "Green",

        "Support",

        "Glad",

        "Remove",

        "Return",

        "Run",

        "Complex",

        "Due",

        "Effective",

        "Middle",

        "Regular",

        "Reserve",

        "Independent",

        "Leave",

        "Original",

        "Reach",

        "Rest",

        "Serve",

        "Watch",

        "Beautiful",

        "Charge",

        "Active",

        "Break",

        "Negative",

        "Safe",

        "Stay",

        "Visit",

        "Visual",

        "Affect",

        "Cover",

        "Report",

        "Rise",

        "Walk",

        "White",

        "Beyond",

        "Junior",

        "Pick",

        "Unique",

        "Anything",

        "Classic",

        "Final",

        "Lift",

        "Mix",

        "Private",

        "Stop",

        "Teach",

        "Western",

        "Concern",

        "Familiar",

        "Fly",

        "Official",

        "Broad",

        "Comfortable",

        "Gain",

        "Maybe",

        "Rich",

        "Save",

        "Stand",

        "Young",

        "Fail",

        "Heavy",

        "Hello",

        "Lead",

        "Listen",

        "Valuable",

        "Worry",

        "Handle",

        "Leading",

        "Meet",

        "Release",

        "Sell",

        "Finish",

        "Normal",

        "Press",

        "Ride",

        "Secret",

        "Spread",

        "Spring",

        "Tough",

        "Wait",

        "Brown",

        "Deep",

        "Display",

        "Flow",

        "Hit",

        "Objective",

        "Shoot",

        "Touch",

        "Cancel",

        "Chemical",

        "Cry",

        "Dump",

        "Extreme",

        "Push",

        "Conflict",

        "Eat",

        "Fill",

        "Formal",

        "Jump",

        "Kick",

        "Opposite",

        "Pass",

        "Pitch",

        "Remote",

        "Total",

        "Treat",

        "Vast",

        "Abuse",

        "Beat",

        "Burn",

        "Deposit",

        "Print",

        "Raise",

        "Sleep",

        "Somewhere",

        "Advance",

        "Anywhere",

        "Consist",

        "Dark",

        "Double",

        "Draw",

        "Equal",

        "Fix",

        "Hire",

        "Internal",

        "Join",

        "Kill",

        "Sensitive",

        "Tap",

        "Win",

        "Attack",

        "Claim",

        "Constant",

        "Drag",

        "Drink",

        "Guess",

        "Minor",

        "Pull",

        "Raw",

        "Soft",

        "Solid",

        "Wear",

        "Weird",

        "Wonder",

        "Annual",

        "Count",

        "Dead",

        "Doubt",

        "Feed",

        "Forever",

        "Impress",

        "Nobody",

        "Repeat",

        "Round",

        "Sing",

        "Slide",

        "Strip",

        "Whereas",

        "Wish",

        "Combine",

        "Command",

        "Dig",

        "Divide",

        "Equivalent",

        "Hang",

        "Hunt",

        "Initial",

        "March",

        "Mention",

        "Smell",

        "Spiritual",

        "Survey",

        "Tie",

        "Adult",

        "Brief",

        "Crazy",

        "Escape",

        "Gather",

        "Hate",

        "Prior",

        "Repair",

        "Rough",

        "Sad",

        "Scratch",

        "Sick",

        "Strike",

        "Employ",

        "External",

        "Hurt",

        "Illegal",

        "Laugh",

        "Lay",

        "Mobile",

        "Nasty",

        "Ordinary",

        "Respond",

        "Royal",

        "Senior",

        "Split",

        "Strain",

        "Struggle",

        "Swim",

        "Train",

        "Upper",

        "Wash",

        "Yellow",

        "Convert",

        "Crash",

        "Dependent",

        "Fold",

        "Funny",

        "Grab",

        "Hide",

        "Miss",

        "Permit",

        "Quote",

        "Recover",

        "Resolve",

        "Roll",

        "Sink",

        "Slip",

        "Spare",

        "Suspect",

        "Sweet",

        "Swing",

        "Twist",

        "Upstairs",

        "Usual",

        "Abroad",

        "Brave",

        "Calm",

        "Concentrate",

        "Estimate",

        "Grand",

        "Male",

        "Mine",

        "Prompt",

        "Quiet",

        "Refuse",

        "Regret",

        "Reveal",

        "Rush",

        "Shake",

        "Shift",

        "Shine",

        "Steal",

        "Suck",

        "Surround",

        "Anybody",

        "Bear",

        "Brilliant",

        "Dare",

        "Dear",

        "Delay",

        "Drunk",

        "Female",

        "Hurry",

        "Inevitable",

        "Invite",

        "Kiss",

        "Neat",

        "Pop",

        "Punch",

        "Quit",

        "Reply",

        "Representative",

        "Resist",

        "Rip",

        "Rub",

        "Silly",

        "Smile",

        "Spell",

        "Stretch",

        "Stupid",

        "Tear",

        "Temporary",

        "Tomorrow",

        "Wake",

        "Wrap",

        "Yesterday"

    ],

    adjectives: [

        "Abandoned",

        "Able",

        "Absolute",

        "Adorable",

        "Adventurous",

        "Academic",

        "Acceptable",

        "Acclaimed",

        "Accomplished",

        "Accurate",

        "Aching",

        "Acidic",

        "Acrobatic",

        "Active",

        "Actual",

        "Adept",

        "Admirable",

        "Admired",

        "Adolescent",

        "Adorable",

        "Adored",

        "Advanced",

        "Afraid",

        "Affectionate",

        "Aged",

        "Aggravating",

        "Aggressive",

        "Agile",

        "Agitated",

        "Agonizing",

        "Agreeable",

        "Ajar",

        "Alarmed",

        "Alarming",

        "Alert",

        "Alienated",

        "Alive",

        "All",

        "Altruistic",

        "Amazing",

        "Ambitious",

        "Ample",

        "Amused",

        "Amusing",

        "Anchored",

        "Ancient",

        "Angelic",

        "Angry",

        "Anguished",

        "Animated",

        "Annual",

        "Another",

        "Antique",

        "Anxious",

        "Any",

        "Apprehensive",

        "Appropriate",

        "Apt",

        "Arctic",

        "Arid",

        "Aromatic",

        "Artistic",

        "Ashamed",

        "Assured",

        "Astonishing",

        "Athletic",

        "Attached",

        "Attentive",

        "Attractive",

        "Austere",

        "Authentic",

        "Authorized",

        "Automatic",

        "Avaricious",

        "Average",

        "Aware",

        "Awesome",

        "Awful",

        "Awkward",

        "Babyish",

        "Bad",

        "Back",

        "Baggy",

        "Bare",

        "Barren",

        "Basic",

        "Beautiful",

        "Belated",

        "Beloved",

        "Beneficial",

        "Better",

        "Best",

        "Bewitched",

        "Big",

        "Big-hearted",

        "Biodegradable",

        "Bite-sized",

        "Bitter",

        "Black",

        "Black-and-white",

        "Bland",

        "Blank",

        "Blaring",

        "Bleak",

        "Blind",

        "Blissful",

        "Blond",

        "Blue",

        "Blushing",

        "Bogus",

        "Boiling",

        "Bold",

        "Bony",

        "Boring",

        "Bossy",

        "Both",

        "Bouncy",

        "Bountiful",

        "Bowed",

        "Brave",

        "Breakable",

        "Brief",

        "Bright",

        "Brilliant",

        "Brisk",

        "Broken",

        "Bronze",

        "Brown",

        "Bruised",

        "Bubbly",

        "Bulky",

        "Bumpy",

        "Buoyant",

        "Burdensome",

        "Burly",

        "Bustling",

        "Busy",

        "Buttery",

        "Buzzing",

        "Calculating",

        "Calm",

        "Candid",

        "Canine",

        "Capital",

        "Carefree",

        "Careful",

        "Careless",

        "Caring",

        "Cautious",

        "Cavernous",

        "Celebrated",

        "Charming",

        "Cheap",

        "Cheerful",

        "Cheery",

        "Chief",

        "Chilly",

        "Chubby",

        "Circular",

        "Classic",

        "Clean",

        "Clear",

        "Clear-cut",

        "Clever",

        "Close",

        "Closed",

        "Cloudy",

        "Clueless",

        "Clumsy",

        "Cluttered",

        "Coarse",

        "Cold",

        "Colorful",

        "Colorless",

        "Colossal",

        "Comfortable",

        "Common",

        "Compassionate",

        "Competent",

        "Complete",

        "Complex",

        "Complicated",

        "Composed",

        "Concerned",

        "Concrete",

        "Confused",

        "Conscious",

        "Considerate",

        "Constant",

        "Content",

        "Conventional",

        "Cooked",

        "Cool",

        "Cooperative",

        "Coordinated",

        "Corny",

        "Corrupt",

        "Costly",

        "Courageous",

        "Courteous",

        "Crafty",

        "Crazy",

        "Creamy",

        "Creative",

        "Creepy",

        "Criminal",

        "Crisp",

        "Critical",

        "Crooked",

        "Crowded",

        "Cruel",

        "Crushing",

        "Cuddly",

        "Cultivated",

        "Cultured",

        "Cumbersome",

        "Curly",

        "Curvy",

        "Cute",

        "Cylindrical",

        "Damaged",

        "Damp",

        "Dangerous",

        "Dapper",

        "Daring",

        "Darling",

        "Dark",

        "Dazzling",

        "Dead",

        "Deadly",

        "Deafening",

        "Dear",

        "Dearest",

        "Decent",

        "Decimal",

        "Decisive",

        "Deep",

        "Defenseless",

        "Defensive",

        "Defiant",

        "Deficient",

        "Definite",

        "Definitive",

        "Delayed",

        "Delectable",

        "Delicious",

        "Delightful",

        "Delirious",

        "Demanding",

        "Dense",

        "Dental",

        "Dependable",

        "Dependent",

        "Descriptive",

        "Deserted",

        "Detailed",

        "Determined",

        "Devoted",

        "Different",

        "Difficult",

        "Digital",

        "Diligent",

        "Dim",

        "Dimpled",

        "Dimwitted",

        "Direct",

        "Disastrous",

        "Discrete",

        "Disfigured",

        "Disgusting",

        "Disloyal",

        "Dismal",

        "Distant",

        "Downright",

        "Dreary",

        "Dirty",

        "Disguised",

        "Dishonest",

        "Dismal",

        "Distant",

        "Distinct",

        "Distorted",

        "Dizzy",

        "Dopey",

        "Doting",

        "Double",

        "Downright",

        "Drab",

        "Drafty",

        "Dramatic",

        "Dreary",

        "Droopy",

        "Dry",

        "Dual",

        "Dull",

        "Dutiful",

        "Each",

        "Eager",

        "Earnest",

        "Early",

        "Easy",

        "Easy-going",

        "Ecstatic",

        "Edible",

        "Educated",

        "Elaborate",

        "Elastic",

        "Elated",

        "Elderly",

        "Electric",

        "Elegant",

        "Elementary",

        "Elliptical",

        "Embarrassed",

        "Embellished",

        "Eminent",

        "Emotional",

        "Empty",

        "Enchanted",

        "Enchanting",

        "Energetic",

        "Enlightened",

        "Enormous",

        "Enraged",

        "Entire",

        "Envious",

        "Equal",

        "Equatorial",

        "Essential",

        "Esteemed",

        "Ethical",

        "Euphoric",

        "Even",

        "Evergreen",

        "Everlasting",

        "Every",

        "Evil",

        "Exalted",

        "Excellent",

        "Exemplary",

        "Exhausted",

        "Excitable",

        "Excited",

        "Exciting",

        "Exotic",

        "Expensive",

        "Experienced",

        "Expert",

        "Extraneous",

        "Extroverted",

        "Extra-large",

        "Extra-small",

        "Fabulous",

        "Failing",

        "Faint",

        "Fair",

        "Faithful",

        "Fake",

        "False",

        "Familiar",

        "Famous",

        "Fancy",

        "Fantastic",

        "Far",

        "Faraway",

        "Far-flung",

        "Far-off",

        "Fast",

        "Fat",

        "Fatal",

        "Fatherly",

        "Favorable",

        "Favorite",

        "Fearful",

        "Fearless",

        "Feisty",

        "Feline",

        "Female",

        "Feminine",

        "Few",

        "Fickle",

        "Filthy",

        "Fine",

        "Finished",

        "Firm",

        "First",

        "Firsthand",

        "Fitting",

        "Fixed",

        "Flaky",

        "Flamboyant",

        "Flashy",

        "Flat",

        "Flawed",

        "Flawless",

        "Flickering",

        "Flimsy",

        "Flippant",

        "Flowery",

        "Fluffy",

        "Fluid",

        "Flustered",

        "Focused",

        "Fond",

        "Foolhardy",

        "Foolish",

        "Forceful",

        "Forked",

        "Formal",

        "Forsaken",

        "Forthright",

        "Fortunate",

        "Fragrant",

        "Frail",

        "Frank",

        "Frayed",

        "Free",

        "French",

        "Fresh",

        "Frequent",

        "Friendly",

        "Frightened",

        "Frightening",

        "Frigid",

        "Frilly",

        "Frizzy",

        "Frivolous",

        "Front",

        "Frosty",

        "Frozen",

        "Frugal",

        "Fruitful",

        "Full",

        "Fumbling",

        "Functional",

        "Funny",

        "Fussy",

        "Fuzzy",

        "Gargantuan",

        "Gaseous",

        "General",

        "Generous",

        "Gentle",

        "Genuine",

        "Giant",

        "Giddy",

        "Gigantic",

        "Gifted",

        "Giving",

        "Glamorous",

        "Glaring",

        "Glass",

        "Gleaming",

        "Gleeful",

        "Glistening",

        "Glittering",

        "Gloomy",

        "Glorious",

        "Glossy",

        "Glum",

        "Golden",

        "Good",

        "Good-natured",

        "Gorgeous",

        "Graceful",

        "Gracious",

        "Grand",

        "Grandiose",

        "Granular",

        "Grateful",

        "Grave",

        "Gray",

        "Great",

        "Greedy",

        "Green",

        "Gregarious",

        "Grim",

        "Grimy",

        "Gripping",

        "Grizzled",

        "Gross",

        "Grotesque",

        "Grouchy",

        "Grounded",

        "Growing",

        "Growling",

        "Grown",

        "Grubby",

        "Gruesome",

        "Grumpy",

        "Guilty",

        "Gullible",

        "Gummy",

        "Hairy",

        "Half",

        "Handmade",

        "Handsome",

        "Handy",

        "Happy",

        "Happy-go-lucky",

        "Hard",

        "Hard-to-find",

        "Harmful",

        "Harmless",

        "Harmonious",

        "Harsh",

        "Hasty",

        "Hateful",

        "Haunting",

        "Healthy",

        "Heartfelt",

        "Hearty",

        "Heavenly",

        "Heavy",

        "Hefty",

        "Helpful",

        "Helpless",

        "Hidden",

        "Hideous",

        "High",

        "High-level",

        "Hilarious",

        "Hoarse",

        "Hollow",

        "Homely",

        "Honest",

        "Honorable",

        "Honored",

        "Hopeful",

        "Horrible",

        "Hospitable",

        "Hot",

        "Huge",

        "Humble",

        "Humiliating",

        "Humming",

        "Humongous",

        "Hungry",

        "Hurtful",

        "Husky",

        "Icky",

        "Icy",

        "Ideal",

        "Idealistic",

        "Identical",

        "Idle",

        "Idiotic",

        "Idolized",

        "Ignorant",

        "Ill",

        "Illegal",

        "Ill-fated",

        "Ill-informed",

        "Illiterate",

        "Illustrious",

        "Imaginary",

        "Imaginative",

        "Immaculate",

        "Immaterial",

        "Immediate",

        "Immense",

        "Impassioned",

        "Impeccable",

        "Impartial",

        "Imperfect",

        "Imperturbable",

        "Impish",

        "Impolite",

        "Important",

        "Impossible",

        "Impractical",

        "Impressionable",

        "Impressive",

        "Improbable",

        "Impure",

        "Inborn",

        "Incomparable",

        "Incompatible",

        "Incomplete",

        "Inconsequential",

        "Incredible",

        "Indelible",

        "Inexperienced",

        "Indolent",

        "Infamous",

        "Infantile",

        "Infatuated",

        "Inferior",

        "Infinite",

        "Informal",

        "Innocent",

        "Insecure",

        "Insidious",

        "Insignificant",

        "Insistent",

        "Instructive",

        "Insubstantial",

        "Intelligent",

        "Intent",

        "Intentional",

        "Interesting",

        "Internal",

        "International",

        "Intrepid",

        "Ironclad",

        "Irresponsible",

        "Irritating",

        "Itchy",

        "Jaded",

        "Jagged",

        "Jam-packed",

        "Jaunty",

        "Jealous",

        "Jittery",

        "Joint",

        "Jolly",

        "Jovial",

        "Joyful",

        "Joyous",

        "Jubilant",

        "Judicious",

        "Juicy",

        "Jumbo",

        "Junior",

        "Jumpy",

        "Juvenile",

        "Kaleidoscopic",

        "Keen",

        "Key",

        "Kind",

        "Kindhearted",

        "Kindly",

        "Klutzy",

        "Knobby",

        "Knotty",

        "Knowledgeable",

        "Knowing",

        "Known",

        "Kooky",

        "Kosher",

        "Lame",

        "Lanky",

        "Large",

        "Last",

        "Lasting",

        "Late",

        "Lavish",

        "Lawful",

        "Lazy",

        "Leading",

        "Lean",

        "Leafy",

        "Left",

        "Legal",

        "Legitimate",

        "Light",

        "Lighthearted",

        "Likable",

        "Likely",

        "Limited",

        "Limp",

        "Limping",

        "Linear",

        "Lined",

        "Liquid",

        "Little",

        "Live",

        "Lively",

        "Livid",

        "Loathsome",

        "Lone",

        "Lonely",

        "Long",

        "Long-term",

        "Loose",

        "Lopsided",

        "Lost",

        "Loud",

        "Lovable",

        "Lovely",

        "Loving",

        "Low",

        "Loyal",

        "Lucky",

        "Lumbering",

        "Luminous",

        "Lumpy",

        "Lustrous",

        "Luxurious",

        "Mad",

        "Made-up",

        "Magnificent",

        "Majestic",

        "Major",

        "Male",

        "Mammoth",

        "Married",

        "Marvelous",

        "Masculine",

        "Massive",

        "Mature",

        "Meager",

        "Mealy",

        "Mean",

        "Measly",

        "Meaty",

        "Medical",

        "Mediocre",

        "Medium",

        "Meek",

        "Mellow",

        "Melodic",

        "Memorable",

        "Menacing",

        "Merry",

        "Messy",

        "Metallic",

        "Mild",

        "Milky",

        "Mindless",

        "Miniature",

        "Minor",

        "Minty",

        "Miserable",

        "Miserly",

        "Misguided",

        "Misty",

        "Mixed",

        "Modern",

        "Modest",

        "Moist",

        "Monstrous",

        "Monthly",

        "Monumental",

        "Moral",

        "Mortified",

        "Motherly",

        "Motionless",

        "Mountainous",

        "Muddy",

        "Muffled",

        "Multicolored",

        "Mundane",

        "Murky",

        "Mushy",

        "Musty",

        "Muted",

        "Mysterious",

        "Naive",

        "Narrow",

        "Nasty",

        "Natural",

        "Naughty",

        "Nautical",

        "Near",

        "Neat",

        "Necessary",

        "Needy",

        "Negative",

        "Neglected",

        "Negligible",

        "Neighboring",

        "Nervous",

        "New",

        "Next",

        "Nice",

        "Nifty",

        "Nimble",

        "Nippy",

        "Nocturnal",

        "Noisy",

        "Nonstop",

        "Normal",

        "Notable",

        "Noted",

        "Noteworthy",

        "Novel",

        "Noxious",

        "Numb",

        "Nutritious",

        "Nutty",

        "Obedient",

        "Obese",

        "Oblong",

        "Oily",

        "Oblong",

        "Obvious",

        "Occasional",

        "Odd",

        "Oddball",

        "Offbeat",

        "Offensive",

        "Official",

        "Old",

        "Old-fashioned",

        "Only",

        "Open",

        "Optimal",

        "Optimistic",

        "Opulent",

        "Orange",

        "Orderly",

        "Organic",

        "Ornate",

        "Ornery",

        "Ordinary",

        "Original",

        "Other",

        "Our",

        "Outlying",

        "Outgoing",

        "Outlandish",

        "Outrageous",

        "Outstanding",

        "Oval",

        "Overcooked",

        "Overdue",

        "Overjoyed",

        "Overlooked",

        "Palatable",

        "Pale",

        "Paltry",

        "Parallel",

        "Parched",

        "Partial",

        "Passionate",

        "Past",

        "Pastel",

        "Peaceful",

        "Peppery",

        "Perfect",

        "Perfumed",

        "Periodic",

        "Perky",

        "Personal",

        "Pertinent",

        "Pesky",

        "Pessimistic",

        "Petty",

        "Phony",

        "Physical",

        "Piercing",

        "Pink",

        "Pitiful",

        "Plain",

        "Plaintive",

        "Plastic",

        "Playful",

        "Pleasant",

        "Pleased",

        "Pleasing",

        "Plump",

        "Plush",

        "Polished",

        "Polite",

        "Political",

        "Pointed",

        "Pointless",

        "Poised",

        "Poor",

        "Popular",

        "Portly",

        "Posh",

        "Positive",

        "Possible",

        "Potable",

        "Powerful",

        "Powerless",

        "Practical",

        "Precious",

        "Present",

        "Prestigious",

        "Pretty",

        "Precious",

        "Previous",

        "Pricey",

        "Prickly",

        "Primary",

        "Prime",

        "Pristine",

        "Private",

        "Prize",

        "Probable",

        "Productive",

        "Profitable",

        "Profuse",

        "Proper",

        "Proud",

        "Prudent",

        "Punctual",

        "Pungent",

        "Puny",

        "Pure",

        "Purple",

        "Pushy",

        "Putrid",

        "Puzzled",

        "Puzzling",

        "Quaint",

        "Qualified",

        "Quarrelsome",

        "Quarterly",

        "Queasy",

        "Querulous",

        "Questionable",

        "Quick",

        "Quick-witted",

        "Quiet",

        "Quintessential",

        "Quirky",

        "Quixotic",

        "Quizzical",

        "Radiant",

        "Ragged",

        "Rapid",

        "Rare",

        "Rash",

        "Raw",

        "Recent",

        "Reckless",

        "Rectangular",

        "Ready",

        "Real",

        "Realistic",

        "Reasonable",

        "Red",

        "Reflecting",

        "Regal",

        "Regular",

        "Reliable",

        "Relieved",

        "Remarkable",

        "Remorseful",

        "Remote",

        "Repentant",

        "Required",

        "Respectful",

        "Responsible",

        "Repulsive",

        "Revolving",

        "Rewarding",

        "Rich",

        "Rigid",

        "Right",

        "Ringed",

        "Ripe",

        "Roasted",

        "Robust",

        "Rosy",

        "Rotating",

        "Rotten",

        "Rough",

        "Round",

        "Rowdy",

        "Royal",

        "Rubbery",

        "Rundown",

        "Ruddy",

        "Rude",

        "Runny",

        "Rural",

        "Rusty",

        "Sad",

        "Safe",

        "Salty",

        "Same",

        "Sandy",

        "Sane",

        "Sarcastic",

        "Sardonic",

        "Satisfied",

        "Scaly",

        "Scarce",

        "Scared",

        "Scary",

        "Scented",

        "Scholarly",

        "Scientific",

        "Scornful",

        "Scratchy",

        "Scrawny",

        "Second",

        "Secondary",

        "Second-hand",

        "Secret",

        "Self-assured",

        "Self-reliant",

        "Selfish",

        "Sentimental",

        "Separate",

        "Serene",

        "Serious",

        "Serpentine",

        "Several",

        "Severe",

        "Shabby",

        "Shadowy",

        "Shady",

        "Shallow",

        "Shameful",

        "Shameless",

        "Sharp",

        "Shimmering",

        "Shiny",

        "Shocked",

        "Shocking",

        "Shoddy",

        "Short",

        "Short-term",

        "Showy",

        "Shrill",

        "Shy",

        "Sick",

        "Silent",

        "Silky",

        "Silly",

        "Silver",

        "Similar",

        "Simple",

        "Simplistic",

        "Sinful",

        "Single",

        "Sizzling",

        "Skeletal",

        "Skinny",

        "Sleepy",

        "Slight",

        "Slim",

        "Slimy",

        "Slippery",

        "Slow",

        "Slushy",

        "Small",

        "Smart",

        "Smoggy",

        "Smooth",

        "Smug",

        "Snappy",

        "Snarling",

        "Sneaky",

        "Sniveling",

        "Snoopy",

        "Sociable",

        "Soft",

        "Soggy",

        "Solid",

        "Somber",

        "Some",

        "Spherical",

        "Sophisticated",

        "Sore",

        "Sorrowful",

        "Soulful",

        "Soupy",

        "Sour",

        "Spanish",

        "Sparkling",

        "Sparse",

        "Specific",

        "Spectacular",

        "Speedy",

        "Spicy",

        "Spiffy",

        "Spirited",

        "Spiteful",

        "Splendid",

        "Spotless",

        "Spotted",

        "Spry",

        "Square",

        "Squeaky",

        "Squiggly",

        "Stable",

        "Staid",

        "Stained",

        "Stale",

        "Standard",

        "Starchy",

        "Stark",

        "Starry",

        "Steep",

        "Sticky",

        "Stiff",

        "Stimulating",

        "Stingy",

        "Stormy",

        "Straight",

        "Strange",

        "Steel",

        "Strict",

        "Strident",

        "Striking",

        "Striped",

        "Strong",

        "Studious",

        "Stunning",

        "Stupendous",

        "Stupid",

        "Sturdy",

        "Stylish",

        "Subdued",

        "Submissive",

        "Substantial",

        "Subtle",

        "Suburban",

        "Sudden",

        "Sugary",

        "Sunny",

        "Super",

        "Superb",

        "Superficial",

        "Superior",

        "Supportive",

        "Sure-footed",

        "Surprised",

        "Suspicious",

        "Svelte",

        "Sweaty",

        "Sweet",

        "Sweltering",

        "Swift",

        "Sympathetic",

        "Tall",

        "Talkative",

        "Tame",

        "Tan",

        "Tangible",

        "Tart",

        "Tasty",

        "Tattered",

        "Taut",

        "Tedious",

        "Teeming",

        "Tempting",

        "Tender",

        "Tense",

        "Tepid",

        "Terrible",

        "Terrific",

        "Testy",

        "Thankful",

        "That",

        "These",

        "Thick",

        "Thin",

        "Third",

        "Thirsty",

        "This",

        "Thorough",

        "Thorny",

        "Those",

        "Thoughtful",

        "Threadbare",

        "Thrifty",

        "Thunderous",

        "Tidy",

        "Tight",

        "Timely",

        "Tinted",

        "Tiny",

        "Tired",

        "Torn",

        "Total",

        "Tough",

        "Traumatic",

        "Treasured",

        "Tremendous",

        "Tragic",

        "Trained",

        "Tremendous",

        "Triangular",

        "Tricky",

        "Trifling",

        "Trim",

        "Trivial",

        "Troubled",

        "True",

        "Trusting",

        "Trustworthy",

        "Trusty",

        "Truthful",

        "Tubby",

        "Turbulent",

        "Twin",

        "Ugly",

        "Ultimate",

        "Unacceptable",

        "Unaware",

        "Uncomfortable",

        "Uncommon",

        "Unconscious",

        "Understated",

        "Unequaled",

        "Uneven",

        "Unfinished",

        "Unfit",

        "Unfolded",

        "Unfortunate",

        "Unhappy",

        "Unhealthy",

        "Uniform",

        "Unimportant",

        "Unique",

        "United",

        "Unkempt",

        "Unknown",

        "Unlawful",

        "Unlined",

        "Unlucky",

        "Unnatural",

        "Unpleasant",

        "Unrealistic",

        "Unripe",

        "Unruly",

        "Unselfish",

        "Unsightly",

        "Unsteady",

        "Unsung",

        "Untidy",

        "Untimely",

        "Untried",

        "Untrue",

        "Unused",

        "Unusual",

        "Unwelcome",

        "Unwieldy",

        "Unwilling",

        "Unwitting",

        "Unwritten",

        "Upbeat",

        "Upright",

        "Upset",

        "Urban",

        "Usable",

        "Used",

        "Useful",

        "Useless",

        "Utilized",

        "Utter",

        "Vacant",

        "Vague",

        "Vain",

        "Valid",

        "Valuable",

        "Vapid",

        "Variable",

        "Vast",

        "Velvety",

        "Venerated",

        "Vengeful",

        "Verifiable",

        "Vibrant",

        "Vicious",

        "Victorious",

        "Vigilant",

        "Vigorous",

        "Villainous",

        "Violet",

        "Violent",

        "Virtual",

        "Virtuous",

        "Visible",

        "Vital",

        "Vivacious",

        "Vivid",

        "Voluminous",

        "Wan",

        "Warlike",

        "Warm",

        "Warmhearted",

        "Warped",

        "Wary",

        "Wasteful",

        "Watchful",

        "Waterlogged",

        "Watery",

        "Wavy",

        "Wealthy",

        "Weak",

        "Weary",

        "Webbed",

        "Wee",

        "Weekly",

        "Weepy",

        "Weighty",

        "Weird",

        "Welcome",

        "Well-documented",

        "Well-groomed",

        "Well-informed",

        "Well-lit",

        "Well-made",

        "Well-off",

        "Well-to-do",

        "Well-worn",

        "Wet",

        "Which",

        "Whimsical",

        "Whirlwind",

        "Whispered",

        "White",

        "Whole",

        "Whopping",

        "Wicked",

        "Wide",

        "Wide-eyed",

        "Wiggly",

        "Wild",

        "Willing",

        "Wilted",

        "Winding",

        "Windy",

        "Winged",

        "Wiry",

        "Wise",

        "Witty",

        "Wobbly",

        "Woeful",

        "Wonderful",

        "Wooden",

        "Woozy",

        "Wordy",

        "Worldly",

        "Worn",

        "Worried",

        "Worrisome",

        "Worse",

        "Worst",

        "Worthless",

        "Worthwhile",

        "Worthy",

        "Wrathful",

        "Wretched",

        "Writhing",

        "Wrong",

        "Wry",

        "Yawning",

        "Yearly",

        "Yellow",

        "Yellowish",

        "Young",

        "Youthful",

        "Yummy",

        "Zany",

        "Zealous",

        "Zesty",

        "Zigzag"

    ]

}



const emoji = [

    "🃏",

    "🅰️",

    "🅱️",

    "🅾️",

    "🅿️",

    "🆎",

    "🆑",

    "🆒",

    "🆓",

    "🆔",

    "🆕",

    "🆖",

    "🆗",

    "🆘",

    "🆙",

    "🆚",

    "🈁",

    "🈂️",

    "🈲",

    "🈳",

    "🈴",

    "🈵",

    "🈶",

    "🈷️",

    "🈸",

    "🈹",

    "🈺",

    "🉐",

    "🉑",

    "🌀",

    "🌁",

    "🌂",

    "🌃",

    "🌄",

    "🌅",

    "🌆",

    "🌇",

    "🌈",

    "🌉",

    "🌊",

    "🌋",

    "🌌",

    "🌍",

    "🌎",

    "🌏",

    "🌐",

    "🌑",

    "🌒",

    "🌓",

    "🌔",

    "🌕",

    "🌖",

    "🌗",

    "🌘",

    "🌙",

    "🌚",

    "🌛",

    "🌜",

    "🌝",

    "🌞",

    "🌟",

    "🌠",

    "🌡️",

    "🌤️",

    "🌥️",

    "🌦️",

    "🌧️",

    "🌨️",

    "🌩️",

    "🌪️",

    "🌫️",

    "🌬️",

    "🌭",

    "🌮",

    "🌯",

    "🌰",

    "🌱",

    "🌲",

    "🌳",

    "🌴",

    "🌵",

    "🌶️",

    "🌷",

    "🌸",

    "🌹",

    "🌺",

    "🌻",

    "🌼",

    "🌽",

    "🌾",

    "🌿",

    "🍀",

    "🍁",

    "🍂",

    "🍃",

    "🍄",

    "🍅",

    "🍆",

    "🍇",

    "🍈",

    "🍉",

    "🍊",

    "🍋",

    "🍌",

    "🍍",

    "🍎",

    "🍏",

    "🍐",

    "🍑",

    "🍒",

    "🍓",

    "🍔",

    "🍕",

    "🍖",

    "🍗",

    "🍘",

    "🍙",

    "🍚",

    "🍛",

    "🍜",

    "🍝",

    "🍞",

    "🍟",

    "🍠",

    "🍡",

    "🍢",

    "🍣",

    "🍤",

    "🍥",

    "🍦",

    "🍧",

    "🍨",

    "🍩",

    "🍪",

    "🍫",

    "🍬",

    "🍭",

    "🍮",

    "🍯",

    "🍰",

    "🍱",

    "🍲",

    "🍳",

    "🍴",

    "🍵",

    "🍶",

    "🍷",

    "🍸",

    "🍹",

    "🍺",

    "🍻",

    "🍼",

    "🍽️",

    "🍾",

    "🍿",

    "🎀",

    "🎁",

    "🎂",

    "🎃",

    "🎄",

    "🎅",

    "🎆",

    "🎇",

    "🎈",

    "🎉",

    "🎊",

    "🎋",

    "🎌",

    "🎍",

    "🎎",

    "🎏",

    "🎐",

    "🎑",

    "🎒",

    "🎓",

    "🎖️",

    "🎗️",

    "🎙️",

    "🎚️",

    "🎛️",

    "🎞️",

    "🎟️",

    "🎠",

    "🎡",

    "🎢",

    "🎣",

    "🎤",

    "🎥",

    "🎦",

    "🎧",

    "🎨",

    "🎩",

    "🎪",

    "🎫",

    "🎬",

    "🎭",

    "🎮",

    "🎯",

    "🎰",

    "🎱",

    "🎲",

    "🎳",

    "🎴",

    "🎵",

    "🎶",

    "🎷",

    "🎸",

    "🎹",

    "🎺",

    "🎻",

    "🎼",

    "🎽",

    "🎾",

    "🎿",

    "🏀",

    "🏁",

    "🏂",

    "🏃",

    "🏅",

    "🏆",

    "🏇",

    "🏈",

    "🏉",

    "🏊",

    "🏌️",

    "🏍️",

    "🏎️",

    "🏏",

    "🏐",

    "🏑",

    "🏒",

    "🏓",

    "🏔️",

    "🏕️",

    "🏖️",

    "🏗️",

    "🏘️",

    "🏙️",

    "🏚️",

    "🏛️",

    "🏜️",

    "🏝️",

    "🏞️",

    "🏟️",

    "🏠",

    "🏡",

    "🏢",

    "🏤",

    "🏥",

    "🏦",

    "🏧",

    "🏨",

    "🏪",

    "🏫",

    "🏬",

    "🏭",

    "🏮",

    "🏯",

    "🏰",

    "🏳️",

    "🏴",

    "🏵️",

    "🏷️",

    "🏸",

    "🏹",

    "🏺",

    "🐀",

    "🐁",

    "🐂",

    "🐃",

    "🐄",

    "🐅",

    "🐆",

    "🐇",

    "🐈",

    "🐉",

    "🐊",

    "🐋",

    "🐌",

    "🐍",

    "🐎",

    "🐏",

    "🐐",

    "🐑",

    "🐒",

    "🐓",

    "🐔",

    "🐕",

    "🐖",

    "🐗",

    "🐘",

    "🐙",

    "🐚",

    "🐛",

    "🐜",

    "🐝",

    "🐞",

    "🐟",

    "🐠",

    "🐡",

    "🐢",

    "🐣",

    "🐤",

    "🐥",

    "🐦",

    "🐧",

    "🐨",

    "🐩",

    "🐪",

    "🐫",

    "🐬",

    "🐭",

    "🐮",

    "🐯",

    "🐰",

    "🐱",

    "🐲",

    "🐳",

    "🐴",

    "🐵",

    "🐶",

    "🐷",

    "🐸",

    "🐹",

    "🐺",

    "🐻",

    "🐼",

    "🐽",

    "🐾",

    "🐿️",

    "👀",

    "👁️",

    "👂",

    "👃",

    "👄",

    "👅",

    "👆",

    "👇",

    "👈",

    "👉",

    "👊",

    "👋",

    "👌",

    "👍",

    "👎",

    "👏",

    "👐",

    "👑",

    "👒",

    "👓",

    "👔",

    "👕",

    "👖",

    "👗",

    "👘",

    "👙",

    "👚",

    "👛",

    "👜",

    "👝",

    "👞",

    "👟",

    "👠",

    "👡",

    "👢",

    "👣",

    "👤",

    "👥",

    "👦",

    "👧",

    "👨",

    "👩",

    "👪",

    "👫",

    "👬",

    "👭",

    "👮",

    "👯",

    "👰",

    "👱",

    "👲",

    "👳",

    "👴",

    "👵",

    "👶",

    "👷",

    "👸",

    "👹",

    "👺",

    "👻",

    "👼",

    "👽",

    "👾",

    "👿",

    "💀",

    "💁",

    "💂",

    "💃",

    "💄",

    "💅",

    "💆",

    "💇",

    "💈",

    "💉",

    "💊",

    "💋",

    "💌",

    "💍",

    "💎",

    "💏",

    "💐",

    "💑",

    "💒",

    "💓",

    "💔",

    "💕",

    "💖",

    "💗",

    "💘",

    "💙",

    "💚",

    "💛",

    "💜",

    "💝",

    "💞",

    "💟",

    "💠",

    "💡",

    "💢",

    "💣",

    "💤",

    "💥",

    "💦",

    "💧",

    "💨",

    "💩",

    "💪",

    "💫",

    "💬",

    "💮",

    "💯",

    "💰",

    "💱",

    "💲",

    "💳",

    "💴",

    "💵",

    "💶",

    "💷",

    "💸",

    "💹",

    "💺",

    "💻",

    "💼",

    "💽",

    "💾",

    "💿",

    "📀",

    "📁",

    "📃",

    "📅",

    "📇",

    "📈",

    "📉",

    "📊",

    "📋",

    "📌",

    "📍",

    "📎",

    "📏",

    "📐",

    "📑",

    "📒",

    "📓",

    "📔",

    "📕",

    "📖",

    "📗",

    "📘",

    "📙",

    "📚",

    "📛",

    "📜",

    "📝",

    "📞",

    "📟",

    "📠",

    "📡",

    "📢",

    "📣",

    "📤",

    "📦",

    "📧",

    "📨",

    "📩",

    "📪",

    "📬",

    "📭",

    "📮",

    "📯",

    "📰",

    "📱",

    "📳",

    "📵",

    "📶",

    "📷",

    "📹",

    "📺",

    "📻",

    "📼",

    "📽️",

    "📿",

    "🔀",

    "🔁",

    "🔃",

    "🔄",

    "🔅",

    "🔆",

    "🔇",

    "🔊",

    "🔋",

    "🔌",

    "🔎",

    "🔏",

    "🔑",

    "🔓",

    "🔔",

    "🔕",

    "🔖",

    "🔗",

    "🔘",

    "🔛",

    "🔝",

    "🔞",

    "🔟",

    "🔠",

    "🔢",

    "🔣",

    "🔤",

    "🔥",

    "🔦",

    "🔧",

    "🔨",

    "🔩",

    "🔪",

    "🔫",

    "🔬",

    "🔭",

    "🔮",

    "🔯",

    "🔰",

    "🔱",

    "🔲",

    "🔳",

    "🔴",

    "🔵",

    "🔶",

    "🔷",

    "🔸",

    "🔹",

    "🔺",

    "🔻",

    "🔼",

    "🕉️",

    "🕊️",

    "🕋",

    "🕌",

    "🕍",

    "🕎",

    "🕐",

    "🖤",

    "🖥️",

    "🖨️",

    "🖱️",

    "🖲️",

    "🖼️",

    "🗂️",

    "🗃️",

    "🗄️",

    "🗑️",

    "🗒️",

    "🗓️",

    "🗜️",

    "🗝️",

    "🗞️",

    "🗡️",

    "🗣️",

    "🗨️",

    "🗯️",

    "🗳️",

    "🗺️",

    "🗻",

    "🗼",

    "🗽",

    "🗾",

    "🗿",

    "😀",

    "😁",

    "😂",

    "😆",

    "😇",

    "😈",

    "😉",

    "😋",

    "😌",

    "😍",

    "😎",

    "😏",

    "😐",

    "😑",

    "😒",

    "😓",

    "😖",

    "😘",

    "😚",

    "😛",

    "😠",

    "😡",

    "😢",

    "😣",

    "😤",

    "😥",

    "😨",

    "😪",

    "😬",

    "😭",

    "😮",

    "😰",

    "😱",

    "😳",

    "😴",

    "😵",

    "😶",

    "😷",

    "😸",

    "😹",

    "😻",

    "😼",

    "😽",

    "😾",

    "😿",

    "🙀",

    "🙂",

    "🙃",

    "🙄",

    "🙅",

    "🙆",

    "🙇",

    "🙈",

    "🙉",

    "🙋",

    "🙌",

    "🙍",

    "🙎",

    "🙏",

    "🚀",

    "🚁",

    "🚂",

    "🚃",

    "🚄",

    "🚅",

    "🚆",

    "🚇",

    "🚉",

    "🚊",

    "🚋",

    "🚌",

    "🚍",

    "🚎",

    "🚏",

    "🚐",

    "🚑",

    "🚒",

    "🚓",

    "🚔",

    "🚕",

    "🚖",

    "🚗",

    "🚘",

    "🚙",

    "🚚",

    "🚛",

    "🚜",

    "🚝",

    "🚞",

    "🚟",

    "🚠",

    "🚡",

    "🚢",

    "🚣",

    "🚤",

    "🚥",

    "🚦",

    "🚧",

    "🚨",

    "🚩",

    "🚪",

    "🚫",

    "🚬",

    "🚭",

    "🚮",

    "🚯",

    "🚰",

    "🚱",

    "🚲",

    "🚳",

    "🚴",

    "🚵",

    "🚶",

    "🚷",

    "🚸",

    "🚹",

    "🚺",

    "🚻",

    "🚼",

    "🚽",

    "🚾",

    "🚿",

    "🛀",

    "🛁",

    "🛂",

    "🛃",

    "🛄",

    "🛅",

    "🛋️",

    "🛌",

    "🛍️",

    "🛎️",

    "🛏️",

    "🛐",

    "🛑",

    "🛒",

    "🛕",

    "🛠️",

    "🛡️",

    "🛢️",

    "🛣️",

    "🛤️",

    "🛥️",

    "🛩️",

    "🛫",

    "🛬",

    "🛰️",

    "🛳️",

    "🛴",

    "🛵",

    "🛶",

    "🛷",

    "🛸",

    "🛹",

    "🛺",

    "🟠",

    "🟡",

    "🟢",

    "🟣",

    "🟤",

    "🟥",

    "🟦",

    "🟧",

    "🟨",

    "🟩",

    "🟪",

    "🟫",

    "🤍",

    "🤎",

    "🤏",

    "🤐",

    "🤑",

    "🤒",

    "🤓",

    "🤔",

    "🤕",

    "🤖",

    "🤗",

    "🤘",

    "🤙",

    "🤚",

    "🤜",

    "🤝",

    "🤞",

    "🤟",

    "🤠",

    "🤡",

    "🤢",

    "🤣",

    "🤤",

    "🤥",

    "🤦",

    "🤧",

    "🤨",

    "🤩",

    "🤪",

    "🤫",

    "🤬",

    "🤭",

    "🤯",

    "🤰",

    "🤱",

    "🤲",

    "🤳",

    "🤴",

    "🤵",

    "🤶",

    "🤷",

    "🤸",

    "🤹",

    "🤺",

    "🤼",

    "🤽",

    "🤾",

    "🤿",

    "🥀",

    "🥁",

    "🥂",

    "🥃",

    "🥄",

    "🥅",

    "🥇",

    "🥈",

    "🥉",

    "🥊",

    "🥋",

    "🥌",

    "🥍",

    "🥎",

    "🥏",

    "🥐",

    "🥑",

    "🥒",

    "🥓",

    "🥔",

    "🥕",

    "🥖",

    "🥗",

    "🥘",

    "🥙",

    "🥚",

    "🥛",

    "🥜",

    "🥝",

    "🥞",

    "🥟",

    "🥠",

    "🥡",

    "🥢",

    "🥣",

    "🥤",

    "🥥",

    "🥦",

    "🥧",

    "🥨",

    "🥩",

    "🥪",

    "🥫",

    "🥬",

    "🥭",

    "🥮",

    "🥯",

    "🥰",

    "🥱",

    "🥳",

    "🥴",

    "🥵",

    "🥶",

    "🥺",

    "🥻",

    "🥼",

    "🥽",

    "🥾",

    "🥿",

    "🦀",

    "🦁",

    "🦂",

    "🦃",

    "🦄",

    "🦅",

    "🦆",

    "🦇",

    "🦈",

    "🦉",

    "🦊",

    "🦋",

    "🦌",

    "🦍",

    "🦎",

    "🦏",

    "🦐",

    "🦑",

    "🦒",

    "🦓",

    "🦔",

    "🦕",

    "🦖",

    "🦗",

    "🦘",

    "🦙",

    "🦚",

    "🦛",

    "🦜",

    "🦝",

    "🦞",

    "🦟",

    "🦠",

    "🦡",

    "🦢",

    "🦥",

    "🦦",

    "🦧",

    "🦨",

    "🦩",

    "🦪",

    "🦮",

    "🦯",

    "🦴",

    "🦵",

    "🦶",

    "🦷",

    "🦸",

    "🦹",

    "🦺",

    "🦻",

    "🦼",

    "🦽",

    "🦾",

    "🦿",

    "🧀",

    "🧁",

    "🧂",

    "🧃",

    "🧄",

    "🧅",

    "🧆",

    "🧇",

    "🧈",

    "🧉",

    "🧊",

    "🧍",

    "🧎",

    "🧏",

    "🧐",

    "🧖",

    "🧗",

    "🧘",

    "🧙",

    "🧚",

    "🧛",

    "🧜",

    "🧝",

    "🧞",

    "🧟",

    "🧠",

    "🧡",

    "🧢",

    "🧣",

    "🧤",

    "🧥",

    "🧦",

    "🧧",

    "🧨",

    "🧩",

    "🧪",

    "🧫",

    "🧬",

    "🧭",

    "🧮",

    "🧯",

    "🧰",

    "🧱",

    "🧲",

    "🧳",

    "🧴",

    "🧵",

    "🧶",

    "🧷",

    "🧸",

    "🧹",

    "🧺",

    "🧻",

    "🧼",

    "🧽",

    "🧾",

    "🧿",

    "🩰",

    "🩱",

    "🩲",

    "🩳",

    "🩸",

    "🩹",

    "🩺",

    "🪀",

    "🪁",

    "🪂",

    "🪐",

    "🪑",

    "🪒",

    "🪓",

    "🪔",

    "🪕",

    "ℹ️",

    "⌛️",

    "⌨️",

    "⏏️",

    "⏪",

    "⏬",

    "⏰",

    "⏱️",

    "⏲️",

    "☀️",

    "☁️",

    "☂️",

    "☃️",

    "☄️",

    "☎️",

    "☑️",

    "☘️",

    "☝️",

    "☠️",

    "☢️",

    "☣️",

    "☦️",

    "☪️",

    "☮️",

    "☯️",

    "☸️",

    "☹️",

    "☺️",

    "♀️",

    "♂️",

    "♟️",

    "♣️",

    "♥️",

    "♦️",

    "♨️",

    "♻️",

    "⚒️",

    "⚔️",

    "⚕️",

    "⚖️",

    "⚗️",

    "⚙️",

    "⚛️",

    "⚜️",

    "⚠️",

    "⚰️",

    "⚱️",

    "⛈️",

    "⛎",

    "⛏️",

    "⛑️",

    "⛓️",

    "⛩️",

    "⛰️",

    "⛱️",

    "⛴️",

    "⛷️",

    "⛸️",

    "⛹️",

    "✂️",

    "✅",

    "✈️",

    "✉️",

    "✊",

    "✋",

    "✌️",

    "✍️",

    "✏️",

    "✒️",

    "✔️",

    "✖️",

    "✝️",

    "✡️",

    "✨",

    "✳️",

    "✴️",

    "❄️",

    "❇️",

    "❌",

    "❎",

    "❓",

    "❔",

    "❕",

    "❣️",

    "❤️",

    "➕",

    "➖",

    "➗",

]



const validRules = [

    "0001",

    "1011",

    "0221",

    "1231",

    "0021",

    "1031",

    "0112",

    "1012",

    "1232",

    "0332",

    "0132",

    "1032",

    "0223",

    "2023",

    "3033",

    "1233",

    "0023",

    "1033",

    "0114",

    "2024",

    "1234",

    "0134",

    "1034",

    "0024"

];



// This seems such a stupid idea but it opens the possibility of variants

const forms = [

    [

        'All <span class="subject">$</span> is <span class="subject">$</span>',

        'No <span class="subject">$</span> is <span class="subject">$</span>',

        'Some <span class="subject">$</span> is <span class="subject">$</span>',

        'Some <span class="subject">$</span> is not <span class="subject">$</span>'

    ],

    [

        '<span class="is-negated">No</span> <span class="subject">$</span> is <span class="subject">$</span>',

        '<span class="is-negated">All</span> <span class="subject">$</span> is <span class="subject">$</span>',

        'Some <span class="subject">$</span> <span class="is-negated">is not</span> <span class="subject">$</span>',

        'Some <span class="subject">$</span> <span class="is-negated">is</span> <span class="subject">$</span>'

    ],

];



const dirNames = [

    null,

    "North",

    "North-East",

    "East",

    "South-East",

    "South",

    "South-West",

    "West",

    "North-West"

];



const nameInverseDir = {

    "North": "South",

    "North-East": "South-West",

    "East": "West",

    "South-East": "North-West",

    "South": "North",

    "South-West": "North-East",

    "West": "East",

    "North-West": "South-East"

};



const dirCoords = [

    [ 0,  0],

    [ 0,  1],

    [ 1,  1],

    [ 1,  0],

    [ 1, -1],

    [ 0, -1],

    [-1, -1],

    [-1,  0],

    [-1,  1]

];



const repeatDirectionWord = (word, count) => {
    const c = Math.abs(count);
    if (c <= 1) return [word];
    const superscripts = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
    const supStr = String(c).split('').map(d => superscripts[d] || d).join('');
    return [word + supStr];
};



const dirString = (x, y, z) => {

    let parts = [];

    if (z) parts.push(...repeatDirectionWord(z > 0 ? 'Above' : 'Below', z));

    let xyParts = [];
    const xWord = x > 0 ? 'East' : 'West';
    const yWord = y > 0 ? 'North' : 'South';
    const diagonalCount = Math.min(Math.abs(x || 0), Math.abs(y || 0));

    if (diagonalCount > 0) {
        xyParts.push(...repeatDirectionWord(`${yWord}-${xWord}`, diagonalCount));
    }

    if (Math.abs(y || 0) > diagonalCount) {
        xyParts.push(...repeatDirectionWord(yWord, Math.abs(y) - diagonalCount));
    }

    if (Math.abs(x || 0) > diagonalCount) {
        xyParts.push(...repeatDirectionWord(xWord, Math.abs(x) - diagonalCount));
    }

    if (parts.length > 0 && xyParts.length > 0) {
        return `${parts.join(' + ')} and ${xyParts.join(' + ')}`;
    }

    return [...parts, ...xyParts].join(' + ');

}



const dirStringFromCoord = (coord) => {

    return dirString.apply(null, coord);

}



function twoDToArrow(coord) {

    const arrowMap = {

        "1,0": `<i class="ci-Arrow_Left_MD"></i>`,

        "1,1": `<i class="ci-Arrow_Down_Left_MD"></i>`,

        "1,-1": `<i class="ci-Arrow_Up_Left_MD"></i>`,

        "0,1": `<i class="ci-Arrow_Down_LG"></i>`,

        "0,-1": `<i class="ci-Arrow_Up_LG"></i>`,

        "-1,0": `<i class="ci-Arrow_Right_LG"></i>`,

        "-1,1": `<i class="ci-Arrow_Down_Right_LG"></i>`,

        "-1,-1": `<i class="ci-Arrow_Up_Right_LG"></i>`,

    };



    const [x, y] = coord.slice(0, 2);
    if (!x && !y) return '<i class="ci-Wifi_None"></i>';
    const xSign = x === 0 ? 0 : x / Math.abs(x);
    const ySign = y === 0 ? 0 : y / Math.abs(y);
    const diagonalCount = Math.min(Math.abs(x || 0), Math.abs(y || 0));
    const pieces = [];

    for (let i = 0; i < diagonalCount; i++) {
        pieces.push(arrowMap[[xSign, ySign].join(",")]);
    }

    for (let i = 0; i < Math.abs(y || 0) - diagonalCount; i++) {
        pieces.push(arrowMap[[0, ySign].join(",")]);
    }

    for (let i = 0; i < Math.abs(x || 0) - diagonalCount; i++) {
        pieces.push(arrowMap[[xSign, 0].join(",")]);
    }

    return pieces.join('') || '<i class="ci-Wifi_None"></i>';

}



function threeDToTriangle(coord) {

    if (coord.length < 3) {

        return '';

    }



    if (coord[2] > 0) {

        return Array(coord[2]).fill('▼').join('');

    } else if (coord[2] < 0) {

        return Array(Math.abs(coord[2])).fill('▲').join('');

    } else {

        return '<i class="ci-Wifi_None"></i>';

    }

}



function fourDToArrow(coord) {

    if (coord.length < 4) {

        return '';

    }



    if (coord[3] === 1) {

        return '◀';

    } else if (coord[3] === -1) {

        return '▶';

    } else {

        return '<i class="ci-Wifi_None"></i>';

    }

}



const dirStringMinimal = (coord) => {

    let str = '';

    str += fourDToArrow(coord);

    str += threeDToTriangle(coord);

    str += twoDToArrow(coord);

    return str;

}



const dirCoords3D = [];

const dirNames3D = [];

const nameInverseDir3D = {};



const xs = Array(3).fill(0).map((_, i) => i-1)

xs.map(x =>

    xs.map(y =>

        xs.map(z => {

            if (x === 0 && y === 0 && z === 0) return;

            dirCoords3D.push([ x, y, z ]);

            dirNames3D.push(dirString(x, y, z));

            nameInverseDir3D[dirString(x, y, z)] = dirString(-x, -y, -z);

        })

    )

);



const dirCoords4D = [];

xs.map(x =>

    xs.map(y =>

        xs.map(z => {

            xs.map(time => {

                if (x === 0 && y === 0 && z === 0 && time === 0) return;

                dirCoords4D.push([ x, y, z, time ]);

            })

        })

    )

);



const timeNames = ['was', 'is', 'will be'];

const timeMapping = {

    [-1]: 'was',

    [0]: 'is',

    [1]: 'will be'

}

const reverseTimeNames = {

    'was': 'will be',

    'is': 'is',

    'will be': 'was'

}



const dimensionNames = {

    [0]: 'X',

    [1]: 'Y',

    [2]: 'Z',

    [3]: 'T',

    [4]: 't',

    [5]: 'Q'

}

