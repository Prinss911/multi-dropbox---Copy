---
source_url: https://videojs.org/guides/setup/
scraped_at: 2026-01-09
---

# Documentation Scraped from https://videojs.org/guides/setup/

## Video.js Guides

These guides cover a range of topics for users of Video.js

[Back to Guides](/guides)

# Video.js Setup

## Table of Contents

* [Getting Video.js](#getting-videojs)
* [Creating a Player](#creating-a-player)
  + [Automatic Setup](#automatic-setup)
  + [Manual Setup](#manual-setup)
  + [Getting References to Players](#getting-references-to-players)
    - [Using videojs](#using-videojs)
    - [Using videojs.getPlayer()](#using-videojsgetplayer)
    - [Using videojs.getPlayers() or videojs.players](#using-videojsgetplayers-or-videojsplayers)
* [Options](#options)
  + [Global Defaults](#global-defaults)
  + [A Note on <video> Tag Attributes](#a-note-on-video-tag-attributes)
* [Player Readiness](#player-readiness)
* [Advanced Player Workflows](#advanced-player-workflows)

## Getting Video.js

Video.js is officially available via CDN and npm.

Video.js works out of the box with not only HTML `<script>` and `<link>` tags, but also all major bundlers/packagers/builders, such as Browserify, Node, WebPack, etc.

Please refer to the [Getting Started](/getting-started) document for details.

## Creating a Player

> **Note:** Video.js works with `<video>` *and* `<audio>` elements, but for simplicity we'll refer only to `<video>` elements going forward.

Once you have Video.js [loaded on your page](/getting-started), you're ready to create a player!

The core strength of Video.js is that it decorates a [standard `<video>` element](https://www.w3.org/TR/html5/embedded-content-0.html#the-video-element) and emulates its associated [events and APIs](https://www.w3.org/2010/05/video/mediaevents.html), while providing a customizable DOM-based UI.

Video.js supports all attributes of the `<video>` element (such as `controls`, `preload`, etc), but it also supports [its own options](/guides/setup/#options). There are two ways to create a Video.js player and pass it options, but they both start with a standard `<video>` element with the attribute `class="video-js"`:

```javascript
<video class="video-js">
  <source src="//vjs.zencdn.net/v/oceans.mp4" type="video/mp4">
  <source src="//vjs.zencdn.net/v/oceans.webm" type="video/webm">
</video>
```

You can use a `<video-js>` element instead of `<video>`. Using a `<video>` element is undesirable in some circumstances, as the browser may show unstyled controls or try to load a source in the moments before the player initialises, which does not happen with the `<video-js>` custom element.

```javascript
<video-js>
  <source src="//vjs.zencdn.net/v/oceans.mp4" type="video/mp4">
  <source src="//vjs.zencdn.net/v/oceans.webm" type="video/webm">
</video-js>
```

For a high-level overview of all the various embed options, check out the [embeds page](/guides/embeds), then follow the rest of this page.

### Automatic Setup

By default, when your web page finishes loading, Video.js will scan for media elements that have the `data-setup` attribute. The `data-setup` attribute is used to pass options to Video.js. A minimal example looks like this:

```javascript
<video class="video-js" data-setup='{}'>
  <source src="//vjs.zencdn.net/v/oceans.mp4" type="video/mp4">
  <source src="//vjs.zencdn.net/v/oceans.webm" type="video/webm">
</video>
```

> **Note:** You *must* use single-quotes with `data-setup` as it is expected to contain JSON.

### Manual Setup

On the modern web, a `<video>` element often does not exist when the page finishes loading. In these cases, automatic setup is not possible, but manual setup is available via [the `videojs` function](https://docs.videojs.com/module-videojs.html).

One way to call this function is by providing it a string matching a `<video>` element's `id` attribute:

```javascript
<video id="my-player" class="video-js">
  <source src="//vjs.zencdn.net/v/oceans.mp4" type="video/mp4">
  <source src="//vjs.zencdn.net/v/oceans.webm" type="video/webm">
</video>
```

```javascript
videojs('my-player');
```

However, using an `id` attribute isn't always practical; so, the `videojs` function accepts a DOM element instead:

```javascript
<video class="video-js">
  <source src="//vjs.zencdn.net/v/oceans.mp4" type="video/mp4">
  <source src="//vjs.zencdn.net/v/oceans.webm" type="video/webm">
</video>
```

```javascript
videojs(document.querySelector('.video-js'));
```

### Getting References to Players

Once players are created, Video.js keeps track of them internally. There are a few ways to get references to pre-existing players.

#### Using `videojs`

Calling `videojs()` with the ID of element of an already-existing player will return that player and will not create another one.

If there is no player matching the argument, it will attempt to create one.

#### Using `videojs.getPlayer()`

Sometimes, you want to get a reference to a player without the potential side effects of calling `videojs()`. This can be acheived by calling `videojs.getPlayer()` with either a string matching the element's ID or the element itself.

#### Using `videojs.getPlayers()` or `videojs.players`

The `videojs.players` property exposes all known players. The method, `videojs.getPlayers()` simply returns the same object.

Players are stored on this object with keys matching their IDs.

> **Note:** A player created from an element without an ID will be assigned an automatically-generated ID.

## Options

> **Note:** This guide only covers how to pass options during player setup. For a complete reference on *all* available options, see the [options guide](/guides/options).

There are three ways to pass options to Video.js. Because Video.js decorates an HTML5 `<video>` element, many of the options available are also available as [standard `<video>` tag attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#Attributes):

```javascript
<video controls autoplay preload="auto" ...>
```

Alternatively, you can use the `data-setup` attribute to pass options as [JSON](https://json.org/example.html). This is also how you would set options that aren't standard to the `<video>` element:

```javascript
<video data-setup='{"controls": true, "autoplay": false, "preload": "auto"}'...>
```

> **Note:** You *must* use single-quotes around the value of `data-setup` as it contains a JSON string which must use double quotes.

Finally, if you're not using the `data-setup` attribute to trigger the player setup, you can pass in an object of player options as the second argument to the `videojs` function:

```javascript
videojs('my-player', {
  controls: true,
  autoplay: false,
  preload: 'auto'
});
```

> **Note:** Do not use both `data-setup` and an options object.

### Global Defaults

Default options for all players can be found at `videojs.options` and can be changed directly. For example, to set `{autoplay: true}` for all future players:

```javascript
videojs.options.autoplay = true;
```

### A Note on `<video>` Tag Attributes

Many attributes are so-called [boolean attributes](https://www.w3.org/TR/2011/WD-html5-20110525/common-microsyntaxes.html#boolean-attributes). This means they are either on or off. In these cases, the attribute *should have no value* (or should have its name as its value) - its presence implies a true value and its absence implies a false value.

*These are incorrect:*

```javascript
<video controls="true" ...>
<video loop="true" ...>
<video controls="false" ...>
```

> **Note:** The example with `controls="false"` can be a point of confusion for new developers - it will actually turn controls *on*!

These are correct:

```javascript
<video controls ...>
<video loop="loop" ...>
<video ...>
```

## Player Readiness

Because Video.js techs have the potential to be loaded asynchronously, it isn't always safe to interact with a player immediately upon setup. For this reason, Video.js players have a concept of "readiness" which will be familiar to anyone who has used jQuery before.

Essentially, any number of ready callbacks can be defined for a Video.js player. There are three ways to pass these callbacks. In each example, we'll add an identical class to the player:

Pass a callback to the `videojs()` function as a third argument:

```javascript
// Passing `null` for the options argument.
videojs('my-player', null, function() {
  this.addClass('my-example');
});
```

Pass a callback to a player's `ready()` method:

```javascript
var player = videojs('my-player');

player.ready(function() {
  this.addClass('my-example');
});
```

Listen for the player's `"ready"` event:

```javascript
var player = videojs('my-player');

player.on('ready', function() {
  this.addClass('my-example');
});
```

In each case, the callback is called asynchronously.

An important distinction between the above methods is that adding an listener for `ready` with `on()` *must* be done before the player is ready. With `player.ready()`, the function is called immediately if the player is already ready.

## Advanced Player Workflows

For a discussion of more advanced player workflows, see the [player workflows guide](/guides/player-workflows).
