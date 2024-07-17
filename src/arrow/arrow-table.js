import { Table, tableFromIPC, tableToIPC } from 'apache-arrow';
import error from '../util/error.js';

const fail = (cause) => error(
  'Apache Arrow not imported, ' +
  'see https://github.com/uwdata/arquero#usage',
  cause
);

export function arrowTable(...args) {
  // trap access to provide a helpful message
  // when Apache Arrow has not been imported
  try {
    return new Table(...args);
  } catch (err) {
    fail(err);
  }
}

export function arrowTableFromIPC(bytes) {
  // trap access to provide a helpful message
  // when Apache Arrow has not been imported
  try {
    return tableFromIPC(bytes);
  } catch (err) {
    fail(err);
  }
}

export function arrowTableToIPC(table, format) {
  // trap access to provide a helpful message
  // when Apache Arrow has not been imported
  try {
    return tableToIPC(table, format);
  } catch (err) {
    fail(err);
  }
}
