# Neutrino API Documentation

A high-performance columnar data storage library with unified architecture, designed for memory efficiency and predictable performance. Available for both Rust and WebAssembly (browser) environments.

**✅ LATEST UPDATE (2025-01)**:
- ✅ **WebAssembly Production Ready**: Memory-efficient WASM bindings with typed arrays
- ✅ **Memory Plateau Behavior**: Proper buffer reuse eliminates memory leaks
- ✅ **IndexedDB Integration**: Persistent storage for web applications
- ✅ **Lazy Aggregation**: Load only required columns for chart rendering
- ✅ **File Format**: `.ntro` format with two-tier compression
- ✅ **DateTime Support**: Full DateTime column serialization and deserialization
- ⚠️ **IMPORTANT**: Old `.ntro` files must be regenerated as `.ntro` format

## 🚀 Quick Start

### Rust

```rust
use neutrino::table::Table;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load any .ntro file with unified API
    let table = Table::load_from_file("data.ntro")?;

    println!("Loaded {} rows, {} columns", table.row_count(), table.column_count());

    // Access data with unified methods
    let id = table.get_integer(0, 0)?;      // Get integer from column 0, row 0
    let name = table.get_string(1, 0)?;     // Get string from column 1, row 0
    let price = table.get_float(2, 0)?;     // Get float from column 2, row 0
    let timestamp = table.get_datetime(3, 0)?; // Get datetime from column 3, row 0

    println!("Row 0: ID={}, Name='{}', Price={}, Time={}", id, name, price, timestamp);

    Ok(())
}
```

### WebAssembly (Browser)

```typescript
import { initializeNeutrinoWasm } from './lib/wasm-loader';
import { aggregateForChartTyped, parseMetadata } from './wasm/neutrino';

// Initialize WASM
await initializeNeutrinoWasm();

// Load file bytes (from IndexedDB, fetch, etc.)
const fileBytes = await loadFileBytes();

// Parse metadata (lightweight)
const metadata = JSON.parse(parseMetadata(fileBytes));
console.log(`Dataset: ${metadata.rowCount} rows`);

// Aggregate for chart (memory-efficient)
const chartData = aggregateForChartTyped(
  fileBytes,
  0,      // X column
  1,      // Y column
  null,   // Color column
  'sum'   // Aggregation type
);

// Render chart
renderChart(chartData);
```

## 🎯 Key Features

### Rust API
- ✅ **Unified API**: Single `Table` type for all use cases
- ✅ **Memory-Efficient Architecture**: Two-tier compression (Tier 2 → Tier 1)
- ✅ **Type-Safe Access**: `get_integer()`, `get_string()`, `get_float()`, `get_datetime()`
- ✅ **Robust Compression**: Integer BitPacking, FrameOfReference, Dictionary, FSST
- ✅ **CSV Import**: Automatic type detection and conversion

### WebAssembly API
- ✅ **Memory Plateau**: Proper buffer reuse eliminates memory leaks
- ✅ **Typed Arrays**: Zero-copy data transfer (Float64Array, Uint32Array)
- ✅ **Lazy Loading**: Load only required columns for aggregation
- ✅ **Metadata Parsing**: Inspect files without loading full data
- ✅ **IndexedDB Ready**: Designed for browser persistence

## 📊 Compression Features

- **Automatic Bit-Packing**: Integers compressed based on their range (7 bits for 0-99, 10 bits for 0-999)
- **Dictionary Compression**: Strings automatically deduplicated with compact indexing
- **Frame-of-Reference**: Integer compression with reference values
- **FSST Compression**: Fast string compression for Tier-1 (optional)
- **Memory Efficient**: 4.6x less memory than `Vec<T>` for typical data
- **Robust Indexing**: Proper cumulative indexing handles chunks of any size
- **Binary Serialization**: Save/load tables with full compression preservation (.ntro format)

## 🏗️ Core API

### Table Loading (Primary Use Case)

#### Unified Loading - Phase 4 + BitPacking Fix
```rust
use neutrino::table::Table;

// Load any NTRO file with unified loading
// ✅ All compression types including Integer BitPacking now work reliably
let table = Table::load_from_file("dataset.ntro")?;

// With progress tracking for large files
use neutrino::progress::NoProgress;
let table = Table::load_from_file_with_progress("large_dataset.ntro", Some(NoProgress))?;
```

#### ✅ Integer BitPacking Support
```rust
// Integer BitPacking now works reliably after hardcoded chunk size fix
let table = Table::load_from_file("bitpacked_data.ntro")?;

// Access compressed integer data with proper cumulative indexing
for row in 0..table.len() {
    let compressed_value = table.get_integer(0, row)?;
    println!("Row {}: {}", row, compressed_value);
}

// BitPacking automatically applied for small integer ranges
// - 0-7 range: 3 bits per value
// - 0-15 range: 4 bits per value
// - 0-99 range: 7 bits per value
// - All with Frame-of-Reference encoding for efficiency
```

#### Table Creation (Unified Architecture)
```rust
use neutrino::table::{Table, TableBuilder, Value};

// ✅ RECOMMENDED: Use TableBuilder for CSV data
let csv_content = "id,name,score\n1,Alice,95\n2,Bob,87";
let (table, _) = TableBuilder::from_csv_content(csv_content.as_bytes(), None)?;

// ✅ WORKING: Manual table creation with unified architecture
let mut table = Table::new();
let _id_col = table.add_integer_column("id")?;
let _name_col = table.add_string_column("name")?;

// Add data with automatic compression selection
table.add_row(vec![
    Value::Integer(1),
    Value::String("Alice".to_string())
])?;

// ✅ All compression types work: FrameOfReference, BitPacking, Dictionary
```

### Column Management

#### Adding Columns
```rust
// Add integer column (automatically bit-packed based on data range)
table.add_integer_column("user_id")?;
table.add_integer_column("age")?;

// Add string columns (automatically dictionary-compressed)
table.add_string_column("username")?;
table.add_string_column("department")?;

// Generic column addition
table.add_column("score", DataType::Integer)?;
table.add_column("status", DataType::String)?;
```

#### Column Information
```rust
// Get column count
let count = table.column_count();

// Get column names in order
let names: Vec<&str> = table.column_names();

// Get table schema
let schema = table.schema();
for (i, column) in schema.columns().iter().enumerate() {
    println!("Column {}: {} ({})", i, column.name, column.data_type);
}
```

### Data Insertion

#### Single Row Insertion
```rust
// Using Value enum (safest)
table.add_row(vec![
    Value::Integer(123),
    Value::String("Alice".to_string()),
    Value::Integer(25),
    Value::String("Engineering".to_string()),
])?;

// Zero-allocation version for performance
let values = [
    Value::Integer(124), 
    Value::String("Bob".to_string()),
    Value::Integer(30),
    Value::String("Sales".to_string()),
];
table.push_values(&values)?;
```

#### Bulk Data Insertion
```rust
// Insert many rows efficiently
for i in 0..10_000 {
    table.add_row(vec![
        Value::Integer(i as i64),
        Value::String(format!("user_{}", i)),
        Value::Integer(20 + (i % 50)),  // Ages 20-69
        Value::String(departments[i % departments.len()].to_string()),
    ])?;
}

println!("Inserted {} rows", table.len());
```

### Data Access - Unified API

#### Type-Safe Value Access (Primary Methods)
```rust
// Unified data access methods - no more dual API confusion!
let integer_val = table.get_integer(column_index, row_index)?;
let string_val = table.get_string(column_index, row_index)?;
let float_val = table.get_float(column_index, row_index)?;
let datetime_val = table.get_datetime(column_index, row_index)?;

// Example: Access employee data
let employee_id = table.get_integer(0, 0)?;      // Column 0, Row 0
let employee_name = table.get_string(1, 0)?;     // Column 1, Row 0
let salary = table.get_float(2, 0)?;             // Column 2, Row 0
let hire_date = table.get_datetime(3, 0)?;       // Column 3, Row 0

println!("Employee {}: {} (${:.2}, hired: {})",
         employee_id, employee_name, salary, hire_date);
```

#### Row-Based Iteration
```rust
// Iterate over all rows with lazy loading
for row_result in table.iter() {
    let row = row_result?;

    // Access values from the row
    for col in 0..table.column_count() {
        let value = row.get(col)?;
        print!("{:?} ", value);
    }
    println!();
}

// Alternative: use iter_rows() method (same as iter())
for row_result in table.iter_rows() {
    let row = row_result?;
    // Process row...
}
```

#### Memory-Efficient Data Exploration
```rust
// Load large dataset with bounded memory usage
let table = Table::load_from_file("large_dataset.ntro")?;

// Explore data without loading everything into memory
println!("Dataset: {} rows, {} columns", table.len(), table.column_count());

// Sample first few rows
for row in 0..std::cmp::min(10, table.len()) {
    print!("Row {}: ", row);
    for col in 0..table.column_count() {
        let value = table.get_string(col, row)?;  // String works for all types
        print!("{:10} ", value);
    }
    println!();
}
```

## 📋 Metadata Access

### Table Information
```rust
// Get basic table properties
let row_count = table.len();
let column_count = table.column_count();
let is_empty = table.is_empty();

println!("Table: {} rows, {} columns", row_count, column_count);
```

### Column Information
```rust
// Get all column names
let column_names = table.column_names();
println!("Columns: {:?}", column_names);

// Get individual column properties
for i in 0..table.column_count() {
    let name = table.column_name(i)?;
    let data_type = table.column_type(i)?;
    println!("Column {}: '{}' ({:?})", i, name, data_type);
}
```

### Memory Usage Analysis
```rust
// Get memory usage information (returns sensible defaults for lazy tables)
let memory_usage = table.memory_usage();
println!("Memory usage: {} bytes ({:.1} MB)",
         memory_usage.total_bytes,
         memory_usage.total_bytes as f64 / 1_048_576.0);
```

## 🔄 File Format Update (September 2025)

### New NTRO Format with Schema-Based Chunk Pointers

**Important Change**: The file format has been updated to store chunk pointers in the schema metadata rather than embedded in column data. This provides:

- **Faster Metadata Access**: Chunk information available without reading column data
- **Better Compression**: Eliminates duplicate chunk pointer storage
- **Cleaner Architecture**: Separation of metadata and data

**⚠️ Migration Required**: Files created before September 23, 2025 must be regenerated:

```rust
// Re-generate old NTRO files
use neutrino::table::{Table, TableBuilder};

// Step 1: Load from original CSV source
let (table, _) = TableBuilder::from_csv_file("data.csv")?;

// Step 2: Save with new format
table.save_to_file("data.ntro")?;

// Step 3: Verify the new file loads correctly
let loaded = Table::load_from_file("data.ntro")?;
assert_eq!(loaded.len(), table.len());
```

### ✅ BitPacking Fix Details
```rust
// Fixed hardcoded chunk size assumptions that caused incorrect values
// OLD BUG: Row 1 would return wrong value (e.g., 1 instead of 2)
// NEW FIX: Proper cumulative indexing ensures correct values

let table = Table::load_from_file("bitpacked.ntro")?;
// All rows now return correct values after cumulative indexing fix
for i in 0..table.len() {
    let value = table.get_integer(0, i)?;  // ✅ Returns correct value
}
```

### Ultra-High Performance Access

#### Unsafe APIs (Maximum Speed)
```rust
// WARNING: These bypass bounds checking - use only when indices are guaranteed valid

unsafe {
    // Direct integer access (fastest possible)
    let value = table.get_integer_unchecked(0, row_index);
    
    // Direct column iteration (fastest iteration)
    for value in table.iter_integer_column_unchecked(0) {
        // Process value at maximum speed
    }
}
```

#### Performance-Critical Patterns
```rust
// Pattern 1: Hot path single access
let column = table.integer_column(0)?;  // Get column reference once
for i in 0..table.len() {
    let value = column.get(i)?;  // Direct column access
    // Process value
}

// Pattern 2: SIMD bulk operations
let column = table.integer_column(0)?;
let total_sum = column.sum();           // SIMD-accelerated
let filtered_count = column.count_range(100, 1000);  // SIMD filtering

// Pattern 3: Zero-allocation iteration
for value in table.iter_integer_column(0)? {
    // No allocations, maximum speed
}
```

## 💾 Memory Management

### Memory Usage Analysis
```rust
// Get detailed memory statistics
let usage = table.memory_usage();

println!("Total memory: {} bytes ({} MB)", 
    usage.total_bytes, usage.total_bytes / 1_048_576);
println!("Integer data: {} bytes", usage.integer_bytes);
println!("String data: {} bytes", usage.string_bytes);
println!("Total chunks: {}", usage.total_chunks);
println!("Rows: {}, Columns: {}", usage.row_count, usage.column_count);
println!("Bytes per row: {:.2}", usage.bytes_per_row());
println!("Compression ratio: {:.1}:1", usage.compression_ratio());
```

### Column-Level Memory Analysis
```rust
// Analyze individual columns
let int_column = table.integer_column(0)?;
let str_column = table.string_column(1)?;

println!("Integer column:");
println!("  Memory: {} bytes", int_column.memory_usage());
println!("  Chunks: {}", int_column.chunk_count());
println!("  Rows: {}", int_column.len());

println!("String column:");
println!("  Memory: {} bytes", str_column.memory_usage());  
println!("  Dictionary: {} entries", str_column.unique_count());
println!("  Dictionary memory: {} bytes", str_column.dictionary_size());
```

## 💾 File Serialization (.ntro format)

The library supports efficient binary serialization preserving all compression optimizations. Files use the `.ntro` (CLumnar eXPeriment) format with automatic checksum validation.

## ⚠️ BREAKING CHANGES - IMPORTANT FOR EXTERNAL PROJECTS

**If your project depends on `neutrino`, please read the breaking changes guide**: [`docs/usage/BREAKING_CHANGES_AND_MIGRATION.md`](../usage/BREAKING_CHANGES_AND_MIGRATION.md)

### Key Breaking Changes:
1. **`save_to_file_with_progress()`** - Now requires explicit type annotation or `Some(NoProgress)`
2. **`load_from_file_lazy()`** - Method removed, use `load_from_file()`
3. **`get_value_from_tier1()`** - Type signature changed, use unified API methods
4. **`memory_usage().row_count()`** - Method removed, use `table.len()`
5. **`table.columns.len()`** - Field now private, use `table.column_count()`

### Basic File Operations

#### Save and Load Tables
```rust
use neutrino::*;
use std::path::Path;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create and populate table
    let mut table = Table::new();
    table.add_integer_column("id")?;
    table.add_string_column("name")?;
    table.add_string_column("department")?;
    
    for i in 0..10000 {
        table.add_row(vec![
            Value::Integer(i),
            Value::String(format!("user_{}", i)),
            Value::String(["Engineering", "Sales", "Marketing"][i % 3].to_string()),
        ])?;
    }
    
    println!("Original table: {} rows, {} bytes", 
        table.len(), table.memory_usage().total_bytes);
    
    // Save to file (NOTE: Updated method signature)
    table.save_to_file_with_progress("employees.ntro", Some(neutrino::progress::NoProgress))?;
    
    // Check file size
    let file_size = std::fs::metadata("employees.ntro")?.len();
    println!("File size: {} bytes", file_size);
    
    // Load from file  
    let loaded_table = Table::load_from_file("employees.ntro")?;
    
    // Verify data integrity
    assert_eq!(loaded_table.len(), table.len());
    assert_eq!(loaded_table.column_count(), table.column_count());
    
    println!("Successfully loaded {} rows from file", loaded_table.len());
    Ok(())
}
```

#### Path-Based Operations
```rust
use neutrino::*;
use std::path::{Path, PathBuf};

// Save with Path types (NOTE: Updated method signature)
let file_path = Path::new("data/table.ntro");
table.save_to_file_with_progress(&file_path, Some(neutrino::progress::NoProgress))?;

// Load with PathBuf
let file_path = PathBuf::from("data/table.ntro");
let table = Table::load_from_file(file_path)?;

// Save with string path (NOTE: Updated method signature)
table.save_to_file_with_progress("backup.ntro", Some(neutrino::progress::NoProgress))?;

// Load with string path
let table = Table::load_from_file("backup.ntro")?;
```

### Advanced Serialization

#### Working with Temporary Files
```rust
use neutrino::*;
use tempfile::tempdir;

// Create temporary directory
let temp_dir = tempdir()?;
let file_path = temp_dir.path().join("temp_table.ntro");

// Save to temporary location (NOTE: Updated method signature)
table.save_to_file_with_progress(&file_path, Some(neutrino::progress::NoProgress))?;

// Load and verify
let loaded_table = Table::load_from_file(&file_path)?;
assert_eq!(loaded_table.len(), table.len());

// File automatically cleaned up when temp_dir is dropped
```

#### Error Handling for File Operations  
```rust
use neutrino::*;

fn safe_file_operations() -> Result<(), Box<dyn std::error::Error>> {
    let mut table = Table::new();
    // ... populate table
    
    // Handle save errors (NOTE: Updated method signature)
    match table.save_to_file_with_progress("readonly/file.ntro", Some(neutrino::progress::NoProgress)) {
        Ok(_) => println!("File saved successfully"),
        Err(TableError::IoError { source }) => {
            eprintln!("I/O error saving file: {}", source);
        },
        Err(TableError::SerializationError { message }) => {
            eprintln!("Serialization error: {}", message);
        },
        Err(e) => eprintln!("Other error: {}", e),
    }
    
    // Handle load errors
    match Table::load_from_file("nonexistent.ntro") {
        Ok(table) => println!("Loaded {} rows", table.len()),
        Err(TableError::IoError { source }) => {
            eprintln!("File not found or I/O error: {}", source);
        },
        Err(TableError::SerializationError { message }) => {
            eprintln!("File format error: {}", message);
        },
        Err(e) => eprintln!("Other error: {}", e),
    }
    
    Ok(())
}
```

### File Format Features

#### Compression Preservation
```rust
use neutrino::*;

// Create table with optimal compression
let mut table = Table::new();
table.add_integer_column("small_int")?;     // Will use ~3 bits per value for 0-7 range
table.add_string_column("category")?;       // Will use dictionary compression

// Add data with good compression characteristics
for i in 0..1000 {
    table.add_row(vec![
        Value::Integer(i % 8),  // Only uses values 0-7 -> 3 bits per value
        Value::String(["A", "B", "C"][i % 3].to_string()),  // Only 3 unique strings
    ])?;
}

let original_memory = table.memory_usage().total_bytes;
println!("In-memory size: {} bytes", original_memory);

// Save and load - compression is fully preserved (NOTE: Updated method signature)
table.save_to_file_with_progress("compressed.ntro", Some(neutrino::progress::NoProgress))?;
let loaded_table = Table::load_from_file("compressed.ntro")?;

let loaded_memory = loaded_table.memory_usage().total_bytes;
println!("Loaded size: {} bytes", loaded_memory);

// Memory usage identical due to preserved compression
assert_eq!(original_memory, loaded_memory);

// Verify compression ratios are preserved
let original_compression = table.memory_usage().compression_ratio();
let loaded_compression = loaded_table.memory_usage().compression_ratio();
println!("Compression ratios - Original: {:.1}:1, Loaded: {:.1}:1", 
    original_compression, loaded_compression);
```

#### Multi-Chunk Tables
```rust
use neutrino::*;

// Create large table that spans multiple chunks
let mut table = Table::new();
table.add_integer_column("id")?;
table.add_string_column("data")?;

// Add enough data to create multiple chunks (>65,536 rows)
println!("Creating large table with multiple chunks...");
for i in 0..100_000 {
    table.add_row(vec![
        Value::Integer(i),
        Value::String(format!("data_{}", i % 1000)),  // 1000 unique strings
    ])?;
}

// Check chunk structure
let int_col = table.integer_column(0)?;
let str_col = table.string_column(1)?;
println!("Integer column chunks: {}", int_col.chunk_count());
println!("String column chunks: {}", str_col.chunk_count());

// Save multi-chunk table (NOTE: Updated method signature)
table.save_to_file_with_progress("large_table.ntro", Some(neutrino::progress::NoProgress))?;

// Load and verify chunk structure is preserved  
let loaded_table = Table::load_from_file("large_table.ntro")?;
let loaded_int_col = loaded_table.integer_column(0)?;
let loaded_str_col = loaded_table.string_column(1)?;

assert_eq!(loaded_int_col.chunk_count(), int_col.chunk_count());
assert_eq!(loaded_str_col.chunk_count(), str_col.chunk_count());

println!("Successfully preserved chunk structure across serialization");
```

### File Format Details

#### File Structure Overview
The `.ntro` format preserves all compression optimizations:

```
┌─────────────────────────────────────────┐
│ File Header (64 bytes)                  │
│ - Magic number: 'NTRO'                  │  
│ - Version info and flags                │
│ - Element count and size information    │
│ - CRC64 checksum for integrity          │
├─────────────────────────────────────────┤
│ Table Schema (variable length)          │
│ - Column definitions and metadata       │
│ - Chunk organization information        │
├─────────────────────────────────────────┤
│ Column Data Sections                    │
│ - Integer columns: Bit-packed with FOR  │
│ - String columns: Dictionary + indices  │
│ - All original compression preserved    │
└─────────────────────────────────────────┘
```

#### Integrity Validation
```rust
use neutrino::*;

// Files include automatic checksum validation
match Table::load_from_file("data.ntro") {
    Ok(table) => {
        println!("File loaded successfully with valid checksum");
        println!("Rows: {}, Columns: {}", table.len(), table.column_count());
    },
    Err(TableError::SerializationError { message }) => {
        if message.contains("Checksum mismatch") {
            eprintln!("File appears to be corrupted!");
        } else if message.contains("Invalid magic number") {
            eprintln!("Not a valid .ntro file");
        } else {
            eprintln!("File format error: {}", message);
        }
    },
    Err(e) => eprintln!("Error loading file: {}", e),
}
```

### Performance Characteristics

#### File I/O Performance
- **Write speed**: ~2-3x slower than table creation (due to serialization overhead)
- **Read speed**: ~1.5-2x slower than table creation (due to deserialization)
- **File size**: Approximately equal to in-memory compressed size + ~1% overhead
- **Integrity**: CRC64 checksum validation with minimal performance impact

#### Best Practices
```rust
use neutrino::*;

// ✅ Good: Save large tables once after bulk creation
let mut table = Table::new();
// ... add all data at once
for batch in data_batches {
    for row in batch {
        table.add_row(row)?;
    }
}
table.save_to_file_with_progress("final_data.ntro", Some(neutrino::progress::NoProgress))?;  // Save once

// ❌ Avoid: Frequent saves during data loading
let mut table = Table::new();
for (i, row) in data.enumerate() {
    table.add_row(row)?;
    if i % 1000 == 0 {
        table.save_to_file_with_progress("checkpoint.ntro", Some(neutrino::progress::NoProgress))?;  // Too frequent
    }
}

// ✅ Good: Verify critical data after loading
let table = Table::load_from_file("important.ntro")?;
assert_eq!(table.len(), expected_rows);
assert_eq!(table.column_count(), expected_columns);

// ✅ Good: Use memory analysis to verify compression preservation
let original_usage = original_table.memory_usage();
let loaded_usage = loaded_table.memory_usage();
assert_eq!(original_usage.compression_ratio(), loaded_usage.compression_ratio());
```

## 🎯 Performance Optimization Guide

### Best Practices

#### 1. Column-First Access Patterns
```rust
// ❌ Slow: Row-by-row access
for i in 0..table.len() {
    let id = table.get_integer(0, i)?;
    let name = table.get_string(1, i)?;
    // Process row...
}

// ✅ Fast: Column-by-column access
let ids: Vec<i64> = table.iter_integer_column(0)?.collect();
let names: Vec<&str> = table.iter_string_column(1)?.collect();
// Process columns in parallel or with SIMD
```

#### 2. Bulk Operations
```rust
// ❌ Slow: Individual operations
let mut sum = 0;
for i in 0..table.len() {
    sum += table.get_integer(0, i)?;
}

// ✅ Fast: SIMD bulk operations  
let column = table.integer_column(0)?;
let sum = column.sum();  // SIMD-accelerated
```

#### 3. Memory-Efficient Data Loading
```rust
// ✅ Pre-allocate table capacity
let mut table = Table::with_config(TableConfig {
    initial_capacity: Some(expected_columns),
    ..Default::default()
});

// ✅ Use push_values for zero-allocation insertion
let values = [Value::Integer(123), Value::String("test".to_string())];
table.push_values(&values)?;  // No Vec allocation
```

### Performance Characteristics

#### Memory Usage (vs Vec<T> baseline)
- **0-99 range integers**: 4.6x compression (78% memory savings)
- **String data**: 6-10x compression with dictionary encoding
- **Mixed data**: Typically 3-5x compression depending on data patterns

#### Access Speed (vs Vec<T> baseline)
- **Single access**: 29-82x slower (due to decompression overhead)
- **Row iteration**: 50-80x slower (mixed access patterns)
- **Bulk operations**: 1.1-2.7x slower (SIMD partially compensates)
- **Column iteration**: 2-5x slower (optimal access pattern)

#### Creation Speed
- **Row-by-row**: 2-6x slower than Vec<T>
- **Bulk loading**: Competitive with Vec<T> when using optimized APIs

## 📋 Error Handling

### Error Types
```rust
use neutrino::*;

// All operations return Result types
match table.get_integer(0, 0) {
    Ok(value) => println!("Value: {}", value),
    Err(TableError::ColumnIndexOutOfBounds { index, max }) => {
        println!("Column index {} is out of bounds (max: {})", index, max);
    },
    Err(TableError::RowIndexOutOfBounds { index, max }) => {
        println!("Row index {} is out of bounds (max: {})", index, max);
    },
    Err(TableError::TypeMismatch { expected, actual }) => {
        println!("Type mismatch: expected {}, got {}", expected, actual);
    },
    Err(e) => println!("Other error: {}", e),
}
```

### Common Error Patterns
```rust
// Safe access with error handling
fn safe_access(table: &Table, col: usize, row: usize) -> Result<i64, TableError> {
    if col >= table.column_count() {
        return Err(TableError::ColumnIndexOutOfBounds { 
            index: col, 
            max: table.column_count() 
        });
    }
    
    table.get_integer(col, row)
}

// Bulk error handling
fn process_column(table: &Table, column_index: usize) -> Result<i64, TableError> {
    let column = table.integer_column(column_index)?;
    Ok(column.sum())  // SIMD operation can't fail
}
```

## 🔬 Advanced Features

### Multi-Column SIMD Operations
```rust
use neutrino::*;

// Create multi-column SIMD processor
let simd = MultiColumnSIMD::new(&table);

// Cross-column operations
let correlations = simd.correlate_columns(0, 2)?;  // Correlate columns 0 and 2
let joint_stats = simd.joint_statistics(&[0, 1, 2])?;  // Multi-column stats

// Conditional aggregates
let high_earners = simd.conditional_sum(
    4,  // salary column
    ColumnCondition::GreaterThan(0, 100_000)  // age column > 100k
)?;
```

### Ultra-Optimized Table (Experimental)
```rust
use neutrino::*;

// Ultra-optimized table for maximum performance
let mut ultra_table = UltraTable::new();
ultra_table.add_integer_column("id")?;
ultra_table.add_string_column("name")?;

// Same API as regular Table but with additional optimizations
// - Separated hot/cold data for better cache locality  
// - Branchless operations where possible
// - SIMD-friendly memory layout
```

### Profiling and Analysis
```rust
use neutrino::*;

// Create profiler
let mut profiler = TableProfiler::new(&table);

// Profile operations
profiler.start_timing("bulk_sum");
let sum = table.integer_column(0)?.sum();
profiler.end_timing("bulk_sum");

profiler.start_timing("iteration");
for value in table.iter_integer_column(0)? {
    // Process values
}
profiler.end_timing("iteration");

// Get performance report
let report = profiler.generate_report();
println!("Performance Report:\n{}", report);
```

## 🎛️ Configuration Reference

### TableConfig Options
```rust
pub struct TableConfig {
    /// Chunk size (values per chunk). Default: 65,536
    /// Smaller = better cache locality, Larger = better compression
    pub chunk_size: usize,
    
    /// Pre-allocate capacity for columns. Default: None
    /// Set this if you know the expected number of columns
    pub initial_capacity: Option<usize>,
    
    /// Enable bit-packing compression. Default: true  
    /// Disable only for debugging or if data doesn't compress well
    pub enable_compression: bool,
}
```

### Performance Tuning Guidelines

#### Chunk Size Selection
- **16K (16,384)**: Better cache locality, frequent small queries
- **32K (32,768)**: Balanced performance for most use cases  
- **64K (65,536)**: Default, good for large datasets
- **128K+**: Better compression, bulk analytical workloads

#### Memory vs Speed Trade-offs
- **Memory-critical**: Use this library (4.6x compression vs Vec<T>)
- **Speed-critical**: Use Vec<T> or Arrow (29-82x faster access)
- **Balanced**: Use Arrow Dictionary (3.9x compression, 7x slower access)

## 📊 Benchmarking Results

### Comparison vs Alternatives (1M rows, 0-99 integer range)

| Metric | Vec<T> | This Library | Arrow Raw | Arrow Dict | Winner |
|--------|--------|--------------|-----------|------------|--------|
| **Memory** | 37 MB | **8 MB** ⭐ | 19 MB | 19 MB | This Library |
| **Single Access** | 0.27ns | 7.92ns (29x slower) | 0.86ns (3x slower) | **0.88ns (3x slower)** | Vec<T> |
| **Row Iteration** | 0.52ns/row | 42ns/row (81x slower) | 4ns/row (8x slower) | **3.7ns/row (7x slower)** | Vec<T> |
| **Bulk Sum** | 541μs | 1449μs (3x slower) | **622μs (1x slower)** | 781μs (1x slower) | Vec<T> |
| **Creation** | 77ms | 224ms (3x slower) | 26ms (3x faster) | **22ms (4x faster)** | Arrow Dict |

### When to Choose This Library
- ✅ **Memory-constrained environments** (78% memory savings)
- ✅ **Storage cost optimization** (58% smaller than Arrow)
- ✅ **Small integer ranges** (excellent bit-packing compression - now working reliably)
- ✅ **Reliable compression** (FrameOfReference, BitPacking, Dictionary all functional)
- ✅ **Robust indexing** (Fixed chunk size assumptions, handles variable chunk sizes)
- ⚠️ Accept slower access for maximum memory efficiency and compression

## 📚 Complete Example - Unified API

```rust
use neutrino::table::Table;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("=== Unified Table API Demo (Phase 4) ===");

    // 1. Load existing NTRO file with unified API
    let table = Table::load_from_file("dataset.ntro")?;

    println!("Loaded table with {} rows, {} columns", table.len(), table.column_count());

    // 2. Explore table structure
    println!("\n📋 Table Structure:");
    let column_names = table.column_names();
    for (i, name) in column_names.iter().enumerate() {
        let data_type = table.column_type(i)?;
        println!("  Column {}: '{}' ({:?})", i, name, data_type);
    }

    // 3. Access data with unified methods (no more dual API confusion!)
    println!("\n🔍 Data Access Examples:");
    for row in 0..std::cmp::min(5, table.len()) {
        print!("Row {}: ", row);

        for col in 0..table.column_count() {
            // Try different data types - unified API handles type conversion
            let value = if let Ok(int_val) = table.get_integer(col, row) {
                format!("{}", int_val)
            } else if let Ok(float_val) = table.get_float(col, row) {
                format!("{:.2}", float_val)
            } else if let Ok(datetime_val) = table.get_datetime(col, row) {
                format!("@{}", datetime_val)
            } else {
                table.get_string(col, row).unwrap_or("ERROR".to_string())
            };

            print!("{:12} ", value);
        }
        println!();
    }

    // 4. Memory-efficient iteration (lazy loading)
    println!("\n🔄 Row Iteration with Lazy Loading:");
    let mut processed_rows = 0;
    for row_result in table.iter() {
        let _row = row_result?;
        processed_rows += 1;

        if processed_rows >= 10 {
            break;  // Only process first 10 rows for demo
        }
    }
    println!("Processed {} rows with bounded memory usage", processed_rows);

    // 5. Column-specific data exploration
    println!("\n📊 Column Analysis:");
    for col in 0..std::cmp::min(3, table.column_count()) {
        let name = table.column_name(col)?;
        println!("  Column '{}' sample values:", name);

        for row in 0..std::cmp::min(3, table.len()) {
            let value = table.get_string(col, row)?;
            println!("    Row {}: '{}'", row, value);
        }
    }

    // 6. Memory usage analysis
    let memory_usage = table.memory_usage();
    println!("\n💾 Memory Usage:");
    println!("  Total: {} bytes ({:.1} MB)",
             memory_usage.total_bytes,
             memory_usage.total_bytes as f64 / 1_048_576.0);

    // 7. Demonstrate type-safe access
    println!("\n🎯 Type-Safe Access Examples:");
    if table.column_count() >= 4 {
        // Example accessing different data types
        if let Ok(id) = table.get_integer(0, 0) {
            println!("  ID (integer): {}", id);
        }
        if let Ok(name) = table.get_string(1, 0) {
            println!("  Name (string): '{}'", name);
        }
        if let Ok(price) = table.get_float(2, 0) {
            println!("  Price (float): {:.2}", price);
        }
        if let Ok(timestamp) = table.get_datetime(3, 0) {
            println!("  Timestamp (datetime): {}", timestamp);
        }
    }

    println!("\n✅ Unified API Demo completed successfully!");
    println!("Key benefits:");
    println!("  - Single consistent API for all operations");
    println!("  - Memory-efficient Tier 1/Tier 2 compression");
    println!("  - Type-safe data access");
    println!("  - Reliable compression (BitPacking, FrameOfReference, Dictionary)");
    println!("  - Robust indexing with proper cumulative chunk handling");

    Ok(())
}
```

### Creating Tables with TableBuilder

For creating new tables, use the TableBuilder (unified tables are read-only):

```rust
use neutrino::table::TableBuilder;
use neutrino::progress::NoProgress;

fn create_table_example() -> Result<(), Box<dyn std::error::Error>> {
    // Create table using TableBuilder
    let csv_content = "id,name,price\n1,Widget A,12.34\n2,Widget B,56.78";
    let (table, _columns) = TableBuilder::from_csv_content(csv_content.as_bytes(), None)?;

    // Save using TableBuilder
    table.save_to_file_with_progress("new_data.ntro", Some(NoProgress))?;

    // Load with unified API
    let unified_table = Table::load_from_file("new_data.ntro")?;

    // Use unified methods for data access
    let id = unified_table.get_integer(0, 0)?;
    let name = unified_table.get_string(1, 0)?;
    let price = unified_table.get_float(2, 0)?;

    println!("Created and loaded: ID={}, Name='{}', Price={}", id, name, price);

    Ok(())
}
```

---

## 🌐 WebAssembly API

Neutrino provides production-ready WebAssembly bindings for use in web browsers.

### Key Concepts

**Memory Efficiency**: The WASM API is designed to minimize memory usage:
- **Lazy Loading**: Load only required columns, not entire tables
- **Typed Arrays**: Return Float64Array/Uint32Array instead of boxed JavaScript objects
- **Buffer Reuse**: Internal buffers are reused across operations
- **Memory Plateau**: Memory grows to peak then stays stable (no leaks)

### Core Functions

#### parseMetadata()

Parse file metadata without loading data.

```typescript
import { parseMetadata } from './wasm/neutrino';

const fileBytes = await loadFromIndexedDB('dataset-id');
const metadataJson = parseMetadata(fileBytes);
const metadata = JSON.parse(metadataJson);

console.log(`${metadata.rowCount} rows × ${metadata.columnCount} columns`);
console.log(`Estimated memory: ${metadata.estimatedMemoryMB} MB`);
```

**Returns**:
```typescript
{
  rowCount: number;
  columnCount: number;
  columns: Array<{
    name: string;
    type: 'Integer' | 'Float' | 'String' | 'DateTime';
    chunkCount: number;
  }>;
  estimatedMemoryMB: number;
}
```

#### aggregateForChartTyped() ⭐ Recommended

Memory-efficient aggregation with typed arrays.

```typescript
import { aggregateForChartTyped } from './wasm/neutrino';

const chartData = aggregateForChartTyped(
  fileBytes,
  0,      // X column index
  1,      // Y column index (or null for count)
  2,      // Color/group column (or null)
  'sum'   // Aggregation: 'sum' | 'mean' | 'count' | 'min' | 'max'
);

// Access typed arrays (efficient)
for (let i = 0; i < chartData.x_values.length; i++) {
  const x = chartData.x_values[i];        // Float64Array
  const y = chartData.y_values[i];        // Float64Array
  const count = chartData.counts[i];      // Uint32Array
  const groupId = chartData.group_ids[i]; // Uint32Array
  const groupName = chartData.group_names[groupId];

  // Render point...
}
```

**Returns**:
```typescript
{
  xType: 'categorical' | 'date' | 'numeric';
  xLabel: string;
  yLabel: string;
  totalValue: number;
  numCategories: number;
  numSeries: number;

  // Typed arrays (memory-efficient)
  x_values: Float64Array;
  y_values: Float64Array;
  counts: Uint32Array;
  group_ids: Uint32Array;
  group_names: string[];
}
```

**Memory Impact**:
- Loads only 2-3 columns (~20-50 MB peak)
- Returns typed arrays (~0.2-2 MB)
- Drops temporary data immediately
- Memory plateaus (no growth on repeated calls)

#### WasmTable.loadFromBytes()

Load full table into memory (use sparingly).

```typescript
import { WasmTable } from './wasm/neutrino';

const table = WasmTable.loadFromBytes(fileBytes);

console.log(`${table.rowCount()} rows × ${table.columnCount()} columns`);
console.log(`Memory: ${table.getMemoryUsageMB()} MB`);

// Access data
for (let row = 0; row < 10; row++) {
  const value = table.getValue(0, row);
  console.log(`Row ${row}: ${value}`);
}

// Free memory when done
table.free();
```

**Note**: For chart aggregation, use `aggregateForChartTyped()` instead to avoid loading the full table.

### Production Pattern (signal-web)

```typescript
import { initializeNeutrinoWasm } from './lib/wasm-loader';
import { chunkedPersister } from './lib/storage/chunked-persister';
import { aggregateForChartTyped, parseMetadata } from './wasm/neutrino';

// 1. Initialize WASM (once at app startup)
await initializeNeutrinoWasm();

// 2. Import file to IndexedDB
const file = await selectFile();
const datasetId = await chunkedPersister.importDataset(file.name, file);

// 3. Parse metadata (lightweight)
const fileBytes = await chunkedPersister.getFileBytes(datasetId);
const metadata = JSON.parse(parseMetadata(fileBytes));

// 4. Aggregate for chart (memory-efficient)
const chartData = aggregateForChartTyped(fileBytes, 0, 1, null, 'sum');

// 5. Render with canvas
renderCanvasChart(container, chartData, width, height);

// Memory automatically managed - plateaus after first render
```

### Memory Best Practices

✅ **Do**:
- Use `aggregateForChartTyped()` for chart data
- Store files in IndexedDB, not React state
- Use `useRef` for chart data, not `useState`
- Render with Canvas, not SVG

❌ **Don't**:
- Load full table with `WasmTable.loadFromBytes()` unless necessary
- Store file bytes in React state
- Create new DOM elements for each data point
- Forget to call `.free()` on WasmTable instances

---

## 📚 Documentation

### Guides
- **[Web Application Guide](../guides/WEB_APPLICATION_GUIDE.md)** - Complete production patterns for web apps
- **[WASM Integration Guide](../guides/WASM_INTEGRATION_GUIDE.md)** - Setup and integration details
- **[Quick Start Guide](../guides/QUICK_START.md)** - Getting started with Rust
- **[CSV Loading Guide](../guides/CSV_LOADING.md)** - Importing CSV data

### Architecture
- **[WASM Memory and Leak Prevention](../architecture/WASM_MEMORY_AND_LEAK_PREVENTION.md)** - Deep dive into memory management
- **[Loading Data Architecture](../architecture/LoadingData.md)** - Data flow diagrams

### API Reference
- **[API Reference](API_REFERENCE.md)** - Complete API documentation for Rust and WASM

---

## 🔗 See Also

- **signal-web** - Production reference implementation (React + WASM + IndexedDB)
- **Compression Guide** - Understanding two-tier compression
- **Profiling Guide** - Performance optimization

This API documentation covers all major features and usage patterns of the high-performance columnar data structure library. The library excels in memory-constrained scenarios requiring significant compression while maintaining reasonable performance for analytical workloads.