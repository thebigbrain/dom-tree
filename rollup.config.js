// rollup.config.js (building more than one bundle)
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'dist/dom-tree-parser/index.js',
  output: {
    file: 'dist/dom-tree-parser.js',
    format: 'cjs'
  },
  plugins: [ resolve(), commonjs() ]
};