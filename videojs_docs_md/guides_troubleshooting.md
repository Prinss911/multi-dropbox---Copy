---
source_url: https://videojs.org/guides/troubleshooting/
scraped_at: 2026-01-09
---

# Documentation Scraped from https://videojs.org/guides/troubleshooting/

## Video.js Guides

These guides cover a range of topics for users of Video.js

[Back to Guides](/guides)

# Troubleshooting

## Table of Contents

* [Problems with media formats](#problems-with-media-formats)
  + [Choosing a video format](#choosing-a-video-format)
    - [I want to have a single source and don't care about live/adaptive streaming:](#i-want-to-have-a-single-source-and-dont-care-about-liveadaptive-streaming)
    - [I need adaptive streaming or live streaming](#i-need-adaptive-streaming-or-live-streaming)
  + [Make sure you are using formats that Video.js can play:](#make-sure-you-are-using-formats-that-videojs-can-play)
  + [Make sure that the codec used in the file container is supported:](#make-sure-that-the-codec-used-in-the-file-container-is-supported)
  + [If you are using Flash videos:](#if-you-are-using-flash-videos)
* [Problems when hosting media](#problems-when-hosting-media)
* [Problems with fullscreen](#problems-with-fullscreen)
* [Problems with playback](#problems-with-playback)
* [Video.js Errors](#videojs-errors)
  + [vdata123456 errors](#vdata123456-errors)
  + [Uncaught ReferenceError: X is not defined](#uncaught-referenceerror-x-is-not-defined)

## Problems with media formats

### Choosing a video format

#### I want to have a single source and don't care about live/adaptive streaming:

Most browsers now play [MP4 with h264](https://caniuse.com/#feat=mpeg4) video. If you want to have a single source, and neither live streaming
nor adaptive streaming is a consideration, MP4 with h264 video and acc audio is a good choice.

The most common browsers which do not support MP4 are found on Linux, where the user might need to install additional codec support, and in some cases won't want to.
You can supply an array of alternate sources. [webm](https://caniuse.com/#feat=webm) and/or [ogv](https://caniuse.com/#feat=ogv) are useful as fallback, but neither are supported by all browsers that support MP4.

#### I need adaptive streaming or live streaming

Video.js 7+ supports HLS and MPEG-DASH as standard as it includes [http-streaming](https://github.com/videojs/http-streaming), which uses [Media Source Extensions](https://caniuse.com/#feat=mediasource) to play these formats in modern browsers.
If choosing a single format, HLS is more convenient as iOS and some Android browsers which do not support MSE do have native HLS support.

HLS is not possible on IE 11 on Windows 7, which does not support MSE.

For older Video.js versions, [http-streaming](https://github.com/videojs/http-streaming) or its predecessors [videojs-contrib-hls](https://github.com/videojs/videojs-contrib-hls) and [videojs-contrib-dash](https://github.com/videojs/videojs-contrib-dash) add similar support, but for best results use the latest Video.js.

### Make sure you are using formats that Video.js can play:

* Does your browser/OS support the type of media that you are trying to play?
* Do you have a Video.js plugin that will add support for a media format to Video.js? For example [videojs-youtube](https://github.com/videojs/videojs-youtube)
* Verify that you are using the correct [mime-type/content-type](https://www.iana.org/assignments/media-types/media-types.xhtml#video) for your videos.
  This is used to determine if Video.js can play a certain type of media.

### Make sure that the codec used in the file container is supported:

* The MP4 format can contain video and audio data in many codecs, but MP4 playback in browsers typically only supports h264 video and MP3 or AAC audio.
* The file extension does not always reflect the file contents. For example some low end phones save video in 3GP format but give it an MP4 extension. These files will not play.

### If you are using Flash videos:

* [Flash has reached end of life](https://www.adobe.com/products/flashplayer/end-of-life.html) and is no longer supported in browsers.

## Problems when hosting media

* Your server *must* properly support byte-range requests as Chrome and Safari rely on them:
  + Most servers support this by default.
  + If you are proxying the media files via a server side script (PHP), this script must implement ranges. PHP does not do this by default.
  + The impact of not doing this ranges from seeking being broken to no playback at all (on iOS).
* Your server must return the correct [mime-type/content-type](https://www.iana.org/assignments/media-types/media-types.xhtml#video) header for the media being sent.
* Your server must implement [CORS (cross-origin resource)](https://enable-cors.org/) headers if:
  + You are using formats like HLS or MPEG-DASH and your media is served from a different domain than your page.
  + You are using [text tracks](/guides/text-tracks) (captions, subtitles, etc.) and they are being served from a different domain than your page.

## Problems with fullscreen

* If your player is in an iframe, that iframe *and* any parent iframes must have the following attributes for fullscreen to be allowed:
  + `allowfullscreen`
  + `webkitallowfullscreen`
  + `mozallowfullscreen`

## Problems with playback

* Make sure that the media host supports byte-range requests, this could be breaking playback. See [Problems when hosting media](/guides/troubleshooting/#problems-when-hosting-media) for more info.
* If your media is taking a long time to start playback or the entire mediadownloads before playback:
  + It is likely that metadata for the media has not been included at the start of the media. In MP4 terms this is called
    the "moov atom". Many encoders are configured to do this by default, others may require you to choose
    a "fast start" or "optimize for streaming" option.

## Video.js Errors

### vdata123456 errors

This error is thrown when an element that is associated with a component is removed
from the DOM but the event handlers associated with the element are not removed. This
is almost always due to event listeners not being disposed when dispose is called on
a component.

To fix this issue please make sure that all event listeners are cleaned up on dispose.

### Uncaught ReferenceError: X is not defined

Errors like this, where `X` will vary, can be caused by transpilation breaking code that is used in web workers. See the [webpack guide](/guides/webpack) for details of how to prevent this.
