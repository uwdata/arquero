import relocate from './relocate.js';
import _derive from '../engine/derive.js';
import parse from '../expression/parse.js';

export default function(table, values, options = {}) {
  const dt = _derive(table, parse(values, { table }), options);

  return options.drop || (options.before == null && options.after == null)
    ? dt
    : relocate(dt,
        Object.keys(values).filter(name => !table.column(name)),
        options
      );
}
