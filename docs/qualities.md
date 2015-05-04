# qualities.js

This module provides an interface for setting up quality definitions in Undum. Essentially it takes a single plain object, and builds definition and groups from that object, exposing an API where quality definitions are members of group objects.

## Export

## qualities(Object spec) -> null

Creates the QualityDefinition and QualityGroup objects defined by the spec, and registers them in Undum. This is designed to be called only once from the story source file.

The spec object follows this interface:

```javascript
{
  quality_group: {
    name: "Quality Group",
    options: {},
    quality1: QualityFactory("Name"),
    quality2: QualityFactory("Name")
  }
}
```

Which is to say, it is a plain object; members of that plain object are quality groups. Each quality group object optionally supplies a `name` property and an `options` property. `name` is either a String (The title of the quality group, displayed as a heading in the game) or `null` (by default), indicating that no heading needs to be displayed. `options` is an options object for Undum's `QualityGroup` constructor; see Undum documentation.

Each other property of a group object is taken as a quality. identifiers for qualities should be unique across the whole game, not merely across groups, because this structure will be "flattened" later. To create a quality using this API, you use a factory rather than one of Undum's supplied constructors directly.

The following factories are provided as properties of `qualities`, and correspond to the following Undum constructors:

|Factory          |Constructor             |
|-----------------|------------------------|
|`integer`        |`IntegerQuality`        |
|`nonZeroInteger` |`NonZeroIntegerQuality` |
|`numeric`        |`NumericQuality`        |
|`fudgeAdjectives`|`FudgeAdjectivesQuality`|
|`onOff`          |`OnOffQuality`          |
|`yesNo`          |`YesNoQuality`          |
|`wordScale`      |`WordScaleQuality`      |

You can create your own factories by passing the constructor of a `QualityDefinition` implementation to `qualities.create()`. `qualities.use()` is a factory that takes a constructor as its first argument, and passes all other arguments on to that constructor, acting as a sort of shim.

## Extended Example

```coffeescript
# A QualityDefinition implementation constructor.
DifficultyQuality = (title, threshold) ->
  undum.QualityDefinition.call(this, title)
  this.threshold = threshold

DifficultyQuality.prototype.format = (character, value) ->
  if value > this.threshold then "hard" else "easy"

# Create a factory to use in our definition spec.
difficulty = qualities.create DifficultyQuality

# Give a specification of our quality definitions to the qualities()
# function.
qualities
  stats:
    name: 'Statistics'
    perception: qualities.integer("Perception")
    intelligence: qualities.integer("Intelligence")
    size: qualities.fudgeAdjectives("Size")
  settings:
    name: 'Settings'
    combatDifficulty: difficulty("Combat", 5) # Is equivalent to...
    puzzleDifficulty: qualities.use(DifficultyQuality, "Puzzles", 3)
```

```javascript
/* A QualityDefinition implementation constructor. */
var DifficultyQuality = function (title, threshold) {
  undum.QualityDefinition.call(this, title);
  this.threshold = threshold;
};

DifficultyQuality.prototype.format = function (character, value) {
  if (value > this.threshold) return "hard";
  return "easy";
};

/* Create a factory to use in our definition spec. */
var difficulty = qualities.create(DifficultyQuality);

/* Give a specification of our quality definitions to the qualities()
   function. */
qualities({
  stats: {
    name: 'Statistics',
    perception: qualities.integer("Perception"),
    intelligence: qualities.integer("Intelligence"),
    size: qualities.fudgeAdjectives("Size")
  },
  settings: {
    name: 'Settings',
    combatDifficulty: difficulty("Combat", 5), // Is equivalent to...
    puzzleDifficulty: qualities.use(DifficultyQuality, "Puzzles", 3)
  }
});

/* Remember that qualities have to have their initial value set in
undum.game.init()*/
```
