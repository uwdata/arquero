import { Type } from 'apache-arrow';
import arrayBuilder from './array-builder.js';
import boolBuilder from './bool-builder.js';
import dateDayBuilder from './date-day-builder.js';
import dateMillisBuilder from './date-millis-builder.js';
import defaultBuilder from './default-builder.js';
import dictionaryBuilder from './dictionary-builder.js';
import validBuilder from './valid-builder.js';

export default function(type, nrows, nullable = true) {
  let method;

  switch (type.typeId) {
    case Type.Int:
      method = type.bitWidth < 64 ? arrayBuilder : null;
      break;
    case Type.Float:
      method = type.precision > 0 ? arrayBuilder : null;
      break;
    case Type.Dictionary:
      // check sub-types against builder assumptions
      // if check fails, fallback to default builder
      method = (
        type.dictionary.typeId === Type.Utf8 &&
        type.indices.typeId === Type.Int &&
        type.indices.bitWidth < 64
      ) ? dictionaryBuilder : null;
      break;
    case Type.Bool:
      method = boolBuilder;
      break;
    case Type.Date:
      method = type.unit ? dateMillisBuilder : dateDayBuilder;
      break;
  }

  return method == null ? defaultBuilder(type)
    : nullable ? validBuilder(method(type, nrows), nrows)
    : method(type, nrows);
}
