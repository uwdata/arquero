/**
 * Generate a table expression that computes the number of rows
 * corresponding to a given fraction for each group. The resulting
 * string can be used as part of the input to the sample verb.
 * @param {number} fraction The fractional value.
 * @return {string} A table expression string for computing row counts.
 * @example frac(0.5)
 */
export default function(fraction) {
  return `() => op.round(${+fraction} * op.count())`;
}