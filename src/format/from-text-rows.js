import ColumnTable from '../table/column-table';
import identity from '../util/identity';
import isFunction from '../util/is-function';
import repeat from '../util/repeat';
import valueParser from '../util/parse-values';

const DEFAULT_NAME = 'col';

export default function(next, names, options) {
  let row = next();
  const n = row.length;
  const automax = +options.autoMax || 1000;
  const values = repeat(n, () => []);
  names = names || repeat(n, i => `${DEFAULT_NAME}${i + 1}`);

  // read in initial rows to guess types
  let idx = 0;
  for (; idx < automax && row; ++idx, row = next()) {
    for (let i = 0; i < n; ++i) {
      values[i].push(row[i] === '' ? null : row[i]);
    }
  }

  // initialize parsers
  const parsers = options.autoType === false
    ? Array(n).fill(identity)
    : getParsers(names, values, options);

  // apply parsers
  parsers.forEach((parse, i) => {
    if (parse === identity) return;
    const v = values[i];
    for (let r = 0; r < idx; ++r) {
      if (v[r] != null) v[r] = parse(v[r]);
    }
  });

  // parse remainder of file
  for (; row; row = next()) {
    for (let i = 0; i < n; ++i) {
      values[i].push(row[i] ? parsers[i](row[i]) : null);
    }
  }

  const columns = {};
  names.forEach((name, i) => columns[name] = values[i]);
  return new ColumnTable(columns, names);
}

function getParsers(names, values, options) {
  const { parse = {} } = options;
  return names.map(
    (name, i) => isFunction(parse[name])
      ? parse[name]
      : valueParser(values[i], options)
  );
}