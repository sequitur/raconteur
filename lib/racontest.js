var $ = require('jquery');

var RACONTEST_TEMPLATE = `
<div id="debug_interface">
  <form id="situation_hop">
    <p>
    <label for="hop_target">Go to situation</label>
    <input type="text" id="hop_target" name="hop_target" />
    </p>
    <input type="submit" id="submit_hop" name="submit_hop" />
  </form>
</div>
`;

var init = function (system) {
  if (location.hash !== '#debug') return;
  $('body').append(RACONTEST_TEMPLATE)
  $('#situation_hop').submit(function (event) {
    event.preventDefault();
    /*
      While I could have a try/catch block here, it would be useless; the
      assertionError thrown from going to a nonexistant situation can be
      caught, but Undum breaks anyway.
    */
    system.doLink($('#hop_target').val())
  });
};

module.exports.init = init;