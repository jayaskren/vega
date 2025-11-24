# Neutrino Aggregation API - Product Requirements Document

**Version:** 1.0  
**Date:** 2025-11-24  
**Status:** Draft  
**Author:** Vega-Neutrino Integration Team

---

## Executive Summary

The vega-neutrino package requires a general-purpose aggregation API to integrate Neutrino's high-performance columnar storage with Vega's transform system. Currently, Neutrino provides chart-specific aggregation functions, but Vega requires a flexible, general-purpose aggregation API that supports multiple groupby dimensions, multiple aggregation operations, and incremental updates.

---

## 1. Current State

### 1.1 What Vega Expects

Vega's `Aggregate` transform supports:

- **Multiple groupby dimensions**: Group data by 0 or more fields
- **Multiple aggregation operations**: Apply multiple ops (sum, mean, count, etc.) in a single transform
- **Flexible field mapping**: Each operation can target a different field
- **Custom output names**: Specify output field names via `as` parameter
- **Incremental updates**: Add/remove tuples and update aggregates incrementally
- **Cross-product mode**: Generate all combinations of groupby values (even empty cells)

**Example Vega Spec:**
```json
{
  "type": "aggregate",
  "groupby": ["category", "region"],
  "ops": ["sum", "count", "mean", "max"],
  "fields": ["sales", null, "sales", "price"],
  "as": ["total_sales", "count", "avg_sales", "max_price"]
}
```

### 1.2 What vega-neutrino Code Expects

The `NeutrinoAggregate` transform (in `packages/vega-neutrino/src/transforms/NeutrinoAggregate.js`) expects:

```javascript
// Function signature
bindings.aggregate(tablePtr, config)

// Config structure
{
  groupby: ["category", "region"],  // Array of field names
  measures: [
    { op: "sum", field: "sales", as: "total_sales" },
    { op: "count", field: null, as: "count" },
    { op: "mean", field: "sales", as: "avg_sales" }
  ],
  cross: false,  // Generate cross-product?
  drop: true     // Drop empty cells?
}

// Expected return value
[
  { category: "A", region: "West", total_sales: 1000, count: 10, avg_sales: 100 },
  { category: "A", region: "East", total_sales: 1500, count: 15, avg_sales: 100 },
  // ... more rows
]
```

### 1.3 What Neutrino WASM Provides

**Source:** `Neutrino_API_DOCUMENTATION.md` and `Neutrino_API_REFERENCE.md`

The Neutrino WASM API provides **chart-specific** aggregation functions:

#### aggregateForChartTyped() - Recommended by Neutrino

```typescript
function aggregateForChartTyped(
  bytes: Uint8Array,
  xColumn: number,           // X-axis column index
  yColumn: number | null,    // Y-axis column index (null for count)
  colorColumn: number | null, // Grouping/color column (null for no grouping)
  aggregation?: 'sum' | 'mean' | 'count' | 'min' | 'max'
): ChartDataTyped

interface ChartDataTyped {
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

**Example from Neutrino docs:**
```javascript
const chartData = aggregateForChartTyped(
  fileBytes,
  0,      // X column
  1,      // Y column
  2,      // Color/group column
  'sum'   // Aggregation type
);

// Returns chart-ready typed arrays
for (let i = 0; i < chartData.x_values.length; i++) {
  const x = chartData.x_values[i];
  const y = chartData.y_values[i];
  const group = chartData.group_names[chartData.group_ids[i]];
}
```

#### Other Available Functions

```javascript
// Less efficient version (returns JS objects)
aggregateForChart(bytes, x_column, y_column, color_column)

// Lazy evaluation version
aggregateLazy(bytes, x_column, y_column, color_column)

// Heatmap-specific
aggregateForHeatmap(wasm_table, x_column_name, y_column_name, value_column_name, ...)

// Transform functions (operate on entire dataset)
filterTransform(file_bytes, predicate)
binTransform(file_bytes, config, output_start, output_end)
windowTransform(file_bytes, windows, output_names)
```

**Key limitations for Vega integration:**
1. **Fixed to 3 dimensions**: x, y, color (Vega needs arbitrary groupby fields)
2. **Single aggregation per call**: Can only compute one operation at a time
3. **No multi-field grouping**: Can't group by `["category", "region", "year"]`
4. **Chart-specific output**: Returns typed arrays optimized for charts, not general data rows
5. **No incremental updates**: Must recompute entire aggregation on data changes

---

## 2. The Gap

### 2.1 Concrete Example: Why aggregateForChartTyped() Doesn't Work

**Vega Spec (from demo):**
```json
{
  "type": "aggregate",
  "groupby": ["category"],
  "ops": ["sum", "count", "mean"],
  "fields": ["sales", null, "sales"],
  "as": ["total_sales", "count", "avg_sales"]
}
```

**What Vega needs:**
```javascript
// Single call, multiple aggregations
aggregate(table, {
  groupby: ["category"],
  measures: [
    { op: "sum", field: "sales", as: "total_sales" },
    { op: "count", field: null, as: "count" },
    { op: "mean", field: "sales", as: "avg_sales" }
  ]
})
// Returns: [
//   { category: "A", total_sales: 1000, count: 10, avg_sales: 100 },
//   { category: "B", total_sales: 1500, count: 15, avg_sales: 100 }
// ]
```

**What Neutrino provides:**
```javascript
// Must call 3 times, can't combine results easily
const sumData = aggregateForChartTyped(bytes, categoryCol, salesCol, null, 'sum');
const countData = aggregateForChartTyped(bytes, categoryCol, null, null, 'count');
const meanData = aggregateForChartTyped(bytes, categoryCol, salesCol, null, 'mean');

// Problem: Results are in different formats (typed arrays)
// Problem: No way to combine into single result set
// Problem: 3x the work, 3x the memory
```

### 2.2 Missing Functionality Matrix

| Feature | Vega Requires | Neutrino Provides | Gap | Workaround Possible? |
|---------|---------------|-------------------|-----|---------------------|
| Multiple groupby fields | ✅ `["cat", "region"]` | ❌ Max 1 (x column) | **CRITICAL** | ❌ No |
| Multiple aggregations | ✅ `[sum, count, mean]` | ❌ 1 per call | **CRITICAL** | ⚠️ Multiple calls (inefficient) |
| Flexible operations | ✅ 20+ ops | ⚠️ 5 ops (sum, mean, count, min, max) | **HIGH** | ⚠️ Partial |
| General-purpose API | ✅ Yes | ❌ Chart-specific | **CRITICAL** | ❌ No |
| Row-based output | ✅ Array of objects | ❌ Typed arrays | **HIGH** | ✅ Convert in JS |
| Incremental updates | ✅ Yes | ❌ No | **MEDIUM** | ❌ No |
| Custom output names | ✅ Yes | ⚠️ Fixed names | **LOW** | ✅ Rename in JS |
| Cross-product mode | ✅ Yes | ❌ No | **LOW** | ⚠️ Generate in JS |

### 2.3 Impact

**Without a general aggregation API:**
- ❌ Cannot use Neutrino for standard Vega aggregate transforms
- ❌ Demo cannot show real performance improvements
- ❌ Integration is incomplete and non-functional
- ❌ Users must manually rewrite specs to use chart-specific functions
- ❌ Multi-dimensional groupby impossible (e.g., group by category AND region)
- ⚠️ Could work for simple single-dimension, single-aggregation cases only

---

## 3. Requirements

### 3.1 Functional Requirements

#### FR1: General-Purpose Aggregation Function

**Priority:** P0 (Critical)

```rust
// Rust signature (to be implemented in Neutrino)
pub fn aggregate(
    table: &WasmTable,
    config: AggregateConfig
) -> Result<Vec<HashMap<String, Value>>, JsValue>
```

```javascript
// JavaScript signature (wasm-bindgen generated)
export function aggregate(
    table: WasmTable,
    config: AggregateConfig
): Array<Record<string, any>>
```

**Input:**
- `table`: WasmTable instance containing the data
- `config`: Configuration object (see FR2)

**Output:**
- Array of objects, each representing one aggregated row
- Each object contains groupby fields + aggregated measure fields

#### FR2: Configuration Structure

**Priority:** P0 (Critical)

```typescript
interface AggregateConfig {
  // Groupby fields (empty array = single group)
  groupby: string[];
  
  // Aggregation operations
  measures: Array<{
    op: AggregateOp;
    field: string | null;  // null for count
    as: string;            // output field name
  }>;
  
  // Optional parameters
  cross?: boolean;  // Generate cross-product (default: false)
  drop?: boolean;   // Drop empty cells (default: true)
}

type AggregateOp =
  | "count" | "valid" | "missing"
  | "sum" | "mean" | "average"
  | "min" | "max"
  | "variance" | "variancep" | "stdev" | "stdevp" | "stderr"
  | "median" | "q1" | "q3"
  | "distinct" | "values"
  | "argmin" | "argmax";
```

#### FR3: Supported Aggregation Operations

**Priority:** P0 for basic ops, P1 for advanced ops

**Basic Operations (P0):**
- `count`: Count all values (including null)
- `valid`: Count non-null values
- `missing`: Count null values
- `sum`: Sum of values
- `mean` / `average`: Arithmetic mean
- `min`: Minimum value
- `max`: Maximum value

**Statistical Operations (P1):**
- `variance`: Sample variance (n-1 denominator)
- `variancep`: Population variance (n denominator)
- `stdev`: Sample standard deviation
- `stdevp`: Population standard deviation
- `stderr`: Standard error of the mean
- `median`: 50th percentile
- `q1`: 25th percentile
- `q3`: 75th percentile

**Advanced Operations (P2):**
- `distinct`: Count of unique values
- `values`: Array of all values
- `argmin`: Tuple with minimum value
- `argmax`: Tuple with maximum value

---

### 3.2 Non-Functional Requirements

#### NFR1: Performance

**Priority:** P0

- **Target:** 5-10x faster than JavaScript aggregation for datasets > 100K rows
- **Rationale:** This is the core value proposition of Neutrino
- **Measurement:** Benchmark against Vega's standard Aggregate transform

#### NFR2: Memory Efficiency

**Priority:** P0

- **Target:** Use columnar storage advantages to minimize memory allocations
- **Rationale:** Neutrino's columnar format should enable efficient aggregation
- **Measurement:** Memory usage should be O(groups × measures), not O(rows)

#### NFR3: API Compatibility

**Priority:** P0

- **Requirement:** Output format must be compatible with Vega's data model
- **Rationale:** Seamless integration with existing Vega specs
- **Validation:** All Vega aggregate examples should work with Neutrino

---

## 4. Proposed Solution

### 4.1 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Vega Transform Layer                                        │
│  - NeutrinoAggregate.transform()                           │
│  - Converts Vega params to AggregateConfig                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ JavaScript Bindings (bindings.js)                          │
│  - bindings.aggregate(tablePtr, config)                    │
│  - Validates config, calls WASM                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ WASM Loader (loader.js)                                    │
│  - Manages WASM instance                                   │
│  - Re-exports wasm-bindgen functions                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ wasm-bindgen Generated Code (neutrino.js)                 │
│  - aggregate(table, config) ← NEW FUNCTION                 │
│  - Calls Rust implementation                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Neutrino Rust Implementation (NEW)                         │
│  - Parse config                                            │
│  - Build hash map for groups                               │
│  - Iterate columns, compute aggregates                     │
│  - Return results as JsValue                               │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Implementation Phases

#### Phase 1: Basic Aggregation (P0)
**Timeline:** 1-2 weeks

- Implement `aggregate()` function in Rust
- Support basic operations: count, sum, mean, min, max
- Support single groupby field
- Support multiple measures
- Add wasm-bindgen export
- Update JavaScript bindings

**Deliverable:** Basic aggregation works for simple cases

#### Phase 2: Multi-Dimensional Groupby (P0)
**Timeline:** 1 week

- Support multiple groupby fields
- Implement efficient multi-key hashing
- Optimize memory layout for multi-dimensional groups

**Deliverable:** Full groupby support matching Vega

#### Phase 3: Statistical Operations (P1)
**Timeline:** 1-2 weeks

- Implement variance, stdev, median, quantiles
- Add streaming algorithms for efficient computation
- Optimize for columnar data access

**Deliverable:** All statistical operations supported

#### Phase 4: Advanced Features (P2)
**Timeline:** 1 week

- Implement cross-product mode
- Add distinct, values, argmin, argmax
- Performance optimizations

**Deliverable:** Feature parity with Vega Aggregate

---

## 5. API Specification

### 5.1 Rust Function Signature

```rust
#[wasm_bindgen]
pub fn aggregate(
    table: &WasmTable,
    config: JsValue
) -> Result<JsValue, JsValue> {
    // Parse config from JsValue
    let config: AggregateConfig = serde_wasm_bindgen::from_value(config)?;

    // Perform aggregation
    let results = perform_aggregation(table, &config)?;

    // Convert to JsValue
    Ok(serde_wasm_bindgen::to_value(&results)?)
}
```

### 5.2 JavaScript Usage Examples

#### Example 1: Simple Aggregation

```javascript
import { WasmTable, aggregate } from './neutrino.js';

// Load data
const table = WasmTable.loadFromBytes(ntroBytes);

// Configure aggregation
const config = {
  groupby: ["category"],
  measures: [
    { op: "sum", field: "sales", as: "total_sales" },
    { op: "count", field: null, as: "count" }
  ]
};

// Execute
const results = aggregate(table, config);
// [
//   { category: "A", total_sales: 1000, count: 10 },
//   { category: "B", total_sales: 1500, count: 15 }
// ]
```

#### Example 2: Multi-Dimensional Groupby

```javascript
const config = {
  groupby: ["category", "region"],
  measures: [
    { op: "sum", field: "sales", as: "total_sales" },
    { op: "mean", field: "sales", as: "avg_sales" },
    { op: "max", field: "price", as: "max_price" }
  ]
};

const results = aggregate(table, config);
// [
//   { category: "A", region: "West", total_sales: 1000, avg_sales: 100, max_price: 50 },
//   { category: "A", region: "East", total_sales: 1500, avg_sales: 100, max_price: 60 },
//   ...
// ]
```

#### Example 3: Statistical Aggregation

```javascript
const config = {
  groupby: ["product"],
  measures: [
    { op: "mean", field: "price", as: "avg_price" },
    { op: "stdev", field: "price", as: "price_stdev" },
    { op: "median", field: "price", as: "median_price" },
    { op: "q1", field: "price", as: "q1_price" },
    { op: "q3", field: "price", as: "q3_price" }
  ]
};
```

#### Example 4: No Groupby (Global Aggregation)

```javascript
const config = {
  groupby: [],  // Empty = aggregate entire dataset
  measures: [
    { op: "count", field: null, as: "total_count" },
    { op: "sum", field: "sales", as: "total_sales" },
    { op: "mean", field: "sales", as: "avg_sales" }
  ]
};

const results = aggregate(table, config);
// [
//   { total_count: 1000, total_sales: 50000, avg_sales: 50 }
// ]
```

---

## 6. Integration with vega-neutrino

### 6.1 Update bindings.js

```javascript
// packages/vega-neutrino/src/wasm/bindings.js

/**
 * Perform aggregation on a table.
 * @param {Object} tablePtr - WasmTable instance
 * @param {Object} config - Aggregation configuration
 * @returns {Array<Object>} Aggregation results
 */
export function aggregate(tablePtr, config) {
  const wasm = getWasm();

  // Call the wasm-bindgen generated function
  return wasm.aggregate(tablePtr, config);
}
```

### 6.2 NeutrinoAggregate Transform (No Changes Needed!)

The existing `NeutrinoAggregate` transform already calls `bindings.aggregate()` with the correct config format. Once the WASM function is implemented, it will work automatically.

---

## 7. Testing Requirements

### 7.1 Unit Tests (Rust)

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn test_simple_sum() {
        // Test basic sum aggregation
    }

    #[test]
    fn test_multi_groupby() {
        // Test multiple groupby fields
    }

    #[test]
    fn test_multiple_measures() {
        // Test multiple aggregations simultaneously
    }

    #[test]
    fn test_statistical_ops() {
        // Test variance, stdev, median, etc.
    }
}
```

### 7.2 Integration Tests (JavaScript)

```javascript
// Test against Vega's standard Aggregate transform
test('aggregate matches Vega output', () => {
  const data = generateTestData(10000);

  // Standard Vega
  const vegaResult = vegaAggregate(data, config);

  // Neutrino
  const table = loadIntoNeutrino(data);
  const neutrinoResult = aggregate(table, config);

  expect(neutrinoResult).toEqual(vegaResult);
});
```

### 7.3 Performance Benchmarks

```javascript
benchmark('aggregate 100K rows', () => {
  const table = loadTestData(100000);
  const config = {
    groupby: ["category"],
    measures: [
      { op: "sum", field: "value", as: "total" },
      { op: "mean", field: "value", as: "avg" }
    ]
  };

  const start = performance.now();
  aggregate(table, config);
  const duration = performance.now() - start;

  console.log(`Neutrino: ${duration}ms`);
  // Target: < 20ms for 100K rows
});
```

---

## 8. Success Criteria

### 8.1 Functional Success

- ✅ All basic aggregation operations work correctly
- ✅ Multi-dimensional groupby produces correct results
- ✅ Output format matches Vega's expectations
- ✅ Demo shows real performance improvements
- ✅ All Vega aggregate examples work with Neutrino

### 8.2 Performance Success

- ✅ 5-10x faster than JavaScript for 100K+ rows
- ✅ Memory usage scales with groups, not rows
- ✅ No performance regression for small datasets (< 1K rows)

### 8.3 Integration Success

- ✅ Zero changes required to existing Vega specs
- ✅ Automatic fallback to JavaScript for unsupported operations
- ✅ Clear error messages for invalid configurations

---

## 9. Alternative Approaches Considered

### 9.1 Approach A: Use aggregateForChartTyped() with Workarounds

**Implementation:**
- Call `aggregateForChartTyped()` multiple times for multiple aggregations
- Combine results in JavaScript
- Convert typed arrays to Vega's object format

**Pros:**
- ✅ Works with existing Neutrino API
- ✅ No Rust changes needed
- ✅ Can implement quickly

**Cons:**
- ❌ Only works for single-dimension groupby (can't do `["category", "region"]`)
- ❌ 3x slower (must call function 3 times for 3 aggregations)
- ❌ 3x memory usage (loads data 3 times)
- ❌ Complex JavaScript glue code
- ❌ Doesn't support all Vega aggregate operations

**Decision:** Possible for demo, not production-ready

### 9.2 Approach B: JavaScript-Side Aggregation

**Implementation:**
- Load data into WasmTable
- Export to JavaScript
- Perform aggregation in JavaScript

**Pros:**
- ✅ No Rust changes needed
- ✅ Full Vega compatibility

**Cons:**
- ❌ Defeats the purpose of Neutrino (performance)
- ❌ Requires decompressing all data to JavaScript
- ❌ No memory efficiency gains
- ❌ Slower than native JavaScript (decompression overhead)

**Decision:** Rejected - worse than not using Neutrino at all

### 9.3 Approach C: General-Purpose Aggregate Function (RECOMMENDED)

**Implementation:**
- Add new `aggregate()` function to Neutrino Rust codebase
- Support arbitrary groupby fields
- Support multiple simultaneous aggregations
- Return row-based results compatible with Vega

**Pros:**
- ✅ Supports all Vega use cases
- ✅ Leverages columnar storage for performance
- ✅ Clean API that matches Vega's model
- ✅ Extensible for future operations
- ✅ Single call for multiple aggregations (efficient)
- ✅ True performance improvement (5-10x faster)

**Cons:**
- Requires Rust implementation work (4-6 weeks)
- More complex than chart-specific functions

**Decision:** Selected - only viable long-term solution

### 9.4 Approach D: Hybrid - Quick Demo + Long-term Solution

**Implementation:**
- **Phase 1 (Now)**: Use Approach A for simple demo cases
- **Phase 2 (4-6 weeks)**: Implement Approach C for production

**Pros:**
- ✅ Shows integration works immediately
- ✅ Demonstrates WASM loading
- ✅ Buys time for proper implementation
- ✅ Clear migration path

**Cons:**
- ⚠️ Demo won't show real performance gains
- ⚠️ Limited to simple aggregations

**Decision:** Pragmatic approach for immediate progress

---

## 10. Open Questions

1. **Q:** Should we support custom aggregation functions?
   **A:** Defer to Phase 5 (future work)

2. **Q:** How to handle null values in groupby fields?
   **A:** Follow Vega's behavior - treat null as a distinct group value

3. **Q:** Should we support weighted aggregations?
   **A:** Defer to Phase 5 (future work)

4. **Q:** How to handle very large result sets (millions of groups)?
   **A:** Return iterator/stream instead of array (Phase 5)

---

## 11. Dependencies

### 11.1 Neutrino Rust Codebase

- Access to Neutrino source code
- Ability to add new wasm-bindgen exports
- Build system for generating WASM

### 11.2 Development Environment

- Rust toolchain with wasm32 target
- wasm-pack or wasm-bindgen CLI
- Node.js for testing

---

## 12. Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1: Basic Aggregation | 1-2 weeks | count, sum, mean, min, max working |
| Phase 2: Multi-Groupby | 1 week | Multiple groupby fields supported |
| Phase 3: Statistical Ops | 1-2 weeks | variance, stdev, median, quantiles |
| Phase 4: Advanced Features | 1 week | distinct, values, cross-product |
| **Total** | **4-6 weeks** | **Full feature parity with Vega** |

---

## 13. Appendix

### 13.1 Vega Aggregate Operations Reference

| Operation | Description | Requires Field | Output Type |
|-----------|-------------|----------------|-------------|
| count | Count all values | No | number |
| valid | Count non-null values | Yes | number |
| missing | Count null values | Yes | number |
| sum | Sum of values | Yes | number |
| mean | Arithmetic mean | Yes | number |
| average | Alias for mean | Yes | number |
| variance | Sample variance | Yes | number |
| variancep | Population variance | Yes | number |
| stdev | Sample std deviation | Yes | number |
| stdevp | Population std deviation | Yes | number |
| stderr | Standard error | Yes | number |
| median | 50th percentile | Yes | number |
| q1 | 25th percentile | Yes | number |
| q3 | 75th percentile | Yes | number |
| min | Minimum value | Yes | number |
| max | Maximum value | Yes | number |
| argmin | Tuple with min value | Yes | object |
| argmax | Tuple with max value | Yes | object |
| distinct | Count unique values | Yes | number |
| values | Array of all values | Yes | array |

### 13.2 Example Vega Specs Using Aggregate

See: https://vega.github.io/vega/examples/

- Bar Chart with Aggregation
- Grouped Bar Chart
- Stacked Bar Chart
- Box Plot (uses q1, median, q3)
- Histogram (uses binning + count)

---

## 14. Conclusion

Implementing a general-purpose `aggregate()` function in Neutrino is **critical** for vega-neutrino integration. Without it, the integration is incomplete and cannot demonstrate real performance improvements.

The proposed API is:
- ✅ Compatible with Vega's data model
- ✅ Flexible enough for all use cases
- ✅ Performant (leverages columnar storage)
- ✅ Extensible for future enhancements

**Recommendation:** Prioritize Phase 1 and Phase 2 to get basic functionality working, then iterate on statistical operations and advanced features.


