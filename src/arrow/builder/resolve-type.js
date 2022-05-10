import {
  Binary,
  Bool,
  DataType,
  DateDay,
  DateMillisecond,
  Dictionary,
  Float16,
  Float32,
  Float64,
  Int16,
  Int32,
  Int64,
  Int8,
  IntervalDayTime,
  IntervalYearMonth,
  Null,
  TimeMicrosecond,
  TimeMillisecond,
  TimeNanosecond,
  TimeSecond,
  Type,
  Uint16,
  Uint32,
  Uint64,
  Uint8,
  Utf8
} from 'apache-arrow';
import error from '../../util/error';
import toString from '../../util/to-string';

export default function(type) {
  if (type instanceof DataType || type == null) {
    return type;
  }

  switch (type) {
    case Type.Binary:
      return new Binary();
    case Type.Bool:
      return new Bool();
    case Type.DateDay:
      return new DateDay();
    case Type.DateMillisecond:
    case Type.Date:
      return new DateMillisecond();
    case Type.Dictionary:
      return new Dictionary(new Utf8(), new Int32());
    case Type.Float16:
      return new Float16();
    case Type.Float32:
      return new Float32();
    case Type.Float64:
    case Type.Float:
      return new Float64();
    case Type.Int8:
      return new Int8();
    case Type.Int16:
      return new Int16();
    case Type.Int32:
    case Type.Int:
      return new Int32();
    case Type.Int64:
      return new Int64();
    case Type.IntervalDayTime:
      return new IntervalDayTime();
    case Type.Interval:
    case Type.IntervalYearMonth:
      return new IntervalYearMonth();
    case Type.Null:
      return new Null();
    case Type.TimeMicrosecond:
      return new TimeMicrosecond();
    case Type.TimeMillisecond:
    case Type.Time:
      return new TimeMillisecond();
    case Type.TimeNanosecond:
      return new TimeNanosecond();
    case Type.TimeSecond:
      return new TimeSecond();
    case Type.Uint8:
      return new Uint8();
    case Type.Uint16:
      return new Uint16();
    case Type.Uint32:
      return new Uint32();
    case Type.Uint64:
      return new Uint64();
    case Type.Utf8:
      return new Utf8();
    default:
      error(
        `Unsupported type code: ${toString(type)}. ` +
        'Use a data type constructor instead?'
      );
  }
}