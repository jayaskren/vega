/**
 * Web Worker entry point for Neutrino WASM operations.
 * Executes heavy operations in background thread.
 */

import { initializeNeutrino, getWasm } from '../wasm/loader.js';
import * as bindings from '../wasm/bindings.js';

// Cache for tables in this worker
const tableCache = new Map();

/**
 * Handle incoming messages from main thread.
 */
self.onmessage = async (event) => {
  const { type, taskId, operation, params, data } = event.data;

  if (type === 'init') {
    // Initialize WASM module
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

/**
 * Execute an operation in the worker.
 */
async function executeOperation(operation, params, data) {
  switch (operation) {
    case 'aggregate':
      return performAggregate(params, data);

    case 'filter':
      return performFilter(params, data);

    case 'window':
      return performWindow(params, data);

    case 'sort':
      return performSort(params, data);

    case 'loadCSV':
      return loadAndCacheCSV(params, data);

    case 'loadNtro':
      return loadAndCacheNtro(params, data);

    case 'saveNtro':
      return saveTableAsNtro(params);

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

/**
 * Perform aggregation in worker.
 */
function performAggregate(params, tableData) {
  // Create temporary table from serialized data
  const tablePtr = bindings.createTable();

  if (tableData) {
    bindings.loadFromSerializedData(tablePtr, tableData);
  }

  const result = bindings.aggregate(tablePtr, params.config);

  bindings.freeTable(tablePtr);

  return result;
}

/**
 * Perform filtering in worker.
 */
function performFilter(params, tableData) {
  const tablePtr = bindings.createTable();

  if (tableData) {
    bindings.loadFromSerializedData(tablePtr, tableData);
  }

  const bitmap = bindings.filterRange(
    tablePtr,
    params.column,
    params.min,
    params.max
  );

  bindings.freeTable(tablePtr);

  return bitmap;
}

/**
 * Perform window function in worker.
 */
function performWindow(params, tableData) {
  const tablePtr = bindings.createTable();

  if (tableData) {
    bindings.loadFromSerializedData(tablePtr, tableData);
  }

  const result = bindings.windowFunction(tablePtr, params.config);

  bindings.freeTable(tablePtr);

  return result;
}

/**
 * Perform sorting in worker.
 */
function performSort(params, tableData) {
  const tablePtr = bindings.createTable();

  if (tableData) {
    bindings.loadFromSerializedData(tablePtr, tableData);
  }

  const indices = bindings.sort(tablePtr, params.column, params.ascending);

  bindings.freeTable(tablePtr);

  return indices;
}

/**
 * Load CSV and cache the table.
 */
function loadAndCacheCSV(params, csvData) {
  const tablePtr = bindings.createTable();

  // Convert ArrayBuffer to string if needed
  let csvString;
  if (csvData instanceof ArrayBuffer) {
    csvString = new TextDecoder().decode(csvData);
  } else if (typeof csvData === 'string') {
    csvString = csvData;
  } else {
    csvString = new TextDecoder().decode(csvData);
  }

  bindings.loadCSV(tablePtr, csvString);

  // Cache the table
  if (params.cacheKey) {
    tableCache.set(params.cacheKey, tablePtr);
  }

  // Return table metadata
  return {
    rowCount: bindings.getRowCount(tablePtr),
    columnCount: bindings.getColumnCount(tablePtr),
    columnNames: bindings.getColumnNames(tablePtr)
  };
}

/**
 * Load .ntro file and cache the table.
 */
function loadAndCacheNtro(params, ntroData) {
  const tablePtr = bindings.createTable();

  // Convert to Uint8Array if needed
  let bytes;
  if (ntroData instanceof ArrayBuffer) {
    bytes = new Uint8Array(ntroData);
  } else {
    bytes = ntroData;
  }

  bindings.loadNtro(tablePtr, bytes);

  // Cache the table
  if (params.cacheKey) {
    tableCache.set(params.cacheKey, tablePtr);
  }

  // Return table metadata
  return {
    rowCount: bindings.getRowCount(tablePtr),
    columnCount: bindings.getColumnCount(tablePtr),
    columnNames: bindings.getColumnNames(tablePtr)
  };
}

/**
 * Save cached table as .ntro bytes.
 */
function saveTableAsNtro(params) {
  const tablePtr = tableCache.get(params.cacheKey);

  if (!tablePtr) {
    throw new Error(`Table not found: ${params.cacheKey}`);
  }

  return bindings.saveToNtro(tablePtr);
}

/**
 * Free a cached table.
 */
function freeCachedTable(cacheKey) {
  const tablePtr = tableCache.get(cacheKey);

  if (tablePtr) {
    bindings.freeTable(tablePtr);
    tableCache.delete(cacheKey);
  }
}
