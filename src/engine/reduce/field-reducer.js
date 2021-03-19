import Reducer from './reducer';
import { getAggregate } from '../../op';
import concat from '../../util/concat';
import error from '../../util/error';
import isValid from '../../util/is-valid';
import unroll from '../../util/unroll';
import ValueList from '../../util/value-list';

const update = (ops, args, fn) => unroll(
  args,
  '{' + concat(ops, (_, i) => `_${i}.${fn}(${args});`) + '}',
  ops
);

export default function(oplist, stream) {
  const { ops, output } = expand(oplist, stream);
  const fields = oplist[0].fields;
  const n = fields.length;
  const cls = n === 0 ? FieldReducer
    : n === 1 ? Field1Reducer
    : n === 2 ? Field2Reducer
    : error('Unsupported field count: ' + n);
  return new cls(fields, ops, output, stream);
}

function expand(oplist, stream) {
  const has = {};
  const ops = [];

  function add(name, params = []) {
    // check key
    const key = name + ':' + params;
    if (has[key]) return has[key];

    // get op instance
    const def = getAggregate(name);
    const op = def.create(...params);

    // add required dependencies
    if (stream < 0 && def.stream) {
      def.stream.forEach(name => add(name, []));
    }
    if (def.req) {
      def.req.forEach(name => add(name, []));
    }

    // update state
    has[key] = op;
    ops.push(op);

    return op;
  }

  const output = oplist.map(item => {
    const op = add(item.name, item.params);
    op.output = item.id;
    return op;
  });

  return { ops, output };
}

class FieldReducer extends Reducer {
  constructor(fields, ops, outputs, stream) {
    super(outputs);
    this._op = ops;
    this._fields = fields;
    this._stream = !!stream;
  }

  init() {
    const state = { count: 0, valid: 0, stream: this._stream };
    this._op.forEach(op => op.init(state));

    // value list requested
    if (state.values) {
      state.list = new ValueList();
    }

    return state;
  }

  write(state, values, index) {
    const op = this._outputs;
    const n = op.length;
    for (let i = 0; i < n; ++i) {
      values[op[i].output][index] = op[i].value(state);
    }
    return 1;
  }

  _add() {
  }

  _rem() {
  }

  add(state) {
    ++state.count;
  }

  rem(state) {
    --state.count;
  }
}

class Field1Reducer extends FieldReducer {
  constructor(fields, ops, outputs, stream) {
    super(fields, ops, outputs, stream);

    // unroll op invocations for performance
    const args = ['state', 'v1', 'v2'];
    this._add = update(ops, args, 'add');
    this._rem = update(ops, args, 'rem');
  }

  add(state, row, data) {
    const value = this._fields[0](row, data);
    ++state.count;
    if (isValid(value)) {
      ++state.valid;
      if (state.list) state.list.add(value);
      this._add(state, value);
    }
  }

  rem(state, row, data) {
    const value = this._fields[0](row, data);
    --state.count;
    if (isValid(value)) {
      --state.valid;
      if (state.list) state.list.rem();
      this._rem(state, value);
    }
  }
}

class Field2Reducer extends FieldReducer {
  constructor(fields, ops, outputs, stream) {
    super(fields, ops, outputs, stream);

    // unroll op invocations for performance
    const args = ['state', 'v1', 'v2'];
    this._add = update(ops, args, 'add');
    this._rem = update(ops, args, 'rem');
  }

  add(state, row, data) {
    const value1 = this._fields[0](row, data);
    const value2 = this._fields[1](row, data);
    ++state.count;
    if (isValid(value1) && isValid(value2)) {
      ++state.valid;
      if (state.list) state.list.add([value1, value2]);
      this._add(state, value1, value2);
    }
  }

  rem(state, row, data) {
    const value1 = this._fields[0](row, data);
    const value2 = this._fields[1](row, data);
    --state.count;
    if (isValid(value1) && isValid(value2)) {
      --state.valid;
      if (state.list) state.list.rem();
      this._rem(state, value1, value2);
    }
  }
}