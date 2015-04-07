var situation = require('../lib/undularity.js'),
    $ = require('jquery'),
    undum = require('../lib/undum.js');

undum.game.id = "my_game_id";
undum.game.version = "1.0";

situation('start', {
  content: `This is a -- "testing" situation.`
});

$(function(){undum.begin()});