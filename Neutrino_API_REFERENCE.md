# API Reference

Complete reference for Neutrino's public API. All examples include error handling.

## Table of Contents

- [Rust API](#rust-api)
  - [Core Types](#core-types)
  - [TableBuilder](#tablebuilder)
  - [Table](#table)
  - [ColumnIndices](#columnindices)
  - [Schema](#schema)
- [WebAssembly API](#webassembly-api)
  - [WasmTable](#wasmtable)
  - [Metadata Functions](#metadata-functions)
  - [Aggregation Functions](#aggregation-functions)
  - [Memory Management](#memory-management)

---

# Rust API

## Core Types

### TableBuilder

The builder for loading CSV files with automatic type detection.

```rust
use neutrino::table::TableBuilder;
use std::path::Path;
```

#### Loading CSV Data

```rust
// From CSV file
pub fn from_csv_file(csv_path: &Path)
    -> Result<(Table, ColumnIndices, CsvLoadingSummary), TableError>

// From CSV file with progress tracking
pub fn from_csv_file_with_progress<C: ProgressCallback>(
    csv_path: &Path,
    callback: C
) -> Result<(Table, ColumnIndices, CsvLoadingSummary), TableError>

// From CSV content in memory
pub fn from_csv_content(
    csv_content: &[u8],
    max_rows: Option<usize>
) -> Result<(Table, ColumnIndices, CsvLoadingSummary), TableError>

// Examples
let (table, indices, summary) = TableBuilder::from_csv_file(Path::new("data.csv"))?;
println!("{}", summary.summary_message());
```

### Table

The main interface for working with loaded data.

```rust
use neutrino::table::Table;
use std::path::Path;
```

#### Loading Data

```rust
// From compressed file
pub fn load_from_file<P: AsRef<Path>>(path: P) -> Result<Table, TableError>

// Example
let table = Table::load_from_file(Path::new("data.ntro"))?;
```

#### Saving Data

```rust
// Basic save
pub fn save_to_file<P: AsRef<Path>>(&self, path: P) -> Result<(), TableError>

// Save with metadata
pub fn save_to_file_with_metadata<P: AsRef<Path>>(&self, path: P)
    -> Result<SaveMetadata, TableError>

// Examples
table.save_to_file(Path::new("output.ntro"))?;
let metadata = table.save_to_file_with_metadata(Path::new("output.ntro"))?;
println!("Compression: {:.1}%", metadata.compression_percentage());
```

#### Table Information

```rust
// Size and structure
pub fn row_count(&self) -> usize              // Number of rows
pub fn column_count(&self) -> usize           // Number of columns
pub fn is_empty(&self) -> bool                // True if no rows
pub fn memory_usage_mb(&self) -> f64          // Memory usage in MB

// Schema access
pub fn schema(&self) -> &Schema               // Get schema

// Examples
println!("{} rows × {} columns", table.row_count(), table.column_count());
```

#### Data Access

```rust
// By column index and row index
pub fn get_string(&self, column_index: usize, row: usize) -> Result<String, TableError>
pub fn get_integer(&self, column_index: usize, row: usize) -> Result<i64, TableError>
pub fn get_float(&self, column_index: usize, row: usize) -> Result<f64, TableError>
pub fn get_datetime(&self, column_index: usize, row: usize) -> Result<i64, TableError>

// Examples (using indices from TableBuilder)
let (table, indices, _) = TableBuilder::from_csv_file(Path::new("data.csv"))?;
let name_idx = indices.get("name")?;
let age_idx = indices.get("age")?;

let name = table.get_string(name_idx, 0)?;
let age = table.get_integer(age_idx, 0)?;
```

### ColumnIndices

Mapping between column names and indices, returned by TableBuilder.

```rust
impl ColumnIndices {
    // Get column index by name
    pub fn get(&self, name: &str) -> Result<usize, TableError>

    // Get column name by index
    pub fn name(&self, index: usize) -> Result<&str, TableError>

    // Get all column names
    pub fn names(&self) -> &[String]

    // Number of columns
    pub fn len(&self) -> usize

    // Iterate over (name, index) pairs
    pub fn iter(&self) -> impl Iterator<Item = (&str, usize)>
}

// Example
let name_idx = indices.get("customer_name")?;
let col_name = indices.name(0)?;
```

### DataType

Represents the data type of a column.

```rust
#[derive(Debug, Clone, PartialEq)]
pub enum DataType {
    String,
    Integer,
    Float,
    DateTime,
}

// Access via schema
let data_type = table.schema().column_type(column_index);
```

### SaveMetadata

Information about the compression results.

```rust
impl SaveMetadata {
    pub fn original_size_bytes(&self) -> u64
    pub fn compressed_size_bytes(&self) -> u64
    pub fn original_size_mb(&self) -> f64
    pub fn compressed_size_mb(&self) -> f64
    pub fn compression_percentage(&self) -> f64  // Percentage of original size
    pub fn compression_ratio(&self) -> f64       // Original / compressed
    pub fn save_time_ms(&self) -> u64
}

// Example
let metadata = table.save_to_file_with_metadata("data.ntro")?;
println!("Saved {:.1} MB as {:.1} MB ({:.1}% of original)",
         metadata.original_size_mb(),
         metadata.compressed_size_mb(),
         metadata.compression_percentage());
```

## Progress Tracking

### ProgressCallback

Implement custom progress tracking for CSV loading:

```rust
use neutrino::progress::{ProgressCallback, ProgressStage};
use neutrino::table::TableBuilder;
use std::path::Path;

struct MyProgress;

impl ProgressCallback for MyProgress {
    fn on_progress(&self, stage: ProgressStage, current: usize, total: usize) {
        println!("{:?}: {}/{}", stage, current, total);
    }

    fn on_stage_complete(&self, stage: ProgressStage) {
        println!("{:?} complete!", stage);
    }

    fn should_cancel(&self) -> bool {
        false  // Return true to cancel loading
    }
}

let (table, indices, summary) = TableBuilder::from_csv_file_with_progress(
    Path::new("data.csv"),
    MyProgress
)?;
```

## Error Handling

### TableError

All operations return `Result<T, TableError>`.

```rust
use neutrino::error::TableError;
use neutrino::table::TableBuilder;
use std::path::Path;

match TableBuilder::from_csv_file(Path::new("data.csv")) {
    Ok((table, indices, summary)) => {
        println!("Success! {}", summary.summary_message());
    }
    Err(TableError::IoError(e)) => {
        println!("File error: {}", e);
    }
    Err(TableError::CsvError(e)) => {
        println!("CSV parsing error: {}", e);
    }
    Err(TableError::RowIndexOutOfBounds { index, max }) => {
        println!("Row index {} out of bounds (max {})", index, max);
    }
    Err(TableError::ColumnIndexOutOfBounds { index, max }) => {
        println!("Column index {} out of bounds (max {})", index, max);
    }
    Err(TableError::TypeMismatch { expected, actual }) => {
        println!("Expected {}, got {}", expected, actual);
    }
    Err(e) => println!("Other error: {}", e),
}
```

## Advanced Features

### Memory Management

```rust
// Monitor memory usage
println!("Current memory usage: {:.1} MB", table.memory_usage_mb());
```

### WebAssembly Support

Neutrino works in browsers with WebAssembly. See the [WASM Integration Guide](../guides/WASM_INTEGRATION_GUIDE.md) for details.

## Performance Best Practices

### 1. Use Column Indices from TableBuilder
```rust
// TableBuilder returns indices - use them!
let (table, indices, _) = TableBuilder::from_csv_file(Path::new("data.csv"))?;

// Fast: use indices directly
let name_idx = indices.get("name")?;
for row in 0..table.row_count() {
    let name = table.get_string(name_idx, row)?;
}
```

### 2. Save Compressed Files
```rust
// Load CSV once, save as .ntro for faster future loads
let (table, _, _) = TableBuilder::from_csv_file(Path::new("data.csv"))?;
table.save_to_file(Path::new("data.ntro"))?;

// Future loads are 10-50x faster
let table = Table::load_from_file(Path::new("data.ntro"))?;
```

### 3. Monitor Memory Usage
```rust
// Check memory usage
println!("Memory: {:.1} MB", table.memory_usage_mb());
```

## Examples

### Complete CSV Processing Example

```rust
use neutrino::table::{TableBuilder, Table};
use neutrino::progress::ProgressCallback;
use std::path::Path;

struct MyProgress;
impl ProgressCallback for MyProgress {
    fn on_progress(&self, stage: neutrino::progress::ProgressStage, current: usize, total: usize) {
        println!("{:?}: {}/{}", stage, current, total);
    }
    fn on_stage_complete(&self, _stage: neutrino::progress::ProgressStage) {}
    fn should_cancel(&self) -> bool { false }
}

fn process_sales_data() -> Result<(), Box<dyn std::error::Error>> {
    // Load with progress
    let (table, indices, summary) = TableBuilder::from_csv_file_with_progress(
        Path::new("sales.csv"),
        MyProgress
    )?;

    // Basic info
    println!("Loaded {} rows with {} columns", table.row_count(), table.column_count());
    println!("{}", summary.summary_message());

    // Find high-value sales
    let amount_idx = indices.get("amount")?;
    let customer_idx = indices.get("customer")?;

    let mut high_value_sales = Vec::new();
    for row in 0..table.row_count() {
        let amount = table.get_float(amount_idx, row)?;
        if amount > 1000.0 {
            let customer = table.get_string(customer_idx, row)?;
            high_value_sales.push((customer, amount));
        }
    }

    println!("Found {} high-value sales", high_value_sales.len());

    // Save compressed result
    let metadata = table.save_to_file_with_metadata(Path::new("sales_processed.ntro"))?;
    println!("Saved with {:.1}% compression", metadata.compression_percentage());

    Ok(())
}
```

## Error Handling

All functions return `Result<T, TableError>` for proper error handling.

```rust
use neutrino::error::TableError;

match table.get_integer(col_idx, row) {
    Ok(value) => println!("Value: {}", value),
    Err(TableError::ColumnNotFound(msg)) => eprintln!("Column error: {}", msg),
    Err(TableError::RowOutOfBounds { row, max }) => {
        eprintln!("Row {} out of bounds (max: {})", row, max)
    }
    Err(e) => eprintln!("Other error: {}", e),
}
```

---

# WebAssembly API

The WebAssembly API provides JavaScript/TypeScript bindings for using Neutrino in web browsers.

## WasmTable

Main interface for working with Neutrino tables in the browser.

### Loading Data

#### loadFromBytes()

Load a table from .ntro file bytes with default memory-optimized strategy.

```typescript
static loadFromBytes(bytes: Uint8Array): WasmTable

// Example
const response = await fetch('data.ntro');
const arrayBuffer = await response.arrayBuffer();
const bytes = new Uint8Array(arrayBuffer);

const table = WasmTable.loadFromBytes(bytes);
console.log(`Loaded ${table.rowCount()} rows`);
```

**Memory Strategy**: Uses `PreferMemory` by default (keeps FSST compression in Tier-1 for 25-40% memory savings).

#### loadFromBytesWithStrategy()

Load with explicit memory/speed trade-off control.

```typescript
static loadFromBytesWithStrategy(
  bytes: Uint8Array,
  preferMemory: boolean
): WasmTable

// Example - Optimize for memory (smaller, slower access)
const table = WasmTable.loadFromBytesWithStrategy(bytes, true);

// Example - Optimize for speed (larger, faster access)
const table = WasmTable.loadFromBytesWithStrategy(bytes, false);
```

**Parameters**:
- `preferMemory: true` → PreferMemory strategy (25-40% less memory, slightly slower)
- `preferMemory: false` → PreferSpeed strategy (more memory, faster access)

### Table Information

```typescript
// Get dimensions
rowCount(): number
columnCount(): number
getColumnNames(): string[]
getColumnType(column: number): string

// Get memory usage
getMemoryUsageMB(): number

// Example
console.log(`Table: ${table.rowCount()} × ${table.columnCount()}`);
console.log(`Memory: ${table.getMemoryUsageMB().toFixed(1)} MB`);
console.log(`Columns: ${table.getColumnNames().join(', ')}`);
```

### Data Access

```typescript
// Get cell values
getValue(column: number, row: number): string
getInteger(column: number, row: number): number
getFloat(column: number, row: number): number

// Example - Access first 10 rows
for (let row = 0; row < 10; row++) {
  const name = table.getValue(0, row);
  const age = table.getInteger(1, row);
  const price = table.getFloat(2, row);
  console.log(`${name}, ${age}, $${price}`);
}
```

### Saving Data

```typescript
saveToBytes(): Uint8Array

// Example - Export table for download
const bytes = table.saveToBytes();
const blob = new Blob([bytes], { type: 'application/octet-stream' });
const url = URL.createObjectURL(blob);

const a = document.createElement('a');
a.href = url;
a.download = 'data.ntro';
a.click();
```

---

## Metadata Functions

Parse file metadata without loading the full table into memory.

### parseMetadata()

Get basic schema information (fast, lightweight).

```typescript
function parseMetadata(bytes: Uint8Array): string

// Returns JSON string
interface Metadata {
  rowCount: number;
  columnCount: number;
  columns: Array<{
    name: string;
    type: 'Integer' | 'Float' | 'String' | 'DateTime';
    chunkCount: number;
  }>;
  estimatedMemoryMB: number;
}

// Example
const fileBytes = await loadFromIndexedDB('dataset-id');
const metadataJson = parseMetadata(fileBytes);
const metadata = JSON.parse(metadataJson);

console.log(`Dataset: ${metadata.rowCount} rows, ${metadata.columnCount} columns`);
console.log(`Estimated memory: ${metadata.estimatedMemoryMB.toFixed(1)} MB`);

metadata.columns.forEach(col => {
  console.log(`  ${col.name}: ${col.type} (${col.chunkCount} chunks)`);
});
```

**Use Case**: Display dataset info before loading, check memory requirements.

### parseMetadataWithStats()

Get detailed statistics by scanning chunk headers (still lightweight).

```typescript
function parseMetadataWithStats(bytes: Uint8Array): string

// Returns JSON string with additional statistics
interface MetadataWithStats extends Metadata {
  columns: Array<{
    name: string;
    type: string;
    chunkCount: number;
    minValue?: number | string;
    maxValue?: number | string;
    meanValue?: number;
    cardinality?: number;  // For string columns
  }>;
}

// Example
const metadataJson = parseMetadataWithStats(fileBytes);
const metadata = JSON.parse(metadataJson);

metadata.columns.forEach(col => {
  console.log(`${col.name} (${col.type}):`);
  if (col.minValue !== undefined) {
    console.log(`  Range: ${col.minValue} - ${col.maxValue}`);
  }
  if (col.meanValue !== undefined) {
    console.log(`  Mean: ${col.meanValue.toFixed(2)}`);
  }
  if (col.cardinality !== undefined) {
    console.log(`  Unique values: ${col.cardinality}`);
  }
});
```

**Use Case**: Show data preview, validate ranges, detect categorical columns.

---

## Aggregation Functions

Memory-efficient aggregation for chart visualization.

### aggregateForChartTyped() ⭐ Recommended

Single-call aggregation that returns typed arrays for maximum memory efficiency.

```typescript
function aggregateForChartTyped(
  bytes: Uint8Array,
  xColumn: number,
  yColumn: number | null,
  colorColumn: number | null,
  aggregation?: 'sum' | 'mean' | 'count' | 'min' | 'max'
): ChartDataTyped

interface ChartDataTyped {
  xType: 'categorical' | 'date' | 'numeric';
  xLabel: string;
  yLabel: string;
  totalValue: number;
  numCategories: number;
  numSeries: number;

  // Typed arrays (efficient, zero-copy when possible)
  x_values: Float64Array;
  y_values: Float64Array;
  counts: Uint32Array;
  group_ids: Uint32Array;
  group_names: string[];
}

// Example - Memory-efficient chart aggregation
const fileBytes = await chunkedPersister.getFileBytes(datasetId);

const chartData = aggregateForChartTyped(
  fileBytes,
  0,      // X column
  1,      // Y column (or null for count)
  2,      // Color/group column (or null)
  'sum'   // Aggregation type
);

console.log(`Aggregated ${chartData.x_values.length} points`);
console.log(`X type: ${chartData.xType}`);

// Render with D3/canvas
for (let i = 0; i < chartData.x_values.length; i++) {
  const x = chartData.x_values[i];
  const y = chartData.y_values[i];
  const group = chartData.group_names[chartData.group_ids[i]];
  // ... render point
}
```

**Memory Impact**:
- Loads only required columns (~20-50 MB peak)
- Returns typed arrays (~0.2-2 MB)
- Drops temporary data immediately
- Memory plateaus (no monotonic growth)

**Use Case**: Production web apps with repeated chart updates (signal-web pattern).

### aggregateForChart()

Returns JavaScript objects (less efficient than typed arrays).

```typescript
function aggregateForChart(
  bytes: Uint8Array,
  xColumn: number,
  yColumn: number | null,
  colorColumn: number | null
): ChartData

interface ChartData {
  points: Array<{
    x: string | number;
    y: number;
    group?: string;
  }>;
  xLabel: string;
  yLabel: string;
  xType: 'categorical' | 'date' | 'numeric';
  totalValue: number;
  numCategories: number;
  numSeries: number;
}

// Example
const chartData = aggregateForChart(fileBytes, 0, 1, null);

chartData.points.forEach(point => {
  console.log(`(${point.x}, ${point.y})`);
});
```

**Note**: Use `aggregateForChartTyped()` instead for better memory efficiency.

### aggregateLazy()

Returns WasmAggregatedResult with getter methods.

```typescript
function aggregateLazy(
  bytes: Uint8Array,
  xColumn: number,
  yColumn: number | null,
  colorColumn: number | null
): WasmAggregatedResult

class WasmAggregatedResult {
  getXValues(): number[] | string[]
  getYValues(): number[]
  getCounts(): number[]
  getGroupIds(): number[] | null
  getGroupNames(): string[] | null
}

// Example
const result = aggregateLazy(fileBytes, 0, 1, null);
const xValues = result.getXValues();
const yValues = result.getYValues();
```

**Note**: Use `aggregateForChartTyped()` for better performance.

---

## Memory Management

### Understanding WASM Memory

WebAssembly uses linear memory that:
- Grows in 64KB pages
- Does NOT automatically shrink
- Requires explicit `.free()` calls for cleanup

### Best Practices

#### 1. Free Tables When Done

```typescript
// Load and process
const table = WasmTable.loadFromBytes(bytes);
processData(table);

// Free WASM memory
table.free();
```

#### 2. Use Aggregation Functions Instead of Full Load

❌ **Bad** - Loads entire table:
```typescript
const table = WasmTable.loadFromBytes(fileBytes);  // 700 MB!
const result = table.aggregateForChart(0, 1, null);
table.free();
```

✅ **Good** - Loads only needed columns:
```typescript
const chartData = aggregateForChartTyped(fileBytes, 0, 1, null);  // 20-50 MB peak
```

#### 3. Monitor Memory Usage

```typescript
// Check JS heap
const jsHeap = (performance as any).memory?.usedJSHeapSize;
console.log(`JS heap: ${(jsHeap / 1024 / 1024).toFixed(1)} MB`);

// Check WASM linear memory
const wasmMB = getWasmLinearMemoryMB();  // Custom function
console.log(`WASM linear: ${wasmMB.toFixed(1)} MB`);

// Check table memory
const tableMB = table.getMemoryUsageMB();
console.log(`Table: ${tableMB.toFixed(1)} MB`);
```

#### 4. Use IndexedDB for Persistence

```typescript
// Store file in IndexedDB (not in React state)
const datasetId = await chunkedPersister.importDataset(name, file);

// Load from IndexedDB for each operation
const fileBytes = await chunkedPersister.getFileBytes(datasetId);
const chartData = aggregateForChartTyped(fileBytes, x, y, color);
```

### Memory Plateau Behavior

With proper patterns, memory plateaus after first large operation:

```
First render:  JS 25 MB → 27 MB, WASM 18 MB → 48 MB
Second render: JS 27 MB → 27 MB, WASM 48 MB → 48 MB  ← Plateau
Third render:  JS 27 MB → 27 MB, WASM 48 MB → 48 MB  ← Stable
```

**Key**: Use typed arrays, avoid React state copies, reuse buffers.

---

## Complete Example

```typescript
import { initializeNeutrinoWasm } from './lib/wasm-loader';
import { chunkedPersister } from './lib/storage/chunked-persister';
import { aggregateForChartTyped, parseMetadata } from './wasm/neutrino';

// 1. Initialize WASM (once at app startup)
await initializeNeutrinoWasm();

// 2. Import dataset to IndexedDB
const file = await selectFile();
const datasetId = await chunkedPersister.importDataset(file.name, file);

// 3. Parse metadata (lightweight)
const fileBytes = await chunkedPersister.getFileBytes(datasetId);
const metadataJson = parseMetadata(fileBytes);
const metadata = JSON.parse(metadataJson);

console.log(`Dataset: ${metadata.rowCount} rows`);
console.log(`Estimated memory: ${metadata.estimatedMemoryMB} MB`);

// 4. Aggregate for chart (memory-efficient)
const chartData = aggregateForChartTyped(
  fileBytes,
  0,      // X column
  1,      // Y column
  null,   // No color grouping
  'sum'   // Aggregation type
);

// 5. Render chart
renderCanvasChart(container, chartData, 800, 400);

// Memory automatically managed - no explicit free() needed
// for aggregation functions (they handle cleanup internally)
```

---

## See Also

- **[Web Application Guide](../guides/WEB_APPLICATION_GUIDE.md)** - Complete production patterns
- **[WASM Integration Guide](../guides/WASM_INTEGRATION_GUIDE.md)** - Setup and integration
- **[Memory Architecture](../architecture/WASM_MEMORY_AND_LEAK_PREVENTION.md)** - Deep dive