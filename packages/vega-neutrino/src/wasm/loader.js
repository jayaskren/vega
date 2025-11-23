/**
 * WASM loader for Neutrino columnar storage engine.
 * Handles async initialization with caching and fallback support.
 */

let wasmInstance = null;
let wasmPromise = null;
let wasmMemory = null;

/**
 * Initialize the Neutrino WASM module.
 * @param {Object} options - Configuration options
 * @param {string} options.wasmUrl - Custom URL for WASM module
 * @returns {Promise<Object>} The WASM instance exports
 */
export async function initializeNeutrino(options = {}) {
  if (wasmInstance) return wasmInstance;

  if (wasmPromise) return wasmPromise;

  wasmPromise = (async () => {
    // Determine WASM URL
    const wasmUrl = options.wasmUrl ||
      (typeof import.meta !== 'undefined'
        ? new URL('./neutrino_bg.wasm', import.meta.url)
        : 'neutrino_bg.wasm');

    try {
      const response = await fetch(wasmUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch WASM: ${response.status} ${response.statusText}`);
      }

      const bytes = await response.arrayBuffer();

      // Create shared memory for efficient data transfer
      wasmMemory = new WebAssembly.Memory({
        initial: 256,  // 16MB initial
        maximum: 16384 // 1GB maximum
      });

      const importObject = {
        env: {
          memory: wasmMemory,
          // Console logging for debugging
          console_log: (ptr, len) => {
            const bytes = new Uint8Array(wasmMemory.buffer, ptr, len);
            console.log(new TextDecoder().decode(bytes));
          },
          console_error: (ptr, len) => {
            const bytes = new Uint8Array(wasmMemory.buffer, ptr, len);
            console.error(new TextDecoder().decode(bytes));
          }
        }
      };

      const { instance } = await WebAssembly.instantiate(bytes, importObject);

      wasmInstance = instance.exports;

      // Initialize the WASM module if it has an init function
      if (wasmInstance.init) {
        wasmInstance.init();
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
 * @returns {Object} The WASM instance exports
 */
export function getWasm() {
  if (!wasmInstance) {
    throw new Error('Neutrino WASM not initialized. Call initializeNeutrino() first.');
  }
  return wasmInstance;
}

/**
 * Get the WASM memory object.
 * @returns {WebAssembly.Memory} The WASM memory
 */
export function getWasmMemory() {
  if (!wasmMemory) {
    throw new Error('Neutrino WASM not initialized. Call initializeNeutrino() first.');
  }
  return wasmMemory;
}

/**
 * Check if Neutrino WASM is initialized.
 * @returns {boolean} True if initialized
 */
export function isInitialized() {
  return wasmInstance !== null;
}

/**
 * Get a string from WASM memory.
 * @param {Object} wasm - WASM instance
 * @param {number} ptr - Pointer to string in WASM memory
 * @returns {string} The decoded string
 */
export function getWasmString(wasm, ptr) {
  const memory = wasmMemory || wasm.memory;
  const view = new Uint8Array(memory.buffer);

  // Find null terminator
  let end = ptr;
  while (view[end] !== 0) end++;

  const bytes = new Uint8Array(memory.buffer, ptr, end - ptr);
  return new TextDecoder().decode(bytes);
}

/**
 * Allocate memory in WASM and copy data.
 * @param {Uint8Array} data - Data to copy
 * @returns {number} Pointer to allocated memory
 */
export function allocateAndCopy(data) {
  const wasm = getWasm();
  const ptr = wasm.alloc(data.length);
  const memory = new Uint8Array(getWasmMemory().buffer, ptr, data.length);
  memory.set(data);
  return ptr;
}

/**
 * Free memory allocated in WASM.
 * @param {number} ptr - Pointer to memory
 * @param {number} len - Length of allocation
 */
export function deallocate(ptr, len) {
  const wasm = getWasm();
  if (wasm.dealloc) {
    wasm.dealloc(ptr, len);
  }
}

/**
 * Reset WASM state (useful for testing).
 */
export function resetWasm() {
  wasmInstance = null;
  wasmPromise = null;
  wasmMemory = null;
}
