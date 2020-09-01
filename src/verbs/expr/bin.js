export default function(name, options = {}) {
  const field = `d[${JSON.stringify(name)}]`,
        { maxbins, nice, minstep, offset } = options,
        args = [maxbins, nice, minstep];

  let n = args.length;
  while (n && args[--n] == null) args.pop();
  const bins = `op.bins(${field}${args.length ? ', ' + args.join(', ') : ''})`;
  return `d => op.bin(${field}, ...${bins}, ${offset || 0})`;
}