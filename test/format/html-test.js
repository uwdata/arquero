import tape from 'tape';
import ColumnTable from '../../src/table/column-table';
import toHTML from '../../src/format/html';

tape('toHTML formats html table text', t => {
  const l = 'style="text-align: left;"';
  const r = 'style="text-align: right;"';
  const html = (u, v) => [
    '<table><thead>',
    '<tr><th>u</th><th>v</th></tr>',
    '</thead><tbody>',
    `<tr><td ${u}>a</td><td ${v}>1</td></tr>`,
    `<tr><td ${u}>a</td><td ${v}>2</td></tr>`,
    `<tr><td ${u}>b</td><td ${v}>3</td></tr>`,
    `<tr><td ${u}>a</td><td ${v}>4</td></tr>`,
    `<tr><td ${u}>b</td><td ${v}>5</td></tr>`,
    '</tbody></table>'
  ];

  const dt = new ColumnTable({
      u: ['a', 'a', 'a', 'b', 'b'],
      v: [2, 1, 4, 5, 3]
    })
    .orderby('v');

  t.equal(toHTML(dt), html(l, r).join(''), 'html text');

  t.equal(
    toHTML(dt, { limit: 3 }),
    html(l, r).slice(0, 6).join('') + '</tbody></table>',
    'html text with limit'
  );

  t.end();
});