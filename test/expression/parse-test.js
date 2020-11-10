import tape from 'tape';
import parse from '../../src/expression/parse';
import { op, rolling } from '../../src/verbs';

// pass code through for testing
const compiler = { param: x => x, expr: x => x };

function test(t, exprs) {
  const { ops, values} = parse(exprs, { compiler });

  t.deepEqual(ops, [
    { name: 'mean', fields: ['data.a.get(row)'], params: [], id: 0 },
    { name: 'corr', fields: ['data.a.get(row)', 'data.b.get(row)'], params: [], id: 1},
    { name: 'quantile', fields: ['(-data.bar.get(row))'], params: ['(0.5/2)'], id: 2},
    { name: 'lag', fields: ['data.value.get(row)'], params: [2], id: 3 },
    { name: 'mean', fields: ['data.value.get(row)'], params: [], frame: [-3, 3], peers: false, id: 4 },
    { name: 'count', fields: [], params: [], frame: [-3, 3], peers: true, id: 5 }
  ], 'parsed operators');

  t.deepEqual(values, {
    constant: '(1+1)',
    column: '(data.a.get(row)*data.b.get(row))',
    agg1: 'op[0]',
    agg2: 'op[1]',
    agg3: '(1+op[2])',
    win1: '(data.value.get(row)-op[3])',
    win2: 'op[4]',
    win3: 'op[5]'
  }, 'parsed output values');
}

tape('parse parses expressions with global operator names', t => {
  /* eslint-disable no-undef */
  test(t, {
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

  t.end();
});

tape('parse parses expressions with operator object', t => {
  test(t, {
    constant: () => 1 + 1,
    column: d => d.a * d.b,
    agg1: d => op.mean(d.a),
    agg2: d => op.corr(d.a, d.b),
    agg3: d => 1 + op.quantile(-d.bar, 0.5/2),
    win1: d => d.value - op.lag(d.value, 2),
    win2: rolling(d => op.mean(d.value), [-3, 3]),
    win3: rolling(() => op.count(), [-3, 3], true)
  });

  t.end();
});

tape('parse parses expressions with nested operator object', t => {
  const aq = { op };

  test(t, {
    constant: () => 1 + 1,
    column: d => d.a * d.b,
    agg1: d => aq.op.mean(d.a),
    agg2: d => aq.op.corr(d.a, d.b),
    agg3: d => 1 + aq.op.quantile(-d.bar, 0.5/2),
    win1: d => d.value - aq.op.lag(d.value, 2),
    win2: rolling(d => aq.op.mean(d.value), [-3, 3]),
    win3: rolling(() => aq.op.count(), [-3, 3], true)
  });

  t.end();
});

tape('parse parses expressions with constant values', t => {
  function constant(string, result) {
    const exprs = parse({ f: `d => ${string}` });
    t.equal(
      exprs.values.f + '',
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

  t.throws(() => constant('Object'), 'throws on constant Object');
  t.throws(() => constant('Object.keys'), 'throws on constant Object.keys');
  t.throws(() => constant('Number.NaN'), 'throws on constant Number.NaN');

  t.end();
});

tape('parse parses expressions with literal values', t => {
  function literal(string, result) {
    const exprs = parse({ f: `d => ${string}` });
    t.equal(
      exprs.values.f + '',
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
  t.end();
});

tape('parse parses column references with nested properties', t => {
  t.equal(
    parse({ f: d => d.x.y }).values.f + '',
    '(row,data,op)=>data.x.get(row).y',
    'parsed nested members'
  );

  t.equal(
    parse({ f: d => d['x'].y }).values.f + '',
    '(row,data,op)=>data["x"].get(row).y',
    'parsed nested members'
  );

  t.equal(
    parse({ f: d => d['x']['y'] }).values.f + '',
    '(row,data,op)=>data["x"].get(row)[\'y\']',
    'parsed nested members'
  );

  t.end();
});

tape('parse throws on invalid column names', t => {
  const opt = { table: { params: () => ({}), data: () => ({}) } };
  t.throws(() => parse({ f: d => d.foo }, opt));
  t.throws(() => parse({ f: ({ foo }) => foo }, opt));
  t.end();
});

tape('parse parses expressions with op parameter expressions', t => {
  const exprs = parse({
    op: d => op.quantile(d.a, op.abs(op.sqrt(0.25)))
  });
  t.equal(
    exprs.ops[0].params[0], 0.5, 'calculated op param'
  );
  t.end();
});

tape('parse throws on invalid op parameter expressions', t => {
  t.throws(() => parse({ op: d => op.quantile(d.a, d.b) }));
  t.throws(() => parse({ op: d => op.sum(op.mean(d.a)) }));
  t.throws(() => parse({ op: d => op.sum(op.lag(d.a)) }));
  t.throws(() => parse({ op: d => op.lag(op.sum(d.a)) }));
  t.throws(() => parse({
    op: d => {
      const value = 0.5;
      return op.quantile(d.a, value);
    }
  }));
  t.throws(() => parse({
    op: d => {
      const value = 0.5;
      return op.quantile(d.a + value, 0.5);
    }
  }));
  t.end();
});

tape('parse parses template literals', t => {
  const exprs = parse({ f: d => `${d.x} + ${d.y}` });
  t.equal(
    exprs.values.f + '',
    '(row,data,op)=>`${data.x.get(row)} + ${data.y.get(row)}`',
    'parsed template literal'
  );
  t.end();
});

tape('parse parses expressions with block statements', t => {
  const exprs = {
    val: d => { const s = op.sum(d.a); return s * s; }
  };

  t.deepEqual(
    parse(exprs, { compiler }),
    {
      ops: [
        { name: 'sum', fields: [ 'data.a.get(row)' ], params: [], id: 0 }
      ],
      values: {
        val: '{const s=op[0];return (s*s);}'
      }
    },
    'parsed block'
  );

  t.equal(
    parse(exprs).values.val + '',
    '(row,data,op)=>{const s=op[0];return (s*s);}',
    'compiled block'
  );

  t.end();
});

tape('parse parses expressions with if statements', t => {
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

  t.deepEqual(
    parse(exprs, { compiler }).values,
    {
      val1: '{const d=(3-2);if ((d<1)){return 1;} else {return 0;};}',
      val2: '{const d=(3-2);if ((d<1)){return 1;};return 0;}'
    },
    'parsed if'
  );

  t.end();
});

tape('parse parses expressions with switch statements', t => {
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

  t.equal(
    parse(exprs, { compiler }).values.val,
    '{const v=\'foo\';switch (v) {case \'foo\': return 1;case \'bar\': return 2;default: return 3;};}',
    'parsed switch'
  );

  t.end();
});

tape('parse throws on expressions with for loops', t => {
  const exprs = {
    val: () => {
      let v = 0;
      for (let i = 0; i < 5; ++i) {
        v += i;
      }
      return v;
    }
  };
  t.throws(() => parse(exprs), 'no for loops');
  t.end();
});

tape('parse throws on expressions with while loops', t => {
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
  t.throws(() => parse(exprs), 'no while loops');
  t.end();
});

tape('parse throws on expressions with do-while loops', t => {
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
  t.throws(() => parse(exprs), 'no do-while loops');
  t.end();
});

tape('parse throws on dirty tricks', t => {
  // eslint-disable-next-line no-undef
  t.throws(() => parse({ f: () => globalThis }), 'no globalThis access');
  t.throws(() => parse({ f: () => global }), 'no global access');
  t.throws(() => parse({ f: () => window }), 'no window access');
  t.throws(() => parse({ f: () => self }), 'no self access');
  t.throws(() => parse({ f: () => this }), 'no this access');
  t.throws(() => parse({ f: () => Object }), 'no Object access');
  t.throws(() => parse({ f: () => Date }), 'no Date access');
  t.throws(() => parse({ f: () => Array }), 'no Array access');
  t.throws(() => parse({ f: () => Number }), 'no Number access');
  t.throws(() => parse({ f: () => Math }), 'no Math access');
  t.throws(() => parse({ f: () => String }), 'no String access');
  t.throws(() => parse({ f: () => RegExp }), 'no RegExp access');

  t.throws(() => parse({
    f: () => { const foo = [].constructor; return new foo(3); }
  }), 'no instantiation');

  t.throws(() => parse({
    f: () => [].constructor()
  }), 'no property invocation');

  t.throws(() => parse({
    f: () => [].__proto__.unsafe = 1
  }), 'no __proto__ assignment');

  t.throws(() => parse({
    f: () => 'abc'.toUpperCase()
  }), 'no literal method calls');

  t.throws(() => parse({
    f: () => { const s = 'abc'; return s.toUpperCase(); }
  }), 'no identifier method calls');

  t.throws(() => parse({
    f: () => ('abc')['toUpperCase']()
  }), 'no indirect method calls');

  t.throws(() => parse({
    f: 'd => op.mean(var foo = d.x)'
  }), 'no funny business');

  t.end();
});

tape('parse supports ast output option', t => {
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

  t.deepEqual(
    JSON.parse(JSON.stringify(ast)),
    {
      'constant': {
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
      'column': {
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
      'agg1': {
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
      'agg2': {
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
      'agg3': {
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
      'win1': {
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
      'win2': {
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
      'win3': {
        'type': 'CallExpression',
        'callee': {
          'type': 'Function',
          'name': 'count'
        },
        'arguments': []
      }
    }
  );

  t.end();
});