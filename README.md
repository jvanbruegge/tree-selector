# tree-selector

build a matching function in CSS for any nested object structure!

```javascript
import { createQuerySelector } from 'tree-selector';

const querySelector = createQuerySelector({
    tag: n => n.tagName,
    contents: n => n.innerText,
    id: n => n.id,
    class: n => n.className,
    children: n => n.childNodes,
    attr: (n, attr) => n.getAttribute(attr)
})

const query = querySelector('body > #header .logo');
const element = document.getElementsByClassName('logo')[0]

if(query(element).length > 0) {
  // there are elements matching the selector
} else {
  // no elements found
}

//Also possible
if(querySelector('body > #header .logo', element).length > 0) {
    // there are elements found
}
```

# API

### createQuerySelector(options) -> querySelector factory

Configure `tree-selector` for the nested object structure you'll want to match against.

#### options

`options` are an object of lookup functions for queried nodes. You only need to provide the configuration necessary for the selectors you're planning on creating.
(If you're not going to use `#id` lookups, there's no need to provide the `id` lookup in your options.)

* `tag`: Extract tag information from a node for `div` style selectors.
* `contents`: Extract text information from a node, for `:contains(xxx)` selectors.
* `id`: Extract id for `#my_sweet_id` selectors.
* `class`: `.class_name`
* `children`: Used to traverse from a parent to its children for sibling selectors `div + span`, `a ~ p`.
* `attr`: Used to extract attribute information, for `[attr=thing]` style selectors.

## Supported pseudoclasses 

 - `:first-child`
 - `:last-child`
 - `:nth-child`
 - `:empty`
 - `:root`
 - `:contains(text)`
 - `:any(selector, selector, selector)`

## Supported attribute lookups

 - `[attr=value]`: Exact match
 - `[attr]`: Attribute exists and is not false-y.
 - `[attr$=value]`: Attribute ends with value
 - `[attr^=value]`: Attribute starts with value
 - `[attr*=value]`: Attribute contains value
 - `[attr~=value]`: Attribute, split by whitespace, contains value.
 - `[attr|=value]`: Attribute, split by `-`, contains value.


