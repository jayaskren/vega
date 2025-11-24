# Vega-Neutrino Quick Reference

## 🚀 One-Minute Start

```javascript
import * as vega from 'vega';
import { enableNeutrino } from 'vega-neutrino';

const spec = {
  data: [{
    name: 'mydata',
    url: 'data.csv',
    neutrino: true  // ← Add this!
  }]
};

const view = new vega.View(vega.parse(spec)).initialize('#vis');
await enableNeutrino(view);
await view.runAsync();
```

## 📊 Enable Neutrino in Vega Spec

### CSV with Neutrino
```json
{
  "data": [{
    "name": "sales",
    "url": "data/sales.csv",
    "format": {"type": "csv"},
    "neutrino": true
  }]
}
```

### .ntro File (Fastest)
```json
{
  "data": [{
    "name": "sales",
    "url": "data/sales.ntro",
    "format": {"type": "neutrino"}
  }]
}
```

### Inline Data
```json
{
  "data": [{
    "name": "sales",
    "neutrino": true,
    "values": [
      {"category": "A", "sales": 100},
      {"category": "B", "sales": 200}
    ]
  }]
}
```

## ⚡ Performance Cheat Sheet

| Dataset | Standard Vega | With Neutrino | Speedup |
|---------|---------------|---------------|---------|
| 100K rows | 200ms | 40ms | **5x** |
| 1M rows | 2s | 200ms | **10x** |
| 10M rows | ❌ OOM | 2s | **∞** |

## 🎯 Common Operations

### Generate Test Data
```bash
node examples/generate-test-data.js 100000 data/test.csv
```

### Export to .ntro
```javascript
import { exportDatasetAsNtro } from 'vega-neutrino';

const ntroBytes = exportDatasetAsNtro(view, 'datasetName');
// Save to file or IndexedDB
```

### Check Memory Usage
```javascript
import { getNeutrinoMemoryUsage } from 'vega-neutrino';

const usage = getNeutrinoMemoryUsage(view);
console.log(`Memory: ${usage.total_bytes / 1048576} MB`);
```

### Configure Workers
```javascript
await enableNeutrino(view, {
  workerCount: 4,        // Number of workers
  threshold: 100000      // Use workers for datasets > 100K rows
});
```

## 📦 File Formats

| Format | Load Time | File Size | Use Case |
|--------|-----------|-----------|----------|
| CSV | 5-10s | 100MB | Development |
| CSV + Neutrino | 1-2s | 100MB | Testing |
| **.ntro** | **100-200ms** | **5-15MB** | **Production** |

## 🔧 Accelerated Transforms

These transforms are automatically accelerated:

- ✅ `aggregate` - SIMD sum, count, mean, min, max
- ✅ `filter` - Bitmap-based filtering
- ✅ `window` - Efficient window functions
- ✅ `collect` - Pre-indexed sorting

## 🌐 Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 14+ |
| Edge | 80+ |

## 📁 Example Files

```
examples/
├── neutrino-concept-demo.html      ← Start here!
├── neutrino-simple-example.html    ← Documentation
├── neutrino-demo.html              ← Interactive demo
├── neutrino-bar-chart.vg.json      ← Vega spec example
├── generate-test-data.js           ← Data generator
├── README.md                       ← Full guide
└── TESTING_GUIDE.md                ← Testing instructions
```

## 🐛 Troubleshooting

### Error: "vega-neutrino is not defined"
```bash
cd packages/vega-neutrino
npm run build
```

### Slow Performance
- Check dataset size (< 10K rows may be slower due to overhead)
- Verify WASM initialized: `vegaNeutrino.isInitialized()`
- Check browser console for errors

### Memory Issues
- Use .ntro format instead of CSV
- Enable IndexedDB caching
- Reduce dataset size or use sampling

## 💡 Pro Tips

1. **Use .ntro in production** - 10-50x faster loading
2. **Enable caching** - Automatic IndexedDB storage
3. **Workers for large data** - Set threshold to 100K rows
4. **Monitor memory** - Use `getNeutrinoMemoryUsage()`
5. **Test with real data** - Generate samples with `generate-test-data.js`

## 📚 Learn More

- [Full Documentation](README.md)
- [Testing Guide](TESTING_GUIDE.md)
- [Implementation Plan](../neutrino-vega-implementation-plan.md)
- [API Reference](../Neutrino_API_DOCUMENTATION.md)

## 🎓 Example Workflow

```bash
# 1. Generate test data
node examples/generate-test-data.js 100000 data/sales.csv

# 2. Create Vega spec with neutrino: true
# (see neutrino-bar-chart.vg.json)

# 3. Build vega-neutrino
cd packages/vega-neutrino && npm run build && cd ../..

# 4. Open demo
open examples/neutrino-demo.html

# 5. Test with your data
# Load CSV, export as .ntro, reload .ntro (10-50x faster!)
```

## 🎯 Key Metrics to Watch

- **Load Time**: Should be < 2s for 1M rows
- **Memory Usage**: Should be 3-5x less than standard Vega
- **Aggregation Time**: Should be 5-10x faster
- **File Size**: .ntro should be 7-20x smaller than CSV

---

**Quick Links**:
- 🎨 [Concept Demo](neutrino-concept-demo.html)
- 🧪 [Interactive Demo](neutrino-demo.html)
- 📖 [Full Docs](README.md)

