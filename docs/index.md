# Raconteur

Raconteur makes writing interactive hypertext fiction with Undum straightforward and perphaps even fun. Raconteur however is only a wrapper layer on top of the Undum hypertext fiction engine; for this reason, this documentation will include references to Undum API features as well. Feel free to consult the [Undum documentation](http://undum.com/doc/index.html) itself.

## A Note about code examples

Since Raconteur began its life as a library for writing Undum stories using CoffeeScript, code examples in this document will be doubled: A CoffeeScript example, and then a JavaScript example, always in that order. Both will always be equivalent.

## A Note on the Undum API and CommonJS

Raconteur uses a modified version of Undum that complies with CommonJS practices: undum-commonjs. What this means is that, instead of exporting an API directly, Undum now works like a [Node.js] module. In practice, what this means is that instead of the global `undum` object that you had in vanilla undum, you now have to explicitly `require` it. Similarly, we are now using a CommonJS version of JQuery instead of loading JQuery separately in our html file:

```coffeescript
undum = require('undum-commonjs')
$ = require('jquery')
```

```javascript
var undum = require('undum-commonjs'),
    $ = require('jquery');
```

Using `$` as the name of the JQuery object is a convention and not mandatory. Similarly, `undum` can be anything.

## Raconteur Modules

Raconteur is made of several modules, which are imported separately under separate names. Each module is mostly single-purpose, and you can choose not to import all of them; either because you don't need the functionality, or because you'd rather use Undum's underlying API instead of Raconteur's.

The core modules are:

### situation.js

Provides an advanced version of Undum's Situation prototype, which covers both simple and complex use cases in one prototype, making it easy to change simple situations into complex ones with adaptive text or game logic.

### qualities.js

Provides a more intuitive syntax for defining qualities, allowing all of your story's qualities to be defined as a single object literal.

### elements.js

Provides a methodical syntax for defining html `<a>` and `<span>` elements. Useful for defining tag templates that can be freely reused and modified throughout the code, or simply as a more "native" syntax to specify links in your text.

### oneOf.js

Provides an adaptive text generation tool that mimics Inform 7's `[one of]` text generator syntax.

## Bundling

Raconteur is designed to be bundled with [Browserify]. Browserify will walk the dependency tree (Raconteur relies on undum-commonjs, [JQuery], and [markdown-it]), apply necessary transformations (Raconteur modules are written in ES6, a future version of JavaScript that has to be transpiled down to plain JavaScript), and bundle everything into a single file. This not only improves performance for the player (Since they only have to make one HTTP request to get all of the code) but it makes development  better overall.

[Node.js]: https://nodejs.org/
[Browserify]: http://browserify.org/
[markdown-it]: https://markdown-it.github.io/
[JQuery]: http://jquery.com/