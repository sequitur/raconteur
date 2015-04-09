var undum = require('./undum.js'),
    md = require('markdown-it'),
    $ = require('jquery');

/* ---------------------------------------------------------------------------
  Undularity is a rethought API for Undum, featuring more usable interfaces
  which coalesce as a DSL for defining Undum stories.
----------------------------------------------------------------------------*/

/* ---------------------------------------------------------------------------
  Helper functions
----------------------------------------------------------------------------*/

/*
  Normalises the whitespace on a string. So the indentation level of the
  first line will become 0. FIXME: This isn't quite ideal. Need to figure out
  a better way of preventing strings in source code ending up interpreted as
  <pre> blocks.
*/

String.prototype.normaliseTabs = function () {
  let lines = this.split('\n');
  let indent = lines[0].match(/^\s+/) || lines[1].match(/^\s+/);
  if (!indent) return this;
  return lines.map( s => s.replace(new RegExp('^' + indent), '')).join('\n');
};

/* Agnostic Call */
/*
  Many properties in Undularity can be either a String, or a function that
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
  
  The prototype UndularitySituation is the basic spec for situations
  created with Undularity. It should be able to handle any use case for Undum.

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

var UndularitySituation = function (spec) {
  undum.Situation.call(this, spec);

  // Add all properties of the spec to the object, indiscriminately.
  Object.keys(spec).forEach( key => {
    if (this[key] === undefined) {
      this[key] = spec[key];
    }
  });

  this.visited = 0;

};

UndularitySituation.inherits(undum.Situation);

/*
  Undum calls Situation.enter every time a situation is entered, and
  passes it three arguments; The character object, the system object,
  and a string referencing the previous situation, or null if there is
  none (ie, for the starting situation).

  Undularity's version of enter is set up to fulfill most use cases.
*/

UndularitySituation.prototype.enter = function (character, system, f) {

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

  Undularity's version of act() is set up to implement commonly used
  functionality: "writer" links, "replacer" links, "inserter" links, and
  generic "action" links that call functions which access the underlying
  Undum API.
*/

UndularitySituation.prototype.act = function (character, system, action) {
  console.log("Act called with action ", action);
  var actionClass,
      self = this;

  var responses = {
    writer: function (ref) {
      system.write(
        markdown.render(
          self.writers[ref].fcall(self, character, system, action)
        ).fade());
    },
    replacer: function (ref) {
      system.replaceWith(
        markdown.renderInline(
          self.writers[ref].fcall(self, character, system, action)
        ).spanWrap().fade(), `#${ref}`);
    },
    inserter: function (ref) {
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

/* Element Helpers */
/*
  While you can write HTML elements by hand, those helpers make it easier to
  place anchors (especially with special purpose) and spans.

  They define a monadic interface:

  a().id('my-link').content('link').writer('my-ref')
    -> <a id="my-link" href="./_writer_my-ref">link</a>

  span().here -> <span></span>
*/

/* Anchor element */
/* Transforms:
  content: The inner content of the link, as inline Markdown.
  id: A space-separated list of element ids.
  once: The 'once' special link class. A getter.
*/


var a = function () {
  var once = "",
      id = "",
      content = "";
  var monad = {
    writer: (ref) =>
      `<a ${id} class="${once} writer" href="./_writer_${ref}">${markdown.renderInline(content)}</a>`,
    replacer: (ref) =>
      `<a ${id} class="${once} replacer" href="./_replacer_${ref}">${markdown.renderInline(content)}</a>`,
    inserter: (ref) =>
      `<a ${id} class="${once} inserter" href="./_inserter_${ref}">${markdown.renderInline(content)}</a>`,
    action: (ref) =>
      `<a ${id} class="${once}" href="./${ref}">${markdown.renderInline(content)}</a>`,
    external: (href) =>
      `<a ${id} href="${ref}">${markdown.renderInline(content)}</a>`,
    content: function (s) { content = s; return monad; },
    id: function (s) {id = `id="${s}"`; return monad; },
    get once () { once = "once"; return monad; }
  };
  return monad;
};

var span = function (content) {
  var elementClass = "",
      id = "",
      content = "";
  var monad = {
    get here () { return `<span ${id} ${elementClass}>${content}</span>`; },
    id: function (s) {
      id = `id="${s}"`;
      return monad;
    },
    content: function (s) {
      content = s;
      return monad;
    },
    class: function (s) {
      elementClass = `class="${s}"`;
      return monad;
    }
  };
  return monad;
}

/*
  Quality definition function

  Meant to be called only once in the main story source file, this definition
  is passed a spec to define qualities. The spec is an object containing quality
  groups as objects, which contain qualities that themselves hold definitions.
*/

var qualities = function (spec) {
  Object.keys(spec).forEach(function(group) {
    /* The special "name" and "options" properties are passed on. */
    var groupName = (spec[group].name === undefined) ? null : spec[group].name;
    var groupOpts = (spec[group].options === undefined) ? {} : spec[group].options;
    undum.game.qualityGroups[group] = new undum.QualityGroup(groupName, groupOpts);
    Object.keys(spec[group]).forEach(function(quality) {
      if (quality === "name" || quality === "options") return;
      undum.game.qualities[quality] = spec[group][quality](group);
    });
  });
};

var qualityShim = {
  integer: "IntegerQuality",
  nonZeroInteger: "NonZeroIntegerQuality",
  numeric: "NumericQuality",
  fudgeAdjectives: "FudgeAdjectivesQuality",
  onOff: "OnOffQuality",
  yesNo: "YesNoQuality"
};

Object.keys(qualityShim).forEach(function (key) {
  qualities[key] = function (title, spec={}) {
    return function (group) {
      spec.group = group;
      return new undum[qualityShim[key]](title, spec);
    };
  };
});

/*
  WordScaleQuality has a different interface (naughty!) so it has to be
  defined by hand.
*/

qualities.wordScale = function (title, words, spec={}) {
  return function (group) {
    spec.group = group;
    return new undum.WordScaleQuality(title, words, spec);
  };
};

module.exports = function (name, spec) {
  spec.name = name;
  undum.game.situations[name] = new UndularitySituation(spec);
};

module.exports.a = a;
module.exports.span = span;

module.exports.qualities = qualities;