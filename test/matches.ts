import { createMatches } from '../src/matches';

const assert = require('assert');

interface VNode {
    tag?: string;
    className?: string;
    attributes?: any;
    children?: (string | VNode)[];
    contents?: string;
    id?: string;
}

const matches = createMatches<VNode>({
    tag: n => n.tag || '',
    className: n => n.className || '',
    attr: (n, attr) => n.attributes[attr] || '',
    children: n => n.children || [],
    contents: n => n.contents || '',
    id: n => n.id || ''
});

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
});
