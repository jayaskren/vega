/**
 * Neutrino-accelerated aggregation transform.
 * Uses WASM SIMD for high-performance aggregation operations.
 */

import { Transform, ingest } from 'vega-dataflow';
import { accessorName, inherits } from 'vega-util';
import * as bindings from '../wasm/bindings.js';

/**
 * NeutrinoAggregate - WASM-accelerated aggregation.
 * @param {Object} params - Transform parameters
 */
export default function NeutrinoAggregate(params) {
  Transform.call(this, null, params);
  this._cells = new Map();  // Group key -> output tuple
  this._source = null;      // Source data source
}

NeutrinoAggregate.Definition = {
  'type': 'NeutrinoAggregate',
  'metadata': { 'generates': true },
  'params': [
    { 'name': 'groupby', 'type': 'field', 'array': true },
    {
      'name': 'ops', 'type': 'enum', 'array': true,
      'values': ['count', 'valid', 'missing', 'sum', 'mean', 'average',
        'variance', 'variancep', 'stdev', 'stdevp', 'stderr',
        'median', 'q1', 'q3', 'min', 'max', 'distinct', 'values']
    },
    { 'name': 'fields', 'type': 'field', 'null': true, 'array': true },
    { 'name': 'as', 'type': 'string', 'null': true, 'array': true },
    { 'name': 'cross', 'type': 'boolean', 'default': false },
    { 'name': 'drop', 'type': 'boolean', 'default': true }
  ]
};

inherits(NeutrinoAggregate, Transform, {
  transform(_, pulse) {
    const out = pulse.fork(pulse.NO_SOURCE | pulse.NO_FIELDS);

    // Check if source is Neutrino data
    const source = this._getSourceDataSource(pulse);
    let tablePtr = null;
    let tempTable = null;

    if (source && source.getTablePtr) {
      // Use existing Neutrino table
      tablePtr = source.getTablePtr();
    } else {
      // Try to convert JavaScript data to Neutrino table
      try {
        const data = [];
        pulse.visit(pulse.SOURCE, tuple => {
          // Convert tuple to plain object
          const obj = {};
          for (const key in tuple) {
            if (key !== '_id' && key !== '_prev') {
              obj[key] = tuple[key];
            }
          }
          data.push(obj);
        });

        if (data.length > 0) {
          console.log(`🚀 NeutrinoAggregate: Converting ${data.length} rows to WasmTable...`);
          const startTime = performance.now();

          // Convert to WasmTable
          tempTable = bindings.loadJSON(null, data);
          tablePtr = tempTable;

          const conversionTime = Math.round(performance.now() - startTime);
          console.log(`✓ Conversion complete in ${conversionTime}ms`);
        } else {
          // No data, return empty result
          return this._fallbackAggregate(_, pulse, out);
        }
      } catch (error) {
        console.error('❌ NeutrinoAggregate: failed to convert data to WasmTable:', error);
        return this._fallbackAggregate(_, pulse, out);
      }
    }

    try {
      // Build aggregation config for WASM
      const config = this._buildConfig(_);
      console.log('🔧 Aggregation config:', config);

      // Execute aggregation in WASM
      console.log('⚡ Running WASM aggregation...');
      const aggStartTime = performance.now();
      const results = bindings.aggregate(tablePtr, config);
      const aggTime = Math.round(performance.now() - aggStartTime);
      console.log(`✓ WASM aggregation complete in ${aggTime}ms, ${results.length} groups`);

      // Convert results to Vega tuples
      const prevCells = this._cells;
      this._cells = new Map();

      for (const row of results) {
        const key = this._groupKey(row, _.groupby);

        let tuple = prevCells.get(key);
        if (tuple) {
          // Update existing tuple
          Object.assign(tuple, row);
          out.mod.push(tuple);
          prevCells.delete(key);
        } else {
          // Create new tuple
          tuple = ingest(row);
          out.add.push(tuple);
        }

        this._cells.set(key, tuple);
      }

      // Remove tuples for groups no longer present
      for (const tuple of prevCells.values()) {
        out.rem.push(tuple);
      }

      this.value = Array.from(this._cells.values());

      return out;
    } finally {
      // Clean up temporary table
      if (tempTable) {
        bindings.freeTable(tempTable);
      }
    }
  },

  _buildConfig(_) {
    const groupby = _.groupby
      ? _.groupby.map(f => accessorName(f))
      : [];

    const ops = _.ops || ['count'];
    const fields = _.fields || [];
    const as = _.as || [];

    const measures = ops.map((op, i) => ({
      op,
      field: fields[i] ? accessorName(fields[i]) : null,
      as: as[i] || this._defaultOutputName(op, fields[i])
    }));

    return {
      groupby,
      measures,
      cross: _.cross || false,
      drop: _.drop !== false
    };
  },

  _defaultOutputName(op, field) {
    const fieldName = field ? accessorName(field) : '';
    return `${op}${fieldName ? '_' + fieldName : ''}`;
  },

  _groupKey(row, groupby) {
    if (!groupby || groupby.length === 0) return '';
    return groupby.map(f => row[accessorName(f)]).join('|');
  },

  _getSourceDataSource(pulse) {
    // Walk up the dataflow to find NeutrinoDataSource
    let source = pulse.source;
    while (source) {
      if (source.getTablePtr) {
        return source;
      }
      // Check if it's a transform with source
      if (source.source) {
        source = source.source;
      } else if (source.value && source.value[0] && source.value[0]._ds) {
        return source.value[0]._ds;
      } else {
        break;
      }
    }
    return null;
  },

  _fallbackAggregate(_, pulse, out) {
    // JavaScript fallback for non-Neutrino data
    console.warn('NeutrinoAggregate: falling back to JS aggregate');

    const groupby = _.groupby || [];
    const ops = _.ops || ['count'];
    const fields = _.fields || [];
    const as = _.as || [];

    const groups = new Map();

    // Group tuples
    pulse.visit(pulse.SOURCE, tuple => {
      const key = groupby.map(f => f(tuple)).join('|');

      if (!groups.has(key)) {
        groups.set(key, {
          tuples: [],
          key: key,
          groupValues: groupby.map(f => f(tuple))
        });
      }
      groups.get(key).tuples.push(tuple);
    });

    // Compute aggregates
    for (const [key, group] of groups) {
      const result = {};

      // Add group-by values
      groupby.forEach((f, i) => {
        result[accessorName(f)] = group.groupValues[i];
      });

      // Compute measures
      ops.forEach((op, i) => {
        const field = fields[i];
        const outputName = as[i] || this._defaultOutputName(op, field);
        result[outputName] = this._computeOp(op, group.tuples, field);
      });

      let tuple = this._cells.get(key);
      if (tuple) {
        Object.assign(tuple, result);
        out.mod.push(tuple);
        this._cells.delete(key);
      } else {
        tuple = ingest(result);
        out.add.push(tuple);
      }
      this._cells.set(key, tuple);
    }

    this.value = Array.from(this._cells.values());
    return out;
  },

  _computeOp(op, tuples, field) {
    const values = field ? tuples.map(t => field(t)).filter(v => v != null) : tuples;

    switch (op) {
      case 'count':
        return tuples.length;
      case 'valid':
        return field ? tuples.filter(t => field(t) != null).length : tuples.length;
      case 'missing':
        return field ? tuples.filter(t => field(t) == null).length : 0;
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'mean':
      case 'average':
        return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      case 'min':
        return values.length ? Math.min(...values) : null;
      case 'max':
        return values.length ? Math.max(...values) : null;
      case 'variance':
        return this._variance(values, 1);
      case 'variancep':
        return this._variance(values, 0);
      case 'stdev':
        return Math.sqrt(this._variance(values, 1));
      case 'stdevp':
        return Math.sqrt(this._variance(values, 0));
      case 'median':
        return this._quantile(values, 0.5);
      case 'q1':
        return this._quantile(values, 0.25);
      case 'q3':
        return this._quantile(values, 0.75);
      case 'distinct':
        return new Set(values).size;
      case 'values':
        return values;
      default:
        return null;
    }
  },

  _variance(values, ddof) {
    if (values.length <= ddof) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const ss = values.reduce((a, v) => a + (v - mean) ** 2, 0);
    return ss / (values.length - ddof);
  },

  _quantile(values, p) {
    if (!values.length) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const idx = p * (sorted.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    return lo === hi ? sorted[lo] : sorted[lo] * (hi - idx) + sorted[hi] * (idx - lo);
  }
});
