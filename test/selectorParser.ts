import { parseSelector } from '../src/index';

const assert = require('assert');

describe('parseSelector', () => {
    it('should parse all permutations of a selector', () => {
        const selectors = [
            '.class2',
            '.class1',
            '.class3',
            '#id',
            '[attr]',
            '[attr2="foo"]',
            '[attr3*=    "foo"]',
            '[    attr4   ]',
            '[ attr5     |="   "]'
        ];
        const expected = {
            classList: ['class1', 'class2', 'class3'],
            id: 'id',
            tag: '',
            pseudos: [],
            nextSelector: undefined,
            attributes: {
                attr: ['truthy', undefined],
                attr2: ['exact', 'foo'],
                attr3: ['contains', 'foo'],
                attr4: ['truthy', undefined],
                attr5: ['dash', '   ']
            }
        };

        const sel = selectors.join('');
        const result = parseSelector(sel);
        result.classList.sort();
        assert.deepStrictEqual(result, expected);

        const result2 = parseSelector('tag' + sel);
        result2.classList.sort();
        assert.deepStrictEqual(result2, { ...expected, tag: 'tag' });
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
            '.class1',
            '.class3',
            '#id',
            '[attr',
            '[attr2="foo"]',
            '[attr3*=    "foo"]',
            '    attr4   ]',
            '[ attr5     |="   "]'
        ];

        assert.throws(
            () => parseSelector(selectors.join('')),
            /Parse error, invalid selector/
        );
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
