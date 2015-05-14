var situation = require('raconteur/situation.js');

describe ('situation', function () {
  var test_situation = situation('test-situation', {
    content: "This is the content of the *testing* situation.",
    choices: ['#foo'],
    writers: {
      testwriter: "*Foo*"
    }
  });

  var system_spy;

  beforeEach(function () {
    system_spy = {
      write: function () {return;},
      writeInto: function () {return;},
      getSituationIdChoices: function () {return;},
      writeChoices: function () {return;}
    };

    spyOn(system_spy, 'write');
    spyOn(system_spy, 'writeInto');
    spyOn(system_spy, 'getSituationIdChoices').and.returnValue(['foo', 'foo-bar']);
    spyOn(system_spy, 'writeChoices');
  });

  it('has a name', function () {
    expect(test_situation.name).toBe('test-situation');
  });

  it('parses its content as markdown inside a <section>', function () {
    test_situation.enter({}, system_spy, '');

    expect(system_spy.write)
      .toHaveBeenCalledWith('<section id="current-situation" class="situation-test-situation">\n<p>This is the content of the <em>testing</em> situation.</p>\n</section>');
  });

  it('is agnostic about whether content is a string or a function', function () {
    test_situation.content = function () {return "Foo and bar."};
    test_situation.enter({}, system_spy, '');

    expect(system_spy.write)
      .toHaveBeenCalledWith('<section id="current-situation" class="situation-test-situation">\n<p>Foo and bar.</p>\n</section>');
  });

  it('adds classes to a <section> if the classList attribute is specified', function () {
    test_situation.classes = ['foo', 'bar'];
    test_situation.enter({}, system_spy, '');

    expect(system_spy.write)
      .toHaveBeenCalledWith('<section id="current-situation" class="situation-test-situation foo bar">\n<p>Foo and bar.</p>\n</section>');
  });

  it('generates a list of choices', function () {
    test_situation.enter({}, system_spy, '');

    expect(system_spy.getSituationIdChoices)
      .toHaveBeenCalledWith(['#foo'], undefined, undefined);
    expect(system_spy.writeChoices).toHaveBeenCalledWith(['foo', 'foo-bar']);
  });

  it('writes into the current situation when a default writer is called', function () {
    test_situation.act({}, system_spy, '_writer_testwriter');

    expect(system_spy.writeInto).toHaveBeenCalled();
  });

});