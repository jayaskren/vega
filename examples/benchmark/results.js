/**
 * Results storage for Vega-Neutrino benchmark suite
 * Uses localStorage to persist results across page refreshes
 */

const STORAGE_KEY = 'vega_neutrino_benchmark_results';

export function getResults() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading results:', e);
  }
  return {};
}

export function saveResult(testType, size, result) {
  const results = getResults();
  const key = `${testType}_${size}`;
  results[key] = {
    ...result,
    timestamp: Date.now()
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  } catch (e) {
    console.error('Error saving result:', e);
  }
}

export function clearResults() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing results:', e);
  }
}

export function getResult(testType, size) {
  const results = getResults();
  return results[`${testType}_${size}`] || null;
}

export function exportResults() {
  const results = getResults();
  const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `benchmark-results-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatResultsTable(results) {
  const sizes = ['100k', '1m', '10m'];
  const rows = [];

  for (const size of sizes) {
    const vega = results[`vega_${size}`];
    const neutrino = results[`neutrino_${size}`];

    rows.push({
      size: size.toUpperCase(),
      vegaTime: vega ? vega.totalTime : null,
      vegaMemory: vega ? vega.memoryDelta : null,
      neutrinoTime: neutrino ? neutrino.totalTime : null,
      neutrinoMemory: neutrino ? neutrino.memoryDelta : null,
      timeSpeedup: (vega && neutrino) ? (vega.totalTime / neutrino.totalTime) : null,
      memorySavings: (vega && neutrino && vega.memoryDelta && neutrino.memoryDelta)
        ? (vega.memoryDelta / neutrino.memoryDelta) : null
    });
  }

  return rows;
}

// Get detailed breakdown for a specific result
export function getResultBreakdown(testType, size) {
  const result = getResult(testType, size);
  if (!result) return null;

  return {
    loadTime: result.loadTime,
    parseTime: result.parseTime,
    aggregateTime: result.aggregateTime,
    renderTime: result.renderTime,
    totalTime: result.totalTime,
    memoryBefore: result.memoryBefore,
    memoryAfter: result.memoryAfter,
    memoryDelta: result.memoryDelta,
    timestamp: result.timestamp
  };
}
