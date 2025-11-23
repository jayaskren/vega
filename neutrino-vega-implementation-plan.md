# Implementation Plan: Vega-Neutrino Integration

## Overview

This document provides a detailed technical implementation plan for integrating Neutrino into Vega. The integration creates an opt-in system where Vega users can leverage Neutrino's compressed columnar storage and SIMD-accelerated operations for large datasets.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Vega Spec                        │
│   {"data": [{"name": "x", "url": "...", "neutrino": true}]}    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    vega-neutrino Package                        │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ NeutrinoDS  │  │  Transforms  │  │    Worker Manager      │  │
│  │ DataSource  │  │  Aggregate   │  │  ┌─────────────────┐   │  │
│  │             │  │  Filter      │  │  │  Worker Pool    │   │  │
│  │  ┌───────┐  │  │  Window      │  │  │  ┌───────────┐  │   │  │
│  │  │ WASM  │  │  │  Collect     │  │  │  │  Worker 1 │  │   │  │
│  │  │ Table │  │  │              │  │  │  │  Worker 2 │  │   │  │
│  │  └───────┘  │  │  ┌────────┐  │  │  │  │  Worker N │  │   │  │
│  │             │  │  │  WASM  │  │  │  │  └───────────┘  │   │  │
│  └─────────────┘  │  └────────┘  │  │  └─────────────────┘   │  │
│                   └──────────────┘  └────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    vega-dataflow (existing)                     │
│         Pulse propagation, operator scheduling, etc.            │
└─────────────────────────────────────────────────────────────────┘
```

## Package Structure

```
packages/vega-neutrino/
├── package.json
├── README.md
├── src/
│   ├── index.js                    # Main exports
│   ├── enable.js                   # enableNeutrino() API
│   ├──
│   ├── datasource/
│   │   ├── NeutrinoDataSource.js   # Vega DataSource implementation
│   │   ├── NeutrinoTuple.js        # Tuple proxy for field access
│   │   └── TypeInference.js        # Column type detection
│   │
│   ├── transforms/
│   │   ├── NeutrinoAggregate.js    # Accelerated aggregation
│   │   ├── NeutrinoFilter.js       # Range-based filtering
│   │   ├── NeutrinoWindow.js       # Window functions
│   │   ├── NeutrinoCollect.js      # Materialization/sorting
│   │   └── index.js                # Transform registry
│   │
│   ├── wasm/
│   │   ├── loader.js               # WASM initialization
│   │   ├── bindings.js             # JS-WASM bridge functions
│   │   └── neutrino_bg.wasm        # Compiled WASM module
│   │
│   ├── workers/
│   │   ├── WorkerManager.js        # Worker pool management
│   │   ├── WorkerTask.js           # Task abstraction
│   │   └── neutrino.worker.js      # Worker entry point
│   │
│   └── persistence/
│       ├── IndexedDBStore.js       # IndexedDB integration
│       └── CacheManager.js         # Cache invalidation
│
├── test/
│   ├── datasource-test.js
│   ├── transforms-test.js
│   └── integration-test.js
│
└── wasm-src/                       # Rust source (or symlink to Neutrino)
    └── ...
```

## Phase 1: Core Infrastructure (Week 1-4)

### Week 1: Project Setup and WASM Integration

#### Task 1.1: Package Scaffolding

Create the package structure with build configuration:

```javascript
// packages/vega-neutrino/package.json
{
  "name": "vega-neutrino",
  "version": "0.1.0",
  "description": "Neutrino integration for Vega large dataset support",
  "main": "build/vega-neutrino.js",
  "module": "build/vega-neutrino.module.js",
  "unpkg": "build/vega-neutrino.min.js",
  "types": "types/index.d.ts",
  "files": [
    "src",
    "build",
    "types",
    "wasm"
  ],
  "scripts": {
    "build": "rollup -c",
    "test": "mocha --recursive test",
    "wasm": "wasm-pack build --target web wasm-src"
  },
  "dependencies": {
    "vega-dataflow": "^5.0.0",
    "vega-util": "^1.17.0"
  },
  "peerDependencies": {
    "vega": "^5.0.0"
  }
}
```

#### Task 1.2: WASM Loader

Implement async WASM loading with caching:

```javascript
// src/wasm/loader.js
let wasmInstance = null;
let wasmPromise = null;

export async function initializeNeutrino(options = {}) {
  if (wasmInstance) return wasmInstance;

  if (wasmPromise) return wasmPromise;

  wasmPromise = (async () => {
    const wasmUrl = options.wasmUrl ||
      new URL('./neutrino_bg.wasm', import.meta.url);

    const response = await fetch(wasmUrl);
    const bytes = await response.arrayBuffer();

    const { instance } = await WebAssembly.instantiate(bytes, {
      env: {
        // Environment bindings
      }
    });

    wasmInstance = instance.exports;
    return wasmInstance;
  })();

  return wasmPromise;
}

export function getWasm() {
  if (!wasmInstance) {
    throw new Error('Neutrino WASM not initialized. Call initializeNeutrino() first.');
  }
  return wasmInstance;
}

export function isInitialized() {
  return wasmInstance !== null;
}
```

#### Task 1.3: WASM Bindings

Create JS bridge to Neutrino WASM functions:

```javascript
// src/wasm/bindings.js
import { getWasm } from './loader.js';

export function createTable() {
  const wasm = getWasm();
  return wasm.table_new();
}

export function loadCSV(tablePtr, csvData, options = {}) {
  const wasm = getWasm();
  const encoder = new TextEncoder();
  const csvBytes = encoder.encode(csvData);

  // Allocate WASM memory and copy data
  const ptr = wasm.alloc(csvBytes.length);
  const memory = new Uint8Array(wasm.memory.buffer, ptr, csvBytes.length);
  memory.set(csvBytes);

  const result = wasm.table_load_csv(tablePtr, ptr, csvBytes.length);
  wasm.dealloc(ptr, csvBytes.length);

  return result;
}

export function getRowCount(tablePtr) {
  return getWasm().table_row_count(tablePtr);
}

export function getColumnCount(tablePtr) {
  return getWasm().table_column_count(tablePtr);
}

export function getValue(tablePtr, column, row) {
  const wasm = getWasm();
  const columnType = wasm.table_column_type(tablePtr, column);

  switch (columnType) {
    case 0: // Integer
      return wasm.table_get_integer(tablePtr, column, row);
    case 1: // Float
      return wasm.table_get_float(tablePtr, column, row);
    case 2: // String
      return getStringValue(wasm, tablePtr, column, row);
    case 3: // DateTime
      return new Date(wasm.table_get_datetime(tablePtr, column, row));
    default:
      return null;
  }
}

export function aggregate(tablePtr, config) {
  const wasm = getWasm();
  // Serialize config and call WASM aggregation
  return wasm.table_aggregate(tablePtr, JSON.stringify(config));
}

export function freeTable(tablePtr) {
  getWasm().table_free(tablePtr);
}
```

### Week 2: NeutrinoDataSource

#### Task 2.1: DataSource Implementation

Create the Vega-compatible data source:

```javascript
// src/datasource/NeutrinoDataSource.js
import { Transform, ingest } from 'vega-dataflow';
import { inherits } from 'vega-util';
import * as bindings from '../wasm/bindings.js';
import { NeutrinoTuple } from './NeutrinoTuple.js';

export default function NeutrinoDataSource(params) {
  Transform.call(this, null, params);
  this._table = null;        // WASM table pointer
  this._tuples = [];         // Tuple proxies
  this._columnMap = {};      // Column name -> index
  this._generation = 0;      // Change tracking
}

NeutrinoDataSource.Definition = {
  'type': 'NeutrinoDataSource',
  'metadata': {'source': true, 'generates': true},
  'params': [
    { 'name': 'url', 'type': 'string' },
    { 'name': 'format', 'type': 'object' },
    { 'name': 'async', 'type': 'boolean', 'default': true }
  ]
};

inherits(NeutrinoDataSource, Transform, {
  transform(_, pulse) {
    const out = pulse.fork(pulse.NO_FIELDS);

    if (this.value == null || _.modified('url')) {
      // Load data
      return this._load(_, out);
    }

    return out;
  },

  async _load(_, pulse) {
    const df = this.dataflow;

    try {
      // Load raw data via Vega's loader
      const data = await df.request(_.url, _.format);

      // Create Neutrino table
      this._table = bindings.createTable();

      if (_.format && _.format.type === 'csv') {
        bindings.loadCSV(this._table, data.data);
      } else {
        bindings.loadJSON(this._table, data.data);
      }

      // Build column map
      const columnNames = bindings.getColumnNames(this._table);
      columnNames.forEach((name, i) => {
        this._columnMap[name] = i;
      });

      // Create tuple proxies
      const rowCount = bindings.getRowCount(this._table);
      this._tuples = new Array(rowCount);

      for (let i = 0; i < rowCount; i++) {
        const tuple = new NeutrinoTuple(this, i);
        ingest(tuple);  // Add Vega tuple ID
        this._tuples[i] = tuple;
        pulse.add.push(tuple);
      }

      this.value = this._tuples;
      this._generation++;

    } catch (error) {
      df.error('Neutrino data load failed: ' + error.message);
    }

    return pulse;
  },

  // Column access for transforms
  getColumnIndex(name) {
    return this._columnMap[name];
  },

  getValue(column, row) {
    return bindings.getValue(this._table, column, row);
  },

  getTablePtr() {
    return this._table;
  },

  // Cleanup
  dispose() {
    if (this._table) {
      bindings.freeTable(this._table);
      this._table = null;
    }
  }
});
```

#### Task 2.2: Tuple Proxy

Implement lazy field access via Proxy:

```javascript
// src/datasource/NeutrinoTuple.js
export class NeutrinoTuple {
  constructor(dataSource, rowIndex) {
    this._ds = dataSource;
    this._row = rowIndex;
    this._cache = {};  // Field value cache

    // Return proxy for dynamic field access
    return new Proxy(this, {
      get(target, prop) {
        // Handle special properties
        if (prop === '_id' || prop === Symbol.for('vega_id')) {
          return target._id;
        }

        // Check cache first
        if (prop in target._cache) {
          return target._cache[prop];
        }

        // Get column index
        const colIndex = target._ds.getColumnIndex(prop);
        if (colIndex === undefined) {
          return undefined;
        }

        // Get value from Neutrino
        const value = target._ds.getValue(colIndex, target._row);
        target._cache[prop] = value;
        return value;
      },

      set(target, prop, value) {
        // Tuples are generally immutable, but support for formula
        target._cache[prop] = value;
        return true;
      },

      has(target, prop) {
        return target._ds.getColumnIndex(prop) !== undefined ||
               prop in target._cache;
      },

      ownKeys(target) {
        return Object.keys(target._ds._columnMap);
      },

      getOwnPropertyDescriptor(target, prop) {
        if (target._ds.getColumnIndex(prop) !== undefined) {
          return { enumerable: true, configurable: true };
        }
      }
    });
  }
}
```

### Week 3: Basic Transforms

#### Task 3.1: NeutrinoAggregate Transform

Implement accelerated aggregation:

```javascript
// src/transforms/NeutrinoAggregate.js
import { Transform, derive, ingest } from 'vega-dataflow';
import { accessorName, inherits } from 'vega-util';
import * as bindings from '../wasm/bindings.js';

export default function NeutrinoAggregate(params) {
  Transform.call(this, null, params);
  this._cells = new Map();  // Group key -> output tuple
}

NeutrinoAggregate.Definition = {
  'type': 'NeutrinoAggregate',
  'metadata': {'generates': true},
  'params': [
    { 'name': 'groupby', 'type': 'field', 'array': true },
    { 'name': 'ops', 'type': 'enum', 'array': true,
      'values': ['count', 'valid', 'missing', 'sum', 'mean', 'average',
                 'variance', 'variancep', 'stdev', 'stdevp', 'stderr',
                 'median', 'q1', 'q3', 'min', 'max'] },
    { 'name': 'fields', 'type': 'field', 'null': true, 'array': true },
    { 'name': 'as', 'type': 'string', 'null': true, 'array': true },
    { 'name': 'cross', 'type': 'boolean', 'default': false },
    { 'name': 'drop', 'type': 'boolean', 'default': true }
  ]
};

inherits(NeutrinoAggregate, Transform, {
  transform(_, pulse) {
    const out = pulse.fork(pulse.NO_SOURCE | pulse.NO_FIELDS);

    // Check if source is Neutrino data
    const source = this._getSourceDataSource(pulse);
    if (!source || !source.getTablePtr) {
      // Fallback to standard aggregate
      return this._fallbackAggregate(_, pulse);
    }

    // Build aggregation config for WASM
    const config = this._buildConfig(_);

    // Execute aggregation in WASM
    const tablePtr = source.getTablePtr();
    const results = bindings.aggregate(tablePtr, config);

    // Convert results to Vega tuples
    const prevCells = this._cells;
    this._cells = new Map();

    for (const row of results) {
      const key = this._groupKey(row, _.groupby);

      let tuple = prevCells.get(key);
      if (tuple) {
        // Update existing tuple
        Object.assign(tuple, row);
        out.mod.push(tuple);
        prevCells.delete(key);
      } else {
        // Create new tuple
        tuple = ingest(row);
        out.add.push(tuple);
      }

      this._cells.set(key, tuple);
    }

    // Remove tuples for groups no longer present
    for (const tuple of prevCells.values()) {
      out.rem.push(tuple);
    }

    this.value = Array.from(this._cells.values());
    return out;
  },

  _buildConfig(_) {
    const groupby = _.groupby
      ? _.groupby.map(f => accessorName(f))
      : [];

    const measures = (_.ops || []).map((op, i) => ({
      op,
      field: _.fields && _.fields[i]
        ? accessorName(_.fields[i])
        : null,
      as: _.as && _.as[i]
        ? _.as[i]
        : `${op}_${_.fields?.[i] ? accessorName(_.fields[i]) : ''}`
    }));

    return { groupby, measures, cross: _.cross, drop: _.drop };
  },

  _groupKey(row, groupby) {
    if (!groupby || groupby.length === 0) return '';
    return groupby.map(f => row[accessorName(f)]).join('|');
  },

  _getSourceDataSource(pulse) {
    // Walk up the dataflow to find NeutrinoDataSource
    let source = pulse.source;
    while (source && source.source) {
      source = source.source;
    }
    return source?._dataSource;
  },

  _fallbackAggregate(_, pulse) {
    // Use standard Vega aggregate as fallback
    console.warn('NeutrinoAggregate: falling back to standard aggregate');
    // ... implement fallback or delegate to vega-transforms Aggregate
  }
});
```

#### Task 3.2: NeutrinoFilter Transform

```javascript
// src/transforms/NeutrinoFilter.js
import { Transform } from 'vega-dataflow';
import { inherits } from 'vega-util';
import { fastmap } from 'vega-util';

export default function NeutrinoFilter(params) {
  Transform.call(this, fastmap().test(this._test.bind(this)), params);
  this._bitmap = null;  // Cached filter bitmap
}

NeutrinoFilter.Definition = {
  'type': 'NeutrinoFilter',
  'metadata': {'changes': true},
  'params': [
    { 'name': 'expr', 'type': 'expr', 'required': true }
  ]
};

inherits(NeutrinoFilter, Transform, {
  transform(_, pulse) {
    const out = pulse.fork(pulse.ALL);

    // Check if we can use WASM acceleration
    const rangeFilter = this._analyzeExpression(_.expr);

    if (rangeFilter && this._getNeutrinoSource(pulse)) {
      return this._wasmFilter(rangeFilter, pulse, out);
    }

    // Standard filter
    return this._jsFilter(_.expr, pulse, out);
  },

  _analyzeExpression(expr) {
    // Analyze if expression can be converted to range filter
    // e.g., datum.x > 10 && datum.x < 100
    // Returns null if not optimizable
    // Returns {field, min, max} if optimizable
    const str = expr.toString();

    // Simple pattern matching for common cases
    const rangeMatch = str.match(/datum\.(\w+)\s*([<>=]+)\s*(\d+)/g);
    if (!rangeMatch) return null;

    // Parse and return range filter config
    // ... implementation
    return null;  // Simplified for now
  },

  _wasmFilter(config, pulse, out) {
    const source = this._getNeutrinoSource(pulse);
    const bitmap = bindings.filterRange(
      source.getTablePtr(),
      config.field,
      config.min,
      config.max
    );

    // Apply bitmap to tuples
    pulse.visit(pulse.SOURCE, t => {
      const idx = t._row;
      const passes = bitmap[idx >> 3] & (1 << (idx & 7));

      if (passes && !this.value.has(t._id)) {
        this.value.set(t._id, 1);
        out.add.push(t);
      } else if (!passes && this.value.has(t._id)) {
        this.value.delete(t._id);
        out.rem.push(t);
      }
    });

    return out;
  },

  _jsFilter(expr, pulse, out) {
    // Standard JavaScript filtering
    const test = t => expr(t);

    pulse.visit(pulse.ADD, t => {
      if (test(t)) {
        this.value.set(t._id, 1);
      } else {
        out.rem.push(t);
      }
    });

    // ... handle REM, MOD
    return out;
  }
});
```

### Week 4: Transform Integration and Registration

#### Task 4.1: Transform Registry

```javascript
// src/transforms/index.js
import NeutrinoAggregate from './NeutrinoAggregate.js';
import NeutrinoFilter from './NeutrinoFilter.js';
import NeutrinoWindow from './NeutrinoWindow.js';
import NeutrinoCollect from './NeutrinoCollect.js';

export const transforms = {
  NeutrinoAggregate,
  NeutrinoFilter,
  NeutrinoWindow,
  NeutrinoCollect
};

// Mapping from standard transform to Neutrino replacement
export const transformMap = {
  'aggregate': 'NeutrinoAggregate',
  'filter': 'NeutrinoFilter',
  'window': 'NeutrinoWindow',
  'collect': 'NeutrinoCollect'
};
```

#### Task 4.2: Enable API

```javascript
// src/enable.js
import { transforms, transformMap } from './transforms/index.js';
import NeutrinoDataSource from './datasource/NeutrinoDataSource.js';
import { initializeNeutrino } from './wasm/loader.js';

export async function enableNeutrino(view, options = {}) {
  // Initialize WASM
  await initializeNeutrino(options);

  // Get Vega runtime
  const runtime = view._runtime;

  // Register Neutrino transforms
  Object.assign(runtime.transforms, transforms);

  // Intercept data sources marked with neutrino: true
  const originalData = runtime.data.bind(runtime);
  runtime.data = function(name, data) {
    if (data && data.neutrino) {
      // Create Neutrino data source
      return new NeutrinoDataSource({
        url: data.url,
        format: data.format
      });
    }
    return originalData(name, data);
  };

  // Optional: Replace standard transforms for marked datasets
  if (options.replaceTransforms !== false) {
    hookTransformCreation(runtime, options.datasets);
  }

  return view;
}

function hookTransformCreation(runtime, datasets) {
  // Hook into transform creation to substitute Neutrino versions
  // when operating on Neutrino datasets
  // ... implementation
}
```

## Phase 2: Worker Integration (Week 5-7)

### Week 5: Worker Pool

#### Task 5.1: WorkerManager

```javascript
// src/workers/WorkerManager.js
export class WorkerManager {
  constructor(options = {}) {
    this.workerCount = options.workerCount ||
      (typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : 4);
    this.workers = [];
    this.taskQueue = [];
    this.idleWorkers = [];
    this.taskId = 0;
    this.pendingTasks = new Map();
  }

  async initialize(wasmUrl) {
    const workerUrl = new URL('./neutrino.worker.js', import.meta.url);

    for (let i = 0; i < this.workerCount; i++) {
      const worker = new Worker(workerUrl, { type: 'module' });

      // Initialize WASM in worker
      await new Promise((resolve, reject) => {
        worker.postMessage({ type: 'init', wasmUrl: wasmUrl.href });
        worker.onmessage = (e) => {
          if (e.data.type === 'ready') resolve();
          else if (e.data.type === 'error') reject(e.data.error);
        };
      });

      worker.onmessage = this._handleMessage.bind(this, worker);
      this.workers.push(worker);
      this.idleWorkers.push(worker);
    }
  }

  execute(task) {
    return new Promise((resolve, reject) => {
      const id = ++this.taskId;

      this.pendingTasks.set(id, { resolve, reject, task });

      if (this.idleWorkers.length > 0) {
        const worker = this.idleWorkers.pop();
        this._dispatch(worker, id, task);
      } else {
        this.taskQueue.push(id);
      }
    });
  }

  _dispatch(worker, taskId, task) {
    // Transfer data to worker
    const transfer = [];
    if (task.data instanceof ArrayBuffer) {
      transfer.push(task.data);
    }

    worker.postMessage({
      type: 'execute',
      taskId,
      operation: task.operation,
      params: task.params,
      data: task.data
    }, transfer);
  }

  _handleMessage(worker, event) {
    const { type, taskId, result, error } = event.data;

    if (type === 'result') {
      const pending = this.pendingTasks.get(taskId);
      if (pending) {
        this.pendingTasks.delete(taskId);
        pending.resolve(result);
      }
    } else if (type === 'error') {
      const pending = this.pendingTasks.get(taskId);
      if (pending) {
        this.pendingTasks.delete(taskId);
        pending.reject(new Error(error));
      }
    }

    // Process next task in queue
    if (this.taskQueue.length > 0) {
      const nextId = this.taskQueue.shift();
      const nextPending = this.pendingTasks.get(nextId);
      if (nextPending) {
        this._dispatch(worker, nextId, nextPending.task);
      }
    } else {
      this.idleWorkers.push(worker);
    }
  }

  terminate() {
    this.workers.forEach(w => w.terminate());
    this.workers = [];
    this.idleWorkers = [];
  }
}

// Singleton instance
let manager = null;

export function getWorkerManager() {
  if (!manager) {
    manager = new WorkerManager();
  }
  return manager;
}
```

#### Task 5.2: Worker Entry Point

```javascript
// src/workers/neutrino.worker.js
import { initializeNeutrino, getWasm } from '../wasm/loader.js';
import * as bindings from '../wasm/bindings.js';

let tableCache = new Map();

self.onmessage = async (event) => {
  const { type, taskId, operation, params, data } = event.data;

  if (type === 'init') {
    try {
      await initializeNeutrino({ wasmUrl: event.data.wasmUrl });
      self.postMessage({ type: 'ready' });
    } catch (error) {
      self.postMessage({ type: 'error', error: error.message });
    }
    return;
  }

  if (type === 'execute') {
    try {
      const result = await executeOperation(operation, params, data);

      // Use transferable objects where possible
      const transfer = [];
      if (result instanceof ArrayBuffer) {
        transfer.push(result);
      } else if (result && result.buffer instanceof ArrayBuffer) {
        transfer.push(result.buffer);
      }

      self.postMessage({ type: 'result', taskId, result }, transfer);
    } catch (error) {
      self.postMessage({ type: 'error', taskId, error: error.message });
    }
  }
};

async function executeOperation(operation, params, data) {
  switch (operation) {
    case 'aggregate':
      return performAggregate(params, data);

    case 'filter':
      return performFilter(params, data);

    case 'window':
      return performWindow(params, data);

    case 'loadCSV':
      return loadAndCacheCSV(params, data);

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

function performAggregate(params, tableData) {
  // Create temporary table from data
  const tablePtr = bindings.createTable();
  bindings.loadFromBytes(tablePtr, tableData);

  const result = bindings.aggregate(tablePtr, params.config);

  bindings.freeTable(tablePtr);

  // Return typed arrays for efficient transfer
  return result;
}

// ... other operations
```

### Week 6-7: Async Transform Integration

Update transforms to use workers for heavy operations:

```javascript
// src/transforms/NeutrinoAggregate.js (updated)
import { getWorkerManager } from '../workers/WorkerManager.js';

// In transform method:
async transform(_, pulse) {
  const out = pulse.fork(pulse.NO_SOURCE | pulse.NO_FIELDS);

  const source = this._getSourceDataSource(pulse);
  if (!source) {
    return this._fallbackAggregate(_, pulse);
  }

  const config = this._buildConfig(_);
  const manager = getWorkerManager();

  // Check row count threshold for worker use
  const rowCount = source.getRowCount();

  if (rowCount > 100000) {
    // Execute in worker
    const tableData = source.getSerializedData();
    const results = await manager.execute({
      operation: 'aggregate',
      params: { config },
      data: tableData
    });

    return this._processResults(results, out);
  } else {
    // Execute in main thread
    const results = bindings.aggregate(source.getTablePtr(), config);
    return this._processResults(results, out);
  }
}
```

## Phase 3: Persistence and Optimization (Week 8-9)

### Week 8: IndexedDB Integration

```javascript
// src/persistence/IndexedDBStore.js
const DB_NAME = 'vega-neutrino';
const DB_VERSION = 1;
const STORE_NAME = 'datasets';

export class IndexedDBStore {
  constructor() {
    this.db = null;
  }

  async open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('url', 'url', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async save(id, url, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const record = {
        id,
        url,
        data,  // Compressed .ntro bytes
        timestamp: Date.now()
      };

      const request = store.put(record);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async load(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async findByUrl(url) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('url');

      const request = index.get(url);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async delete(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}
```

### Week 9: Streaming Load and Optimization

#### Task 9.1: Progressive CSV Loading

```javascript
// src/datasource/StreamingLoader.js
export class StreamingLoader {
  constructor(dataSource, options = {}) {
    this.dataSource = dataSource;
    this.chunkSize = options.chunkSize || 10000;  // rows per chunk
    this.onProgress = options.onProgress;
  }

  async load(url) {
    const response = await fetch(url);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = '';
    let rowCount = 0;
    let header = null;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop();  // Keep incomplete line

      if (!header && lines.length > 0) {
        header = lines.shift();
      }

      if (lines.length > 0) {
        const chunk = header + '\n' + lines.join('\n');
        await this.dataSource.appendChunk(chunk);
        rowCount += lines.length;

        if (this.onProgress) {
          this.onProgress(rowCount);
        }
      }
    }

    // Process remaining buffer
    if (buffer.trim()) {
      const chunk = header + '\n' + buffer;
      await this.dataSource.appendChunk(chunk);
    }

    return rowCount;
  }
}
```

## Phase 4: Documentation and Testing (Week 10-11)

### Week 10: Testing

#### Test Structure

```javascript
// test/datasource-test.js
import { NeutrinoDataSource } from '../src/index.js';
import { Dataflow } from 'vega-dataflow';

describe('NeutrinoDataSource', () => {
  let df;

  beforeEach(async () => {
    df = new Dataflow();
    await initializeNeutrino();
  });

  it('should load CSV data', async () => {
    const source = df.add(NeutrinoDataSource, {
      url: 'test/data/sample.csv',
      format: { type: 'csv' }
    });

    await df.runAsync();

    assert.equal(source.value.length, 1000);
    assert.equal(source.value[0].name, 'Alice');
  });

  it('should support field access', async () => {
    const source = df.add(NeutrinoDataSource, {
      url: 'test/data/sample.csv',
      format: { type: 'csv' }
    });

    await df.runAsync();

    const tuple = source.value[0];
    assert.equal(tuple.id, 1);
    assert.equal(tuple.value, 100);
  });

  // ... more tests
});

// test/transforms-test.js
describe('NeutrinoAggregate', () => {
  it('should compute sum correctly', async () => {
    // ... test implementation
  });

  it('should handle groupby', async () => {
    // ... test implementation
  });

  it('should match standard aggregate output', async () => {
    // Compare results with standard Vega aggregate
  });
});

// test/integration-test.js
describe('Integration', () => {
  it('should render visualization with large dataset', async () => {
    const spec = {
      data: [{
        name: 'source',
        url: 'test/data/large.csv',
        neutrino: true
      }],
      transform: [{
        type: 'aggregate',
        groupby: ['category'],
        ops: ['sum', 'count'],
        fields: ['amount', null],
        as: ['total', 'count']
      }],
      // ... marks
    };

    const view = await renderWithNeutrino(spec);
    assert(view.data('source').length > 0);
  });
});
```

### Week 11: Documentation

#### README

```markdown
# vega-neutrino

High-performance data processing for Vega using Neutrino columnar storage.

## Features

- **3-5x memory reduction** for large datasets
- **5-10x faster aggregations** with SIMD acceleration
- **Background processing** via Web Workers
- **Transparent integration** - same Vega specs work with minimal changes

## Installation

```bash
npm install vega-neutrino
```

## Quick Start

```javascript
import * as vega from 'vega';
import { enableNeutrino } from 'vega-neutrino';

const spec = {
  data: [{
    name: 'large_data',
    url: 'data/million-rows.csv',
    format: { type: 'csv' },
    neutrino: true  // Enable Neutrino for this dataset
  }],
  // ... rest of spec
};

const view = new vega.View(vega.parse(spec));
await enableNeutrino(view);
view.initialize('#container').run();
```

## API Reference

### enableNeutrino(view, options)

Enables Neutrino processing for a Vega view.

**Options:**
- `wasmUrl` - Custom URL for WASM module
- `workerCount` - Number of worker threads (default: CPU cores)
- `datasets` - Array of dataset names to enable (default: all with `neutrino: true`)
- `threshold` - Row count threshold for using workers (default: 100000)

### Spec Properties

Add `neutrino: true` to any data source:

```json
{
  "data": [{
    "name": "mydata",
    "url": "data.csv",
    "neutrino": true
  }]
}
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

## Performance

| Dataset Size | Standard Vega | With Neutrino | Improvement |
|-------------|---------------|---------------|-------------|
| 100K rows   | 200ms         | 40ms          | 5x          |
| 1M rows     | 2000ms        | 200ms         | 10x         |
| 10M rows    | OOM           | 2000ms        | ∞           |

## License

BSD-3-Clause
```

## Milestones and Deliverables

### Milestone 1: MVP (Week 4)
- [ ] Package structure complete
- [ ] WASM loading working
- [ ] NeutrinoDataSource loading CSV
- [ ] NeutrinoAggregate for basic operations
- [ ] Basic tests passing

### Milestone 2: Worker Integration (Week 7)
- [ ] Worker pool functional
- [ ] Async transforms working
- [ ] All accelerated transforms implemented
- [ ] Benchmark suite created

### Milestone 3: Production Ready (Week 9)
- [ ] IndexedDB persistence
- [ ] Streaming load
- [ ] Performance optimizations
- [ ] Memory leak testing

### Milestone 4: Release (Week 11)
- [ ] Full test coverage
- [ ] Documentation complete
- [ ] Examples created
- [ ] Package published

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| WASM performance overhead for small datasets | Medium | High | Threshold-based fallback to standard transforms |
| Worker message passing overhead | Medium | Medium | Use transferable objects; batch operations |
| Complex Vega expressions not optimizable | Low | High | Always fallback to standard evaluation |
| Browser compatibility issues | High | Low | Feature detection; polyfills where possible |

## Future Enhancements (Post-MVP)

1. **GPU Acceleration**: WebGPU for even faster aggregations
2. **Streaming Sources**: WebSocket and Server-Sent Events
3. **Custom Aggregations**: User-defined aggregation functions
4. **Direct .ntro Support**: Load pre-compressed files in specs
5. **Server-Side Rendering**: Node.js support with native Neutrino
