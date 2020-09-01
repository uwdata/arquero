import tape from 'tape';
import tableEqual from '../table-equal';
import { op, rolling, table } from '../../src/verbs';
const { abs, lag, mean, median, rank, stdev } = op;

tape('derive creates new columns', t => {
  const data = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8]
  };

  const dt = table(data).derive({ c: d => d.a + d.b });
  t.equal(dt.numRows(), 4, 'num rows');
  t.equal(dt.numCols(), 3, 'num cols');
  tableEqual(t, dt, { ...data, c: [3, 7, 11, 15] }, 'derive data');
  t.end();
});

tape('derive overwrites existing columns', t => {
  const data = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8]
  };

  const dt = table(data).derive({ a: d => d.a + d.b });
  t.equal(dt.numRows(), 4, 'num rows');
  t.equal(dt.numCols(), 2, 'num cols');
  tableEqual(t, dt, { ...data, a: [3, 7, 11, 15] }, 'derive data');
  t.end();
});

tape('derive supports aggregate and window operators', t => {
  const n = 10;
  const k = Array(n);
  const a = Array(n);
  const b = Array(n);

  for (let i = 0; i < n; ++i) {
    k[i] = i % 3;
    a[i] = i;
    b[i] = i + 1;
  }

  const td = table({ k, a, b })
    .groupby('k')
    .orderby('a')
    .derive({
      rank: () => rank(),
      diff: ({ a, b }) => a - lag(b, 1, 0),
      roll: rolling(d => mean(d.a), [-2, 0])
    });
  tableEqual(t, td.select('rank', 'diff', 'roll'), {
    rank: [1, 1, 1, 2, 2, 2, 3, 3, 3, 4],
    diff: [0, 1, 2, 2, 2, 2, 2, 2, 2, 2],
    roll: [0, 1, 2, 1.5, 2.5, 3.5, 3, 4, 5, 6]
  }, 'derive window queries');

  const tz = td
    .ungroup()
    .derive({
      z: ({ a }) => abs(a - mean(a)) / stdev(a)
    });
  tableEqual(t, tz.select('z'), {
    z: [
      1.4863010829205867,
      1.1560119533826787,
      0.8257228238447705,
      0.49543369430686224,
      0.1651445647689541,
      0.1651445647689541,
      0.49543369430686224,
      0.8257228238447705,
      1.1560119533826787,
      1.4863010829205867
    ]
  }, 'z-score');

  const tm = tz
    .derive({ dev: d => abs(d.a - median(d.a)) })
    .rollup({ mad: d => median(d.dev) });
  tableEqual(t, tm.select('mad'), {
    mad: [ 2.5 ]
  }, 'mad');

  t.end();
});