class ProgressGraph {
    constructor() {
        this.scoreChart = null;
        this.countChart = null;
        this.timeChart = null;
        this.timePerPremiseChart = null;
        this.colorCursor = 0;
    }

    findDay(question) {
        const adjustedTimestamp = question.timestamp - (4 * 60 * 60 * 1000);
        const date = new Date(adjustedTimestamp);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    calculateTypeData(data, groupByPremises) {
        const groupedByType = {};

        data.forEach((question) => {
            const day = this.findDay(question);

            const isRight = question.correctness === 'right';
            if (groupByPremises && !isRight) {
                return;
            }
            const timeElapsed = question.timeElapsed;

            let type = question.type + (groupByPremises ? (' p' + question.premises) : '');
            if (question.modifiers && question.modifiers.length > 0) {
                type += ` ${question.modifiers.join('-')}`;
            }
            if (question.tags && question.tags.length > 0) {
                type += ` ${question.tags.join('-')}`;
            }

            if (!groupedByType[type]) {
                groupedByType[type] = {};
            }

            if (!groupedByType[type][day]) {
                groupedByType[type][day] = { totalTime: 0, count: 0 };
            }

            groupedByType[type][day].totalTime += timeElapsed;
            groupedByType[type][day].count += 1;
            groupedByType[type][day].numPremises = question.premises;
        });

        const result = {};
        for (const type in groupedByType) {
            result[type] = [];
            for (const day in groupedByType[type]) {
                const count = groupedByType[type][day].count;
                const numPremises = groupedByType[type][day].numPremises;
                const averageTime = groupedByType[type][day].totalTime / count;
                result[type].push({ day, count, averageTime: averageTime / 1000, numPremises });
            }
            result[type].sort((a, b) => new Date(a.day) - new Date(b.day));
        }

        return result;
    }

    calculateTimeSpentData(data) {
        const groupedByDay = {};

        data.forEach((question) => {
            const day = this.findDay(question);
            if (!groupedByDay[day]) {
                groupedByDay[day] = 0;
            }

            groupedByDay[day] += question.timeElapsed / 1000 / 60;
        });

        const result = [];
        for (const day in groupedByDay) {
            result.push({ day, time: groupedByDay[day]});
        }

        result.sort((a, b) => new Date(a.day) - new Date(b.day));
        return result;
    }

    async plotData() {
        if (this.scoreChart) {
            this.scoreChart.destroy();
            this.scoreChart = null;
        }
        if (this.countChart) {
            this.countChart.destroy();
            this.countChart = null;
        }
        if (this.timeChart) {
            this.timeChart.destroy();
            this.timeChart = null;
        }
        if (this.timePerPremiseChart) {
            this.timePerPremiseChart.destroy();
            this.timePerPremiseChart = null;
        }
        await this.plotScore();
    }

    randomColor(alpha = 0.92) {
        const styles = getComputedStyle(document.documentElement);
        const accentHue = parseFloat(styles.getPropertyValue('--accent-h')) || 220;
        const hue = (accentHue + this.colorCursor * 47) % 360;
        this.colorCursor += 1;
        return `hsla(${hue}, 82%, 64%, ${alpha})`;
    }

    updateSummary(data) {
        if (!graphSummaryDays || !graphSummaryTotal || !graphSummaryAccuracy || !graphSummaryTime) {
            return;
        }

        if (!data || data.length === 0) {
            graphSummaryDays.textContent = '—';
            graphSummaryTotal.textContent = '—';
            graphSummaryAccuracy.textContent = '—';
            graphSummaryTime.textContent = '—';
            return;
        }

        const days = new Set(data.map(q => this.findDay(q))).size;
        const total = data.length;
        const correct = data.filter(q => q.correctness === 'right').length;
        const accuracy = total > 0 ? (100 * correct / total) : 0;
        const totalMinutes = data.reduce((sum, q) => sum + (q.timeElapsed || 0), 0) / 1000 / 60;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.round(totalMinutes % 60);

        graphSummaryDays.textContent = days;
        graphSummaryTotal.textContent = total;
        graphSummaryAccuracy.textContent = `${accuracy.toFixed(0)}%`;
        graphSummaryTime.textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }

    async plotScore() {
        let data = await getAllRRTProgress();
        data = Array.isArray(data) ? data : [];
        data = data.filter(q => (q.timeElapsed || 0) >= 1500);
        this.updateSummary(data);
        if (!data || data.length === 0) {
            return;
        }
        this.colorCursor = 0;
        const typeData = this.calculateTypeData(data, false);
        const premiseLevelData = this.calculateTypeData(data, true);

        const firstType = Object.values(typeData)[0];
        const hasPremiseLevelData = Object.keys(premiseLevelData).length > 0;
        if (!firstType) {
            return;
        }
        const labels = firstType.map(entry => entry.day);
        const premiseLevelLabels = hasPremiseLevelData
            ? Object.values(premiseLevelData)[0].map((entry) => entry.day)
            : [];

        const scoreDatasets = hasPremiseLevelData ? Object.keys(premiseLevelData).map((type) => {
            return {
                label: type,
                data: premiseLevelData[type].map((entry) => ({ x: entry.day, y: entry.averageTime })),
                borderColor: this.randomColor(),
                backgroundColor: 'transparent',
                borderWidth: 2,
                pointRadius: 2,
                pointHoverRadius: 5,
                tension: 0.32,
                fill: false,
            };
        }) : [];

        const timePerPremiseDatasets = hasPremiseLevelData ? Object.keys(premiseLevelData).map(type => {
            return {
                label: type,
                data: premiseLevelData[type].map((entry) => ({ x: entry.day, y: entry.numPremises / entry.averageTime })),
                borderColor: this.randomColor(),
                backgroundColor: 'transparent',
                borderWidth: 2,
                pointRadius: 2,
                pointHoverRadius: 5,
                tension: 0.32,
                fill: false,
            };
        }) : [];

        const countDatasets = Object.keys(typeData).map((type) => {
            return {
                label: type,
                data: typeData[type].map((entry) => ({ x: entry.day, y: entry.count })),
                borderColor: this.randomColor(),
                backgroundColor: this.randomColor(0.18),
                borderWidth: 2,
                borderRadius: 6,
            };
        });

        const timeData = this.calculateTimeSpentData(data);
        const totalTimeSpent = timeData.map(entry => entry.time).reduce((a,b) => a + b, 0);
        const totalHours = Math.floor(totalTimeSpent / 60);
        const extraMinutes = Math.round(totalTimeSpent % 60);
        const totalTimeSpentDisplay = `Total = ${totalHours}h ${extraMinutes}m`;
        const timeDatasets = [{
            label: `Time Spent (Minutes)`,
            data: timeData.map(entry => ({ x: entry.day, y: entry.time })),
            backgroundColor: this.randomColor(0.42),
            borderColor: this.randomColor(),
            borderWidth: 2,
            borderRadius: 8,
        }];

        const countCtx = canvasCount.getContext('2d');
        this.countChart = this.createChart(countCtx, labels, countDatasets, 'line', 'Count', 0, 0);
        const timeCtx = canvasTime.getContext('2d');
        this.timeChart = this.createChart(timeCtx, labels, timeDatasets, 'bar', 'Time Spent', 1, 2, '', totalTimeSpentDisplay);
        if (hasPremiseLevelData) {
            const scoreCtx = canvasScore.getContext('2d');
            this.scoreChart = this.createChart(scoreCtx, premiseLevelLabels, scoreDatasets, 'line', 'Average Correct Time (s)', 1, 2, 's');
            const timePerPremiseCtx = canvasTimePerPremise.getContext('2d');
            this.timePerPremiseChart = this.createChart(timePerPremiseCtx, premiseLevelLabels, timePerPremiseDatasets, 'line', 'Premise / second', 1, 2, ' premise/s');
        }
    }

    createChart(ctx, labels, datasets, type, yAxisTitle, tickDecimals = 1, tooltipDecimals = 2, unit='', subtitle) {
        const isLightMode = document.body.classList.contains('light-mode');
        const textColor = isLightMode ? '#333' : '#ccc';
        const gridColor = isLightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
        return new Chart(ctx, {
            type: type,
            data: {
                labels,
                datasets,
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 260,
                    easing: 'easeOutQuart',
                },
                normalized: true,
                resizeDelay: 120,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            tooltipFormat: 'yyyy-MM-dd',
                        },
                        title: {
                            display: true,
                            text: 'Day',
                            color: textColor,
                        },
                        ticks: {
                            color: textColor,
                        },
                        grid: {
                            color: gridColor,
                            drawBorder: false,
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: yAxisTitle,
                            color: textColor,
                        },
                        ticks: {
                            color: textColor,
                            callback: function (value) {
                                return value.toFixed(tickDecimals);
                            }
                        },
                        grid: {
                            color: gridColor,
                        },
                    },
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                let value = tooltipItem.raw;
                                return `${tooltipItem.dataset.label}: ${value.y.toFixed(tooltipDecimals)}${unit}`;
                            }
                        }
                    },
                    subtitle: {
                        display: subtitle ? true : false,
                        text: subtitle,
                        align: 'end',
                        color: isLightMode ? '#555' : '#EEEEEE',
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor,
                            boxWidth: 10,
                            boxHeight: 10,
                            usePointStyle: true,
                            padding: 14,
                        },
                    },
                },
            },
        });
    }

    createGraph() {
        graphPopup.classList.add('visible');
        this.plotData().catch(err => {
            console.error('Failed to render graph:', err);
            this.updateSummary([]);
        });
    }

    clearGraph() {
        graphPopup.classList.remove('visible');
    }
}

const graphPopup = document.getElementById('graph-popup');
const graphClose = document.getElementById('graph-close-popup');
const graphButton = document.getElementById('graph-label');
const graphSummaryDays = document.getElementById('graph-summary-days');
const graphSummaryTotal = document.getElementById('graph-summary-total');
const graphSummaryAccuracy = document.getElementById('graph-summary-accuracy');
const graphSummaryTime = document.getElementById('graph-summary-time');


const graphTime = document.getElementById('graph-popup-time');
const graphCount = document.getElementById('graph-popup-count');
const graphScore = document.getElementById('graph-popup-score');
const graphTimePerPremise = document.getElementById('graph-popup-time-per-premise');
const graphs = [graphTime, graphCount, graphScore, graphTimePerPremise];

const canvasTime = document.getElementById('graph-canvas-time');
const canvasCount = document.getElementById('graph-canvas-count');
const canvasScore = document.getElementById('graph-canvas-score');
const canvasTimePerPremise = document.getElementById('graph-canvas-time-per-premise');
const canvases = [canvasTime, canvasCount, canvasScore, canvasTimePerPremise];

const graphTimeSelect = document.getElementById('graph-select-time');
const graphCountSelect = document.getElementById('graph-select-count');
const graphScoreSelect = document.getElementById('graph-select-score');
const graphTimePerPremiseSelect = document.getElementById('graph-select-time-per-premise');
const graphSelects = [graphTimeSelect, graphCountSelect, graphScoreSelect, graphTimePerPremiseSelect];

if (graphTimeSelect && graphTime) {
    graphTimeSelect.addEventListener('click', () => {
        graphs.filter(Boolean).forEach(graph => graph.classList.remove('visible'));
        graphSelects.filter(Boolean).forEach(select => select.classList.remove('selected'));
        graphTime.classList.add('visible');
        graphTimeSelect.classList.add('selected');
    });
}

if (graphCountSelect && graphCount) {
    graphCountSelect.addEventListener('click', () => {
        graphs.filter(Boolean).forEach(graph => graph.classList.remove('visible'));
        graphSelects.filter(Boolean).forEach(select => select.classList.remove('selected'));
        graphCount.classList.add('visible');
        graphCountSelect.classList.add('selected');
    });
}

if (graphScoreSelect && graphScore) {
    graphScoreSelect.addEventListener('click', () => {
        graphs.filter(Boolean).forEach(graph => graph.classList.remove('visible'));
        graphSelects.filter(Boolean).forEach(select => select.classList.remove('selected'));
        graphScore.classList.add('visible');
        graphScoreSelect.classList.add('selected');
    });
}

if (graphTimePerPremiseSelect && graphTimePerPremise) {
    graphTimePerPremiseSelect.addEventListener('click', () => {
        graphs.filter(Boolean).forEach(graph => graph.classList.remove('visible'));
        graphSelects.filter(Boolean).forEach(select => select.classList.remove('selected'));
        graphTimePerPremise.classList.add('visible');
        graphTimePerPremiseSelect.classList.add('selected');
    });
}

const PROGRESS_GRAPH = new ProgressGraph();

if (graphClose) {
    graphClose.addEventListener('click', () => {
        PROGRESS_GRAPH.clearGraph();
    });
}

if (graphButton) {
    graphButton.addEventListener('click', () => {
        PROGRESS_GRAPH.createGraph();
    });
}

if (graphPopup) {
    document.addEventListener('click', (event) => {
        if (graphPopup.classList.contains('visible') && !graphPopup.contains(event.target) && !(graphButton && graphButton.contains(event.target))) {
            PROGRESS_GRAPH.clearGraph();
        }
    });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && graphPopup.classList.contains('visible')) {
      PROGRESS_GRAPH.clearGraph();
  }
});
