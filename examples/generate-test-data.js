#!/usr/bin/env node

/**
 * Generate test CSV data for Vega-Neutrino examples
 * 
 * Usage:
 *   node generate-test-data.js [rows] [output-file]
 * 
 * Example:
 *   node generate-test-data.js 100000 data/sales.csv
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DEFAULT_ROWS = 100000;
const DEFAULT_OUTPUT = 'data/sales.csv';

// Data generators
const categories = ['Electronics', 'Clothing', 'Food', 'Books', 'Toys', 'Sports', 'Home', 'Garden', 'Automotive', 'Health'];
const regions = ['North', 'South', 'East', 'West', 'Central'];
const products = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'];

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateRow(id) {
  const date = randomDate(new Date(2023, 0, 1), new Date(2023, 11, 31));
  const sales = randomInt(100, 10000);
  const quantity = randomInt(1, 100);
  const price = (sales / quantity).toFixed(2);
  
  return {
    id,
    date: date.toISOString().split('T')[0],
    category: randomChoice(categories),
    region: randomChoice(regions),
    product: randomChoice(products),
    sales,
    quantity,
    price,
    discount: (Math.random() * 0.3).toFixed(2),
    profit: (sales * (0.2 + Math.random() * 0.3)).toFixed(2)
  };
}

function generateCSV(rowCount) {
  const headers = ['id', 'date', 'category', 'region', 'product', 'sales', 'quantity', 'price', 'discount', 'profit'];
  const rows = [headers.join(',')];
  
  console.log(`Generating ${rowCount.toLocaleString()} rows...`);
  const startTime = Date.now();
  
  for (let i = 0; i < rowCount; i++) {
    const row = generateRow(i);
    rows.push(Object.values(row).join(','));
    
    if ((i + 1) % 10000 === 0) {
      process.stdout.write(`\rProgress: ${((i + 1) / rowCount * 100).toFixed(1)}%`);
    }
  }
  
  const elapsed = Date.now() - startTime;
  console.log(`\nGenerated ${rowCount.toLocaleString()} rows in ${elapsed}ms`);
  
  return rows.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const rowCount = args[0] ? parseInt(args[0]) : DEFAULT_ROWS;
  const outputFile = args[1] || DEFAULT_OUTPUT;
  
  if (isNaN(rowCount) || rowCount <= 0) {
    console.error('Error: Row count must be a positive number');
    process.exit(1);
  }
  
  console.log('Vega-Neutrino Test Data Generator');
  console.log('=================================');
  console.log(`Rows: ${rowCount.toLocaleString()}`);
  console.log(`Output: ${outputFile}\n`);
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created directory: ${outputDir}`);
  }
  
  // Generate CSV
  const csv = generateCSV(rowCount);
  
  // Write to file
  console.log(`Writing to ${outputFile}...`);
  fs.writeFileSync(outputFile, csv);
  
  // Get file size
  const stats = fs.statSync(outputFile);
  const sizeMB = (stats.size / 1048576).toFixed(2);
  
  console.log(`\n✓ Success!`);
  console.log(`  File: ${outputFile}`);
  console.log(`  Size: ${sizeMB} MB`);
  console.log(`  Rows: ${rowCount.toLocaleString()}`);
  console.log(`\nYou can now use this file in Vega-Neutrino examples.`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateCSV, generateRow };

