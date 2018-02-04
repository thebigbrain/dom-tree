// rollup.config.js (building more than one bundle)
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default [{
  input: './dist/dom-tree-parser/index.js',
  output: {
    file: './dist/dom-tree-parser.cjs.js',
    format: 'cjs'
  },
  plugins: [ resolve(), commonjs() ]
}, {
  input: './dist/dom-tree-parser/index.js',
  output: {
    name: 'DomTreeParser',
    file: './dist/dom-tree-parser.umd.js',
    format: 'umd'
  },
  plugins: [ resolve(), commonjs() ]
}];