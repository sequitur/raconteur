# situation.js

This is the core module that Raconteur is built around, a version of Undum's Situation prototype (RaconteurSituation) that is advanced enough for the most complex use cases, but straightforward enough to be used in the simplest cases.

RaconteurSituation's core features:

- Support for markdown throughout, using the fast markdown-it parser.
- Built-in support for the most common types of hypertext interactions: Inserting text, replacing text, adding text, and binding custom actions to hyperlinks.
- `content` among other properties can be defined as either a string, or a function that returns a string. This makes it very easy to refactor simple situations with static text into complex situations with dynamic text.

# Exports

## situation(name, spec)

```coffeescript
situation = require('raconteur/situation.js')
```
```javascript
var situation = require('raconteur/situation.js');
```

`situation()` is the root export of this module, and the only directly exposed method. It takes a name for the situation and an object specification, and then builds a RaconteurSituation object *and adds it to undum.game.situations.* This is not a true constructor, but rather a function that adds a situation to your game according to a given specification.

### name :: String

The situation's canonical name, equivalent to `undum.Situation#name`. This name is used to refer to the situation in other situations, in their `choices` property, for example, or in direct links.

Name strings should only contain valid URL characters. It's recommended that they contain no spaces or punctuation other than `_`.

### spec :: Object

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

A list of situation names and/or tags, used by Undum to construct a list of choices for a situation. This list of choices is the last thing outputted when a situation is entered, after `after()` is called.

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

### tags :: Array (from undum.Situation)

A list of tags. See Undum documentation.

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