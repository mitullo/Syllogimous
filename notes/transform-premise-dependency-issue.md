# Transform Count Depends on Premise Count - **FIXED**

## Problem (RESOLVED)
The number of transforms applied was depending on how many premises the user set. This happened when "Fix Anchor Positions" was enabled.

**Fixed Status:** Implemented Option 3 - Anchor Space override in `getNumTransformsSplit`

## Fix Implementation

**File:** `js/generators/direction.js:582-587`

```javascript
getNumTransformsSplit(numPremises) {
    const totalTransforms = this.generator.hardModeLevel();
    if (!this.generator.hardModeAllowed() || totalTransforms === 0) {
        return [0, 0];
    }

    if (!savedata.enableTransformInterleave) {
        return [0, totalTransforms];
    }

    // OVERRIDE: Anchor Space with fixed positions needs constant transforms
    // regardless of premise count. Put all transforms through basicHardMode
    // for maximum predictability with restricted word pools.
    if (this.generator.shouldUseAnchor() && savedata.anchorSpaceFixedPositions) {
        return [0, totalTransforms];
    }

    // Original behavior for standard modes
    let interleaveCount = Math.max(0, Math.min(totalTransforms - 1, numPremises - 1));
    return [interleaveCount, totalTransforms - interleaveCount];
}
```

## Behavior After Fix

**Anchor Space v1/v2 + Fixed Positions enabled:**
- Set 2 transforms → Always get exactly 2 transforms (via basicHardMode)
- Set 3 transforms → Always get exactly 3 transforms (via basicHardMode)
- No dependency on premise count
- No interleaved transforms (most predictable with restricted word pools)

**Other modes (Space 2D/3D/4D, etc.):**
- Unchanged behavior - still use premise-dependent calculation if `enableTransformInterleave` is on

## Original Problem Analysis (for reference)

### Root Cause: `getNumTransformsSplit`

```javascript
getNumTransformsSplit(numPremises) {
    const totalTransforms = this.generator.hardModeLevel(); // e.g., 2
    if (!this.generator.hardModeAllowed() || totalTransforms === 0) {
        return [0, 0];
    }

    if (!savedata.enableTransformInterleave) {
        return [0, totalTransforms];
    }
    // THIS IS THE PROBLEM: interleaveCount depends on numPremises
    let interleaveCount = Math.max(0, Math.min(totalTransforms - 1, numPremises - 1));
    return [interleaveCount, totalTransforms - interleaveCount];
}
```

### How It Affects Transform Count

**Scenario: User sets 2 transforms, `enableTransformInterleave = true`**

| Premises | interleaveCount | numTransforms | Total Applied |
|----------|-----------------|---------------|---------------|
| 1 | `min(1, 0) = 0` | `2 - 0 = 2` | 2 |
| 2 | `min(1, 1) = 1` | `2 - 1 = 1` | 2 (1+1) |
| 3 | `min(1, 2) = 1` | `2 - 1 = 1` | 2 (1+1) |
| 5 | `min(1, 4) = 1` | `2 - 1 = 1` | 2 (1+1) |

The issue: With `enableTransformInterleave`, the distribution changes based on premise count, and for anchor space with fixed positions, this creates unpredictable behavior.

## Where The Split Is Used

**File:** `js/generators/direction.js:281`

```javascript
create(length) {
    // ...
    let [numInterleaved, numTransforms] = this.getNumTransformsSplit(length);
    // length = number of premises
    // numInterleaved = transforms shown as interleaved premises
    // numTransforms = transforms applied via basicHardMode
```

**File:** `js/generators/direction.js:346-354`

```javascript
if (numTransforms > 0) {
    [wordCoordMap, operations, hardModeDimensions] = new SpaceHardMode(numTransforms, anchorWords || [])
        .basicHardMode(wordCoordMap, startWord, endWord, conclusionCoord);
    
    if (numInterleaved > 0) {
        premises.push(...operations);  // Interleaved: transforms shown as premises
        operations = [];
    }
}
```

## The Specific Issue with Anchor Space + Fixed Positions

When `anchorSpaceFixedPositions` is enabled:
1. The pool of transformable words is already limited (anchors are banned)
2. On top of that, the transform count varies based on premise count
3. This creates compound unpredictability

**With 2 premises + fixed anchors + level 2:**
- `getNumTransformsSplit(2)` returns `[1, 1]` (1 interleaved, 1 via basicHardMode)
- But the safeguard kicks in because pool is small
- Result: Inconsistent behavior

**With 5 premises + fixed anchors + level 2:**
- `getNumTransformsSplit(5)` returns `[1, 1]` (same split)
- But more words available, so different behavior

## Desired Behavior

Transforms should be **constant** regardless of premise count:
- Set 2 transforms → always get 2 transforms
- Set 3 transforms → always get 3 transforms
- No dependency on `numPremises`

## Possible Fixes

### Option 1: Ignore `numPremises` in `getNumTransformsSplit`

Always return consistent split regardless of premise count:

```javascript
getNumTransformsSplit(numPremises) {
    const totalTransforms = this.generator.hardModeLevel();
    if (!this.generator.hardModeAllowed() || totalTransforms === 0) {
        return [0, 0];
    }

    if (!savedata.enableTransformInterleave) {
        return [0, totalTransforms];
    }
    
    // Option A: Always split 50/50 or fixed ratio
    let interleaveCount = Math.floor(totalTransforms / 2);
    return [interleaveCount, totalTransforms - interleaveCount];
    
    // Option B: All interleaved or all via hard mode, no split
    // return [totalTransforms, 0];  // All interleaved
    // return [0, totalTransforms];  // All via hard mode
}
```

### Option 2: Add setting for "Transforms Independent of Premises"

Add a new savedata flag that bypasses the `numPremises - 1` calculation.

### Option 3: For Anchor Space Only, Force Consistent Split

In anchor space mode, override the split calculation:

```javascript
getNumTransformsSplit(numPremises) {
    const totalTransforms = this.generator.hardModeLevel();
    if (!this.generator.hardModeAllowed() || totalTransforms === 0) {
        return [0, 0];
    }

    if (!savedata.enableTransformInterleave) {
        return [0, totalTransforms];
    }
    
    // For anchor space, don't vary based on premise count
    if (this.generator.shouldUseAnchor()) {
        let interleaveCount = Math.floor(totalTransforms / 2);
        return [interleaveCount, totalTransforms - interleaveCount];
    }
    
    // Original behavior for non-anchor modes
    let interleaveCount = Math.max(0, Math.min(totalTransforms - 1, numPremises - 1));
    return [interleaveCount, totalTransforms - interleaveCount];
}
```

## Settings Involved

- `savedata.enableTransformInterleave` - If false, returns `[0, totalTransforms]` (no dependency)
- `savedata.anchorSpaceFixedPositions` - When enabled, makes the dependency more problematic
- `savedata.anchorSpaceHardModeLevel` / `savedata.space2DHardModeLevel` - The total transform count setting

## Files to Modify

1. `js/generators/direction.js`:
   - `getNumTransformsSplit` method (lines 572-583)
   - `create` method that calls it (line 281)

## Notes

- The `enableTransformInterleave` setting controls whether this dependency exists
- When disabled: `return [0, totalTransforms]` - no dependency, all transforms via hard mode
- When enabled: The `min(totalTransforms - 1, numPremises - 1)` creates the dependency
- User likely wants `enableTransformInterleave` behavior but WITHOUT the premise dependency
