import { readFile } from 'fs/promises';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import bundleSize from 'rollup-plugin-bundle-size';

const pkg = JSON.parse(await readFile('./package.json'));

function onwarn(warning, defaultHandler) {
  if (warning.code !== 'CIRCULAR_DEPENDENCY') {
    defaultHandler(warning);
  }
}

export default {
  input: './index.js',
  external: ['vega-dataflow', 'vega-util'],
  onwarn,
  output: {
    file: './build/vega-neutrino.js',
    format: 'umd',
    name: 'vegaNeutrino',
    globals: {
      'vega-dataflow': 'vega',
      'vega-util': 'vega'
    },
    sourcemap: true
  },
  plugins: [
    nodeResolve({
      browser: true,
      modulesOnly: true
    }),
    json(),
    babel({
      presets: [[
        '@babel/preset-env',
        {
          targets: 'defaults'
        }
      ]],
      babelHelpers: 'bundled',
      extensions: ['.js', '.ts']
    }),
    bundleSize()
  ]
};
