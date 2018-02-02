export enum Token {
  EOF,
  SPACE,
  LEFTARROW,
  RRIGHTARROW,
  BACKSLASH,
  EQUAL,
  APOSTROPHE,
  DOUBLEQUOTE,
  IDENTIFIER
};

let lastChar = ' ';

function isSpace(c: string): boolean {
  return c === ' ';
};

function isAlphabet(c: string): boolean {
  return /[a-zA-Z]/.test(c);
}

export class Tokenizer {
  private lastChar: string;
  private identifierStr: string;
  private currentIndex: number;

  constructor (private html: string) {
    lastChar = ' ';
    this.identifierStr = '';
    this.currentIndex = 0;
  }

  public getToken(): Token {
    while (isSpace(lastChar)) {
      lastChar = this.getChar();
      if (isAlphabet(lastChar)) {
        this.identifierStr += lastChar;
      }
    }
    return Token.EOF;
  }

  private getChar(): string {
    return this.html[this.currentIndex++];
  }
}
