---
source_url: https://videojs.org/guides/picture-in-picture/
scraped_at: 2026-01-09
---

# Documentation Scraped from https://videojs.org/guides/picture-in-picture/

## Video.js Guides

These guides cover a range of topics for users of Video.js

[Back to Guides](/guides)

# Picture-in-Picture Options

## Table of Contents

* [Picture-in-Picture Types](#picture-in-picture-types)
  + [Video element PiP](#video-element-pip)
  + [Document PiP](#document-pip)
  + [Browser native PiP](#browser-native-pip)
* [Options](#options)

Picture-in-picture (PiP) is a mode where the video is shown in a window on top of the browser, so the video can be watched while multitasking. Browsers have different PiP capabilities and the options available differ.

## Picture-in-Picture Types

* Video element PiP
* Document PiP
* Browser native - the browser's proprietary PiP implementation that is not controllable by API

### Video element PiP

This picture-in-picture mode is now available on most browsers but notably not Firefox. The video element can be put into a separate window.

This mode has limitations which may make it unsuitable for some use cases. Since only the video is in the PiP window, Video.js player controls will not be displayed, nor will emulated text tracks or any overlays or interactive elements. This mode is also not useful if the video source will change, especially for advertising. If needed, it [can be disabled](/guides/options/#disablepictureinpicture).

By default this mode is enabled if the browser supports the [picture-in-picture API](https://developer.mozilla.org/en-US/docs/Web/API/Picture-in-Picture_API). If the Document PiP mode is enabled on a browser that supports it, that will take precedence.

### Document PiP

*Added in v8.3.0*

[Document picture-in-picture](https://developer.chrome.com/docs/web-platform/document-picture-in-picture/) is an improved approach where the whole player element can be placed in a PiP window rather than just the video. This allows player controls, text tracks, overlays to be used.

Currently this is supported on Chrome and Edge 116 and above. The player at [videojs.com](/) will use this mode on supported browsers.

At this time this mode defaults to off, but [can be simply enabled with a player option](/guides/options/#enabledocumentpictureinpicture). If enabled, and supported by the browser, this takes prcedence over the video picture-in-picture mode.

### Browser native PiP

Firefox does not implement the picture-in-picture API. Instead it has a proprietary picture-in-picture mode. It displays a PiP button on top of the video.

It is not possible to customize or remove this button programatically, nor is it possible to initiate PiP from a custom control. The Video.js picture-in-picture options have no effect.

## Options

The video element PiP (vPiP) [`disablePictureInPicture`](/guides/options/#disablepictureinpicture) and document PiP (docPiP) [`enableDocumentPictureInPicture`](/guides/options/#enabledocumentpictureinpicture) options work independently of each other, so it's possible to use the improved document PiP mode on browsers that support it while disabling the video element PiP mode on browsers that don't.

| disablePictureInPicture | enableDocumentPictureInPicture | Effect\* |
| --- | --- | --- |
| `false` (default) | `false` (default) | vPiP used on browsers that support it. |
| `false` (default) | `true` | docPiP will be used if the browser supports it, otherwise vPiP used on browsers that support it. |
| `true` | `true` | docPiP will be used if the browser supports it. vPiP will not be used. |
| `true` | `false` (default) | Neither docPiP not vPiP will be used. |

*\* None of these options can have any effect on Firefox's behaviour.*
