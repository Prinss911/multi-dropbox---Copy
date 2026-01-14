import videojs from 'video.js'
import 'videojs-contrib-quality-levels'

export default defineNuxtPlugin((nuxtApp) => {
    // This ensures the plugin is registered once on client init
    // No need to do anything else as the import side-effect registers it
})
