var situation = require('../lib/undularity.js'),
    $ = require('jquery'),
    undum = require('../lib/undum.js');

var a = situation.a;

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
    `This property of this situation is outputted by a function, which allows
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
  ${a().content('writer').once.writer('writerlink')} links.

  Also notable are ${a().id('replacer-link').content('replacer').replacer('replacer-link')}
  links, which replace the content of a given id.
  `,
  writers: {
    writerlink: "Writer links can only be clicked once.",
    'replacer-link': "switching"
  },
  tags: ['testing-option']
});

$(function(){undum.begin()});