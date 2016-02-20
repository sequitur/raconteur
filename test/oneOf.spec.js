/*eslint-env mocha */
/*eslint-disable prefer-arrow-callback */

const oneOf = require('../lib/oneOf.js');
const { expect } = require('chai');

describe('oneOf', function () {
  let subject;

  beforeEach(function () {
    subject = oneOf('foo', 'bar', 'baz');
  });

  it('creates an object with certain methods', function() {
    expect(subject).to.be.an('object');
    expect(subject)
      .to.respondTo('cycling')
      .and.respondTo('stopping')
      .and.respondTo('randomly')
      .and.respondTo('trulyAtRandom')
      .and.respondTo('inRandomOrder');
  });

  it('creates a closure with these methods', function () {
    expect(subject.cycling()).to.be.a('function');
    expect(subject.stopping()).to.be.a('function');
    expect(subject.randomly()).to.be.a('function');
    expect(subject.trulyAtRandom()).to.be.a('function');
    expect(subject.inRandomOrder()).to.be.a('function');
  });

  it('stringifies without being called', function() {
    const func = subject.cycling();

    expect(func).to.be.a('function');
    expect(`${func}`).to.equal('foo');
  });

  it('is type agnostic', function() {
    const func = oneOf(
      1,
      'foo',
      null,
      {}
    ).cycling();

    expect([func(), func(), func(), func(), func()])
      .to.eql([
        1,
        'foo',
        null,
        {},
        1
      ])
  });

  describe('cycling', function () {
    it('cycles one thing at a time', function () {
      const func = subject.cycling();

      expect(`${func} ${func} ${func} ${func}`)
        .to.equal('foo bar baz foo');
    });
  });

  describe('stopping', function () {
    it('cycles, then stops', function () {
      const func = subject.stopping();
      expect(`${func} ${func} ${func} ${func} ${func}`)
        .to.equal('foo bar baz baz baz');
    });
  });

  describe('randomly', function () {
    it('produces output in a random order', function () {
      const func = subject.randomly();

      const func_ = function () {
        /*
          Call a randomised closure 30 times, to check that
          the output is different each time. Assuming true randomness,
          this should ensure this test fails only if there is a bug
          or in an astronimcally small proportion of universes.
        */
        let str = '';

        for (let i = 0; i < 30; i++) str = `${str} ${func}`;

        return str;
      }

      expect(func_()).to.not.equal(func_());
    });

    it('does not repeat itself', function () {
      const func = subject.randomly();

      for (let i = 0; i < 30; i++)
        expect(func()).to.not.equal(func());
    });
  });
});
