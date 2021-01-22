import tape from 'tape';
import tableEqual from '../table-equal';
import { not, table } from '../../src';

function data() {
  return {
    k: ['a', 'b', 'b'],
    x: [1, 2, 3],
    y: [9, 8, 7]
  };
}

function output(key = 'key', value = 'value') {
  return {
    k: ['a', 'a', 'b', 'b', 'b', 'b'],
    [key]: ['x', 'y', 'x', 'y', 'x', 'y'],
    [value]: [1, 9, 2, 8, 3, 7]
  };
}

tape('fold generates key-value pair columns', t => {
  const ut = table(data()).fold(['x', 'y']);
  tableEqual(t, ut, output(), 'fold data');
  t.end();
});

tape('fold accepts select statements', t => {
  const ut = table(data()).fold(not('k'));
  tableEqual(t, ut, output(), 'fold selected data');
  t.end();
});

tape('fold accepts named output columns', t => {
  const ut = table(data()).fold(['x', 'y'], { as: ['u', 'v'] });
  tableEqual(t, ut, output('u', 'v'), 'fold as data');
  t.end();
});