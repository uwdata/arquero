import { _derive } from './derive.js';
import { _rollup } from './rollup.js';
import { parse } from '../expression/parse.js';
import { isNumber } from '../util/is-number.js';
import { isString } from '../util/is-string.js';
import { sample as sampleIndices } from '../util/sample.js';
import { shuffle as shuffleIndices } from '../util/shuffle.js';

export function sample(table, size, options = {}) {
  return _sample(
    table,
    parseSize(table, size),
    parseWeight(table, options.weight),
    options
  );
}

const get = col => row => col.at(row) || 0;

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

export function _sample(table, size, weight, options = {}) {
  const { replace, shuffle } = options;
  const parts = table.partitions(false);

  let total = 0;
  size = parts.map((idx, group) => {
    let s = size(group);
    total += (s = (replace ? s : Math.min(idx.length, s)));
    return s;
  });

  const samples = new Uint32Array(total);
  let curr = 0;

  parts.forEach((idx, group) => {
    const sz = size[group];
    const buf = samples.subarray(curr, curr += sz);

    if (!replace && sz === idx.length) {
      // sample size === data size, no replacement
      // no need to sample, just copy indices
      buf.set(idx);
    } else {
      sampleIndices(buf, replace, idx, weight);
    }
  });

  if (shuffle !== false && (parts.length > 1 || !replace)) {
    // sampling with replacement methods shuffle, so in
    // that case a single partition is already good to go
    shuffleIndices(samples);
  }

  return table.reify(samples);
}
