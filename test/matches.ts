import * as assert from 'assert';
import { createMatches } from '../src/index';

import { VNode, options } from './vnode';
import { addParents } from './utils';

const matches = createMatches<VNode>(options);

describe('matches', () => {
    it('should match against a simple selector', () => {
        const testElement = {
            tag: 'div',
            className: 'foo bar baz'
        };

        assert.equal(matches('div.foo.bar', testElement), true);
    });

    it('should not match against a simple selector', () => {
        const testElement = {
            tag: 'div',
            className: 'foo bar baz'
        };

        assert.equal(matches('div.foo.buz', testElement), false);
    });

    it('should not match when class names overlap', () => {
        const testElement = {
            tag: 'div',
            className: 'nomatches'
        };

        assert.equal(matches('.matches', testElement), false);
    });

    it('should match against an attribute selector', () => {
        const testElement = {
            tag: 'div',
            className: 'foo bar baz',
            attributes: {
                test: 'foo',
                bar: 'buzjjjjjjj',
                zuz: 'bar loo goo'
            }
        };

        assert.equal(
            matches('[test="foo"][bar^="buz"][zuz~="loo"]', testElement),
            true
        );
    });

    it('should match against a falsy attribute selector', () => {
        const testElement = {
            tag: 'div',
            className: 'foo bar baz',
            attributes: {
                test: '',
                bar: false,
                zuz: 'bar loo goo'
            }
        };

        assert.equal(
            matches('[test][bar][zuz~="loo"]', testElement),
            true
        );
    });


    it('should not match against an attribute selector', () => {
        const testElement = {
            tag: 'div',
            className: 'foo bar baz',
            attributes: {
                test: 'foo',
                bar: 'buzjjjjjjj',
                zuz: 'bar loo goo'
            }
        };

        assert.equal(matches('div[bar="buz"][test="foo"]', testElement), false);
    });

    it('should match against an attribute selector with number', () => {
        const testElement = {
            tag: 'div',
            className: 'foo bar baz',
            attributes: {
                test: 'foo',
                bar: 'buzjjjjjjj',
                zuz: 1
            }
        };

        assert.equal(matches('div[zuz=1]', testElement), true);
    });

    it('should not match non-existant attributes', () => {
        const testElement = {
            tag: 'div',
            className: 'foo bar baz',
            attributes: {
                test: 'foo',
                bar: 'buzjjjjjjj',
                zuz: 'bar loo goo'
            }
        };

        assert.equal(matches('[far^="fee"]', testElement), false);
    });

    it('should throw with two ids', () => {
        const testElement = {
            tag: 'div',
            className: 'foo bar baz',
            attributes: {
                test: 'foo',
                bar: 'buzjjjjjjj',
                zuz: 'bar loo goo'
            }
        };

        assert.throws(
            () => matches('div#id#oooo', testElement),
            /Invalid selector, only one id is allowed/
        );
    });

    it('should throw when selector has a combinator', () => {
        const selector = 'div.class span#id';

        assert.throws(
            () => matches(selector, { tag: 'div' }),
            /matches can only process selectors that target a single element/
        );
    });

    it('should match simple pseudo selectors', () => {
        const vtree: any = addParents({
            tag: 'div',
            children: [
                { tag: 'div', id: 'first' },
                { tag: 'div', id: 'middle', contents: 'blabla' },
                { tag: 'div', id: 'last' }
            ]
        });

        assert(matches('div:first-child', vtree.children[0]));
        assert(matches('div:last-child', vtree.children[2]));
        assert(matches('div:empty', vtree.children[2]));
        assert(matches('div:root', vtree));
        assert(matches('div:contains("blabla")', vtree.children[1]));

        assert.strictEqual(
            matches('div:first-child', vtree.children[2]),
            false
        );
        assert.strictEqual(matches('div:last-child', vtree.children[0]), false);
        assert.strictEqual(matches('div:empty', vtree), false);
        assert.strictEqual(matches('div:root', vtree.children[0]), false);
        assert.strictEqual(
            matches('div:contains("blabla")', vtree.children[0]),
            false
        );
    });

    it('should match nth-child pseudo selectors', () => {
        const vtree: any = addParents({
            tag: 'div',
            children: [
                { tag: 'div', id: 'first' },
                { tag: 'div', className: 'middle', contents: '1' },
                { tag: 'div', className: 'middle', contents: '2' },
                { tag: 'div', className: 'middle', contents: '3' },
                { tag: 'div', className: 'middle', contents: '4' },
                { tag: 'div', className: 'middle', contents: '5' },
                { tag: 'div', id: 'last' }
            ]
        });

        assert(matches('div:nth-child(2n)', vtree.children[2]));
        assert(matches('div:nth-child(2n+1)', vtree.children[1]));
        assert(matches('div:nth-child(even)', vtree.children[0]));
        assert(matches('div:nth-child(odd)', vtree.children[1]));
        assert(matches('div:nth-child(3)', vtree.children[2]));
        assert(matches('div:nth-child(n+2)', vtree.children[4]));
        assert(matches('div:nth-child(-n+2)', vtree.children[1]));

        assert.strictEqual(
            matches('div:nth-child(2n)', vtree.children[1]),
            false
        );
        assert.strictEqual(
            matches('div:nth-child(2n+1)', vtree.children[0]),
            false
        );
        assert.strictEqual(
            matches('div:nth-child(even)', vtree.children[1]),
            false
        );
        assert.strictEqual(
            matches('div:nth-child(odd)', vtree.children[0]),
            false
        );
        assert.strictEqual(
            matches('div:nth-child(3)', vtree.children[0]),
            false
        );
        assert.strictEqual(
            matches('div:nth-child(n+2)', vtree.children[0]),
            false
        );
        assert.strictEqual(
            matches('div:nth-child(-n+2)', vtree.children[4]),
            false
        );
    });
});
