import { Table } from 'apache-arrow';
import error from '../util/error';

export function table() {
  // trap Table access to provide a helpful message
  // when Apache Arrow has not been imported
  try {
    return Table;
  } catch (err) {
    error(
      'Apache Arrow not imported, ' +
      'see https://github.com/uwdata/arquero#usage'
    );
  }
}

export function from(arrow) {
  return arrow && arrow.chunks ? arrow : table().from(arrow);
}