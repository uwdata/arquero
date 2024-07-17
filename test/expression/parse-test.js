import assert from 'node:assert';
import { op, parse, rolling } from '../../src/index.js';

// pass code through for testing
const compiler = { param: x => x, expr: x => x };

function test(input) {
  const { ops, names, exprs } = parse(input, { compiler });

  assert.deepEqual(ops, [
    { name: 'mean', fields: ['data.a.at(row)'], params: [], id: 0 },
    { name: 'corr', fields: ['data.a.at(row)', 'data.b.at(row)'], params: [], id: 1},
    { name: 'quantile', fields: ['(-data.bar.at(row))'], params: ['(0.5 / 2)'], id: 2},
    { name: 'lag', fields: ['data.value.at(row)'], params: [2], id: 3 },
    { name: 'mean', fields: ['data.value.at(row)'], params: [], frame: [-3, 3], peers: false, id: 4 },
    { name: 'count', fields: [], params: [], frame: [-3, 3], peers: true, id: 5 }
  ], 'parsed operators');

  assert.deepEqual(names, [
    'constant',
    'column',
    'agg1',
    'agg2',
    'agg3',
    'win1',
    'win2',
    'win3'
  ], 'parsed output names');

  assert.deepEqual(exprs, [
    '(1 + 1)',
    '(data.a.at(row) * data.b.at(row))',
    'op(0,row)',
    'op(1,row)',
    '(1 + op(2,row))',
    '(data.value.at(row) - op(3,row))',
    'op(4,row)',
    'op(5,row)'
  ], 'parsed output expressions');
}

describe('parse', () => {
  it('parses expressions with global operator names', () => {
    /* eslint-disable no-undef */
    test({
      constant: () => 1 + 1,
      column: d => d.a * d.b,
      agg1: d => mean(d.a),
      agg2: d => corr(d.a, d.b),
      agg3: d => 1 + quantile(-d.bar, 0.5/2),
      win1: d => d.value - lag(d.value, 2),
      win2: rolling(d => mean(d.value), [-3, 3]),
      win3: rolling(() => count(), [-3, 3], true)
    });
    /* eslint-enable */
  });

  it('parses expressions with operator object', () => {
    test({
      constant: () => 1 + 1,
      column: d => d.a * d.b,
      agg1: d => op.mean(d.a),
      agg2: d => op.corr(d.a, d.b),
      agg3: d => 1 + op.quantile(-d.bar, 0.5/2),
      win1: d => d.value - op.lag(d.value, 2),
      win2: rolling(d => op.mean(d.value), [-3, 3]),
      win3: rolling(() => op.count(), [-3, 3], true)
    });
  });

  it('parses expressions with nested operator object', () => {
    const aq = { op };
    test({
      constant: () => 1 + 1,
      column: d => d.a * d.b,
      agg1: d => aq.op.mean(d.a),
      agg2: d => aq.op.corr(d.a, d.b),
      agg3: d => 1 + aq.op.quantile(-d.bar, 0.5/2),
      win1: d => d.value - aq.op.lag(d.value, 2),
      win2: rolling(d => aq.op.mean(d.value), [-3, 3]),
      win3: rolling(() => aq.op.count(), [-3, 3], true)
    });
  });

  it('parses expressions with Math object', () => {
    assert.equal(
      parse({ f: d => Math.sqrt(d.x) }).exprs[0] + '',
      '(row,data,op)=>fn.sqrt(data.x.at(row))',
      'parse Math.sqrt'
    );

    assert.equal(
      parse({ f: d => Math.max(d.x) }).exprs[0] + '',
      '(row,data,op)=>fn.greatest(data.x.at(row))',
      'parse Math.max, rewrite as greatest'
    );

    assert.equal(
      parse({ f: d => Math.min(d.x) }).exprs[0] + '',
      '(row,data,op)=>fn.least(data.x.at(row))',
      'parse Math.min, rewrite as least'
    );
  });

  it('parses expressions with constant values', () => {
    function constant(string, result) {
      const { exprs } = parse({ f: `d => ${string}` });
      assert.equal(
        exprs[0] + '',
        `(row,data,op)=>${result}`,
        `parsed ${string} constant`
      );
    }

    constant('undefined', 'void(0)');
    constant('Infinity', 'Number.POSITIVE_INFINITY');
    constant('NaN', 'Number.NaN');
    constant('E', 'Math.E');
    constant('LN2', 'Math.LN2');
    constant('LN10', 'Math.LN10');
    constant('LOG2E', 'Math.LOG2E');
    constant('LOG10E', 'Math.LOG10E');
    constant('PI', 'Math.PI');
    constant('SQRT1_2', 'Math.SQRT1_2');
    constant('SQRT2', 'Math.SQRT2');

    constant('Math.E', 'Math.E');
    constant('Math.LN2', 'Math.LN2');
    constant('Math.LN10', 'Math.LN10');
    constant('Math.LOG2E', 'Math.LOG2E');
    constant('Math.LOG10E', 'Math.LOG10E');
    constant('Math.PI', 'Math.PI');
    constant('Math.SQRT1_2', 'Math.SQRT1_2');
    constant('Math.SQRT2', 'Math.SQRT2');

    assert.throws(() => constant('Object'), 'throws on constant Object');
    assert.throws(() => constant('Object.keys'), 'throws on constant Object.keys');
    assert.throws(() => constant('Number.NaN'), 'throws on constant Number.NaN');
  });

  it('parses expressions with literal values', () => {
    function literal(string, result) {
      const { exprs } = parse({ f: `d => ${string}` });
      assert.equal(
        exprs[0] + '',
        `(row,data,op)=>${result}`,
        `parsed ${string} literal`
      );
    }

    literal('1', '1');
    literal('1e-5', '1e-5');
    literal('true', 'true');
    literal('false', 'false');
    literal('"foo"', '"foo"');
    literal('[1,2,3]', '[1,2,3]');
    literal('({a:1})', '({a:1})');
    literal('({"b":2})', '({"b":2})');
  });

  it('parses column references with nested properties', () => {
    assert.equal(
      parse({ f: d => d.x.y }).exprs[0] + '',
      '(row,data,op)=>data.x.at(row).y',
      'parsed nested members'
    );

    assert.equal(
      parse({ f: d => d['x'].y }).exprs[0] + '',
      '(row,data,op)=>data["x"].at(row).y',
      'parsed nested members'
    );

    assert.equal(
      parse({ f: d => d['x']['y'] }).exprs[0] + '',
      '(row,data,op)=>data["x"].at(row)[\'y\']',
      'parsed nested members'
    );
  });

  it('parses indirect column names', () => {
    // direct expression
    assert.equal(
      parse({ f: d => d['x' + 'y'] }).exprs[0] + '',
      '(row,data,op)=>data["xy"].at(row)',
      'parsed indirect member as expression'
    );

    // parameter reference
    const opt = {
      table: {
        params: () => ({ col: 'a' }),
        column: (name) => name == 'a' ? {} : null
      }
    };
    assert.equal(
      parse({ f: (d, $) => d[$.col] }, opt).exprs[0] + '',
      '(row,data,op)=>data["a"].at(row)',
      'parsed indirect member as param'
    );

    // variable reference
    assert.throws(
      () => parse({
        f: d => {
          const col = 'a';
          return d[col];
        }
      }),
      'throws on indirect variable'
    );

    // variable reference
    assert.throws(
      () => parse({ f: d => d[d.foo] }),
      'throws on nested column reference'
    );
  });

  it('throws on invalid column names', () => {
    const opt = { table: { params: () => ({}), data: () => ({}) } };
    assert.throws(() => parse({ f: d => d.foo }, opt));
    assert.throws(() => parse({ f: ({ foo }) => foo }, opt));
  });

  it('parses expressions with op parameter expressions', () => {
    const exprs = parse({
      op: d => op.quantile(d.a, op.abs(op.sqrt(0.25)))
    });
    assert.equal(
      exprs.ops[0].params[0], 0.5, 'calculated op param'
    );
  });

  it('throws on invalid op parameter expressions', () => {
    assert.throws(() => parse({ op: d => op.quantile(d.a, d.b) }));
    assert.throws(() => parse({ op: d => op.sum(op.mean(d.a)) }));
    assert.throws(() => parse({ op: d => op.sum(op.lag(d.a)) }));
    assert.throws(() => parse({ op: d => op.lag(op.sum(d.a)) }));
    assert.throws(() => parse({
      op: d => {
        const value = 0.5;
        return op.quantile(d.a, value);
      }
    }));
    assert.throws(() => parse({
      op: d => {
        const value = 0.5;
        return op.quantile(d.a + value, 0.5);
      }
    }));
  });

  it('parses computed object properties', () => {
    const { exprs } = parse({ f: d => ({ [d.x]: d.y }) });
    assert.equal(
      exprs[0] + '',
      '(row,data,op)=>({[data.x.at(row)]:data.y.at(row)})',
      'parsed computed object property'
    );
  });

  it('parses template literals', () => {
    const { exprs } = parse({ f: d => `${d.x} + ${d.y}` });
    assert.equal(
      exprs[0] + '',
      '(row,data,op)=>`${data.x.at(row)} + ${data.y.at(row)}`',
      'parsed template literal'
    );
  });

  it('parses expressions with block statements', () => {
    const exprs = {
      val: d => { const s = op.sum(d.a); return s * s; }
    };

    assert.deepEqual(
      parse(exprs, { compiler }),
      {
        names: [ 'val' ],
        exprs: [ '{const s=op(0,row);return (s * s);}' ],
        ops: [
          { name: 'sum', fields: [ 'data.a.at(row)' ], params: [], id: 0 }
        ]
      },
      'parsed block'
    );

    assert.equal(
      parse(exprs).exprs[0] + '',
      '(row,data,op)=>{const s=op(0,row);return (s * s);}',
      'compiled block'
    );
  });

  it('parses expressions with if statements', () => {
    const exprs = {
      val1: () => {
        const d = 3 - 2;
        if (d < 1) { return 1; } else { return 0; }
      },
      val2: () => {
        const d = 3 - 2;
        if (d < 1) { return 1; }
        return 0;
      }
    };

    assert.deepEqual(
      parse(exprs, { compiler }),
      {
        names: ['val1', 'val2'],
        exprs: [
          '{const d=(3 - 2);if ((d < 1)){return 1;} else {return 0;};}',
          '{const d=(3 - 2);if ((d < 1)){return 1;};return 0;}'
        ],
        ops: []
      },
      'parsed if'
    );
  });

  it('parses expressions with switch statements', () => {
    const exprs = {
      val: () => {
        const v = 'foo';
        switch (v) {
          case 'foo': return 1;
          case 'bar': return 2;
          default: return 3;
        }
      }
    };

    assert.equal(
      parse(exprs, { compiler }).exprs[0],
      '{const v=\'foo\';switch (v) {case \'foo\': return 1;case \'bar\': return 2;default: return 3;};}',
      'parsed switch'
    );
  });

  it('parses expressions with destructuring assignments', () => {
    const exprs = {
      arr: () => {
        const [start, stop, step] = op.bins('value');
        return op.bin('value', start, stop, step);
      },
      obj: () => {
        const { start, stop, step } = op.bins('value');
        return op.bin('value', start, stop, step);
      },
      nest: () => {
        const { start: [{ baz: bop }], stop, step } = op.bins('value');
        return op.bin('value', bop, stop, step);
      }
    };

    assert.deepEqual(
      parse(exprs, { compiler }),
      {
        names: ['arr', 'obj', 'nest'],
        exprs: [
          '{const [start,stop,step]=op(0,row);return fn.bin(\'value\',start,stop,step);}',
          '{const {start:start,stop:stop,step:step}=op(0,row);return fn.bin(\'value\',start,stop,step);}',
          '{const {start:[{baz:bop}],stop:stop,step:step}=op(0,row);return fn.bin(\'value\',bop,stop,step);}'
        ],
        ops: [
          { name: 'bins', fields: [ '\'value\'' ], params: [], id: 0 }
        ]
      },
      'parsed destructuring assignmeents'
    );
  });

  it('throws on expressions with for loops', () => {
    const exprs = {
      val: () => {
        let v = 0;
        for (let i = 0; i < 5; ++i) {
          v += i;
        }
        return v;
      }
    };
    assert.throws(() => parse(exprs), 'no for loops');
  });

  it('throws on expressions with while loops', () => {
    const exprs = {
      val: () => {
        let v = 0;
        let i = 0;
        while (i < 5) {
          v += i++;
        }
        return v;
      }
    };
    assert.throws(() => parse(exprs), 'no while loops');
  });

  it('throws on expressions with do-while loops', () => {
    const exprs = {
      val: () => {
        let v = 0;
        let i = 0;
        do {
          v += i;
        } while (++i < 5);
        return v;
      }
    };
    assert.throws(() => parse(exprs), 'no do-while loops');
  });

  it('throws on expressions with comma sequences', () => {
    const exprs = { val: () => (1, 2) };
    assert.throws(() => parse(exprs), 'no comma sequences');
  });

  it('throws on dirty tricks', () => {
    assert.throws(() => parse({ f: () => globalThis }), 'no globalThis access');
    assert.throws(() => parse({ f: () => global }), 'no global access');
    assert.throws(() => parse({ f: () => window }), 'no window access');
    assert.throws(() => parse({ f: () => self }), 'no self access');
    assert.throws(() => parse({ f: () => this }), 'no this access');
    assert.throws(() => parse({ f: () => Object }), 'no Object access');
    assert.throws(() => parse({ f: () => Date }), 'no Date access');
    assert.throws(() => parse({ f: () => Array }), 'no Array access');
    assert.throws(() => parse({ f: () => Number }), 'no Number access');
    assert.throws(() => parse({ f: () => Math }), 'no Math access');
    assert.throws(() => parse({ f: () => String }), 'no String access');
    assert.throws(() => parse({ f: () => RegExp }), 'no RegExp access');

    assert.throws(() => parse({
      f: () => { const foo = [].constructor; return new foo(3); }
    }), 'no instantiation');

    assert.throws(() => parse({
      f: () => [].constructor()
    }), 'no property invocation');

    assert.throws(() => parse({
      f: () => [].__proto__.unsafe = 1
    }), 'no __proto__ assignment');

    assert.throws(() => parse({
      f: () => 'abc'.toUpperCase()
    }), 'no literal method calls');

    assert.throws(() => parse({
      f: () => { const s = 'abc'; return s.toUpperCase(); }
    }), 'no identifier method calls');

    assert.throws(() => parse({
      f: () => ('abc')['toUpperCase']()
    }), 'no indirect method calls');

    assert.throws(() => parse({
      f: 'd => op.mean(var foo = d.x)'
    }), 'no funny business');
  });

  it('supports ast output option', () => {
    const ast = parse({
      constant: () => 1 + Math.E,
      column: d => d.a * d.b,
      agg1: d => op.mean(d.a),
      agg2: d => op.corr(d.a, d.b),
      agg3: d => 1 + op.quantile(-d.bar, 0.5/2),
      win1: d => d.value - op.lag(d.value, 2),
      win2: rolling(d => op.mean(d.value), [-3, 3]),
      win3: rolling(() => op.count(), [-3, 3], true)
    }, { ast: true });

    assert.deepEqual(
      JSON.parse(JSON.stringify(ast.exprs)),
      [
        {
          'type': 'BinaryExpression',
          'left': {
            'type': 'Literal',
            'value': 1,
            'raw': '1'
          },
          'operator': '+',
          'right': {
            'type': 'Constant',
            'name': 'E',
            'raw': 'Math.E'
          }
        },
        {
          'type': 'BinaryExpression',
          'left': {
            'type': 'Column',
            'name': 'a'
          },
          'operator': '*',
          'right': {
            'type': 'Column',
            'name': 'b'
          }
        },
        {
          'type': 'CallExpression',
          'callee': {
            'type': 'Function',
            'name': 'mean'
          },
          'arguments': [
            {
              'type': 'Column',
              'name': 'a'
            }
          ]
        },
        {
          'type': 'CallExpression',
          'callee': {
            'type': 'Function',
            'name': 'corr'
          },
          'arguments': [
            {
              'type': 'Column',
              'name': 'a'
            },
            {
              'type': 'Column',
              'name': 'b'
            }
          ]
        },
        {
          'type': 'BinaryExpression',
          'left': {
            'type': 'Literal',
            'value': 1,
            'raw': '1'
          },
          'operator': '+',
          'right': {
            'type': 'CallExpression',
            'callee': {
              'type': 'Function',
              'name': 'quantile'
            },
            'arguments': [
              {
                'type': 'UnaryExpression',
                'operator': '-',
                'prefix': true,
                'argument': {
                  'type': 'Column',
                  'name': 'bar'
                }
              },
              {
                'type': 'BinaryExpression',
                'left': {
                  'type': 'Literal',
                  'value': 0.5,
                  'raw': '0.5'
                },
                'operator': '/',
                'right': {
                  'type': 'Literal',
                  'value': 2,
                  'raw': '2'
                }
              }
            ]
          }
        },
        {
          'type': 'BinaryExpression',
          'left': {
            'type': 'Column',
            'name': 'value'
          },
          'operator': '-',
          'right': {
            'type': 'CallExpression',
            'callee': {
              'type': 'Function',
              'name': 'lag'
            },
            'arguments': [
              {
                'type': 'Column',
                'name': 'value'
              },
              {
                'type': 'Literal',
                'value': 2,
                'raw': '2'
              }
            ]
          }
        },
        {
          'type': 'CallExpression',
          'callee': {
            'type': 'Function',
            'name': 'mean'
          },
          'arguments': [
            {
              'type': 'Column',
              'name': 'value'
            }
          ]
        },
        {
          'type': 'CallExpression',
          'callee': {
            'type': 'Function',
            'name': 'count'
          },
          'arguments': []
        }
      ]
    );
  });

  it('optimizes dictionary references', () => {
    const cols = { v: { keyFor() { return 1; } } };
    const dt = { column: name => cols[name] };

    const optimized = {
      l_eq2: d => d.v == 'a',
      r_eq2: d => 'a' == d.v,
      l_eq3: d => d.v === 'a',
      r_eq3: d => 'a' === d.v,
      l_ne2: d => d.v != 'a',
      r_ne2: d => 'a' != d.v,
      l_ne3: d => d.v !== 'a',
      r_ne3: d => 'a' !== d.v,
      l_eqo: d => op.equal(d.v, 'a'),
      r_eqo: d => op.equal('a', d.v),
      destr: ({ v }) => v === 'a'
    };

    assert.deepEqual(
      parse(optimized, { compiler, table: dt }),
      {
        names: [
          'l_eq2', 'r_eq2',
          'l_eq3', 'r_eq3',
          'l_ne2', 'r_ne2',
          'l_ne3', 'r_ne3',
          'l_eqo', 'r_eqo',
          'destr'
        ],
        exprs: [
          '(data.v.key(row) == 1)',
          '(1 == data.v.key(row))',
          '(data.v.key(row) === 1)',
          '(1 === data.v.key(row))',
          '(data.v.key(row) != 1)',
          '(1 != data.v.key(row))',
          '(data.v.key(row) !== 1)',
          '(1 !== data.v.key(row))',
          'fn.equal(data.v.key(row),1)',
          'fn.equal(1,data.v.key(row))',
          '(data.v.key(row) === 1)'
        ],
        ops: []
      },
      'optimized references'
    );

    const unoptimized = {
      ref: d => d.v,
      nest: d => d.v.x === 'a',
      destr: ({ v }) => v.x === 'a',
      l_lte: d => d.v <= 'a',
      r_lte: d => 'a' <= d.v
    };

    assert.deepEqual(
      parse(unoptimized, { compiler, table: dt }),
      {
        names: [ 'ref', 'nest', 'destr', 'l_lte', 'r_lte' ],
        exprs: [
          'data.v.at(row)',
          "(data.v.at(row).x === 'a')",
          "(data.v.at(row).x === 'a')",
          "(data.v.at(row) <= 'a')",
          "('a' <= data.v.at(row))"
        ],
        ops: []
      },
      'unoptimized references'
    );
  });
});
