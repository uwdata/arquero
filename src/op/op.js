import toArray from '../util/to-array';
import toString from '../util/to-string';

export default function(name, fields = [], params = []) {
  return new Op(name, toArray(fields), toArray(params));
}

export class Op {
  constructor(name, fields, params) {
    this.name = name;
    this.fields = fields;
    this.params = params;
  }
  toString() {
    const args = [
      ...this.fields.map(f => `d[${toString(f)}]`),
      ...this.params.map(toString)
    ];
    return `d => op.${this.name}(${args})`;
  }
  toObject() {
    return { expr: this.toString(), func: true };
  }
}