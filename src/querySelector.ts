import { Selector, parseSelector, Combinator } from './selectorParser';
import { Options } from './types';
import { createMatches } from './matches';

export function createQuerySelector<T>(
    options: Options<T>,
    matches?: (sel: string | Selector, node: T) => T | boolean
): (sel: string | Selector, node: T) => T[] {
    const _matches = matches || createMatches(options);

    function findSubtree(selector: Selector, depth: number, node: T | undefined): T[] {
        if(!node) {
            return [];
        }
        const n = _matches(selector, node);
        const matched = n ? (typeof n === 'object' ? [n] : [node]) : [];
        if (depth === 0) {
            return matched;
        }
        const childMatched = options
            .children(node)
            .filter(c => typeof c !== 'string')
            .map(c => findSubtree(selector, depth - 1, c as T))
            .reduce((acc, curr) => acc.concat(curr), []);

        return matched.concat(childMatched);
    }

    function findSibling(selector: Selector, next: boolean, node: T | undefined): T[] {
        if (!node || options.parent(node) === undefined) {
            return [];
        }

        let results: T[] = [];
        const siblings = options.children(options.parent(node) as T);

        for (let i = siblings.indexOf(node) + 1; i < siblings.length; i++) {
            if (typeof siblings[i] === 'string') {
                continue;
            }
            const n = _matches(selector, siblings[i] as T);
            if (n) {
                if(typeof n === 'object') {
                    results.push(n);
                } else {
                    results.push(siblings[i] as T);
                }
            }

            if (next) {
                break;
            }
        }

        return results;
    }

    return function querySelector(selector: string | Selector, node: T | undefined): T[] {
        if(!node) {
            return [];
        }
        const sel =
            typeof selector === 'object' ? selector : parseSelector(selector);

        let results: T[] = [node];

        let currentSelector = sel;
        let currentCombinator: Combinator = 'subtree';
        let tail = undefined;
        do {
            tail = currentSelector.nextSelector;
            currentSelector.nextSelector = undefined;

            if (
                currentCombinator === 'subtree' ||
                currentCombinator === 'child'
            ) {
                const depth = currentCombinator === 'subtree' ? Infinity : 1;

                results = results
                    .map(n => findSubtree(currentSelector, depth, n))
                    .reduce((acc, curr) => acc.concat(curr), []);
            } else {
                const next = currentCombinator === 'nextSibling';

                results = results
                    .map(n => findSibling(currentSelector, next, n))
                    .reduce((acc, curr) => acc.concat(curr), []);
            }

            if (tail) {
                currentSelector = tail[1];
                currentCombinator = tail[0];
            }
        } while (tail !== undefined);

        return results;
    };
}
