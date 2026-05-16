class DirectionPairChooser {
    // pickTwoDistantWords(neighbors, deprioritizePoles=false, usedPairKeys=null) {
    pickTwoDistantWords(neighbors, deprioritizePoles=false, usedPairKeys=null) {
        const options = Object.keys(neighbors);
        let pool = [];
        const poles = options.filter(word => neighbors[word].length == 1);
        const pole_neighbors = options.filter(word => poles.some(pole => neighbors[pole].includes(word)))
        pool.push.apply(pool, poles);
        pool.push.apply(pool, pole_neighbors);
        if (deprioritizePoles) {
            const middle_nodes = options.filter(word => !pool.includes(word) && pole_neighbors.some(n => neighbors[n].includes(word)));
            pool.push.apply(pool, middle_nodes);
        }

        const useCloseNodes = deprioritizePoles ? oneOutOf(15) : false;
        const useMiddleNodes = deprioritizePoles ? oneOutOf(6) : oneOutOf(25);
        const useNearEdge = deprioritizePoles ? oneOutOf(2.5) : oneOutOf(4.5);
        const ranks = this._rankPairs(pool, neighbors, usedPairKeys);


        // Return null if no valid pairs found (caller should handle this)
        if (ranks.length === 0) {
            return null;
        }

        let startWord, endWord;
        if (Object.keys(neighbors).length <= 5) {
            [startWord, endWord] = pickRandomItems(ranks[0][1], 1).picked[0];
        } else if (useCloseNodes && ranks.length >= 4) {
            [startWord, endWord] = pickRandomItems(ranks[3][1], 1).picked[0];
        } else if (useMiddleNodes && ranks.length >= 3) {
            [startWord, endWord] = pickRandomItems(ranks[2][1], 1).picked[0];
        } else if (useNearEdge && ranks.length >= 2) {
            [startWord, endWord] = pickRandomItems(ranks[1][1], 1).picked[0];
        } else {
            [startWord, endWord] = pickRandomItems(ranks[0][1], 1).picked[0];
        }

        return [startWord, endWord];
    }

    _rankPairs(pool, neighbors, usedPairKeys) {
        let pairs = []
        for (let i = 0; i < pool.length; i++) {
            for (let j = i+1; j < pool.length; j++) {
                const start = pool[i];
                const end = pool[j];
                const key = [start, end].sort().join('|')
                if (usedPairKeys && usedPairKeys.has(key)) {
                    pairs.push([start, end, 1])
                }  else {
                    const dist = this._distanceBetween(start, end, neighbors)
                    if (dist > 1) {
                        pairs.push([start, end, dist]);
                    }
                }
            }
        }

        let groups = {}
        for (const [a, b, dist] of pairs) {
            groups[dist] = groups?.[dist] ?? []
            groups[dist].push([a, b]);
        }

        return Object.entries(groups).sort(([distA, _], [distB, __]) => distB - distA);
    }

    _distanceBetween(start, end, neighbors) {
        let distance = 0;
        let layer = [start];
        let found = {[start]: true};
        while (layer.length > 0) {
            distance++;
            let newLayer = [];
            for (const node of layer) {
                for (const neighbor of neighbors[node]) {
                    if (found[neighbor]) {
                        continue;
                    }
                    if (neighbor === end) {
                        return distance;
                    }
                    newLayer.push(neighbor);
                    found[neighbor] = true;
                }
            }
            layer = newLayer;
        }
        return distance;
    }
}
