import error from '../util/error';
import repeat from '../util/repeat';
import toString from '../util/to-string';
import unroll from '../util/unroll';
import dictionaryColumn from './dictionary-column';

// Hardwire Arrow type ids to avoid explicit dependency
// https://github.com/apache/arrow/blob/master/js/src/enum.ts
export const LIST = 12;
export const STRUCT = 13;
export const FIXED_SIZE_LIST = 16;
const isList = id => id === LIST || id === FIXED_SIZE_LIST;
const isStruct = id => id === STRUCT;

/**
 * Create an Arquero column that proxies access to an Arrow column.
 * @param {object} arrow An Apache Arrow column.
 */
export default function arrowColumn(arrow) {
  if (arrow.dictionary) return dictionaryColumn(arrow);

  const { chunks } = arrow;
  const vector = chunks.length === 1 ? chunks[0] : arrow;

  if (vector.numChildren) {
    const { length } = vector;
    const get = getNested(vector);
    return {
      vector, length, get,
      [Symbol.iterator]: () => iterator(length, get)
    };
  }

  return vector;
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

const getNested = vector => isList(vector.typeId) ? getList(vector)
  : isStruct(vector.typeId) ? getStruct(vector)
  : error(`Unsupported Arrow type: ${toString(vector.VectorName)}`);

const getList = vector => vector.nullCount
  ? row => vector.isValid(row) ? arrayFrom(vector.get(row)) : null
  : row => arrayFrom(vector.get(row));

function getStruct(vector) {
  const props = [];
  const code = [];
  vector.type.children.forEach((field, i) => {
    props.push(arrowColumn(vector.getChildAt(i)));
    code.push(`${toString(field.name)}:_${i}.get(row)`);
  });
  const get = unroll('row', '({' + code + '})', props);

  return vector.nullCount
    ? row => vector.isValid(row) ? get(row) : null
    : get;
}