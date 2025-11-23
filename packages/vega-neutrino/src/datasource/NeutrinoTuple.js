/**
 * Proxy-based tuple for lazy field access from Neutrino columnar storage.
 * Provides Vega-compatible tuple interface with on-demand value retrieval.
 */

/**
 * Create a NeutrinoTuple that proxies field access to the data source.
 * @param {NeutrinoDataSource} dataSource - Parent data source
 * @param {number} rowIndex - Row index in the table
 * @returns {Proxy} Proxied tuple object
 */
export function createNeutrinoTuple(dataSource, rowIndex) {
  const tuple = {
    _ds: dataSource,
    _row: rowIndex,
    _cache: {},
    _id: null  // Will be set by ingest()
  };

  return new Proxy(tuple, {
    get(target, prop) {
      // Handle special Vega tuple properties
      if (prop === '_id' || prop === Symbol.for('vega_id')) {
        return target._id;
      }

      // Handle internal properties
      if (prop === '_ds' || prop === '_row' || prop === '_cache') {
        return target[prop];
      }

      // Check cache first for performance
      if (prop in target._cache) {
        return target._cache[prop];
      }

      // Get column index
      const colIndex = target._ds.getColumnIndex(prop);
      if (colIndex === undefined) {
        return undefined;
      }

      // Get value from Neutrino storage
      const value = target._ds.getValue(colIndex, target._row);
      target._cache[prop] = value;
      return value;
    },

    set(target, prop, value) {
      // Handle special properties
      if (prop === '_id') {
        target._id = value;
        return true;
      }

      // Tuples support setting computed/derived values
      target._cache[prop] = value;
      return true;
    },

    has(target, prop) {
      if (prop === '_id' || prop === '_ds' || prop === '_row' || prop === '_cache') {
        return true;
      }
      return target._ds.getColumnIndex(prop) !== undefined || prop in target._cache;
    },

    ownKeys(target) {
      const columnNames = target._ds.getColumnNames();
      const cacheKeys = Object.keys(target._cache);
      return [...new Set([...columnNames, ...cacheKeys])];
    },

    getOwnPropertyDescriptor(target, prop) {
      if (target._ds.getColumnIndex(prop) !== undefined || prop in target._cache) {
        return {
          enumerable: true,
          configurable: true,
          writable: true
        };
      }
      return undefined;
    }
  });
}

/**
 * Clear the value cache for a tuple.
 * Used when underlying data changes.
 * @param {Proxy} tuple - NeutrinoTuple proxy
 */
export function clearTupleCache(tuple) {
  if (tuple && tuple._cache) {
    tuple._cache = {};
  }
}

/**
 * Get the row index of a tuple.
 * @param {Proxy} tuple - NeutrinoTuple proxy
 * @returns {number} Row index
 */
export function getTupleRowIndex(tuple) {
  return tuple._row;
}

/**
 * Check if an object is a NeutrinoTuple.
 * @param {any} obj - Object to check
 * @returns {boolean} True if object is a NeutrinoTuple
 */
export function isNeutrinoTuple(obj) {
  return obj && obj._ds !== undefined && obj._row !== undefined;
}
