import { createMatches } from '../src/index';

import { VNode, options } from './vnode';

const assert = require('assert');

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
});
