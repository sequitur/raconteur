var undum = require('undum-commonjs'),
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
  var actionClass,
      self = this;

  var responses = {
    writer: function (ref) {
      if (self.writers[ref] === undefined) {
        console.log(self);
        throw new Error("Tried to call undefined writer:" + ref);
      }
      system.write(
        markdown.render(
          self.writers[ref].fcall(self, character, system, action)
        ).fade());
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

/* Element Helpers */
/*
  While you can write HTML elements by hand, those helpers make it easier to
  place anchors (especially with special purpose) and spans.

  They define a monadic interface:

  a.id('my-link').content('link').writer('my-ref')
    -> <a id="my-link" href="./_writer_my-ref">link</a>

  span -> <span></span>

  The object supplies a toString() method that outputs the tag. Element
  helpers are immutable, so theoretically this should be safe from side
  effects. This interface allows the safe definition of templates which
  can be used and modified at will, for instance:

  let mySpanClass = span.class('myclass'); // -> <span class="myclass"></span>
  mySpanClass.content("Hello!"); // -> <span class="myclass">Hello!</span>

  Methods on an elementHelper return a new elementHelper that inherits from
  itself. Since those objects (should be) immutable by being frozen when they
  are created, this is semantically equivalent to returning a copy but more
  efficient in terms

  Methods:
    class :: String -> elementHelper
      Returns a new elementHelper with the given class added.

    classes :: [String] -> elementHelper
      Returns a new elementHelper with the given classes.

    id :: String -> elementHelper
      Returns a new elementHelper with the given id.


*/


var elementHelper = function (element) {
  this.element = element;
  this._classes = [];
};

var elementSetterGen = function (prop) {
  return function (value) {
    return Object.freeze(Object.create(this, {
      [prop]: {value}
    }));
  };
};

elementHelper.prototype.classes = function (newClasses) {
  return Object.freeze(Object.create(this, {
    _classes: {
      value: newClasses
    }
  }));
};

elementHelper.prototype.class = function (newClass) {
  return this.classes(this._classes.concat(newClass));
};

elementHelper.prototype.id = elementSetterGen("_id");
elementHelper.prototype.type = elementSetterGen("_linkType");
elementHelper.prototype.content = elementSetterGen("_content");
elementHelper.prototype.ref = elementSetterGen("_ref");
elementHelper.prototype.url = elementHelper.prototype.ref;
elementHelper.prototype.situation = elementHelper.prototype.ref;
elementHelper.prototype.once = () => this.class('once');

var linkTypeGen = function (type) {
  return function (ref) {
    return this.type(type).ref(ref);
  }
};

elementHelper.prototype.writer = linkTypeGen("writer");
elementHelper.prototype.replacer = linkTypeGen("replacer");
elementHelper.prototype.inserter = linkTypeGen("inserter");
elementHelper.prototype.action = linkTypeGen("action");

elementHelper.prototype.toString = function () {
  var classes = "",
      classString = "",
      idString = "",
      hrefString= "",
      contentString = "";

  if (this._classes) {
    classes += this._classes.join(' ');
  }
  if (this._linkType) {
    classes += (' ' + this._linkType);
  }
  if (classes) {
    classString = ` class="${classes}"`;
  }

  if (this._id) {
    idString = ` id="${this._id}"`;
  }

  if (this.element === "a") {
    if (this._linkType) {
      if (this._linkType === "action") {
        hrefString = ` href="./${this._ref}"`;
      } else {
        hrefString = ` href="./_${this._linkType}_${this._ref}"`;
      }
    } else {
      hrefString = ` href="${this._ref}"`;
    }
  }

  if (this._content) {
    contentString = markdown.renderInline(this._content);
  }

  return `<${this.element}${classString}${idString}${hrefString}>${contentString}</${this.element}>`;
};

var a_proto = Object.freeze(new elementHelper("a"));
var span_proto = Object.freeze(new elementHelper("span"));

var a = function (content) {
  if (content) return a_proto.content(content);
  return a_proto;
};

var span = function (content) {
  if (content) return span_proto.content(content);
  return span_proto;
};

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