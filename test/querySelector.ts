import * as assert from 'assert';
import { createQuerySelector } from '../src/index';

import { addParents } from './utils';
import { VNode, options } from './vnode';

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

    it('should find node with direct child selector', () => {
        const selector = 'div#id > .class';
        const vtree = {
            tag: 'div',
            children: [
                { tag: 'span', id: 'id' },
                {
                    tag: 'div',
                    id: 'id',
                    children: [
                        {
                            tag: 'div',
                            className: 'class right',
                            children: [{ tag: 'div', className: 'class wrong' }]
                        }
                    ]
                }
            ]
        };

        const result = querySelector(selector, vtree);

        assert.strictEqual(result.length, 1);
        assert.strictEqual(typeof result[0], 'object');
        assert.strictEqual(result[0].tag, 'div');
        assert.strictEqual(result[0].className, 'class right');
    });

    it('should find multiple node if having same class', () => {
        const selector = 'div#id .class';
        const vtree = {
            tag: 'div',
            children: [
                { tag: 'span', id: 'id' },
                {
                    tag: 'div',
                    id: 'id',
                    children: [
                        {
                            tag: 'div',
                            className: 'class class1',
                            children: [
                                { tag: 'div', className: 'class class2' }
                            ]
                        }
                    ]
                }
            ]
        };

        const result = querySelector(selector, vtree);

        assert.strictEqual(result.length, 2);
        assert.strictEqual(typeof result[0], 'object');
        assert.strictEqual(typeof result[1], 'object');
        assert.strictEqual(result[0].tag, 'div');
        assert.strictEqual(result[0].className, 'class class1');
        assert.strictEqual(result[1].tag, 'div');
        assert.strictEqual(result[1].className, 'class class2');
    });

    it('should find node with sibling selector', () => {
        const selector = 'div#id + .class';
        const vtree = addParents({
            tag: 'div',
            children: [
                { tag: 'span', id: 'id' },
                { tag: 'div', id: 'id' },
                { tag: 'h1', className: 'class' }
            ]
        });

        const result = querySelector(selector, vtree);

        assert.strictEqual(result.length, 1);
        assert.strictEqual(typeof result[0], 'object');
        assert.strictEqual(result[0].tag, 'h1');
        assert.strictEqual(result[0].className, 'class');
    });

    it('should not match node if not next sibling', () => {
        const selector = 'div#id + h1.class';
        const vtree = addParents({
            tag: 'div',
            children: [
                { tag: 'span', id: 'id' },
                { tag: 'div', id: 'id' },
                { tag: 'div', className: 'class' },
                { tag: 'h1', className: 'class' }
            ]
        });

        const result = querySelector(selector, vtree);

        assert.strictEqual(result.length, 0);
    });

    it('should find node with sibling selector', () => {
        const selector = 'div#id ~ h1.class';
        const vtree = addParents({
            tag: 'div',
            children: [
                { tag: 'span', id: 'id' },
                { tag: 'div', id: 'id' },
                undefined,
                { tag: 'div', className: 'class' },
                null,
                { tag: 'h1', className: 'class' }
            ]
        });

        const result = querySelector(selector, vtree);

        assert.strictEqual(result.length, 1);
        assert.strictEqual(typeof result[0], 'object');
        assert.strictEqual(result[0].tag, 'h1');
        assert.strictEqual(result[0].className, 'class');
    });
});
