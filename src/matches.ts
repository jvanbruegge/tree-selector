import { Options } from './types';
import { selectorParser } from './selectorParser';

export function createMatches<T>(
    opts: Options<T>
): (selector: string, node: T) => boolean {
    return function matches(selector: string, node: T): boolean {
        if (/,|>/.test(selector)) {
            throw new Error(
                'matches can only process selectors that target a single element'
            );
        }

        const { tagName, id, classList, attributes } = selectorParser(selector);
        if (tagName.toLowerCase() !== opts.tag(node).toLowerCase()) {
            return false;
        }
        if (id !== opts.id(node)) {
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
