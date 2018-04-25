import { Selector, parseSelector } from './selectorParser';
import { Options } from './types';
import { createMatches } from './matches';

export function createQuerySelector<T>(
    options: Options<T>
): (sel: string | Selector, node: T) => T[] {
    const matches = createMatches(options);

    function findSubtree(selector: Selector, node: T): T[] {
        if (selector.nextSelector !== undefined) {
            throw new Error('Should not happen');
        }

        const matched = matches(selector, node) ? [node] : [];
        const childMatched = options
            .children(node)
            .filter(c => typeof c !== 'string')
            .map(c => findSubtree(selector, c as T))
            .reduce((acc, curr) => acc.concat(curr), []);

        return matched.concat(childMatched);
    }

    return function querySelector(selector: string | Selector, node: T): T[] {
        const sel =
            typeof selector === 'object' ? selector : parseSelector(selector);

        let currentSelector = sel;
        let tail = sel.nextSelector;

        currentSelector.nextSelector = undefined;

        return findSubtree(currentSelector, node);
    };
}
