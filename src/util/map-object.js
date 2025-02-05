export function mapObject(obj, fn, output = {}) {
  for (const key in obj) {
    output[key] = fn(obj[key], key);
  }
  return output;
}
