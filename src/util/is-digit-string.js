export default function(value) {
  const n = value.length;
  for (let i = 0; i < n; ++i) {
    const c = value.charCodeAt(i);
    if (c < 48 || c > 57) return false;
  }
  return true;
}