import tape from 'tape';
import {
  enableNeutrino,
  isNeutrinoEnabled,
  transforms,
  transformMap,
  getNeutrinoTransform,
  NeutrinoAggregate,
  NeutrinoFilter,
  NeutrinoWindow,
  NeutrinoCollect
} from '../src/index.js';

tape('exports: main API', t => {
  t.equal(typeof enableNeutrino, 'function', 'enableNeutrino is a function');
  t.equal(typeof isNeutrinoEnabled, 'function', 'isNeutrinoEnabled is a function');
  t.end();
});

tape('exports: transforms', t => {
  t.ok(transforms, 'transforms object exists');
  t.ok(transforms.NeutrinoAggregate, 'exports NeutrinoAggregate');
  t.ok(transforms.NeutrinoFilter, 'exports NeutrinoFilter');
  t.ok(transforms.NeutrinoWindow, 'exports NeutrinoWindow');
  t.ok(transforms.NeutrinoCollect, 'exports NeutrinoCollect');
  t.end();
});

tape('exports: transformMap', t => {
  t.ok(transformMap, 'transformMap object exists');
  t.equal(transformMap.aggregate, 'NeutrinoAggregate', 'maps aggregate');
  t.equal(transformMap.filter, 'NeutrinoFilter', 'maps filter');
  t.equal(transformMap.window, 'NeutrinoWindow', 'maps window');
  t.equal(transformMap.collect, 'NeutrinoCollect', 'maps collect');
  t.end();
});

tape('getNeutrinoTransform', t => {
  t.equal(getNeutrinoTransform('aggregate'), 'NeutrinoAggregate', 'returns Neutrino transform');
  t.equal(getNeutrinoTransform('filter'), 'NeutrinoFilter', 'returns Neutrino transform');
  t.equal(getNeutrinoTransform('unknown'), null, 'returns null for unknown');
  t.end();
});

tape('NeutrinoAggregate: class export', t => {
  t.equal(typeof NeutrinoAggregate, 'function', 'NeutrinoAggregate is a constructor');
  t.ok(NeutrinoAggregate.Definition, 'has Definition');
  t.end();
});

tape('NeutrinoFilter: class export', t => {
  t.equal(typeof NeutrinoFilter, 'function', 'NeutrinoFilter is a constructor');
  t.ok(NeutrinoFilter.Definition, 'has Definition');
  t.end();
});

tape('NeutrinoWindow: class export', t => {
  t.equal(typeof NeutrinoWindow, 'function', 'NeutrinoWindow is a constructor');
  t.ok(NeutrinoWindow.Definition, 'has Definition');
  t.end();
});

tape('NeutrinoCollect: class export', t => {
  t.equal(typeof NeutrinoCollect, 'function', 'NeutrinoCollect is a constructor');
  t.ok(NeutrinoCollect.Definition, 'has Definition');
  t.end();
});

tape('IndexedDBStore availability check', async t => {
  const { isIndexedDBAvailable } = await import('../src/persistence/index.js');
  t.equal(typeof isIndexedDBAvailable, 'function', 'isIndexedDBAvailable is a function');
  // Note: actual IndexedDB availability depends on environment
  t.end();
});

tape('WorkerManager export', async t => {
  const { WorkerManager, getWorkerManager } = await import('../src/workers/index.js');
  t.equal(typeof WorkerManager, 'function', 'WorkerManager is a constructor');
  t.equal(typeof getWorkerManager, 'function', 'getWorkerManager is a function');
  t.end();
});

tape('StreamingLoader export', async t => {
  const { StreamingLoader, loadCSVWithProgress } = await import('../src/persistence/index.js');
  t.equal(typeof StreamingLoader, 'function', 'StreamingLoader is a constructor');
  t.equal(typeof loadCSVWithProgress, 'function', 'loadCSVWithProgress is a function');
  t.end();
});
