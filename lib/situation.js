var undum = require('undum-commonjs'),
    md = require('markdown-it'),
    $ = require('jquery');

/* ---------------------------------------------------------------------------
  Raconteur is a rethought API for Undum, featuring more usable interfaces
  which coalesce as a DSL for defining Undum stories.
----------------------------------------------------------------------------*/

/* ---------------------------------------------------------------------------
  Helper functions
----------------------------------------------------------------------------*/

/*
  Normalises the whitespace on a string.
*/

String.prototype.normaliseTabs = function () {
  var lines = this.split('\n');
  var indents = lines
    .filter((l) => l !== '') // Ignore empty lines
    .map((l) => l.match(/^\s+/))
    .map(function (m) {
      if (m === null) return '';
      return m[0];
    });
  var smallestIndent = indents.reduce(function(max, curr) {
    if (curr.length < max.length) return curr;
    return max;
  }); // Find the "bottom" indentation level
  return lines.map(function (l) {
    return l.replace(new RegExp('^' + smallestIndent), '');
  }).join('\n');
};

/* Agnostic Call */
/*
  Many properties in Raconteur can be either a String, or a function that
  takes some objects from the game state (character, system, and the current
  situation) and returns a String. Or in Haskell terms:
  String | (CharacterObject -> SystemObject -> SituationString -> String)

  fcall() is added to the prototypes of both String and Function to handle
  these situations. When called on a Function, it's an alias for
  Function#call(); when called on a String, it only returns the string itself,
  discarding any input.
*/

Function.prototype.fcall = Function.prototype.call;

String.prototype.fcall = function () {return this;};

/*
  Markdown renderer, defined with options.
*/

var markdown = new md({
  typographer: true, // Use smart quotes.
  html: true // Passthrough html.
});

/*
  Ensures a string is a HTML string, by wrapping it in span tags.
*/

String.prototype.spanWrap = function () {
  return `<span>${this}</span>`;
};

/*
  Adds the "fade" class to a htmlString.
*/

String.prototype.fade = function () {
  return $(this).addClass('fade');
};

/* Situations ----------------------------------------------------------------
  
  The prototype RaconteurSituation is the basic spec for situations
  created with Raconteur. It should be able to handle any use case for Undum.

  Properties:

    (In addition to properties inherited from undum.Situation)

    actions :: {key: (character, system, from) -> null}

    An object containing definitions for actions, which are called when an
    action without a special marker (writer, inserter, replacer) is called
    when the situation is current, usually by clicking an action link.

    after :: (character, system, from) -> null

    A function that is called right after printing the content of the
    situation. Useful for housekeeping tasks (Such as changing character
    stats) or implementing custom behaviour in general.

    before :: (character, system, from) -> null

    Similar to after, but called first 

    choices :: [String]

    A list of situation names and/or tags that can be listed as choices for
    this situation. That list will be further filtered by CanView and
    CanChoose.

    content :: markdownString | (character, system, from) -> markdownString

    The main content of the situation, printed when the situation is entered.

    visited :: Number

    Defaults to 0. Incremented every time the situation is entered.

    writers :: {key: markdownString | (character, system, from) -> markdownString}

    An object containing definitions for special actions called by inserter,
    writer, and replacer links. Note that the content of writer links will be
    interpreted as a regular markdownString, while the content of replacer
    and inserter links, on the assumption that it's meant to be written into
    an existing paragraph, will be interpreted as a inline markdown.

*/

var RaconteurSituation = function (spec) {
  undum.Situation.call(this, spec);

  // Add all properties of the spec to the object, indiscriminately.
  Object.keys(spec).forEach( key => {
    if (this[key] === undefined) {
      this[key] = spec[key];
    }
  });

  this.visited = 0;

};

RaconteurSituation.inherits(undum.Situation);

/*
  Undum calls Situation.enter every time a situation is entered, and
  passes it three arguments; The character object, the system object,
  and a string referencing the previous situation, or null if there is
  none (ie, for the starting situation).

  Raconteur's version of enter is set up to fulfill most use cases.
*/

RaconteurSituation.prototype.enter = function (character, system, f) {

  this.visited++;

  if (this.before) this.before(character, system, f);

  if (this.content) {
    system.write(
      markdown.render(
        this.content.fcall(this, character, system, f).normaliseTabs()));
  }

  if (this.after) this.after(character, system, f);

  if (this.choices) {
    let choices = system.getSituationIdChoices(this.choices,
      this.minChoices, this.maxChoices);
    system.writeChoices(choices);
  }
};

/*
  Situation.prototype.act() is called by Undum whenever an action link
  (Ie, a link that doesn't point at another situation or an external URL) is
  clicked.

  Raconteur's version of act() is set up to implement commonly used
  functionality: "writer" links, "replacer" links, "inserter" links, and
  generic "action" links that call functions which access the underlying
  Undum API.
*/

RaconteurSituation.prototype.act = function (character, system, action) {
  var actionClass,
      self = this;

  var responses = {
    writer: function (ref) {
      var beforeOpts = undefined;
      if (self.writers[ref] === undefined) {
        console.log(self);
        throw new Error("Tried to call undefined writer:" + ref);
      }
      if ($('.options')) {
        system.writeBefore(
          markdown.render(
            self.writers[ref].fcall(self, character, system, action))
            .fade(), '.options');
      } else {
        system.write(
          markdown.render(
            self.writers[ref].fcall(self, character, system, action)
          ).fade());
      }
    },
    replacer: function (ref) {
      if (self.writers[ref] === undefined) {
        throw new Error("Tried to call undefined replacer:" + ref);
      }
      system.replaceWith(
        markdown.renderInline(
          self.writers[ref].fcall(self, character, system, action)
        ).spanWrap().fade(), `#${ref}`);
    },
    inserter: function (ref) {
      if (self.writers[ref] === undefined) {
        throw new Error("Tried to call undefined inserter:" + ref);
      }
      system.writeInto(
        markdown.renderInline(
          self.writers[ref].fcall(self, character, system, action)
          ).spanWrap().fade(), `#${ref}`);
    }
  };

  if (actionClass = action.match(/^_(\w+)_(.+)$/)) {
    responses[actionClass[1]](actionClass[2]);
  } else if (self.actions.hasOwnProperty(action)) {
    self.actions[action].call(self, character, system, action);
  } else {
    throw new Err(`Action "${action}" attempted with no corresponding` +
      'action in current situation.');
  }

};


module.exports = function (name, spec) {
  spec.name = name;
  undum.game.situations[name] = new RaconteurSituation(spec);
};