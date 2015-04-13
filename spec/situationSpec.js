var situation = require('raconteur/situation.js');

describe ('situation', function () {
  var test_situation = situation('test-situation', {
    content: "This is the content of the *testing* situation.",
    choices: ['#foo']
  });

  var system_spy;

  beforeEach(function () {
    system_spy = {
      write: function () {return;},
      getSituationIdChoices: function () {return;},
      writeChoices: function () {return;}
    };

    spyOn(system_spy, 'write');
    spyOn(system_spy, 'getSituationIdChoices').and.returnValue(['foo', 'foo-bar']);
    spyOn(system_spy, 'writeChoices');
  });

  it('has a name', function () {
    expect(test_situation.name).toBe('test-situation');
  });

  it('parses its content as markdown', function () {
    test_situation.enter({}, system_spy, '');

    expect(system_spy.write)
      .toHaveBeenCalledWith("<p>This is the content of the <em>testing</em> situation.</p>\n");
  });

  it('is agnostic about whether content is a string or a function', function () {
    test_situation.content = function () {return "Foo and bar."};
    test_situation.enter({}, system_spy, '');

    expect(system_spy.write)
      .toHaveBeenCalledWith("<p>Foo and bar.</p>\n");
  });

  it('generates a list of choices', function () {
    test_situation.enter({}, system_spy, '');

    expect(system_spy.getSituationIdChoices)
      .toHaveBeenCalledWith(['#foo'], undefined, undefined);
    expect(system_spy.writeChoices).toHaveBeenCalledWith(['foo', 'foo-bar']);
  });

});