import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  plugins: [ nodeResolve({ modulesOnly: true }) ],
  output: [
    {
      file: 'build/arquero.js',
      name: 'aq',
      format: 'umd'
    },
    {
      file: 'build/arquero.min.js',
      name: 'aq',
      format: 'umd',
      plugins: [ terser({ ecma: 2018 }) ]
    },
    {
      file: 'build/arquero.mjs',
      format: 'es'
    }
  ]
};