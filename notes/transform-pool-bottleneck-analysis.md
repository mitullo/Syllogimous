# Transform Pool Bottleneck Analysis - **FIXED** via Stacking

## Fix Status: **IMPLEMENTED**

Stacking modification allows multiple transforms per word by cycling through the pool.

## The Fix: `createChains` Stacking

**File:** `js/generators/space-hard-mode.js:144-150`

**Before:**
```javascript
// Generate up to the available number of words
const actualTransforms = Math.min(this.numTransforms, pool.length);
let wordSequence = repeatArrayUntil(shuffle(pool.slice()), actualTransforms);
```

**After (Stacking):**
```javascript
// STACKING: Allow multiple transforms per word by cycling through pool
// This enables N transforms even with fewer than N words available
const shuffledPool = shuffle(pool.slice());
let wordSequence = [];
for (let i = 0; i < this.numTransforms; i++) {
    wordSequence.push(shuffledPool[i % shuffledPool.length]);
}
// Now wordSequence has this.numTransforms items, cycling through pool
// Example: 8 transforms, 2 words → [WordA, WordB, WordA, WordB, WordA, WordB, WordA, WordB]
```

## The Core Problem (Before Fix)

When you set 8 transforms with 2 premises + fixed anchors:
- Total words: 4 anchors + 2 premise words = 6 words
- Banned: 4 anchors (fixed) + start + end = 6 words banned
- **Eligible pool: 0 words**

The safeguard unbans start/end, giving you **2 words** maximum.
But you asked for **8 transforms**.

### Where The Limitation Happened

**File:** `js/generators/space-hard-mode.js:144-146` (OLD CODE)

```javascript
const actualTransforms = Math.min(this.numTransforms, pool.length);
let wordSequence = repeatArrayUntil(shuffle(pool.slice()), actualTransforms);
```

- You request 8 transforms (`this.numTransforms = 8`)
- Pool has 2 words (after unbanning start/end)
- `actualTransforms = Math.min(8, 2) = 2`
- Only **2 chains** were created, not 8

### 2. `applyChain` - Limited by chain count

**File:** `js/generators/space-hard-mode.js:309-341`

```javascript
for (const [chain, dimension] of chains) {
    for (let i = 1; i < chain.length; i++) {
        // Stop once we've applied the requested number of transforms
        if (appliedTransforms >= this.numTransforms) {
            break;
        }
        let a = chain[i-1];
        let b = chain[i];
        
        // If target is anchor OR self-transform, replace with valid word
        if (this.isAnchorWord(b) || a === b) {
            const candidates = this.eligiblePool.filter(w => w !== a);
            b = candidates.length > 0 ?
                pickRandomItems(candidates, 1).picked[0] :
                this.eligiblePool[0] || b;  // Fallback
        }
        
        const command = pickRandomItems(cpool, 1).picked[0];
        wordCoordMap[b] = command.call(null, a, b, dimension);
        appliedTransforms++;
    }
}
```

**Chain structure from `directionize`:**
- `directionize([target], leftStart, ...)` returns `[[target, leftStart], dimension]`
- Chain has **2 words**, so inner loop runs **once** (`i = 1`)
- 2 chains × 1 transform each = **2 transforms applied**

## The Math

| Your Setting | Pool Size | Chains Created | Transforms Per Chain | **Actual Transforms** |
|--------------|-----------|----------------|----------------------|----------------------|
| 8 transforms | 2 words | 2 | 1 | **2** |
| 8 transforms | 5 words | 5 | 1 | **5** |
| 8 transforms | 8 words | 8 | 1 | **8** |

## The Fundamental Issue

Each chain can only apply **1 transform** because:
```javascript
// directionize adds 'start' to words array
directionize([target], leftStart, ...) 
// Returns: [[target, leftStart], dimension]
// chain.length = 2, so loop runs for i=1 only
```

**One word = One chain = One transform**

## Potential Solutions

### Option 1: Allow Multiple Transforms Per Word (Stacking)
Modify the logic to reuse words for multiple transforms:

```javascript
// In createChains: Allow word reuse for stacking transforms
const repeatsNeeded = Math.ceil(this.numTransforms / pool.length);
let wordSequence = repeatArrayUntil(shuffle(pool.slice()), this.numTransforms);
// Now wordSequence can have the same word multiple times
```

### Option 2: Transform Anchors (Remove Fixed Restriction)
Don't ban anchors from transform pool - let them be transformed too.

### Option 3: Transform the Grid/Space Itself
Instead of transforming words, transform the coordinate system or space.

### Option 4: Virtual/Dummy Words
Generate virtual words that exist only for transforms, not in premises.

## Current Behavior After Stacking Fix

With 2 premises + fixed anchors + level 8:
1. `getNumTransformsSplit` returns `[0, 8]` (correct!)
2. `createChains` creates 8 chains: `[WordA, WordB, WordA, WordB, WordA, WordB, WordA, WordB]`
3. `applyChain` processes all 8 chains, applying transforms to updated coordinates
4. **Result: 8 transforms as requested!**

Each word gets transformed 4 times in sequence. Since `wordCoordMap[b]` is updated in-place in `applyChain` (line 333), each subsequent transform operates on the *new* coordinate, creating a chain of transformations.

## Relevant Code Locations

1. **`js/generators/space-hard-mode.js:144-146`** - `actualTransforms` capping
2. **`js/generators/space-hard-mode.js:152-158`** - Chain creation loop
3. **`js/generators/space-hard-mode.js:179-201`** - `directionize` (chain structure)
4. **`js/generators/space-hard-mode.js:309-341`** - Transform application loop
5. **`js/generators/space-hard-mode.js:11-34`** - Pool calculation with safeguard
