/*
  We test Raconteur using jsdom, which mocks up a dom APi.

  Unfortunately, window.matchMedia() is not part of a standard
  API, even though we use it to check whether we're on mobile.

  So, this is a "polyfill" that the full engine tests can attach to
  `window`.
*/

module.exports = function () {
  return {
    match: false
  }
};
