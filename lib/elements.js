/*
elements.js

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

const Markdown_It = require('markdown-it');

const markdown = new Markdown_It({
  typographer: true,
  html: true
});

function elementHelper (element) {
  this.element = element;
  this._classes = [];
}

function elementSetterGen (prop) {
  return function (value) {
    return Object.freeze(Object.create(this, {
      [prop]: {value}
    }));
  };
}

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
elementHelper.prototype.src = elementSetterGen("_src");
elementHelper.prototype.alt = elementSetterGen("_alt");

elementHelper.prototype.url = elementHelper.prototype.ref;
elementHelper.prototype.situation = elementHelper.prototype.ref;

elementHelper.prototype.once = function () {
  return this.class('once');
};

function linkTypeGen (type) {
  return function (ref) {
    return this.type(type).ref(ref);
  }
}

elementHelper.prototype.writer = linkTypeGen("writer");
elementHelper.prototype.replacer = linkTypeGen("replacer");
elementHelper.prototype.inserter = linkTypeGen("inserter");
elementHelper.prototype.action = linkTypeGen("action");

elementHelper.prototype.toString = function () {
  let classes = "",
      classString = "",
      idString = "",
      hrefString= "",
      contentString = "",
      srcString = "",
      altString = "";

  if (this._classes)
    classes += this._classes.join(' ');

  if (this._linkType)
    if (classes)
      classes += (` ${this._linkType}`);
    else
      classes = this._linkType;

  if (classes) classString = ` class="${classes}"`;
  if (this._id) idString = ` id="${this._id}"`;

  if (this.element === "a")
    if (this._linkType)
      if (this._linkType === "action")
        hrefString = ` href="./${this._ref}"`;
      else
        hrefString = ` href="./_${this._linkType}_${this._ref}"`;
    else
      hrefString = ` href="${this._ref}"`;

  if (this._src) srcString = ` src="${this._src}"`;
  if (this._alt) altString = ` alt="${this._alt}"`;

  if (this._content) contentString = markdown.renderInline(this._content);

  return `<${this.element}${classString}${idString}${hrefString}${srcString}${altString}>${contentString}</${this.element}>`;
};

const a_proto = Object.freeze(new elementHelper("a"));
const span_proto = Object.freeze(new elementHelper("span"));
const img_proto = Object.freeze(new elementHelper("img"));

function a (content) {
  if (content) return a_proto.content(content);
  return a_proto;
}

function span (content) {
  if (content) return span_proto.content(content);
  return span_proto;
}

function img (alt) {
  if (alt) return img_proto.alt(alt);
  return img_proto;
}

function element (tag) {
  return Object.freeze(new elementHelper(tag));
}

module.exports.a = a;
module.exports.span = span;
module.exports.img = img;
module.exports.element = element;
