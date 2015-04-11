/*
  Undularity Tools

  Those functions are not a core part of Undularity, but provide some
  general functionality that relates to adaptive text generation.

  This is provided partly as a helper to less technical users, and as
  a convenience for authors.
*/

/* Monkey patching */

/* Array.prototype.shuffle() */

/*
  Shuffles an array. It can use Undum's random number generator implementation,
  so it expects a System.rnd object to be passed into it. If one isn't
  supplied, it will use Math.Random instead.

  This is an implementation of the Fischer-Yates (Knuth) shuffle.

  Returns the shuffled array.
*/

Array.prototype.shuffle = function (system) {
  var rng = (system) ? system.rnd.random : Math.random;
  // slice() clones the array. Object members are copied by reference,
  // beware.
  var newArr = this.slice();
  var m = newArr.length;

  while (m) {
    let i = Math.floor(rng() * m --);
    let t = newArr[m];
    newArr[m] = newArr[i];
    newArr[i] = t;
  }

  return newArr;
};

/*
  oneOf()

  Takes an array and returns an object with several methods. Each method
  returns an iterator which iterates over the array in a specific way:

    inOrder()
      Returns the array items in order.

    cycling()
      Returns the array items in order, cycling back to the first item when
      it runs out.

    stopping()
      Returns the array items in order, then repeats the last item when it
      runs out.

    randomly()
      Returns the array items at random. Takes a system object, for consistent
      randomness. Will never return the same item twice in a row.

    trulyAtRandom()
      Returns the array items purely at random. Takes a system object, for
      consistent randomness.

    inRandomOrder()
      Returns the array items in a random order. Takes a system object, for
      consistent randomness.
*/

var oneOf = function (ary) {

  return {
    inOrder () {
      var i = 0;
      return function () {
        return ary[i++];
      };
    },

    cycling () {
      var i = 0;
      return function () {
        if (i >= ary.length) i = 0;
        return ary[i++];
      };
    },

    stopping () {
      var i = 0;
      return function () {
        if (i >= ary.length) i = ary.length - 1;
        return ary[i++];
      }
    },

    randomly (system) {
      var rng = (system) ? system.random : Math.random,
          last;
      return function () {
        var i;

        do {
          i = Math.floor(rng() * ary.length);
        } while (i === last);

        last = i;
        return ary[i];
      };
    },

    trulyAtRandom (system) {
      var rng = (system) ? system.random : Math.random;
      return function () {
        return ary[Math.floor(rng() * ary.length)];
      };
    },

    inRandomOrder (system) {
      var shuffled = ary.shuffle(system),
          i = 0;
      return function () {
        return shuffled[i++];
      };
    }
  };
};

module.exports = oneOf;