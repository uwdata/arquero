import relocate from './relocate';
import _derive from '../engine/derive';
import parse from '../expression/parse';

export default function(table, values, options = {}) {
  const dt = _derive(table, parse(values, { table }));

  return options.before == null && options.after == null
    ? dt
    : relocate(dt,
        Object.keys(values).filter(name => table.columnIndex(name) >= 0),
        options
      );
}