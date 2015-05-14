'use strict'

var elements = require('raconteur/elements.js');

var a = elements.a, span = elements.span;

describe('elementHelper', function() {

  it('stringifies as a tag', function() {
    var elem = elements.element('span');
    expect('' + elem).toBe('<span></span>')
  });

  it('supplies monadic methods', function () {
    var elem = elements.element('span');
    var elem_ = elem.class('foo').id('my_span');
    expect('' + elem_).toBe('<span class="foo" id="my_span"></span>');
  });

  it('allows redefining previously set attributes', function () {
    var elem = elements.element('span').content('foo');
    expect('' + elem).toBe('<span>foo</span>');
    expect('' + elem.content('bar')).toBe('<span>bar</span>');
    expect('' + elem).toBe('<span>foo</span>');
  });

  it('adds classes with class()', function () {
    expect('' + span().class('foo').class('bar'))
      .toBe('<span class="foo bar"></span>');
  });

  it('redefines classes with class()', function () {
    expect('' + span().class('foo').classes(['bar', 'baz']))
      .toBe('<span class="bar baz"></span>');
  });

  it('allows setting most tag attributes', function () {
    expect('' + 
      a('content').class('class').id('id').url('ref').src('src').alt('alt'))
      .toBe('<a class="class" id="id" href="ref" src="src" alt="alt">content</a>')
  });

  it('is immutable', function() {

    var span = elements.element('span');
    var shouldBreak = function () {
      span._content = "foo";
    };

    expect(shouldBreak).toThrowError();
  });

});

describe('a', function() {

  it('creates an <a> element', function() {
    expect('' + a('foo').url('http://example.com'))
      .toBe('<a href="http://example.com">foo</a>');
  });

  it('supplies shorthand for common action links', function (){
    expect('' + a('foo').action('bar'))
      .toBe('<a class="action" href="./bar">foo</a>');

    expect('' + a('foo').writer('bar'))
      .toBe('<a class="writer" href="./_writer_bar">foo</a>');
  });

});