import { Table, tableFromIPC } from 'apache-arrow';
import error from '../util/error.js';

const fail = () => error(
  'Apache Arrow not imported, ' +
  'see https://github.com/uwdata/arquero#usage'
);

export function table() {
  // trap access to provide a helpful message
  // when Apache Arrow has not been imported
  try {
    return Table;
  } catch (err) { // eslint-disable-line no-unused-vars
    fail();
  }
}

export function fromIPC() {
  // trap access to provide a helpful message
  // when Apache Arrow has not been imported
  try {
    return tableFromIPC;
  } catch (err) { // eslint-disable-line no-unused-vars
    fail();
  }
}
