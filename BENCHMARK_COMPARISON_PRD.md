# PRD: Vega-Neutrino Performance Comparison Benchmark

## Problem Statement

The current comparison demo (`examples/neutrino-comparison.html`) has a fundamental flaw: **both Vega and Neutrino load identical JavaScript-generated data**. This approach:

1. **Doesn't test true data loading performance** - Both views receive pre-generated JS arrays
2. **Shows similar memory usage** - Same JS objects stored in both cases
3. **Only compares aggregation speed** - Not the full pipeline including data loading
4. **Doesn't demonstrate Neutrino's core benefits** - Columnar storage, compression, fast .ntro loading

### What Should Be Tested

Neutrino's primary advantages are:
- **3-5x memory reduction** through columnar storage and compression
- **10-50x faster load times** with .ntro format vs CSV parsing
- **5-10x faster aggregations** with SIMD acceleration

To properly demonstrate these, we need tests that:
1. Load data from files (CSV for Vega, .ntro for Neutrino)
2. Isolate each test to get accurate measurements
3. Test multiple data sizes
4. Measure both time and memory accurately

## Proposed Solution

Create a **multi-page benchmark suite** that:
1. Refreshes between tests to isolate measurements
2. Loads data from actual files (CSV and .ntro)
3. Records results to compare after all tests complete
4. Provides clear, accurate performance metrics

## Architecture

### File Structure

```
examples/
├── benchmark/
│   ├── index.html              # Main dashboard/results page
│   ├── test-vega.html          # Isolated Vega CSV test page
│   ├── test-neutrino.html      # Isolated Neutrino .ntro test page
│   ├── results.js              # Shared results storage (localStorage)
│   └── shared.js               # Shared utilities
├── data/
│   ├── benchmark-10k.csv       # 10K rows test data
│   ├── benchmark-10k.ntro      # Same data in .ntro format
│   ├── benchmark-100k.csv      # 100K rows test data
│   ├── benchmark-100k.ntro
│   ├── benchmark-1m.csv        # 1M rows test data
│   └── benchmark-1m.ntro
└── generate-benchmark-data.js  # Data generation script
```

### Test Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Benchmark Dashboard                   │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Select Test Size:  ○ 10K  ○ 100K  ○ 1M        │    │
│  │  [Run Vega Test] [Run Neutrino Test] [Run Both] │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  Results:                                                │
│  ┌──────────┬──────────┬──────────┬──────────┐         │
│  │ Size     │ Vega     │ Neutrino │ Speedup  │         │
│  ├──────────┼──────────┼──────────┼──────────┤         │
│  │ 10K      │ 120ms    │ 25ms     │ 4.8x     │         │
│  │ 100K     │ 1200ms   │ 180ms    │ 6.7x     │         │
│  │ 1M       │ 12000ms  │ 1500ms   │ 8.0x     │         │
│  └──────────┴──────────┴──────────┴──────────┘         │
└─────────────────────────────────────────────────────────┘
           │                      │
           ▼                      ▼
    ┌──────────────┐      ┌──────────────┐
    │ test-vega    │      │ test-neutrino│
    │  (new tab)   │      │  (new tab)   │
    │              │      │              │
    │ Load CSV     │      │ Load .ntro   │
    │ Run Vega     │      │ Init WASM    │
    │ Measure      │      │ Run Neutrino │
    │ Save Results │      │ Measure      │
    │ Close Tab    │      │ Save Results │
    └──────────────┘      └──────────────┘
```

## Functional Requirements

### FR-1: Data Generation

**FR-1.1**: Generate test data in both CSV and .ntro formats
- Sizes: 10K, 100K, 1M rows
- Columns: id, category (8 values), region (5 values), date, sales, quantity, price, discount, profit
- Same random seed for both formats to ensure identical data

**FR-1.2**: Include file size in output
- Log CSV file size
- Log .ntro file size
- Calculate compression ratio

### FR-2: Dashboard (index.html)

**FR-2.1**: Test controls
- Select data size (10K, 100K, 1M)
- Run Vega test only
- Run Neutrino test only
- Run both tests sequentially
- Clear results

**FR-2.2**: Results display
- Table showing all test results
- Columns: Size, Vega Time, Vega Memory, Neutrino Time, Neutrino Memory, Time Speedup, Memory Savings
- Visual charts comparing results
- Export results as JSON/CSV

**FR-2.3**: Instructions
- How to generate test data
- How to interpret results
- Known limitations

### FR-3: Vega Test Page (test-vega.html)

**FR-3.1**: Load CSV data
- Fetch CSV file
- Parse and load into Vega
- Measure load time separately from render time

**FR-3.2**: Run aggregation
- Same Vega spec as current demo (aggregate by category)
- Measure aggregation/render time

**FR-3.3**: Measure memory
- Memory before loading
- Memory after loading
- Memory after rendering
- Calculate deltas

**FR-3.4**: Report results
- Save to localStorage
- Auto-close or redirect back to dashboard
- Show results on page if not auto-closing

### FR-4: Neutrino Test Page (test-neutrino.html)

**FR-4.1**: Initialize WASM
- Load Neutrino WASM module
- Measure initialization time

**FR-4.2**: Load .ntro data
- Fetch .ntro file
- Load directly into Neutrino
- Measure load time

**FR-4.3**: Run aggregation
- Same aggregation as Vega test
- Use NeutrinoAggregate transform
- Measure aggregation/render time

**FR-4.4**: Report results
- Same as FR-3.4

### FR-5: Results Storage

**FR-5.1**: Store in localStorage
```javascript
{
  "benchmark_results": {
    "vega_10k": { loadTime, renderTime, totalTime, memoryBefore, memoryAfter, memoryDelta, timestamp },
    "neutrino_10k": { ... },
    "vega_100k": { ... },
    ...
  }
}
```

**FR-5.2**: Persist across page refreshes
- Results survive navigation
- Clear button to reset

### FR-6: Accurate Measurement

**FR-6.1**: Timing
- Use `performance.now()` for high-resolution timing
- Separate measurements for:
  - WASM initialization (Neutrino only)
  - Data fetch time
  - Data parse/load time
  - Aggregation time
  - Render time
  - Total time

**FR-6.2**: Memory
- Use `performance.memory` API (Chrome only)
- Document how to enable: `chrome --enable-precise-memory-info`
- Measure at multiple points
- Allow GC time before measurements

**FR-6.3**: Isolation
- Fresh page load for each test
- No shared state between Vega and Neutrino tests
- Force GC if available before measurements

## Non-Functional Requirements

### NFR-1: Accuracy
- Results within 5% of actual performance
- Clear indication when memory API not available
- Warnings for potential measurement issues

### NFR-2: Usability
- Clear instructions
- One-click test execution
- Visual results comparison
- Export functionality

### NFR-3: Browser Support
- Chrome (primary - has memory API)
- Firefox (timing only)
- Safari (timing only)

## Test Data Specification

### Schema

| Column | Type | Values | Notes |
|--------|------|--------|-------|
| id | Integer | 0 to N-1 | Sequential |
| category | String | 8 categories | Low cardinality - good compression |
| region | String | 5 regions | Low cardinality |
| date | String/Date | 2023 dates | ISO format |
| sales | Integer | 100-10099 | Random |
| quantity | Integer | 1-100 | Random |
| price | Integer | 10-509 | Random |
| discount | Float | 0-0.3 | Random |
| profit | Integer | -1000 to 3999 | Random |

### Expected File Sizes

| Rows | CSV Size | .ntro Size | Compression |
|------|----------|------------|-------------|
| 10K | ~1 MB | ~100-200 KB | 5-10x |
| 100K | ~10 MB | ~1-2 MB | 5-10x |
| 1M | ~100 MB | ~10-20 MB | 5-10x |

## UI Mockups

### Dashboard

```
╔══════════════════════════════════════════════════════════════════╗
║  ⚡ Vega vs Neutrino Benchmark Suite                              ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  📊 Test Configuration                                            ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │ Data Size:  (•) 10K rows   ( ) 100K rows   ( ) 1M rows     │ ║
║  │                                                              │ ║
║  │ [ Run Vega Test ]  [ Run Neutrino Test ]  [ Run Both ]      │ ║
║  │                                                              │ ║
║  │ [ Clear Results ]  [ Export Results ]                       │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
║                                                                   ║
║  📈 Results                                                       ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │ Size  │ Vega      │ Neutrino  │ Speedup │ Memory Savings   │ ║
║  │───────┼───────────┼───────────┼─────────┼──────────────────│ ║
║  │ 10K   │ 150ms     │ 30ms      │ 5.0x    │ 3.2x             │ ║
║  │       │ 45 MB     │ 14 MB     │         │                  │ ║
║  │───────┼───────────┼───────────┼─────────┼──────────────────│ ║
║  │ 100K  │ 1,200ms   │ 180ms     │ 6.7x    │ 4.1x             │ ║
║  │       │ 450 MB    │ 110 MB    │         │                  │ ║
║  │───────┼───────────┼───────────┼─────────┼──────────────────│ ║
║  │ 1M    │ 12,000ms  │ 1,500ms   │ 8.0x    │ 4.5x             │ ║
║  │       │ 4,500 MB  │ 1,000 MB  │         │                  │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
║                                                                   ║
║  📝 Notes                                                         ║
║  • Each test runs in a fresh page to ensure accurate measurements ║
║  • Memory measurements require Chrome with --enable-precise-memory║
║  • .ntro files provide 5-10x compression over CSV                 ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

### Test Page (while running)

```
╔══════════════════════════════════════════════════════════════════╗
║  🔄 Running Vega Test - 100K Rows                                 ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Progress:                                                        ║
║  ✓ Measuring initial memory...              45 MB                ║
║  ✓ Fetching benchmark-100k.csv...           1,234ms              ║
║  ✓ Parsing CSV data...                      567ms                ║
║  ⏳ Running aggregation...                                        ║
║  ○ Measuring final memory...                                      ║
║  ○ Saving results...                                              ║
║                                                                   ║
║  [Cancel Test]                                                    ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

## Implementation Plan

### Phase 1: Data Generation
1. Create `generate-benchmark-data.js` script
2. Generate CSV files for 10K, 100K, 1M rows
3. Generate corresponding .ntro files
4. Document file sizes and compression ratios

### Phase 2: Test Pages
1. Create `test-vega.html` with CSV loading
2. Create `test-neutrino.html` with .ntro loading
3. Implement accurate timing and memory measurement
4. Add results storage to localStorage

### Phase 3: Dashboard
1. Create `index.html` dashboard
2. Implement test launching (opens new tabs)
3. Implement results display and comparison
4. Add export functionality

### Phase 4: Polish
1. Add instructions and documentation
2. Handle edge cases (no memory API, errors)
3. Visual improvements
4. Testing across browsers

## Success Criteria

1. **Accurate Measurements**: Results match expected performance characteristics
   - Neutrino should show 5-10x faster total time
   - Neutrino should show 3-5x less memory usage

2. **Reproducibility**: Running same test multiple times gives consistent results (within 10%)

3. **Isolation**: Tests don't interfere with each other

4. **Usability**: New users can run benchmark in under 2 minutes

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Memory API not available | Show warning, continue with timing only |
| Large files slow to generate | Pre-generate and commit to repo |
| Browser tab limits | Run tests sequentially |
| WASM loading fails | Clear error messages, retry option |
| Results lost on refresh | Use localStorage persistence |

## Open Questions

1. Should we also test with data loaded via `fetch()` into both systems (to isolate aggregation performance)?
2. Should we add WebSocket/streaming tests for real-time data scenarios?
3. Should we measure rendering performance separately from aggregation?
4. Should we include warmup runs before measured runs?

## Appendix: Current Demo Issues

The current `neutrino-comparison.html` has these specific issues:

1. **Lines 237-267**: `generateData()` creates JavaScript arrays
2. **Lines 471-478**: Standard Vega receives the same JS array via `changeset.insert(data)`
3. **Lines 521-526**: Neutrino receives the same JS array via `changeset.insert(data)`
4. **Lines 157-161**: Warning acknowledges the issue but doesn't fix it

To truly compare, Neutrino should load from `.ntro` files and Vega from CSV files.
