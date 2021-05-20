import ColumnTable from '../table/column-table'; // eslint-disable-line no-unused-vars

import fromArrow from './from-arrow';
import fromCSV from './from-csv';
import fromFixed from './from-fixed';
import fromJSON from './from-json';
import { from } from '../table';
import isArray from '../util/is-array';

/**
 * Options for file loading.
 * @typedef {object} LoadOptions
 * @property {'arrayBuffer'|'text'|'json'} [as='text'] A string indicating
 *  the data type of the file. One of 'arrayBuffer', 'json', or 'text'.
 * @property {(data: *, options?: object) => ColumnTable} [using] A function
 *  that accepts a data payload (e.g., string or buffer) and an options object
 *  as input and returns an Arquero table (such as fromCSV or fromJSON).
 * @property {object} [fetch] Options to pass to the HTTP fetch method
 *  when loading a URL.
 */

/**
 * Load data from a file and return a Promise for an Arquero table.
 * A specific format parser can be provided with the *using* option,
 * otherwise CSV format is assumed. The options to this method are
 * passed as the second argument to the format parser.
 * @param {string} url The URL to load.
 * @param {LoadOptions & object} options The loading and formatting options.
 * @return {Promise<ColumnTable>} A Promise for an Arquero table.
 * @example aq.load('data/table.csv')
 * @example aq.load('data/table.json', { using: aq.fromJSON })
 * @example aq.load('data/table.json', { using: aq.from })
 */
export function load(url, options = {}) {
  const parse = options.using || fromCSV;
  return fetch(url, options.fetch)
    .then(res => res[options.as || 'text']())
    .then(data => parse(data, options));
}

/**
 * Load an Arrow file from a URL and return a Promise for an Arquero table.
 * @param {string} url The URL to load.
 * @param {LoadOptions & import('./from-arrow').ArrowOptions} options Arrow format options.
 * @return {Promise<ColumnTable>} A Promise for an Arquero table.
 * @example aq.loadArrow('data/table.arrow')
 */
export function loadArrow(url, options) {
  return load(url, { ...options, as: 'arrayBuffer', using: fromArrow });
}

/**
 * Load a CSV file from a URL and return a Promise for an Arquero table.
 * @param {string} url The URL to load.
 * @param {LoadOptions & import('./from-csv').CSVParseOptions} options CSV format options.
 * @return {Promise<ColumnTable>} A Promise for an Arquero table.
 * @example aq.loadCSV('data/table.csv')
 * @example aq.loadTSV('data/table.tsv', { delimiter: '\t' })
 */
export function loadCSV(url, options) {
  return load(url, { ...options, as: 'text', using: fromCSV });
}

/**
 * Load a fixed width file from a URL and return a Promise for an Arquero table.
 * @param {string} url The URL to load.
 * @param {LoadOptions & import('./from-fixed').FixedParseOptions} options Fixed width format options.
 * @return {Promise<ColumnTable>} A Promise for an Arquero table.
 * @example aq.loadFixedWidth('data/table.txt', { names: ['name', 'city', state'], widths: [10, 20, 2] })
 */
 export function loadFixed(url, options) {
  return load(url, { ...options, as: 'text', using: fromFixed });
}

/**
 * Load a JSON file from a URL and return a Promise for an Arquero table.
 * If the loaded JSON is array-valued, an array-of-objects format is assumed
 * and the aq.from method is used to construct the table. Otherwise, a
 * column object format is assumed and aq.fromJSON is applied.
 * @param {string} url The URL to load.
 * @param {LoadOptions & import('./from-json').JSONParseOptions} options JSON format options.
 * @return {Promise<ColumnTable>} A Promise for an Arquero table.
 * @example aq.loadJSON('data/table.json')
 */
export function loadJSON(url, options) {
  return load(url, { ...options, as: 'json', using: parseJSON });
}

function parseJSON(data, options) {
  return isArray(data) ? from(data) : fromJSON(data, options);
}