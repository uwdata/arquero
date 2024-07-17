import bundleSize from 'rollup-plugin-bundle-size';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

const name = 'aq';
const external = [ 'apache-arrow' ];
const globals = { 'apache-arrow': 'Arrow' };
const plugins = [
  bundleSize(),
  nodeResolve({ modulesOnly: true })
];

export default [
  {
    input: 'src/index-browser.js',
    external,
    plugins,
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
