/**
 * Transform registry for Neutrino-accelerated transforms.
 */

import NeutrinoAggregate from './NeutrinoAggregate.js';
import NeutrinoFilter from './NeutrinoFilter.js';
import NeutrinoWindow from './NeutrinoWindow.js';
import NeutrinoCollect from './NeutrinoCollect.js';

/**
 * All Neutrino transforms.
 */
export const transforms = {
  NeutrinoAggregate,
  NeutrinoFilter,
  NeutrinoWindow,
  NeutrinoCollect
};

/**
 * Mapping from standard Vega transform names to Neutrino replacements.
 */
export const transformMap = {
  'aggregate': 'NeutrinoAggregate',
  'filter': 'NeutrinoFilter',
  'window': 'NeutrinoWindow',
  'collect': 'NeutrinoCollect'
};

/**
 * Get the Neutrino replacement for a standard transform.
 * @param {string} name - Standard transform name
 * @returns {string|null} Neutrino transform name or null
 */
export function getNeutrinoTransform(name) {
  return transformMap[name] || null;
}

export {
  NeutrinoAggregate,
  NeutrinoFilter,
  NeutrinoWindow,
  NeutrinoCollect
};
