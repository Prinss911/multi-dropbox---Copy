import { d as defineEventHandler, g as getRouterParam, c as createError, l as useSupabase } from '../../../../_/nitro.mjs';
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

const view_post = defineEventHandler(async (event) => {
  const shareId = getRouterParam(event, "id");
  if (!shareId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Share ID is required"
    });
  }
  const supabase = useSupabase();
  const { data: shareData, error } = await supabase.from("shares").select("id, expires_at, download_count").eq("id", shareId).single();
  const share = shareData;
  if (error || !share) {
    throw createError({
      statusCode: 404,
      statusMessage: "Share not found"
    });
  }
  if (share.expires_at && new Date(share.expires_at) < /* @__PURE__ */ new Date()) {
    throw createError({
      statusCode: 410,
      statusMessage: "Share link expired"
    });
  }
  const newCount = (share.download_count || 0) + 1;
  const { error: updateError } = await supabase.from("shares").update({ download_count: newCount }).eq("id", shareId);
  if (updateError) {
    console.error("Failed to update view count:", updateError);
  }
  return { success: true, count: (share.download_count || 0) + 1 };
});

export { view_post as default };
//# sourceMappingURL=view.post.mjs.map
