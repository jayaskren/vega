/* tslint:disable */
/* eslint-disable */
/**
 * Lookup/join transform WASM export
 */
export function lookupTransform(primary_bytes: Uint8Array, secondary_bytes: Uint8Array, key_field: number, from_key: number, from_fields: Uint32Array, output_names: string[]): Uint8Array;
/**
 * Calculate quantitative domain WASM export
 */
export function calculateQuantitativeDomain(file_bytes: Uint8Array, field: number, include_zero: boolean, nice: boolean): Float64Array;
/**
 * Calculate ordinal domain WASM export
 */
export function calculateOrdinalDomain(file_bytes: Uint8Array, field: number, sort?: string | null, limit?: number | null): string[];
/**
 * Pivot transform WASM export
 */
export function pivotTransform(file_bytes: Uint8Array, config: any): Uint8Array;
/**
 * Flatten transform WASM export
 */
export function flattenTransform(file_bytes: Uint8Array, flatten_fields: Uint32Array, output_names: string[]): Uint8Array;
/**
 * Bin transform WASM export
 */
export function binTransform(file_bytes: Uint8Array, config: any, output_start: string, output_end: string): Uint8Array;
/**
 * Filter transform WASM export
 */
export function filterTransform(file_bytes: Uint8Array, predicate: any): Uint8Array;
/**
 * Sample transform WASM export
 */
export function sampleTransform(file_bytes: Uint8Array, n: number, seed?: bigint | null): Uint8Array;
/**
 * Regression transform WASM export
 */
export function regressionTransform(file_bytes: Uint8Array, config: any): Uint8Array;
/**
 * Window transform WASM export
 */
export function windowTransform(file_bytes: Uint8Array, windows: any, output_names: string[]): Uint8Array;
/**
 * Quantile transform WASM export
 */
export function quantileTransform(file_bytes: Uint8Array, field: number, probs: Float64Array): Uint8Array;
/**
 * Fold transform WASM export
 */
export function foldTransform(file_bytes: Uint8Array, fold_fields: Uint32Array, key_name: string, value_name: string): Uint8Array;
/**
 * Density estimation WASM export
 */
export function densityTransform(file_bytes: Uint8Array, field: number, bandwidth: number | null | undefined, cumulative: boolean, counts: boolean, steps?: number | null): Uint8Array;
/**
 * Stack transform WASM export
 */
export function stackTransform(file_bytes: Uint8Array, config: any, y0_name: string, y1_name: string): Uint8Array;
/**
 * LOESS smoothing WASM export
 */
export function loessTransform(file_bytes: Uint8Array, x_field: number, y_field: number, bandwidth?: number | null): Uint8Array;
/**
 * Calculate temporal domain WASM export
 */
export function calculateTemporalDomain(file_bytes: Uint8Array, field: number, nice?: string | null): BigInt64Array;
/**
 * Calculate (formula) transform WASM export
 */
export function calculateTransform(file_bytes: Uint8Array, expression: string, output_name: string): Uint8Array;
/**
 * Initialize memory management utilities
 */
export function init_memory_management(): void;
/**
 * Deserialize an integer chunk from binary data
 *
 * Used by LazyDataset to deserialize chunks loaded from IndexedDB
 */
export function deserializeIntegerChunk(data: Uint8Array): WasmIntegerChunk;
/**
 * Deserialize a string chunk from binary data
 *
 * Used by LazyDataset to deserialize chunks loaded from IndexedDB
 */
export function deserializeStringChunk(data: Uint8Array): WasmStringChunk;
/**
 * Deserialize a float chunk from binary data
 *
 * Used by LazyDataset to deserialize chunks loaded from IndexedDB
 */
export function deserializeFloatChunk(data: Uint8Array): WasmFloatChunk;
/**
 * Deserialize a datetime chunk from binary data
 *
 * Supports two formats:
 * 1. AdaptiveDateTimeChunkHeader format (legacy DateTime columns)
 * 2. IntegerChunkHeader format (DateTimeAsInteger columns - stored as Frame-of-Reference integers)
 *
 * Used by LazyDataset to deserialize chunks loaded from IndexedDB
 */
export function deserializeDateTimeChunk(data: Uint8Array): WasmIntegerChunk;
/**
 * Get raw (unaggregated) columns from a .ntro file for chart rendering
 *
 * This function efficiently extracts multiple columns of raw data in a single call,
 * optimized for chart rendering (Gantt charts, scatter plots, etc.)
 *
 * # Arguments
 * * `file_bytes` - The complete .ntro file bytes
 * * `column_indices` - Array of column indices to extract
 * * `start_row` - Starting row index
 * * `row_count` - Maximum number of rows to extract
 *
 * # Returns
 * JSON string with the following structure:
 * ```json
 * {
 *   "columns": [
 *     {
 *       "index": 0,
 *       "name": "column_name",
 *       "type": "integer|float|string|datetime",
 *       "values": [...]
 *     }
 *   ],
 *   "rowCount": 1000,
 *   "truncated": false
 * }
 * ```
 *
 * # Example (JavaScript)
 * ```javascript
 * const result = JSON.parse(getRawColumns(fileBytes, [0, 1, 3], 0, 10000));
 * console.log(`Got ${result.rowCount} rows`);
 * ```
 */
export function getRawColumns(file_bytes: Uint8Array, column_indices: Uint32Array, start_row: number, row_count: number): string;
/**
 * Parse file metadata without loading full table data
 *
 * Returns JSON string with schema information:
 * ```json
 * {
 *   "rowCount": 1000000,
 *   "columnCount": 18,
 *   "columns": [
 *     {"name": "Amount", "type": "Float", "chunkCount": 16},
 *     {"name": "Date", "type": "DateTime", "chunkCount": 16}
 *   ],
 *   "estimatedMemoryMB": 155.2
 * }
 * ```
 *
 * # Example (JavaScript)
 * ```javascript
 * const fileBytes = await indexedDB.get('datasets', 'utah.ntro');
 * const metadata = parseMetadata(fileBytes);
 * console.log(`Dataset has ${metadata.rowCount} rows`);
 * ```
 */
export function parseMetadata(bytes: Uint8Array): string;
/**
 * Extract a single chunk from the file for lazy loading
 *
 * Returns compressed Tier-2 chunk data that can be stored in IndexedDB.
 * The chunk can be decompressed later using decompressLZ4() or decompressZSTD().
 *
 * # Arguments
 * * `bytes` - Full .ntro file contents
 * * `column_index` - Column index (0-based)
 * * `chunk_index` - Chunk index within column (0-based)
 *
 * # Returns
 * Uint8Array containing compressed chunk data with metadata header:
 * ```
 * [4 bytes: compression type] [4 bytes: original size] [N bytes: compressed data]
 * ```
 *
 * # Example (JavaScript)
 * ```javascript
 * // Extract chunk for column 3, chunk 5
 * const chunkData = extractChunk(fileBytes, 3, 5);
 * await indexedDB.put('chunks', {col: 3, chunk: 5, data: chunkData});
 * ```
 */
export function extractChunk(bytes: Uint8Array, column_index: number, chunk_index: number): Uint8Array;
/**
 * Parse file metadata with detailed column statistics
 *
 * Similar to parseMetadata() but includes min/max/mean/cardinality statistics
 * by scanning chunk headers (lightweight, doesn't load full data).
 *
 * Returns JSON string with enhanced schema information:
 * ```json
 * {
 *   "rowCount": 1000000,
 *   "columnCount": 18,
 *   "columns": [
 *     {
 *       "name": "Amount",
 *       "type": "Float",
 *       "chunkCount": 16,
 *       "minValue": 0.5,
 *       "maxValue": 999999.99,
 *       "meanValue": 125000.42
 *     },
 *     {
 *       "name": "Date",
 *       "type": "DateTime",
 *       "chunkCount": 16,
 *       "minValue": "2020-01-01T00:00:00Z",
 *       "maxValue": "2023-12-31T23:59:59Z"
 *     },
 *     {
 *       "name": "Category",
 *       "type": "String",
 *       "chunkCount": 16,
 *       "cardinality": 42
 *     }
 *   ],
 *   "estimatedMemoryMB": 155.2
 * }
 * ```
 */
export function parseMetadataWithStats(bytes: Uint8Array): string;
/**
 * Single-call aggregation that returns TYPED ARRAYS to minimize JS allocations
 */
export function aggregateForChartTyped(bytes: Uint8Array, x_column: number, y_column?: number | null, color_column?: number | null, aggregation?: string | null, x_time_granularity?: string | null, color_time_granularity?: string | null): any;
/**
 * Parse chunk metadata from raw chunk bytes
 *
 * Returns a JavaScript object with chunk metadata including:
 * - bitWidth: Bits per value (for integers)
 * - compressionType: Compression type name
 * - elementCount: Number of elements in chunk
 * - minValue: Minimum value (for numeric types)
 * - maxValue: Maximum value (for numeric types)
 * - cardinality: Number of unique values (for strings)
 * - uncompressedBytes: Estimated uncompressed size
 *
 * # Example (JavaScript)
 * ```javascript
 * const chunkData = extractChunk(fileBytes, columnIdx, chunkIdx);
 * const metadata = parseChunkMetadata(chunkData, "Integer");
 * console.log(`Chunk has ${metadata.elementCount} elements, ${metadata.bitWidth} bits/value`);
 * ```
 */
export function parseChunkMetadata(chunk_bytes: Uint8Array, column_type: string): any;
/**
 * Single-call aggregation that returns D3-ready chart data
 *
 * This is the MEMORY-OPTIMIZED replacement for:
 *   aggregateLazy() → getXValues() → getCounts() → Map → Array → React state
 *
 * **Phase A Memory Fix**: Eliminates 4-5 intermediate object allocations by:
 * 1. Loading only needed columns from file (existing optimization)
 * 2. Aggregating in WASM (existing logic)
 * 3. **NEW**: Converting to D3-ready format IN WASM
 * 4. Returning single JsValue (one allocation instead of 5)
 *
 * Expected memory savings: 30-40 MB per chart update
 *
 * # Arguments
 * * `bytes` - Full .ntro file data
 * * `x_column` - X-axis column index
 * * `y_column` - Y-axis column index (None for count aggregation)
 * * `color_column` - Color/group column index (optional)
 *
 * # Returns
 * JsValue containing ChartData (ready for D3, no transformations needed)
 *
 * # Example (JavaScript)
 * ```javascript
 * // OLD (memory leak):
 * const result = aggregateLazy(bytes, 0, 1, 2);
 * const xValues = result.getXValues();  // Allocation 1
 * const yValues = result.getYValues();  // Allocation 2
 * const groups = result.getGroups();    // Allocation 3
 * const points = transformToPoints(xValues, yValues, groups);  // Allocation 4
 * setChartData(points);  // Allocation 5 (React state)
 *
 * // NEW (Phase A):
 * const chartData = await aggregateForChart(bytes, 0, 1, 2);
 * // chartData is already D3-ready, use directly with useRef (no state!)
 * chartDataRef.current = chartData;
 * renderD3Chart(container, chartData);
 * ```
 */
export function aggregateForChart(bytes: Uint8Array, x_column: number, y_column?: number | null, color_column?: number | null): any;
/**
 * Decompress ZSTD-compressed Tier-2 data
 *
 * # Arguments
 * * `compressed_data` - ZSTD-compressed chunk data
 *
 * # Returns
 * Uint8Array containing decompressed Tier-1 data
 *
 * # Example (JavaScript)
 * ```javascript
 * const compressed = await indexedDB.get('chunks', {col: 3, chunk: 5});
 * const decompressed = decompressZSTD(compressed.data);
 * // Now deserialize Tier-1 format...
 * ```
 */
export function decompressZSTD(compressed_data: Uint8Array): Uint8Array;
/**
 * Aggregate a specific row range (for manual Web Worker parallelization)
 *
 * This function is designed to be called from Web Workers, where each worker
 * processes a subset of rows and returns partial aggregated results.
 * The main thread then merges all partial results.
 *
 * # Arguments
 * * `bytes` - Raw .ntro file bytes
 * * `start_row` - First row to process (inclusive)
 * * `end_row` - Last row to process (exclusive)
 * * `x_column` - X-axis column index
 * * `y_column` - Y-axis column index (None for record count)
 * * `color_column` - Optional color/grouping column index
 * * `aggregation` - Aggregation type ("sum", "count", "average", "min", "max", "unique")
 * * `x_time_granularity` - Optional time granularity for X axis
 * * `color_time_granularity` - Optional time granularity for color column
 *
 * # Returns
 * Partial aggregated results in ChartDataTyped format ready for merging
 *
 * # Example (Worker)
 * ```javascript
 * const result = await wasm.aggregateChunk(
 *   fileBytes, 0, 1000000, // rows 0-1M
 *   0, 1, null, // x=0, y=1, no color
 *   'sum', null, null
 * );
 * ```
 */
export function aggregateChunk(bytes: Uint8Array, start_row: number, end_row: number, x_column: number, y_column?: number | null, color_column?: number | null, aggregation?: string | null, x_time_granularity?: string | null, color_time_granularity?: string | null): any;
export function aggregateForChartParallel(bytes: Uint8Array, x_column: number, y_column: number | null | undefined, color_column: number | null | undefined, aggregation: string | null | undefined, x_time_granularity: string | null | undefined, color_time_granularity: string | null | undefined, _num_threads: number): any;
/**
 * Decompress LZ4-compressed Tier-2 data
 *
 * # Arguments
 * * `compressed_data` - LZ4-compressed chunk data
 *
 * # Returns
 * Uint8Array containing decompressed Tier-1 data
 *
 * # Example (JavaScript)
 * ```javascript
 * const compressed = await indexedDB.get('chunks', {col: 3, chunk: 5});
 * const decompressed = decompressLZ4(compressed.data);
 * // Now deserialize Tier-1 format...
 * ```
 */
export function decompressLZ4(compressed_data: Uint8Array): Uint8Array;
/**
 * Get actual WebAssembly linear memory size (MB)
 */
export function getWasmLinearMemoryMB(): number;
/**
 * Aggregate chart data WITHOUT loading the full table into memory
 *
 * This is the memory-efficient alternative to loadFromBytes() → aggregateForChart().
 * Instead of decompressing ALL columns to Tier-1 (~700MB), this function:
 * 1. Parses metadata only (~1KB)
 * 2. Loads ONLY the chunks needed for aggregation (2-3 columns)
 * 3. Aggregates data in-place
 * 4. Drops all temporary data immediately
 * 5. Returns small aggregated result (~1-10KB)
 *
 * Expected memory usage: ~10-50MB peak (vs 700MB for full load)
 *
 * # Arguments
 * * `bytes` - Full .ntro file data
 * * `x_column` - X-axis column index
 * * `y_column` - Y-axis column index (optional, for count aggregation)
 * * `color_column` - Color/group column index (optional)
 *
 * # Returns
 * WasmAggregatedResult containing small aggregated arrays ready for charting
 *
 * # Example (JavaScript)
 * ```javascript
 * // Instead of:
 * // const table = loadFromBytes(fileBytes);  // Loads 700MB!
 * // const result = table.aggregateForChart(0, 1, null);
 *
 * // Do this:
 * const result = aggregateLazy(fileBytes, 0, 1, null);  // Loads ~20MB peak!
 * const xValues = result.getXValues();
 * const yValues = result.getYValues();
 * ```
 */
export function aggregateLazy(bytes: Uint8Array, x_column: number, y_column?: number | null, color_column?: number | null): WasmAggregatedResult;
/**
 * Get current WASM memory pool statistics
 */
export function getMemoryStats(): WasmMemoryStats;
/**
 * Main WASM-exported heatmap aggregation function
 *
 * Aggregates columnar data into a 2D heatmap grid for visualization.
 *
 * # Arguments
 * * `table` - Reference to the Neutrino table
 * * `x_column_name` - Name of the column to use for X axis
 * * `y_column_name` - Name of the column to use for Y axis
 * * `value_column_name` - Name of the column to aggregate (or empty for count)
 * * `x_bins` - Number of bins in X direction
 * * `y_bins` - Number of bins in Y direction
 * * `aggregation_type` - Type of aggregation: "count", "sum", "average", "min", "max"
 *
 * # Returns
 * * `HeatmapData` - Structure containing the heatmap grid and metadata
 *
 * # Errors
 * * Column not found
 * * Invalid column type (must be numeric for X, Y, and value columns)
 * * Invalid aggregation type
 */
export function aggregateForHeatmap(wasm_table: WasmTable, x_column_name: string, y_column_name: string, value_column_name: string, x_bins: number, y_bins: number, aggregation_type: string): HeatmapData;
export function compress_brotli_2(data: Uint8Array): Uint8Array;
/**
 * Initialize panic hook for better error messages in WASM
 */
export function init_tier2_test(): void;
/**
 * Get memory usage estimate (WASM linear memory)
 */
export function get_wasm_memory_pages(): number;
/**
 * Compress data with LZ4 (pure Rust implementation)
 */
export function compress_lz4(data: Uint8Array): Uint8Array;
export function compress_brotli_6(data: Uint8Array): Uint8Array;
export function compress_brotli_4(data: Uint8Array): Uint8Array;
export function compress_brotli_9(data: Uint8Array): Uint8Array;
/**
 * Verify decompressed data matches original
 */
export function verify_data(original: Uint8Array, decompressed: Uint8Array): boolean;
export function compress_brotli_7(data: Uint8Array): Uint8Array;
/**
 * Get test data info (helper for JavaScript)
 */
export function get_test_data_path(): string;
export function compress_brotli_1(data: Uint8Array): Uint8Array;
export function compress_brotli_5(data: Uint8Array): Uint8Array;
export function compress_brotli_8(data: Uint8Array): Uint8Array;
export function decompress_brotli(data: Uint8Array): Uint8Array;
export function compress_brotli_3(data: Uint8Array): Uint8Array;
/**
 * Decompress Zstd data (pure Rust implementation - ruzstd)
 * Works for all compression levels (1, 3, 6, 9, 12)
 */
export function decompress_zstd(data: Uint8Array): Uint8Array;
/**
 * Decompress LZ4 data (pure Rust implementation)
 */
export function decompress_lz4(data: Uint8Array): Uint8Array;
/**
 * Perform general-purpose aggregation on a table
 *
 * This is the main API for Vega integration, supporting:
 * - Multiple groupby dimensions
 * - Multiple aggregation operations
 * - Flexible field mapping
 *
 * # Arguments
 * * `table` - The WasmTable to aggregate
 * * `config` - JavaScript object with aggregation configuration
 *
 * # Returns
 * Array of JavaScript objects, each representing one aggregated row
 */
export function aggregate(table: WasmTable, config: any): any;
/**
 * Efficient WASM table with true lazy loading
 */
export class EfficientWasmTable {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  columnCount(): number;
  /**
   * Get memory usage statistics
   */
  getMemoryStats(): object;
  /**
   * Efficient batch loading - only loads needed chunks!
   */
  getBatch(column_index: number, start_row: number, count: number): Array<any>;
  /**
   * Get table dimensions - ZERO ACCESS to avoid ANY recursion
   */
  rowCount(): number;
}
/**
 * Heatmap data structure for 2D binning and aggregation
 *
 * This structure holds the results of aggregating data into a 2D grid for heatmap visualization.
 * The data is stored in row-major order (index = y * width + x).
 */
export class HeatmapData {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Get a value at a specific grid position
   */
  get(x: number, y: number): number | undefined;
  /**
   * Get the value label
   */
  readonly value_label: string;
  /**
   * Get the x bin edges (length = width + 1)
   */
  readonly x_bin_edges: Float64Array;
  /**
   * Get the y bin edges (length = height + 1)
   */
  readonly y_bin_edges: Float64Array;
  /**
   * Get the heatmap data as a flat array (row-major order)
   * JavaScript must copy this data
   */
  readonly data: Float64Array;
  /**
   * Get the width (number of bins in x direction)
   */
  readonly width: number;
  /**
   * Get the height (number of bins in y direction)
   */
  readonly height: number;
  /**
   * Get the x-axis label
   */
  readonly x_label: string;
  /**
   * Get the y-axis label
   */
  readonly y_label: string;
  /**
   * Get the maximum value in the heatmap
   */
  readonly max_value: number;
  /**
   * Get the minimum value in the heatmap
   */
  readonly min_value: number;
}
/**
 * Heatmap renderer for direct pixel manipulation
 */
export class HeatmapRenderer {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Render a heatmap to an RGBA pixel buffer
   *
   * # Arguments
   * * `pixels` - RGBA pixel buffer (Uint8ClampedArray in JS, length = width * height * 4)
   * * `canvas_width` - Width of the canvas in pixels
   * * `canvas_height` - Height of the canvas in pixels
   * * `data` - Heatmap data values (row-major order)
   * * `data_width` - Width of the data grid
   * * `data_height` - Height of the data grid
   * * `min_value` - Minimum value for color scale
   * * `max_value` - Maximum value for color scale
   *
   * # Color Scale
   * Uses a blue-to-red gradient (cold to hot):
   * - Blue (#1f77b4) for minimum values
   * - Yellow for middle values
   * - Red (#d62728) for maximum values
   */
  render_heatmap(pixels: Uint8Array, canvas_width: number, canvas_height: number, data: Float64Array, data_width: number, data_height: number, min_value: number, max_value: number): void;
  /**
   * Render a heatmap with a custom color scale
   *
   * # Arguments
   * * `pixels` - RGBA pixel buffer
   * * `canvas_width` - Width of the canvas in pixels
   * * `canvas_height` - Height of the canvas in pixels
   * * `data` - Heatmap data values (row-major order)
   * * `data_width` - Width of the data grid
   * * `data_height` - Height of the data grid
   * * `min_value` - Minimum value for color scale
   * * `max_value` - Maximum value for color scale
   * * `color_stops` - Array of RGBA colors as u32 (0xRRGGBBAA)
   *
   * The color_stops array should contain at least 2 colors.
   * Values are interpolated between the stops.
   */
  render_heatmap_custom(pixels: Uint8Array, canvas_width: number, canvas_height: number, data: Float64Array, data_width: number, data_height: number, min_value: number, max_value: number, color_stops: Uint32Array): void;
  /**
   * Render a heatmap with bilinear interpolation for smoother results
   *
   * Same arguments as render_heatmap, but uses bilinear interpolation
   * to blend between data points for smoother gradients.
   */
  render_heatmap_interpolated(pixels: Uint8Array, canvas_width: number, canvas_height: number, data: Float64Array, data_width: number, data_height: number, min_value: number, max_value: number): void;
  /**
   * Create a new HeatmapRenderer
   */
  constructor();
}
/**
 * Virtual array that provides JavaScript-compatible access to table data
 *
 * This abstraction layer allows visualization libraries like D3 to access
 * compressed table data as if it were a regular JavaScript array.
 */
export class VirtualArray {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Get a string value at the specified index
   */
  getString(index: number): string;
  /**
   * Get an integer value at the specified index
   */
  getInteger(index: number): bigint;
  /**
   * Check if this virtual array contains strings
   */
  isStringColumn(): boolean;
  /**
   * Slice the virtual array (returns a new VirtualArray)
   */
  slice(start: number, end: number): VirtualArraySlice;
  /**
   * Create an iterator-like interface for JavaScript
   * Returns a JavaScript object with next() method
   */
  iterator(): VirtualArrayIterator;
  /**
   * Get multiple values as a JavaScript array (for batch operations)
   */
  getRange(start: number, end: number): Array<any>;
  /**
   * Get column statistics for JavaScript consumption
   */
  getStats(): any;
  /**
   * Get a value as JavaScript value (auto-detects type)
   */
  getValue(index: number): any;
  /**
   * Get the length (compatible with JavaScript Array.length)
   */
  readonly length: number;
}
/**
 * Iterator for virtual arrays
 */
export class VirtualArrayIterator {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Get the next value in the iterator
   */
  next(): any;
}
/**
 * Slice of a virtual array
 */
export class VirtualArraySlice {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Convert slice to JavaScript array
   */
  toArray(): Array<any>;
  /**
   * Get a value from the slice
   */
  getValue(index: number): any;
  /**
   * Get the length of the slice
   */
  readonly length: number;
}
/**
 * WASM wrapper for aggregated chart data - optimized for web visualization
 */
export class WasmAggregatedResult {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Get record counts for each group
   * 🔧 MEMORY FIX: Returns Float64Array for counts (5-10x memory savings)
   */
  getCounts(): any;
  /**
   * Get X-axis values as JavaScript array with appropriate types
   * 🔧 MEMORY FIX: Returns TypedArray for numeric data (8 bytes/element vs 40-80 for boxed)
   */
  getXValues(): any;
  /**
   * Get Y-axis values as JavaScript array
   * 🔧 MEMORY FIX: Returns Float64Array for numeric data (5-10x memory savings)
   */
  getYValues(): any;
  /**
   * Get group IDs for color coding (if available)
   * 🔧 MEMORY FIX: Returns Uint32Array for integer IDs (4 bytes/element vs 40-80 for boxed)
   */
  getGroupIds(): any;
  /**
   * Get number of groups in the aggregation
   */
  getGroupCount(): number;
  /**
   * Get group names for color legends (if available)
   */
  getGroupNames(): Array<any> | undefined;
}
/**
 * WASM-accessible chunk wrapper for float chunks
 */
export class WasmFloatChunk {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Get average value in this chunk
   */
  getAvg(): number;
  /**
   * Get maximum value in this chunk
   */
  getMax(): number;
  /**
   * Get minimum value in this chunk
   */
  getMin(): number;
  /**
   * Get sum of all values in this chunk
   */
  getSum(): number;
  /**
   * Extract a range of values from this chunk
   *
   * Returns a Float64Array of values [start, end)
   */
  getRange(start: number, end: number): Float64Array;
  /**
   * Get a single value by index
   */
  getValue(index: number): number;
  /**
   * Get the number of values in this chunk
   */
  readonly len: number;
}
/**
 * WASM-accessible chunk wrapper for integer chunks
 */
export class WasmIntegerChunk {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Get average value in this chunk
   */
  getAvg(): number;
  /**
   * Get maximum value in this chunk
   */
  getMax(): number;
  /**
   * Get minimum value in this chunk
   */
  getMin(): number;
  /**
   * Get sum of all values in this chunk
   */
  getSum(): number;
  /**
   * Extract a range of values from this chunk
   *
   * Returns a Float64Array of values [start, end)
   */
  getRange(start: number, end: number): Float64Array;
  /**
   * Get a single value by index
   *
   * Returns the value as f64 since JavaScript doesn't have i64
   */
  getValue(index: number): number;
  /**
   * Get the number of values in this chunk
   */
  readonly len: number;
}
/**
 * Memory pool manager for WASM environments
 */
export class WasmMemoryManager {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Get a pooled buffer or create a new one
   */
  get_buffer(size_bytes: number): Uint8Array;
  /**
   * Check if we can allocate more memory
   */
  can_allocate(size_bytes: number): boolean;
  /**
   * Return a buffer to the pool for reuse
   */
  return_buffer(buffer: Uint8Array): void;
  /**
   * Get memory statistics
   */
  get_memory_stats(): any;
  /**
   * Get current memory usage in MB
   */
  get_current_usage_mb(): number;
  /**
   * Get memory usage percentage
   */
  get_usage_percentage(): number;
  /**
   * Get current memory usage in bytes
   */
  get_current_usage_bytes(): number;
  /**
   * Create a new memory manager with specified limits
   */
  constructor(max_memory_mb: number);
  /**
   * Force garbage collection and cleanup
   */
  cleanup(): void;
}
/**
 * WASM memory optimization utilities
 */
export class WasmMemoryOptimizer {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Get memory recommendations for a file
   */
  static get_memory_recommendations(file_size_bytes: number): any;
  /**
   * Check if current browser supports optimal processing
   */
  static check_browser_compatibility(): any;
  /**
   * Estimate optimal chunk size for given memory limit
   */
  static calculate_optimal_chunk_size(memory_limit_mb: number, file_size_bytes: number): number;
}
/**
 * Statistics about WebAssembly memory usage
 */
export class WasmMemoryStats {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  readonly total_memory: number;
  readonly active_memory: number;
  readonly pooled_memory: number;
  readonly total_buffers: number;
  readonly active_buffers: number;
  readonly totalMemoryMB: number;
}
/**
 * WASM-compatible progress tracking
 */
export class WasmProgressTracker {
  free(): void;
  [Symbol.dispose](): void;
  constructor(callback?: any | null);
  update(progress: number, message: string): void;
}
/**
 * WASM-compatible schema analyzer
 */
export class WasmSchemaAnalyzer {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Create a chunk-based analyzer for large files
   */
  static chunk_based(chunk_size: number): WasmSchemaAnalyzer;
  /**
   * Create analyzer with full custom configuration
   */
  static with_config(sample_size: number, chunk_size: number | null | undefined, distributed_sampling: boolean, collect_problematic_samples: boolean, max_problematic_samples: number): WasmSchemaAnalyzer;
  /**
   * Create a fast preview analyzer for immediate UI feedback
   */
  static fast_preview(): WasmSchemaAnalyzer;
  /**
   * Create ultra-minimal analyzer for problematic files
   */
  static ultra_minimal(): WasmSchemaAnalyzer;
  /**
   * Create a schema analyzer with custom sample size
   */
  static with_sample_size(sample_size: number): WasmSchemaAnalyzer;
  /**
   * Analyze CSV schema from a file buffer
   */
  analyze_csv_buffer(csv_data: Uint8Array, filename?: string | null): any;
  /**
   * Process CSV with confirmed schema and return actual WasmTable
   * Optionally accepts a JavaScript progress callback function(progress: number, message: string)
   */
  create_table_from_csv(csv_data: Uint8Array, user_config_json: string, progress_callback?: Function | null): WasmTable;
  /**
   * Analyze CSV with a maximum number of rows
   */
  analyze_csv_with_limit(csv_data: Uint8Array, max_rows: number): any;
  /**
   * Analyze a small sample first (for large files)
   */
  analyze_csv_sample_first(csv_data: Uint8Array, sample_size_mb: number): any;
  /**
   * Create analyzer with custom chunk and sample sizes
   */
  static with_chunk_and_sample_size(chunk_size: number, sample_size: number): WasmSchemaAnalyzer;
  /**
   * Process CSV with confirmed user schema
   */
  process_with_confirmed_schema(csv_data: Uint8Array, user_config_json: string): any;
  /**
   * Create memory-optimized analyzer for very large files (>100MB)
   */
  static memory_optimized_for_large_files(): WasmSchemaAnalyzer;
  /**
   * Get recommended configuration for file size
   */
  static get_recommended_config_for_file_size(file_size_bytes: bigint): any;
  /**
   * Create a new schema analyzer optimized for web environments
   */
  constructor();
}
/**
 * Streaming CSV processor for memory-efficient analysis
 */
export class WasmStreamingProcessor {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Get processing progress
   */
  get_progress(): number;
  /**
   * Get current memory statistics
   */
  get_memory_stats(): any;
  /**
   * Process CSV data in chunks
   */
  process_csv_stream(csv_data: Uint8Array, progress_callback?: Function | null): any;
  /**
   * Create a new streaming processor
   */
  constructor(max_memory_mb: number, chunk_size: number);
  /**
   * Force cleanup
   */
  cleanup(): void;
}
/**
 * WASM-accessible chunk wrapper for string chunks
 */
export class WasmStringChunk {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Count occurrences of a specific value
   */
  countValue(target: string): number;
  /**
   * Extract a range of values from this chunk
   *
   * Returns an array of strings [start, end)
   */
  getRange(start: number, end: number): string[];
  /**
   * Get a single value by index
   */
  getValue(index: number): string;
  /**
   * Get the number of values in this chunk
   */
  readonly len: number;
}
export class WasmTable {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Get integer value
   */
  getInteger(column: number, row: number): number;
  /**
   * Get column count
   */
  columnCount(): bigint;
  /**
   * Export table as compressed bytes for download
   */
  saveToBytes(): Uint8Array;
  /**
   * Get column type
   */
  getColumnType(column: number): string;
  /**
   * Create a table from bytes with default WASM strategy (PreferMemory)
   */
  static loadFromBytes(bytes: Uint8Array): WasmTable;
  /**
   * Get column names
   */
  getColumnNames(): Array<any>;
  /**
   * Get entire column as Float64Array (zero-copy for chart rendering)
   *
   * This is 3-5x faster than calling getFloat() in a loop because:
   * - Only 1 WASM boundary crossing instead of N
   * - Returns TypedArray for zero-copy access from JavaScript
   * - Optimized iteration over compressed data
   *
   * # Example (JavaScript)
   * ```javascript
   * // Before: 2M WASM calls for 1M row scatter plot
   * for (let i = 0; i < 1000000; i++) {
   *     const x = table.getFloat(xCol, i);  // WASM call
   *     const y = table.getFloat(yCol, i);  // WASM call
   * }
   *
   * // After: 2 WASM calls
   * const xData = table.getColumnAsFloat64Array(xCol);
   * const yData = table.getColumnAsFloat64Array(yCol);
   * for (let i = 0; i < 1000000; i++) {
   *     const x = xData[i];  // JS array access
   *     const y = yData[i];  // JS array access
   * }
   * ```
   */
  getColumnAsFloat64Array(col_idx: number): Float64Array;
  /**
   * Get entire column as Int32Array (for integer columns)
   *
   * Similar to getColumnAsFloat64Array but returns Int32Array for integer data.
   * Use this when you know the column contains integers and want to save memory.
   */
  getColumnAsInt32Array(col_idx: number): Int32Array;
  /**
   * Get the active Tier1Strategy used by this table
   */
  getTier1Strategy(): string;
  /**
   * High-performance chart aggregation to eliminate 400K+ getValue() calls
   */
  aggregateForChart(x_column: number, y_column?: number | null, color_column?: number | null): WasmAggregatedResult;
  /**
   * Get memory usage in MB
   */
  getMemoryUsageMB(): number;
  /**
   * Get detailed memory usage breakdown (returns JSON string)
   */
  getMemoryUsageDetailed(): string;
  /**
   * Save table to bytes WITHOUT Tier 2 compression (memory-efficient for large CSV parsing)
   *
   * This method is specifically designed for scenarios where memory usage is critical,
   * such as parsing large CSV files in the browser. It applies only Tier 1 compression
   * (bit-packing, FOR encoding, dictionary encoding) and skips Tier 2 compression (LZ4/zstd).
   *
   * **Memory savings**: ~2-3x lower peak memory usage during serialization
   *
   * **When to use**:
   * - Immediately after parsing large CSV files
   * - When you plan to re-compress with Tier 2 later (e.g., before IndexedDB storage)
   *
   * **When NOT to use**:
   * - Final storage (use regular `saveToBytes()` for optimal file size)
   */
  saveToBytesWithoutTier2(): Uint8Array;
  /**
   * Create a table from bytes with explicit strategy control
   * prefer_memory: true = PreferMemory (smaller memory, slower access)
   *               false = PreferSpeed (larger memory, faster access)
   */
  static loadFromBytesWithStrategy(bytes: Uint8Array, prefer_memory: boolean): WasmTable;
  /**
   * Get float value
   */
  getFloat(column: number, row: number): number;
  /**
   * Get a single value from the table (as string representation)
   */
  getValue(column: number, row: number): string;
  /**
   * Get row count
   */
  rowCount(): bigint;
}
/**
 * WASM-compatible user schema configuration
 */
export class WasmUserSchemaConfig {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Get column count
   */
  column_count(): number;
  /**
   * Update a column's selected type
   */
  update_column_type(index: number, new_type: string): void;
  /**
   * Convert to JSON string
   */
  to_json(): string;
  /**
   * Create from JSON string
   */
  static from_json(json_str: string): WasmUserSchemaConfig;
}
/**
 * Utility functions for WASM integration
 */
export class WasmUtils {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Check if a file buffer is likely CSV
   */
  static is_likely_csv(data: Uint8Array): boolean;
  /**
   * Format file size for display
   */
  static format_file_size(bytes: bigint): string;
  /**
   * Check if estimated memory usage is safe for WASM
   */
  static is_memory_usage_safe(estimated_memory_mb: bigint): boolean;
  /**
   * Estimate memory usage for processing a CSV file
   */
  static estimate_memory_usage(file_size_bytes: bigint, estimated_rows: number): bigint;
}
export class WasmVirtualArray {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  getType(): string;
  getValue(_index: number): string;
  readonly length: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_efficientwasmtable_free: (a: number, b: number) => void;
  readonly binTransform: (a: number, b: number, c: any, d: number, e: number, f: number, g: number) => [number, number, number, number];
  readonly calculateOrdinalDomain: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
  readonly calculateQuantitativeDomain: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
  readonly calculateTemporalDomain: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
  readonly calculateTransform: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
  readonly densityTransform: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number, number];
  readonly efficientwasmtable_columnCount: (a: number) => number;
  readonly efficientwasmtable_getBatch: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly efficientwasmtable_getMemoryStats: (a: number) => any;
  readonly efficientwasmtable_rowCount: (a: number) => number;
  readonly filterTransform: (a: number, b: number, c: any) => [number, number, number, number];
  readonly flattenTransform: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
  readonly foldTransform: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number, number];
  readonly loessTransform: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
  readonly lookupTransform: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => [number, number, number, number];
  readonly pivotTransform: (a: number, b: number, c: any) => [number, number, number, number];
  readonly quantileTransform: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
  readonly regressionTransform: (a: number, b: number, c: any) => [number, number, number, number];
  readonly sampleTransform: (a: number, b: number, c: number, d: number, e: bigint) => [number, number, number, number];
  readonly stackTransform: (a: number, b: number, c: any, d: number, e: number, f: number, g: number) => [number, number, number, number];
  readonly windowTransform: (a: number, b: number, c: any, d: number, e: number) => [number, number, number, number];
  readonly __wbg_virtualarray_free: (a: number, b: number) => void;
  readonly __wbg_virtualarrayiterator_free: (a: number, b: number) => void;
  readonly __wbg_virtualarrayslice_free: (a: number, b: number) => void;
  readonly virtualarray_getInteger: (a: number, b: number) => [bigint, number, number];
  readonly virtualarray_getRange: (a: number, b: number, c: number) => [number, number, number];
  readonly virtualarray_getStats: (a: number) => [number, number, number];
  readonly virtualarray_getString: (a: number, b: number) => [number, number, number, number];
  readonly virtualarray_getValue: (a: number, b: number) => [number, number, number];
  readonly virtualarray_isStringColumn: (a: number) => number;
  readonly virtualarray_iterator: (a: number) => [number, number, number];
  readonly virtualarray_length: (a: number) => number;
  readonly virtualarray_slice: (a: number, b: number, c: number) => [number, number, number];
  readonly virtualarrayiterator_next: (a: number) => [number, number, number];
  readonly virtualarrayslice_getValue: (a: number, b: number) => [number, number, number];
  readonly virtualarrayslice_length: (a: number) => number;
  readonly virtualarrayslice_toArray: (a: number) => [number, number, number];
  readonly __wbg_wasmfloatchunk_free: (a: number, b: number) => void;
  readonly __wbg_wasmintegerchunk_free: (a: number, b: number) => void;
  readonly __wbg_wasmmemorymanager_free: (a: number, b: number) => void;
  readonly __wbg_wasmmemoryoptimizer_free: (a: number, b: number) => void;
  readonly __wbg_wasmstreamingprocessor_free: (a: number, b: number) => void;
  readonly __wbg_wasmstringchunk_free: (a: number, b: number) => void;
  readonly deserializeDateTimeChunk: (a: number, b: number) => [number, number, number];
  readonly deserializeFloatChunk: (a: number, b: number) => [number, number, number];
  readonly deserializeIntegerChunk: (a: number, b: number) => [number, number, number];
  readonly deserializeStringChunk: (a: number, b: number) => [number, number, number];
  readonly wasmfloatchunk_getAvg: (a: number) => number;
  readonly wasmfloatchunk_getMax: (a: number) => number;
  readonly wasmfloatchunk_getMin: (a: number) => number;
  readonly wasmfloatchunk_getRange: (a: number, b: number, c: number) => [number, number, number, number];
  readonly wasmfloatchunk_getSum: (a: number) => number;
  readonly wasmfloatchunk_getValue: (a: number, b: number) => [number, number, number];
  readonly wasmfloatchunk_len: (a: number) => number;
  readonly wasmintegerchunk_getAvg: (a: number) => number;
  readonly wasmintegerchunk_getMax: (a: number) => number;
  readonly wasmintegerchunk_getMin: (a: number) => number;
  readonly wasmintegerchunk_getRange: (a: number, b: number, c: number) => [number, number, number, number];
  readonly wasmintegerchunk_getSum: (a: number) => number;
  readonly wasmintegerchunk_getValue: (a: number, b: number) => [number, number, number];
  readonly wasmintegerchunk_len: (a: number) => number;
  readonly wasmmemorymanager_can_allocate: (a: number, b: number) => number;
  readonly wasmmemorymanager_cleanup: (a: number) => void;
  readonly wasmmemorymanager_get_buffer: (a: number, b: number) => [number, number];
  readonly wasmmemorymanager_get_current_usage_bytes: (a: number) => number;
  readonly wasmmemorymanager_get_current_usage_mb: (a: number) => number;
  readonly wasmmemorymanager_get_memory_stats: (a: number) => any;
  readonly wasmmemorymanager_get_usage_percentage: (a: number) => number;
  readonly wasmmemorymanager_new: (a: number) => number;
  readonly wasmmemorymanager_return_buffer: (a: number, b: number, c: number) => void;
  readonly wasmmemoryoptimizer_calculate_optimal_chunk_size: (a: number, b: number) => number;
  readonly wasmmemoryoptimizer_check_browser_compatibility: () => any;
  readonly wasmmemoryoptimizer_get_memory_recommendations: (a: number) => any;
  readonly wasmstreamingprocessor_cleanup: (a: number) => void;
  readonly wasmstreamingprocessor_get_memory_stats: (a: number) => any;
  readonly wasmstreamingprocessor_get_progress: (a: number) => number;
  readonly wasmstreamingprocessor_new: (a: number, b: number) => number;
  readonly wasmstreamingprocessor_process_csv_stream: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly wasmstringchunk_countValue: (a: number, b: number, c: number) => number;
  readonly wasmstringchunk_getRange: (a: number, b: number, c: number) => [number, number, number, number];
  readonly wasmstringchunk_getValue: (a: number, b: number) => [number, number, number, number];
  readonly wasmstringchunk_len: (a: number) => number;
  readonly init_memory_management: () => void;
  readonly __wbg_wasmaggregatedresult_free: (a: number, b: number) => void;
  readonly __wbg_wasmtable_free: (a: number, b: number) => void;
  readonly __wbg_wasmvirtualarray_free: (a: number, b: number) => void;
  readonly aggregateChunk: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number) => [number, number, number];
  readonly aggregateForChart: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
  readonly aggregateForChartParallel: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number) => [number, number, number];
  readonly aggregateForChartTyped: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number) => [number, number, number];
  readonly aggregateLazy: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
  readonly decompressLZ4: (a: number, b: number) => [number, number, number];
  readonly decompressZSTD: (a: number, b: number) => [number, number, number];
  readonly extractChunk: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly getMemoryStats: () => number;
  readonly getRawColumns: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
  readonly getWasmLinearMemoryMB: () => number;
  readonly parseChunkMetadata: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly parseMetadata: (a: number, b: number) => [number, number, number, number];
  readonly parseMetadataWithStats: (a: number, b: number) => [number, number, number, number];
  readonly wasmaggregatedresult_getCounts: (a: number) => any;
  readonly wasmaggregatedresult_getGroupCount: (a: number) => number;
  readonly wasmaggregatedresult_getGroupIds: (a: number) => any;
  readonly wasmaggregatedresult_getGroupNames: (a: number) => any;
  readonly wasmaggregatedresult_getXValues: (a: number) => any;
  readonly wasmaggregatedresult_getYValues: (a: number) => any;
  readonly wasmtable_aggregateForChart: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly wasmtable_columnCount: (a: number) => bigint;
  readonly wasmtable_getColumnAsFloat64Array: (a: number, b: number) => any;
  readonly wasmtable_getColumnAsInt32Array: (a: number, b: number) => any;
  readonly wasmtable_getColumnNames: (a: number) => any;
  readonly wasmtable_getColumnType: (a: number, b: number) => [number, number];
  readonly wasmtable_getFloat: (a: number, b: number, c: number) => number;
  readonly wasmtable_getInteger: (a: number, b: number, c: number) => number;
  readonly wasmtable_getMemoryUsageDetailed: (a: number) => [number, number];
  readonly wasmtable_getMemoryUsageMB: (a: number) => number;
  readonly wasmtable_getTier1Strategy: (a: number) => [number, number];
  readonly wasmtable_getValue: (a: number, b: number, c: number) => [number, number];
  readonly wasmtable_loadFromBytes: (a: number, b: number) => [number, number, number];
  readonly wasmtable_loadFromBytesWithStrategy: (a: number, b: number, c: number) => [number, number, number];
  readonly wasmtable_rowCount: (a: number) => bigint;
  readonly wasmtable_saveToBytes: (a: number) => [number, number, number];
  readonly wasmtable_saveToBytesWithoutTier2: (a: number) => [number, number, number];
  readonly wasmvirtualarray_getType: (a: number) => [number, number];
  readonly wasmvirtualarray_getValue: (a: number, b: number) => [number, number];
  readonly wasmvirtualarray_length: (a: number) => number;
  readonly __wbg_heatmapdata_free: (a: number, b: number) => void;
  readonly __wbg_heatmaprenderer_free: (a: number, b: number) => void;
  readonly aggregateForHeatmap: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number) => [number, number, number];
  readonly heatmapdata_data: (a: number) => [number, number];
  readonly heatmapdata_get: (a: number, b: number, c: number) => [number, number];
  readonly heatmapdata_height: (a: number) => number;
  readonly heatmapdata_max_value: (a: number) => number;
  readonly heatmapdata_min_value: (a: number) => number;
  readonly heatmapdata_value_label: (a: number) => [number, number];
  readonly heatmapdata_width: (a: number) => number;
  readonly heatmapdata_x_bin_edges: (a: number) => [number, number];
  readonly heatmapdata_x_label: (a: number) => [number, number];
  readonly heatmapdata_y_bin_edges: (a: number) => [number, number];
  readonly heatmapdata_y_label: (a: number) => [number, number];
  readonly heatmaprenderer_render_heatmap: (a: number, b: number, c: number, d: any, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number) => void;
  readonly heatmaprenderer_render_heatmap_custom: (a: number, b: number, c: number, d: any, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number) => void;
  readonly heatmaprenderer_render_heatmap_interpolated: (a: number, b: number, c: number, d: any, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number) => void;
  readonly heatmaprenderer_new: () => number;
  readonly compress_brotli_1: (a: number, b: number) => [number, number, number, number];
  readonly compress_brotli_2: (a: number, b: number) => [number, number, number, number];
  readonly compress_brotli_3: (a: number, b: number) => [number, number, number, number];
  readonly compress_brotli_4: (a: number, b: number) => [number, number, number, number];
  readonly compress_brotli_5: (a: number, b: number) => [number, number, number, number];
  readonly compress_brotli_6: (a: number, b: number) => [number, number, number, number];
  readonly compress_brotli_7: (a: number, b: number) => [number, number, number, number];
  readonly compress_brotli_8: (a: number, b: number) => [number, number, number, number];
  readonly compress_brotli_9: (a: number, b: number) => [number, number, number, number];
  readonly compress_lz4: (a: number, b: number) => [number, number, number, number];
  readonly decompress_brotli: (a: number, b: number) => [number, number, number, number];
  readonly decompress_lz4: (a: number, b: number) => [number, number, number, number];
  readonly decompress_zstd: (a: number, b: number) => [number, number, number, number];
  readonly get_test_data_path: () => [number, number];
  readonly get_wasm_memory_pages: () => number;
  readonly verify_data: (a: number, b: number, c: number, d: number) => number;
  readonly init_tier2_test: () => void;
  readonly __wbg_wasmprogresstracker_free: (a: number, b: number) => void;
  readonly __wbg_wasmschemaanalyzer_free: (a: number, b: number) => void;
  readonly __wbg_wasmuserschemaconfig_free: (a: number, b: number) => void;
  readonly __wbg_wasmutils_free: (a: number, b: number) => void;
  readonly aggregate: (a: number, b: any) => [number, number, number];
  readonly wasmprogresstracker_new: (a: number) => number;
  readonly wasmprogresstracker_update: (a: number, b: number, c: number, d: number) => void;
  readonly wasmschemaanalyzer_analyze_csv_buffer: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
  readonly wasmschemaanalyzer_analyze_csv_sample_first: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly wasmschemaanalyzer_analyze_csv_with_limit: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly wasmschemaanalyzer_chunk_based: (a: number) => number;
  readonly wasmschemaanalyzer_create_table_from_csv: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number];
  readonly wasmschemaanalyzer_fast_preview: () => number;
  readonly wasmschemaanalyzer_get_recommended_config_for_file_size: (a: bigint) => any;
  readonly wasmschemaanalyzer_memory_optimized_for_large_files: () => number;
  readonly wasmschemaanalyzer_new: () => number;
  readonly wasmschemaanalyzer_process_with_confirmed_schema: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
  readonly wasmschemaanalyzer_ultra_minimal: () => number;
  readonly wasmschemaanalyzer_with_chunk_and_sample_size: (a: number, b: number) => number;
  readonly wasmschemaanalyzer_with_config: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly wasmschemaanalyzer_with_sample_size: (a: number) => number;
  readonly wasmuserschemaconfig_column_count: (a: number) => number;
  readonly wasmuserschemaconfig_from_json: (a: number, b: number) => [number, number, number];
  readonly wasmuserschemaconfig_to_json: (a: number) => [number, number, number, number];
  readonly wasmuserschemaconfig_update_column_type: (a: number, b: number, c: number, d: number) => [number, number];
  readonly wasmutils_estimate_memory_usage: (a: bigint, b: number) => bigint;
  readonly wasmutils_format_file_size: (a: bigint) => [number, number];
  readonly wasmutils_is_likely_csv: (a: number, b: number) => number;
  readonly wasmutils_is_memory_usage_safe: (a: bigint) => number;
  readonly __wbg_wasmmemorystats_free: (a: number, b: number) => void;
  readonly wasmmemorystats_active_buffers: (a: number) => number;
  readonly wasmmemorystats_active_memory: (a: number) => number;
  readonly wasmmemorystats_pooled_memory: (a: number) => number;
  readonly wasmmemorystats_totalMemoryMB: (a: number) => number;
  readonly wasmmemorystats_total_buffers: (a: number) => number;
  readonly wasmmemorystats_total_memory: (a: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __externref_drop_slice: (a: number, b: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
