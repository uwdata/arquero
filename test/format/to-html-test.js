import assert from 'node:assert';
import { ColumnTable, toHTML } from '../../src/index.js';

describe('toHTML', () => {
  it('formats html table text', () => {
    const l = 'style="text-align: left;"';
    const r = 'style="text-align: right;"';
    const html = (u, v) => [
      '<table><thead>',
      `<tr><th ${u}>u</th><th ${v}>v</th></tr>`,
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

    assert.equal(toHTML(dt), html(l, r).join(''), 'html text');

    assert.equal(
      toHTML(dt, { limit: 3 }),
      html(l, r).slice(0, 6).join('') + '</tbody></table>',
      'html text with limit'
    );
  });

  it('formats html table text with format option', () => {
    const l = 'style="text-align: left;"';
    const r = 'style="text-align: right;"';
    const html = (u, v) => [
      '<table><thead>',
      `<tr><th ${u}>u</th><th ${v}>v</th></tr>`,
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

    assert.equal(
      toHTML(dt, {
        format: {
          u: d => d + d,
          v: d => d * 10
        }
      }),
      html(l, r).join(''),
      'html text with custom format'
    );
  });

  it('formats html table text with style option', () => {
    const la = 'text-align: left;';
    const ra = 'text-align: right;';
    const cb = 'color: black;';
    const l = `style="${la} ${cb}"`;
    const r = `style="${ra} ${cb}"`;
    const html = (u, v) => [
      '<table><thead>',
      '<tr style="row(-1,-1)">',
      `<th style="${la}">u</th><th style="${ra}">v</th></tr>`,
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

    assert.equal(
      toHTML(dt, {
        style: {
          tr: (col, idx, row) => `row(${idx},${row})`,
          td: 'color: black;'
        }
      }),
      html(l, r).join(''),
      'html text with custom style'
    );
  });

  it('formats html table text with null option', () => {
    const a = 'style="text-align: right;"';
    const html = (a) => [
      '<table><thead>',
      `<tr><th ${a}>u</th></tr>`,
      '</thead><tbody>',
      `<tr><td ${a}>a</td></tr>`,
      `<tr><td ${a}>0</td></tr>`,
      `<tr><td ${a}><span class="null">null</span></td></tr>`,
      `<tr><td ${a}><span class="null">undefined</span></td></tr>`,
      '</tbody></table>'
    ];

    const dt = new ColumnTable({ u: ['a', 0, null, undefined] });

    assert.equal(
      toHTML(dt, {
        null: v => `<span class="null">${v}</span>`
      }),
      html(a).join(''),
      'html text with custom null format'
    );
  });
});
