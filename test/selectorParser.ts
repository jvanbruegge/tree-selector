import * as permutations from 'get-permutations';
import * as assert from 'assert';

import { parseSelector } from '../src/index';

describe('parseSelector', () => {
    it('should parse all permutations of a selector', () => {
        const selectors = [
            '.class2',
            '.class1',
            '#id',
            '[attr]',
            '[attr3*=    "foo"]',
            '[    attr4   ]',
            '[ attr5     |="   "]'
        ];
        const expected = {
            classList: ['class1', 'class2'],
            id: 'id',
            tag: '',
            pseudos: [],
            nextSelector: undefined,
            attributes: {
                attr: ['has', undefined],
                attr3: ['contains', 'foo'],
                attr4: ['has', undefined],
                attr5: ['dash', '   ']
            }
        };

        const tests = permutations(selectors);
        for (let selectorArray of tests) {
            const sel = selectorArray.join('');
            const result = parseSelector(sel);
            result.classList.sort();
            assert.deepStrictEqual(result, expected);

            const result2 = parseSelector('tag' + sel);
            result2.classList.sort();
            assert.deepStrictEqual(result2, { ...expected, tag: 'tag' });
        }
    });

    it('should throw when specifying an id twice', () => {
        assert.throws(
            () => parseSelector('#id1#id2'),
            /Invalid selector, only one id is allowed/
        );
    });

    it('should throw with invalid selector', () => {
        const selectors = [
            '.class2',
            '#id',
            '[attr',
            '[attr3*=    "foo"]',
            '    attr4   ]',
            '[ attr5     |="   "]'
        ];

        const tests = permutations(selectors);
        for (let selectorArray of tests) {
            assert.throws(
                () => parseSelector(selectorArray.join('')),
                /Parse error, invalid selector/
            );
        }
    });

    it('should parse a simple subtree selector', () => {
        const selector = 'div#id div';
        const result = parseSelector(selector);
        const expected = {
            id: 'id',
            tag: 'div',
            classList: [],
            attributes: {},
            pseudos: [],
            nextSelector: [
                'subtree',
                {
                    id: '',
                    tag: 'div',
                    classList: [],
                    attributes: {},
                    pseudos: [],
                    nextSelector: undefined
                }
            ]
        };

        assert.deepStrictEqual(result, expected);
    });

    it('should parse a complex combinator selector', () => {
        const selector = 'div#id div + #id[attr   =  "  f"]';
        const result = parseSelector(selector);
        const expected = {
            id: 'id',
            tag: 'div',
            classList: [],
            attributes: {},
            pseudos: [],
            nextSelector: [
                'subtree',
                {
                    id: '',
                    tag: 'div',
                    classList: [],
                    attributes: {},
                    pseudos: [],
                    nextSelector: [
                        'nextSibling',
                        {
                            id: 'id',
                            tag: '',
                            classList: [],
                            attributes: {
                                attr: ['exact', '  f']
                            },
                            pseudos: [],
                            nextSelector: undefined
                        }
                    ]
                }
            ]
        };

        assert.deepStrictEqual(result, expected);
    });

    it('should parse pseudo selectors', () => {
        const pseudoSelectors = [
            ['last-child'],
            ['first-child'],
            ['nth-child', '2n+1'],
            ['nth-child', '-n+11'],
            ['root'],
            ['empty'],
            ['contains', 'blabla']
        ].map(arr => (arr.length === 1 ? [arr[0], undefined] : arr));

        for (let [k, v] of pseudoSelectors) {
            let selector = 'div:' + k;
            if (v !== undefined) {
                if(k === 'contains') {
                    selector += `("${v}")`;
                } else {
                    selector += `(${v})`;
                }
            }
            const result = parseSelector(selector);
            const expected = {
                id: '',
                tag: 'div',
                classList: [],
                attributes: {},
                nextSelector: undefined,
                pseudos: [[k, v]]
            };
            assert.deepStrictEqual(result, expected);
        }
    });

    it('should parse attribute selector string without quotes', () => {
        const selector = '[data-something=foo]';

        const result = parseSelector(selector);
        const expected = {
            id: '',
            tag: '',
            classList: [],
            attributes: {
                'data-something': ['exact', 'foo']
            },
            nextSelector: undefined,
            pseudos: []
        };
        assert.deepStrictEqual(result, expected);
    });
});
