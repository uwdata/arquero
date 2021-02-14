import { dataFromScan } from './data-from';
import { profile } from './profiler';
import resolveType from '../builder/resolve-type';

export default function(data, name, nrows, scan, type, nullable = true) {
  type = resolveType(type);

  // perform type inference if needed
  if (!type) {
    const p = profile(scan, name);
    nullable = p.nulls > 0;
    type = p.type();
  }

  return dataFromScan(nrows, scan, name, type, nullable);
}