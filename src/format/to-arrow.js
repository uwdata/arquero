import toArrow from '../arrow/encode';
import { tableToIPC } from 'apache-arrow';

export default toArrow;

export function toArrowIPC(table, options) {
  return tableToIPC(toArrow(table, options));
}