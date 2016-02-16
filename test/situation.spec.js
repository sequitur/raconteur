const jsdom = require('mocha-jsdom');
const expect = require('chai').expect;

// Standard Raconteur page template
const DOCUMENT_BODY = require('./helpers/body.js')

describe('situation', function () {
  let engine, situation, $;
  jsdom();

  before(function () {
    engine = require('../lib/engine.js');
    situation = require('../lib/situation.js')
    $ = require('jquery');

    situation('start', {
      content: `
      testing situation
      `,
      choices: ['#testing-option']
    });

    situation('functions-as-properties', {
      content () {
        return `
          Properties can be functions.
        `
      },
      tags: ['testing-option'],
      optionText: 'functions-as-properties',
      choices: ['#testing-option']
    });

    situation('markdown-support', {
      content () {
        return `
          # Markdown Support
        `
      },
      tags: ['testing-option'],
      optionText: 'markdown support',
      choices: ['#testing-option']
    });

    engine.game.init = function () {}; // noop for now

    engine.begin();
  });

  it('starts', function () {
    $('#title').click();

    expect($('#content').html())
      .to.match(/testing situation/)
  });

  it('accepts functions as content properties', function () {
    $('a[href="functions-as-properties"]').click();

    expect($('#content').html())
      .to.match(/Properties can be functions./)
  });

  it('uses markdown in content', function () {
    $('a[href="markdown-support"]').click();

    expect($('#content').html())
      .to.match(/<h1>Markdown Support<\/h1>/);
  });
});
