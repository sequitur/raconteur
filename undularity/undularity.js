var undum = require('./undum.js'),
    md = require('markdown-it'),
    $ = require('jquery');

/*
  Helper functions
*/

/*
  Normalises the whitespace on a string. So the indentation level of the
  first line will become 0.
*/

String.prototype.normaliseTabs = function () {
  let lines = this.split('\n');
  let indent = lines[0].match(/^\s+/) || lines[1].match(/^\s/);
  if (!indent) return this;
  return lines.map( s => s.replace('^' + indent[0], '')).join('\n');
};

/* Agnostic Call */

Function.prototype.fcall = Function.prototype.call;

String.prototype.fcall = function () {return this;};

/*
  Markdown renderer.
*/

var markdown = new md({
  typographer: true,
  html: true
});

/*
  Ensures a string is a HTML string, by wrapping span tags.
*/

String.prototype.spanWrap = function () {
  return `<span>${this}</span>`;
};

/*
  Adds the "fade" class to some html.
*/

String.prototype.fade = function () {
  return $(this).addClass('fade');
};

var UndularitySituation = function (spec) {
  undum.Situation.call(this, spec);

  // API properties

  this.content = spec.content;
  this.choices = (spec.choices === undefined) ? [] : spec.choices;
  this.writers = (spec.writers === undefined) ? {} : spec.writers;

  this.visited = false;

};

UndularitySituation.inherits(undum.Situation);

UndularitySituation.prototype.enter = function (character, system, f) {
  if (this.content) {
    system.write(markdown.render(this.content.fcall(this, character, system, f).normaliseTabs()));
  }

  if (this.choices) {
    let choices = system.getSituationIdChoices(this.choices,
      this.minChoices, this.maxChoices);
    system.writeChoices(choices);
  }
};

UndularitySituation.prototype.act = function (character, system, action) {
  var actionClass,
      self = this;

  var responses = {
    writer: function (ref) {
      system.write(
        markdown.render(
          self.writers[ref].fcall(this, character, system, action)
        ).fade());
    },
    replacer: function (ref) {
      console.log('Replacer called ', ref);
      system.replaceWith(
        markdown.renderInline(
          self.writers[ref].fcall(this, character, system, action)
        ).spanWrap().fade(), `#${ref}`);
    }
  };

  if (actionClass = action.match(/^_(\w+)_(.+)$/)) {
    responses[actionClass[1]](actionClass[2]);
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
    writer: (ref) => `<a ${id} class="${once} writer" href="./_writer_${ref}">${markdown.renderInline(content)}</a>`,
    replacer: (ref) => `<a ${id} class="${once} replacer" href="./_replacer_${ref}">${markdown.renderInline(content)}</a>`,
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

module.exports = function (name, spec) {
  spec.name = name;
  undum.game.situations[name] = new UndularitySituation(spec);
};

module.exports.a = a;