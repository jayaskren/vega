/**
 * Worker pool manager for background WASM processing.
 * Manages task distribution and worker lifecycle.
 */

/**
 * WorkerManager - Manages pool of Web Workers for Neutrino operations.
 */
export class WorkerManager {
  constructor(options = {}) {
    this.workerCount = options.workerCount ||
      (typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : 4);
    this.workers = [];
    this.taskQueue = [];
    this.idleWorkers = [];
    this.taskId = 0;
    this.pendingTasks = new Map();
    this.initialized = false;
    this.wasmUrl = options.wasmUrl || null;
  }

  /**
   * Initialize the worker pool.
   * @param {string} wasmUrl - URL to WASM module
   */
  async initialize(wasmUrl) {
    if (this.initialized) return;

    this.wasmUrl = wasmUrl || this.wasmUrl;

    // Create worker URL
    const workerUrl = new URL('./neutrino.worker.js', import.meta.url);

    const initPromises = [];

    for (let i = 0; i < this.workerCount; i++) {
      const worker = new Worker(workerUrl, { type: 'module' });

      // Initialize WASM in worker
      const initPromise = new Promise((resolve, reject) => {
        const handler = (e) => {
          if (e.data.type === 'ready') {
            worker.removeEventListener('message', handler);
            resolve();
          } else if (e.data.type === 'error') {
            worker.removeEventListener('message', handler);
            reject(new Error(e.data.error));
          }
        };
        worker.addEventListener('message', handler);
        worker.postMessage({
          type: 'init',
          wasmUrl: this.wasmUrl
        });
      });

      initPromises.push(initPromise);

      // Set up message handler
      worker.onmessage = this._handleMessage.bind(this, worker);
      worker.onerror = this._handleError.bind(this, worker);

      this.workers.push(worker);
      this.idleWorkers.push(worker);
    }

    await Promise.all(initPromises);
    this.initialized = true;
  }

  /**
   * Execute a task in a worker.
   * @param {Object} task - Task configuration
   * @returns {Promise<any>} Task result
   */
  execute(task) {
    return new Promise((resolve, reject) => {
      const id = ++this.taskId;

      this.pendingTasks.set(id, { resolve, reject, task });

      if (this.idleWorkers.length > 0) {
        const worker = this.idleWorkers.pop();
        this._dispatch(worker, id, task);
      } else {
        this.taskQueue.push(id);
      }
    });
  }

  /**
   * Dispatch a task to a worker.
   */
  _dispatch(worker, taskId, task) {
    // Prepare transferable objects
    const transfer = [];
    if (task.data instanceof ArrayBuffer) {
      transfer.push(task.data);
    } else if (task.data && task.data.buffer instanceof ArrayBuffer) {
      transfer.push(task.data.buffer);
    }

    worker.postMessage({
      type: 'execute',
      taskId,
      operation: task.operation,
      params: task.params,
      data: task.data
    }, transfer);
  }

  /**
   * Handle worker message.
   */
  _handleMessage(worker, event) {
    const { type, taskId, result, error } = event.data;

    if (type === 'result') {
      const pending = this.pendingTasks.get(taskId);
      if (pending) {
        this.pendingTasks.delete(taskId);
        pending.resolve(result);
      }
    } else if (type === 'error') {
      const pending = this.pendingTasks.get(taskId);
      if (pending) {
        this.pendingTasks.delete(taskId);
        pending.reject(new Error(error));
      }
    }

    // Process next task in queue
    if (this.taskQueue.length > 0) {
      const nextId = this.taskQueue.shift();
      const nextPending = this.pendingTasks.get(nextId);
      if (nextPending) {
        this._dispatch(worker, nextId, nextPending.task);
        return;
      }
    }

    // Return worker to pool
    this.idleWorkers.push(worker);
  }

  /**
   * Handle worker error.
   */
  _handleError(worker, error) {
    console.error('Worker error:', error);
  }

  /**
   * Cancel a pending task.
   * @param {number} taskId - Task ID to cancel
   */
  cancel(taskId) {
    const pending = this.pendingTasks.get(taskId);
    if (pending) {
      this.pendingTasks.delete(taskId);
      pending.reject(new Error('Task cancelled'));
    }

    // Remove from queue if present
    const queueIdx = this.taskQueue.indexOf(taskId);
    if (queueIdx >= 0) {
      this.taskQueue.splice(queueIdx, 1);
    }
  }

  /**
   * Cancel all pending tasks.
   */
  cancelAll() {
    for (const [id, pending] of this.pendingTasks) {
      pending.reject(new Error('All tasks cancelled'));
    }
    this.pendingTasks.clear();
    this.taskQueue = [];
  }

  /**
   * Get worker pool statistics.
   */
  getStats() {
    return {
      totalWorkers: this.workers.length,
      idleWorkers: this.idleWorkers.length,
      busyWorkers: this.workers.length - this.idleWorkers.length,
      pendingTasks: this.pendingTasks.size,
      queuedTasks: this.taskQueue.length
    };
  }

  /**
   * Terminate all workers.
   */
  terminate() {
    this.cancelAll();
    this.workers.forEach(w => w.terminate());
    this.workers = [];
    this.idleWorkers = [];
    this.initialized = false;
  }
}

// Singleton instance
let managerInstance = null;

/**
 * Get the global WorkerManager instance.
 * @returns {WorkerManager} Worker manager
 */
export function getWorkerManager() {
  if (!managerInstance) {
    managerInstance = new WorkerManager();
  }
  return managerInstance;
}

/**
 * Set the global WorkerManager instance.
 * @param {WorkerManager} manager - Worker manager
 */
export function setWorkerManager(manager) {
  if (managerInstance) {
    managerInstance.terminate();
  }
  managerInstance = manager;
}
