var oneOf = require('raconteur/oneOf.js');

describe('oneOf', function() {
  var oneOfObj;

  beforeEach(function () {
    oneOfObj = oneOf('foo', 'bar', 'baz');
  });

  it('creates an object that supplies certain methods', function () {
    expect(typeof oneOfObj).toBe('object');
    expect(oneOfObj.cycling).toBeDefined;
    expect(oneOfObj.stopping).toBeDefined;
    expect(oneOfObj.randomly).toBeDefined;
    expect(oneOfObj.trulyAtRandom).toBeDefined;
    expect(oneOfObj.inRandomOrder).toBeDefined;
  });

  it('produces functions with those methods', function () {
    expect(typeof oneOfObj.cycling()).toBe('function');
    expect(typeof oneOfObj.stopping()).toBe('function');
    expect(typeof oneOfObj.randomly()).toBe('function');
    expect(typeof oneOfObj.trulyAtRandom()).toBe('function');
    expect(typeof oneOfObj.inRandomOrder()).toBe('function');
  });

  it('allows stringifying those functions directly', function () {
    expect('' + oneOfObj.cycling()).toBe('foo');
  });

  it('creates a closure that cycles', function () {
    var cycler = oneOfObj.cycling();
    expect(cycler(), cycler(), cycler(), cycler())
      .toBe('foo', 'bar', 'baz', 'foo', 'bar', 'baz');
  });

  it('is agnostic about values', function () {
    var cycler = oneOf('foo', 1, null, {}).cycling();
    expect(cycler(), cycler(), cycler(), cycler())
      .toBe('foo', 1, null, {});
  });

  it('creates a closure that stops', function () {
    var stopper = oneOfObj.stopping();
    expect(stopper(), stopper(), stopper(), stopper())
      .toBe('foo', 'bar', 'baz', 'baz');
  });

  describe('using random numbers', function () {
    /* This expects a System object supplying system.rnd.random(); */
    var randomStub;



    beforeEach(function () {

      randomStub = {
        rnd: {
          random: (function () {
            var i = 0,
                outputs = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
            return function () {
              if (i >= outputs.length) i = 0;
              return outputs[i];
            }
          })()
        }
      };

      oneOfObj = oneOf('foo', 'bar', 'baz');
      spyOn(randomStub.rnd, 'random').and.callThrough();
    });

    it('creates a closure that returns a random item', function () {
      var snippet = oneOfObj.trulyAtRandom(randomStub);
      expect(snippet(), snippet(), snippet()).toBe('foo', 'foo', 'foo');
      expect(randomStub.rnd.random).toHaveBeenCalled();
    });

    it('will not return the same item twice with randomly()', function () {
      var snippet = oneOfObj.randomly(randomStub);
      expect(snippet() !== snippet()).toBe(true);
    });

    it('can cycle through a random list', function () {
      var snippet = oneOfObj.inRandomOrder(randomStub);
      var snippets = [snippet(), snippet(), snippet(), snippet()];
      expect(snippets[0]).toBe(snippets[3]);
    });

  });

});