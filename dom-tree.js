const invalidChars = ['\\', '\"', '\'', ' '];

const trimImage = (s) => {
  let start = 0, end = s.length - 1;
  for (var i = 0; i < s.length; i++) {
    if (invalidChars.indexOf(s[i]) == -1) break;
    start++;
  }
  while (end > start) {
    if (invalidChars.indexOf(s[end]) == -1) break;
    end--;
  }
  return s.substr(start, end - start + 1);
};

const parseHtml = (html = '') => {
  html = html.replace(/[\r\n\t]/g, '');
  let i = 0;
  let len = html.length;
  let currentToken = null;
  let unclosedTokens = [];
  let rootTokens = [];

  const advance = (n = 1) => {
    i += n;
  }

  const isInRange = () => {
    return i < len;
  }

  const createToken = (token, type = '') => {
    return { name: token, attrs: {}, children: [], text: '', type };
  }

  const encounterTokenClosed = (c) => {
    advance();
    c = html[i];
    if (c !== '>') console.error('reach invalid token end', html.substr(i, 20));
  }

  const advanceCommentEnd = () => {
    advance(2);
    let c = html[i];
    let text = '';
    while (isInRange()) {
      if (c == '-' && html[i + 1] == '-' && html[i + 2] == '>') {
        advance(2);
        break;
      } else {
        text += c;
        advance();
        c = html[i];
      }
    }
    console.log('got comment', text, html[i]);
    return text;
  }

  const scanToken = () => {
    let c = html[i];
    let token = '';
    let tokenClosed = false;
    let text = '';
    if (c == '!') {
      let t = createToken('comment');
      t.text = advanceCommentEnd();
      let ptoken = unclosedTokens[0];
      ptoken ? ptoken.children.push(t) : rootTokens.push(t);
      currentToken = null;
      return;
    } else {
      while (isInRange()) {
        if (c == ' ') {
          if (token) break;
          console.error('syntaxt error: invalid token')
        } else if (c == '/') {
          tokenClosed = true;
          encounterTokenClosed();
          break;
        } else if (c == '>') {
          break;
        } else {
          token += c;
          advance();
          c = html[i];
        }
      }
    }
    if (token) {
      console.info('find token:>', token);
      currentToken = { name: token, attrs: {}, children: [], text };
      let ptoken = unclosedTokens[0];
      ptoken ? ptoken.children.push(currentToken) : rootTokens.push(currentToken);
      if (!tokenClosed) unclosedTokens.unshift(currentToken);
      else currentToken = null;
    } else {
      console.log('empty token', html.substr(i - 3, 20));
    }
  };

  const trimSpace = (s) => {
    let start = 0, end = s.length - 1;
    while (s[start] == ' ' && start < end) {
      start++;
    }
    while (s[end] == ' ' && start <= end) {
      end--;
    }
    return s.substring(start, end + 1);
  };

  const parseAttrs = (attrs = '') => {
    attrs = trimSpace(attrs);
    let res = {};
    let name = '';
    let attr = '';
    let quote = '';
    for (let j = 0; j < attrs.length; j++) {
      let c = attrs[j];
      if (c === '=') {
        quote = attrs[j + 1];
        name = attr;
        attr = '';
      } else if (c == quote && attrs[j - 1] !== '=') {
        res[trimSpace(name)] = name == 'src' ? trimImage(attr+c) : attr + c;
        attr = '';
        name = '';
        quote = '';
      } else {
        attr += c;
      }
    }
    return res;
  };

  const scanAttrs = () => {
    let c = html[i];
    if (currentToken && c == ' ') {
      let start = i, end = i;
      let tokenClosed = false;
      advance();
      while (isInRange()) {
        c = html[i];
        if (c == ' ') {
          advance();
          continue;
        } else if (c == '/' && html[i + 1] == '>') {
          end = i - 1;
          tokenClosed = true;
          encounterTokenClosed();
          break;
        } else if (c == '>') {
          end = i;
          break;
        } else {
          advance();
        }
      }

      if (end > start) {
        let attrs = html.substring(start, end);
        currentToken.attrs = parseAttrs(attrs);
        console.info('find attrs for token:>', currentToken.name, attrs);
      }

      if (tokenClosed) {
        console.info('token is closed:>', currentToken.name);
        unclosedTokens.shift();
        currentToken = unclosedTokens[0] || null;
      }
    }
  }

  const closeToken = () => {
    advance();
    let c = html[i];
    while (isInRange()) {
      c = html[i];
      if (c === '>') {
        break;
      }
      advance();
    }
    let rt = unclosedTokens.shift();
    console.info('token removed and closed:>', rt.name);
    advance();
  };

  const tryCloseToken = () => {
    let c = html[i];
    if (c == '<' && html[i + 1] == '/') {
      closeToken();
    }
  };

  const gotoNextToken = () => {
    advance();
    let text = '';
    let c = html[i];
    while (isInRange()) {
      c = html[i];
      if (c == '<') {
        break;
      }
      text += c;
      advance();
    }
    if (unclosedTokens[0]) {
      currentToken = unclosedTokens[0];
      let t = createToken('text', 'text');
      t.text = text;
      currentToken.children.push(t);
    } else {
      currentToken = createToken('text', 'text');
      currentToken.text = text;
      rootTokens.push(currentToken);
    }
    text = text && text.replace(/[ \r\n]/g, '');
    if (text) {
      console.log('find another innerText for token:>', currentToken.name, text);
    }
  };

  const advanceTokenEnd = () => {
    advance();
    let c = html[i];
    while (isInRange() && c !== '>') {
      advance();
      c = html[i];
    }
    if (c !== '>') {
      console.error('unclosed token', currentToken.name);
    }
    console.log('skip to token end', html[i]);
    let rt = unclosedTokens.shift();
    console.log('remove closed token', rt.name);
    gotoNextToken();
  }

  const scanInnerHtml = () => {
    let c = html[i];
    if (c == '>' && currentToken) {
      let text = '';
      advance();
      c = html[i];
      while (isInRange()) {
        if (c == '<') {
          text = text && text.replace(/[ \r\n]/g, '');
          if (text) {
            console.info('find innerText for token:>', currentToken.name, text, text.length);
            currentToken.children.push({ name: 'text', text, type: 'text' });
          }
          if (html[i + 1] == '/') advanceTokenEnd();
          break;
        } else {
          text += c;
          advance();
          c = html[i];
        }
      }
    }
  };

  const rescanHtml = () => {
    let c = html[i];
    if (c == '>') {
      let text = '';
      while (isInRange() && c !== '<') {
        advance();
        c = html[i];
        text += c;
      }
      if (text) {
        let token = createToken('text', 'text');
        token.text = text;
        if (currentToken) {
          currentToken.children.push(token);
        } else {
          let ptoken = unclosedTokens[0];
          if (ptoken) {
            ptoken.children.push(token);
          } else {
            rootTokens.push(token);
          }
        }
      }
      if (c !== '<') {
        console.error('EOS reached');
      }
    }
  };

  while (i < len) {
    let c = html[i];
    switch (c) {
      case '<':
        if (html[i + 1] == '/') {
          tryCloseToken();
          continue;
        }
        advance();
        scanToken();
        scanAttrs();
        scanInnerHtml();
        rescanHtml();
        break;
      case '>':
      default:
        advance();
        break;
    }
  }

  return rootTokens;
};

module.exports = parseHtml;
