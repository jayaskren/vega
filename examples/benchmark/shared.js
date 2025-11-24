/**
 * Shared utilities for Vega-Neutrino benchmark suite
 */

// Timing utilities
export function now() {
  return performance.now();
}

export function formatTime(ms) {
  if (ms < 1000) {
    return `${ms.toFixed(0)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// Memory measurement
export function getMemoryUsage() {
  if (performance.memory) {
    return {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      available: true
    };
  }
  return { available: false };
}

export function hasMemoryAPI() {
  return !!performance.memory;
}

// Force garbage collection if available
export async function forceGC() {
  if (window.gc) {
    window.gc();
  }
  // Give browser time to collect
  await sleep(100);
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// URL parameter helpers
export function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

export function getDataSize() {
  const size = getUrlParam('size');
  if (size && ['100k', '1m', '10m'].includes(size.toLowerCase())) {
    return size.toLowerCase();
  }
  return '100k'; // default
}

// Data file paths
export function getCsvPath(size) {
  return `../data/benchmark-${size}.csv`;
}

export function getNtroPath(size) {
  return `../data/benchmark-${size}.ntro`;
}

// Progress reporting
export class ProgressReporter {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.steps = [];
  }

  addStep(name) {
    const step = {
      name,
      status: 'pending',
      result: null,
      element: null
    };

    if (this.container) {
      const div = document.createElement('div');
      div.className = 'progress-step pending';
      div.innerHTML = `<span class="status-icon">○</span> ${name}...`;
      this.container.appendChild(div);
      step.element = div;
    }

    this.steps.push(step);
    return this.steps.length - 1;
  }

  startStep(index) {
    const step = this.steps[index];
    if (step) {
      step.status = 'running';
      if (step.element) {
        step.element.className = 'progress-step running';
        step.element.querySelector('.status-icon').textContent = '⏳';
      }
    }
  }

  completeStep(index, result) {
    const step = this.steps[index];
    if (step) {
      step.status = 'complete';
      step.result = result;
      if (step.element) {
        step.element.className = 'progress-step complete';
        const resultText = result !== undefined ? ` ${result}` : '';
        step.element.innerHTML = `<span class="status-icon">✓</span> ${step.name}...${resultText}`;
      }
    }
  }

  failStep(index, error) {
    const step = this.steps[index];
    if (step) {
      step.status = 'failed';
      step.result = error;
      if (step.element) {
        step.element.className = 'progress-step failed';
        step.element.innerHTML = `<span class="status-icon">✗</span> ${step.name}... ${error}`;
      }
    }
  }
}

// Vega spec for benchmark (same aggregation for both tests)
export function getBenchmarkSpec(width = 600, height = 400) {
  return {
    "$schema": "https://vega.github.io/schema/vega/v5.json",
    "width": width,
    "height": height,
    "padding": 5,
    "data": [
      {
        "name": "source",
        "values": []
      },
      {
        "name": "aggregated",
        "source": "source",
        "transform": [
          {
            "type": "aggregate",
            "groupby": ["category"],
            "ops": ["sum", "sum", "average", "count"],
            "fields": ["sales", "profit", "price", null],
            "as": ["totalSales", "totalProfit", "avgPrice", "count"]
          }
        ]
      }
    ],
    "scales": [
      {
        "name": "x",
        "type": "band",
        "domain": {"data": "aggregated", "field": "category"},
        "range": "width",
        "padding": 0.1
      },
      {
        "name": "y",
        "type": "linear",
        "domain": {"data": "aggregated", "field": "totalSales"},
        "range": "height",
        "nice": true
      }
    ],
    "axes": [
      {"orient": "bottom", "scale": "x", "title": "Category"},
      {"orient": "left", "scale": "y", "title": "Total Sales", "format": ",.0f"}
    ],
    "marks": [
      {
        "type": "rect",
        "from": {"data": "aggregated"},
        "encode": {
          "enter": {
            "x": {"scale": "x", "field": "category"},
            "width": {"scale": "x", "band": 1},
            "y": {"scale": "y", "field": "totalSales"},
            "y2": {"scale": "y", "value": 0},
            "fill": {"value": "steelblue"}
          }
        }
      }
    ]
  };
}
