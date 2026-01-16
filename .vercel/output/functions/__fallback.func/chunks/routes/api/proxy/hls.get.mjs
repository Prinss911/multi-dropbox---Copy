import { d as defineEventHandler, q as getQuery, c as createError, x as setHeader, o as getHeader, C as sendStream } from '../../../_/nitro.mjs';
import 'crypto';
import 'util';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:crypto';
import 'node:util';
import 'node:path';
import 'node:process';
import 'node:tty';
import 'node:fs';

const hls_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const targetUrl = query.url;
  if (!targetUrl) {
    throw createError({ statusCode: 400, statusMessage: "URL is required" });
  }
  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (!response.ok) {
      throw createError({ statusCode: response.status, statusMessage: "Failed to fetch upstream" });
    }
    const contentType = response.headers.get("content-type");
    if (contentType) setHeader(event, "Content-Type", contentType);
    setHeader(event, "Access-Control-Allow-Origin", "*");
    setHeader(event, "Access-Control-Allow-Methods", "GET, OPTIONS");
    setHeader(event, "Access-Control-Allow-Headers", "*");
    if ((contentType == null ? void 0 : contentType.includes("mpegurl")) || targetUrl.includes(".m3u8")) {
      const text = await response.text();
      const host = getHeader(event, "host") || "localhost:3000";
      const protocol = host.includes("localhost") ? "http" : "https";
      const proxyBase = `${protocol}://${host}/api/proxy/hls?url=`;
      const rewritten = text.replace(/(https?:\/\/[^\s"\n]+)/g, (match) => {
        return proxyBase + encodeURIComponent(match);
      });
      return rewritten;
    }
    if (response.body) {
      return sendStream(event, response.body);
    } else {
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }
  } catch (error) {
    console.error("HLS Proxy error:", error);
    throw createError({ statusCode: 500, statusMessage: "Proxy error" });
  }
});

export { hls_get as default };
//# sourceMappingURL=hls.get.mjs.map
