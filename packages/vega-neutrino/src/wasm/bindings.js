/**
 * JavaScript bindings for Neutrino WASM functions.
 * Provides high-level API for table operations.
 */

import { getWasm, getWasmMemory, getWasmString, allocateAndCopy, deallocate } from './loader.js';

// Column type constants
export const ColumnType = {
  INTEGER: 0,
  FLOAT: 1,
  STRING: 2,
  DATETIME: 3
};

/**
 * Create a new Neutrino table.
 * @returns {number} Table pointer
 */
export function createTable() {
  const wasm = getWasm();
  return wasm.table_new();
}

/**
 * Free a Neutrino table.
 * @param {number} tablePtr - Table pointer
 */
export function freeTable(tablePtr) {
  const wasm = getWasm();
  if (wasm.table_free) {
    wasm.table_free(tablePtr);
  }
}

/**
 * Load CSV data into a table.
 * @param {number} tablePtr - Table pointer
 * @param {string} csvData - CSV content as string
 * @param {Object} options - Load options
 * @returns {number} Result code (0 = success)
 */
export function loadCSV(tablePtr, csvData, options = {}) {
  const wasm = getWasm();
  const encoder = new TextEncoder();
  const csvBytes = encoder.encode(csvData);

  const ptr = allocateAndCopy(csvBytes);
  const result = wasm.table_load_csv(tablePtr, ptr, csvBytes.length);
  deallocate(ptr, csvBytes.length);

  return result;
}

/**
 * Load JSON data into a table.
 * @param {number} tablePtr - Table pointer
 * @param {Array|string} jsonData - JSON array of objects or JSON string
 * @returns {number} Result code (0 = success)
 */
export function loadJSON(tablePtr, jsonData) {
  const wasm = getWasm();
  const jsonStr = typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData);
  const encoder = new TextEncoder();
  const jsonBytes = encoder.encode(jsonStr);

  const ptr = allocateAndCopy(jsonBytes);
  const result = wasm.table_load_json(tablePtr, ptr, jsonBytes.length);
  deallocate(ptr, jsonBytes.length);

  return result;
}

/**
 * Load .ntro file bytes directly into a table.
 * @param {number} tablePtr - Table pointer
 * @param {ArrayBuffer|Uint8Array} ntroBytes - .ntro file contents
 * @returns {number} Result code (0 = success)
 */
export function loadNtro(tablePtr, ntroBytes) {
  const wasm = getWasm();
  const bytes = ntroBytes instanceof ArrayBuffer ? new Uint8Array(ntroBytes) : ntroBytes;

  const ptr = allocateAndCopy(bytes);
  const result = wasm.table_load_from_bytes(tablePtr, ptr, bytes.length);
  deallocate(ptr, bytes.length);

  return result;
}

/**
 * Save table to .ntro format.
 * @param {number} tablePtr - Table pointer
 * @returns {Uint8Array} Compressed .ntro bytes
 */
export function saveToNtro(tablePtr) {
  const wasm = getWasm();
  const resultPtr = wasm.table_save_to_bytes(tablePtr);

  const length = wasm.get_bytes_length(resultPtr);
  const dataPtr = wasm.get_bytes_ptr(resultPtr);
  const memory = getWasmMemory();
  const bytes = new Uint8Array(memory.buffer, dataPtr, length).slice();

  wasm.free_bytes(resultPtr);
  return bytes;
}

/**
 * Parse metadata from .ntro file without loading full data.
 * @param {ArrayBuffer|Uint8Array} ntroBytes - .ntro file contents
 * @returns {Object} Metadata object
 */
export function parseNtroMetadata(ntroBytes) {
  const wasm = getWasm();
  const bytes = ntroBytes instanceof ArrayBuffer ? new Uint8Array(ntroBytes) : ntroBytes;

  const ptr = allocateAndCopy(bytes);
  const metadataPtr = wasm.parse_metadata(ptr, bytes.length);
  const metadataJson = getWasmString(wasm, metadataPtr);

  deallocate(ptr, bytes.length);
  return JSON.parse(metadataJson);
}

/**
 * Get the number of rows in a table.
 * @param {number} tablePtr - Table pointer
 * @returns {number} Row count
 */
export function getRowCount(tablePtr) {
  return getWasm().table_row_count(tablePtr);
}

/**
 * Get the number of columns in a table.
 * @param {number} tablePtr - Table pointer
 * @returns {number} Column count
 */
export function getColumnCount(tablePtr) {
  return getWasm().table_column_count(tablePtr);
}

/**
 * Get column names from a table.
 * @param {number} tablePtr - Table pointer
 * @returns {string[]} Array of column names
 */
export function getColumnNames(tablePtr) {
  const wasm = getWasm();
  const namesPtr = wasm.table_column_names(tablePtr);
  const namesJson = getWasmString(wasm, namesPtr);
  return JSON.parse(namesJson);
}

/**
 * Get the data type of a column.
 * @param {number} tablePtr - Table pointer
 * @param {number} column - Column index
 * @returns {number} Column type constant
 */
export function getColumnType(tablePtr, column) {
  return getWasm().table_column_type(tablePtr, column);
}

/**
 * Get a value from a table cell.
 * @param {number} tablePtr - Table pointer
 * @param {number} column - Column index
 * @param {number} row - Row index
 * @returns {number|string|Date|null} Cell value
 */
export function getValue(tablePtr, column, row) {
  const wasm = getWasm();
  const columnType = wasm.table_column_type(tablePtr, column);

  switch (columnType) {
    case ColumnType.INTEGER:
      return wasm.table_get_integer(tablePtr, column, row);
    case ColumnType.FLOAT:
      return wasm.table_get_float(tablePtr, column, row);
    case ColumnType.STRING:
      return getStringValue(wasm, tablePtr, column, row);
    case ColumnType.DATETIME:
      return new Date(wasm.table_get_datetime(tablePtr, column, row));
    default:
      return null;
  }
}

/**
 * Get a string value from a table cell.
 * @param {Object} wasm - WASM instance
 * @param {number} tablePtr - Table pointer
 * @param {number} column - Column index
 * @param {number} row - Row index
 * @returns {string} String value
 */
function getStringValue(wasm, tablePtr, column, row) {
  const strPtr = wasm.table_get_string(tablePtr, column, row);
  return getWasmString(wasm, strPtr);
}

/**
 * Get an integer value from a table cell.
 * @param {number} tablePtr - Table pointer
 * @param {number} column - Column index
 * @param {number} row - Row index
 * @returns {number} Integer value
 */
export function getInteger(tablePtr, column, row) {
  return getWasm().table_get_integer(tablePtr, column, row);
}

/**
 * Get a float value from a table cell.
 * @param {number} tablePtr - Table pointer
 * @param {number} column - Column index
 * @param {number} row - Row index
 * @returns {number} Float value
 */
export function getFloat(tablePtr, column, row) {
  return getWasm().table_get_float(tablePtr, column, row);
}

/**
 * Get a string value from a table cell.
 * @param {number} tablePtr - Table pointer
 * @param {number} column - Column index
 * @param {number} row - Row index
 * @returns {string} String value
 */
export function getString(tablePtr, column, row) {
  const wasm = getWasm();
  const strPtr = wasm.table_get_string(tablePtr, column, row);
  return getWasmString(wasm, strPtr);
}

/**
 * Perform aggregation on a table.
 * @param {number} tablePtr - Table pointer
 * @param {Object} config - Aggregation configuration
 * @returns {Array<Object>} Aggregation results
 */
export function aggregate(tablePtr, config) {
  const wasm = getWasm();
  const configStr = JSON.stringify(config);
  const encoder = new TextEncoder();
  const configBytes = encoder.encode(configStr);

  const ptr = allocateAndCopy(configBytes);
  const resultPtr = wasm.table_aggregate(tablePtr, ptr, configBytes.length);
  const resultJson = getWasmString(wasm, resultPtr);

  deallocate(ptr, configBytes.length);
  return JSON.parse(resultJson);
}

/**
 * Filter a table using a range predicate.
 * @param {number} tablePtr - Table pointer
 * @param {number} column - Column index
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {Uint8Array} Bitmap of matching rows
 */
export function filterRange(tablePtr, column, min, max) {
  const wasm = getWasm();
  const bitmapPtr = wasm.table_filter_range(tablePtr, column, min, max);
  const bitmapLen = Math.ceil(getRowCount(tablePtr) / 8);
  const memory = getWasmMemory();
  return new Uint8Array(memory.buffer, bitmapPtr, bitmapLen).slice();
}

/**
 * Sort a table by column.
 * @param {number} tablePtr - Table pointer
 * @param {number} column - Column index
 * @param {boolean} ascending - Sort direction
 * @returns {Uint32Array} Sorted row indices
 */
export function sort(tablePtr, column, ascending = true) {
  const wasm = getWasm();
  const indicesPtr = wasm.table_sort(tablePtr, column, ascending);
  const rowCount = getRowCount(tablePtr);
  const memory = getWasmMemory();
  return new Uint32Array(memory.buffer, indicesPtr, rowCount).slice();
}

/**
 * Compute window function on a table.
 * @param {number} tablePtr - Table pointer
 * @param {Object} config - Window function configuration
 * @returns {Float64Array} Window function results
 */
export function windowFunction(tablePtr, config) {
  const wasm = getWasm();
  const configStr = JSON.stringify(config);
  const encoder = new TextEncoder();
  const configBytes = encoder.encode(configStr);

  const ptr = allocateAndCopy(configBytes);
  const resultPtr = wasm.table_window(tablePtr, ptr, configBytes.length);
  const rowCount = getRowCount(tablePtr);
  const memory = getWasmMemory();
  const result = new Float64Array(memory.buffer, resultPtr, rowCount).slice();

  deallocate(ptr, configBytes.length);
  return result;
}

/**
 * Get memory usage of a table.
 * @param {number} tablePtr - Table pointer
 * @returns {number} Memory usage in bytes
 */
export function getMemoryUsage(tablePtr) {
  return getWasm().table_memory_usage(tablePtr);
}

/**
 * Get serialized table data for worker transfer.
 * @param {number} tablePtr - Table pointer
 * @returns {ArrayBuffer} Serialized table data
 */
export function serializeForWorker(tablePtr) {
  const wasm = getWasm();
  const resultPtr = wasm.table_serialize(tablePtr);

  const length = wasm.get_bytes_length(resultPtr);
  const dataPtr = wasm.get_bytes_ptr(resultPtr);
  const memory = getWasmMemory();
  const bytes = new Uint8Array(memory.buffer, dataPtr, length).slice();

  wasm.free_bytes(resultPtr);
  return bytes.buffer;
}

/**
 * Load table from serialized worker data.
 * @param {number} tablePtr - Table pointer
 * @param {ArrayBuffer|Uint8Array} data - Serialized table data
 * @returns {number} Result code (0 = success)
 */
export function loadFromSerializedData(tablePtr, data) {
  const wasm = getWasm();
  const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : data;

  const ptr = allocateAndCopy(bytes);
  const result = wasm.table_deserialize(tablePtr, ptr, bytes.length);
  deallocate(ptr, bytes.length);

  return result;
}
