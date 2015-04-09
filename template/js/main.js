var situation = require('../lib/undularity.js'),
    $ = require('jquery'),
    undum = require('../lib/undum.js');

var a = situation.a,
    span = situation.span,
    qualities = situation.qualities;

undum.game.id = "my_game_id";
undum.game.version = "1.0";

situation('start', {
  content:
  `This is a testing situation for Undularity, a better development system for Undum.

  Choose one of the options below to see the relevant content and test it.`,
  choices: ['#testing-option']
});

situation('functions-as-properties', {
  content: (character, system, from) =>
    `
    This property of this situation is outputted by a function, which allows
    us to incorporate variables such as the name of the situation we came
    from; in this case, "${from}."

    Undularity allows most properties that are text to be defined as
    functions; the notable exception is optionText. Those functions are
    passed the character and system objects, in that order, and a third
    object that is usually either the current situation, or the situation
    we just came from.`,
  tags: ['testing-option'],
  optionText: 'Functions as properties'
});

situation('markdown-features', {
  content: `
  # Markdown Support

  Undularity uses Markdown for formatting the content of individual
  situations. Supported features include **strong** and *emphasis*,
  headers (as above), [external links](http://github.com), and even
  preformatted blocks of text:

    situation('start', {
      content: "This is an example."
    });
  
  Additionally, we also support "smart quotes" and -- dashes.`,
  tags: ['testing-option'],
  optionText: 'Markdown support'
});

situation('special-links', {
  content: `
  # Special Links

  Undularity supports various special types of links, starting with
  ${a.content('writer').class('once').writer('writerlink').tag()} links.

  Also notable are ${a.id('replacer-link').content('replacer').replacer('replacer-link').tag()}
  links, which replace the content of a given id.

  And finally, we have ${
    a.class("once").content('inserter').inserter('inserter-link').tag()
  } links, which insert something into a specified element${span.id('inserter-link').tag()}.
  `,
  writers: {
    writerlink: "Writer links can only be clicked once.",
    'replacer-link': "switching",
    'inserter-link': "-- like this"
  },
  tags: ['testing-option']
});

situation('custom-actions', {
  content: `
  # Special Actions

  You can define actions with custom effects that access the underlying
  Undum API. Try clicking
  ${a.content('this link').action('specialaction').tag()} for example.
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
  optionText: 'Special Actions'
});

qualities({
  stats: {
    name: 'Statistics',
    perception: qualities.integer("Perception"),
    intelligence: qualities.integer("Intelligence"),
    size: qualities.fudgeAdjectives("Size")
  }
});

undum.game.init = function (character, system) {
  character.qualities.intelligence = 10;
  character.qualities.perception = 10;
  character.qualities.size = 1;
};

$(function(){undum.begin()});