var undum = require('./undum.js'),
    marked = require('marked'),
    $ = require('jquery');

var markdown = function (content) {
  return marked(content, {smartypants: true});
}

var UndularitySituation = function (spec) {
  undum.Situation.call(this, spec);

  // API properties

  this.content = spec.content;
};

UndularitySituation.prototype.enter = function (character, system, from) {
  console.log("got here");
  console.log(this);

  if (this.content) {
    system.write(this.content);
  }
};

module.exports = function (name, spec) {
  spec.name = name;
  spec.content = markdown(spec.content);
  undum.game.situations[name] = new UndularitySituation(spec);
};

