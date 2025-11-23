/**
 * Neutrino-accelerated window function transform.
 * Uses columnar processing for efficient window computations.
 */

import { Transform, ingest } from 'vega-dataflow';
import { accessorName, inherits } from 'vega-util';
import * as bindings from '../wasm/bindings.js';

/**
 * NeutrinoWindow - WASM-accelerated window functions.
 * @param {Object} params - Transform parameters
 */
export default function NeutrinoWindow(params) {
  Transform.call(this, null, params);
  this._source = null;
}

NeutrinoWindow.Definition = {
  'type': 'NeutrinoWindow',
  'metadata': { 'modifies': true },
  'params': [
    { 'name': 'sort', 'type': 'compare' },
    { 'name': 'groupby', 'type': 'field', 'array': true },
    { 'name': 'ops', 'type': 'enum', 'array': true,
      'values': ['row_number', 'rank', 'dense_rank', 'percent_rank', 'cume_dist',
                 'ntile', 'lag', 'lead', 'first_value', 'last_value', 'nth_value',
                 'count', 'sum', 'mean', 'average', 'variance', 'variancep',
                 'stdev', 'stdevp', 'min', 'max'] },
    { 'name': 'params', 'type': 'number', 'null': true, 'array': true },
    { 'name': 'fields', 'type': 'field', 'null': true, 'array': true },
    { 'name': 'as', 'type': 'string', 'null': true, 'array': true },
    { 'name': 'frame', 'type': 'number', 'null': true, 'array': true },
    { 'name': 'ignorePeers', 'type': 'boolean', 'default': false }
  ]
};

inherits(NeutrinoWindow, Transform, {
  transform(_, pulse) {
    const out = pulse.fork(pulse.ALL);

    // Check if source is Neutrino data
    const source = this._getSourceDataSource(pulse);
    if (!source || !source.getTablePtr) {
      return this._jsWindow(_, pulse, out);
    }

    this._source = source;

    // Build window config
    const config = this._buildConfig(_);

    // Execute in WASM
    const tablePtr = source.getTablePtr();
    const results = bindings.windowFunction(tablePtr, config);

    // Apply results to tuples
    const ops = _.ops || ['row_number'];
    const as = _.as || [];

    let resultIdx = 0;
    pulse.visit(pulse.SOURCE, tuple => {
      ops.forEach((op, i) => {
        const outputName = as[i] || `${op}_value`;
        tuple[outputName] = results[resultIdx];
        resultIdx++;
      });
      out.mod.push(tuple);
    });

    return out;
  },

  _buildConfig(_) {
    return {
      sort: _.sort ? _.sort.fields.map(f => ({
        field: accessorName(f),
        order: 'ascending'  // TODO: get from compare
      })) : [],
      groupby: _.groupby ? _.groupby.map(f => accessorName(f)) : [],
      ops: _.ops || ['row_number'],
      params: _.params || [],
      fields: _.fields ? _.fields.map(f => f ? accessorName(f) : null) : [],
      as: _.as || [],
      frame: _.frame || [null, 0],
      ignorePeers: _.ignorePeers || false
    };
  },

  _jsWindow(_, pulse, out) {
    // JavaScript fallback
    const sort = _.sort;
    const groupby = _.groupby || [];
    const ops = _.ops || ['row_number'];
    const fields = _.fields || [];
    const as = _.as || [];
    const frame = _.frame || [null, 0];

    // Collect all tuples
    const tuples = [];
    pulse.visit(pulse.SOURCE, t => tuples.push(t));

    // Group tuples
    const groups = new Map();
    tuples.forEach(tuple => {
      const key = groupby.map(f => f(tuple)).join('|');
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(tuple);
    });

    // Process each group
    for (const [key, group] of groups) {
      // Sort within group
      if (sort) {
        group.sort(sort);
      }

      // Compute window functions
      ops.forEach((op, opIdx) => {
        const field = fields[opIdx];
        const outputName = as[opIdx] || `${op}_value`;

        group.forEach((tuple, rowIdx) => {
          tuple[outputName] = this._computeWindowOp(
            op, group, rowIdx, field, frame
          );
        });
      });

      // Mark as modified
      group.forEach(tuple => out.mod.push(tuple));
    }

    return out;
  },

  _computeWindowOp(op, group, rowIdx, field, frame) {
    const n = group.length;

    // Determine frame bounds
    let start = frame[0] === null ? 0 : Math.max(0, rowIdx + frame[0]);
    let end = frame[1] === null ? n - 1 : Math.min(n - 1, rowIdx + frame[1]);

    switch (op) {
      case 'row_number':
        return rowIdx + 1;
      case 'rank': {
        let rank = 1;
        const current = field ? field(group[rowIdx]) : rowIdx;
        for (let i = 0; i < rowIdx; i++) {
          const val = field ? field(group[i]) : i;
          if (val !== current) rank = i + 1;
        }
        return rank;
      }
      case 'dense_rank': {
        let rank = 1;
        const current = field ? field(group[rowIdx]) : rowIdx;
        let prev = null;
        for (let i = 0; i < rowIdx; i++) {
          const val = field ? field(group[i]) : i;
          if (val !== prev) {
            if (val !== current) rank++;
            prev = val;
          }
        }
        return rank;
      }
      case 'percent_rank':
        return n > 1 ? rowIdx / (n - 1) : 0;
      case 'cume_dist':
        return (rowIdx + 1) / n;
      case 'ntile': {
        const numTiles = 4;  // Default
        return Math.ceil((rowIdx + 1) * numTiles / n);
      }
      case 'lag':
        return rowIdx > 0 && field ? field(group[rowIdx - 1]) : null;
      case 'lead':
        return rowIdx < n - 1 && field ? field(group[rowIdx + 1]) : null;
      case 'first_value':
        return field ? field(group[start]) : null;
      case 'last_value':
        return field ? field(group[end]) : null;
      case 'count': {
        let count = 0;
        for (let i = start; i <= end; i++) {
          if (!field || field(group[i]) != null) count++;
        }
        return count;
      }
      case 'sum': {
        let sum = 0;
        for (let i = start; i <= end; i++) {
          const val = field ? field(group[i]) : 0;
          if (val != null) sum += val;
        }
        return sum;
      }
      case 'mean':
      case 'average': {
        let sum = 0, count = 0;
        for (let i = start; i <= end; i++) {
          const val = field ? field(group[i]) : 0;
          if (val != null) { sum += val; count++; }
        }
        return count ? sum / count : null;
      }
      case 'min': {
        let min = Infinity;
        for (let i = start; i <= end; i++) {
          const val = field ? field(group[i]) : 0;
          if (val != null && val < min) min = val;
        }
        return min === Infinity ? null : min;
      }
      case 'max': {
        let max = -Infinity;
        for (let i = start; i <= end; i++) {
          const val = field ? field(group[i]) : 0;
          if (val != null && val > max) max = val;
        }
        return max === -Infinity ? null : max;
      }
      default:
        return null;
    }
  },

  _getSourceDataSource(pulse) {
    let source = pulse.source;
    while (source) {
      if (source.getTablePtr) return source;
      if (source.source) source = source.source;
      else if (source.value && source.value[0] && source.value[0]._ds) {
        return source.value[0]._ds;
      } else break;
    }
    return null;
  }
});
