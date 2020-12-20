import has from '../util/has';

export default function(table) {
  return table
    ? new ColumnSet({ ...table.data() }, table.columnNames())
    : new ColumnSet();
}

class ColumnSet {
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

  new() {
    this.filter = null;
    this.groups = this.groups || null;
    this.order = null;
    return this;
  }

  groupby(groups) {
    this.groups = groups;
    return this;
  }
}