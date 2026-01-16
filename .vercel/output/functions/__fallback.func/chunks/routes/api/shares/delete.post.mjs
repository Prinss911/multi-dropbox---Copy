import { d as defineEventHandler, r as readBody, c as createError, E as deleteShare } from '../../../_/nitro.mjs';
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

const delete_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { shareId } = body;
  if (!shareId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Share ID is required"
    });
  }
  try {
    const deleted = await deleteShare(shareId);
    if (!deleted) {
      throw createError({
        statusCode: 404,
        statusMessage: "Share link not found"
      });
    }
    return {
      success: true
    };
  } catch (error) {
    if (error.statusCode) throw error;
    console.error("Delete share error:", error);
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || "Failed to delete share"
    });
  }
});

export { delete_post as default };
//# sourceMappingURL=delete.post.mjs.map
