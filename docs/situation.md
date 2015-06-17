# situation.js

This is the core module that Raconteur is built around, a version of Undum's Situation prototype (RaconteurSituation) that is advanced enough for the most complex use cases, but straightforward enough to be used in the simplest cases.

RaconteurSituation's core features:

- Support for markdown throughout, using the fast markdown-it parser.
- Built-in support for the most common types of hypertext interactions: Inserting text, replacing text, adding text, and binding custom actions to hyperlinks.
- `content` among other properties can be defined as either a string, or a function that returns a string. This makes it very easy to refactor simple situations with static text into complex situations with dynamic text.

## current-situation and sections

Raconteur creates the `content` from each new situation as a new `<section>` element on the page. This enables situations to be styled, but it's important to note that Raconteur also relies on tracking which of those sections has the `#current-situation` id; whenever a new situation with content is entered, that id is applied to that situation's section and stripped from all others.

Writing into this element is useful for adding content just before the options list, and it's also the default behaviour of Raconteur writers. This does mean that if you are using Undum's low-level API to write to the end of the content spool, you probably want to use `system.writeInto()` to write inside the current situation.

# Exports

## situation(name, spec)

```coffeescript
situation = require('raconteur/situation.js')
```
```javascript
var situation = require('raconteur/situation.js');
```

`situation()` is the root export of this module, and the only directly exposed method. It takes a name for the situation and an object specification, and then builds a RaconteurSituation object *and adds it to undum.game.situations.* This is not a true constructor, but rather a function that adds a situation to your game according to a given specification.

### name

The situation's canonical name, equivalent to `undum.Situation#name`. This string identifier is used to refer to the situation in other situations, in their `choices` property, for example, or in direct links.

Name strings should only contain valid URL characters. It's recommended that they contain no spaces or punctuation other than `_`.

### spec

An object describing the situation to be created. Every own property of this object will be added to the situation object created, allowing you to add arbitrary properties for your own purposes.

## RaconteurSituation properties

The following properties have special meaning to Raconteur. None of them are mandatory, however.

### actions :: Object

Whenever an Undum action link (A link with a href starting with './') is called, its href is passed to the current situation's `act()` method. RaconteurSituation provides an advanced version of the `act()` method that anticipates a lot of the common needs of Undum authors. Actions named with a special prefix (`_writer_`, `_inserter_`, or `_replacer_`) have special behaviour and are handled by the `writers` property; all other actions are routed to the `actions` property of the situation.

This property is an object containing key-value pairs. The key is the action's reference name; the value is a function. So for example:

```html
<a href="./my_action">Click here.</a>
```

Clicking that link will cause `RaconteurSituation.prototype.act()` to be called. It will then look for a method in the current situation called `actions.my_action`, and call it, passing it three arguments: The Undum Character object, the Undum System object, and the name of the action itself. This custom action can then call Undum's own API methods such as `system.write()` and `character.setQuality()` to affect the game state. 

### before, after :: Function

`before()` and `after()`, if present, are called when the situation is entered, before and after the situation's content (if any) is printed. They're passed three arguments:

- *character*: The Undum Character object (see Undum documentation)
- *system*: The Undum System object (see Undum documentation)
- *from*: The String name of the previous situation

The return value from those functions is discarded. They're intended to be used as a convenient place to put initialisation or side effects, such as setting character qualities.

### choices :: Array

A list of situation names and/or tags, used by Undum to construct a list of choices for a situation. Tags should be prefixed with `#`. This list of choices is the last thing outputted when a situation is entered, after `after()` is called.

### classes :: Array

A list of classes that will be added to the `class` attribute of the `<section>` element wrapping the situation's content. If the situation has no content or if its `continueSection` property is truthy, this is disregarded.

The classes given are in addition to the `[situation name]-situation` class that is added to the section by default.

### extendSection :: Boolean

If this is a truthy value, instead of creating a new section, the `content` of this situation is appended to the end of the `#current-situation` section -- Normally, the section created by the previous situation. This can be useful if you want to use a section as a styled element and you want to expand it, for instance if you want to group some sections visually inside a box.

### content :: String or Function

The main content of the situation. When the situation is entered, `before()` is called as a method on the situation (if present); then `content()` is called, if present. If `content` is a String, it'll be parsed as markdown. If it's a function, it'll be passed the following arguments:

- *character*: The Undum Character object (see Undum documentation)
- *system*: The Undum System object (see Undum documentation)
- *from*: The String name of the previous situation

The output from the function is taken as a string to be parsed as markdown, and written out as content. Since `content` is agnostic about whether it holds a string or a function, it's very easy to change a situation with static text to one that holds a function to generate dynamic text.

```coffeescript
# Old situation with static content
  content: '''
    "Hello, Eric," said the mermaid.
  '''
# New situation with dynamic content
  content: (character) -> '''
    "Hello, #{character.qualities.name}," said the
    #{character.sandbox.monster}.
  '''
```
```es6
// Old situation with static content
  content: '"Hello, Eric," said the mermaid.'
// New situation with dynamic content
  content: (character) => `"Hello, ${character.qualities.name}," said the
    ${character.sandbox.monster}.`
```

Inside a content function, the value of `this` is bound to the situation object itself, allowing you to refer to properties of the situation.

#### A note about indentation

Markdown cares about indentation for things such as `<pre>` blocks and nested lists. However, we as programmers care about indentation to keep our code readable. As a compromise between the two, Raconteur will normalise indentation in content strings by doing the following:

- Finding the smallest level of indentation on a non-empty line;
- Stripping that level of indentation out of every line.

This means that if you write:

```javascript
`
  Lorem ipsum dolor sit amet.

    var foo = x;
`
```

Then Raconteur will normalise that to:

```markdown
Lorem ipsum dolor sit amet.

  var foo = x;
```

So that when this is parsed as markdown, the first line will be a paragraph and the second line will be a code block. If, for some reason, you need an entire situation's content to be a preformatted code block, you can use a fenced code block:

~~~markdown
```
This is a fenced code block.
```
~~~

### tags :: Array (from undum.Situation)

A list of tags, without a leading `#`. In a situation's `choices` list, other situations can be referred specifically by name, or in groups by tag.

### optionText :: String (from undum.Situation)

A string used when this situation is presented as an option when listing choices for another situation. See Undum documentation.

### visited :: Number

Every situation has this property set to 0 when it's created. It'll then be incremented by 1 every time the situation is entered. You can use this to check if a particular situation has been seen by the player, and how many times:

```javascript
undum.game.situations['my_situation'].visited
```

### writers :: Object

When a prefixed action link (One whose href starts with `_writer_`, `_inserter_`, or `_replacer_`) is called, RaconteurSituation will look for a corresponding key in this object.

```html
<a href="./_writer_hello">Hello!</a> <!-- Will call situation.writers.hello -->
```

The content of each property in `writers` is either a function (that returns a string), or a string. If it's a function, it will be passed three arguments: The Undum Character object, the Undum System object, and a string with the name of the action itself. The return value from that function will then be treated as a string; this is similar to the "function-agnostic" feature of the `content` property.

What is done with this string depends on the type of link.

- *Writer*: The string is parsed as Markdown and passed to `System#write`, so its content is written at the end of the story roll.
- *Replacer*: The string is parsed as inline markdown, and wrapped in `<span>` tags if necessary. The resulting html is then used to replace each DOM element with an id property equal to the action reference, if one exists.
- *Inserter*: The string is parsed as inline markdown, and wrapped in `<span>` tags if necessary. The resulting html is then inserted as the last child of each DOM element with an id property equal to the action reference, if one exists.