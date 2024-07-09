// Example code that should not cause any TypeScript errors
import * as aq from '../src/api.js';
const { op } = aq;

const dt = aq.table({
  x: [1, 2, 3],
  y: ['a', 'b', 'c']
});
const other = aq.table({ u: [3, 2, 1 ] });
const other2 = aq.table({ x: [4, 5, 6 ] });

export const rt = dt
  .antijoin(other)
  .antijoin(other, ['keyL', 'keyR'])
  .antijoin(other, (a, b) => op.equal(a.keyL, b.keyR))
  .assign({ z: [4, 5, 6] }, other)
  .concat(other)
  .concat(other, other2)
  .concat([other, other2])
  .count()
  .count({ as: 'foo' })
  .cross(other)
  .cross(other, [['leftKey', 'leftVal'], ['rightVal']])
  .dedupe()
  .dedupe('y')
  .derive({
    row1: op.row_number(),
    lead1: op.lead('s'),
    row2: () => op.row_number(),
    lead2: (d: {s: string}) => op.lead(op.trim(d.s)),
    z: (d: {x: number}) => (d.x - op.average(d.x)) / op.stdev(d.x),
    avg: aq.rolling(
      (d: {x: number}) => op.average(d.x),
      [-5, 5]
    ),
    mix: (d: any) => d.x > 2 ? d.u : d.z
  })
  .except(other)
  .except(other, other2)
  .except([other, other2])
  .filter((d: any) => d.x > 2 && d.s !== 'foo')
  .filter((d: {x: number, s: string}) => d.x > 2 && d.s !== 'foo')
  .fold('colA')
  .fold(['colA', 'colB'], { as: ['k', 'v'] })
  .groupby('y')
  .ungroup()
  .groupby({ g: 'y' })
  .ungroup()
  .impute({ v: () => 0 })
  .impute({ v: (d: {v: number}) => op.mean(d.v) })
  .impute({ v: () => 0 }, { expand: ['x', 'y'] })
  .intersect(other)
  .intersect(other, other2)
  .intersect([other, other2])
  .join(other, ['keyL', 'keyR'])
  .join(other, (a, b) => op.equal(a.keyL, b.keyR))
  .join_left(other, ['keyL', 'keyR'])
  .join_left(other, (a, b) => op.equal(a.keyL, b.keyR))
  .join_right(other, ['keyL', 'keyR'])
  .join_right(other, (a, b) => op.equal(a.keyL, b.keyR))
  .join_full(other, ['keyL', 'keyR'])
  .join_full(other, (a, b) => op.equal(a.keyL, b.keyR))
  .lookup(other, ['key1', 'key2'], 'value1', 'value2')
  .orderby('x', aq.desc('u'))
  .unorder()
  .pivot('key', 'value')
  .pivot(['keyA', 'keyB'], ['valueA', 'valueB'])
  .pivot({ key: (d: any) => d.key }, { value: (d: any) => op.sum(d.value) })
  .relocate(['x', 'y'], { after: 'z' })
  .rename({ x: 'xx', y: 'yy' })
  .rollup({
    min1: op.min('x'),
    max1: op.max('x'),
    sum1: op.sum('x'),
    mode1: op.mode('x'),
    min2: (d: {x: number}) => op.min(d.x),
    max2: (d: {s: string}) => op.max(d.s),
    sum2: (d: {x: number}) => op.sum(d.x),
    mode2: (d: {d: Date}) => op.mode(d.d),
    mix: (d: {x: number, z: number}) => op.min(d.x) + op.sum(d.z)
  })
  .sample(100)
  .sample(100, { replace: true })
  .select('x')
  .select({ x: 'xx' })
  .select(aq.all(), aq.not('x'), aq.range(0, 5))
  .semijoin(other)
  .semijoin(other, ['keyL', 'keyR'])
  .semijoin(other, (a, b) => op.equal(a.keyL, b.keyR))
  .slice(1, -1)
  .slice(2)
  .spread({ a: (d: any) => op.split(d.y, '') })
  .spread('arrayCol', { limit: 100 })
  .union(other)
  .union(other, other2)
  .union([other, other2])
  .unroll('arrayCol', { limit: 1000 });

export const arrow : import('apache-arrow').Table = dt.toArrow();
export const buf : Uint8Array = dt.toArrowIPC();
export const csv : string = dt.toCSV({ delimiter: '\t' });
export const json : string = dt.toJSON({ columns: ['x', 'y'] });
export const html : string = dt.toHTML();
export const md : string = dt.toMarkdown();
