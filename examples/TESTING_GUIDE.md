# Vega-Neutrino Testing Guide

This guide explains how to test the Vega-Neutrino integration examples.

## Quick Start

### 1. View the Concept Demo (No Build Required)

The easiest way to see what Vega-Neutrino is about:

```bash
# Open in your browser
open examples/neutrino-concept-demo.html
```

This shows:
- Feature overview
- Performance comparisons
- How to enable Neutrino in specs
- A working Vega chart (standard, for demonstration)

### 2. View the Documentation Example

```bash
open examples/neutrino-simple-example.html
```

This provides:
- Detailed usage instructions
- Code examples
- Performance metrics
- File format comparisons

### 3. Run the Interactive Demo (Requires Build)

To test the actual Neutrino integration:

```bash
# 1. Build the vega-neutrino package
cd packages/vega-neutrino
npm install
npm run build
cd ../..

# 2. Open the demo
open examples/neutrino-demo.html
```

Features:
- Generate 100K rows of sample data
- See real-time performance metrics
- Export data as .ntro format
- Test IndexedDB caching

## Test Data

### Generate Sample Data

We've included a data generator script:

```bash
# Generate 1,000 rows (small test)
node examples/generate-test-data.js 1000 examples/data/sales-small.csv

# Generate 100,000 rows (medium test)
node examples/generate-test-data.js 100000 examples/data/sales-large.csv

# Generate 1,000,000 rows (large test)
node examples/generate-test-data.js 1000000 examples/data/sales-xlarge.csv
```

### Pre-generated Data

The following files are already created:
- `examples/data/sales-small.csv` - 1K rows (~60 KB)
- `examples/data/sales-large.csv` - 100K rows (~6.4 MB)

## Testing Scenarios

### Scenario 1: Basic Functionality

1. Open `neutrino-concept-demo.html`
2. Verify the chart renders correctly
3. Check that all feature cards display properly

**Expected Result**: Clean UI with working Vega chart

### Scenario 2: Performance Testing

1. Build vega-neutrino package
2. Open `neutrino-demo.html`
3. Click "Generate Sample Data (100K rows)"
4. Observe the performance metrics

**Expected Results**:
- Data generation: < 1 second
- Load time: < 500ms
- Aggregation time: < 100ms
- Memory usage: < 50MB

### Scenario 3: .ntro Export

1. In `neutrino-demo.html`, generate sample data
2. Click "Export as .ntro"
3. Save the file
4. Check file size

**Expected Result**: 
- File size should be 5-10x smaller than equivalent CSV
- File downloads successfully

### Scenario 4: Large Dataset

1. Generate 1M rows: `node examples/generate-test-data.js 1000000 examples/data/sales-xlarge.csv`
2. Modify `neutrino-demo.html` to load this file
3. Test performance

**Expected Results**:
- Standard Vega: May run out of memory
- With Neutrino: Should handle gracefully

## Troubleshooting

### Issue: "vega-neutrino is not defined"

**Solution**: Build the package first:
```bash
cd packages/vega-neutrino
npm run build
```

### Issue: "Cannot find module"

**Solution**: Install dependencies:
```bash
npm install
```

### Issue: Chart doesn't render

**Solution**: 
1. Check browser console for errors
2. Ensure you're using a modern browser (Chrome 80+, Firefox 75+, Safari 14+)
3. Try opening in a different browser

### Issue: Performance is slow

**Possible causes**:
1. WASM not initialized properly
2. Workers not available
3. Dataset too small (overhead dominates)

**Solution**: Check browser console for initialization messages

## Browser Compatibility

Tested browsers:
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 14+
- ✅ Edge 80+

Required features:
- WebAssembly
- Web Workers
- IndexedDB (for caching)
- ES6 modules

## Performance Benchmarks

Expected performance on modern hardware:

| Operation | 100K rows | 1M rows | 10M rows |
|-----------|-----------|---------|----------|
| Data generation | 50-100ms | 500ms-1s | 5-10s |
| CSV load (standard) | 200ms | 2-5s | 20-50s |
| CSV load (Neutrino) | 100ms | 1-2s | 10-20s |
| .ntro load | 20ms | 100-200ms | 1-2s |
| Aggregation (standard) | 50ms | 500ms-1s | OOM |
| Aggregation (Neutrino) | 10ms | 50-100ms | 500ms-1s |

## Next Steps

After testing the examples:

1. Read the [Implementation Plan](../neutrino-vega-implementation-plan.md)
2. Review the [API Documentation](../Neutrino_API_DOCUMENTATION.md)
3. Check the [Product Requirements](../neutrino-vega-prd.md)
4. Explore the source code in `packages/vega-neutrino/src/`

## Reporting Issues

If you encounter problems:

1. Check the browser console for errors
2. Verify you're using a supported browser
3. Ensure the package is built correctly
4. Check that test data files exist

## Additional Resources

- [Vega Documentation](https://vega.github.io/vega/)
- [Neutrino API Reference](../Neutrino_API_REFERENCE.md)
- [Vega-Neutrino README](../packages/vega-neutrino/README.md)

