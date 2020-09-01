import tape from 'tape';
import BitSet from '../../src/table/bit-set';

tape('BitSet manages a set of bits', t => {
  const buckets = 5;
  const size = 32 * buckets;
  const bs = new BitSet(32 * buckets);

  // size
  t.equal(bs.length, size, 'correct size');

  // empty initial state
  let tally = 0;
  for (let i = 0; i < size; ++i) {
    if (bs.get(i)) ++tally;
  }
  t.equal(tally, 0, 'bitset is clear');
  t.equal(bs.count(), 0, 'count = 0');

  // set bits
  let set = [];
  const idx = [0, 33, 66, 99, 132];
  idx.forEach(i => bs.set(i));
  for (let i = 0; i < size; ++i) {
    if (bs.get(i)) set.push(i);
  }
  t.deepEqual(set, idx, 'bitset has set bits');
  set = [];
  for (let i = 0, b = bs.next(0); i < buckets; ++i, b = bs.next(b + 1)) {
    set.push(b);
  }
  t.deepEqual(set, idx, 'bitset iterates set bits');
  t.equal(bs.count(), buckets, `count = ${buckets}`);

  // clear bits
  for (let i = 0; i < buckets; ++i) {
    bs.clear(33 * i);
  }
  tally = 0;
  for (let i = 0; i < size; ++i) {
    if (bs.get(i)) ++tally;
  }
  t.equal(tally, 0, 'bitset is clear');
  t.equal(bs.count(), 0, 'count = 0');

  t.end();
});

tape('BitSet ands with another BitSet', t => {
  const ai = [1, 5, 9, 32, 34, 56, 62];
  const bi = [1, 4, 9, 33, 34, 55, 68];
  const a = new BitSet(64);
  const b = new BitSet(69);
  ai.forEach(i => a.set(i));
  bi.forEach(i => b.set(i));

  const ab = a.and(b);
  const ba = b.and(a);

  t.equal(ab.length, Math.min(a.length, b.length), 'correct size');
  t.equal(ab.length, ba.length, 'matching size');

  const idx = [1, 9, 34].reduce((m, i) => (m[i] = 1, m), {});
  const flags = ['', '', ''];
  for (let i = 0; i < ab.length; ++i) {
    flags[0] += idx[i] ? 1 : 0;
    flags[1] += ab.get(i) ? 1 : 0;
    flags[2] += ba.get(i) ? 1 : 0;
  }

  t.equal(flags[0], flags[1], 'bitset ab values');
  t.equal(flags[0], flags[2], 'bitset ba values');

  t.end();
});

tape('BitSet ors with another BitSet', t => {
  const ai = [1, 5, 9, 32, 34, 56, 62];
  const bi = [1, 4, 9, 33, 34, 55, 68];
  const a = new BitSet(64);
  const b = new BitSet(69);
  ai.forEach(i => a.set(i));
  bi.forEach(i => b.set(i));

  const ab = a.or(b);
  const ba = b.or(a);

  t.equal(ab.length, Math.max(a.length, b.length), 'correct size');
  t.equal(ab.length, ba.length, 'matching size');

  const idx = ai.concat(bi).reduce((m, i) => (m[i] = 1, m), {});
  const flags = ['', '', ''];
  for (let i = 0; i < ab.length; ++i) {
    flags[0] += idx[i] ? 1 : 0;
    flags[1] += ab.get(i) ? 1 : 0;
    flags[2] += ba.get(i) ? 1 : 0;
  }

  t.equal(flags[0], flags[1], 'bitset ab values');
  t.equal(flags[0], flags[2], 'bitset ba values');

  t.end();
});
