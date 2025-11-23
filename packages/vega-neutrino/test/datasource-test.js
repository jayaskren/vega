import tape from 'tape';
import { Dataflow, changeset } from 'vega-dataflow';
import { NeutrinoDataSource } from '../src/datasource/index.js';
import { initializeNeutrino, resetWasm } from '../src/wasm/loader.js';

// Mock WASM for testing
const mockWasm = {
  table_new: () => 1,
  table_free: () => {},
  table_load_csv: () => 0,
  table_load_json: () => 0,
  table_load_from_bytes: () => 0,
  table_row_count: () => 3,
  table_column_count: () => 2,
  table_column_names: () => 0,
  table_column_type: () => 0,
  table_get_integer: (t, c, r) => r + 1,
  table_get_string: () => 0,
  table_get_float: (t, c, r) => r * 1.5,
  alloc: (size) => 100,
  dealloc: () => {},
  memory: { buffer: new ArrayBuffer(1024) }
};

tape('NeutrinoDataSource: definition', t => {
  t.ok(NeutrinoDataSource.Definition, 'has definition');
  t.equal(NeutrinoDataSource.Definition.type, 'NeutrinoDataSource', 'correct type');
  t.ok(NeutrinoDataSource.Definition.params, 'has params');
  t.end();
});

tape('NeutrinoDataSource: constructor', t => {
  const ds = new NeutrinoDataSource({});
  t.ok(ds, 'creates instance');
  t.equal(ds._table, null, 'table starts null');
  t.deepEqual(ds._tuples, [], 'tuples starts empty');
  t.deepEqual(ds._columnMap, {}, 'columnMap starts empty');
  t.end();
});

tape('NeutrinoDataSource: getColumnIndex', t => {
  const ds = new NeutrinoDataSource({});
  ds._columnMap = { 'id': 0, 'name': 1 };

  t.equal(ds.getColumnIndex('id'), 0, 'returns correct index for id');
  t.equal(ds.getColumnIndex('name'), 1, 'returns correct index for name');
  t.equal(ds.getColumnIndex('unknown'), undefined, 'returns undefined for unknown');
  t.end();
});

tape('NeutrinoDataSource: getColumnNames', t => {
  const ds = new NeutrinoDataSource({});
  ds._columnNames = ['id', 'name', 'value'];

  const names = ds.getColumnNames();
  t.deepEqual(names, ['id', 'name', 'value'], 'returns column names');
  t.end();
});

tape('NeutrinoDataSource: isLoaded', t => {
  const ds = new NeutrinoDataSource({});
  t.equal(ds.isLoaded(), false, 'starts not loaded');

  ds._loaded = true;
  t.equal(ds.isLoaded(), true, 'returns true when loaded');
  t.end();
});

tape('NeutrinoDataSource: dispose', t => {
  const ds = new NeutrinoDataSource({});
  ds._table = 1;
  ds._tuples = [1, 2, 3];
  ds._loaded = true;

  ds.dispose();

  t.equal(ds._table, null, 'table is null after dispose');
  t.deepEqual(ds._tuples, [], 'tuples is empty after dispose');
  t.equal(ds._loaded, false, 'loaded is false after dispose');
  t.end();
});

tape('NeutrinoDataSource: _inferFormat', t => {
  const ds = new NeutrinoDataSource({});

  t.equal(ds._inferFormat('data.csv'), 'csv', 'infers csv');
  t.equal(ds._inferFormat('data.json'), 'json', 'infers json');
  t.equal(ds._inferFormat('data.tsv'), 'tsv', 'infers tsv');
  t.equal(ds._inferFormat('data.txt'), 'json', 'defaults to json');
  t.end();
});
