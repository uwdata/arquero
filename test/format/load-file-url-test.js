import assert from 'node:assert';
import { load, loadArrow, loadCSV, loadJSON } from '../../src/index.js';

describe('load file url', () => {
  it('loads from a URL', async () => {
    const url = 'https://vega.github.io/vega-datasets/data/airports.csv';
    const dt = await load(url);
    assert.deepEqual([dt.numRows(), dt.numCols()], [3376, 7], 'load table');
  });

  it('loadCSV loads CSV files from a URL', async () => {
    const url = 'https://vega.github.io/vega-datasets/data/airports.csv';
    const dt = await loadCSV(url);
    assert.deepEqual([dt.numRows(), dt.numCols()], [3376, 7], 'load csv table');
  });

  it('loadJSON loads JSON files from a URL', async () => {
    const url = 'https://vega.github.io/vega-datasets/data/budgets.json';
    const rt = await loadJSON(url);
    assert.deepEqual([rt.numRows(), rt.numCols()], [230, 3], 'load json rows');
  });

  it('loadArrow loads Arrow files from a URL', async () => {
    const url = 'https://vega.github.io/vega-datasets/data/flights-200k.arrow';
    const dt = await loadArrow(url);
    assert.deepEqual([dt.numRows(), dt.numCols()], [200000, 3], 'load arrow table');
  });

  it('fails on non-existent path', async () => {
    try {
      await load('https://foo.bar.test/does.not.exist');
      assert.fail('did not fail');
    } catch (err) { // eslint-disable-line no-unused-vars
      assert.ok(true, 'failed appropriately');
    }
  });

  it('fails on invalid protocol', async () => {
    try {
      await load('htsp://vega.github.io/vega-datasets/data/airports.csv');
      assert.fail('did not fail');
    } catch (err) { // eslint-disable-line no-unused-vars
      assert.ok(true, 'failed appropriately');
    }
  });

  it('loadJSON fails on non-JSON file URL', async () => {
    try {
      await loadJSON('https://vega.github.io/vega-datasets/data/airports.csv');
      assert.fail('did not fail');
    } catch (err) { // eslint-disable-line no-unused-vars
      assert.ok(true, 'failed appropriately');
    }
  });

  it('loadArrow fails on non-Arrow file URL', async () => {
    try {
      await loadArrow('https://vega.github.io/vega-datasets/data/airports.csv');
      assert.fail('did not fail');
    } catch (err) { // eslint-disable-line no-unused-vars
      assert.ok(true, 'failed appropriately');
    }
  });
});
