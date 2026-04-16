// Pattern Display for Anchor Space v2
// Shows visual diagram of colored shapes for memorization

class PatternDisplay {
    constructor(containerId, shapeCount = 4) {
        this.container = document.getElementById(containerId);
        this.shapeCount = shapeCount;
        this.colors = [
            { name: 'Red', fill: '#e74c3c', stroke: '#c0392b' },
            { name: 'Blue', fill: '#3498db', stroke: '#2980b9' },
            { name: 'Green', fill: '#2ecc71', stroke: '#27ae60' },
            { name: 'Yellow', fill: '#f1c40f', stroke: '#f39c12' },
            { name: 'Purple', fill: '#9b59b6', stroke: '#8e44ad' },
            { name: 'Orange', fill: '#e67e22', stroke: '#d35400' },
            { name: 'Cyan', fill: '#1abc9c', stroke: '#16a085' },
            { name: 'Pink', fill: '#fd79a8', stroke: '#e84393' }
        ];
        this.shapes = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star'];
        this.onReady = null;
    }

    generatePattern(wordCoordMap, neighbors) {
        const words = Object.keys(wordCoordMap).filter(w => wordCoordMap[w].some(c => c !== 0));
        const numShapes = Math.min(words.length, this.shapeCount);
        
        // Assign colors and shapes to words
        const pattern = {};
        const usedColors = new Set();
        const usedShapes = new Set();
        
        for (let i = 0; i < numShapes; i++) {
            const word = words[i];
            const color = this.colors[i % this.colors.length];
            const shape = this.shapes[i % this.shapes.length];
            pattern[word] = { color, shape, coord: wordCoordMap[word] };
        }
        
        return pattern;
    }

    createSVGElement(shape, color, x, y, size) {
        const halfSize = size / 2;
        
        switch(shape) {
            case 'circle':
                return `<circle cx="${x}" cy="${y}" r="${halfSize}" fill="${color.fill}" stroke="${color.stroke}" stroke-width="3"/>`;
            case 'square':
                return `<rect x="${x - halfSize}" y="${y - halfSize}" width="${size}" height="${size}" rx="4" fill="${color.fill}" stroke="${color.stroke}" stroke-width="3"/>`;
            case 'triangle':
                return `<polygon points="${x},${y - halfSize} ${x + halfSize},${y + halfSize} ${x - halfSize},${y + halfSize}" fill="${color.fill}" stroke="${color.stroke}" stroke-width="3"/>`;
            case 'diamond':
                return `<polygon points="${x},${y - halfSize} ${x + halfSize},${y} ${x},${y + halfSize} ${x - halfSize},${y}" fill="${color.fill}" stroke="${color.stroke}" stroke-width="3"/>`;
            case 'hexagon':
                const hexPoints = [];
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i - Math.PI / 2;
                    hexPoints.push(`${x + halfSize * Math.cos(angle)},${y + halfSize * Math.sin(angle)}`);
                }
                return `<polygon points="${hexPoints.join(' ')}" fill="${color.fill}" stroke="${color.stroke}" stroke-width="3"/>`;
            case 'star':
                const starPoints = [];
                for (let i = 0; i < 10; i++) {
                    const angle = (Math.PI / 5) * i - Math.PI / 2;
                    const radius = i % 2 === 0 ? halfSize : halfSize * 0.4;
                    starPoints.push(`${x + radius * Math.cos(angle)},${y + radius * Math.sin(angle)}`);
                }
                return `<polygon points="${starPoints.join(' ')}" fill="${color.fill}" stroke="${color.stroke}" stroke-width="3"/>`;
            default:
                return `<circle cx="${x}" cy="${y}" r="${halfSize}" fill="${color.fill}" stroke="${color.stroke}" stroke-width="3"/>`;
        }
    }

    render(pattern) {
        if (!this.container) return;
        
        const svgSize = 300;
        const center = svgSize / 2;
        const scale = 40;
        const shapeSize = 36;
        
        let svgContent = `
            <defs>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
                </filter>
            </defs>
            <rect x="0" y="0" width="${svgSize}" height="${svgSize}" fill="#1a1a2e" rx="8"/>
            <g filter="url(#shadow)">
        `;
        
        // Render grid lines
        for (let i = -3; i <= 3; i++) {
            const pos = center + i * scale;
            svgContent += `<line x1="${center - 3 * scale}" y1="${pos}" x2="${center + 3 * scale}" y2="${pos}" stroke="#333" stroke-width="1"/>`;
            svgContent += `<line x1="${pos}" y1="${center - 3 * scale}" x2="${pos}" y2="${center + 3 * scale}" stroke="#333" stroke-width="1"/>`;
        }
        
        // Render center point
        svgContent += `<circle cx="${center}" cy="${center}" r="4" fill="#fff"/>`;
        
        // Render shapes
        Object.entries(pattern).forEach(([word, data]) => {
            const [x, y] = data.coord;
            const screenX = center + x * scale;
            const screenY = center - y * scale; // Flip Y for screen coords
            svgContent += this.createSVGElement(data.shape, data.color, screenX, screenY, shapeSize);
            
            // Add label below shape
            svgContent += `<text x="${screenX}" y="${screenY + shapeSize/2 + 15}" text-anchor="middle" fill="#fff" font-size="12" font-family="monospace">${word.substring(0, 3)}</text>`;
        });
        
        svgContent += '</g>';
        
        this.container.innerHTML = `
            <div class="pattern-display-container" style="text-align: center; margin: 1rem 0;">
                <svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                    ${svgContent}
                </svg>
                <div class="pattern-legend" style="margin-top: 0.5rem; display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                    ${Object.entries(pattern).map(([word, data]) => `
                        <span style="display: flex; align-items: center; gap: 0.3rem;">
                            <span style="display: inline-block; width: 12px; height: 12px; background: ${data.color.fill}; border: 2px solid ${data.color.stroke}; border-radius: 2px;"></span>
                            <span style="color: var(--text-color); font-size: 0.85rem;">${data.color.name} ${data.shape}</span>
                        </span>
                    `).join('')}
                </div>
                <button id="pattern-ready-btn" class="explanation-button" style="margin-top: 1rem;">I'm Ready</button>
            </div>
        `;
        
        // Bind ready button
        const readyBtn = document.getElementById('pattern-ready-btn');
        if (readyBtn) {
            readyBtn.addEventListener('click', () => {
                if (this.onReady) this.onReady();
            });
        }
    }

    hide() {
        if (this.container) {
            this.container.innerHTML = '';
            this.container.style.display = 'none';
        }
    }

    show() {
        if (this.container) {
            this.container.style.display = 'block';
        }
    }
}

// Helper function to create pattern display
function createPatternDisplay(containerId, shapeCount) {
    return new PatternDisplay(containerId, shapeCount);
}
