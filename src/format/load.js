import fromArrow from './from-arrow';
import fromCSV from './from-csv';
import fromJSON from './from-json';
import { from } from '../table';
import error from '../util/error';
import isArray from '../util/is-array';

const _fetch = typeof fetch === 'function' ? fetch
  : typeof require === 'function' ? require('node-fetch')
  : error('No fetch implementation available');

/**
 * Options for file loading.
 * @typedef {object} LoadOptions
 * @property {'arrayBuffer'|'text'|'json'} [as='text'] A string indicating
 *  the data type of the file. One of 'arrayBuffer', 'json', or 'text'.
 * @property {Function} [using] A function that accepts a data payload
 *  (e.g., string) and an optional options object as input and returns
 *  an Arquero table (such as fromCSV or fromJSON).
 * @property {object} [fetch] Options to pass to the HTTP fetch method
 *  when loading from the URL.
 */

/**
 * Load data from a URL and return a Promise for an Arquero table.
 * A specific format parser can be provided with the *using* option,
 * otherwise CSV format is assumed. The options to this method are
 * passed as the second argument to the format parser.
 * @param {string} url The URL to load.
 * @param {LoadOptions} options The loading and formatting options.
 * @return {Promise<ColumnTable>} A Promise for an Arquero table.
 * @example aq.loadURL('data/table.csv')
 * @example aq.loadURL('data/table.json', { using: aq.fromJSON })
 * @example aq.loadURL('data/table.json', { using: aq.from })
 */
export function load(url, options = {}) {
  const parse = options.using || fromCSV;
  return _fetch(url, options.fetch)
    .then(res => res[options.as || 'text']())
    .then(data => parse(data, url, options));
}

/**
 * Load an Arrow file from a URL and return a Promise for an Arquero table.
 * @param {string} url The URL to load.
 * @param {import('./from-arrow').ArrowOptions} options Arrow format options.
 * @return {Promise<ColumnTable>} A Promise for an Arquero table.
 * @example aq.loadArrow('data/table.arrow')
 */
export function loadArrow(url, options) {
  return load(url, { ...options, as: 'arrayBuffer', using: fromArrow });
}

/**
 * Load a CSV file from a URL and return a Promise for an Arquero table.
 * @param {string} url The URL to load.
 * @param {import('./from-csv').CSVParseOptions} options CSV format options.
 * @return {Promise<ColumnTable>} A Promise for an Arquero table.
 * @example aq.loadCSV('data/table.csv')
 * @example aq.loadTSV('data/table.tsv', { delimiter: '\t' })
 */
export function loadCSV(url, options) {
  return load(url, { ...options, as: 'text', using: fromCSV });
}

/**
 * Load a JSON file from a URL and return a Promise for an Arquero table.
 * If the loaded JSON is array-valued, an array-of-objects format is assumed
 * and the aq.from method is used to construct the table. Otherwise, a
 * column object format is assumed and aq.fromJSON is applied.
 * @param {string} url The URL to load.
 * @param {import('./from-json').JSONParseOptions} options JSON format options.
 * @return {Promise<ColumnTable>} A Promise for an Arquero table.
 * @example aq.loadJSON('data/table.json')
 */
export function loadJSON(url, options) {
  return load(url, { ...options, as: 'json', using: parseJSON });
}

function parseJSON(data, options) {
  return isArray(data) ? from(data) : fromJSON(data, options);
}

/**
 * An Arquero Column Table
 * @typedef {import('../table/column-table')} ColumnTable
 */