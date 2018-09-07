import { Options } from './types';
import { parseSelector, Selector } from './selectorParser';

export function createMatches<T>(
    opts: Options<T>
): (selector: string | Selector, node: T) => boolean {
    return function matches(selector: string | Selector, node: T | undefined): boolean {
        const { tag, id, classList, attributes, nextSelector, pseudos } =
            typeof selector === 'object' ? selector : parseSelector(selector);

        if (nextSelector !== undefined) {
            throw new Error(
                'matches can only process selectors that target a single element'
            );
        }
        if(!node) {
            return false;
        }

        if (tag && tag.toLowerCase() !== opts.tag(node).toLowerCase()) {
            return false;
        }
        if (id && id !== opts.id(node)) {
            return false;
        }
        const classes = opts.className(node).split(' ');
        for (let i = 0; i < classList.length; i++) {
            if (classes.indexOf(classList[i]) === -1) {
                return false;
            }
        }

        for (let key in attributes) {
            const attr = opts.attr(node, key);
            const t = attributes[key][0];
            const v = attributes[key][1];

            if (attr === undefined) {
                return false;
            }
            if (t === 'has') {
                return true;
            }
            if (t === 'exact' && attr !== v) {
                return false;
            } else if(t !== 'exact') {
                if(typeof v !== 'string') {
                    throw new Error('All non-string values have to be an exact match');
                }
                if (t === 'startsWith' && !attr.startsWith(v)) {
                    return false;
                }
                if (t === 'endsWith' && !attr.endsWith(v)) {
                    return false;
                }
                if (t === 'contains' && attr.indexOf(v) === -1) {
                    return false;
                }
                if (t === 'whitespace' && attr.split(' ').indexOf(v) === -1) {
                    return false;
                }
                if (t === 'dash' && attr.split('-').indexOf(v) === -1) {
                    return false;
                }
            }
        }

        for (let i = 0; i < pseudos.length; i++) {
            const [t, data] = pseudos[i];
            if (t === 'contains' && data !== opts.contents(node)) {
                return false;
            }
            if (
                t === 'empty' &&
                (opts.contents(node) || opts.children(node).length !== 0)
            ) {
                return false;
            }
            if (t === 'root' && opts.parent(node) !== undefined) {
                return false;
            }
            if (t.indexOf('child') !== -1) {
                if (!opts.parent(node)) {
                    return false;
                }
                const siblings = opts.children(opts.parent(node) as T);
                if (t === 'first-child' && siblings.indexOf(node) !== 0) {
                    return false;
                }
                if (
                    t === 'last-child' &&
                    siblings.indexOf(node) !== siblings.length - 1
                ) {
                    return false;
                }
                if (t === 'nth-child') {
                    const regex = /([\+-]?)(\d*)(n?)(\+\d+)?/;
                    const parseResult = (regex.exec(
                        data as string
                    ) as string[]).slice(1);
                    const index = siblings.indexOf(node);
                    if (!parseResult[0]) {
                        parseResult[0] = '+';
                    }
                    const factor = parseResult[1]
                        ? parseInt(parseResult[0] + parseResult[1])
                        : undefined;
                    const add = parseInt(parseResult[3] || '0');
                    if (
                        factor &&
                        parseResult[2] === 'n' &&
                        index % factor !== add
                    ) {
                        return false;
                    } else if (
                        !factor &&
                        parseResult[2] &&
                        ((parseResult[0] === '+' && index - add < 0) ||
                            (parseResult[0] === '-' && index - add >= 0))
                    ) {
                        return false;
                    } else if (
                        !parseResult[2] && factor &&
                        index !== factor - 1
                    ) {
                        return false;
                    }
                }
            }
        }

        return true;
    };
}
