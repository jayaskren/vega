/**
 * Main API for enabling Neutrino in a Vega view.
 */

import { transforms, transformMap } from './transforms/index.js';
import { NeutrinoDataSource } from './datasource/index.js';
import { initializeNeutrino, isInitialized } from './wasm/loader.js';

/**
 * Enable Neutrino processing for a Vega view.
 *
 * @param {Object} view - Vega View instance
 * @param {Object} options - Configuration options
 * @param {string} options.wasmUrl - Custom URL for WASM module
 * @param {number} options.workerCount - Number of worker threads
 * @param {string[]} options.datasets - Dataset names to enable (default: all with neutrino: true)
 * @param {number} options.threshold - Row count threshold for using workers (default: 100000)
 * @param {boolean} options.replaceTransforms - Replace standard transforms (default: true)
 * @returns {Promise<Object>} The view with Neutrino enabled
 */
export async function enableNeutrino(view, options = {}) {
  // Initialize WASM
  await initializeNeutrino(options);

  // Get Vega runtime
  const runtime = view._runtime;

  if (!runtime) {
    throw new Error('Invalid Vega view: missing runtime');
  }

  // Register Neutrino transforms
  if (runtime.transforms) {
    Object.assign(runtime.transforms, transforms);
  }

  // Store options for later use
  view._neutrinoOptions = {
    workerCount: options.workerCount || (typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : 4),
    threshold: options.threshold || 100000,
    datasets: options.datasets || null,
    ...options
  };

  // Optional: Hook transform creation for automatic replacement
  if (options.replaceTransforms !== false) {
    hookTransformCreation(view, options.datasets);
  }

  return view;
}

/**
 * Hook into Vega's transform creation to substitute Neutrino versions.
 * @param {Object} view - Vega View
 * @param {string[]|null} datasets - Specific datasets to target
 */
function hookTransformCreation(view, datasets) {
  // This would require deeper integration with Vega's parser
  // For now, transforms are replaced via the registry
}

/**
 * Check if Neutrino is enabled for a view.
 * @param {Object} view - Vega View
 * @returns {boolean} True if enabled
 */
export function isNeutrinoEnabled(view) {
  return view._neutrinoOptions !== undefined && isInitialized();
}

/**
 * Get Neutrino options for a view.
 * @param {Object} view - Vega View
 * @returns {Object|null} Options or null
 */
export function getNeutrinoOptions(view) {
  return view._neutrinoOptions || null;
}

/**
 * Disable Neutrino for a view and clean up resources.
 * @param {Object} view - Vega View
 */
export function disableNeutrino(view) {
  if (view._neutrinoOptions) {
    delete view._neutrinoOptions;
  }

  // Clean up any Neutrino data sources
  const data = view._runtime?.data;
  if (data) {
    for (const name of Object.keys(data)) {
      const source = data[name];
      if (source && source.dispose) {
        source.dispose();
      }
    }
  }
}

/**
 * Convert a dataset to .ntro format and return bytes.
 * @param {Object} view - Vega View
 * @param {string} name - Dataset name
 * @returns {Uint8Array|null} .ntro bytes or null
 */
export function exportDatasetAsNtro(view, name) {
  const data = view._runtime?.data;
  if (!data || !data[name]) {
    return null;
  }

  const source = data[name];
  if (source.exportNtro) {
    return source.exportNtro();
  }

  return null;
}

/**
 * Get memory usage for Neutrino data in a view.
 * @param {Object} view - Vega View
 * @returns {Object} Memory usage by dataset
 */
export function getNeutrinoMemoryUsage(view) {
  const usage = {};
  const data = view._runtime?.data;

  if (data) {
    for (const name of Object.keys(data)) {
      const source = data[name];
      if (source && source.getTablePtr) {
        const { getMemoryUsage } = require('./wasm/bindings.js');
        usage[name] = getMemoryUsage(source.getTablePtr());
      }
    }
  }

  return usage;
}

/**
 * Create a Vega data source spec with Neutrino enabled.
 * @param {Object} spec - Data source specification
 * @returns {Object} Modified spec with Neutrino enabled
 */
export function neutrinoData(spec) {
  return {
    ...spec,
    neutrino: true
  };
}

/**
 * Create a Vega spec for .ntro file loading.
 * @param {string} name - Dataset name
 * @param {string} url - URL to .ntro file
 * @returns {Object} Data source specification
 */
export function ntroData(name, url) {
  return {
    name,
    url,
    format: { type: 'neutrino' }
  };
}
