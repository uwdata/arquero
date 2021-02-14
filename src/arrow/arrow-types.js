// Hardwire Arrow type ids to sidestep dependency
// https://github.com/apache/arrow/blob/master/js/src/enum.ts

export default {
  /** The default placeholder type */
  NONE: 0,
  /** A NULL type having no physical storage */
  Null: 1,
  /** Signed or unsigned 8, 16, 32, or 64-bit little-endian integer */
  Int: 2,
  /** 2, 4, or 8-byte floating point value */
  Float: 3,
  /** Variable-length bytes (no guarantee of UTF8-ness) */
  Binary: 4,
  /** UTF8 variable-length string as List<Char> */
  Utf8: 5,
  /** Boolean as 1 bit, LSB bit-packed ordering */
  Bool: 6,
  /** Precision-and-scale-based decimal type. Storage type depends on the parameters. */
  Decimal: 7,
  /** int32_t days or int64_t milliseconds since the UNIX epoch */
  Date: 8,
  /** Time as signed 32 or 64-bit integer, representing either seconds, milliseconds, microseconds, or nanoseconds since midnight since midnight */
  Time: 9,
  /** Exact timestamp encoded with int64 since UNIX epoch (Default unit millisecond) */
  Timestamp: 10,
  /** YEAR_MONTH or DAY_TIME interval in SQL style */
  Interval: 11,
  /** A list of some logical data type */
  List: 12,
  /** Struct of logical types */
  Struct: 13,
  /** Union of logical types */
  Union: 14,
  /** Fixed-size binary. Each value occupies the same number of bytes */
  FixedSizeBinary: 15,
  /** Fixed-size list. Each value occupies the same number of bytes */
  FixedSizeList: 16,
  /** Map of named logical types */
  Map: 17,

  /** Dictionary aka Category type */
  Dictionary: -1,
  Int8: -2,
  Int16: -3,
  Int32: -4,
  Int64: -5,
  Uint8: -6,
  Uint16: -7,
  Uint32: -8,
  Uint64: -9,
  Float16: -10,
  Float32: -11,
  Float64: -12,
  DateDay: -13,
  DateMillisecond: -14,
  TimestampSecond: -15,
  TimestampMillisecond: -16,
  TimestampMicrosecond: -17,
  TimestampNanosecond: -18,
  TimeSecond: -19,
  TimeMillisecond: -20,
  TimeMicrosecond: -21,
  TimeNanosecond: -22,
  DenseUnion: -23,
  SparseUnion: -24,
  IntervalDayTime: -25,
  IntervalYearMonth: -26
};