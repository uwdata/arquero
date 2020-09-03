export default function(value) {
  // all typed arrays should share the same method prototype
  return value && value.map === Int8Array.prototype.map;
}