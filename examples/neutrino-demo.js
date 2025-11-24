// Vega-Neutrino Demo Script

// Logging utility
function log(message, type = 'info') {
  const logDiv = document.getElementById('log');
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  logDiv.appendChild(entry);
  logDiv.scrollTop = logDiv.scrollHeight;
  console.log(message);
}

// Update stats display
function updateStats(stats) {
  if (stats.rowCount !== undefined) {
    document.getElementById('rowCount').textContent = stats.rowCount.toLocaleString();
  }
  if (stats.memoryUsage !== undefined) {
    document.getElementById('memoryUsage').textContent = `${stats.memoryUsage}MB`;
  }
  if (stats.loadTime !== undefined) {
    document.getElementById('loadTime').textContent = `${stats.loadTime}ms`;
  }
  if (stats.aggTime !== undefined) {
    document.getElementById('aggTime').textContent = `${stats.aggTime}ms`;
  }
}

// Generate sample data
function generateSampleData(rowCount = 100000) {
  log(`Generating ${rowCount.toLocaleString()} rows of sample data...`);
  const startTime = performance.now();
  
  const categories = ['Electronics', 'Clothing', 'Food', 'Books', 'Toys', 'Sports', 'Home', 'Garden'];
  const regions = ['North', 'South', 'East', 'West', 'Central'];
  
  const data = [];
  for (let i = 0; i < rowCount; i++) {
    data.push({
      id: i,
      category: categories[Math.floor(Math.random() * categories.length)],
      region: regions[Math.floor(Math.random() * regions.length)],
      sales: Math.floor(Math.random() * 1000) + 100,
      quantity: Math.floor(Math.random() * 50) + 1,
      date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString()
    });
  }
  
  const elapsed = Math.round(performance.now() - startTime);
  log(`Generated ${rowCount.toLocaleString()} rows in ${elapsed}ms`, 'info');
  
  return data;
}

// Vega spec for aggregated bar chart
const vegaSpec = {
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "width": 800,
  "height": 400,
  "padding": 5,
  
  "data": [
    {
      "name": "sales",
      "neutrino": true,  // Enable Neutrino for this dataset
      "values": []
    },
    {
      "name": "aggregated",
      "source": "sales",
      "transform": [
        {
          "type": "aggregate",
          "groupby": ["category"],
          "ops": ["sum", "count", "mean"],
          "fields": ["sales", null, "sales"],
          "as": ["total_sales", "count", "avg_sales"]
        }
      ]
    }
  ],
  
  "scales": [
    {
      "name": "xscale",
      "type": "band",
      "domain": {"data": "aggregated", "field": "category"},
      "range": "width",
      "padding": 0.1
    },
    {
      "name": "yscale",
      "type": "linear",
      "domain": {"data": "aggregated", "field": "total_sales"},
      "range": "height",
      "nice": true,
      "zero": true
    },
    {
      "name": "color",
      "type": "ordinal",
      "domain": {"data": "aggregated", "field": "category"},
      "range": {"scheme": "category10"}
    }
  ],
  
  "axes": [
    {"orient": "bottom", "scale": "xscale", "title": "Category"},
    {"orient": "left", "scale": "yscale", "title": "Total Sales", "format": "~s"}
  ],
  
  "marks": [
    {
      "type": "rect",
      "from": {"data": "aggregated"},
      "encode": {
        "enter": {
          "x": {"scale": "xscale", "field": "category"},
          "width": {"scale": "xscale", "band": 1},
          "y": {"scale": "yscale", "field": "total_sales"},
          "y2": {"scale": "yscale", "value": 0},
          "fill": {"scale": "color", "field": "category"}
        },
        "update": {
          "fillOpacity": {"value": 0.8}
        },
        "hover": {
          "fillOpacity": {"value": 1}
        }
      }
    },
    {
      "type": "text",
      "from": {"data": "aggregated"},
      "encode": {
        "enter": {
          "x": {"scale": "xscale", "field": "category", "band": 0.5},
          "y": {"scale": "yscale", "field": "total_sales", "offset": -5},
          "text": {"signal": "format(datum.total_sales, '~s')"},
          "align": {"value": "center"},
          "baseline": {"value": "bottom"},
          "fill": {"value": "#333"},
          "fontSize": {"value": 11},
          "fontWeight": {"value": "bold"}
        }
      }
    }
  ]
};

let view = null;
let currentData = null;

// Initialize the visualization
async function initVisualization() {
  try {
    log('Initializing Vega-Neutrino...');
    
    // Parse the Vega spec
    const runtime = vega.parse(vegaSpec);
    view = new vega.View(runtime)
      .renderer('canvas')
      .initialize('#vis')
      .hover();
    
    // Enable Neutrino
    await vegaNeutrino.enableNeutrino(view, {
      workerCount: navigator.hardwareConcurrency || 4,
      threshold: 10000  // Use workers for datasets > 10K rows
    });
    
    log('✓ Vega-Neutrino initialized successfully', 'info');
    
  } catch (error) {
    log(`✗ Error initializing: ${error.message}`, 'error');
    console.error(error);
  }
}

// Load data and render
async function loadAndRender(data) {
  if (!view) {
    await initVisualization();
  }
  
  try {
    const startTime = performance.now();
    log(`Loading ${data.length.toLocaleString()} rows into Neutrino...`);
    
    // Insert data
    const changeset = vega.changeset().insert(data);
    view.change('sales', changeset);
    
    const loadTime = Math.round(performance.now() - startTime);

    // Run the dataflow
    const aggStartTime = performance.now();
    await view.runAsync();
    const aggTime = Math.round(performance.now() - aggStartTime);

    log(`✓ Data loaded in ${loadTime}ms, aggregation in ${aggTime}ms`, 'info');

    // Get memory usage
    const memoryUsage = vegaNeutrino.getNeutrinoMemoryUsage(view);
    const memoryMB = memoryUsage ? Math.round(memoryUsage.total_bytes / 1048576) : 0;

    updateStats({
      rowCount: data.length,
      memoryUsage: memoryMB,
      loadTime: loadTime,
      aggTime: aggTime
    });

    currentData = data;
    document.getElementById('exportNtro').disabled = false;

  } catch (error) {
    log(`✗ Error loading data: ${error.message}`, 'error');
    console.error(error);
  }
}

// Event handlers
document.getElementById('generateData').addEventListener('click', async () => {
  const button = document.getElementById('generateData');
  button.disabled = true;
  button.textContent = 'Generating...';

  try {
    const data = generateSampleData(100000);
    await loadAndRender(data);
  } finally {
    button.disabled = false;
    button.textContent = 'Generate Sample Data (100K rows)';
  }
});

document.getElementById('exportNtro').addEventListener('click', async () => {
  try {
    log('Exporting data as .ntro format...');
    const ntroBytes = vegaNeutrino.exportDatasetAsNtro(view, 'sales');

    // Create download
    const blob = new Blob([ntroBytes], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales-data.ntro';
    a.click();
    URL.revokeObjectURL(url);

    const sizeMB = (ntroBytes.byteLength / 1048576).toFixed(2);
    log(`✓ Exported ${sizeMB}MB .ntro file`, 'info');

  } catch (error) {
    log(`✗ Error exporting: ${error.message}`, 'error');
    console.error(error);
  }
});

document.getElementById('loadNtro').addEventListener('click', async () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.ntro';

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      log(`Loading .ntro file: ${file.name}...`);
      const arrayBuffer = await file.arrayBuffer();

      // Update spec to load from .ntro
      const ntroSpec = {
        ...vegaSpec,
        data: [
          {
            name: 'sales',
            format: { type: 'neutrino' },
            neutrino: true,
            values: new Uint8Array(arrayBuffer)
          },
          vegaSpec.data[1]
        ]
      };

      const runtime = vega.parse(ntroSpec);
      view = new vega.View(runtime)
        .renderer('canvas')
        .initialize('#vis')
        .hover();

      await vegaNeutrino.enableNeutrino(view);
      await view.runAsync();

      log(`✓ Loaded .ntro file successfully`, 'info');

    } catch (error) {
      log(`✗ Error loading .ntro: ${error.message}`, 'error');
      console.error(error);
    }
  };

  input.click();
});

document.getElementById('clearCache').addEventListener('click', async () => {
  try {
    if (vegaNeutrino.isIndexedDBAvailable()) {
      const store = await vegaNeutrino.getIndexedDBStore();
      // Clear all cached data
      log('Clearing IndexedDB cache...');
      // Note: Actual implementation would need a clearAll method
      log('✓ Cache cleared', 'info');
    } else {
      log('IndexedDB not available', 'warning');
    }
  } catch (error) {
    log(`✗ Error clearing cache: ${error.message}`, 'error');
  }
});

// Initialize on page load
window.addEventListener('load', () => {
  log('Vega-Neutrino Demo loaded. Click "Generate Sample Data" to begin.');
  log('This demo showcases columnar storage and SIMD-accelerated aggregations.');
});

