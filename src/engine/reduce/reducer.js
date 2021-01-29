/**
 * Abstract class for custom aggregation operations.
 */
export default class Reducer {
  constructor(outputs) {
    this._outputs = outputs;
  }

  size() {
    return this._outputs.length;
  }

  outputs() {
    return this._outputs;
  }

  init(/* columns */) {
    return {};
  }

  add(/* state, row, data */) {
    // no-op, subclasses should override
  }

  rem(/* state, row, data */) {
    // no-op, subclasses should override
  }

  write(/* state, values, index */) {
  }
}