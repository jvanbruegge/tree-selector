export interface Selector {
    tag: string;
    id: string;
    classList: string[];
    attributes: Attributes;
    nextSelector: [Combinator, Selector] | undefined;
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

export type Combinator = 'subtree' | 'child' | 'nextSibling' | 'sibling';

const IDENT = '[\\w-]+';
const SPACE = '[ \t]*';
const STRING = `"[^"]*"`;

const CLASS = `(?:\\.${IDENT})`;
const ID = `(?:#${IDENT})`;

const OP = `(?:=|\\$=|\\^=|\\*=|~=|\\|=)`;
const ATTR = `(?:\\[${SPACE}${IDENT}${SPACE}(?:${OP}${SPACE}${STRING}${SPACE})?\\])`;

const SUBTREE = `(?:[ \t]+)`;
const CHILD = `(?:${SPACE}(>)${SPACE})`;
const NEXT_SIBLING = `(?:${SPACE}(\\+)${SPACE})`;
const SIBLING = `(?:${SPACE}(~)${SPACE})`;

const COMBINATOR = `(?:${SUBTREE}|${CHILD}|${NEXT_SIBLING}|${SIBLING})`;

const TAG = `(:?${IDENT})?`;
const TOKENS = `${CLASS}|${ID}|${ATTR}|${COMBINATOR}`;

const combinatorRegex = new RegExp(`^${COMBINATOR}$`);

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

    let nextSelector = undefined;
    let lastCombinator = undefined;
    let index = -1;

    while (regex.lastIndex < sel.length) {
        const match = regex.exec(sel);
        if (!match && lastCombinator === undefined) {
            throw new Error(
                `Parse error, invalid selector at char ${regex.lastIndex}`
            );
        } else if (match && combinatorRegex.test(match[0])) {
            const comb = (combinatorRegex.exec(match[0]) as string[])[0];
            lastCombinator = comb;
            index = regex.lastIndex;
        } else {
            if (lastCombinator !== undefined) {
                nextSelector = [
                    getCombinator(lastCombinator),
                    selectorParser(sel.substring(index))
                ] as [Combinator, Selector];
                break;
            }
            matches.push((match as string[])[0]);
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
        attributes: attrs,
        nextSelector
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

function getCombinator(comb: string): string {
    switch (comb.trim()) {
        case '>':
            return 'child';
        case '+':
            return 'nextSibling';
        case '~':
            return 'sibling';
        default:
            return 'subtree';
    }
}
