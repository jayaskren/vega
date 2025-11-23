# Product Requirements Document: Vega-Neutrino Integration

## Executive Summary

This document outlines the requirements for integrating Neutrino, a high-performance columnar data storage library, with Vega to enable handling of significantly larger datasets (10x-100x current limits) while maintaining Vega's declarative visualization API.

## Problem Statement

### Current Vega Limitations

1. **Memory Constraints**: All data must fit in JavaScript memory as arrays of objects
   - Each tuple is a JavaScript object with property overhead
   - 1 million rows with 10 columns can consume 500MB+ of memory
   - Browsers typically limit tabs to 2-4GB

2. **Performance Bottlenecks**:
   - Single-threaded JavaScript blocks UI during heavy computations
   - No SIMD acceleration for aggregations
   - O(n) aggregation per dataflow cycle with no caching
   - Tuple-by-tuple processing (no vectorization)

3. **No Incremental Loading**: Entire dataset must be loaded before visualization

### Target Use Cases

- Datasets with 1-100 million rows
- Real-time dashboards with frequent aggregation updates
- Memory-constrained environments (embedded browsers, mobile)
- Applications requiring multiple large datasets simultaneously

## Proposed Solution

### Overview

Create an opt-in Neutrino integration that replaces Vega's data storage and heavy computation layers while preserving the existing Vega API and specification format.

### Architecture: vega-neutrino Package

A new package `vega-neutrino` in `packages/vega-neutrino/` that provides:

1. **NeutrinoDataSource** - A Vega data source backed by Neutrino columnar storage
2. **Neutrino-accelerated transforms** - Drop-in replacements for heavy transforms
3. **WASM worker pool** - Background thread processing to avoid UI blocking

### User Opt-In Mechanism

Users opt into Neutrino via a data source property:

```json
{
  "data": [
    {
      "name": "large_dataset",
      "url": "data.csv",
      "format": {"type": "csv"},
      "neutrino": true
    }
  ]
}
```

Or programmatically:

```javascript
import { enableNeutrino } from 'vega-neutrino';

const view = new vega.View(vega.parse(spec))
  .initialize('#view');

enableNeutrino(view, {
  datasets: ['large_dataset'],
  workerCount: 4
});
```

## Functional Requirements

### FR-1: Neutrino Data Storage

**FR-1.1**: Load data from CSV/JSON into Neutrino columnar format
- Support CSV with automatic type detection
- Support JSON arrays of objects
- Support pre-compressed .ntro files

**FR-1.2**: Transparent tuple access for Vega operators
- Provide Vega-compatible tuple interface
- Support field accessors and expressions
- Track tuple identity for incremental updates

**FR-1.3**: Memory-efficient storage
- Target: 3-5x memory reduction vs current Vega storage
- Support datasets up to 100 million rows in browser

### FR-2: Accelerated Transforms

**FR-2.1**: Aggregate Transform
- Support all current Vega aggregation operations
- SIMD acceleration for sum, count, min, max, mean
- Cached results with invalidation on data change
- Target: 5-10x speedup for aggregations

**FR-2.2**: Filter Transform
- Range-based filtering using Neutrino predicates
- Bitmap result caching
- Support compound predicates (AND, OR)

**FR-2.3**: Window Transform
- Columnar-optimized window function evaluation
- Efficient frame-based aggregation
- Partition caching

**FR-2.4**: Collect/Sort Transform
- Leveraging Neutrino's sorted column indices
- Pre-built index support for common sort orders

### FR-3: Web Worker Integration

**FR-3.1**: Background processing
- Execute heavy operations in Web Workers
- Return results via transferable typed arrays
- Support cancellation of long-running operations

**FR-3.2**: Worker pool management
- Configurable worker count (default: navigator.hardwareConcurrency)
- Task queuing and prioritization
- Graceful degradation if workers unavailable

### FR-4: Incremental Data Loading

**FR-4.1**: Streaming CSV loading
- Load data in chunks during parsing
- Progressive rendering during load
- Support pause/resume

**FR-4.2**: Lazy column loading
- Load only columns referenced by transforms
- On-demand column decompression

### FR-5: Data Persistence

**FR-5.1**: IndexedDB integration
- Store compressed datasets in IndexedDB
- Fast reload from cached data
- Automatic cache invalidation

**FR-5.2**: Export compressed format
- Save processed data as .ntro files
- Share pre-compressed datasets

## Non-Functional Requirements

### NFR-1: Performance

- **Aggregation**: 5-10x faster than current Vega for datasets >100K rows
- **Memory**: 3-5x reduction in memory usage
- **Load time**: <2 seconds for 1M row CSV (after initial WASM load)
- **UI responsiveness**: Heavy operations must not block UI >16ms

### NFR-2: Compatibility

- **Vega specs**: 100% backward compatible - all existing specs work without modification
- **Browsers**: Chrome 80+, Firefox 75+, Safari 14+, Edge 80+
- **Node.js**: Support for server-side rendering

### NFR-3: Bundle Size

- **Core package**: <100KB gzipped (excluding WASM)
- **WASM module**: <500KB gzipped
- **Tree-shakeable**: Unused features excluded from bundle

### NFR-4: Developer Experience

- **Opt-in**: Zero changes required for existing Vega users
- **Debugging**: Support Vega's existing debug/logging infrastructure
- **TypeScript**: Full type definitions

## Technical Constraints

### Constraint-1: WASM Loading

- WASM must be loaded asynchronously
- Provide synchronous fallback for SSR
- Support custom WASM URL for CDN hosting

### Constraint-2: Data Transfer

- Minimize data copying between JS and WASM
- Use SharedArrayBuffer where available
- Support transferable objects for worker communication

### Constraint-3: Vega Dataflow Compatibility

- Neutrino transforms must participate in Vega's pulse system
- Support modified/added/removed tuple tracking
- Maintain topological sort ordering

## User Stories

### US-1: Data Analyst with Large Dataset

> As a data analyst, I want to visualize a 10 million row dataset in my browser so that I can explore patterns without setting up server infrastructure.

**Acceptance Criteria**:
- Load 10M row CSV in <30 seconds
- Responsive pan/zoom interactions (<100ms)
- Memory usage <1GB

### US-2: Dashboard Developer

> As a dashboard developer, I want to use the same Vega spec for small and large datasets so that I don't have to maintain two codebases.

**Acceptance Criteria**:
- Single spec works with and without Neutrino
- Automatic fallback if WASM unavailable
- No visible difference in output

### US-3: Performance-Sensitive Application

> As a developer building a data-intensive application, I want aggregations to not block my UI so that my application remains responsive.

**Acceptance Criteria**:
- Aggregation operations execute in background thread
- Progress indication for long operations
- Cancellation support

### US-4: Mobile User

> As a mobile user, I want to view large visualizations without crashing my browser tab so that I can access the same dashboards on my phone.

**Acceptance Criteria**:
- Memory usage 3-5x lower than standard Vega
- Graceful degradation on low-memory devices
- Fast subsequent loads from cached data

## Success Metrics

### Primary Metrics

1. **Memory Efficiency**: 3-5x reduction in memory usage for datasets >100K rows
2. **Performance**: 5-10x faster aggregations for datasets >100K rows
3. **Scale**: Support datasets up to 100M rows in browser

### Secondary Metrics

1. **Adoption**: 10% of Vega users with large datasets enable Neutrino within 6 months
2. **Compatibility**: 100% of Vega examples work with Neutrino enabled
3. **Bundle size**: <600KB total gzipped (JS + WASM)

## Risks and Mitigations

### Risk-1: WASM Browser Support

**Risk**: Older browsers don't support required WASM features
**Mitigation**: Automatic fallback to standard Vega transforms; clear browser requirements in documentation

### Risk-2: Data Type Mismatches

**Risk**: Neutrino's type inference differs from Vega's expectations
**Mitigation**: Explicit type hints in spec; detailed error messages; type coercion layer

### Risk-3: Performance Regression

**Risk**: Small datasets slower with Neutrino overhead
**Mitigation**: Automatic threshold (e.g., <10K rows uses standard Vega); benchmark suite

### Risk-4: Debugging Complexity

**Risk**: Issues harder to debug across JS/WASM/Worker boundaries
**Mitigation**: Comprehensive logging; source maps for WASM; detailed error propagation

## Out of Scope

The following are explicitly out of scope for the initial release:

1. **Streaming data sources** (WebSocket, Server-Sent Events)
2. **GPU acceleration** (WebGL/WebGPU compute)
3. **Distributed processing** (multi-machine)
4. **Custom aggregation functions** (only built-in ops supported)
5. **Direct .ntro file format in Vega specs** (must load via JS API)

## Dependencies

### External Dependencies

- **Neutrino WASM**: Compiled from Rust source
- **Web Workers**: Browser standard
- **IndexedDB**: Browser standard (optional, for persistence)

### Internal Dependencies

- **vega-dataflow**: Core dataflow engine
- **vega-loader**: Data loading infrastructure
- **vega-transforms**: Transform registration system

## Timeline Estimate

- **Phase 1** (4 weeks): Core infrastructure, NeutrinoDataSource, basic transforms
- **Phase 2** (3 weeks): Worker integration, all transform replacements
- **Phase 3** (2 weeks): Persistence, streaming load, optimization
- **Phase 4** (2 weeks): Documentation, examples, testing

**Total**: 11 weeks

## Appendix

### A. Supported Aggregation Operations

| Operation | Neutrino Support | SIMD Accelerated |
|-----------|-----------------|------------------|
| count | Yes | Yes |
| valid | Yes | Yes |
| missing | Yes | Yes |
| sum | Yes | Yes |
| mean | Yes | Yes |
| min | Yes | O(1) |
| max | Yes | O(1) |
| variance | Yes | Partial |
| stdev | Yes | Partial |
| median | Yes | No |
| q1, q3 | Yes | No |
| distinct | Yes | No |
| values | Yes | No |

### B. Memory Comparison (1M rows, 10 columns)

| Storage | Memory Usage | Notes |
|---------|-------------|-------|
| Vega (current) | ~500MB | JS objects with property overhead |
| Neutrino | ~100-150MB | Columnar + compression |
| Improvement | 3-5x | Varies by data characteristics |

### C. Glossary

- **Columnar storage**: Data organized by column rather than row for better compression and cache locality
- **SIMD**: Single Instruction Multiple Data - CPU instruction set for parallel operations
- **WASM**: WebAssembly - portable binary format for near-native performance
- **Pulse**: Vega's change propagation mechanism carrying added/removed/modified tuples
- **Transform**: Vega operator that processes data streams
