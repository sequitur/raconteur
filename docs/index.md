# Raconteur

Raconteur makes writing interactive hypertext fiction with Undum straightforward and perphaps even fun. Raconteur however is only a wrapper layer on top of the Undum hypertext fiction engine; for this reason, this documentation will include references to Undum API features as well. Feel free to consult the [Undum documentation](https://idmillington.github.io/undum/doc/index.html) itself.

**This is version 1 of this documentation, updated on September 30th, 2015.**

## A Note about code examples

Since Raconteur began its life as a library for writing Undum stories using CoffeeScript, code examples in this document will be doubled: A CoffeeScript example, and then a JavaScript example, always in that order. Both will always be equivalent.

## A Note on the Undum API and CommonJS

Raconteur is supposed to use a commonjs-compliant version of Undum that can be instantiated with `require()´. Undum-commonjs is currently maintained in a separate [github repository](https://github.com/sequitur/undum)

```coffeescript
situation = require('raconteur/lib/situation.js')
```

```javascript
var situation = require('raconteur/lib/situation.js');
```

JQuery is also used as a CommonJS module, so if you intend to call JQuery directly in your story, you'll need to require it:

```coffeescript
$ = require('jquery');
```
```javascript
var $ = require('jquery');
```

## A Note about the scaffold

Raconteur is an independent comonjs module, currently installed directly from a github repository due to its experimental status. However, to make it easier and simpler to set up a new project, a [scaffold] is supplied which has all the files to use Raconteur with Coffeescript, Less, and a build system.

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
[scaffold]: https://github.com/sequitur/raconteur-scaffold