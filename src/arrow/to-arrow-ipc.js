import { arrowTableToIPC } from './arrow-table.js';
import toArrow from './to-arrow.js';

/**
 * Format a table as binary data in the Apache Arrow IPC format.
 * @param {object[]|import('../table/Table.js').Table} data The table data
 * @param {import('./types.js').ArrowIPCFormatOptions} [options]
 *  The Arrow IPC formatting options. Set the *format* option to `'stream'`
 *  or `'file'` to specify the IPC format.
 * @return {Uint8Array} A new Uint8Array of Arrow-encoded binary data.
 */
export default function(data, options = {}) {
  const { format = 'stream', ...toArrowOptions } = options;
  if (!['stream', 'file'].includes(format)) {
    throw Error('Unrecognised Arrow IPC output format');
  }
  return arrowTableToIPC(toArrow(data, toArrowOptions), format);
}
