#!/usr/bin/env node

/**
 * Generate benchmark data files for Vega-Neutrino comparison
 *
 * Usage: node generate-benchmark-data.js [size]
 * Sizes: 100k, 1m, 10m, all (default: all)
 *
 * Generates:
 * - data/benchmark-{size}.csv
 * - data/benchmark-{size}.ntro (requires Neutrino)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SIZES = {
  '100k': 100000,
  '1m': 1000000,
  '10m': 10000000
};

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports',
  'Books',
  'Toys',
  'Food',
  'Automotive'
];

const REGIONS = [
  'North',
  'South',
  'East',
  'West',
  'Central'
];

// Seeded random number generator for reproducibility
class SeededRandom {
  constructor(seed = 12345) {
    this.seed = seed;
  }

  next() {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextFloat(min, max) {
    return this.next() * (max - min) + min;
  }

  pick(array) {
    return array[this.nextInt(0, array.length - 1)];
  }
}

// Generate a random date in 2023
function generateDate(rng) {
  const month = rng.nextInt(1, 12);
  const day = rng.nextInt(1, 28);
  return `2023-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Generate CSV data
function generateCSV(numRows, outputPath) {
  console.log(`Generating ${numRows.toLocaleString()} rows of CSV data...`);

  const rng = new SeededRandom(12345);
  const stream = fs.createWriteStream(outputPath);

  // Write header
  stream.write('id,category,region,date,sales,quantity,price,discount,profit\n');

  // Write rows in batches for memory efficiency
  const BATCH_SIZE = 10000;
  let buffer = '';

  for (let i = 0; i < numRows; i++) {
    const category = rng.pick(CATEGORIES);
    const region = rng.pick(REGIONS);
    const date = generateDate(rng);
    const sales = rng.nextInt(100, 10099);
    const quantity = rng.nextInt(1, 100);
    const price = rng.nextInt(10, 509);
    const discount = rng.nextFloat(0, 0.3).toFixed(2);
    const profit = rng.nextInt(-1000, 3999);

    buffer += `${i},${category},${region},${date},${sales},${quantity},${price},${discount},${profit}\n`;

    if ((i + 1) % BATCH_SIZE === 0) {
      stream.write(buffer);
      buffer = '';

      if ((i + 1) % 100000 === 0) {
        console.log(`  Progress: ${((i + 1) / numRows * 100).toFixed(1)}%`);
      }
    }
  }

  // Write remaining buffer
  if (buffer) {
    stream.write(buffer);
  }

  return new Promise((resolve, reject) => {
    stream.end((err) => {
      if (err) reject(err);
      else {
        const stats = fs.statSync(outputPath);
        console.log(`  Written: ${outputPath} (${formatBytes(stats.size)})`);
        resolve(stats.size);
      }
    });
  });
}

// Generate .ntro file using Neutrino
// Note: This requires Neutrino WASM to be available
async function generateNtro(csvPath, ntroPath) {
  console.log(`Converting to .ntro format...`);

  // For now, we'll create a placeholder that explains how to generate
  // In a real implementation, this would use the Neutrino WASM module

  const placeholder = `# Neutrino Binary Format
#
# This is a placeholder file. To generate actual .ntro files:
#
# 1. Load the CSV data into Neutrino using the web interface
# 2. Export as .ntro format
#
# Or use the Neutrino CLI:
#   neutrino convert ${path.basename(csvPath)} ${path.basename(ntroPath)}
#
# CSV source: ${csvPath}
`;

  fs.writeFileSync(ntroPath, placeholder);
  console.log(`  Written: ${ntroPath} (placeholder - needs Neutrino conversion)`);

  return fs.statSync(ntroPath).size;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

async function main() {
  const args = process.argv.slice(2);
  let sizesToGenerate = ['100k', '1m', '10m'];

  if (args.length > 0 && args[0] !== 'all') {
    const requested = args[0].toLowerCase();
    if (!SIZES[requested]) {
      console.error(`Invalid size: ${requested}`);
      console.error(`Valid sizes: ${Object.keys(SIZES).join(', ')}, all`);
      process.exit(1);
    }
    sizesToGenerate = [requested];
  }

  // Ensure data directory exists
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  console.log('Vega-Neutrino Benchmark Data Generator');
  console.log('======================================\n');

  const results = [];

  for (const size of sizesToGenerate) {
    const numRows = SIZES[size];
    const csvPath = path.join(dataDir, `benchmark-${size}.csv`);
    const ntroPath = path.join(dataDir, `benchmark-${size}.ntro`);

    console.log(`\nGenerating ${size.toUpperCase()} dataset (${numRows.toLocaleString()} rows):`);
    console.log('-'.repeat(50));

    try {
      const csvSize = await generateCSV(numRows, csvPath);
      const ntroSize = await generateNtro(csvPath, ntroPath);

      results.push({
        size,
        rows: numRows,
        csvSize,
        ntroSize,
        ratio: (csvSize / ntroSize).toFixed(1)
      });
    } catch (err) {
      console.error(`Error generating ${size}:`, err);
    }
  }

  // Print summary
  console.log('\n\nSummary');
  console.log('=======\n');
  console.log('Size\t\tRows\t\tCSV Size\t.ntro Size\tRatio');
  console.log('-'.repeat(70));

  for (const result of results) {
    console.log(`${result.size.toUpperCase()}\t\t${result.rows.toLocaleString()}\t\t${formatBytes(result.csvSize)}\t\t${formatBytes(result.ntroSize)}\t\t${result.ratio}x`);
  }

  console.log('\nNote: .ntro files are placeholders. Use Neutrino to generate actual binary files.');
  console.log('See the generated .ntro files for conversion instructions.');
}

main().catch(console.error);
