import { Type } from 'apache-arrow';
import arrayBuilder from './array-builder';
import boolBuilder from './bool-builder';
import dateDayBuilder from './date-day-builder';
import dateMillisBuilder from './date-millis-builder';
import defaultBuilder from './default-builder';
import dictionaryBuilder from './dictionary-builder';
import validBuilder from './valid-builder';

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