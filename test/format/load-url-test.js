import tape from 'tape';
import { load, loadArrow, loadCSV, loadJSON } from '../../src/format/load-url';

// add global fetch to emulate DOM environment
global.fetch = require('node-fetch');

tape('load loads from a URL', async t => {
  const url = 'https://vega.github.io/vega-datasets/data/airports.csv';
  const dt = await load(url);
  t.deepEqual([dt.numRows(), dt.numCols()], [3376, 7], 'load table');
  t.end();
});

tape('loadCSV loads CSV files from a URL', async t => {
  const url = 'https://vega.github.io/vega-datasets/data/airports.csv';
  const dt = await loadCSV(url);
  t.deepEqual([dt.numRows(), dt.numCols()], [3376, 7], 'load csv table');
  t.end();
});

tape('loadJSON loads JSON files from a URL', async t => {
  const url = 'https://vega.github.io/vega-datasets/data/budgets.json';
  const rt = await loadJSON(url);
  t.deepEqual([rt.numRows(), rt.numCols()], [230, 3], 'load json rows');
  t.end();
});

tape('loadArrow loads Arrow files from a URL', async t => {
  const url = 'https://vega.github.io/vega-datasets/data/flights-200k.arrow';
  const dt = await loadArrow(url);
  t.deepEqual([dt.numRows(), dt.numCols()], [231083, 3], 'load arrow table');
  t.end();
});

tape('load fails on non-existent path', t => {
  load('https://foo.bar.baz/does.not.exist')
    .then(() => { t.fail('did not fail'); t.end(); })
    .catch(() => { t.pass('failed appropriately'); t.end(); });
});

tape('load fails on invalid protocol', t => {
  load('htsp://vega.github.io/vega-datasets/data/airports.csv')
    .then(() => { t.fail('did not fail'); t.end(); })
    .catch(() => { t.pass('failed appropriately'); t.end(); });
});

tape('loadJSON fails on non-JSON file URL', t => {
  loadJSON('https://vega.github.io/vega-datasets/data/airports.csv')
    .then(() => { t.fail('did not fail'); t.end(); })
    .catch(() => { t.pass('failed appropriately'); t.end(); });
});

tape('loadArrow fails on non-Arrow file URL', t => {
  loadArrow('https://vega.github.io/vega-datasets/data/airports.csv')
    .then(() => { t.fail('did not fail'); t.end(); })
    .catch(() => { t.pass('failed appropriately'); t.end(); });
});