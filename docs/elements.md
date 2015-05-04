# Elements

elements.js is the Raconteur module that defines an interface for generating HTML tags.

```javascript
a('Click here!').class('external_link').url('http://example.com/')
```

Raconteur doesn't prevent you from writing html tags in either pure html or Markdown:

```coffeescript
content: """
    <a href="example-situation">This is valid.</a>

    [This is too.](example-situation)
    """
```
```javascript
content: `
    <a href="example-situation">This is valid.</a>

    [This is too.](example-situation)
    `
```

However, element helpers have some advantages that make them useful:

Each element helper is an object that can be reused, allowing you to define and reuse custom element classes:

```coffeescript
blinky = (content) -> span(content).class('blink').class('pink')
sparkles = blinky(sparkles)
```
```javascript
var blinky = (content) => span(content).class('blink').class('pink');
var sparkles = blinky(sparkles);
```

Element helpers allow adding class or id attributers to html elements, which Markdown syntax doesn't support. They provide a native (Javascript or Coffeescript) syntax, so that for (some users) they may be more readable than writing HTML elements by hand. And they come with shorthand for defining Raconteur-style action links:

```javascript
a("foo").replacer("bar")
// Stringifies as <a class="replacer" href="./_replacer_bar">foo</a>
```

ElementHelper objects obey the following rules:

- They are immutable (frozen).
- All of the prototype's methods return a new, modified, frozen object the new object inherits from the old one, and so it supplies all of the same methods.
- They supply a `toString()` method that generates the html tag itself, using all of their data.

Because `toString()` is the method that JavaScript itself uses to coerce Objects into Strings, for example during string interpolation/concatenation, you usually don't have to explicitly call it; merely placing an ElementHelper object inside a template string will generate the tag, and this is the most common usage when placing links inside content, writer, and action properties of situations.

```coffeescript
"#{span('foo')}" # -> "<span>foo</span>"
```
```javascript
`${span('foo')}`
'' + span('foo')
span('foo').toString() // All evaluate to "<span>foo</span>"
```

Because of this interface, it's easy to define a set of defaults which can then be modified:

```coffeescript
elem = span('foo').class('glow').id('glowing_span')
# -> <span class="glow" id="glowing_span">foo</span>
elem.content('bar').id('bar_span')
# -> <span class="glow" id="bar_span">bar</span>
```

# Setter Methods

Every ElementHelper object supplies the following methods. All of them return a new, modified ElementHelper which inherits from the ElementHelper that the method was called on. ElementHelpers are immutable to make this safe; otherwise, an ElementHelper could have its data changed by alterations to another ElementHelper further up its prototype chain.

## alt(altText) -> ElementHelper

Returns a new ElementHelper with the given string as its `_alt` property. This property is used as the element's `alt` attribute.

## class(className) -> ElementHelper

Returns a new ElementHelper with the given String as an additional class. This method is *additive,* so it adds new classes to the element. To completely change the element's classes, use ElementHelper#Classes

## classes(classes) -> ElementHelper

Returns a new ElementHelper with the given Array as a list of classes. This shadows any previously defined classes. If you wanted to erase all of an element's classes, you could use `element.classes([])`.

## content(content) -> ElementHelper

Returns a new ElementHelper with the given content. "Content" here means the element's inner html, which will be parsed as inline markdown.

## id(idName) -> ElementHelper

Returns a new ElementHelper with the given id. This string is then used as the value of the element's `id` attribute.

## ref(url) -> ElementHelper

Returns a new ElementHelper with the given string as its `_ref` property. This property is used as the value of the element's `href` attribute.

## src(url) -> ElementHelper

Returns a new ElementHelper with the given string as its `_src` property. This property is used as the value of the element's `src` attribute.

## url(url) -> ElementHelper, situation(url) -> ElementHelper

Aliases for `ElementHelper#ref`, for legibility.

## once() -> ElementHelper

Returns a new ElementHelper with the `once` class added to it. This class has special meaning to Undum (once links stop being hyperlinks once clicked on). This method is shorthand for `class('once')`.

## type(linkType) -> ElementHelper

Returns a new ElementHelper with its `_linkType` property set to the given string. This property is used to integrate with Raconteur's special link types. When the ElementHelper is stringified, the `_linkType` property is added as a class to the link, and as a prefix to its href. So a link with a type of "writer" and a ref of "foo" will be written out with `href="./_writer_foo"`; when clicked, Raconteur will look for the current situation's `writers.foo` property.

If an ElementHelper's type is `action`, it will prefix the link's ref with `./` only.

It's possible to clear an element's `_linkType_` property by setting it to `null` or an empty string: `element.type(null)`.

## writer(), replacer(), inserter(), action() -> ElementHelper

All of those methods are shorthand for defining an ElementHelper for an action link.

```javascript
e.writer('foo')     // e.type('writer').ref('foo')
e.replacer('foo')   // e.type('replacer').ref('foo')
e.inserter('foo')   // e.type('inserter').ref('foo')
e.action('foo')     // e.type('action').ref('foo')
```

# Exports

`elements.js` exports the following methods:

## a(content) -> elementHelper

Returns a new `<a>` elementHelper object, with its content set to the argument.

## span(content) -> elementHelper

Returns a new `<span>` elementHelper object, with its content set to the argument.

## img(alt) -> elementHelper

Returns a new `<img>` elementHelper object, with its alt text set to the argument

## element(tag) -> elementHelper

Returns a new elementHelper object for the given tag. Usually, this can be called once to define your own custom element helpers:

```coffeescript
elements = require('raconteur/elements.js')
em = elements.element('em')
glow = (content) -> em.class('glow').content(content)
```

```javascript
var elements = require('raconteur/elements.js');
var em = elements.element('em');
var glow = function (content) { return em.class('glow').content(content); };
```
