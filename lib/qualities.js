'use strict'

/*
  Quality definition function

  Meant to be called only once in the main story source file, this definition
  is passed a spec to define qualities. The spec is an object containing quality
  groups as objects, which contain qualities that themselves hold definitions.
*/

var situation = require('./situation.js');
situation.exportUndum();

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

module.exports = qualities;