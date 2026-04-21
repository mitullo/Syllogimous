class IncorrectDirections {
    // Find alternative incorrect coords that are NOT the simple inverse
    findAlternativeCoords(correctCoord, oppositeCoord) {
        let alternatives = [];
        const dimensions = correctCoord.length;

        const generateCoords = (currentCoord) => {
            if (currentCoord.length === dimensions) {
                // Skip zero coord, correct coord, and opposite coord
                if (currentCoord.every(d => d === 0)) return;
                if (arraysEqual(currentCoord, correctCoord)) return;
                if (arraysEqual(currentCoord, oppositeCoord)) return;
                
                alternatives.push([...currentCoord]);
                return;
            }
            for (let d of [-1, 0, 1]) {
                currentCoord.push(d);
                generateCoords(currentCoord);
                currentCoord.pop();
            }
        };

        generateCoords([]);
        shuffle(alternatives);
        return alternatives.slice(0, 3);
    }

    findUnused(combinations, correctCoord) {
        let unused = [];
        let permutation = correctCoord.map(d => 0);
        let permutate = (i) => {
            if (i >= permutation.length) {
                if (!arraysEqual(permutation, correctCoord) && 
                    !permutation.every(d => d === 0) &&
                    combinations.findIndex(combo => arraysEqual(permutation, combo)) === -1) {
                    unused.push(permutation.slice());
                }
                return;
            }
            for (let direction of [-1, 0, 1]) {
                permutation[i] = direction;
                permutate(i+1);
            }
        }
        permutate(0);
        return unused;
    }

    createIncorrectConclusionCoords(usedCoords, correctCoord, diffCoord, hardModeDimensions) {
        let opposite = correctCoord.map(dir => -dir)
        let isUsingHardMode = hardModeDimensions && hardModeDimensions.length > 0;
        let avoidOpposite = savedata.enableHarderConclusions;
        if (usedCoords.length <= 2) {
            if (avoidOpposite) {
                // Try to find a non-opposite incorrect coord
                let altCoords = this.findAlternativeCoords(correctCoord, opposite);
                if (altCoords.length > 0) {
                    return altCoords;
                }
            }
            return [opposite];
        } else if (usedCoords.length <= 3 && !isUsingHardMode && Math.random() < 0.5) {
            if (!avoidOpposite) {
                return [opposite];
            }
        } else if (usedCoords.length <= 4 && !isUsingHardMode && Math.random() < 0.23) {
            if (!avoidOpposite) {
                return [opposite];
            }
        }
        const dirCoords = removeDuplicateArrays(usedCoords);

        const dimensionPool = correctCoord.map((c, i) => i);
        let bannedDimensionShifts = new Set();
        for (const dimension of dimensionPool) {
            if (dirCoords.every(coord => coord[dimension] === 0)) {
                bannedDimensionShifts.add(dimension);
            }
        }

        const highest = diffCoord.map(x => Math.abs(x)).reduce((a, b) => Math.max(a, b));
        const allShiftedEqually = diffCoord.every(x => Math.abs(x) === highest);
        const shifts = allShiftedEqually ? [-1, 1] : [-2, -1, 1, 2];
        if (isUsingHardMode) {
            bannedDimensionShifts.add.apply(bannedDimensionShifts, dimensionPool.filter(d => !hardModeDimensions.some(h => h === d)));
        } else if (!allShiftedEqually) {
            bannedDimensionShifts.add.apply(bannedDimensionShifts, dimensionPool.filter(d => Math.abs(diffCoord[d]) === highest));
        }

        let combinations = [];
        for (const d of dimensionPool) {
            if (bannedDimensionShifts.has(d)) {
                continue;
            }

            for (const shift of shifts) {
                let newCombo = correctCoord.slice();
                newCombo[d] += shift;
                if (newCombo.some(d => Math.abs(d) > 1)) {
                    continue;
                }
                if (newCombo.every(d => d === 0)) {
                    continue;
                }
                combinations.push(newCombo);
                if (Math.abs(shift) == 1) {
                    combinations.push(newCombo);
                    combinations.push(newCombo);
                }
            }
        }

        let backupPool = this.findUnused(combinations, correctCoord);
        backupPool.push(opposite);
        backupPool.push(opposite);
        if (combinations.length !== 0 && !oneOutOf(11)) {
            return combinations;
        } else {
            return backupPool;
        }
    }

    chooseIncorrectCoord(usedCoords, correctCoord, diffCoord, hardModeDimensions) {
        const incorrectCoords = this.createIncorrectConclusionCoords(usedCoords, correctCoord, diffCoord, hardModeDimensions);
        const picked = pickRandomItems(incorrectCoords, 1).picked[0];
        return picked;
    }
}
