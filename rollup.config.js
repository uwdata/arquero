import { nodeResolve } from '@rollup/plugin-node-resolve';
import bundleSize from 'rollup-plugin-bundle-size';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  plugins: [ nodeResolve({ modulesOnly: true }), bundleSize() ],
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