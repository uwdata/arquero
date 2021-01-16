const TypedArray = Object.getPrototypeOf(Int8Array);

export default function(value) {
  return value instanceof TypedArray;
}