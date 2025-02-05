import assert from 'node:assert';
import { loadArrow, loadCSV, loadJSON } from '../../src/index.js';

const PATH = 'test/format/data';

describe('load file', () => {
  it('loads a file using a relative path', async () => {
    const dt = await loadCSV(`${PATH}/beers.csv`);
    assert.deepEqual([dt.numRows(), dt.numCols()], [1203, 5], 'load table');
  });

  it('loads a file using a file protocol url', async () => {
    const dt = await loadCSV(`file://${process.cwd()}/${PATH}/beers.csv`);
    assert.deepEqual([dt.numRows(), dt.numCols()], [1203, 5], 'load table');
  });

  it('loadCSV loads CSV files from disk', async () => {
    const dt = await loadCSV(`${PATH}/beers.csv`);
    assert.deepEqual([dt.numRows(), dt.numCols()], [1203, 5], 'load csv table');
  });

  it('loadJSON loads JSON files from disk', async () => {
    const rt = await loadJSON(`${PATH}/rows.json`);
    assert.deepEqual([rt.numRows(), rt.numCols()], [3, 3], 'load json rows');

    const ct = await loadJSON(`${PATH}/columns.json`, { format: 'columns' });
    assert.deepEqual([ct.numRows(), ct.numCols()], [3, 3], 'load json cols');
  });

  it('loadArrow loads Arrow files from disk', async () => {
    const dt = await loadArrow(`${PATH}/flights.arrow`);
    assert.deepEqual([dt.numRows(), dt.numCols()], [9999, 3], 'load arrow table');
  });

  it('fails on non-existent path', async () => {
    try {
      await loadCSV('/foo/bar/baz/does.not.exist');
      assert.fail('did not fail');
    } catch (err) { // eslint-disable-line no-unused-vars
      assert.ok(true, 'failed appropriately');

    }
  });

  it('loadJSON fails on non-JSON file', async () => {
    try {
      await loadJSON(`${PATH}/beers.csv`);
      assert.fail('did not fail');
    } catch (err) { // eslint-disable-line no-unused-vars
       assert.ok(true, 'failed appropriately');
    }
  });

  it('loadArrow fails on non-Arrow file', async () => {
    try {
      await loadArrow(`${PATH}/beers.csv`);
      assert.fail('did not fail');
    } catch (err) { // eslint-disable-line no-unused-vars
      assert.ok(true, 'failed appropriately');
    }
  });
});
