import { array_agg, entries_agg, map_agg, object_agg } from '../op/op-api';
import error from '../util/error';
import uniqueName from '../util/unique-name';

/**
 * Regroup table rows in response to a BitSet filter.
 * @param {GroupBySpec} groups The current groupby specification.
 * @param {BitSet} filter The filter to apply.
 */
export function regroup(groups, filter) {
  if (!groups || !filter) return groups;

  // check for presence of rows for each group
  const { keys, rows, size } = groups;
  const map = new Int32Array(size);
  filter.scan(row => map[keys[row]] = 1);

  // check sum, exit early if all groups occur
  const sum = map.reduce((sum, val) => sum + val, 0);
  if (sum === size) return groups;

  // create group index map, filter exemplar rows
  const _rows = Array(sum);
  let _size = 0;
  for (let i = 0; i < size; ++i) {
    if (map[i]) _rows[map[i] = _size++] = rows[i];
  }

  // re-index the group keys
  const _keys = new Uint32Array(keys.length);
  filter.scan(row => _keys[row] = map[keys[row]]);

  return { ...groups, keys: _keys, rows: _rows, size: _size };
}

/**
 * Regroup table rows in response to a re-indexing.
 * This operation may or may not involve filtering of rows.
 * @param {GroupBySpec} groups The current groupby specification.
 * @param {Function} scan Function to scan new row indices.
 * @param {boolean} filter Flag indicating if filtering may occur.
 * @param {number} nrows The number of rows in the new table.
 */
export function reindex(groups, scan, filter, nrows) {
  const { keys, rows, size } = groups;
  let _rows = rows;
  let _size = size;
  let map = null;

  if (filter) {
    // check for presence of rows for each group
    map = new Int32Array(size);
    scan(row => map[keys[row]] = 1);

    // check sum, regroup if not all groups occur
    const sum = map.reduce((sum, val) => sum + val, 0);
    if (sum !== size) {
      // create group index map, filter exemplar rows
      _rows = Array(sum);
      _size = 0;
      for (let i = 0; i < size; ++i) {
        if (map[i]) _rows[map[i] = _size++] = rows[i];
      }
    }
  }

  // re-index the group keys
  let r = -1;
  const _keys = new Uint32Array(nrows);
  const fn = _size !== size
    ? row => _keys[++r] = map[keys[row]]
    : row => _keys[++r] = keys[row];
  scan(fn);

  return { ...groups, keys: _keys, rows: _rows, size: _size };
}

export function nest(table, idx, obj, type) {
  const agg = type === 'map' || type === true ? map_agg
    : type === 'entries' ? entries_agg
    : type === 'object' ? object_agg
    : error('groups option must be "map", "entries", or "object".');

  const { names } = table.groups();
  const col = uniqueName(table.columnNames(), '_');

  // create table with one column of row objects
  // then aggregate into per-group arrays
  let t = table
    .select()
    .reify(idx)
    .create({ data: { [col]: obj } })
    .rollup({ [col]: array_agg(col) });

  // create nested structures for each level of grouping
  for (let i = names.length; --i >= 0;) {
    t = t
      .groupby(names.slice(0, i))
      .rollup({ [col]: agg(names[i], col) });
  }

  // return the final aggregated structure
  return t.get(col);
}