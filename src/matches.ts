import { Options } from './types';
import { parseSelector, Selector } from './selectorParser';

export function createMatches<T>(
    opts: Options<T>
): (selector: string | Selector, node: T) => boolean {
    return function matches(selector: string | Selector, node: T): boolean {
        const { tag, id, classList, attributes, nextSelector } =
            typeof selector === 'object' ? selector : parseSelector(selector);

        if (nextSelector !== undefined) {
            throw new Error(
                'matches can only process selectors that target a single element'
            );
        }

        if (tag && tag.toLowerCase() !== opts.tag(node).toLowerCase()) {
            return false;
        }
        if (id && id !== opts.id(node)) {
            return false;
        }
        const classes = opts.className(node);
        for (let i = 0; i < classList.length; i++) {
            if (classes.indexOf(classList[i]) === -1) {
                return false;
            }
        }

        for (let key in attributes) {
            const attr = opts.attr(node, key);
            const t = attributes[key][0];
            const v = attributes[key][1];

            if (!attr) {
                return false;
            }
            if (t === 'exact' && attr !== v) {
                return false;
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

        return true;
    };
}
