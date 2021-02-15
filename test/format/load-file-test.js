import tape from 'tape';
import { load, loadArrow, loadCSV, loadJSON } from '../../src/format/load-file';

const PATH = 'test/format/data';

tape('load loads a file using a relative path', async t => {
  const dt = await load(`${PATH}/beers.csv`);
  t.deepEqual([dt.numRows(), dt.numCols()], [1203, 5], 'load table');
  t.end();
});

tape('load loads a file using a file protocol url', async t => {
  const dt = await load(`file://${process.cwd()}/${PATH}/beers.csv`);
  t.deepEqual([dt.numRows(), dt.numCols()], [1203, 5], 'load table');
  t.end();
});

tape('loadCSV loads CSV files from disk', async t => {
  const dt = await loadCSV(`${PATH}/beers.csv`);
  t.deepEqual([dt.numRows(), dt.numCols()], [1203, 5], 'load csv table');
  t.end();
});

tape('loadJSON loads JSON files from disk', async t => {
  const rt = await loadJSON(`${PATH}/rows.json`);
  t.deepEqual([rt.numRows(), rt.numCols()], [3, 3], 'load json rows');

  const st = await loadJSON(`${PATH}/cols-schema.json`);
  t.deepEqual([st.numRows(), st.numCols()], [3, 3], 'load json cols with schema');

  const ct = await loadJSON(`${PATH}/cols-only.json`);
  t.deepEqual([ct.numRows(), ct.numCols()], [3, 3], 'load json cols no schema');

  t.end();
});

tape('loadArrow loads Arrow files from disk', async t => {
  const dt = await loadArrow(`${PATH}/flights.arrow`);
  t.deepEqual([dt.numRows(), dt.numCols()], [9999, 3], 'load arrow table');
  t.end();
});

tape('load fails on non-existent path', t => {
  load('/foo/bar/baz/does.not.exist')
    .then(() => { t.fail('did not fail'); t.end(); })
    .catch(() => { t.pass('failed appropriately'); t.end(); });
});

tape('loadJSON fails on non-JSON file', t => {
  loadJSON(`${PATH}/beers.csv`)
    .then(() => { t.fail('did not fail'); t.end(); })
    .catch(() => { t.pass('failed appropriately'); t.end(); });
});

tape('loadArrow fails on non-Arrow file', t => {
  loadArrow(`${PATH}/beers.csv`)
    .then(() => { t.fail('did not fail'); t.end(); })
    .catch(() => { t.pass('failed appropriately'); t.end(); });
});