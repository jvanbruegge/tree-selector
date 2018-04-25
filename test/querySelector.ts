import { createQuerySelector } from '../src/index';

import { VNode, options } from './vnode';

const assert = require('assert');

const querySelector = createQuerySelector(options);

describe('querySelector', () => {
    it('should find node with simple selector', () => {
        const selector = 'div#id';
        const vtree = {
            tag: 'div',
            children: [
                { tag: 'span', id: 'id' },
                { tag: 'div', className: 'id' },
                { tag: 'div', id: 'id' }
            ]
        };

        const expected = [{ tag: 'div', id: 'id' }];

        assert.deepStrictEqual(querySelector(selector, vtree), expected);
    });
});
