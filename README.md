# tree-selector
[![Build Status](https://travis-ci.org/jvanbruegge/tree-selector.svg?branch=master)](https://travis-ci.org/jvanbruegge/tree-selector) [![codecov](https://codecov.io/gh/jvanbruegge/tree-selector/branch/master/graph/badge.svg)](https://codecov.io/gh/jvanbruegge/tree-selector) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

build a matching or query function for CSS selectors for any nested object structure!

```js
import { createQuerySelector, createMatches } from 'tree-selector';

const options = {
    tag: n => n.tagName,
    contents: n => n.innerText,
    id: n => n.id,
    class: n => n.className,
    parent: n => n.parentElement,
    children: n => n.childNodes,
    attr: (n, attr) => n.getAttribute(attr)
};

const querySelector = createQuerySelector(options);
const matches = createMatches(options);

const selector = 'span.mySpan';
const element = document.getElementsByClassName('span')[0]

if(matches(selector, element)) {
  // there are elements matching the selector
} else {
  // no elements found
}

//Also possible, but less efficient
if(querySelector(selector, element).length > 0) {
    // there are elements found
}
```

# API

### createQuerySelector(options) -> querySelector

Configure `tree-selector` for the nested object structure you'll want to match against.

### createMatches(options) -> matches

Configure a `matches` function for a node in your tree structure. (This is used internally by `createQuerySelector`)

#### options

`options` are an object of lookup functions for queried nodes. You only need to provide the configuration necessary for the selectors you're planning on creating.
(If you're not going to use `#id` lookups, there's no need to provide the `id` lookup in your options.)

* `tag`: Extract tag information from a node for `div` style selectors.
* `contents`: Extract text information from a node, for `:contains(xxx)` selectors.
* `id`: Extract id for `#my_sweet_id` selectors.
* `class`: `.class_name`
* `parent`: Used for sibling selectors
* `children`: Used to traverse from a parent to its children for sibling selectors `div + span`, `a ~ p`.
* `attr`: Used to extract attribute information, for `[attr=thing]` style selectors.

## Supported pseudoclasses 

 - `:first-child`
 - `:last-child`
 - `:nth-child`
 - `:empty`
 - `:root`
 - `:contains(text)`

## Supported attribute lookups

 - `[attr=value]`: Exact match
 - `[attr]`: Attribute exists and is not false-y.
 - `[attr$=value]`: Attribute ends with value
 - `[attr^=value]`: Attribute starts with value
 - `[attr*=value]`: Attribute contains value
 - `[attr~=value]`: Attribute, split by whitespace, contains value.
 - `[attr|=value]`: Attribute, split by `-`, contains value.


