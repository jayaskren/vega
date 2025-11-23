/**
 * vega-neutrino - High-performance data processing for Vega using Neutrino columnar storage.
 *
 * Features:
 * - 3-5x memory reduction for large datasets
 * - 5-10x faster aggregations with SIMD acceleration
 * - Background processing via Web Workers
 * - Transparent integration with existing Vega specs
 */

// Main API
export {
  enableNeutrino,
  isNeutrinoEnabled,
  getNeutrinoOptions,
  disableNeutrino,
  exportDatasetAsNtro,
  getNeutrinoMemoryUsage,
  neutrinoData,
  ntroData
} from './enable.js';

// Data sources
export {
  NeutrinoDataSource,
  createNeutrinoTuple,
  isNeutrinoTuple
} from './datasource/index.js';

// Transforms
export {
  transforms,
  transformMap,
  getNeutrinoTransform,
  NeutrinoAggregate,
  NeutrinoFilter,
  NeutrinoWindow,
  NeutrinoCollect
} from './transforms/index.js';

// WASM
export {
  initializeNeutrino,
  isInitialized,
  getWasm,
  resetWasm
} from './wasm/index.js';

// Workers
export {
  WorkerManager,
  getWorkerManager,
  setWorkerManager
} from './workers/index.js';

// Persistence
export {
  IndexedDBStore,
  getIndexedDBStore,
  isIndexedDBAvailable,
  StreamingLoader,
  loadCSVWithProgress
} from './persistence/index.js';

// Re-export bindings for advanced usage
export * as bindings from './wasm/bindings.js';
