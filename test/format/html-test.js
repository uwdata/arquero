import tape from 'tape';
import ColumnTable from '../../src/table/column-table';
import toHTML from '../../src/format/to-html';

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

tape('toHTML formats html table text with format option', t => {
  const l = 'style="text-align: left;"';
  const r = 'style="text-align: right;"';
  const html = (u, v) => [
    '<table><thead>',
    '<tr><th>u</th><th>v</th></tr>',
    '</thead><tbody>',
    `<tr><td ${u}>aa</td><td ${v}>10</td></tr>`,
    `<tr><td ${u}>aa</td><td ${v}>20</td></tr>`,
    `<tr><td ${u}>bb</td><td ${v}>30</td></tr>`,
    `<tr><td ${u}>aa</td><td ${v}>40</td></tr>`,
    `<tr><td ${u}>bb</td><td ${v}>50</td></tr>`,
    '</tbody></table>'
  ];

  const dt = new ColumnTable({
      u: ['a', 'a', 'a', 'b', 'b'],
      v: [2, 1, 4, 5, 3]
    })
    .orderby('v');

  t.equal(
    toHTML(dt, {
      format: {
        u: d => d + d,
        v: d => d * 10
      }
    }),
    html(l, r).join(''),
    'html text with custom format'
  );

  t.end();
});

tape('toHTML formats html table text with style option', t => {
  const l = 'style="text-align: left; color: black;"';
  const r = 'style="text-align: right; color: black;"';
  const html = (u, v) => [
    '<table><thead>',
    '<tr style="row(-1,-1)"><th>u</th><th>v</th></tr>',
    '</thead><tbody>',
    `<tr style="row(0,1)"><td ${u}>a</td><td ${v}>1</td></tr>`,
    `<tr style="row(1,0)"><td ${u}>a</td><td ${v}>2</td></tr>`,
    `<tr style="row(2,4)"><td ${u}>b</td><td ${v}>3</td></tr>`,
    `<tr style="row(3,2)"><td ${u}>a</td><td ${v}>4</td></tr>`,
    `<tr style="row(4,3)"><td ${u}>b</td><td ${v}>5</td></tr>`,
    '</tbody></table>'
  ];

  const dt = new ColumnTable({
      u: ['a', 'a', 'a', 'b', 'b'],
      v: [2, 1, 4, 5, 3]
    })
    .orderby('v');

  t.equal(
    toHTML(dt, {
      style: {
        tr: (col, idx, row) => `row(${idx},${row})`,
        td: 'color: black;'
      }
    }),
    html(l, r).join(''),
    'html text with custom style'
  );

  t.end();
});