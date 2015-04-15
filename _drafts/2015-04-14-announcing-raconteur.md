---
layout: post
title: Announcing Raconteur
author: Bruno Dias
author_id: "@NotBrunoAgain"
author_url: "http://twitter.com/notbrunoagain"
---

Raconteur is "Undum with batteries included." Historically, developing for Undum has meant doing a lot of your own tooling; writing tools to enable you to write your game. Undum's flexibility and power have made it the engine that drove some of the most significant works in IF ([The Play], [Almost Goodbye]). But it has always been relatively inaccessible. Undum is not the system of choice for writing straightforward hypertext games; it's a challenging system to learn and use that demands the author build their own engine on top of it to drive their game logic.

Raconteur is a descendant of a library I wrote for my own use to write [Mere Anarchy]. I've polished it up (a bit; there is still work to be done) and given it a name, because I want there to be more Undum stories out there.

Raconteur is a library of Undum tools that can get someone writing their story quickly. It tries to push Undum in the direction of Inform 7 and Twine, a system that puts the prose front and center.

Undum will never be quite as easy to use as Twine -- Raconteur itself introduces some complications for the less technically-minded (It depends on [Node.js], for one thing). But it's an attempt at averaging out the power and flexibility of Undum with the ease of other systems. And for IF authors (or aspiring IF authors) who know a bit of web development, it'll be a very familiar set of tools.

### What it Does

Raconteur's heart is a new way of defining situations, Undum's equivalent of Twine's passages or ChoiceScript's scenes. This new situation prototype is paired with a new API to allow writing Undum games in a style that resembles Twee/ChoiceScript more:

{% highlight coffeescript %}
situation 'pulpit-shop',
    content: """
    # Summer: Mr Pulpit & Co, Purveyors

    A profusion of odd junk lines the shelves, high up and out of reach. The
    room is narrow like a spite house, bisected by a hardwood counter. An
    antique cash register, set aside for a real one. Mr Pulpit, himself narrow,
    has a shopkeeper's smile from behind the counter.

    [Tell him what you need.](tell_him)
    """
{% endhighlight %}

You write content in [Markdown](http://en.wikipedia.org/wiki/Markdown), not html. Using CoffeeScript (Or ECMAScript 6, if you're into that) instead of plain JavaScript, you get cleaner syntax and Ruby-style text interpolations that let you insert arbitrary expressions into your text:

{% highlight coffeescript %}
situation 'counting_money',
    content: (character, system) -> 
        [gp, sp, cp] = calculateCoins(character.sandbox.money)
        """
        You count your money. You find that you have #{cp} copper pieces,
        #{sp} silver pieces, and #{gp} gold pieces.
        """
    choices: ['#continue_adventure']
{% endhighlight %}

Wherever possible, Raconteur treats code that produces text *as* text. There's no separation between situations that just print some static text, and situations that print dynamic text. 

Added to that is a set of tools for generating adaptive text (Similar to Inform's `[one of]` functionality), defining html elements with specific attributes to reuse in text, and some common hypertext functions.

{% highlight coffeescript %}
state_statement = 
    oneOf('The machine is quiet.', 'The machine hums.').cycling()

situation 'laboratory',
    content: """
        #{span('The machine hums.').id('machine_state')} It has a big red
        #{a('switch').replacer('machine_state')} on the side of it.
    """
    writers:
        machine_state: (character) ->
            character.sandbox.machineOn = !character.sandbox.machineOn
            "#{span(state_statement()).id('machine_state')}"
{% endhighlight %}

### What's Included

Raconteur's actual source distribution, on [Github](http://github.com/sequitur/raconteur/), is really only meant for people who want to develop Raconteur itself. For now, the way to get Raconteur is through the [game scaffold](http://github.com/sequitur/raconteur-scaffold/) which contains the following pieces:

- A set of scaffold files that you can edit to start building your game right away; unlike the example game that shipped with Undum, they are mostly blank and more explanatory.
- A Gulpfile (Which is similar to a Makefile or a Rakefile), which configures the gulp build system to automagically build and package your game, and even start a server so you can view it and test it on your local machine or anything else on the same wi-fi network.
- A package.json file which lists dependencies. This allows you to do `npm install` from the scaffold and have everything you need in place.

### Where it's Going

Raconteur is still in an experimental state. It's usable, however; you can download the [scaffold](http://github.com/sequitur/raconteur-scaffold/) right now and start playing with it or even building games.

Over the next few weeks, I'm going to be posting a series of tutorials on writing Undum games with Raconteur, as well as a more navel-gazing explanation of why Raconteur exists, on my [own IF blog]. You can reach me through [Twitter], [Github], or [intfiction.org].

[The Play]: http://ifdb.tads.org/viewgame?id=ytohfp3jetsh1ik4
[Almost Goodbye]: http://ifdb.tads.org/viewgame?id=myktccphmb29xjne
[Mere Anarchy]: http://ifdb.tads.org/viewgame?id=txqmifzs44ndjxpw
[Node.js]: https://nodejs.org
[Twitter]: https://twitter.com/notbrunoagain
[Github]: https://github.com/sequitur
[intfiction.org]: http://www.intfiction.org/forum/