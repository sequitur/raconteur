/*
situation.js

Copyright (c) 2015 Bruno Dias

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
*/

'use strict'

var undum = require('undum-commonjs'),
    md = require('markdown-it'),
    $ = require('jquery');

/* ---------------------------------------------------------------------------
  Raconteur is a rethought API for Undum, featuring more usable interfaces
  which coalesce as a DSL for defining Undum stories.
----------------------------------------------------------------------------*/

/* ---------------------------------------------------------------------------
  situation.js

  Raconteur's core, defines a new Situation prototype.
*/

/* ---------------------------------------------------------------------------
  Helper functions
----------------------------------------------------------------------------*/

/*
  Normalises the whitespace on a string.

  1. Disregard empty lines
  2. Find the indent (leading whitespace) of each line
  3. Figure out the bottom indentation level (Ie, smallest indent). An empty
     string is a valid "0 indentation"
  4. Strip that much indentation out of each line, so that the bottom
     level is now 0 indentation.

  This is done so that multiline strings in code can be indented along with
  (And in fact one level deeper than) the surrounding code, for programmer
  convenience, without all of the code being parsed by markdown-it as a giant
  <pre> block.

  Note that tabs and spaces are both counted as one character, which is too
  bad for the guy mixing them.
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
  situation) and returns a String. Or in Haskellese:

  String | (CharacterObject -> SystemObject -> SituationString -> String)

  fcall() (by analogy with fmap) is added to the prototypes of both String and
  Function to handle these situations. When called on a Function, it's an
  alias for Function#call(); when called on a String, it only returns the
  string itself, discarding any input.
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

  FIXME: This is not necessarily the best approach.
*/

String.prototype.spanWrap = function () {
  return `<span>${this}</span>`;
};

/*
  Adds the "fade" class to a htmlString.

  FIXME: Currently this is an undocumented feature.
*/

String.prototype.fade = function () {
  return $(this).addClass('fade');
};

/* Situations ----------------------------------------------------------------
  
  The prototype RaconteurSituation is the basic spec for situations
  created with Raconteur. It should be able to handle any use case for Undum.
  This prototype is fairly complex; see the API documentation.

*/

var RaconteurSituation = function (spec) {
  undum.Situation.call(this, spec);

  // Add all own properties of the spec to the object, indiscriminately.
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
    let classes = this.classes ? ' ' + this.classes.join(' ') : '';
    let renderedContent = markdown.render(
      this.content.fcall(this, character, system, f).normaliseTabs());
    if (this.extendSection) {
      system.writeInto(renderedContent, '#current-situation');
    }
    else {
      $('#current-situation').removeAttr('id');
      let output = `<section id="current-situation" class="situation-${this.name}${classes}">\n${renderedContent}</section>`;
      system.write(output);
    }
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
      that = this;

  var responses = {
    writer: function (ref) {
      let content = that.writers[ref].fcall(that, character, system, action);
      let output = markdown.render(content).fade();
      system.writeInto(output, '#current-situation');
    },
    replacer: function (ref) {
      let content = that.writers[ref].fcall(that, character, system, action);
      let output = markdown.renderInline(content).spanWrap().fade();
      system.replaceWith(output, `#${ref}`);
    },
    inserter: function (ref) {
      let content = that.writers[ref].fcall(that, character, system, action);
      let output = markdown.renderInline(content).spanWrap().fade();
      system.writeInto(output, `#${ref}`);
    }
  };

  if (actionClass = action.match(/^_(\w+)_(.+)$/)) {
    // Matched a special action class
    let [responder, ref] = [actionClass[1], actionClass[2]]

    if(!that.writers.hasOwnProperty(actionClass[2])) {
      throw new Error(`Tried to call undefined writer: ${action}`);
    }
    responses[responder](ref);
  } else if (that.actions.hasOwnProperty(action)) {
    that.actions[action].call(that, character, system, action);
  } else {
    throw new Error(`Tried to call undefined action: ${action}`);
  }

};

module.exports = function (name, spec) {
  spec.name = name;
  return (undum.game.situations[name] = new RaconteurSituation(spec));
};