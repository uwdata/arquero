import { tableToIPC } from 'apache-arrow';
import toArrow from '../arrow/encode/index.js';

export default toArrow;

export function toArrowIPC(table, options = {}) {
  const { format: format, ...toArrowOptions } = options;
  const outputFormat = format ? format : 'stream';
  if (!['stream', 'file'].includes(outputFormat)) {
    throw Error('Unrecognised output format');
  }
  return tableToIPC(toArrow(table, toArrowOptions), format);
}
