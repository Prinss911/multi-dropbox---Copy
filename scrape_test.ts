
import { fetch } from 'ofetch'

const url = "https://www.dropbox.com/scl/fi/bioydtljxxtrh5wuqnmxb/Astronime-E1-1080p.mp4?rlkey=lsgfu7mobydvn2lz0bj6n03fq&e=1&st=viib5fqs&dl=0"

async function run() {
    try {
        console.log("Fetching: " + url)
        const html = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        })

        console.log(`HTML Length: ${html.length}`)

        // Logic from transcode.get.ts
        const prefetchMatches = html.matchAll(/registerStreamedPrefetch\s*\(\s*"[^"]*"\s*,\s*"([^"]*)"/g)
        let hlsUrl = null

        let matchCount = 0
        for (const match of prefetchMatches) {
            matchCount++
            const blob = match[1]
            try {
                // Decode Base64
                const decoded = Buffer.from(blob, 'base64').toString('utf-8')

                // console.log("Decoded blob partial:", decoded.substring(0, 100))

                // Find HLS master playlist URL
                // We will relax the regex to find ANY m3u8
                const urlMatch = decoded.match(/(https:\/\/[^"]+\.m3u8[^"]*)/)
                if (urlMatch) {
                    console.log("FOUND HLS URL in blob:")
                    console.log(urlMatch[1])
                    hlsUrl = urlMatch[1]
                    break
                }
            } catch (err) {
                console.error("Error decoding blob")
            }
        }

        console.log(`Checked ${matchCount} prefetch blobs.`)

    } catch (e) {
        console.error(e)
    }
}

run()
