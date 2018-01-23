const fs = require('fs');
const parse = require('./dom-tree');

const html = fs.readFileSync('./example.html').toLocaleString();

console.log(parse(html));