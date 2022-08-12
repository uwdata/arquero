import _derive from '../engine/derive';
import _rollup from '../engine/rollup';
import _sample from '../engine/sample';
import parse from '../expression/parse';
import isNumber from '../util/is-number';
import isString from '../util/is-string';

export default function(table, size, options = {}) {
  return _sample(
    table,
    parseSize(table, size),
    parseWeight(table, options.weight),
    options
  );
}

const get = col => row => col.get(row) || 0;

function parseSize(table, size) {
  return isNumber(size)
    ? () => size
    : get(_rollup(table, parse({ size }, { table, window: false })).column('size'));
}

function parseWeight(table, w) {
  if (w == null) return null;
  w = isNumber(w) ? table.columnName(w) : w;
  return get(
    isString(w)
      ? table.column(w)
      : _derive(table, parse({ w }, { table }), { drop: true }).column('w')
  );
}