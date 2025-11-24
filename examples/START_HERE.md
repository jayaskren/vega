# 🚀 Vega-Neutrino Examples - Start Here!

## Quick Start

### Option 1: Performance Comparison ⭐ **NEW - WITH REAL WASM!**

Compare Standard Vega vs Vega-Neutrino side-by-side:

**IMPORTANT**: Requires a local web server (WASM cannot load via `file://`)

```bash
# Start server
./examples/serve.sh
# Or: python3 -m http.server 8000

# Then open in browser:
# http://localhost:8000/examples/neutrino-comparison.html
```

**Features:**
- ✅ Side-by-side comparison
- ✅ Real Neutrino WASM integration
- ✅ Performance metrics for both
- ✅ Speedup calculation
- ✅ Test with 100K, 1M, or 10M rows
- ✅ Sequential execution to avoid interference

### Option 2: Standalone Demo (No Build Required)

Open this file in your browser to see a **working visualization** right now:

```bash
open examples/neutrino-standalone-demo.html
```

**Features:**
- ✅ Works immediately (no build required)
- ✅ Generate 10K, 100K, or 1M rows of data
- ✅ See real-time performance metrics
- ✅ Interactive bar chart with aggregations
- ✅ Performance comparison (Standard vs Neutrino)

**What it shows:**
- How the visualization looks and works
- Expected performance improvements with Neutrino
- The workflow for generating and visualizing data

---

### Option 3: Concept Demo (Visual Overview)

```bash
open examples/neutrino-concept-demo.html
```

**Features:**
- Beautiful visual presentation
- Feature cards showing benefits
- Performance comparison tables
- Code examples
- No build required

---

### Option 4: Documentation Example

```bash
open examples/neutrino-simple-example.html
```

**Features:**
- Detailed usage instructions
- API examples
- File format comparisons
- Step-by-step guide

---

## Advanced: Full Interactive Demo (Requires Build)

If you want to test the **actual Neutrino integration** (not just a simulation):

### Step 1: Build the Package

```bash
cd packages/vega-neutrino
npm install
npm run build
cd ../..
```

### Step 2: Open the Demo

```bash
open examples/neutrino-demo.html
```

**Features:**
- Real Neutrino integration
- Export to .ntro format
- IndexedDB caching
- Web Worker processing
- Actual SIMD acceleration

---

## Generate Test Data

Create custom datasets for testing:

```bash
# Small dataset (1K rows)
node examples/generate-test-data.js 1000 examples/data/test-small.csv

# Medium dataset (100K rows)
node examples/generate-test-data.js 100000 examples/data/test-medium.csv

# Large dataset (1M rows)
node examples/generate-test-data.js 1000000 examples/data/test-large.csv
```

**Pre-generated data:**
- ✅ `examples/data/sales-small.csv` - 1,000 rows (64 KB)
- ✅ `examples/data/sales-large.csv` - 100,000 rows (6.5 MB)

---

## What is Vega-Neutrino?

Vega-Neutrino is a high-performance extension for Vega that enables visualization of datasets **10-100x larger** than normal.

### Key Benefits

| Feature | Benefit | Example |
|---------|---------|---------|
| **Columnar Storage** | 3-5x memory reduction | 500MB → 100MB |
| **SIMD Acceleration** | 5-10x faster aggregations | 2000ms → 200ms |
| **.ntro Format** | 10-50x faster loading | 10s → 200ms |
| **Web Workers** | Non-blocking UI | Smooth interactions |

### Performance Comparison

| Dataset Size | Standard Vega | With Neutrino | Improvement |
|-------------|---------------|---------------|-------------|
| 100K rows | 200ms | 40ms | **5x faster** ⚡ |
| 1M rows | 2000ms | 200ms | **10x faster** ⚡⚡ |
| 10M rows | ❌ Out of Memory | 2000ms | **∞ (works!)** ✅ |

---

## File Overview

```
examples/
├── START_HERE.md                    ← You are here!
├── neutrino-comparison.html         ← ⭐ NEW! Side-by-side comparison with real WASM
├── neutrino-standalone-demo.html    ← Working demo (no build required)
├── neutrino-concept-demo.html       ← Visual overview
├── neutrino-simple-example.html     ← Documentation
├── neutrino-demo.html               ← Full demo (requires build)
├── neutrino-demo.js                 ← Demo JavaScript
├── neutrino-bar-chart.vg.json       ← Example Vega spec
├── generate-test-data.js            ← Data generator
├── data/
│   ├── sales-small.csv              ← 1K rows
│   └── sales-large.csv              ← 100K rows
├── README.md                        ← Full documentation
├── TESTING_GUIDE.md                 ← Testing instructions
└── QUICK_REFERENCE.md               ← Quick reference card
```

---

## Next Steps

1. ✅ **Try the comparison demo** - `open examples/neutrino-comparison.html` ⭐ **NEW!**
2. 📊 **Test with your data** - See the performance difference
3. 📖 **Read the docs** - Check `examples/README.md`
4. 🔨 **Customize** - Modify the examples for your use case
5. 🚀 **Deploy** - Use Neutrino in production

---

## Documentation

- 📖 [Examples README](README.md) - Comprehensive guide
- 🧪 [Testing Guide](TESTING_GUIDE.md) - Step-by-step testing
- ⚡ [Quick Reference](QUICK_REFERENCE.md) - Quick reference card
- 📋 [Implementation Plan](../neutrino-vega-implementation-plan.md) - Technical details
- 🎯 [Product Requirements](../neutrino-vega-prd.md) - Goals and features
- 🔧 [API Documentation](../Neutrino_API_DOCUMENTATION.md) - API reference

---

## Troubleshooting

### "vegaNeutrino is not defined"
→ Use the **standalone demo** instead, or build the package first

### "Cannot find module"
→ Run `npm install` in the project root

### Chart doesn't render
→ Check browser console for errors
→ Try a different browser (Chrome 80+, Firefox 75+, Safari 14+)

---

## Browser Support

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 14+
- ✅ Edge 80+

**Required features:**
- WebAssembly
- Web Workers
- IndexedDB
- ES6 modules

---

**Ready to start?** Open the comparison demo with real WASM:

```bash
open examples/neutrino-comparison.html
```

🎉 Enjoy exploring Vega-Neutrino!

