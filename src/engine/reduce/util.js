import fieldReducer from './field-reducer';
import repeat from '../../util/repeat';

export function aggregateGet(table, ops, get) {
  if (ops.length) {
    const data = table.data();
    const { keys } = table.groups() || {};
    const result = aggregate(table, ops);
    const op = keys
      ? (name, row) => result[name][keys[row]]
      : name => result[name][0];
    get = get.map(f => row => f(row, data, op));
  }

  return get;
}

export function aggregate(table, ops, result) {
  if (!ops.length) return result; // early exit

  // instantiate aggregators and result store
  const aggrs = reducers(ops);
  const groups = table.groups();
  const size = groups ? groups.size : 1;
  result = result || repeat(ops.length, () => Array(size));

  // compute aggregates, extract results
  if (size > 1) {
    aggrs.forEach(aggr => {
      const cells = reduceGroups(table, aggr, groups);
      for (let i = 0; i < size; ++i) {
        aggr.write(cells[i], result, i);
      }
    });
  } else {
    aggrs.forEach(aggr => {
      const cell = reduceFlat(table, aggr);
      aggr.write(cell, result, 0);
    });
  }

  return result;
}

export function reducers(ops, stream) {
  const aggrs = [];
  const fields = {};

  // group operators by field inputs
  for (const op of ops) {
    const key = op.fields.map(f => f + '').join(',');
    (fields[key] || (fields[key] = [])).push(op);
  }

  // generate a field reducer for each field
  for (const key in fields) {
    aggrs.push(fieldReducer(fields[key], stream));
  }

  return aggrs;
}

export function reduceFlat(table, reducer) {
  // initialize aggregation cell
  const cell = reducer.init();

  // compute aggregate values
  // inline the following for performance:
  // table.scan((row, data) => reducer.add(cell, row, data));
  const n = table.totalRows();
  const data = table.data();
  const bits = table.mask();

  if (table.isOrdered()) {
    const idx = table.indices();
    for (let i = 0; i < n; ++i) {
      reducer.add(cell, idx[i], data);
    }
  } else if (bits) {
    for (let i = bits.next(0); i >= 0; i = bits.next(i + 1)) {
      reducer.add(cell, i, data);
    }
  } else {
    for (let i = 0; i < n; ++i) {
      reducer.add(cell, i, data);
    }
  }

  return cell;
}

export function reduceGroups(table, reducer, groups) {
  const { keys, size } = groups;

  // initialize aggregation cells
  const cells = repeat(size, () => reducer.init());

  // compute aggregate values
  // inline the following for performance:
  // table.scan((row, data) => reducer.add(cells[keys[row]], row, data));
  const data = table.data();

  if (table.isOrdered()) {
    const idx = table.indices();
    const m = idx.length;
    for (let i = 0; i < m; ++i) {
      const row = idx[i];
      reducer.add(cells[keys[row]], row, data);
    }
  } else if (table.isFiltered()) {
    const bits = table.mask();
    for (let i = bits.next(0); i >= 0; i = bits.next(i + 1)) {
      reducer.add(cells[keys[i]], i, data);
    }
  } else {
    const n = table.totalRows();
    for (let i = 0; i < n; ++i) {
      reducer.add(cells[keys[i]], i, data);
    }
  }

  return cells;
}

export function groupOutput(cols, groups) {
  const { get, names, rows, size } = groups;

  // write group values to output columns
  const m = names.length;
  for (let j = 0; j < m; ++j) {
    const col = cols.add(names[j], Array(size));
    const val = get[j];
    for (let i = 0; i < size; ++i) {
      col[i] = val(rows[i]);
    }
  }
}