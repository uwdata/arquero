import ascending from './ascending';
import min from './min';
import max from './max';
import quantile from './quantile';

export default class ValueList {
  constructor(values) {
    this._values = values || [];
    this._sorted = null;
    this._start = 0;
  }

  values(copy) {
    if (this._start) {
      this._values = this._values.slice(this._start);
      this._start = 0;
    }
    return copy
      ? this._values.slice()
      : this._values;
  }

  add(value) {
    this._values.push(value);
    this._sorted = null;
  }

  rem() {
    this._start += 1;
    this._sorted = null;
  }

  min() {
    return this._sorted && this._sorted.length
      ? this._sorted[0]
      : min(this._values, this._start);
  }

  max() {
    return this._sorted && this._sorted.length
      ? this._sorted[this._sorted.length - 1]
      : max(this._values, this._start);
  }

  quantile(p) {
    if (!this._sorted) {
      this._sorted = this.values(true);
      this._sorted.sort(ascending);
    }
    return quantile(this._sorted, p);
  }
}