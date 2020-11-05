import toArray from '../util/to-array';

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
    const a = [
      ...this.fields.map(f => `d[${JSON.stringify(f)}]`),
      ...this.params.map(p => JSON.stringify(p))
    ];
    return `d => op.${this.name}(${a})`;
  }
  toObject() {
    return { expr: this.toString(), func: true };
  }
}