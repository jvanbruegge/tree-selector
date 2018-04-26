import { Selector, parseSelector, Combinator } from './selectorParser';
import { Options } from './types';
import { createMatches } from './matches';

export function createQuerySelector<T>(
    options: Options<T>
): (sel: string | Selector, node: T) => T[] {
    const matches = createMatches(options);

    function find(selector: Selector, depth: number, node: T): T[] {
        const matched = matches(selector, node) ? [node] : [];
        if(depth > 0) {
            const childMatched = options
                .children(node)
                .filter(c => typeof c !== 'string')
                .map(c => find(selector, depth - 1, c as T))
                .reduce((acc, curr) => acc.concat(curr), []);

            return matched.concat(childMatched);
        }
        return matched;
    }

    return function querySelector(selector: string | Selector, node: T): T[] {
        const sel =
            typeof selector === 'object' ? selector : parseSelector(selector);

        let results: T[] = [node];

        let currentSelector = sel;
        let currentCombinator: Combinator = 'subtree';
        let tail = undefined;
        do {
            tail = currentSelector.nextSelector;
            currentSelector.nextSelector = undefined;

            const depth = currentCombinator === 'subtree' ? Infinity : 1;

            results = results
                .map(n => find(currentSelector, depth, n))
                .reduce((acc, curr) => acc.concat(curr), []);

            if (tail) {
                currentSelector = tail[1];
                currentCombinator = tail[0];
            }
        } while (tail !== undefined);

        return results;
    };
}
