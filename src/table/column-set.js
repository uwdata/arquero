import has from '../util/has.js';

export default function(table) {
  return table
    ? new ColumnSet({ ...table.data() }, table.columnNames())
    : new ColumnSet();
}

export class ColumnSet {
  constructor(data, names) {
    this.data = data || {};
    this.names = names || [];
  }

  add(name, values) {
    if (!this.has(name)) this.names.push(name + '');
    return this.data[name] = values;
  }

  has(name) {
    return has(this.data, name);
  }

  groupby(groups) {
    this.groups = groups;
    return this;
  }

  new() {
    const { data, names, groups = null } = this;
    return { data, names, groups, filter: null, order: null };
  }
}
