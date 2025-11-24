/**
 * WASM loader for Neutrino columnar storage engine.
 * Wraps the wasm-bindgen generated code.
 */

import neutrinoInit from './neutrino.js';
import * as neutrinoExports from './neutrino.js';

let wasmInstance = null;
let wasmPromise = null;

/**
 * Initialize the Neutrino WASM module using wasm-bindgen generated code.
 * @param {Object} options - Configuration options
 * @param {string} options.wasmUrl - Custom URL for WASM module
 * @returns {Promise<Object>} The WASM module exports
 */
export async function initializeNeutrino(options = {}) {
  if (wasmInstance) return wasmInstance;

  if (wasmPromise) return wasmPromise;

  wasmPromise = (async () => {
    try {
      // Determine WASM URL
      const wasmUrl = options.wasmUrl ||
        (typeof import.meta !== 'undefined'
          ? new URL('./neutrino_bg.wasm', import.meta.url)
          : './neutrino_bg.wasm');

      // Initialize using wasm-bindgen generated code
      await neutrinoInit(wasmUrl);

      // Store the exports
      wasmInstance = neutrinoExports;

      // Initialize memory management if available
      if (wasmInstance.init_memory_management) {
        wasmInstance.init_memory_management();
      }

      return wasmInstance;
    } catch (error) {
      wasmPromise = null;
      throw new Error(`Neutrino WASM initialization failed: ${error.message}`);
    }
  })();

  return wasmPromise;
}

/**
 * Get the WASM instance. Throws if not initialized.
 * @returns {Object} The WASM module exports
 */
export function getWasm() {
  if (!wasmInstance) {
    throw new Error('Neutrino WASM not initialized. Call initializeNeutrino() first.');
  }
  return wasmInstance;
}

/**
 * Check if Neutrino WASM is initialized.
 * @returns {boolean} True if initialized
 */
export function isInitialized() {
  return wasmInstance !== null;
}

/**
 * Reset WASM state (useful for testing).
 */
export function resetWasm() {
  wasmInstance = null;
  wasmPromise = null;
}

/**
 * Re-export all neutrino functions for convenience
 */
export * from './neutrino.js';
