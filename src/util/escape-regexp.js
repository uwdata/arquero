export function escapeRegExp(str) {
  return str.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}
