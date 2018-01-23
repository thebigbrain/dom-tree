const tokenEnds = ['>', '/'];

const isValidChar = (c) => {
	let re = /[a-zA-Z\-]/;
	return re.test(c);
}

const removeSpace = (str) => {
	return str.replace(' ', '');
}

const parse = (html = '') => {
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

	const encounterTokenClosed = (c) => {
		advance();
		c = html[i];
		if (c !== '>') console.error('reach invalid token end', html.substr(i - 3, 20));
	}

	const advanceCommentEnd = () => {
		advance(2);
		let c = html[i];
		let text = '';
		while(isInRange()) {
			if(c == '-' && html[i+1] == '-' && html[i+2] == '>'){
				advance(3);
				break;
			} else {
				text += c;
				advance();
				c = html[i];
			}
		}
		console.log('got comment', text);
		return text;
	}

	const scanToken = () => {
		let c = html[i];
		let token = '';
		let tokenClosed = false;
		let text = '';
		if (c == '!') {
			token == 'comment';
			text = advanceCommentEnd();
			tokenClosed = true;
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
			currentToken = { name: token, attrs: {}, children: [], text };
			let ptoken = unclosedTokens[0];
			ptoken ? ptoken.children.push(currentToken) : rootTokens.push(currentToken);
			if (!tokenClosed) unclosedTokens.unshift(currentToken);
			else currentToken = null;
		} else {
			console.log('empty token', html.substr(i-3, 20));
		}
	};

	const scanAttrs = () => {
		let c = html[i];
		if (currentToken && c == ' ') {
			console.log('get attrs for token', currentToken.name)
			let start = end = i;
			let tokenClosed = false;
			advance();
			while (isInRange()) {
				c = html[i];
				if (c == ' ') {
					advance();
					continue;
				} else if (c == '/') {
					tokenClosed = true;
					encounterTokenClosed();
					break;
				} else if(c == '>') {
					end = i - 1;
					break;
				} else {
					advance();
				}
			}
			if(end > start) {
				let attrs = html.substring(start, end).split(' ');
				attrs.forEach(attr => {
					let a = attr.split('=');
					if(a[0]) {
						currentToken.attrs[a[0].replace(/ /g, '')] = a[1] ? a[1].replace(/ /g, '') : true;
					}
				});
			}
			if(tokenClosed) {
				unclosedTokens.shift();
				currentToken = unclosedTokens[0] || null;
			}
		}
	}

	const advanceTokenEnd = () => {
		advance();
		let c = html[i];
		while(isInRange() && c !== '>') {
			advance();
			c = html[i];
		}
		unclosedTokens.shift();
	}

	const scanInnerHtml = () => {
		let c = html[i];
		console.log('try to get inner html', c)
		if(c == '>' && currentToken) {
			advance();
			c = html[i];
			while(isInRange()) {
				if(c == '<') {
					if(html[i+1] == '/') advanceTokenEnd();
					break;
				} else if(c == '/' || c == ' '){
					advance();
					c = html[i];
					continue;
				} else {
					currentToken.text += c;
					advance();
					c = html[i];
				}
			}
		}
	};

	while (i < len) {
		let c = html[i];
		switch (c) {
			case '<':
				advance();
				scanToken();
				scanAttrs();
				scanInnerHtml();
				break;
			case '>':
			default:
				advance();
				break;
		}
	}

	return rootTokens;
};

module.exports = parse;
