/**
 * IndexedDB storage for Neutrino compressed datasets.
 * Provides fast reload from cached .ntro data.
 */

const DB_NAME = 'vega-neutrino';
const DB_VERSION = 1;
const STORE_NAME = 'datasets';

/**
 * IndexedDB store for Neutrino datasets.
 */
export class IndexedDBStore {
  constructor() {
    this.db = null;
  }

  /**
   * Open the database connection.
   */
  async open() {
    if (this.db) return this;

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

  /**
   * Save a dataset to the store.
   * @param {string} id - Unique identifier
   * @param {string} url - Source URL
   * @param {ArrayBuffer|Uint8Array} data - Compressed .ntro data
   */
  async save(id, url, data) {
    await this.open();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      // Convert Uint8Array to ArrayBuffer for storage
      const arrayBuffer = data instanceof ArrayBuffer
        ? data
        : data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);

      const record = {
        id,
        url,
        data: arrayBuffer,
        timestamp: Date.now(),
        size: arrayBuffer.byteLength
      };

      const request = store.put(record);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Load a dataset by ID.
   * @param {string} id - Dataset ID
   * @returns {Object|null} Dataset record or null
   */
  async load(id) {
    await this.open();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  /**
   * Find a dataset by URL.
   * @param {string} url - Source URL
   * @returns {Object|null} Dataset record or null
   */
  async findByUrl(url) {
    await this.open();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('url');

      const request = index.get(url);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  /**
   * Delete a dataset.
   * @param {string} id - Dataset ID
   */
  async delete(id) {
    await this.open();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * List all datasets.
   * @returns {Array} Array of dataset records
   */
  async list() {
    await this.open();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Clear all datasets.
   */
  async clear() {
    await this.open();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get total storage usage.
   * @returns {number} Total bytes used
   */
  async getStorageUsage() {
    const datasets = await this.list();
    return datasets.reduce((total, ds) => total + (ds.size || 0), 0);
  }

  /**
   * Delete datasets older than a given age.
   * @param {number} maxAgeMs - Maximum age in milliseconds
   */
  async pruneOld(maxAgeMs) {
    const datasets = await this.list();
    const cutoff = Date.now() - maxAgeMs;

    for (const ds of datasets) {
      if (ds.timestamp < cutoff) {
        await this.delete(ds.id);
      }
    }
  }

  /**
   * Close the database connection.
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Singleton instance
let storeInstance = null;

/**
 * Get the global IndexedDB store instance.
 * @returns {Promise<IndexedDBStore>} Store instance
 */
export async function getIndexedDBStore() {
  if (!storeInstance) {
    storeInstance = new IndexedDBStore();
    await storeInstance.open();
  }
  return storeInstance;
}

/**
 * Check if IndexedDB is available.
 * @returns {boolean} True if available
 */
export function isIndexedDBAvailable() {
  return typeof indexedDB !== 'undefined';
}
