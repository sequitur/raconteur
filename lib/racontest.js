/*
racontest.js

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

/* Testing Utilities

Creates an interface for testing/debugging the game. Usage:

  var racontest = require('raconteur/lib/racontest.js');

  // Inside undum.game.init

  racontest.init(system);

racontest.init does nothing unless location.hash is "#debug", so to access it
you should point your browser at [address, most likely localhost]#debug. Those
two lines can then safely be removed from the source to bundle a smaller
distribution for players.

Currently, the only implemented feature is the ability to hop to an arbitrary
situation by inputting its (internal) name. Due to Undum's own architecture,
trying to hop to the wrong situation will cause an (unrecoverable) error.
*/

'use strict';

var $ = require('jquery');

var RACONTEST_TEMPLATE = `
<div id="debug_interface">
  <form id="situation_hop">
    <p>
    <label for="hop_target">Go to situation</label>
    <input type="text" id="hop_target" name="hop_target" />
    </p>
    <input type="submit" id="submit_hop" name="submit_hop" />
  </form>
</div>
`;

var init = function (system) {
  if (location.hash !== '#debug') return;
  $('body').append(RACONTEST_TEMPLATE)
  $('#situation_hop').submit(function (event) {
    event.preventDefault();
    /*
      While I could have a try/catch block here, it would be useless; the
      assertionError thrown from going to a nonexistant situation can be
      caught, but Undum breaks anyway.
    */
    system.doLink($('#hop_target').val())
  });
};

module.exports.init = init;