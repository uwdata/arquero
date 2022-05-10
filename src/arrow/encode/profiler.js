import { Field, FixedSizeList, List, Struct, Type } from 'apache-arrow';
import resolveType from '../builder/resolve-type';
import error from '../../util/error';
import isArrayType from '../../util/is-array-type';
import isDate from '../../util/is-date';
import isExactUTCDate from '../../util/is-exact-utc-date';

export function profile(scan, column) {
  const p = profiler();
  scan(column, p.add);
  return p;
}

export function profiler() {
  const p = {
    count: 0,
    nulls: 0,
    bools: 0,
    nums: 0,
    ints: 0,
    bigints: 0,
    min: Infinity,
    max: -Infinity,
    digits: 0,
    dates: 0,
    utcdays: 0,
    strings: 0,
    strlen: 0,
    arrays: 0,
    minlen: Infinity,
    maxlen: 0,
    structs: 0,

    add(value) {
      ++p.count;
      if (value == null) {
        ++p.nulls;
        return;
      }

      const type = typeof value;
      if (type === 'string') {
        ++p.strings;
      } else if (type === 'number') {
        ++p.nums;
        if (value < p.min) p.min = value;
        if (value > p.max) p.max = value;
        if (Number.isInteger(value)) ++p.ints;
      } else if (type === 'boolean') {
        ++p.bools;
      } else if (type === 'object') {
        if (isDate(value)) {
          ++p.dates;
          if (isExactUTCDate(value)) {
            ++p.utcdays;
          }
        } else if (isArrayType(value)) {
          ++p.arrays;
          if (value.length < p.minlen) p.minlen = value.length;
          if (value.length > p.maxlen) p.maxlen = value.length;
          const ap = p.array_prof || (p.array_prof = profiler());
          value.forEach(ap.add);
        } else {
          ++p.structs;
          const sp = p.struct_prof || (p.struct_prof = {});
          for (const key in value) {
            const fp = sp[key] || (sp[key] = profiler());
            fp.add(value[key]);
          }
        }
      } else if (type === 'bigint') {
        ++p.bigints;
        if (value < p.min) p.min = value;
        if (value > p.max) p.max = value;
      }
    },
    type() {
      return resolveType(infer(p));
    }
  };

  return p;
}

function infer(p) {
  const valid = p.count - p.nulls;

  if (valid === 0) {
    return Type.Null;
  }
  else if (p.ints === valid) {
    const v = Math.max(Math.abs(p.min) - 1, p.max);
    return p.min < 0
      ? v >= 2 ** 31 ? Type.Float64
        : v < (1 << 7) ? Type.Int8 : v < (1 << 15) ? Type.Int16 : Type.Int32
      : v >= 2 ** 32 ? Type.Float64
        : v < (1 << 8) ? Type.Uint8 : v < (1 << 16) ? Type.Uint16 : Type.Uint32;
  }
  else if (p.nums === valid) {
    return Type.Float64;
  }
  else if (p.bigints === valid) {
    const v = -p.min > p.max ? -p.min - 1n : p.max;
    return p.min < 0
      ? v < 2 ** 63 ? Type.Int64
        : error(`BigInt exceeds 64 bits: ${v}`)
      : p.max < 2 ** 64 ? Type.Uint64
        : error(`BigInt exceeds 64 bits: ${p.max}`);
  }
  else if (p.bools === valid) {
    return Type.Bool;
  }
  else if (p.utcdays === valid) {
    return Type.DateDay;
  }
  else if (p.dates === valid) {
    return Type.DateMillisecond;
  }
  else if (p.arrays === valid) {
    const type = Field.new('value', p.array_prof.type(), true);
    return p.minlen === p.maxlen
      ? new FixedSizeList(p.minlen, type)
      : new List(type);
  }
  else if (p.structs === valid) {
    const sp = p.struct_prof;
    return new Struct(
      Object.keys(sp).map(name => Field.new(name, sp[name].type(), true))
    );
  }
  else if (p.strings > 0) {
    return Type.Dictionary;
  }
  else {
    error('Type inference failure');
  }
}