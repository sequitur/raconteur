/*eslint-env mocha */
/*eslint-disable prefer-arrow-callback */


const jsdom = require('mocha-jsdom');
const expect = require('chai').expect;

// Standard Raconteur page template
const DOCUMENT_BODY = require('./helpers/body.js')


describe('engine', function () {

  let engine, $; // Libraries we instantiate after the jsdom is up
  let results; // Simple container for test data.

  jsdom();

  before(function () {
    // Set up a document body DOM
    document.body.innerHTML = DOCUMENT_BODY;

    // Actually require the libraries we're testing; we do this because bad
    // things will happen if they wake up and don't see a DOM
    engine = require('../lib/engine.js');
    $ = require('jquery');

    //Set up some baseline content.

    engine.game.situations.start = new engine.SimpleSituation(
      `
        <p>This is a test situation.</p>
        <p><a href="second" id="second">Second</a></p>
      `
    );

    engine.game.situations.second = new engine.SimpleSituation(
      `
        <p>This is a second test situation.</p>
        <p><a href="complex" id="complex">Complex</a></p>
      `
    );

    engine.game.situations.complex = new engine.Situation({
      enter (character, system) {
        system.write(`
            <p>This is a complex situation with a custom spec.</p>
            <p><a href="./action" id="action">Action</a></p>
        `);
      },

      act (character, system, action) {
        results = action;
      }
    });

    $('#title').click();

  });

  it('starts normally', function () {
    expect(engine.begin).to.not.throw();
    expect($('#content').html()).to.match(
      /<p class="new">This is a test situation\.<\/p>/
    );
  });

  it('moves to another situation', function () {
    $('#second').click();

    expect($('#content').html()).to.match(
      /second test situation/
    );

  });

  it('exposes the system API', function () {
    $('#complex').click();

    expect($('#content').html()).to.match(
      /complex situation with a custom spec/
    );
  });

  it('responds to actions', function () {
    $('#action').click();

    expect(results).to.equal('action');
  });
});
