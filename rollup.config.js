import bundleSize from 'rollup-plugin-bundle-size';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

const name = 'aq';
const plugins = [
  bundleSize(),
  nodeResolve({ browser: true, modulesOnly: true })
];

export default [
  {
    input: 'src/index.js',
    plugins,
    output: [
      {
        file: 'dist/arquero.js',
        format: 'umd',
        name
      },
      {
        file: 'dist/arquero.min.js',
        format: 'umd',
        sourcemap: true,
        plugins: [ terser({ ecma: 2018 }) ],
        name
      }
    ]
  }
];
