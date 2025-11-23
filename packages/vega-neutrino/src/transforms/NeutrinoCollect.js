/**
 * Neutrino-accelerated collect/sort transform.
 * Uses pre-built indices for efficient sorting.
 */

import { Transform } from 'vega-dataflow';
import { accessorName, inherits } from 'vega-util';
import * as bindings from '../wasm/bindings.js';

/**
 * NeutrinoCollect - WASM-accelerated collection and sorting.
 * @param {Object} params - Transform parameters
 */
export default function NeutrinoCollect(params) {
  Transform.call(this, [], params);
  this._source = null;
}

NeutrinoCollect.Definition = {
  'type': 'NeutrinoCollect',
  'metadata': { 'source': true },
  'params': [
    { 'name': 'sort', 'type': 'compare' }
  ]
};

inherits(NeutrinoCollect, Transform, {
  transform(_, pulse) {
    const out = pulse.fork(pulse.ALL);

    if (this.value.length === 0 || pulse.changed(pulse.ADD_REM) || _.modified('sort')) {
      // Collect all source tuples
      const source = this._getSourceDataSource(pulse);

      if (source && source.getTablePtr && _.sort) {
        // Use WASM sorting
        return this._wasmSort(_, source, pulse, out);
      }

      // JavaScript collection and sorting
      return this._jsCollect(_, pulse, out);
    }

    return out;
  },

  _wasmSort(_, source, pulse, out) {
    const tablePtr = source.getTablePtr();

    // Get sort field
    const sortField = _.sort.fields[0];
    const fieldName = accessorName(sortField);
    const columnIndex = source.getColumnIndex(fieldName);

    if (columnIndex === undefined) {
      // Fall back to JS sort
      return this._jsCollect(_, pulse, out);
    }

    // Get sort order
    const ascending = !_.sort.orders || _.sort.orders[0] !== 'descending';

    // Get sorted indices from WASM
    const sortedIndices = bindings.sort(tablePtr, columnIndex, ascending);

    // Collect tuples in sorted order
    const tuples = [];
    pulse.visit(pulse.SOURCE, t => tuples.push(t));

    // Create row index map
    const rowMap = new Map();
    tuples.forEach(t => {
      if (t._row !== undefined) {
        rowMap.set(t._row, t);
      }
    });

    // Reorder according to sorted indices
    const sorted = [];
    for (let i = 0; i < sortedIndices.length; i++) {
      const tuple = rowMap.get(sortedIndices[i]);
      if (tuple) {
        sorted.push(tuple);
      }
    }

    this.value = sorted;
    out.source = this.value;

    return out;
  },

  _jsCollect(_, pulse, out) {
    // Collect all tuples
    const tuples = [];
    pulse.visit(pulse.SOURCE, t => tuples.push(t));

    // Sort if needed
    if (_.sort) {
      tuples.sort(_.sort);
    }

    this.value = tuples;
    out.source = this.value;

    return out;
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
