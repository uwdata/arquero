import tape from 'tape';
import ColumnTable from '../../src/table/column-table';
import toMarkdown from '../../src/format/to-markdown';

tape('toMarkdown formats markdown table text', t => {
  const md = [
    '|u|v|\n',
    '|:-|-:|\n',
    '|a|1|\n',
    '|a|2|\n',
    '|b|3|\n',
    '|a|4|\n',
    '|b|5|\n'
  ];

  const dt = new ColumnTable({
      u: ['a', 'a', 'a', 'b', 'b'],
      v: [2, 1, 4, 5, 3]
    })
    .orderby('v');

  t.equal(toMarkdown(dt), md.join(''), 'markdown text');

  t.equal(
    toMarkdown(dt, { limit: 3 }),
    md.slice(0, 5).join(''),
    'markdown text with limit'
  );

  t.end();
});

tape('toMarkdown formats markdown table text with format option', t => {
  const md = [
    '|u|v|\n',
    '|:-|-:|\n',
    '|aa|10|\n',
    '|aa|20|\n',
    '|bb|30|\n',
    '|aa|40|\n',
    '|bb|50|\n'
  ];

  const dt = new ColumnTable({
      u: ['a', 'a', 'a', 'b', 'b'],
      v: [2, 1, 4, 5, 3]
    })
    .orderby('v');

  t.equal(
    toMarkdown(dt, {
      format: {
        u: d => d + d,
        v: d => d * 10
      }
    }),
    md.join(''),
    'markdown text with custom format'
  );

  t.end();
});