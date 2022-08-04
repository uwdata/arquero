import { Data, Vector } from 'apache-arrow';

export function ceil64Bytes(length, bpe = 1) {
  return ((((length * bpe) + 63) & ~63) || 64) / bpe;
}

export function array(Type, length, bpe = Type.BYTES_PER_ELEMENT) {
  return new Type(ceil64Bytes(length, bpe));
}

export function arrowData(d) {
  return d instanceof Data
    ? d
    : new Data(d.type, 0, d.length, d.nulls, d.buffers, null, d.dict);
}

export function arrowVector(data) {
  return new Vector([arrowData(data)]);
}

export const encoder = new TextEncoder();

export function encode(data, idx, str) {
  const bytes = encoder.encode(str);
  data.set(bytes, idx);
  return bytes.length;
}

export function encodeInto(data, idx, str) {
  return encoder.encodeInto(str, data.subarray(idx)).written;
}

export const writeUtf8 = encoder.encodeInto ? encodeInto : encode;