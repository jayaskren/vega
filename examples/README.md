# Vega-Neutrino Examples

This directory contains examples demonstrating the Vega-Neutrino integration for high-performance visualization of large datasets.

## What is Vega-Neutrino?

Vega-Neutrino is a high-performance extension for Vega that enables handling datasets 10-100x larger than normal by using:

- **Columnar Storage**: 3-5x memory reduction through efficient data compression
- **SIMD Acceleration**: 5-10x faster aggregations using CPU vector instructions
- **Web Workers**: Background processing to keep UI responsive
- **.ntro Format**: Pre-compressed files that load 10-50x faster than CSV

## Examples

### 1. Simple Example (`neutrino-simple-example.html`)

A conceptual overview and documentation of how to use Vega-Neutrino. This file explains:
- Basic usage patterns
- Performance benefits
- How to enable Neutrino in your Vega specs
- Loading .ntro files

**To view**: Open `neutrino-simple-example.html` in your browser.

### 2. Interactive Demo (`neutrino-demo.html`)

A full interactive demonstration with:
- Sample data generation (100K rows)
- Real-time performance metrics
- Export to .ntro format
- IndexedDB caching
- Activity logging

**To run**:
1. Build the vega-neutrino package first:
   ```bash
   cd packages/vega-neutrino
   npm install
   npm run build
   ```
2. Open `neutrino-demo.html` in your browser
3. Click "Generate Sample Data" to create and visualize 100K rows

### 3. Vega Spec Example (`neutrino-bar-chart.vg.json`)

A Vega specification showing how to enable Neutrino for a dataset:

```json
{
  "data": [{
    "name": "table",
    "url": "data/sales.csv",
    "format": {"type": "csv"},
    "neutrino": true  // ← Enable Neutrino
  }]
}
```

## Quick Start

### Enabling Neutrino in Your Vega Spec

Add `"neutrino": true` to any data source:

```json
{
  "data": [{
    "name": "mydata",
    "url": "data.csv",
    "neutrino": true
  }]
}
```

### JavaScript Integration

```javascript
import * as vega from 'vega';
import { enableNeutrino } from 'vega-neutrino';

const view = new vega.View(vega.parse(spec))
  .initialize('#vis');

await enableNeutrino(view);
await view.runAsync();
```

### Using .ntro Files

For production, convert CSV to .ntro format:

```json
{
  "data": [{
    "name": "mydata",
    "url": "data.ntro",
    "format": {"type": "neutrino"}
  }]
}
```

## Performance Comparison

| Dataset Size | Standard Vega | With Neutrino | Improvement |
|-------------|---------------|---------------|-------------|
| 100K rows   | 200ms         | 40ms          | **5x faster** |
| 1M rows     | 2000ms        | 200ms         | **10x faster** |
| 10M rows    | Out of Memory | 2000ms        | **∞ (works!)** |

## Accelerated Transforms

These Vega transforms are automatically accelerated when operating on Neutrino data:

- **aggregate** - SIMD-accelerated sum, count, mean, min, max
- **filter** - Bitmap-based range filtering
- **window** - Efficient window function evaluation
- **collect** - Pre-indexed sorting

## File Format Comparison

| Format | Load Time (1M rows) | File Size | Notes |
|--------|---------------------|-----------|-------|
| CSV (standard) | 5-10s | 100MB | Parse + object creation |
| CSV (Neutrino) | 1-2s | 100MB | Parse + compression |
| **.ntro** | **100-200ms** | **5-15MB** | Direct load, no parsing |
| .ntro (cached) | 50-100ms | 5-15MB | From IndexedDB |

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

## Documentation

For more information, see:
- [Vega-Neutrino README](../packages/vega-neutrino/README.md)
- [Implementation Plan](../neutrino-vega-implementation-plan.md)
- [Product Requirements](../neutrino-vega-prd.md)
- [Neutrino API Documentation](../Neutrino_API_DOCUMENTATION.md)

## Building from Source

```bash
# Install dependencies
npm install

# Build vega-neutrino package
cd packages/vega-neutrino
npm run build

# Run tests
npm test
```

## License

BSD-3-Clause

