export default function(value, width, char = '0') {
  const s = value + '';
  const len = s.length;
  return len < width ? Array(width - len + 1).join(char) + s : s;
}