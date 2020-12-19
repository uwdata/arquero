import columnSet from '../table/column-set';
import keyFunction from '../util/key-function';
import unroll2 from '../util/unroll2';

export default function(table, keys, values) {
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
    table.scan(row => col.push(old.get(row)));
  });

  // enumerate expanded value sets and augment output table
  const keyEnum = keyFunction(keyGet.map((k, i) => a => a[i]));
  const set = unroll2(
    out, names.map(name => keyNames.indexOf(name)), 'v',
    '{' + out.map((_, i) => `_${i}.push(v[$${i}]);`).join('') + '}'
  );
  enumerate(data, groups, values, vec => {
    if (!hash.has(keyEnum(vec))) set(vec);
  });

  return table.create(cols.new());
}

function enumerate(data, groups, values, callback) {
  const offset = groups ? groups.get.length : 0;
  const pad = (groups ? 1 : 0);
  const len = pad + values.length;
  const lens = new Int32Array(len);
  const idxs = new Int32Array(len);
  const set = [];

  if (groups) {
    const { get, rows, size } = groups;
    lens[0] = size;
    set.push(function(vec, idx) {
      const row = rows[idx];
      for (let i = 0; i < offset; ++i) {
        vec[i] = get[i](row, data);
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
  callback(vec);

  for (let i = len - 1; i >= 0;) {
    const idx = ++idxs[i];
    if (idx < lens[i]) {
      set[i](vec, idx);
      callback(vec);
      i = len - 1;
    } else {
      idxs[i] = 0;
      set[i](vec, 0);
      --i;
    }
  }
}