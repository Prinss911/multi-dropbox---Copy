---
source_url: https://videojs.org/guides/webpack/
scraped_at: 2026-01-09
---

# Documentation Scraped from https://videojs.org/guides/webpack/

## Video.js Guides

These guides cover a range of topics for users of Video.js

[Back to Guides](/guides)

# Webpack and Video.js

## Table of Contents

* [Video.js CSS:](#videojs-css)

Video.js and official libraries and plugins work in a Webpack-based build environment, however some configuration may be needed to ensure code that is executed in workers is not broken by transpilation.

The solutions [documented by the Mapbox project](https://docs.mapbox.com/mapbox-gl-js/guides/install/#targeting-transpilation-to-es6-with-browserslist) apply:

1. Either set the production `browserslist` to

```javascript
">0.2%",
"not dead",
"not op_mini all",
"not safari < 10",
"not chrome < 51",
"not android < 5",
"not ie < 12"
```

2. Or import using the ! syntax

```javascript
// eslint-disable-next-line import/no-webpack-loader-syntax
import videojs from "!video.js";
```

## Video.js CSS:

You may need to add [`style-loader`](https://webpack.js.org/loaders/style-loader/) to your Webpack configuration.

Then add the CSS that the player requires, add the following to the file where the player is also included or initialized:

```javascript
require('!style-loader!css-loader!video.js/dist/video-js.css')
```
