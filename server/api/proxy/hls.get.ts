
import { defineEventHandler, getQuery, setHeader, sendStream } from 'h3'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const targetUrl = query.url as string

    if (!targetUrl) {
        throw createError({ statusCode: 400, statusMessage: 'URL is required' })
    }

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        })

        if (!response.ok) {
            throw createError({ statusCode: response.status, statusMessage: 'Failed to fetch upstream' })
        }

        // Forward content type
        const contentType = response.headers.get('content-type')
        if (contentType) setHeader(event, 'Content-Type', contentType)

        // Set CORS headers
        setHeader(event, 'Access-Control-Allow-Origin', '*')
        setHeader(event, 'Access-Control-Allow-Methods', 'GET, OPTIONS')
        setHeader(event, 'Access-Control-Allow-Headers', '*')

        // Check if it's a playlist that needs rewriting
        if (contentType?.includes('mpegurl') || targetUrl.includes('.m3u8')) {
            const text = await response.text()

            // Get current host to construct recursive proxy URLs
            const host = getHeader(event, 'host') || 'localhost:3000'
            const protocol = host.includes('localhost') ? 'http' : 'https'
            const proxyBase = `${protocol}://${host}/api/proxy/hls?url=`

            // Rewrite absolute URLs
            // We match https://... and encode it
            // HLS files might have URIs in quotes (URI="...") or plain lines
            const rewritten = text.replace(/(https?:\/\/[^\s"\n]+)/g, (match) => {
                return proxyBase + encodeURIComponent(match)
            })

            return rewritten
        }

        // For binary content (segments), just stream it
        // Check if response.body is valid for sendStream
        if (response.body) {
            // @ts-ignore
            return sendStream(event, response.body)
        } else {
            const arrayBuffer = await response.arrayBuffer()
            return Buffer.from(arrayBuffer)
        }

    } catch (error: any) {
        console.error('HLS Proxy error:', error)
        throw createError({ statusCode: 500, statusMessage: 'Proxy error' })
    }
})
