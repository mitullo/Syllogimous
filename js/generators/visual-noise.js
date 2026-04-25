function seededRandom(seed) {
    let m = 2 ** 31 - 1; // Large prime number
    let a = 48271;       // Multiplier
    let c = 0;           // Increment
    let state = seed % m;

    return function () {
        state = (a * state + c) % m;
        return state / m; // Normalize to [0, 1)
    };
}

class VisualNoise {
    nextColor() {
        const hue = Math.floor(this.random() * 360);
        const saturation = Math.floor(20 + this.random() * 81);
        const lightness = Math.floor(10 + (this.random() * 91));

        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    weightedRandomIndex(array) {
        const totalWeight = array.reduce((acc, _, index) => acc + Math.pow(index + 1, 2), 0);
        const randomWeight = this.random() * totalWeight;

        let cumulativeWeight = 0;
        for (let i = 0; i < array.length; i++) {
            cumulativeWeight += Math.pow(i + 1, 2);
            if (randomWeight < cumulativeWeight) {
                return i;
            }
        }
    }

    generateEmojiSvg(id, splits, minSplit, maxSplit) {
        const width = 100, height = 50;
        let rectangles = [{ x: 0, y: 0, width, height }];

        for (let i = 0; i < splits; i++) {
            const [rect] = rectangles.splice(this.weightedRandomIndex(rectangles), 1);
            const splitProbability = rect.height / (rect.width + rect.height);
            const splitHorizontally = this.random() < splitProbability;
            if (splitHorizontally) {
                const low = rect.height * minSplit;
                const high = rect.height * maxSplit;
                const splitY = rect.y + low + this.random() * (high - low);
                rectangles.push(
                    { x: rect.x, y: rect.y, width: rect.width, height: splitY - rect.y },
                    { x: rect.x, y: splitY, width: rect.width, height: rect.y + rect.height - splitY }
                );
            } else {
                const low = rect.width * minSplit;
                const high = rect.width * maxSplit;
                const splitX = rect.x + low + this.random() * (high - low);
                rectangles.push(
                    { x: rect.x, y: rect.y, width: splitX - rect.x, height: rect.height },
                    { x: splitX, y: rect.y, width: rect.x + rect.width - splitX, height: rect.height }
                );
            }

            rectangles.sort((a, b) => a.width * a.height - b.width * b.height);
        }

        let svgContent = `<svg id="vnoise-${id}" class="noise" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
        for (const rect of rectangles) {
            const color = this.nextColor();
            svgContent += `<rect x="${Math.round(rect.x)}" y="${Math.round(rect.y)}" width="${Math.round(rect.width)}" height="${Math.round(rect.height)}" fill="${color}" />`;
        }

        svgContent += '</svg>';
        return svgContent;
    }

    generateVisualNoise(seed, splits) {
        this.random = seededRandom(seed);
        return this.generateEmojiSvg(seed, splits, 0.25, 0.75);
    }
}

/**
 * Nested “topo” blobs: stacked smooth paths (quadratic beziers) with
 * Material Design colour palettes, same visual language as topo-stimulus
 * reference (50×50, black strokes, outer contours fill the square).
 */
class TopoMap {
    static _domSeq = 0;

    static PALETTES = [
        ['#7f0000','#9a0007','#b71c1c','#c62828','#d32f2f','#e53935','#ef5350','#e57373','#ef9a9a','#ffcdd2','#616161','#9e9e9e'],
        ['#2e1f1a','#3e2723','#4e342e','#5d4037','#6d4c41','#795548','#8d6e63','#a1887f','#bcaaa4','#d7ccc8','#efebe9','#fff3e0'],
        ['#0a3d91','#0d47a1','#1256b0','#1565c0','#1873c9','#1976d2','#2196f3','#42a5f5','#64b5f6','#90caf9','#bbdefb','#e3f2fd'],
        ['#1b5e20','#2e7d32','#388e3c','#43a047','#4caf50','#66bb6a','#81c784','#a5d6a7','#c8e6c9','#e8f5e9'],
        ['#4a148c','#6a1b9a','#7b1fa2','#8e24aa','#9c27b0','#ab47bc','#ba68c8','#ce93d8','#e1bee7','#f3e5f5'],
        ['#004d40','#00695c','#00796b','#00897b','#009688','#26a69a','#4db6ac','#80cbc4','#b2dfdb','#e0f2f1'],
        ['#bf360c','#d84315','#e64a19','#f4511e','#ff7043','#ff8a65','#ffab91','#ffccbc','#fbe9e7'],
        ['#880e4f','#ad1457','#c2185b','#d81b60','#e91e63','#f06292','#f48fb1','#f8bbd0','#fce4ec'],
        ['#ff6f00','#ff8f00','#ffa000','#ffb300','#ffc107','#ffca28','#ffd54f','#ffe082','#ffecb3','#fff8e1'],
        ['#827717','#9e9d24','#afb42b','#c0ca33','#cddc39','#dce775','#e6ee9c','#f0f4c3','#f9fbe7'],
        ['#006064','#00838f','#0097a7','#00acc1','#00bcd4','#26c6da','#4dd0e1','#80deea','#b2ebf2','#e0f7fa'],
        ['#1a237e','#283593','#303f9f','#3949ab','#3f51b5','#5c6bc0','#7986cb','#9fa8da','#c5cae9','#e8eaf6'],
        ['#3e2723','#4e342e','#5d4037','#6d4c41','#795548','#8d6e63','#a1887f','#bcaaa4','#d7ccc8','#efebe9','#fafafa'],
        ['#f57f17','#f9a825','#fbc02d','#fdd835','#ffeb3b','#fff176','#fff59d','#fff9c4','#fffde7'],
        ['#33691e','#558b2f','#689f38','#7cb342','#8bc34a','#9ccc65','#aed581','#c5e1a5','#dcedc8','#f1f8e9'],
        ['#4a148c','#6a1b9a','#7b1fa2','#8e24aa','#9c27b0','#ab47bc','#ce93d8','#f3e5f5','#fce4ec','#e8eaf6'],
    ];

    /** Strong 32-bit mix so nearby stimulus ids produce very different shapes and colors. */
    static mix32(n) {
        let x = (Number(n) | 0) >>> 0;
        x = ((x + 0x6ed9eba1) ^ (x >>> 16)) >>> 0;
        x = Math.imul(x ^ (x >>> 15), 0x7feb352d) >>> 0;
        x = Math.imul(x ^ (x >>> 13), 0x846ca68b) >>> 0;
        return (x ^ (x >>> 16)) >>> 0;
    }

    static fmt(n) {
        return n.toFixed(1);
    }

    /** Closed smooth path through edge midpoints; controls at vertices (Q …). */
    static smoothClosedQuadraticPath(pts) {
        const n = pts.length;
        if (n < 3) return "";
        const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const m0 = mid(pts[n - 1], pts[0]);
        let d = `M ${TopoMap.fmt(m0[0])} ${TopoMap.fmt(m0[1])}`;
        for (let i = 0; i < n; i++) {
            const ni = (i + 1) % n;
            const p = pts[i];
            const m = mid(pts[i], pts[ni]);
            d += ` Q ${TopoMap.fmt(p[0])} ${TopoMap.fmt(p[1])} ${TopoMap.fmt(m[0])} ${TopoMap.fmt(m[1])}`;
        }
        return d + " Z";
    }

    static buildAngles(mixedSeed, count) {
        const rnd = seededRandom(TopoMap.mix32(mixedSeed) ^ 0x2f6b2e1d);
        const rot0 = rnd() * Math.PI * 2;
        const irregular = 0.45 + rnd() * 0.45;
        const angles = [];
        for (let j = 0; j < count; j++) {
            angles.push(rot0 + (j / count) * Math.PI * 2 + (rnd() - 0.5) * irregular);
        }
        return angles;
    }

    static blobRing(cx, cy, angles, meanR, layerSeed, depth01) {
        const rnd = seededRandom(TopoMap.mix32(layerSeed));
        const pts = [];
        const wobble = 0.7 * (0.5 + 0.5 * (1 - depth01));
        for (let j = 0; j < angles.length; j++) {
            const t = angles[j] + (rnd() - 0.5) * (0.25 + 0.3 * (1 - depth01));
            const rr = meanR * (0.55 + rnd() * wobble);
            pts.push([cx + Math.cos(t) * rr, cy + Math.sin(t) * rr]);
        }
        return pts;
    }

    static pickPalette(seed) {
        const idx = TopoMap.mix32(seed ^ 0xcafebabe) % TopoMap.PALETTES.length;
        return TopoMap.PALETTES[idx];
    }

    static pickPaletteExcluding(seed, excludeIndices) {
        const excludeSet = new Set(excludeIndices || []);
        if (excludeSet.size >= TopoMap.PALETTES.length) {
            // All palettes excluded, just pick randomly
            return TopoMap.pickPalette(seed);
        }
        let idx = TopoMap.mix32(seed ^ 0xcafebabe) % TopoMap.PALETTES.length;
        let attempts = 0;
        while (excludeSet.has(idx) && attempts < TopoMap.PALETTES.length) {
            idx = (idx + 1) % TopoMap.PALETTES.length;
            attempts++;
        }
        return TopoMap.PALETTES[idx];
    }

    static parseColor(hex) {
        const h = hex.replace('#', '');
        return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
    }

    static lerpColor(a, b, t) {
        const pa = TopoMap.parseColor(a), pb = TopoMap.parseColor(b);
        const r = Math.round(pa[0] + (pb[0] - pa[0]) * t);
        const g = Math.round(pa[1] + (pb[1] - pa[1]) * t);
        const bl = Math.round(pa[2] + (pb[2] - pa[2]) * t);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
    }

    static colorForLayer(palette, L, numLayers) {
        const t = numLayers <= 1 ? 0 : L / (numLayers - 1);
        const idx = t * (palette.length - 1);
        const lo = Math.floor(idx);
        const hi = Math.min(lo + 1, palette.length - 1);
        const frac = idx - lo;
        if (frac < 0.01) return palette[lo];
        if (frac > 0.99) return palette[hi];
        return TopoMap.lerpColor(palette[lo], palette[hi], frac);
    }

    generateTopo(seed, splits, excludePalettes) {
        const W = 50;
        const H = 50;
        const mixed = TopoMap.mix32(seed);
        const raw = splits | 0;
        const numLayers = Math.max(12, Math.min(40, Math.min(50, raw || 20)));
        const nVerts = 11 + (mixed % 9);
        const domKey = `t${(++TopoMap._domSeq).toString(36)}${mixed.toString(16)}`;
        const clipId = `tc-${domKey}`;
        const svgId = `ts-${domKey}`;

        const palette = TopoMap.pickPaletteExcluding(mixed, excludePalettes);

        const layerVaryRnd = seededRandom(mixed ^ 0x5a5a5a5a);
        const actualLayers = Math.max(12, Math.min(40,
            numLayers + Math.floor(layerVaryRnd() * 14) - 3));

        const baseColor = palette[palette.length - 1];

        let paths = "";
        // Outer contours extend well beyond the 50×50 viewBox for dramatic mountain effect
        const maxR = 100 + (TopoMap.mix32(seed + 99) % 50);
        const minR = 2 + (TopoMap.mix32(seed + 7) % 3);

        // Shared peak center with slight per-layer drift (concentric contours)
        const peakRnd = seededRandom(mixed ^ 0x3c3c3c3c);
        const peakX = 20 + peakRnd() * 10;
        const peakY = 20 + peakRnd() * 10;

        // Generate all contour shapes first
        const contours = [];
        for (let L = 0; L < actualLayers; L++) {
            const layerMixed = TopoMap.mix32(seed + L * 0x85ebca6b);
            const rndL = seededRandom(layerMixed);
            const depth = L / Math.max(1, actualLayers - 1);
            const meanR = (maxR * (1 - depth) + minR * depth) * (0.93 + (rndL() - 0.5) * 0.12);
            // Slight drift from peak center — outer layers drift more
            const drift = 3 + depth * 5;
            const cx = peakX + (rndL() - 0.5) * drift;
            const cy = peakY + (rndL() - 0.5) * drift;
            const angles = TopoMap.buildAngles(seed + L * 0x9e3779b1, nVerts);
            const pts = TopoMap.blobRing(cx, cy, angles, meanR, seed + L * 10007 + 0x51bace, depth);
            const d = TopoMap.smoothClosedQuadraticPath(pts);
            if (!d) continue;
            const fill = TopoMap.colorForLayer(palette, L, actualLayers);
            contours.push({ d, fill, depth, L });
        }

        // Render: each contour band drawn with fill + black stroke (outermost first)
        for (const c of contours) {
            paths += `<path d="${c.d}" fill="${c.fill}" stroke="#000000" stroke-width="0.8" stroke-linejoin="round"/>`;
        }

        return `<svg id="${svgId}" class="noise topo topo-stimulus" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
            + `<defs><clipPath id="${clipId}"><rect width="${W}" height="${H}"></rect></clipPath></defs>`
            + `<rect width="${W}" height="${H}" fill="${baseColor}"></rect>`
            + `<g clip-path="url(#${clipId})">${paths}</g></svg>`;
    }
}
