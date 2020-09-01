const { hasOwnProperty } = Object.prototype;

export default function(object, property) {
  return hasOwnProperty.call(object, property);
}