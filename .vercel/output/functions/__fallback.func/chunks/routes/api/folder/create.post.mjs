import { d as defineEventHandler, z as serverSupabaseUser, c as createError, r as readBody, y as serverSupabaseClient } from '../../../_/nitro.mjs';
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

const create_post = defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized"
    });
  }
  const body = await readBody(event);
  const { name } = body;
  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Folder name is required"
    });
  }
  const cleanName = name.trim().replace(/[<>:"/\\|?*]/g, "_");
  if (!cleanName) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid folder name"
    });
  }
  const client = await serverSupabaseClient(event);
  const { data, error } = await client.from("virtual_folders").insert({
    user_id: user.id,
    name: cleanName
  }).select().single();
  if (error) {
    if (error.code === "23505") {
      throw createError({
        statusCode: 409,
        statusMessage: "Folder with this name already exists"
      });
    }
    console.error("Error creating folder:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create folder"
    });
  }
  return {
    success: true,
    folder: {
      id: data.id,
      name: data.name,
      path: `/virtual/${data.name}`,
      type: "folder",
      isPersistent: true
    }
  };
});

export { create_post as default };
//# sourceMappingURL=create.post.mjs.map
