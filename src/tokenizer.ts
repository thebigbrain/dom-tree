export enum Token {
  EOF,
  LEFTARROW,
  RRIGHTARROW,
  BACKSLASH,
  EQUAL,
  SINGLEQUOTE,
  DOUBLEQUOTE,
  IDENTIFIER,
  TAG_A,
  TAG_BR,
  TAG_DIV,
  TAG_EM,
  TAG_FIGURE,
  TAG_I,
  TAG_IMG,
  TAG_LI,
  TAB_OL,
  TAG_P,
  TAG_SPAN,
  TAG_TABLE,
  TAG_TBODY,
  TAG_TD,
  TAG_TH,
  TAG_TR,
  TAG_UL
};

let lastChar = ' ';

function isSpace(c: string): boolean {
  return c === ' ';
}

function isEndOfLine(c: string): boolean {
  return c === '\r' || c === '\n';
}

function isAlpha(c: string): boolean {
  return /[a-zA-Z0-9]/.test(c);
}

function getTag(str: string): Token {
  str = str.toLowerCase();
  switch (str) {
    case 'a': return Token.TAG_A;
    default: return Token.IDENTIFIER;
  }
}


export class Tokenizer {
  private lastChar: string;
  private identifierStr: string;
  private pos: number;

  constructor(private html: string) {
    lastChar = ' ';
    this.identifierStr = '';
    this.pos = 0;
  }

  public getToken(): Token {
    lastChar = this.getChar();
    while (isSpace(lastChar) || isEndOfLine(lastChar)) {
      lastChar = this.getChar();
    }
    if (isAlpha(lastChar)) {
      this.identifierStr = lastChar;
      while (isAlpha((lastChar = this.getChar()))) {
        this.identifierStr += lastChar;
      }
      return getTag(this.identifierStr);
    }
    switch (lastChar) {
      case '=': return Token.EQUAL;
      case '<': return Token.LEFTARROW;
      case '/': return Token.BACKSLASH;
      case '>': return Token.RRIGHTARROW;
      case '\'':
      case '\"':
        return this.getQuoteStr(lastChar);
      default:
        break;
    }
    if (lastChar !== '') {
      this.identifierStr = lastChar;
      while((lastChar = this.getChar()) !== '<') {
        this.identifierStr += lastChar;
      }
      return Token.IDENTIFIER;
    }
    return Token.EOF;
  }

  private getQuoteStr(quote: string): Token {
    this.identifierStr = quote;
    while ((lastChar = this.getChar()) !== quote) {
      this.identifierStr += lastChar;
    }
    return Token.IDENTIFIER;
  }

  private getChar(): string {
    return this.html[this.pos++] || '';
  }
}
