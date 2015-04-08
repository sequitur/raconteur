# Undularity

Undularity is a wrapper library for Undum which provides a lot of commonly-used functionality inspired by common Twine extensions, such as replacer/inserter links. It also provides a new API for Undum, with a DSL-like syntax that is especially suitable to be used with CoffeeScript or ES6.

Undularity is still a work in progress.

## Code example

Defining a situation in Undularity using ES6:

```es6
situation('undularity_example', {
  content: `
  This is an example situation using Undularity's API. It supports Markdown
  in text, and helper functions to add 
  ${a().class('segue').content('links').toSituation('another_situation')}
  more easily.
  `});
```

Or with CoffeeScript:

```coffeescript
situation 'undularity_example',
  content: """
  This is an example of a situation using Undularity's API. It supports Markdown
  in text, and helper functions to add
  #{a().class('segue').content('links').toSituation('another_situation')}
  more easily.
  """
# The link will render as:
# <a class="segue" href="another_situation">links</a>
```
