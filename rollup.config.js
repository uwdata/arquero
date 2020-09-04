import json from '@rollup/plugin-json';
import bundleSize from 'rollup-plugin-bundle-size';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  plugins: [
    json(),
    bundleSize(),
    nodeResolve({ modulesOnly: true })
  ],
  output: [
    {
      file: 'dist/arquero.js',
      name: 'aq',
      format: 'umd'
    },
    {
      file: 'dist/arquero.min.js',
      name: 'aq',
      format: 'umd',
      sourcemap: true,
      plugins: [ terser({ ecma: 2018 }) ]
    },
    {
      file: 'dist/arquero.mjs',
      format: 'es'
    }
  ]
};