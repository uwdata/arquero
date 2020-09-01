import _derive from '../engine/derive';
import _sample from '../engine/sample';
import parse from '../expression/parse';
import isNumber from '../util/is-number';
import isString from '../util/is-string';

export default function(table, size, options = {}) {
  const weight = options.weight ? parseWeight(table, options.weight) : null;
  return _sample(table, size, weight, options);
}

function parseWeight(table, weight) {
  weight = isNumber(weight) ? table.columnName(weight) : weight;

  const col = isString(weight)
    ? table.column(weight)
    : _derive(table, parse({ weight })).column('weight');

  return row => col[row] || 0;
}