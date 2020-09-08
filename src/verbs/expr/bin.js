/**
 * Options for binning number values.
 * @typedef {Object} BinOptions
 * @property {number} [maxbins] The maximum number of bins.
 * @property {number} [minstep] The minimum step size between bins.
 * @property {boolean} [nice=true] Flag indicating if bins should
 *  snap to "nice" human-friendly values such as multiples of ten.
 * @property {number} [offset=0] Step offset for bin boundaries.
 *  The default floors to the lower bin boundary. A value of 1 snaps
 *  one step higher to the upper bin boundary, and so on.
 */

/**
 * Generate a table expression that performs uniform binning of
 * number values. The resulting string can be used as part of the
 * input to table transformation verbs.
 * @param {string} name The name of the column to bin.
 * @param {BinOptions} [options] Binning scheme options.
 * @return {string} A table expression string for binned values.
 * @example bin('colA', { maxbins: 20 })
 */
export default function(name, options = {}) {
  const field = `d[${JSON.stringify(name)}]`,
        { maxbins, nice, minstep, offset } = options,
        args = [maxbins, nice, minstep];

  let n = args.length;
  while (n && args[--n] == null) args.pop();
  const bins = `op.bins(${field}${args.length ? ', ' + args.join(', ') : ''})`;
  return `d => op.bin(${field}, ...${bins}, ${offset || 0})`;
}