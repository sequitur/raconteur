# Design Philosophy

Raconteur is designed with the following principles in mind:

## Code should disappear when it doesn't matter

Unlike Twine, which enforces a clear separation between code and content, in an Undum story your code and content will be blended together in one file.

This is powerful: Instead of relying on macros, you always have the full power of a real programming language and its APIs to use anywhere. But it can also lead to a lot of boilerplate.

Raconteur's API is deisigned so that you can just write content. The DSL-like approach makes Raconteur source code written in CoffeeScript look like Twee or ChoiceScript files:

```coffeescript
situation 'west-of-house',
    content: """
    You are standing in an open field west of a [house], with a boarded up
    front door. A [forest] is to the west.
    """
```

Markdown is used throughout so that your prose doesn't get lost in html. As much as possible, we try to follow the lead of systems that have been built previously to produce adaptive text or functionality in interactive fiction, such as commonly-used Twine macros and Inform 7's adaptive text functionality.

## Interfaces should start simple and become complex as necessary

Undum provides two prototypes for situations: Situation, a barebones prototype that only implements those methods which Undum expects internally; and SimpleSituation, a simplified version of that which serves the purposes of situations with some static text and a few choices.

Raconteur provides a single prototype, RaconteurSituation, which is designed to scale up as situations become more complex. Changing a situation from one with static text to one with dynamic text is easy:

```coffeescript
situation 'west-of-house',
    content: () -> """
    You are standing in an open field west of a [house], with a boarded up
    front door. A [forest] is to the west.

    #{getRoomContents(this)}
    """
```

Adding more functionality to a situation is strictly a matter of adding more properties to the situation's spec. Most writing is rewriting; Raconteur aims to make rewriting as straightforward as possible.