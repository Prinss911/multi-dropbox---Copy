---
source_url: https://videojs.org/guides/vue/
scraped_at: 2026-01-09
---

# Documentation Scraped from https://videojs.org/guides/vue/

## Video.js Guides

These guides cover a range of topics for users of Video.js

[Back to Guides](/guides)

# Vue and Video.js

This is a basic Vue and Video.js player implementation. This example component instantiates the player on `mounted` and destroys it on `beforeDestroy`:

```javascript
<template>
  <div>
    <video ref="videoPlayer" class="video-js"></video>
  </div>
</template>

<script>
import videojs from 'video.js';

export default {
  name: 'VideoPlayer',
  props: {
    options: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      player: null
    }
  },
  mounted() {
    this.player = videojs(this.$refs.videoPlayer, this.options, () => {
      this.player.log('onPlayerReady', this);
    });
  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  }
}
</script>
```

Finally, use the component like this (see [Video.js Options Reference](https://videojs.com/guides/options)):

```javascript
<template>
  <div>
    <video-player :options="videoOptions" />
  </div>
</template>

<script>
import VideoPlayer from '@/components/VideoPlayer.vue';

export default {
  name: 'VideoExample',
  components: {
    VideoPlayer
  },
  data() {
    return {
      videoOptions: {
        autoplay: true,
        controls: true,
        sources: [
          {
            src:
              '/path/to/video.mp4',
              type: 'video/mp4'
          }
        ]
      }
    };
  }
};
</script>
```

Don't forget to include the Video.js CSS, located at `video.js/dist/video-js.css`!
