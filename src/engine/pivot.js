import { aggregate, aggregateGet, groupInit, groupOutput } from './reduce/util';
import columnSet from '../table/column-set';

const opt = (value, defaultValue) => value != null ? value : defaultValue;

export default function(table, on, values, options = {}) {
  const { keys, keyColumn } = pivotKeys(table, on, options);
  const vsep = opt(options.valueSeparator, '_');
  const namefn = values.names.length > 1
    ? (i, name) => keys[i] + vsep + name
    : i => keys[i];

  // perform separate aggregate operations for each key
  // if keys do not match, emit NaN so aggregate skips it
  // use custom toString method for proper field resolution
  const results = keys
    .map(
      k => values.ops.map(op => {
        const fields = op.fields.map(f => {
          const fn = (r, d) => k === keyColumn[r] ? f(r, d) : NaN;
          fn.toString = () => k + ':' + f + '';
          return fn;
        });
        return { ...op, fields };
      })
    )
    .map(ops => aggregate(table, ops));

  return table.create(
    output(table, values, namefn, results)
  );
}

function pivotKeys(table, on, options) {
  const limit = options.limit > 0 ? +options.limit : Infinity;
  const sort = opt(options.sort, true);
  const ksep = opt(options.keySeparator, '_');

  // construct key accessor function
  const get = aggregateGet(table, on.ops, on.exprs);
  const key = get.length === 1
    ? get[0]
    : (row, data) => get.map(fn => fn(row, data)).join(ksep);

  // generate vector of per-row key values
  const kcol = Array(table.totalRows());
  table.scan((row, data) => kcol[row] = key(row, data));

  // collect unique key values
  const aggr = aggregate(
    table.ungroup(),
    [ { id: 0, name: 'unique', fields: [(row => kcol[row])], params: [] } ]
  );

  // get ordered set of unique key values
  const keys = sort ? aggr[0].sort() : aggr[0];

  // return key values
  return {
    keys: Number.isFinite(limit) ? keys.slice(0, limit) : keys,
    keyColumn: kcol
  };
}

function output(table, { names, exprs }, namefn, results) {
  const n = names.length;
  const m = results.length;
  const cols = columnSet();

  if (table.isGrouped()) {
    // write groupby fields to output
    groupOutput(cols.data, table, groupInit(cols, table).fill(1));

    // write values to output
    const size = results[0].length;
    for (let i = 0; i < n; ++i) {
      const get = exprs[i];
      for (let i = 0; i < m; ++i) {
        const result = results[i];
        const col = cols.add(namefn(i, names[i]), Array(size));
        for (let j = 0; j < size; ++j) {
          col[j] = get(j, null, result[j]);
        }
      }
    }
  } else {
    // write values to output
    for (let i = 0; i < n; ++i) {
      const get = exprs[i];
      for (let j = 0; j < m; ++j) {
        cols.add(namefn(j, names[i]), [ get(0, null, results[j]) ]);
      }
    }
  }

  return cols.new();
}