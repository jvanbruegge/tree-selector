export interface Selector {
    tag: string;
    id: string;
    classList: string[];
    attributes: Attributes;
}

export interface Attributes {
    [attr: string]: [AttributeMatch, string];
}

export type AttributeMatch =
    | 'exact'
    | 'truthy'
    | 'startsWith'
    | 'endsWith'
    | 'contains'
    | 'whitespace'
    | 'dash';

const IDENT = '[\\w-]+';
const SPACE = '[ \t]*';
const STRING = `"[^"]*"`;

const CLASS = `(?:\\.${IDENT})`;
const ID = `(?:#${IDENT})`;

const OP = `(?:=|\\$=|\\^=|\\*=|~=|\\|=)`;
const ATTR = `(?:\\[${SPACE}${IDENT}${SPACE}(?:${OP}${SPACE}${STRING}${SPACE})?\\])`;

const TAG = `(:?${IDENT})?`;
const TOKENS = `${CLASS}|${ID}|${ATTR}`;

/**
 * Parses a css selector into a normalized object.
 * Expects a selector for a single element only, no `>` or the like!
 */
export function selectorParser(selector: string): Selector {
    const sel = selector.trim();
    let tagRegex = new RegExp(TAG, 'y');
    const [tag] = (tagRegex.exec(sel) as any) as [string];

    const regex = new RegExp(TOKENS, 'y');
    regex.lastIndex = tagRegex.lastIndex;

    const matches: string[] = [];

    while (regex.lastIndex < sel.length) {
        const match = regex.exec(sel);
        if (!match) {
            throw new Error(
                `Parse error, invalid selector at char ${regex.lastIndex}`
            );
        } else {
            matches.push(match[0]);
        }
    }

    const classList = matches
        .filter(s => s.startsWith('.'))
        .map(s => s.substring(1));

    const ids = matches.filter(s => s.startsWith('#')).map(s => s.substring(1));

    if (ids.length > 1) {
        throw new Error('Invalid selector, only one id is allowed');
    }

    const postprocessRegex = new RegExp(
        `(${IDENT})${SPACE}(${OP})?${SPACE}(${STRING})?`
    );
    const attrs = matches
        .filter(s => s.startsWith('['))
        .map(s => (postprocessRegex.exec(s) as string[]).slice(1, 4))
        .map(([attr, op, val]) => ({
            [attr]: [getOp(op), val ? val.slice(1, -1) : val]
        }))
        .reduce((acc, curr) => ({ ...acc, ...curr }), {}) as Attributes;

    return {
        id: ids[0] || '',
        tag,
        classList,
        attributes: attrs
    };
}

function getOp(op: string): string {
    switch (op) {
        case '=':
            return 'exact';
        case '^=':
            return 'startsWith';
        case '$=':
            return 'endsWith';
        case '*=':
            return 'contains';
        case '~=':
            return 'whitespace';
        case '|=':
            return 'dash';
        default:
            return 'truthy';
    }
}
