/*eslint-env mocha */
/*eslint-disable prefer-arrow-callback */

const jsdom = require('mocha-jsdom');
const expect = require('chai').expect;
const {a, span} = require('../lib/elements.js');

// Standard Raconteur page template
const DOCUMENT_BODY = require('./helpers/body.js')

describe('situation', function () {
  let engine, situation, $;
  jsdom();

  const mock = {
    values: [],
    _timesCalled: 0,

    call (value) {
      this._timesCalled++;
      this.values.push(value);
    },

    calledWith (value) {
      return this.values.indexOf(value) !== -1;
    },

    get timesCalled () {
      return this._timesCalled;
    }
  }

  before(function () {

    document.body.innerHTML = DOCUMENT_BODY;

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

    situation('reset', {
      tags: ['testing-option'],
      choices: ['#testing-option']
    });

    situation ('special-links', {
      content: `
          # Special Links

          ${a('writer').once().writer('writerlink')}
          ${a('inserter').once().inserter('inserterlink')}
          ${a('replacer').once().replacer('replacerlink')}
          ${a('selfreplacer').replacer('selfreplacer').id('selfreplacer')}
          ${a('customaction').once().action('customaction')}

          ${span('inserter links').id('inserterlink')}.
          ${span('this text will be replaced').id('replacerlink')}
        `,
      writers: {
        writerlink: 'writer links work',
        inserterlink: ' work',
        replacerlink: 'this text has been replaced',
        selfreplacer: 'this link was replaced'
      },
      actions: {
        customaction: function () {
          mock.call('custom_action');
        }
      },
      tags: ['testing-option'],
      optionText: ['special links'],
      choices: ['#testing-option']
    });

    situation ('reentry', {
      before () {
        mock.call('times');
      },
      tags: ['testing-option'],
      choices: ['#testing-option']
    });

    engine.game.init = function () {}; // noop for now

    engine.begin();
  });

  const clickOn = function (ref) {
    const link = $(`a[href="${ref}"]`);
    if (link.length < 1)
      throw new Error(`Can't find link: ${ref}`);
    return link.click();
  }

  const contentHTML = function () {
    return $('#content').html();
  }

  const contentText = function () {
    return $('#content').text();
  }

  // Basic tests

  it('starts', function () {
    $('#title').click();

    expect(contentHTML())
      .to.match(/testing situation/)
  });

  it('writes a list of options', function () {

    /* Make sure that the dom is as we expect it:
      <ul class="options">
        <li><a href="situation">Situation</a></li>
        [...]
      </ul>
    */
    expect($('ul.options').length)
      .to.be.at.least(1);
    expect($('ul.options').children(':not(li)').length)
      .to.equal(0);
    expect($('ul.options li').children(':not(a)').length)
      .to.equal(0);
    expect($('ul.options li a').length)
      .to.be.at.least(1);
  });

  it('accepts functions as content properties', function () {
    clickOn('functions-as-properties');

    expect(contentHTML())
      .to.match(/Properties can be functions./)
  });

  it('uses markdown in content', function () {
    clickOn('markdown-support');

    expect(contentHTML())
      .to.match(/<h1>Markdown Support<\/h1>/);
  });

  // Special link tests

  it('supports writer links', function () {
    clickOn('special-links');

    clickOn('./_writer_writerlink');
    expect(contentHTML())
      .to.match(/writer links work/);
  });

  it('supports inserter links', function () {
    expect(contentText())
      .to.match(/inserter links\./);

    clickOn('./_inserter_inserterlink');

    expect(contentText())
      .to.match(/inserter links work\./)
      .and.not.match(/inserter links\./);
  });

  it('supports replacer links', function () {
    expect(contentText())
      .to.match(/this text will be replaced/)
      .and.not.match(/this text has been replaced/);

    clickOn('./_replacer_replacerlink');

    expect(contentText())
      .to.match(/this text has been replaced/)
      .and.not.match(/this text will be replaced/);
  });

  it('supports self-replacers', function () {
    expect(contentText())
      .to.not.match(/this link was replaced/)

    clickOn('./_replacer_selfreplacer')

    expect(contentText())
      .to.match(/this link was replaced/);
  });

  it('supports custom actions', function () {
    expect(mock.calledWith('custom_action'))
      .to.be.equal(false);

    clickOn('./customaction');

    expect(mock.calledWith('custom_action'))
      .to.be.equal(true);
  });

  it('supports once links', function () {
    clickOn('reset');
    clickOn('special-links');

    const currSection = $('section').last();

    expect(currSection.find('a[href="./customaction"]').length)
      .to.equal(1);

    clickOn('./customaction');

    expect(currSection.find('a[href="./customaction"]').length)
      .to.equal(0);
    expect(currSection.find('span.ex_link').length)
      .to.equal(1);
    expect(currSection.find('span.ex_link').text())
      .to.match(/customaction/);

  });

  // Behavioral tests

  it('does not re-enter situations', function () {
    clickOn('reentry');

    const calls = mock.timesCalled;

    clickOn('reentry');

    expect(mock.timesCalled).to.equal(calls);
  });
});
