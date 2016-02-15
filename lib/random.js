// Random Number generation based on seedrandom.js code by David Bau.
// Copyright 2010 David Bau, all rights reserved.
//
// Redistribution and use in source and binary forms, with or
// without modification, are permitted provided that the following
// conditions are met:
//
//   1. Redistributions of source code must retain the above
//      copyright notice, this list of conditions and the
//      following disclaimer.
//
//   2. Redistributions in binary form must reproduce the above
//      copyright notice, this list of conditions and the
//      following disclaimer in the documentation and/or other
//      materials provided with the distribution.
//
//   3. Neither the name of this module nor the names of its
//      contributors may be used to endorse or promote products
//      derived from this software without specific prior written
//      permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND
// CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
// NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
// HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
// EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

const width = 256;
const chunks = 6;
const significanceExponent = 52;
const startdenom = Math.pow(width, chunks);
const significance = Math.pow(2, significanceExponent);
const overflow = significance * 2;

const Random = (function () {
    const Random = function(seed) {
        this.random = null;
        if (!seed) {
          throw {
            name: "RandomSeedError",
            message: "random_seed_error".l()
          };
        }
        const key = [];
        mixkey(seed, key);
        const arc4 = new ARC4(key);
        this.random = function() {
            let n = arc4.g(chunks);
            let d = startdenom;
            let x = 0;
            while (n < significance) {
                n = (n + x) * width;
                d *= width;
                x = arc4.g(1);
            }
            while (n >= overflow) {
                n /= 2;
                d /= 2;
                x >>>= 1;
            }
            return (n + x) / d;
        };
    };
    // Helper type.
    const ARC4 = function(key) {
        let t, u, self = this, keylen = key.length;
        let i = 0, j = self.i = self.j = self.m = 0;
        self.S = [];
        self.c = [];
        if (!keylen) key = [keylen++];
        while (i < width) self.S[i] = i++;
        for (i = 0; i < width; i++) {
            t = self.S[i];
            j = lowbits(j + t + key[i % keylen]);
            u = self.S[j];
            self.S[i] = u;
            self.S[j] = t;
        }
        self.g = function getnext(count) {
            let s = self.S;
            let i = lowbits(self.i + 1); let t = s[i];
            let j = lowbits(self.j + t); let u = s[j];
            s[i] = u;
            s[j] = t;
            let r = s[lowbits(t + u)];
            while (--count) {
                i = lowbits(i + 1); t = s[i];
                j = lowbits(j + t); u = s[j];
                s[i] = u;
                s[j] = t;
                r = r * width + s[lowbits(t + u)];
            }
            self.i = i;
            self.j = j;
            return r;
        };
        self.g(width);
    };
    // Helper functions.
    let mixkey = function(seed, key) {
        seed += '';
        let smear = 0;
        for (let j = 0; j < seed.length; j++) {
            let lb = lowbits(j);
            smear ^= key[lb];
            key[lb] = lowbits(smear*19 + seed.charCodeAt(j));
        }
        seed = '';
        for (let j in key)
            seed += String.fromCharCode(key[j]);
        return seed;
    };
    let lowbits = function(n) {
        return n & (width - 1);
    };

    return Random;
})();

/* Returns a random floating point number between zero and
* one. NB: The prototype implementation below just throws an
* error, it will be overridden in each Random object when the
* seed has been correctly configured. */
Random.prototype.random = function() {
throw {
    name:"RandomError",
    message: "random_error".l()
};
};
/* Returns an integer between the given min and max values,
* inclusive. */
Random.prototype.randomInt = function(min, max) {
return min + Math.floor((max-min+1)*this.random());
};
/* Returns the result of rolling n dice with dx sides, and adding
* plus. */
Random.prototype.dice = function(n, dx, plus) {
let result = 0;
for (let i = 0; i < n; i++)
    result += this.randomInt(1, dx);
if (plus) result += plus;
return result;
};
/* Returns the result of rolling n averaging dice (i.e. 6 sided dice
* with sides 2,3,3,4,4,5). And adding plus. */
Random.prototype.aveDice = (function() {
const mapping = [2,3,3,4,4,5];
return function(n, plus) {
    let result = 0;
    for (let i = 0; i < n; i++)
        result += mapping[this.randomInt(0, 5)];
    if (plus) result += plus;
    return result;
};
})();
/* Returns a dice-roll result from the given string dice
* specification. The specification should be of the form xdy+z,
* where the x component and z component are optional. This rolls
* x dice of with y sides, and adds z to the result, the z
* component can also be negative: xdy-z. The y component can be
* either a number of sides, or can be the special values 'F', for
* a fudge die (with 3 sides, +,0,-), '%' for a 100 sided die, or
* 'A' for an averaging die (with sides 2,3,3,4,4,5).
*/

Random.prototype.diceString = (function () {
let diceRe = /^([1-9][0-9]*)?d([%FA]|[1-9][0-9]*)([-+][1-9][0-9]*)?$/;
return function(def) {
    let match = def.match(diceRe);
    if (!match) {
        throw new Error(
            "dice_string_error".l({string:def})
        );
    }

    let num = match[1]?parseInt(match[1], 10):1;
    let sides;
    let bonus = match[3]?parseInt(match[3], 10):0;

    switch (match[2]) {
    case 'A':
        return this.aveDice(num, bonus);
    case 'F':
        sides = 3;
        bonus -= num*2;
        break;
    case '%':
        sides = 100;
        break;
    default:
        sides = parseInt(match[2], 10);
        break;
    }
    return this.dice(num, sides, bonus);
};
})();

module.exports = Random;
