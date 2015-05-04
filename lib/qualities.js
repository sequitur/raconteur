/*
qualities.js

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

/*
  Quality definition function

  Meant to be called only once in the main story source file, this definition
  is passed a spec to define qualities. The spec is an object containing quality
  groups as objects, which contain qualities that themselves hold definitions.
*/

var undum = require('undum-commonjs');

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

/* 
  For each Undum quality constructor, we define a special factory-like function
  that returns a closure which takes the name of a quality group and returns
  a quality with its group property set to that quality group.
*/
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

/*
  Creates a valid factory similar to the ones created by by the shim above.
  Takes a quality constructor as an argument and returns a factory. */
qualities.create = function (constructor) {
  return function (...args) {
    return function (group) {
      var quality = Object.create(constructor.prototype);
      constructor.apply(quality, args);
      quality.group = group;
      return quality;
    };
  };
};

/*
  Creates a closure similar to the one returned by the factories above,
  using the specified quality. */
qualities.use = function (constructor, ...args) {
  return function (group) {
    var quality = Object.create(constructor.prototype);
    constructor.apply(quality, args);
    quality.group = group;
    return quality;
  };
};

module.exports = qualities;