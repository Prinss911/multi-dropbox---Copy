# Video.js Control Bar - Deep Reference

Dokumentasi mendalam tentang `vjs-control-bar` untuk memahami struktur, styling, dan customization.

---

## 📍 Struktur Dasar

### DOM Structure
```html
<div class="vjs-control-bar" dir="ltr">
  <!-- Children components rendered here in order -->
  <button class="vjs-play-control vjs-control vjs-button">...</button>
  <div class="vjs-volume-panel vjs-control">...</div>
  <div class="vjs-current-time vjs-time-control">...</div>
  <!-- ... more children ... -->
</div>
```

### Default Children Order (dari source code)
```javascript
ControlBar.prototype.options_ = {
  children: [
    'playToggle',           // 0: Play/Pause button
    'skipBackward',         // 1: Skip backward (hidden by default)
    'skipForward',          // 2: Skip forward (hidden by default)
    'volumePanel',          // 3: Volume slider + mute
    'currentTimeDisplay',   // 4: Current time (hidden by default)
    'timeDivider',          // 5: "/" separator (hidden by default)
    'durationDisplay',      // 6: Total duration (hidden by default)
    'progressControl',      // 7: Progress/seek bar
    'liveDisplay',          // 8: "LIVE" indicator (hidden for VOD)
    'seekToLive',           // 9: Seek to live button (hidden for VOD)
    'remainingTimeDisplay', // 10: Remaining time "-XX:XX"
    'customControlSpacer',  // 11: Flexible spacer (flex: 1)
    'playbackRateMenuButton', // 12: Speed selector (hidden by default)
    'chaptersButton',       // 13: Chapters (hidden if no tracks)
    'descriptionsButton',   // 14: Audio descriptions (hidden if no tracks)
    'subsCapsButton',       // 15: Subtitles/Captions (hidden if no tracks)
    'audioTrackButton',     // 16: Audio tracks (hidden if no tracks)
    'pictureInPictureToggle', // 17: PiP button
    'fullscreenToggle'      // 18: Fullscreen button
  ]
}
```

---

## 🎨 CSS Foundation (dari video.js source)

### Base Styles
```scss
.video-js .vjs-control-bar {
  display: none;              // Hidden initially
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3.0em;              // ~48px at 16px base
  background-color: rgba(43, 51, 63, 0.7);  // Semi-transparent dark
}
```

### Visibility States
```scss
// Video has started → show control bar
.vjs-has-started .vjs-control-bar {
  display: flex;              // FLEXBOX LAYOUT
  visibility: visible;
  opacity: 1;
  transition: visibility 0.1s, opacity 0.1s;
}

// User inactive while playing → fade out
.vjs-has-started.vjs-user-inactive.vjs-playing .vjs-control-bar {
  visibility: visible;        // Keep for screen readers
  opacity: 0;                 // Fade out visually
  pointer-events: none;       // Disable clicks
  transition: visibility 1.0s, opacity 1.0s;
}

// Controls disabled/native/error → completely hidden
.vjs-controls-disabled .vjs-control-bar,
.vjs-using-native-controls .vjs-control-bar,
.vjs-error .vjs-control-bar {
  display: none !important;
}

// Force show (for menus)
.video-js:not(.vjs-controls-disabled) .vjs-control-bar.vjs-lock-showing {
  display: flex !important;
}
```

---

## 📐 Flexbox Layout

### Key Points
1. Control bar menggunakan `display: flex` (bukan block/grid)
2. Children di-render sesuai urutan array `children`
3. `customControlSpacer` memiliki `flex: 1` untuk push items ke kanan

### Default Flex Behavior
```scss
// Dari video.js defaults
.vjs-control {
  flex: none;                 // Tidak grow/shrink
  width: 4em;                 // Fixed width untuk buttons
  height: 100%;
}

// Spacer untuk push ke kanan
.vjs-custom-control-spacer {
  flex: 1 1 auto;            // Mengisi ruang tersedia
}

// Progress bar biasanya flex juga
.vjs-progress-control {
  flex: auto;                // Atau custom width
}
```

### Visual Layout Example
```
┌─────────────────────────────────────────────────────────────────┐
│ [▶] [⏪] [⏩] [🔊] | 0:00 / 22:52      ═══════════▓═══      [⚙] [⛶] │
│ Play Skip  Skip Vol  Time            Progress      Spacer  PiP Full│
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Customization Methods

### 1. Via Player Options (Recommended)
```javascript
videojs('my-player', {
  controlBar: {
    // Enable hidden components
    playbackRateMenuButton: true,
    currentTimeDisplay: true,
    timeDivider: true,
    durationDisplay: true,
    
    // Disable unwanted components
    pictureInPictureToggle: false,
    chaptersButton: false,
    
    // Reorder completely
    children: [
      'playToggle',
      'volumePanel',
      'currentTimeDisplay',
      'progressControl',
      'remainingTimeDisplay',
      'customControlSpacer',
      'fullscreenToggle'
    ]
  }
});
```

### 2. Via CSS (Order Property)
```css
/* Override visual order tanpa mengubah DOM */
.video-js .vjs-play-control { order: 1; }
.video-js .vjs-volume-panel { order: 2; }
.video-js .vjs-current-time { order: 3; }
.video-js .vjs-progress-control { order: 4; }
.video-js .vjs-fullscreen-control { order: 99; }
```

### 3. Via JavaScript (Runtime)
```javascript
const player = videojs('my-player');

// Add custom component
player.getChild('controlBar').addChild('button', {
  controlText: 'My Button',
  className: 'vjs-my-button',
  clickHandler: () => console.log('clicked')
});

// Remove component
player.getChild('controlBar').removeChild('chaptersButton');

// Get component reference
const playButton = player.getChild('controlBar').getChild('playToggle');
```

---

## 📋 Component Class Reference

| Component Name | CSS Class | Default State | Description |
|---------------|-----------|---------------|-------------|
| `playToggle` | `.vjs-play-control` | Visible | Play/Pause button |
| `skipBackward` | `.vjs-skip-backward` | Hidden | Skip back N seconds |
| `skipForward` | `.vjs-skip-forward` | Hidden | Skip forward N seconds |
| `volumePanel` | `.vjs-volume-panel` | Visible | Volume + mute |
| `currentTimeDisplay` | `.vjs-current-time` | Hidden | Current playback time |
| `timeDivider` | `.vjs-time-divider` | Hidden | "/" between times |
| `durationDisplay` | `.vjs-duration` | Hidden | Total duration |
| `progressControl` | `.vjs-progress-control` | Visible | Seek bar |
| `liveDisplay` | `.vjs-live-display` | Hidden (VOD) | "LIVE" text |
| `seekToLive` | `.vjs-seek-to-live` | Hidden (VOD) | Return to live edge |
| `remainingTimeDisplay` | `.vjs-remaining-time` | Visible | Remaining "-XX:XX" |
| `customControlSpacer` | `.vjs-custom-control-spacer` | Visible | Flex spacer |
| `playbackRateMenuButton` | `.vjs-playback-rate` | Hidden | Speed selector |
| `chaptersButton` | `.vjs-chapters-button` | Hidden | Chapter selector |
| `descriptionsButton` | `.vjs-descriptions-button` | Hidden | Audio descriptions |
| `subsCapsButton` | `.vjs-subs-caps-button` | Hidden | Subtitles/CC |
| `audioTrackButton` | `.vjs-audio-button` | Hidden | Audio track selector |
| `pictureInPictureToggle` | `.vjs-picture-in-picture-control` | Visible | PiP button |
| `fullscreenToggle` | `.vjs-fullscreen-control` | Visible | Fullscreen button |

---

## 🎯 CSS State Classes (pada .video-js)

| Class | Meaning |
|-------|---------|
| `.vjs-has-started` | Video sudah mulai play minimal 1x |
| `.vjs-playing` | Sedang playing (bukan paused) |
| `.vjs-paused` | Sedang paused |
| `.vjs-user-active` | User baru saja interact |
| `.vjs-user-inactive` | User idle (mouse tidak gerak) |
| `.vjs-ended` | Video sudah selesai |
| `.vjs-fullscreen` | Player dalam fullscreen |
| `.vjs-controls-disabled` | Controls dimatikan |

---

## ⚠️ Common Pitfalls & Solutions

### 1. Progress Bar Tidak Full Width
**Problem:** Progress bar collapse atau tidak full width
**Solution:**
```css
.video-js .vjs-progress-control {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
}
.video-js .vjs-progress-holder {
  width: 100% !important;
  margin: 0 !important;
}
```

### 2. Menu Muncul Saat Hover
**Problem:** Menu button (quality, playback rate) muncul saat di-hover
**Solution:**
```css
/* Sembunyikan default hover */
.vjs-menu-button-popup .vjs-menu {
  display: none !important;
}
.vjs-menu-button-popup:hover .vjs-menu {
  display: none !important;
}
/* Hanya tampil saat clicked */
.vjs-menu-button-popup .vjs-menu.vjs-lock-showing {
  display: block !important;
}
```

### 3. Elemen Tidak Sejajar Vertikal
**Problem:** Icons dan text tidak aligned
**Solution:**
```css
.video-js .vjs-control-bar > * {
  display: flex;
  align-items: center;
  height: 100%;
}
/* Time display khusus */
.video-js .vjs-time-control span {
  line-height: 48px; /* Match control bar height */
}
```

### 4. Custom Button Tidak Muncul
**Problem:** addChild() tidak menampilkan button
**Solution:**
```javascript
// Pastikan component registered
videojs.registerComponent('MyButton', MyButtonClass);
// Gunakan nama yang benar (camelCase)
player.getChild('controlBar').addChild('MyButton');
```

---

## 🔗 Related Files di Project Ini

- Player component: `pages/download/[id].vue`
- Custom quality selector: Line 459-600
- CSS overrides: Line 700-1100+

## 📚 Official References

- [Video.js Components Guide](https://videojs.org/guides/components/)
- [ControlBar API](https://docs.videojs.com/ControlBar.html)
- [Source: control-bar.js](https://github.com/videojs/video.js/blob/main/src/js/control-bar/control-bar.js)
- [Source: _control-bar.scss](https://github.com/videojs/video.js/blob/main/src/css/components/_control-bar.scss)
