import json from '@rollup/plugin-json';
import bundleSize from 'rollup-plugin-bundle-size';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

function onwarn(warning, defaultHandler) {
  if (warning.code !== 'CIRCULAR_DEPENDENCY') {
    defaultHandler(warning);
  }
}

const name = 'aq';
const external = [ 'apache-arrow', 'node-fetch' ];
const globals = { 'apache-arrow': 'Arrow' };
const plugins = [
  json(),
  bundleSize(),
  nodeResolve({ modulesOnly: true })
];

export default [
  {
    input: 'src/index-node.js',
    external: ['acorn'].concat(external),
    plugins,
    onwarn,
    output: [
      {
        file: 'dist/arquero.node.js',
        format: 'cjs',
        name
      }
    ]
  },
  {
    input: 'src/index.js',
    external,
    plugins,
    onwarn,
    output: [
      {
        file: 'dist/arquero.js',
        format: 'umd',
        globals,
        name
      },
      {
        file: 'dist/arquero.min.js',
        format: 'umd',
        sourcemap: true,
        plugins: [ terser({ ecma: 2018 }) ],
        globals,
        name
      }
    ]
  }
];