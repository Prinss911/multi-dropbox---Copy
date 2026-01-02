# Video.js Documentation Reference

Kompilasi dari [Video.js Guides](https://videojs.org/guides/) untuk referensi development.

---

## 📦 Component System

### What is a Component?
Semua UI Video.js adalah **Component** - objek JavaScript dengan:
- DOM element
- Association ke Player
- Kemampuan manage child components
- Event listening/triggering
- Lifecycle (init & dispose)

### Default Component Tree
```
Player
├── MediaLoader (no DOM)
├── PosterImage
├── TextTrackDisplay
├── LoadingSpinner
├── BigPlayButton
├── LiveTracker (no DOM)
├─┬ ControlBar
│ ├── PlayToggle
│ ├── VolumePanel
│ ├── CurrentTimeDisplay (hidden)
│ ├── TimeDivider (hidden)
│ ├── DurationDisplay (hidden)
│ ├─┬ ProgressControl
│ │ └─┬ SeekBar
│ │   ├── LoadProgressBar
│ │   ├── MouseTimeDisplay
│ │   └── PlayProgressBar
│ ├── RemainingTimeDisplay
│ ├── CustomControlSpacer (no UI)
│ ├── PlaybackRateMenuButton
│ ├── ChaptersButton (hidden)
│ ├── SubsCapsButton (hidden)
│ ├── PictureInPictureToggle
│ └── FullscreenToggle
├── ErrorDisplay (hidden)
├── TextTrackSettings
└── ResizeManager (hidden)
```

### Creating Custom Component
```javascript
const Component = videojs.getComponent('Component');

class TitleBar extends Component {
  constructor(player, options = {}) {
    super(player, options);
    if (options.text) {
      this.updateTextContent(options.text);
    }
  }

  createEl() {
    return videojs.dom.createEl('div', {
      className: 'vjs-title-bar'
    });
  }

  updateTextContent(text) {
    videojs.emptyEl(this.el());
    videojs.appendContent(this.el(), text);
  }
}

// Register
videojs.registerComponent('TitleBar', TitleBar);

// Use
player.addChild('TitleBar', {text: 'Video Title'});
```

### Adding Button to ControlBar
```javascript
const button = player.getChild('ControlBar').addChild('button', {
  controlText: 'My Button',
  clickHandler: function(event) {
    console.log('Clicked!');
  }
});
```

---

## 🎨 Skins & Styling

### Creating Custom Skin
1. Add custom class: `player.addClass('my-skin')`
2. Override CSS dengan prefix `.my-skin.video-js`

### Icons
- Default: Icon font
- SVG Icons: Enable dengan `experimentalSvgIcons: true`
- Set icon: `myButton.setIcon('play')`

### Key CSS Classes
| Class | Description |
|-------|-------------|
| `.vjs-control` | Base control element |
| `.vjs-button` | Clickable button |
| `.vjs-menu-button` | Button with popup menu |
| `.vjs-menu-button-popup` | Popup menu button |
| `.vjs-menu` | Menu container |
| `.vjs-lock-showing` | Menu/element is visible |
| `.vjs-hidden` | Hidden element |

---

## 🔌 Plugins

### Basic Plugin
```javascript
function myPlugin(options) {
  // `this` is the player
  this.on('play', function() {
    console.log('Video started!');
  });
}

videojs.registerPlugin('myPlugin', myPlugin);

// Use
player.myPlugin({foo: 'bar'});
```

### Advanced Plugin (Class-based)
```javascript
const Plugin = videojs.getPlugin('plugin');

class MyAdvancedPlugin extends Plugin {
  constructor(player, options) {
    super(player, options);
    // Plugin logic here
  }
}

videojs.registerPlugin('myAdvancedPlugin', MyAdvancedPlugin);
```

---

## 🎣 Hooks

### Available Hooks
| Hook | Description |
|------|-------------|
| `beforesetup` | Before player initialization |
| `setup` | After player initialization |
| `beforeerror` | Before error event |
| `error` | After error event |

### Usage
```javascript
// Add hook
videojs.hook('setup', function(player) {
  console.log('Player created:', player.id());
});

// Add once (auto-removes after first call)
videojs.hookOnce('setup', function(player) {
  // Only runs once
});

// Remove hook
videojs.removeHook('setup', myHookFunction);
```

---

## 📐 Layout Options

### Fluid Mode (Responsive Width)
```javascript
videojs('my-player', {
  fluid: true,
  aspectRatio: '16:9' // or '4:3'
});
```

### Fill Mode (Fill Container)
```javascript
videojs('my-player', {
  fill: true
});
```

### Responsive Mode (Breakpoints)
```javascript
videojs('my-player', {
  responsive: true,
  breakpoints: {
    tiny: 300,
    xsmall: 400,
    small: 500,
    medium: 600,
    large: 700,
    xlarge: 800,
    huge: 900
  }
});
```

Classes applied: `vjs-layout-tiny`, `vjs-layout-small`, etc.

---

## 🎮 Event System

### Listen to Events
```javascript
// On player
player.on('play', function() { /* ... */ });
player.on('pause', function() { /* ... */ });
player.on('ended', function() { /* ... */ });
player.on('timeupdate', function() { /* ... */ });

// Remove listener
player.off('play', myFunction);

// Listen once
player.one('play', function() { /* ... */ });

// Trigger custom event
player.trigger('myCustomEvent');
```

### Common Events
| Event | Description |
|-------|-------------|
| `play` | Playback started |
| `pause` | Playback paused |
| `ended` | Video ended |
| `timeupdate` | Current time changed |
| `loadstart` | Loading started |
| `loadeddata` | Data loaded |
| `volumechange` | Volume changed |
| `fullscreenchange` | Fullscreen toggled |
| `error` | Error occurred |

---

## ⚙️ Player Options

### Initialization
```javascript
videojs('my-player', {
  autoplay: true,
  controls: true,
  muted: false,
  preload: 'auto',
  loop: false,
  fluid: true,
  playbackRates: [0.5, 1, 1.5, 2],
  controlBar: {
    remainingTimeDisplay: {
      displayNegative: true
    },
    fullscreenToggle: true,
    pictureInPictureToggle: true
  },
  sources: [{
    src: '/path/to/video.mp4',
    type: 'video/mp4'
  }]
});
```

### ControlBar Options
```javascript
controlBar: {
  playToggle: true,
  volumePanel: true,
  currentTimeDisplay: true,
  timeDivider: true,
  durationDisplay: true,
  progressControl: true,
  remainingTimeDisplay: true,
  playbackRateMenuButton: true,
  chaptersButton: false,
  descriptionsButton: false,
  subsCapsButton: true,
  audioTrackButton: true,
  pictureInPictureToggle: true,
  fullscreenToggle: true
}
```

---

## 🔧 Troubleshooting

### Common Issues

1. **Video not playing**
   - Check format support (MP4 H.264, WebM, HLS)
   - Verify CORS headers for cross-origin sources
   - Check browser autoplay policies (muted required)

2. **Fullscreen not working**
   - Ensure `allowfullscreen` attribute on iframe
   - Check `fullscreen` option permissions

3. **CORS errors**
   - Add proper `Access-Control-Allow-Origin` headers
   - Use `crossorigin="anonymous"` attribute

### Supported Formats
| Format | Extension | Browser Support |
|--------|-----------|-----------------|
| MP4 (H.264) | .mp4 | All modern browsers |
| WebM (VP8/VP9) | .webm | Chrome, Firefox, Edge |
| HLS | .m3u8 | Safari native, others via hls.js |
| DASH | .mpd | Via dash.js plugin |

---

## 🔗 Useful Links

- [API Docs](https://docs.videojs.com/)
- [Plugins Registry](https://videojs.com/plugins/)
- [GitHub](https://github.com/videojs/video.js)
- [Options Reference](https://videojs.org/guides/options/)
- [Vue Integration](https://videojs.org/guides/vue/)
