export interface Selector {
    tagName: string;
    id: string;
    classList: string[];
    attributes: { [attr: string]: [AttributeMatch, string] };
}

export type AttributeMatch =
    | 'exact'
    | 'truthy'
    | 'startsWith'
    | 'endsWith'
    | 'contains'
    | 'whitespace'
    | 'dash';

/**
 * Parses a css selector into a normalized object.
 * Expects a selector for a single element only, no `>` or the like!
 */
export function selectorParser(selector: string): Selector {
    const sel = selector.replace(/ /g, '');

    let state = 0;
    let tagName = '';
    let id = '';
    let classList: string[] = [];
    let attributes: any = {};
    let idParsed = false;
    let currentAttr = ['', '', ''];
    let openQuoteParsed = false;

    for (let i = 0; i < sel.length; i++) {
        const c = sel.charAt(i);
        if (state === 1 && c === '*') {
            throw new Error(
                'Invalid selector, universal selector has to be in front'
            );
        }

        if (state === 0 || state === 1) {
            switch (c) {
                case '*':
                    state = 1;
                    break;
                case '#':
                    state = 2;
                    break;
                case '.':
                    classList.push('');
                    state = 3;
                    break;
                case '[':
                    state = 4;
                    break;
                default:
                    tagName += c;
                    state = 20;
                    break;
            }
        } else if (state === 2) {
            if (id.length === 0 && '#.['.indexOf(c) !== -1) {
                throw new Error(
                    'Invalid selector, has to specify id identifier'
                );
            }
            if (idParsed) {
                throw new Error('Invalid selector, cannot specify id twice');
            }
            idParsed = true;
            switch (c) {
                case '#':
                    break;
                case '.':
                    classList.push('');
                    state = 3;
                    break;
                case '[':
                    state = 4;
                    break;
                default:
                    id += c;
                    idParsed = false;
                    break;
            }
        } else if (state === 3) {
            if (
                classList[classList.length - 1] === '' &&
                '#.['.indexOf(c) !== -1
            ) {
                throw new Error(
                    'Invalid selector, has to specify class identifier'
                );
            }
            switch (c) {
                case '#':
                    state = 2;
                    break;
                case '.':
                    classList.push('');
                    break;
                case '[':
                    state = 4;
                    break;
                default:
                    classList[classList.length - 1] += c;
                    break;
            }
        } else if (state === 4) {
            switch (c) {
                case '=':
                    state = 5;
                    currentAttr[1] = 'exact';
                    break;
                case ']':
                    state = 1;
                    currentAttr[1] = 'truthy';
                    attributes[currentAttr[0]] = currentAttr.slice(1) as any;
                    currentAttr = ['', '', ''];
                    break;
                case '$':
                    state = 7;
                    currentAttr[1] = 'endsWith';
                    break;
                case '^':
                    state = 7;
                    currentAttr[1] = 'startsWith';
                    break;
                case '*':
                    state = 7;
                    currentAttr[1] = 'contains';
                    break;
                case '~':
                    state = 7;
                    currentAttr[1] = 'whitespace';
                    break;
                case '|':
                    state = 7;
                    currentAttr[1] = 'dash';
                    break;
                default:
                    currentAttr[0] += c;
                    break;
            }
        } else if (state === 5) {
            if (!openQuoteParsed && currentAttr[2] === '' && c !== '"') {
                throw new Error(
                    'Invalid selector, attribute value has to be a string (missing `"`)'
                );
            }
            if (c === '"' && currentAttr[2].length > 0) {
                state = 6;
                openQuoteParsed = false;
            } else if (c == '"' && currentAttr[2] === '') {
                openQuoteParsed = true;
            } else {
                currentAttr[2] += c;
            }
        } else if (state === 6) {
            if (c !== ']') {
                throw new Error('Invalid selector, expected "]"');
            }
            attributes[currentAttr[0]] = currentAttr.slice(1) as any;
            currentAttr = ['', '', ''];
            state = 1;
        } else if (state === 7) {
            if (c !== '=') {
                throw new Error('Invalid selector, expected `=`');
            }
            state = 5;
        } else if (state === 20) {
            switch (c) {
                case '#':
                    state = 2;
                    break;
                case '.':
                    classList.push('');
                    state = 3;
                    break;
                case '[':
                    state = 4;
                    break;
                default:
                    tagName += c;
                    break;
            }
        }
    }
    return {
        tagName,
        id,
        classList,
        attributes
    };
}
