export default function(value) {
  // all typed arrays should share the same prototype
  return value && Object.getPrototypeOf(value) === Int8Array.prototype;
}