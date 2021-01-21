/**
 * Generate a table expression that filters a table based on ordered row
 * indices from start to end (end not included), where start and end
 * represent per-group ordered row numbers in the table. The resulting
 * string can be used as the input to the filter verb.
 * @param {number} [start] Zero-based index at which to start extraction.
 *  A negative index indicates an offset from the end of the group.
 *  If start is undefined, slice starts from the index 0.
 * @param {number} [end] Zero-based index before which to end extraction.
 *  A negative index indicates an offset from the end of the group.
 *  If end is omitted, slice extracts through the end of the group.
 * @return {string} A table expression string for slicing values.
 * @example slice(1, -1)
 */
export default function(start = 0, end = Infinity) {
  return `${prep(start)} < row_number() && row_number() <= ${prep(end)}`;
}

function prep(index) {
  return index < 0 ? `count() + ${index}` : index;
}