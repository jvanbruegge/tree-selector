import { selectorParser } from '../src/selectorParser';
import { permutations } from './utils';

const assert = require('assert');

describe('selectorParser', () => {
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
            const result = selectorParser(sel);
            result.classList.sort();
            assert.deepEqual(result, expected);

            const result2 = selectorParser('tag' + sel);
            result2.classList.sort();
            assert.deepStrictEqual(result2, { ...expected, tag: 'tag' });
        }
    });

    it('should throw when specifying an id twice', () => {
        assert.throws(
            () => selectorParser('#id1#id2'),
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
                () => selectorParser(selectorArray.join('')),
                /Parse error, invalid selector at char \d+/
            );
        }
    });
});
