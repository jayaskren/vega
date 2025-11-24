/**
 * JavaScript bindings for Neutrino WASM functions.
 * Provides high-level API for table operations.
 *
 * NOTE: This is a compatibility layer. The actual Neutrino WASM uses wasm-bindgen
 * generated code with a different API (WasmTable class, etc.). This file provides
 * a bridge between the expected low-level C-style API and the actual wasm-bindgen API.
 */

import { getWasm } from './loader.js';

// Column type constants
export const ColumnType = {
  INTEGER: 0,
  FLOAT: 1,
  STRING: 2,
  DATETIME: 3
};

/**
 * Create a new Neutrino table.
 * @returns {Object} WasmTable instance
 */
export function createTable() {
  const wasm = getWasm();
  // Use the wasm-bindgen generated WasmTable class
  return new wasm.WasmTable();
}

/**
 * Free a Neutrino table.
 * @param {Object} tablePtr - WasmTable instance
 */
export function freeTable(tablePtr) {
  if (tablePtr && tablePtr.free) {
    tablePtr.free();
  }
}

/**
 * Load CSV data into a table.
 * @param {Object} tablePtr - WasmTable instance (ignored - returns new table)
 * @param {string} csvData - CSV content as string
 * @param {Object} options - Load options
 * @returns {WasmTable} New WasmTable instance
 */
export function loadCSV(tablePtr, csvData, options = {}) {
  const wasm = getWasm();

  // Convert string to Uint8Array
  const encoder = new TextEncoder();
  const csvBytes = encoder.encode(csvData);

  // Create schema analyzer using constructor
  const analyzer = new wasm.WasmSchemaAnalyzer();

  // Analyze CSV to get schema
  const schema = analyzer.analyze_csv_buffer(csvBytes);

  // The schema analysis returns column info, but create_table_from_csv
  // expects a user config with user_selected_type for each column.
  // Transform the schema into user config format.
  let userConfig;
  if (typeof schema === 'string') {
    userConfig = JSON.parse(schema);
  } else {
    userConfig = schema;
  }

  // If the schema has columns array, transform to user config format
  if (userConfig.columns && Array.isArray(userConfig.columns)) {
    userConfig.columns = userConfig.columns.map(col => ({
      ...col,
      // Use inferred_type or detected_type as user_selected_type
      user_selected_type: col.user_selected_type || col.inferred_type || col.detected_type || col.type || 'String'
    }));
  }

  const userConfigJson = JSON.stringify(userConfig);

  // Create table from CSV with the user config
  const table = analyzer.create_table_from_csv(csvBytes, userConfigJson);

  return table;
}

/**
 * Load JSON data into a table.
 * @param {Object} tablePtr - WasmTable instance (ignored - returns new table)
 * @param {Array|string} jsonData - JSON array of objects or JSON string
 * @returns {WasmTable} New WasmTable instance
 */
export function loadJSON(tablePtr, jsonData) {
  // Parse JSON if it's a string
  const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('loadJSON: data must be a non-empty array of objects');
  }

  // Convert JSON to CSV
  const keys = Object.keys(data[0]);
  const csvLines = [keys.join(',')];

  for (const row of data) {
    const values = keys.map(key => {
      const value = row[key];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains comma or quote
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }
      return String(value);
    });
    csvLines.push(values.join(','));
  }

  const csvData = csvLines.join('\n');

  // Use loadCSV to create the table
  return loadCSV(null, csvData);
}

/**
 * Load .ntro file bytes directly into a table.
 * NOTE: This function is deprecated. Use WasmTable.loadFromBytes() instead.
 * @param {Object} tablePtr - WasmTable instance (ignored)
 * @param {ArrayBuffer|Uint8Array} ntroBytes - .ntro file contents
 * @returns {WasmTable} New WasmTable instance
 */
export function loadNtro(tablePtr, ntroBytes) {
  const wasm = getWasm();
  const bytes = ntroBytes instanceof ArrayBuffer ? new Uint8Array(ntroBytes) : ntroBytes;

  // Return a new WasmTable loaded from bytes
  return wasm.WasmTable.loadFromBytes(bytes);
}

/**
 * Save table to .ntro format.
 * @param {Object} tablePtr - WasmTable instance
 * @returns {Uint8Array} Compressed .ntro bytes
 */
export function saveToNtro(tablePtr) {
  if (tablePtr && tablePtr.saveToBytes) {
    return tablePtr.saveToBytes();
  }
  throw new Error('saveToNtro: invalid table pointer');
}

/**
 * Parse metadata from .ntro file without loading full data.
 * @param {ArrayBuffer|Uint8Array} ntroBytes - .ntro file contents
 * @returns {Object} Metadata object
 */
export function parseNtroMetadata(ntroBytes) {
  const wasm = getWasm();
  const bytes = ntroBytes instanceof ArrayBuffer ? new Uint8Array(ntroBytes) : ntroBytes;

  // Use the actual wasm-bindgen generated function
  return wasm.parseMetadata(bytes);
}

/**
 * Get the number of rows in a table.
 * @param {Object} tablePtr - WasmTable instance
 * @returns {number} Row count
 */
export function getRowCount(tablePtr) {
  if (tablePtr && tablePtr.rowCount) {
    return Number(tablePtr.rowCount());  // Convert BigInt to Number
  }
  return 0;
}

/**
 * Get the number of columns in a table.
 * @param {Object} tablePtr - WasmTable instance
 * @returns {number} Column count
 */
export function getColumnCount(tablePtr) {
  if (tablePtr && tablePtr.columnCount) {
    return Number(tablePtr.columnCount());  // Convert BigInt to Number
  }
  return 0;
}

/**
 * Get column names from a table.
 * @param {Object} tablePtr - WasmTable instance
 * @returns {string[]} Array of column names
 */
export function getColumnNames(tablePtr) {
  if (tablePtr && tablePtr.getColumnNames) {
    return tablePtr.getColumnNames();
  }
  return [];
}

/**
 * Get the data type of a column.
 * @param {Object} tablePtr - WasmTable instance
 * @param {number} column - Column index
 * @returns {string} Column type string
 */
export function getColumnType(tablePtr, column) {
  if (tablePtr && tablePtr.getColumnType) {
    return tablePtr.getColumnType(column);
  }
  return 'unknown';
}

/**
 * Get a value from a table cell.
 * @param {Object} tablePtr - WasmTable instance
 * @param {number} column - Column index
 * @param {number} row - Row index
 * @returns {number|string|Date|null} Cell value
 */
export function getValue(tablePtr, column, row) {
  if (tablePtr && tablePtr.getValue) {
    return tablePtr.getValue(column, row);
  }
  return null;
}

/**
 * Get an integer value from a table cell.
 * @param {Object} tablePtr - WasmTable instance
 * @param {number} column - Column index
 * @param {number} row - Row index
 * @returns {number} Integer value
 */
export function getInteger(tablePtr, column, row) {
  if (tablePtr && tablePtr.getInteger) {
    return tablePtr.getInteger(column, row);
  }
  return 0;
}

/**
 * Get a float value from a table cell.
 * @param {Object} tablePtr - WasmTable instance
 * @param {number} column - Column index
 * @param {number} row - Row index
 * @returns {number} Float value
 */
export function getFloat(tablePtr, column, row) {
  if (tablePtr && tablePtr.getFloat) {
    return tablePtr.getFloat(column, row);
  }
  return 0.0;
}

/**
 * Get a string value from a table cell.
 * @param {Object} tablePtr - WasmTable instance
 * @param {number} column - Column index
 * @param {number} row - Row index
 * @returns {string} String value
 */
export function getString(tablePtr, column, row) {
  if (tablePtr && tablePtr.getValue) {
    return tablePtr.getValue(column, row);
  }
  return '';
}

/**
 * Perform aggregation on a table.
 * @param {Object} tablePtr - WasmTable instance
 * @param {Object} config - Aggregation configuration
 * @returns {Array<Object>} Aggregation results
 */
export function aggregate(tablePtr, config) {
  const wasm = getWasm();

  // Call the wasm-bindgen generated aggregate function
  return wasm.aggregate(tablePtr, config);
}

/**
 * Filter a table using a range predicate.
 * @param {Object} tablePtr - WasmTable instance
 * @param {number} column - Column index
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {Uint8Array} Bitmap of matching rows
 */
export function filterRange(tablePtr, column, min, max) {
  throw new Error('filterRange not yet implemented with wasm-bindgen API');
}

/**
 * Sort a table by column.
 * @param {Object} tablePtr - WasmTable instance
 * @param {number} column - Column index
 * @param {boolean} ascending - Sort direction
 * @returns {Uint32Array} Sorted row indices
 */
export function sort(tablePtr, column, ascending = true) {
  throw new Error('sort not yet implemented with wasm-bindgen API');
}

/**
 * Compute window function on a table.
 * @param {Object} tablePtr - WasmTable instance
 * @param {Object} config - Window function configuration
 * @returns {Float64Array} Window function results
 */
export function windowFunction(tablePtr, config) {
  throw new Error('windowFunction not yet implemented with wasm-bindgen API');
}

/**
 * Get memory usage of a table.
 * @param {Object} tablePtr - WasmTable instance
 * @returns {number} Memory usage in bytes
 */
export function getMemoryUsage(tablePtr) {
  if (tablePtr && tablePtr.memory_usage) {
    return tablePtr.memory_usage();
  }
  return 0;
}

/**
 * Get serialized table data for worker transfer.
 * @param {Object} tablePtr - WasmTable instance
 * @returns {ArrayBuffer} Serialized table data
 */
export function serializeForWorker(tablePtr) {
  throw new Error('serializeForWorker not yet implemented with wasm-bindgen API');
}

/**
 * Load table from serialized worker data.
 * @param {Object} tablePtr - WasmTable instance
 * @param {ArrayBuffer|Uint8Array} data - Serialized table data
 * @returns {number} Result code (0 = success)
 */
export function loadFromSerializedData(tablePtr, data) {
  throw new Error('loadFromSerializedData not yet implemented with wasm-bindgen API');
}
