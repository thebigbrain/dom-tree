export enum Token {
  EOF,
  LEFTARROW,
  RIGHTARROW,
  SLASH,
  EQUAL,
  SINGLEQUOTE,
  DOUBLEQUOTE,
  IDENTIFIER,
  COMMENT
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

export class Tokenizer {
  private lastChar: string;
  private identifierStr: string;
  private pos: number;

  constructor(private html: string) {
    lastChar = ' ';
    this.identifierStr = '';
    this.pos = 0;
  }

  public getTokenValue(): string {
    return this.identifierStr;
  }

  public getToken(): Token {
    lastChar = this.getChar();
    while (isSpace(lastChar) || isEndOfLine(lastChar)) {
      lastChar = this.getChar();
    }
    this.identifierStr = lastChar;
    if (isAlpha(lastChar)) {
      while (isAlpha((lastChar = this.getChar()))) {
        this.identifierStr += lastChar;
      }
      this.stepback();
      return Token.IDENTIFIER;
    }
    switch (lastChar) {
      case '=': return Token.EQUAL;
      case '<': return this.getComment();
      case '/': return Token.SLASH;
      case '>': return Token.RIGHTARROW;
      case '\'':
      case '\"':
        return this.getQuoteStr(lastChar);
      default:
        break;
    }
    if (lastChar !== '') {
      while ((lastChar = this.getChar()) !== '<' && lastChar !== '') {
        this.identifierStr += lastChar;
      }
      this.stepback();
      return Token.IDENTIFIER;
    }
    return Token.EOF;
  }

  private getComment(): Token {
    if (this.previewNextChar() === '!') {
      this.identifierStr = this.previewNextChar(-1) + lastChar;
      if (this.previewNextChar(1) !== '-' || this.previewNextChar(2) !== '-') {
        throw 'invalid tag';
      }
      while(!((lastChar = this.getChar()) === '>' && this.previewNextChar(-1) !== '-' && this.previewNextChar(-2) !== '-')) {
        this.identifierStr += lastChar;
      }
      this.identifierStr += lastChar;
      return Token.COMMENT;
    }
    return Token.LEFTARROW;
  }

  private getQuoteStr(quote: string): Token {
    this.identifierStr = quote;
    while ((lastChar = this.getChar()) !== quote) {
      this.identifierStr += lastChar;
    }
    this.identifierStr += lastChar;
    return Token.IDENTIFIER;
  }

  private previewNextChar(i: number = 0): string {
    return this.html[this.pos + i];
  }

  private getChar(): string {
    return this.html[this.pos++] || '';
  }

  private stepback() {
    this.pos--;
  }
}
