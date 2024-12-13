/**
 * Return a new column set instance.
 * @param {import('./Table.js').Table} [table] A base table whose columns
 *  should populate the returned set. If unspecified, create an empty set.
 * @return {ColumnSet} The column set.
 */
export function columnSet(table) {
  return table
    ? new ColumnSet({ ...table.data() }, table.columnNames())
    : new ColumnSet();
}

/** An editable collection of named columns. */
export class ColumnSet {
  /**
   * Create a new column set instance.
   * @param {import('./types.js').ColumnData} [data] Initial column data.
   * @param {string[]} [names] Initial column names.
   */
  constructor(data, names) {
    this.data = data || {};
    this.names = names || [];
  }

  /**
   * Add a new column to this set and return the column values.
   * @template {import('./types.js').ColumnType} T
   * @param {string} name The column name.
   * @param {T} values The column values.
   * @return {T} The provided column values.
   */
  add(name, values) {
    if (!this.has(name)) this.names.push(name + '');
    return this.data[name] = values;
  }

  /**
   * Test if this column set has a columns with the given name.
   * @param {string} name A column name
   * @return {boolean} True if this set contains a column with the given name,
   *  false otherwise.
   */
  has(name) {
    return Object.hasOwn(this.data, name);
  }

  /**
   * Add a groupby specification to this column set.
   * @param {import('./types.js').GroupBySpec} groups A groupby specification.
   * @return {this} This column set.
   */
  groupby(groups) {
    this.groups = groups;
    return this;
  }

  /**
   * Create a new table with the contents of this column set, using the same
   * type as a given prototype table. The new table does not inherit the
   * filter, groupby, or orderby state of the prototype.
   * @template {import('./Table.js').Table} T
   * @param {T} proto A prototype table
   * @return {T} The new table.
   */
  new(proto) {
    const { data, names, groups = null } = this;
    return proto.create({ data, names, groups, filter: null, order: null });
  }

  /**
   * Create a derived table with the contents of this column set, using the same
   * type as a given prototype table. The new table will inherit the filter,
   * groupby, and orderby state of the prototype.
   * @template {import('./Table.js').Table} T
   * @param {T} proto A prototype table
   * @return {T} The new table.
   */
  derive(proto) {
    return proto.create(this);
  }
}
