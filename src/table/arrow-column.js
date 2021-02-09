import error from '../util/error';
import repeat from '../util/repeat';
import toString from '../util/to-string';
import unroll from '../util/unroll';
import dictionaryColumn from './dictionary-column';

// Hardwire Arrow type ids to avoid explicit dependency
// https://github.com/apache/arrow/blob/master/js/src/enum.ts
const UTF8 = 5;
const STRUCT = 13;
const isList = id => id === 12 || id === 16; // List or FixedSizeList

/**
 * Create an Arquero column that proxies access to an Arrow column.
 * @param {object} arrow An Apache Arrow column.
 * @return {import('./column').ColumnType} An Arquero-compatible column.
 */
export default function arrowColumn(arrow, nested) {
  if (arrow.dictionary) return dictionaryColumn(arrow);
  const { typeId, chunks, length, numChildren } = arrow;
  const vector = chunks && chunks.length === 1 ? chunks[0] : arrow;
  const get = numChildren && nested ? getNested(vector)
    : numChildren ? memoize(getNested(vector))
    : typeId === UTF8 ? memoize(row => vector.get(row))
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

const getNested = vector => isList(vector.typeId) ? getList(vector)
  : vector.typeId === STRUCT ? getStruct(vector)
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