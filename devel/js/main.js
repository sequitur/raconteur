var situation = require('raconteur/situation.js'),
    $ = require('jquery'),
    oneOf = require('raconteur/oneOf.js'),
    elements = require('raconteur/elements.js'),
    qualities = require('raconteur/qualities.js'),
    racontest = require('raconteur/racontest.js'),
    undum = require('undum-commonjs');

var a = elements.a,
    span = elements.span;

undum.game.id = "my_game_id";
undum.game.version = "1.0";

situation('start', {
  content:
  `This is a testing situation for Raconteur, a better development system for Undum.

  Choose one of the options below to see the relevant content and test it.`,
  choices: ['#testing-option']
});

situation ('return', {
  content: 'Choose an option...',
  optionText: 'Return',
  choices: ['#testing-option']
});

situation('functions-as-properties', {
  content (character, system, from) {
    return `
    This property of this situation is outputted by a function, which allows
    us to incorporate variables such as the name of the situation we came
    from; in this case, "${from}."

    Raconteur allows most properties that are text to be defined as
    functions; the notable exception is optionText. Those functions are
    passed the character and system objects, in that order, and a third
    object that is usually either the current situation, or the situation
    we just came from.`},
  tags: ['testing-option'],
  optionText: 'Functions as properties',
  choices: ['return']
});

situation('markdown-features', {
  content: `
  # Markdown Support

  Raconteur uses Markdown for formatting the content of individual
  situations. Supported features include **strong** and *emphasis*,
  headers (as above), [external links](http://github.com), and even
  preformatted blocks of text:

      situation('start', {
        content: "This is an example."
      });
  
  Additionally, we also support "smart quotes" and -- dashes.`,
  tags: ['testing-option'],
  optionText: 'Markdown support',
  choices: ['return']
});

situation('special-links', {
  content: `
  # Special Links

  Raconteur supports various special types of links, starting with
  ${a('writer').class('once').writer('writerlink')} links.

  Also notable are ${a('replacer').id('replacer-link').replacer('replacer-link')}
  links, which replace the content of a given id.

  And finally, we have ${a('inserter').class("once").inserter('inserter-link')}
  links, which insert something into a specified element${span().id('inserter-link')}.
  `,
  writers: {
    writerlink: "Writer links can only be clicked once.",
    'replacer-link': "switching",
    'inserter-link': "-- like this"
  },
  tags: ['testing-option'],
  optionText: 'Special Links',
  choices: ['return']
});

situation('custom-actions', {
  content: `
  # Special Actions

  You can define actions with custom effects that access the underlying
  Undum API. Try clicking
  ${a('this link').action('specialaction')} for example.
  `,
  actions: {
    specialaction: function (character, system, from) {
      system.write(`
        <p>
          Custom actions access Undum directly. They also have access
          to the situation object itself, through <code>this</code>.
        </p>`);
    }
  },
  tags: ['testing-option'],
  optionText: 'Special Actions',
  choices: ['return']
});

situation('randomness', {
  content: (character, system, from) =>
    `
    # Randomness

    Randomness in Undum is best if you use Undum's own random number
    generator, which ensures consistency across save games. For example,
    try saving and reloading to verify that this list of animals remains
    in the same order:
    ${["dog", "cat", "alpaca", "crow"].shuffle(system).join(', ')}.
    `,
  tags: ['testing-option'],
  optionText: 'Randomness' ,
  choices: ['return']
});

var myIterators = {};

situation('iterators', {
  animal: oneOf('cat', 'crow', 'alpaca').cycling(),
  content (character, system, from) {
    return `
    # Iterators

    Iterators are an useful feature for generating adaptive text. For example,
    clicking ${a('this link').writer('iterator')} will output a
    new paragraph with a random animal.

    Initialising iterators during your init function will make them even more
    useful, since it lets you pass the system object on to them to ensure
    consistency between saves. For example, ${a('this link')
    .writer('consistent')} will produce the same output every
    time.

    Other iterators allow you to ${a('cycle').writer('cycler')} through
    different content in ${a('various ways').writer('stopper')}.

    And finally, OneOf iterator objects can be used directly in situations:
    ${this.animal}.
    ` },
  writers: {
    iterator: oneOf('Cat', 'Dog', 'Crow', 'Alpaca').randomly(),
    consistent () { return myIterators.consistentIterator(); },
    cycler: oneOf('Spring', 'Summer', 'Fall', 'Winter').cycling(),
    stopper: oneOf('First click', 'Second click', 'Another click').stopping()
  },
  tags: ['testing-option'],
  optionText: 'Iterators',
  choices: ['return']
});

situation('progress-bar', {
  before (character, system, from) {
    system.animateQuality('intelligence', character.qualities.intelligence + 1);
  },
  content: `
    # Progress Bars

    Progress bars and other underlying Undum features are still accessible
    through Undum's own API.
    `,
  tags: ['testing-option'],
  optionText: 'Progress bars',
  choices: ['return']
});

situation('continuation', {
  content: `
    # Continuation and Sections

    Each situation is output to the screen as its own section. You can
    go to [the next situation](continuation-continue) to see a situation
    that adds to the existing section, instead of writing a new one.
    `,
  optionText: 'Continuations and Sections',
  tags: ['testing-option'],
  classes: ['styled-situation']
});

situation ('continuation-continue', {
  content: `
    This feature allows situations to be individually styled. The \`classes\`
    attribute of a situation controls additional classes to be added to the
    section.
    `,
  continueSection: true,
  choices: ['return']
});

/*
  Custom quality definition. We make a constructor for an object that supplies
  the QualityDefinition interface Undum expects, and then pass that to
  qualities.create() to get a factory.
*/

var DifficultyQuality = function (title, threshold) {
  undum.QualityDefinition.call(this, title);
  this.threshold = threshold;
};

DifficultyQuality.prototype.format = function (character, value) {
  if (value > this.threshold) return "hard";
  return "easy";
};

var difficulty = qualities.create(DifficultyQuality);

qualities({
  stats: {
    name: 'Statistics',
    perception: qualities.integer("Perception"),
    intelligence: qualities.integer("Intelligence"),
    size: qualities.fudgeAdjectives("Size")
  },
  settings: {
    name: 'Settings',
    combatDifficulty: difficulty("Combat", 5),
    puzzleDifficulty: qualities.use(DifficultyQuality, "Puzzles", 3)
  }
});

undum.game.init = function (character, system) {
  racontest.init(system);
  character.qualities.intelligence = 10;
  character.qualities.perception = 10;
  character.qualities.size = 1;
  character.qualities.combatDifficulty = 6;
  character.qualities.puzzleDifficulty = 2;
  myIterators.consistentIterator =
    oneOf('Blue', 'Black', 'Green', 'Red', 'White')
    .inRandomOrder(system);
};

$(function(){undum.begin()});