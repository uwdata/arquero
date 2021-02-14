import {
  Float32, Float64,
  Int16, Int32, Int64, Int8,
  Uint16, Uint32, Uint64, Uint8, Vector
} from 'apache-arrow';
import { dataFromArray, dataFromScan } from './data-from';
import { profile } from './profiler';
import resolveType from '../builder/resolve-type';
import isTypedArray from '../../util/is-typed-array';

export default function(table, name, nrows, scan, type, nullable = true) {
  type = resolveType(type);
  const column = table.column(name);
  const reified = !(table.isFiltered() || table.isOrdered());

  // use existing arrow data if types match
  const vec = arrowVector(column);
  if (vec && reified && typeCompatible(vec.type, type)) {
    return vec;
  }

  // if backing data is a typed array, leverage that
  const data = column.data;
  if (isTypedArray(data)) {
    const dtype = typeFromArray(data);
    if (reified && dtype && typeCompatible(dtype, type)) {
      return dataFromArray(data, dtype);
    } else {
      type = type || dtype;
      nullable = false;
    }
  }

  // perform type inference if needed
  if (!type) {
    const p = profile(scan, column);
    nullable = p.nulls > 0;
    type = p.type();
  }

  return dataFromScan(nrows, scan, column, type, nullable);
}

function arrowVector(value) {
  return value instanceof Vector ? value
    : value.vector instanceof Vector ? value.vector
    : null;
}

function typeFromArray(data) {
  const types = {
    Float32Array:    Float32,
    Float64Array:    Float64,
    Int8Array:       Int8,
    Int16Array:      Int16,
    Int32Array:      Int32,
    Uint8Array:      Uint8,
    Uint16Array:     Uint16,
    Uint32Array:     Uint32,
    BigInt64Array:   Int64,
    BigUint64Array:  Uint64
  };
  const Type = types[data.constructor.name];
  return Type ? new Type() : null;
}

function typeCompatible(a, b) {
  return !a || !b ? true : a.compareTo(b);
}