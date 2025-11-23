/**
 * Neutrino-accelerated filter transform.
 * Uses bitmap filtering for efficient range queries.
 */

import { Transform } from 'vega-dataflow';
import { inherits, fastmap } from 'vega-util';
import * as bindings from '../wasm/bindings.js';

/**
 * NeutrinoFilter - WASM-accelerated filtering.
 * @param {Object} params - Transform parameters
 */
export default function NeutrinoFilter(params) {
  Transform.call(this, fastmap().test(this._test.bind(this)), params);
  this._bitmap = null;  // Cached filter bitmap
  this._source = null;  // Source data source
}

NeutrinoFilter.Definition = {
  'type': 'NeutrinoFilter',
  'metadata': { 'changes': true },
  'params': [
    { 'name': 'expr', 'type': 'expr', 'required': true }
  ]
};

inherits(NeutrinoFilter, Transform, {
  transform(_, pulse) {
    const out = pulse.fork(pulse.ALL);

    // Check if we can use WASM acceleration
    const source = this._getSourceDataSource(pulse);
    const rangeFilter = this._analyzeExpression(_.expr);

    if (rangeFilter && source && source.getTablePtr) {
      this._source = source;
      return this._wasmFilter(rangeFilter, source, pulse, out);
    }

    // Standard JavaScript filter
    return this._jsFilter(_.expr, pulse, out);
  },

  _test(tuple) {
    // Test function for fastmap
    return this._expr ? this._expr(tuple) : true;
  },

  _analyzeExpression(expr) {
    // Analyze if expression can be converted to range filter
    // Returns null if not optimizable, otherwise returns filter config
    if (!expr) return null;

    const str = expr.toString();

    // Simple patterns we can optimize:
    // datum.field > value
    // datum.field < value
    // datum.field >= value
    // datum.field <= value
    // datum.field > value && datum.field < value2

    const patterns = [
      // Range pattern: datum.field > min && datum.field < max
      /datum\.(\w+)\s*([><=]+)\s*([\d.]+)\s*&&\s*datum\.\1\s*([><=]+)\s*([\d.]+)/,
      // Single comparison: datum.field > value
      /datum\.(\w+)\s*([><=]+)\s*([\d.]+)/
    ];

    for (const pattern of patterns) {
      const match = str.match(pattern);
      if (match) {
        if (match.length === 6) {
          // Range pattern
          const field = match[1];
          let min = -Infinity, max = Infinity;

          const applyOp = (op, val) => {
            const num = parseFloat(val);
            if (op === '>' || op === '>=') {
              min = Math.max(min, num);
            } else if (op === '<' || op === '<=') {
              max = Math.min(max, num);
            }
          };

          applyOp(match[2], match[3]);
          applyOp(match[4], match[5]);

          return { field, min, max };
        } else if (match.length === 4) {
          // Single comparison
          const field = match[1];
          const op = match[2];
          const value = parseFloat(match[3]);

          let min = -Infinity, max = Infinity;
          if (op === '>' || op === '>=') min = value;
          if (op === '<' || op === '<=') max = value;
          if (op === '==' || op === '===') { min = value; max = value; }

          return { field, min, max };
        }
      }
    }

    return null;  // Not optimizable
  },

  _wasmFilter(config, source, pulse, out) {
    const tablePtr = source.getTablePtr();
    const columnIndex = source.getColumnIndex(config.field);

    if (columnIndex === undefined) {
      // Column not found, fall back to JS filter
      return this._jsFilter(this._expr, pulse, out);
    }

    // Get bitmap from WASM
    const bitmap = bindings.filterRange(tablePtr, columnIndex, config.min, config.max);
    this._bitmap = bitmap;

    // Apply bitmap to tuples
    pulse.visit(pulse.SOURCE, t => {
      const idx = t._row;
      const byteIdx = idx >> 3;
      const bitIdx = idx & 7;
      const passes = (bitmap[byteIdx] & (1 << bitIdx)) !== 0;

      if (passes && !this.value.has(t._id)) {
        this.value.set(t._id, 1);
        out.add.push(t);
      } else if (!passes && this.value.has(t._id)) {
        this.value.delete(t._id);
        out.rem.push(t);
      }
    });

    return out;
  },

  _jsFilter(expr, pulse, out) {
    this._expr = expr;

    const test = t => {
      try {
        return expr(t);
      } catch (e) {
        return false;
      }
    };

    pulse.visit(pulse.ADD, t => {
      if (test(t)) {
        this.value.set(t._id, 1);
      } else {
        out.rem.push(t);
      }
    });

    pulse.visit(pulse.REM, t => {
      if (this.value.has(t._id)) {
        this.value.delete(t._id);
      }
    });

    pulse.visit(pulse.MOD, t => {
      const passes = test(t);
      const inSet = this.value.has(t._id);

      if (passes && !inSet) {
        this.value.set(t._id, 1);
        out.add.push(t);
      } else if (!passes && inSet) {
        this.value.delete(t._id);
        out.rem.push(t);
      } else if (passes && inSet) {
        out.mod.push(t);
      }
    });

    return out;
  },

  _getSourceDataSource(pulse) {
    let source = pulse.source;
    while (source) {
      if (source.getTablePtr) {
        return source;
      }
      if (source.source) {
        source = source.source;
      } else if (source.value && source.value[0] && source.value[0]._ds) {
        return source.value[0]._ds;
      } else {
        break;
      }
    }
    return null;
  }
});
