import sample from '../util/sample';

export default function(table, size, weight, options = {}) {
  return table.reify(
    sample(size, !!options.replace, table.indices(), weight)
  );
}