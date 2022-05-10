import arrowDictionary from './arrow-dictionary';
import error from '../util/error';
import repeat from '../util/repeat';
import toString from '../util/to-string';
import unroll from '../util/unroll';
import { isDict, isFixedSizeList, isList, isStruct, isUtf8 } from './arrow-types';

const isListType = type => isList(type) || isFixedSizeList(type);

/**
 * Create an Arquero column that proxies access to an Arrow column.
 * @param {object} arrow An Apache Arrow column.
 * @return {import('../table/column').ColumnType} An Arquero-compatible column.
 */
export default function arrowColumn(vector, nested) {
  const { type, length, numChildren } = vector;
  if (isDict(type)) return arrowDictionary(vector);

  const get = numChildren && nested ? getNested(vector)
    : numChildren ? memoize(getNested(vector))
    : isUtf8(type) ? memoize(row => vector.get(row))
    : null;

  return get
    ? { vector, length, get, [Symbol.iterator]: () => iterator(length, get) }
    : vector;
}

function memoize(get) {
  const values = [];
  return row => {
    const v = values[row];
    return v !== undefined ? v : (values[row] = get(row));
  };
}

function* iterator(n, get) {
  for (let i = 0; i < n; ++i) {
    yield get(i);
  }
}

const arrayFrom = vector => vector.numChildren
  ? repeat(vector.length, getNested(vector))
  : vector.nullCount ? [...vector]
  : vector.toArray();

const getNested = vector => isListType(vector.type) ? getList(vector)
  : isStruct(vector.type) ? getStruct(vector)
  : error(`Unsupported Arrow type: ${toString(vector.VectorName)}`);

const getList = vector => vector.nullCount
  ? row => vector.isValid(row) ? arrayFrom(vector.get(row)) : null
  : row => arrayFrom(vector.get(row));

function getStruct(vector) {
  const props = [];
  const code = [];
  vector.type.children.forEach((field, i) => {
    props.push(arrowColumn(vector.getChildAt(i), true));
    code.push(`${toString(field.name)}:_${i}.get(row)`);
  });
  const get = unroll('row', '({' + code + '})', props);

  return vector.nullCount
    ? row => vector.isValid(row) ? get(row) : null
    : get;
}