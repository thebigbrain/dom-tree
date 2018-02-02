const fs = require('fs');
// const parse = require('./dom-tree');
const { Tokenizer, Token } = require('../dist/dom-tree-parser');

const html = fs.readFileSync('./example.html').toLocaleString();

let tokenizer = new Tokenizer(html);
let token;
while((token = tokenizer.getToken()) !== Token.EOF) {
  console.log(token, tokenizer.identifierStr)
}