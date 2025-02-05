/**
 * Abstract class for custom aggregation operations.
 */
export class Reducer {
  constructor(outputs) {
    this._outputs = outputs;
  }

  size() {
    return this._outputs.length;
  }

  outputs() {
    return this._outputs;
  }

  // eslint-disable-next-line no-unused-vars
  init(columns) {
    return {};
  }

  // eslint-disable-next-line no-unused-vars
  add(state, row, data) {
    // no-op, subclasses should override
  }

  // eslint-disable-next-line no-unused-vars
  rem(state, row, data) {
    // no-op, subclasses should override
  }

  // eslint-disable-next-line no-unused-vars
  write(state, values, index) {
  }
}
