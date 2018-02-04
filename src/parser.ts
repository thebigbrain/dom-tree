import { Element, DOMString, Node } from './element';
import { Tokenizer, Token } from './tokenizer';
import { FatalError } from './error';

export type RootElement = Element;

const elementWithInners = ['a', 'div', 'em', 'figure', 'i', 'li', 'ol', 'p', 'script', 'span', 'strong', 'table', 'tbody', 'td', 'th', 'tr', 'ul'];
const elementNoInners = ['img', 'br', 'image'];

export class Parser {
  public root: RootElement; // current unclosed Element, which is also parent Element
  private curTok: Token;
  private tokenizer: Tokenizer;

  constructor() {
    this.root = this.createElement();
  }

  public parse(html: string): Array<Node> {
    if (!this.tokenizer) this.tokenizer = new Tokenizer(html);
    this.doParse();
    return this.root.childNodes;
  }

  private doParse() {
    while (true) {
      this.getNextToken();
      switch (this.curTok) {
        case Token.LEFTARROW:
          this.parseTag();
          break;
        case Token.IDENTIFIER:
          this.parseTextElement();
          break;
        case Token.COMMENT:
          break;
        case Token.EOF:
          return;
        default:
          throw new SyntaxError('cant process token: ' + this.curTok);
      }
    }
  }

  private parseTag() {
    this.getNextToken();
    if (this.curTok === Token.IDENTIFIER) {
      this.parseTagName();
      this.parseAttrs();
      if (elementNoInners.indexOf(this.root.nodeName) !== -1) {
        this.root = this.root.parentElement;
      }
    } else if (this.curTok === Token.SLASH) {
      this.parseTagEnd();
    } else {
      throw new SyntaxError('invalid tag name');
    }
  }

  private parseTextElement() {
    let node = this.createElement('text');
    node.innerText = this.getTokenValue();
    node.parentElement = this.root;
    this.root.appendChild(node);
  }

  private parseTagName() {
    let tagName = this.getTokenValue();
    let node = this.createElement(tagName.toLowerCase());
    node.parentElement = this.root;
    this.root.appendChild(node);
    this.root = node;
  }

  private parseAttrs() {
    this.getNextToken();
    while (this.curTok !== Token.RIGHTARROW) {
      if (this.curTok === Token.EOF) {
        throw new SyntaxError('parsing tag, reach end of file');
      }
      if (this.curTok === Token.SLASH) {
        this.curTok = this.getNextToken();
        if (this.curTok !== Token.RIGHTARROW) {
          throw SyntaxError('invalid slash');
        }
        return;
      }
      if (this.curTok === Token.IDENTIFIER) {
        let attrName = this.getTokenValue();
        let attrValue;
        this.curTok = this.getNextToken();
        if (this.curTok === Token.EQUAL) {
          this.getNextToken();
          attrValue = this.getTokenValue();
        } else {
          attrValue = true;
        }
        if (!this.root) throw new FatalError('current Element is null while parsing attrs');
        this.root.setAttribute(attrName, attrValue);
      }
      this.getNextToken();
    }
  }

  private parseTagEnd() {
    this.getNextToken(); // skip tagName of close token
    if (this.getTokenValue() !== this.root.nodeName) {
      throw new SyntaxError('invalid end token: ' + this.getTokenValue());
    }
    this.curTok = this.getNextToken(); // skip ">" of close token
    if (this.curTok !== Token.RIGHTARROW) {
      throw new SyntaxError('invalid end token: ' + this.curTok);
    }
    this.root = this.root.parentElement;
  }

  private getNextToken(): Token {
    return (this.curTok = this.tokenizer.getToken());
  }

  private getTokenValue(): string {
    return this.tokenizer.getTokenValue()
  }

  private createElement(name?: DOMString): Element {
    return new Element(name);
  }
}
