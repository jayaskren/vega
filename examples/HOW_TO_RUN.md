# How to Run Neutrino Demos

## ⚠️ IMPORTANT: Use a Local Web Server

The Neutrino demos **require a local web server** because:
- WebAssembly (WASM) files cannot be loaded via `file://` protocol
- Browsers block CORS requests from local files
- The demo will show errors and disable buttons if opened directly

## 🚀 Quick Start

### Method 1: Use the provided script (Easiest!)

```bash
./examples/serve.sh
```

This will:
1. Start a local HTTP server on port 8000
2. Show you the URLs to open
3. Work with Python 3, Python 2, or Node.js (whichever is available)

Then open in your browser:
- **Comparison Demo**: http://localhost:8000/examples/neutrino-comparison.html
- **Standalone Demo**: http://localhost:8000/examples/neutrino-standalone-demo.html

### Method 2: Python 3 (Recommended)

```bash
# From the repository root
python3 -m http.server 8000

# Then open: http://localhost:8000/examples/neutrino-comparison.html
```

### Method 3: Python 2

```bash
# From the repository root
python -m SimpleHTTPServer 8000

# Then open: http://localhost:8000/examples/neutrino-comparison.html
```

### Method 4: Node.js

```bash
# From the repository root
npx http-server -p 8000

# Then open: http://localhost:8000/examples/neutrino-comparison.html
```

## 🎯 What to Open

Once the server is running, open these URLs:

### 1. Performance Comparison (Recommended!)
**URL**: http://localhost:8000/examples/neutrino-comparison.html

- Side-by-side comparison of Standard Vega vs Neutrino
- Real WASM integration
- Test with 100K, 1M, or 10M rows
- See actual performance differences

### 2. Standalone Demo (No WASM needed)
**URL**: http://localhost:8000/examples/neutrino-standalone-demo.html

- Works without WASM
- Shows expected Neutrino benefits
- Good for understanding the concept

### 3. Concept Demo
**URL**: http://localhost:8000/examples/neutrino-concept-demo.html

- Visual overview of Neutrino features
- No WASM needed

## ❌ What NOT to Do

**DON'T** open the HTML files directly:
```bash
# ❌ This will NOT work:
open examples/neutrino-comparison.html
firefox examples/neutrino-comparison.html
```

**Why?** This opens the file with `file://` protocol, which cannot load WASM files due to browser security restrictions.

## ✅ How to Verify It's Working

When you open the comparison demo via HTTP server, you should see:

1. **In the right panel log**:
   ```
   Initializing Neutrino WASM...
   ✓ Neutrino enabled and verified!
   ```

2. **No CORS errors** in the browser console (F12)

3. **Test buttons are enabled** (not grayed out)

4. **Performance difference** when you click a test button

## 🐛 Troubleshooting

### Error: "CORS request not http"
- **Cause**: You opened the file directly instead of via HTTP server
- **Solution**: Use one of the methods above to start a server

### Error: "vegaNeutrino is not defined"
- **Cause**: The package isn't built
- **Solution**: 
  ```bash
  cd packages/vega-neutrino
  npm run build
  cd ../..
  ```

### Error: "Address already in use"
- **Cause**: Port 8000 is already in use
- **Solution**: Use a different port:
  ```bash
  ./examples/serve.sh 8001
  # Or: python3 -m http.server 8001
  ```

### Buttons are disabled with error message
- **Cause**: Neutrino failed to initialize
- **Solution**: Check the right panel log for specific error
- Most likely: You need to use HTTP server (see above)

## 📚 More Information

- **Full Documentation**: `examples/START_HERE.md`
- **Comparison Demo Guide**: `NEUTRINO_COMPARISON_DEMO.md`
- **WASM Integration**: `WASM_INTEGRATION_GUIDE.md`

## 🎉 Ready to Test!

```bash
# Start the server
./examples/serve.sh

# Open in browser
# http://localhost:8000/examples/neutrino-comparison.html

# Click "100K Rows" and watch the magic! ✨
```

