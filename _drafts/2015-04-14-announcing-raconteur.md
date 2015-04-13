---
layout: post
title: Announcing Raconteur
author: Bruno Dias
author_id: "@NotBrunoAgain"
author_url: "http://twitter.com/notbrunoagain"
---

Writing interactive fiction is hard. I've shipped two games this year and they were both hard, or at least nontrivial. IF has difficulties that static prose doesn't have to handle, even before you touch the computer systems that actually make IF go.

When I finished writing a parser game earlier this year, I pretty much didn't want to look at Inform 7 for at least several months. I wanted to make a hypertext game. So I surveyed the state of hypertext IF systems:

### ChoiceScript, Inkle Writer

Both of those are wonderful options, but they're also based on a very clear idea of what player interaction with your story is going to be. They're based on the idea of clearly demarcated choices at the end of every passage, stitching together a story. I wanted to play around with hypertext more; I wanted to do some of the things Twine authors were doing. Those two systems didn't really support that.

### Twee/Twine

Twine has done amazing work getting people who'd never even thought of making games to write IF. It's also really hard to extend. Most Twine authors rely on macros that were written by others authors. Twine authoring is code bricolage. There's not a lot of documentation on how those macros are written in the first place.

Twee, Twine's underlying technology, also had some other things I didn't care for. TiddlyWiki markup is clumsy. The enforced separation of code and content doesn't seem to benefit either. I missed the directness I had with Inform 7, of being able to just blend code and prose however I wanted to generate content.

### Undum

Undum is at least as powerful as Twee, but has a much cleaner, better documented API that makes writing code to do things with it much more straightforward. Undum is also fairly barebones; batteries are most definitely not included. Starting an Undum project has historically meant writing your own tools before you can get to writing prose. So Undum is in a weird place where there are few Undum pieces, but some of them are of considerable quality. IFDB lists 12 Undum works right now, by 11 authors (I'm one of them). Some of those are really significant works by accomplished authors -- Aaron Reed's Almost Goodbye, Squinky's The Play.

Undum wasn't exactly what I wanted, but it was closest. I set to work building a small library and a toolchain to make it easier to write an Undum story. Raconteur is a version of that library and toolchain written to be used by people who are not me.

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

Over the next few weeks, I'm going to be posting a series of tutorials on writing Undum games with Raconteur.