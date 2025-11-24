/**
 * Vega-compatible data source backed by Neutrino columnar storage.
 * Provides efficient storage and access for large datasets.
 */

import { Transform, ingest } from 'vega-dataflow';
import { inherits } from 'vega-util';
import * as bindings from '../wasm/bindings.js';
import { createNeutrinoTuple } from './NeutrinoTuple.js';

/**
 * Detect if URL points to .ntro file.
 * @param {string} url - URL to check
 * @param {Object} format - Format specification
 * @returns {boolean} True if .ntro file
 */
function isNtroFile(url, format) {
  if (format && format.type === 'neutrino') return true;
  if (url && url.endsWith('.ntro')) return true;
  return false;
}

/**
 * NeutrinoDataSource - Vega Transform backed by Neutrino storage.
 * @param {Object} params - Transform parameters
 */
export default function NeutrinoDataSource(params) {
  Transform.call(this, null, params);
  this._table = null;        // WASM table pointer
  this._tuples = [];         // Tuple proxies
  this._columnMap = {};      // Column name -> index
  this._columnNames = [];    // Ordered column names
  this._generation = 0;      // Change tracking
  this._loaded = false;      // Load state
}

NeutrinoDataSource.Definition = {
  'type': 'NeutrinoDataSource',
  'metadata': { 'source': true, 'generates': true },
  'params': [
    { 'name': 'url', 'type': 'string' },
    { 'name': 'format', 'type': 'object' },
    { 'name': 'async', 'type': 'boolean', 'default': true },
    { 'name': 'cache', 'type': 'boolean', 'default': true },
    { 'name': 'values', 'type': 'array' }
  ]
};

inherits(NeutrinoDataSource, Transform, {
  transform(_, pulse) {
    const out = pulse.fork(pulse.NO_FIELDS);

    if (this.value == null || _.modified('url') || _.modified('values')) {
      // Load data
      if (_.url) {
        return this._loadFromUrl(_, out);
      } else if (_.values) {
        return this._loadFromValues(_, out);
      }
    }

    return out;
  },

  async _loadFromUrl(_, pulse) {
    const df = this.dataflow;

    try {
      if (isNtroFile(_.url, _.format)) {
        // Load native .ntro file - fast path
        const response = await fetch(_.url);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${_.url}: ${response.status}`);
        }
        const ntroBytes = await response.arrayBuffer();
        this._table = bindings.loadNtro(null, ntroBytes);

        // Optionally cache for faster subsequent loads
        if (_.cache !== false) {
          this._cacheNtroData(_.url, ntroBytes);
        }
      } else {
        // Load CSV/JSON and convert to Neutrino format
        const response = await fetch(_.url);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${_.url}: ${response.status}`);
        }

        const formatType = _.format?.type || this._inferFormat(_.url);

        if (formatType === 'csv') {
          const csvData = await response.text();
          this._table = bindings.loadCSV(null, csvData);
        } else {
          const jsonData = await response.json();
          this._table = bindings.loadJSON(null, jsonData);
        }

        // Cache as .ntro for faster subsequent loads
        if (_.cache !== false) {
          const ntroBytes = bindings.saveToNtro(this._table);
          this._cacheNtroData(_.url, ntroBytes);
        }
      }

      this._buildTuples(pulse);
      this._loaded = true;

    } catch (error) {
      df.error('Neutrino data load failed: ' + error.message);
    }

    return pulse;
  },

  async _loadFromValues(_, pulse) {
    try {
      // Load values as JSON - loadJSON now returns a new table
      this._table = bindings.loadJSON(null, _.values);

      this._buildTuples(pulse);
      this._loaded = true;

    } catch (error) {
      this.dataflow.error('Neutrino data load failed: ' + error.message);
    }

    return pulse;
  },

  _inferFormat(url) {
    if (url.endsWith('.csv')) return 'csv';
    if (url.endsWith('.json')) return 'json';
    if (url.endsWith('.tsv')) return 'tsv';
    return 'json';  // Default to JSON
  },

  _buildTuples(pulse) {
    // Build column map
    this._columnNames = bindings.getColumnNames(this._table);
    this._columnMap = {};
    this._columnNames.forEach((name, i) => {
      this._columnMap[name] = i;
    });

    // Create tuple proxies
    const rowCount = bindings.getRowCount(this._table);
    this._tuples = new Array(rowCount);

    for (let i = 0; i < rowCount; i++) {
      const tuple = createNeutrinoTuple(this, i);
      ingest(tuple);  // Add Vega tuple ID
      this._tuples[i] = tuple;
      pulse.add.push(tuple);
    }

    this.value = this._tuples;
    this._generation++;
  },

  async _cacheNtroData(url, ntroBytes) {
    // Cache to IndexedDB for instant reload
    try {
      const { getIndexedDBStore } = await import('../persistence/IndexedDBStore.js');
      const store = await getIndexedDBStore();
      await store.save(this._cacheKey(url), url, ntroBytes);
    } catch (e) {
      // Caching is optional, don't fail on error
      console.warn('Failed to cache Neutrino data:', e);
    }
  },

  async _loadFromCache(url) {
    try {
      const { getIndexedDBStore } = await import('../persistence/IndexedDBStore.js');
      const store = await getIndexedDBStore();
      const cached = await store.findByUrl(url);
      if (cached) {
        return cached.data;
      }
    } catch (e) {
      // Cache miss is not an error
    }
    return null;
  },

  _cacheKey(url) {
    // Create a cache key from URL
    return `neutrino_${url.replace(/[^a-zA-Z0-9]/g, '_')}`;
  },

  // Public API for transforms

  /**
   * Get column index by name.
   * @param {string} name - Column name
   * @returns {number|undefined} Column index
   */
  getColumnIndex(name) {
    return this._columnMap[name];
  },

  /**
   * Get all column names.
   * @returns {string[]} Column names
   */
  getColumnNames() {
    return this._columnNames;
  },

  /**
   * Get value at column and row.
   * @param {number} column - Column index
   * @param {number} row - Row index
   * @returns {any} Cell value
   */
  getValue(column, row) {
    return bindings.getValue(this._table, column, row);
  },

  /**
   * Get the WASM table pointer.
   * @returns {number} Table pointer
   */
  getTablePtr() {
    return this._table;
  },

  /**
   * Get the number of rows.
   * @returns {number} Row count
   */
  getRowCount() {
    return this._table ? bindings.getRowCount(this._table) : 0;
  },

  /**
   * Get the number of columns.
   * @returns {number} Column count
   */
  getColumnCount() {
    return this._columnNames.length;
  },

  /**
   * Get serialized data for worker transfer.
   * @returns {ArrayBuffer} Serialized data
   */
  getSerializedData() {
    return this._table ? bindings.serializeForWorker(this._table) : null;
  },

  /**
   * Check if data is loaded.
   * @returns {boolean} True if loaded
   */
  isLoaded() {
    return this._loaded;
  },

  /**
   * Export data as .ntro bytes.
   * @returns {Uint8Array} .ntro file bytes
   */
  exportNtro() {
    return this._table ? bindings.saveToNtro(this._table) : null;
  },

  /**
   * Dispose of resources.
   */
  dispose() {
    if (this._table) {
      bindings.freeTable(this._table);
      this._table = null;
    }
    this._tuples = [];
    this._loaded = false;
  }
});
