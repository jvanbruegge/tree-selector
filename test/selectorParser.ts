import { parseSelector } from '../src/index';
import { permutations } from './utils';

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
            attributes: {
                attr: ['truthy', undefined],
                attr2: ['exact', 'foo'],
                attr3: ['contains', 'foo'],
                attr4: ['truthy', undefined],
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
            '.class1',
            '.class3',
            '#id',
            '[attr',
            '[attr2="foo"]',
            '[attr3*=    "foo"]',
            '    attr4   ]',
            '[ attr5     |="   "]'
        ];

        const tests = permutations(selectors);
        for (let selectorArray of tests) {
            assert.throws(
                () => parseSelector(selectorArray.join('')),
                /Parse error, invalid selector at char \d+/
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
            nextSelector: [
                'subtree',
                {
                    id: '',
                    tag: 'div',
                    classList: [],
                    attributes: {},
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
            nextSelector: [
                'subtree',
                {
                    id: '',
                    tag: 'div',
                    classList: [],
                    attributes: {},
                    nextSelector: [
                        'nextSibling',
                        {
                            id: 'id',
                            tag: '',
                            classList: [],
                            attributes: {
                                attr: ['exact', '  f']
                            },
                            nextSelector: undefined
                        }
                    ]
                }
            ]
        };

        assert.deepStrictEqual(result, expected);
    });
});
