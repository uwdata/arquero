import tape from 'tape';
import tableEqual from '../table-equal';
import { table } from '../../src/verbs';

tape('slice slices a table', t => {
  const dt = table({ v: [1, 2, 3, 4] });

  tableEqual(t,
    dt.slice(),
    { v: [1, 2, 3, 4] },
    'sliced data, all'
  );

  tableEqual(t,
    dt.slice(2),
    { v: [3, 4] },
    'sliced data, start'
  );

  tableEqual(t,
    dt.slice(1, 3),
    { v: [2, 3] },
    'sliced data, start and end'
  );

  tableEqual(t,
    dt.slice(1, -1),
    { v: [2, 3] },
    'sliced data, start and negative end'
  );

  tableEqual(t,
    dt.slice(-3, -1),
    { v: [2, 3] },
    'sliced data, negative start and end'
  );

  tableEqual(t,
    dt.slice(-1000, -900),
    { v: [] },
    'sliced data, extreme negative start and end'
  );

  t.end();
});

tape('slice slices a grouped table', t => {
  const dt = table({ v: [1, 2, 3, 4, 5, 6, 7] })
    .groupby({ k: d => d.v % 2 });

  tableEqual(t,
    dt.slice(),
    { v: [1, 2, 3, 4, 5, 6, 7] },
    'sliced data, all'
  );

  tableEqual(t,
    dt.slice(2),
    { v: [5, 6, 7] },
    'sliced data, start'
  );

  tableEqual(t,
    dt.slice(1, 3),
    { v: [3, 4, 5, 6] },
    'sliced data, start and end'
  );

  tableEqual(t,
    dt.slice(1, -1),
    { v: [3, 4, 5] },
    'sliced data, start and negative end'
  );

  tableEqual(t,
    dt.slice(-3, -1),
    { v: [2, 3, 4, 5] },
    'sliced data, negative start and end'
  );

  tableEqual(t,
    dt.slice(-1000, -900),
    { v: [] },
    'sliced data, extreme negative start and end'
  );

  t.end();
});