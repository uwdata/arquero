import bundleSize from 'rollup-plugin-bundle-size';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

const name = 'aq';
const plugins = [
  bundleSize(),
  nodeResolve({ modulesOnly: true })
];

function onwarn(warning) {
  if (warning.code !== 'CIRCULAR_DEPENDENCY') {
    // eslint-disable-next-line
    console.error(`(!) ${warning.message}`);
  }
}

export default [
  {
    input: 'src/index-browser.js',
    plugins,
    onwarn,
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
