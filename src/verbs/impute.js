import { aggregateGet } from './reduce/util.js';
import { _rollup } from './rollup.js';
import { ungroup } from './ungroup.js';
import { parseValue } from './util/parse.js';
import { parse } from '../expression/parse.js';
import { array_agg_distinct } from '../op/op-api.js';
import { columnSet } from '../table/ColumnSet.js';
import { error } from '../util/error.js';
import { isValid } from '../util/is-valid.js';
import { keyFunction } from '../util/key-function.js';
import { toString } from '../util/to-string.js';
import { unroll } from '../util/unroll.js';

export function impute(table, values, options = {}) {
  values = parse(values, { table });

  values.names.forEach(name =>
    table.column(name) ? 0 : error(`Invalid impute column ${toString(name)}`)
  );

  if (options.expand) {
    const opt = { preparse, window: false, aggronly: true };
    const params = parseValue('impute', table, options.expand, opt);
    const result = _rollup(ungroup(table), params);
    return _impute(
      table, values, params.names,
      params.names.map(name => result.get(name, 0))
    );
  } else {
    return _impute(table, values);
  }
}

// map direct field reference to "unique" aggregate
function preparse(map) {
  map.forEach((value, key) =>
    value.field ? map.set(key, array_agg_distinct(value + '')) : 0
  );
}

export function _impute(table, values, keys, arrays) {
  const write = keys && keys.length;
  table = write ? expand(table, keys, arrays) : table;
  const { names, exprs, ops } = values;
  const gets = aggregateGet(table, ops, exprs);
  const cols = write ? null : columnSet(table);
  const rows = table.totalRows();

  names.forEach((name, i) => {
    const col = table.column(name);
    const out = write ? col : cols.add(name, Array(rows));
    const get = gets[i];

    table.scan(idx => {
      const v = col.at(idx);
      out[idx] = !isValid(v) ? get(idx) : v;
    });
  });

  return write ? table : table.create(cols);
}

function expand(table, keys, values) {
  const groups = table.groups();
  const data = table.data();

  // expansion keys and accessors
  const keyNames = (groups ? groups.names : []).concat(keys);
  const keyGet = (groups ? groups.get : [])
    .concat(keys.map(key => table.getter(key)));

  // build hash of existing rows
  const hash = new Set();
  const keyTable = keyFunction(keyGet);
  table.scan((idx, data) => hash.add(keyTable(idx, data)));

  // initialize output table data
  const names = table.columnNames();
  const cols = columnSet();
  const out = names.map(name => cols.add(name, []));
  names.forEach((name, i) => {
    const old = data[name];
    const col = out[i];
    table.scan(row => col.push(old.at(row)));
  });

  // enumerate expanded value sets and augment output table
  const keyEnum = keyFunction(keyGet.map((k, i) => a => a[i]));
  const set = unroll(
    'v',
    '{' + out.map((_, i) => `_${i}.push(v[$${i}]);`).join('') + '}',
    out, names.map(name => keyNames.indexOf(name))
  );

  if (groups) {
    let row = groups.keys.length;
    const prod = values.reduce((p, a) => p * a.length, groups.size);
    const keys = new Uint32Array(prod + (row - hash.size));
    keys.set(groups.keys);
    enumerate(groups, values, (vec, idx) => {
      if (!hash.has(keyEnum(vec))) {
        set(vec);
        keys[row++] = idx[0];
      }
    });
    cols.groupby({ ...groups, keys });
  } else {
    enumerate(groups, values, vec => {
      if (!hash.has(keyEnum(vec))) set(vec);
    });
  }

  return cols.new(table);
}

function enumerate(groups, values, callback) {
  const offset = groups ? groups.get.length : 0;
  const pad = groups ? 1 : 0;
  const len = pad + values.length;
  const lens = new Int32Array(len);
  const idxs = new Int32Array(len);
  const set = [];

  if (groups) {
    const { get, rows, size } = groups;
    lens[0] = size;
    set.push((vec, idx) => {
      const row = rows[idx];
      for (let i = 0; i < offset; ++i) {
        vec[i] = get[i](row);
      }
    });
  }

  values.forEach((a, i) => {
    const j = i + offset;
    lens[i + pad] = a.length;
    set.push((vec, idx) => vec[j] = a[idx]);
  });

  const vec = Array(offset + values.length);

  // initialize value vector
  for (let i = 0; i < len; ++i) {
    set[i](vec, 0);
  }
  callback(vec, idxs);

  // enumerate all combinations of values
  for (let i = len - 1; i >= 0;) {
    const idx = ++idxs[i];
    if (idx < lens[i]) {
      set[i](vec, idx);
      callback(vec, idxs);
      i = len - 1;
    } else {
      idxs[i] = 0;
      set[i](vec, 0);
      --i;
    }
  }
}
