# Raconteur

Raconteur makes writing interactive hypertext fiction with Undum straightforward and perhaps even fun. It's a wrapper library that bundles oft-needed functionality and a new, cleaner, CoffeeScript-friendly, DSL-inspired API for defining Undum stories.

```coffeescript
situation 'west_of_house',
  content: (character, system, from) -> 
    """
    # West of House

    You are standing in an open field west of a white house, with a boarded
    up front door.

    #{roomContents(character, system)}
    """
```

Raconteur is still in active development towards its 1.0 release.

## Implemented Features

- DSL-like syntax for defining situations.
- A powerful situation prototype that bundles a lot of commonly-used
  functionality.
- Shorthand for defining common hypertext interactions such as text
  replacement or insertion, similar to popular Twine extensions.
- Most properties of situations can be either functions or strings,
  making it easy to turn a simple situation into a complex one.
- An interface that is specifically designed to be used with ECMAScript 6 via
  Babel, or CoffeeScript.
- Markdown, rather than raw HTML, as the format for most text content using
  markdown-it.
- A tool bundle of iterators that makes it easy to define adaptive text
  snippets.
- Based on CommonJS principles (Using undum-commonjs), allowing all game code
  to be bundled using Browserify.
- An advanced game [template](http://github.com/sequitur/raconteur-scaffold/) that sets up a complete development environment for authors: A build system (gulp), CSS preprocessing (Less), and dependency management (Browserify + npm).

## Planned features

- A complete code refactoring of Undum and Raconteur itself with testability
  in mind, allowing the use of testing frameworks with Undum stories.

## Installation

Raconteur can be added as a dependency to a package.json file and installed from git. Or, you can use the [scaffold](http://github.com/sequitur/raconteur-scaffold).

Raconteur itself doesn't contain any command-line tools or anything that needs to be installed globally. You just need `npm` to be working on your system. Raconteur is a set of CommonJS modules designed to work with Browserify and a build system like Grunt or Gulp.

## Code examples

Those examples all use CoffeeScript.

Defining a simple situation in Raconteur:

```coffeescript
situation 'raconteur_example',
  content: """
  This is an example of a situation using Raconteur's API. It supports
  Markdown in text, so the content of a simple situation can just be
  written out without explicit HTML.
  """
```

Using text snippets:

```coffeescript

situation 'variations',
  content: (character, system) ->
    # content can be either a function or a simple string, transparently
    color = oneOf(['bright purple', 'sickly green', 'brilliant white'])
      .randomly(system) # We pass the system object so that random results
                        # will always be the same across different runs of
                        # the same saved game.

    """
      # Reflecting Pool
  
      You find yourself in an underground, flooded cave. Light shimmers on
      the walls, #{color}.
    """
```

## License

In short: You can use, modify, or redistribute Raconteur and Undum, for any
purpose, as long as this license document is kept with copies of it. See
LICENSE for legalese.

Undum is copyright (c) 2009-2015 I D Millington, and released under the MIT
license.

Raconteur itself is copyright (c) 2015 Bruno Dias, and released under the
same MIT license.
