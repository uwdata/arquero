import { aggregate, aggregateGet, groupOutput } from './reduce/util';
import columnSet from '../table/column-set';

const opt = (value, defaultValue) => value != null ? value : defaultValue;

export default function(table, on, values, options = {}) {
  const { keys, keyColumn } = pivotKeys(table, on, options);
  const vsep = opt(options.valueSeparator, '_');
  const namefn = values.names.length > 1
    ? (i, name) => name + vsep + keys[i]
    : i => keys[i];

  // perform separate aggregate operations for each key
  // if keys do not match, emit NaN so aggregate skips it
  // use custom toString method for proper field resolution
  const results = keys.map(
    k => aggregate(table, values.ops.map(op => {
      if (op.name === 'count') { // fix #273
        const fn = r => k === keyColumn[r] ? 1 : NaN;
        fn.toString = () => k + ':1';
        return { ...op, name: 'sum', fields: [fn] };
      }
      const fields = op.fields.map(f => {
        const fn = (r, d) => k === keyColumn[r] ? f(r, d) : NaN;
        fn.toString = () => k + ':' + f;
        return fn;
      });
      return { ...op, fields };
    }))
  );

  return table.create(output(values, namefn, table.groups(), results));
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
  const uniq = aggregate(
    table.ungroup(),
    [ {
      id: 0,
      name: 'array_agg_distinct',
      fields: [(row => kcol[row])], params: []
    } ]
  )[0][0];

  // get ordered set of unique key values
  const keys = sort ? uniq.sort() : uniq;

  // return key values
  return {
    keys: Number.isFinite(limit) ? keys.slice(0, limit) : keys,
    keyColumn: kcol
  };
}

function output({ names, exprs }, namefn, groups, results) {
  const size = groups ? groups.size : 1;
  const cols = columnSet();
  const m = results.length;
  const n = names.length;

  let result;
  const op = (id, row) => result[id][row];

  // write groupby fields to output
  if (groups) groupOutput(cols, groups);

  // write pivot values to output
  for (let i = 0; i < n; ++i) {
    const get = exprs[i];
    if (get.field != null) {
      // if expression is op only, use aggregates directly
      for (let j = 0; j < m; ++j) {
        cols.add(namefn(j, names[i]), results[j][get.field]);
      }
    } else if (size > 1) {
      // if multiple groups, evaluate expression for each
      for (let j = 0; j < m; ++j) {
        result = results[j];
        const col = cols.add(namefn(j, names[i]), Array(size));
        for (let k = 0; k < size; ++k) {
          col[k] = get(k, null, op);
        }
      }
    } else {
      // if only one group, no need to loop
      for (let j = 0; j < m; ++j) {
        result = results[j];
        cols.add(namefn(j, names[i]), [ get(0, null, op) ]);
      }
    }
  }

  return cols.new();
}