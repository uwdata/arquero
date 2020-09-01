import tape from 'tape';
import tableEqual from '../table-equal';
import { table } from '../../src/verbs';

tape('fold generates key-value pair columns', t => {
  const data = {
    k: ['a', 'b', 'b'],
    x: [1, 2, 3],
    y: [9, 8, 7]
  };

  const ut = table(data).fold('x', 'y');

  tableEqual(t, ut, {
    k: ['a', 'a', 'b', 'b', 'b', 'b'],
    key: ['x', 'y', 'x', 'y', 'x', 'y'],
    value: [1, 9, 2, 8, 3, 7]
  }, 'fold data');
  t.end();
});