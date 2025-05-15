import tableEqual from '../table-equal.js';
import { table } from '../../src/index.js';

describe('slice', () => {
  it('slices a table', () => {
    const dt = table({ v: [1, 2, 3, 4] });

    tableEqual(
      dt.slice(),
      { v: [1, 2, 3, 4] },
      'sliced data, all'
    );

    tableEqual(
      dt.slice(2),
      { v: [3, 4] },
      'sliced data, start'
    );

    tableEqual(
      dt.slice(1, 3),
      { v: [2, 3] },
      'sliced data, start and end'
    );

    tableEqual(
      dt.slice(1, -1),
      { v: [2, 3] },
      'sliced data, start and negative end'
    );

    tableEqual(
      dt.slice(-3, -1),
      { v: [2, 3] },
      'sliced data, negative start and end'
    );

    tableEqual(
      dt.slice(-1000, -900),
      { v: [] },
      'sliced data, extreme negative start and end'
    );
  });

  it('slices a grouped table', () => {
    const dt = table({ v: [1, 2, 3, 4, 5, 6, 7] })
      .groupby({ k: d => d.v % 2 });

    tableEqual(
      dt.slice(),
      { v: [1, 2, 3, 4, 5, 6, 7] },
      'sliced data, all'
    );

    tableEqual(
      dt.slice(2),
      { v: [5, 6, 7] },
      'sliced data, start'
    );

    tableEqual(
      dt.slice(1, 3),
      { v: [3, 4, 5, 6] },
      'sliced data, start and end'
    );

    tableEqual(
      dt.slice(1, -1),
      { v: [3, 4, 5] },
      'sliced data, start and negative end'
    );

    tableEqual(
      dt.slice(-3, -1),
      { v: [2, 3, 4, 5] },
      'sliced data, negative start and end'
    );

    tableEqual(
      dt.slice(-1000, -900),
      { v: [] },
      'sliced data, extreme negative start and end'
    );
  });

  it('slices a grouped, ordered, and filtered table', () => {
    const dt = table({ a: [1, 1], b: [2, 3], c: [3, 4] })
      .groupby('a')
      .orderby('b')
      .filter(d => d.c === 3);

    tableEqual(
      dt.slice(),
      { a: [1], b: [2], c: [3] },
      'sliced data, all'
    );

    tableEqual(
      dt.slice(0, 1),
      { a: [1], b: [2], c: [3] },
      'sliced data, start and end'
    );

    tableEqual(
      dt.slice(-1),
      { a: [1], b: [2], c: [3] },
      'sliced data, negative start'
    );
  });
});
