import tape from 'tape';
import { NeutrinoAggregate, NeutrinoFilter, NeutrinoWindow, NeutrinoCollect } from '../src/transforms/index.js';

tape('NeutrinoAggregate: definition', t => {
  t.ok(NeutrinoAggregate.Definition, 'has definition');
  t.equal(NeutrinoAggregate.Definition.type, 'NeutrinoAggregate', 'correct type');
  t.ok(NeutrinoAggregate.Definition.params, 'has params');

  const ops = NeutrinoAggregate.Definition.params.find(p => p.name === 'ops');
  t.ok(ops, 'has ops param');
  t.ok(ops.values.includes('sum'), 'supports sum');
  t.ok(ops.values.includes('mean'), 'supports mean');
  t.ok(ops.values.includes('count'), 'supports count');
  t.ok(ops.values.includes('min'), 'supports min');
  t.ok(ops.values.includes('max'), 'supports max');
  t.end();
});

tape('NeutrinoAggregate: constructor', t => {
  const agg = new NeutrinoAggregate({});
  t.ok(agg, 'creates instance');
  t.ok(agg._cells instanceof Map, 'cells is a Map');
  t.end();
});

tape('NeutrinoAggregate: _buildConfig', t => {
  const agg = new NeutrinoAggregate({});

  const config = agg._buildConfig({
    groupby: [{ field: 'category', fname: 'category' }],
    ops: ['sum', 'count'],
    fields: [{ field: 'value', fname: 'value' }, null],
    as: ['total', 'n']
  });

  t.ok(config.groupby, 'has groupby');
  t.ok(config.measures, 'has measures');
  t.equal(config.measures.length, 2, 'two measures');
  t.equal(config.measures[0].op, 'sum', 'first op is sum');
  t.equal(config.measures[1].op, 'count', 'second op is count');
  t.end();
});

tape('NeutrinoAggregate: _groupKey', t => {
  const agg = new NeutrinoAggregate({});

  const key1 = agg._groupKey({ category: 'A', year: 2020 }, [
    { fname: 'category' },
    { fname: 'year' }
  ]);
  t.ok(key1.includes('A'), 'key includes category');
  t.ok(key1.includes('2020'), 'key includes year');

  const key2 = agg._groupKey({}, null);
  t.equal(key2, '', 'empty key for no groupby');
  t.end();
});

tape('NeutrinoAggregate: _computeOp', t => {
  const agg = new NeutrinoAggregate({});
  const tuples = [
    { value: 10 },
    { value: 20 },
    { value: 30 }
  ];
  const field = t => t.value;

  t.equal(agg._computeOp('count', tuples, null), 3, 'count');
  t.equal(agg._computeOp('sum', tuples, field), 60, 'sum');
  t.equal(agg._computeOp('mean', tuples, field), 20, 'mean');
  t.equal(agg._computeOp('min', tuples, field), 10, 'min');
  t.equal(agg._computeOp('max', tuples, field), 30, 'max');
  t.end();
});

tape('NeutrinoAggregate: variance and stdev', t => {
  const agg = new NeutrinoAggregate({});
  const tuples = [
    { value: 2 },
    { value: 4 },
    { value: 4 },
    { value: 4 },
    { value: 5 },
    { value: 5 },
    { value: 7 },
    { value: 9 }
  ];
  const field = t => t.value;

  const variance = agg._computeOp('variance', tuples, field);
  t.ok(Math.abs(variance - 4.571) < 0.01, 'variance is approximately 4.571');

  const stdev = agg._computeOp('stdev', tuples, field);
  t.ok(Math.abs(stdev - 2.138) < 0.01, 'stdev is approximately 2.138');
  t.end();
});

tape('NeutrinoFilter: definition', t => {
  t.ok(NeutrinoFilter.Definition, 'has definition');
  t.equal(NeutrinoFilter.Definition.type, 'NeutrinoFilter', 'correct type');

  const expr = NeutrinoFilter.Definition.params.find(p => p.name === 'expr');
  t.ok(expr, 'has expr param');
  t.ok(expr.required, 'expr is required');
  t.end();
});

tape('NeutrinoFilter: _analyzeExpression', t => {
  const filter = new NeutrinoFilter({});

  // Simple comparison
  const expr1 = { toString: () => 'datum.x > 10' };
  const result1 = filter._analyzeExpression(expr1);
  t.ok(result1, 'parses simple comparison');
  t.equal(result1.field, 'x', 'correct field');
  t.equal(result1.min, 10, 'correct min');

  // Range
  const expr2 = { toString: () => 'datum.y > 0 && datum.y < 100' };
  const result2 = filter._analyzeExpression(expr2);
  t.ok(result2, 'parses range');
  t.equal(result2.field, 'y', 'correct field');
  t.equal(result2.min, 0, 'correct min');
  t.equal(result2.max, 100, 'correct max');

  // Non-optimizable
  const expr3 = { toString: () => 'datum.x === "test"' };
  const result3 = filter._analyzeExpression(expr3);
  t.equal(result3, null, 'returns null for non-optimizable');
  t.end();
});

tape('NeutrinoWindow: definition', t => {
  t.ok(NeutrinoWindow.Definition, 'has definition');
  t.equal(NeutrinoWindow.Definition.type, 'NeutrinoWindow', 'correct type');

  const ops = NeutrinoWindow.Definition.params.find(p => p.name === 'ops');
  t.ok(ops, 'has ops param');
  t.ok(ops.values.includes('row_number'), 'supports row_number');
  t.ok(ops.values.includes('rank'), 'supports rank');
  t.ok(ops.values.includes('sum'), 'supports sum');
  t.end();
});

tape('NeutrinoWindow: _computeWindowOp', t => {
  const window = new NeutrinoWindow({});
  const group = [
    { value: 10 },
    { value: 20 },
    { value: 30 }
  ];
  const field = t => t.value;
  const frame = [null, 0];

  t.equal(window._computeWindowOp('row_number', group, 0, field, frame), 1, 'row_number');
  t.equal(window._computeWindowOp('row_number', group, 1, field, frame), 2, 'row_number');
  t.equal(window._computeWindowOp('row_number', group, 2, field, frame), 3, 'row_number');
  t.end();
});

tape('NeutrinoCollect: definition', t => {
  t.ok(NeutrinoCollect.Definition, 'has definition');
  t.equal(NeutrinoCollect.Definition.type, 'NeutrinoCollect', 'correct type');

  const sort = NeutrinoCollect.Definition.params.find(p => p.name === 'sort');
  t.ok(sort, 'has sort param');
  t.end();
});

tape('NeutrinoCollect: constructor', t => {
  const collect = new NeutrinoCollect({});
  t.ok(collect, 'creates instance');
  t.ok(Array.isArray(collect.value), 'value is array');
  t.end();
});
