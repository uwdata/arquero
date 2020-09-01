import fieldReducer from './field-reducer';
import repeat from '../../util/repeat';

export function aggregateGet(table, ops, get) {
  if (ops.length) {
    const result = aggregate(table, ops);
    const keys = table.isGrouped() ? table.groups().keys : null;
    const data = table.data();
    get = keys
      ? get.map(f => row => f(row, data, result[keys[row]]))
      : get.map(f => row => f(row, data, result));
  }

  return get;
}

export function aggregate(table, ops) {
  if (!ops.length) {
    return undefined;
  }

  // instantiate aggregators
  const aggrs = reducers(ops);

  if (table.isGrouped()) {
    const groups = table.groups();
    const { size } = groups;

    // instantiate aggregate result objects
    const result = repeat(size, () => ({}));

    // compute aggregates, extract results
    aggrs.forEach(aggr => {
      const cells = reduceGroups(table, aggr, groups);
      for (let i = 0; i < size; ++i) {
        aggr.writeToObject(cells[i], result[i]);
      }
    });

    return result;
  } else {
    // instantiate aggregate result object
    const result = {};

    // compute aggregates, extract results
    aggrs.forEach(aggr => {
      const cell = reduceFlat(table, aggr);
      aggr.writeToObject(cell, result);
    });

    return result;
  }
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
  table.scan((row, data) => reducer.add(cell, row, data));

  return cell;
}

export function reduceGroups(table, reducer, groups) {
  const { keys, size } = groups;

  // initialize aggregation cells
  const cells = repeat(size, () => reducer.init());

  // compute aggregate values
  table.scan((row, data) => reducer.add(cells[keys[row]], row, data));

  return cells;
}

export function groupInit(data, table) {
  const { names, size } = table.groups();

  // initialize group output columns
  names.forEach(name => data[name] = Array(size));

  // return empty row count array
  return new Uint32Array(size + 1);
}

export function groupOutput(output, table, counts) {
  const { get, names, rows, size } = table.groups();
  const data = table.data();

  // write group values to output columns
  names.forEach((name, index) => {
    const column = output[name];
    const getter = get[index];
    for (let i = 0, row = 0; i < size; ++i) {
      const value = getter(rows[i], data);
      const count = counts[i + 1];
      for (let j = 0; j < count; ++j) {
        column[row++] = value;
      }
    }
  });
}