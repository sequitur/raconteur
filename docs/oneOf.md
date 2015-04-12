# oneOf.js

This module implements a tool for generating adaptive text snippets. The syntax for using oneOf is:

```javascript
oneOf("foo", "bar", "baz").randomly()
```

## oneOf(...snippets) -> Object

Takes any number of arguments (at least one) and returns an Object with the following methods. This function is the top level export of this module.

Each one of those methods returns a closure which iterates over the arguments in some particular way. Those closures also have a special property: They supply a `toString()` method which is just equivalent ot `call()`. In practice, what this means is that you can treat them as either functions, or as values that stringify to a text snippet according to certain rules.

This means that you can use `oneOf` inline, inside strings, without parenthetising and calling it:

```coffeescript
"#{oneOf('dog', 'cat', 'alpaca').randomly()}"
"#{(oneOf('dog', 'cat', 'alpaca').randomly())()}" # Equivalent
```

However, keep in mind that this will create a new object each time, so it's only useful for randomising text; otherwise, it will behave as a totally new iterator each time.

### A note about initialisation

The methods that generate random text can optionally take an `undum.System` object as an argument. This object is passed into your code by Undum, and it contains a random number generator set up by Undum. This allows for random text to be consistently generated across different loads of the same saved game.

For this reason, text snippets with random variations should be initialised inside a function that has access to it, unless it is intentional that they should not be consistent across saves. This means that they should be created inside your `undum.game.init` function; creating them inside a situation's `content` function will not work as intended, since a new closure will be created every time the situation is entered.

# Object Methods

## cycling() -> Function

Returns a closure that iterates over the list and returns each one in order, going back to the first one when it runs out.

## stopping() -> Function

Returns a closure that iterates over the list and returns each one in order, then repeats the last item when it runs out.

## randomly(system) -> Function

Optionally takes an Undum `System` object as an argument. If one is provided, then random results will be consistent across saves.

Returns a closure that returns a random item of the list each time it's called. It will never return the same item twice in a row.

## trulyAtRandom(system) -> Function

Optionally takes an Undum `System` object as an argument. If one is provided, then random results will be consistent across saves.

Returns a closure that returns a random item of the list each time it's called. Unlike `randomly()`, this can return the same item twice in a row.

## inRandomOrder(system) -> Function

Optionally takes an Undum `System` object as an argument. If one is provided, then random results will be consistent across saves.

Returns a closure that returns the items of the list one at a time, in a random order. When it runs out, it goes back to the beginning of that random order.