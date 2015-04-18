var
  $ = require('jquery'),
  racontest = require('raconteur/racontest.js');

require('jasmine-jquery');

describe('debug mode', function () {
  it('should only happen if #debug is the location.hash value', function () {
    location.hash = "#foo";
    racontest.init();
    expect($('#debug_interface')).not.toBeInDOM();
  });
});

describe('racontest', function () {
  var system;

  beforeEach(function () {
    system = {
      doLink () {}
    };

    spyOn(system, 'doLink');

    location.hash = '#debug'
    racontest.init(system);
  });

  afterEach(function () {
    $('body').empty();
  });

  it('inserts a #debug_interface div', function () {
    expect($('#debug_interface')).toBeInDOM();
  });

  describe('situation hopper', function () {
    it('inserts a form to hop from situation to situation', function () {
      expect($('#debug_interface')).toContainElement('form#situation_hop');

    });

    it('attaches a handler to submitting the form', function () {
      expect($('#situation_hop')).toHandle('submit');
    });

    it('responds to form submission with a call to doLink()', function () {
      $('#hop_target').val('foo_situation');
      $('#situation_hop').trigger('submit');
      expect(system.doLink).toHaveBeenCalledWith('foo_situation');
    });

  });

});