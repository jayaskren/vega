/**
 * Streaming CSV loader for progressive data loading.
 * Enables visualization during load with progress tracking.
 */

import * as bindings from '../wasm/bindings.js';

/**
 * StreamingLoader - Load CSV data progressively with callbacks.
 */
export class StreamingLoader {
  constructor(options = {}) {
    this.chunkSize = options.chunkSize || 10000;  // Rows per chunk
    this.onProgress = options.onProgress || null;
    this.onChunkLoaded = options.onChunkLoaded || null;
    this.cancelled = false;
  }

  /**
   * Load CSV from URL with streaming.
   * @param {string} url - URL to fetch
   * @param {number} tablePtr - Neutrino table pointer
   * @returns {Promise<number>} Total row count
   */
  async loadFromUrl(url, tablePtr) {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = '';
    let rowCount = 0;
    let header = null;
    let lineBuffer = [];

    while (!this.cancelled) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop();  // Keep incomplete line

      // Extract header if not yet done
      if (!header && lines.length > 0) {
        header = lines.shift();
      }

      // Add lines to buffer
      lineBuffer.push(...lines);

      // Process chunks
      while (lineBuffer.length >= this.chunkSize) {
        const chunk = lineBuffer.splice(0, this.chunkSize);
        await this._processChunk(tablePtr, header, chunk, rowCount);
        rowCount += chunk.length;

        if (this.onProgress) {
          this.onProgress(rowCount);
        }
      }
    }

    // Process remaining buffer
    if (buffer.trim()) {
      lineBuffer.push(buffer);
    }

    if (lineBuffer.length > 0) {
      await this._processChunk(tablePtr, header, lineBuffer, rowCount);
      rowCount += lineBuffer.length;

      if (this.onProgress) {
        this.onProgress(rowCount);
      }
    }

    return rowCount;
  }

  /**
   * Load CSV from string with streaming.
   * @param {string} csvData - CSV content
   * @param {number} tablePtr - Neutrino table pointer
   * @returns {Promise<number>} Total row count
   */
  async loadFromString(csvData, tablePtr) {
    const lines = csvData.split('\n');
    const header = lines.shift();
    let rowCount = 0;

    // Process in chunks
    for (let i = 0; i < lines.length && !this.cancelled; i += this.chunkSize) {
      const chunk = lines.slice(i, Math.min(i + this.chunkSize, lines.length));
      await this._processChunk(tablePtr, header, chunk, rowCount);
      rowCount += chunk.length;

      if (this.onProgress) {
        this.onProgress(rowCount);
      }

      // Yield to event loop
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    return rowCount;
  }

  /**
   * Process a chunk of CSV lines.
   */
  async _processChunk(tablePtr, header, lines, startRow) {
    // Build CSV chunk with header
    const csvChunk = header + '\n' + lines.filter(l => l.trim()).join('\n');

    // Load into table
    // Note: This is a simplified approach. A more efficient implementation
    // would append rows directly without re-parsing the header.
    if (startRow === 0) {
      bindings.loadCSV(tablePtr, csvChunk);
    } else {
      // For subsequent chunks, we'd use an append operation
      // This is a placeholder - actual implementation depends on Neutrino API
      bindings.loadCSV(tablePtr, csvChunk);
    }

    if (this.onChunkLoaded) {
      this.onChunkLoaded({
        startRow,
        rowCount: lines.length,
        totalRows: startRow + lines.length
      });
    }
  }

  /**
   * Cancel the loading operation.
   */
  cancel() {
    this.cancelled = true;
  }

  /**
   * Reset the loader state.
   */
  reset() {
    this.cancelled = false;
  }
}

/**
 * Load CSV with progress tracking.
 * @param {string} url - URL to fetch
 * @param {Object} options - Loader options
 * @returns {Promise<Object>} Loaded table info
 */
export async function loadCSVWithProgress(url, options = {}) {
  const tablePtr = bindings.createTable();
  const loader = new StreamingLoader(options);

  try {
    const rowCount = await loader.loadFromUrl(url, tablePtr);

    return {
      tablePtr,
      rowCount,
      columnCount: bindings.getColumnCount(tablePtr),
      columnNames: bindings.getColumnNames(tablePtr)
    };
  } catch (error) {
    bindings.freeTable(tablePtr);
    throw error;
  }
}
