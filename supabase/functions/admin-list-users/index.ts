import "@supabase/functions-js/edge-runtime.d.ts";

import { withSupabase } from "@supabase/server";

const PAGE_SIZE = 1000;

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "GET") {
      return Response.json({ message: "Method not allowed." }, { status: 405 });
    }

    if (ctx.jwtClaims?.app_metadata?.role !== "admin" ||
      ctx.jwtClaims?.app_metadata?.account_status !== "active") {
      return Response.json({ message: "Administrator access is required." }, { status: 403 });
    }

    const users = [];
    let page = 1;

    while (true) {
      const { data, error } = await ctx.supabaseAdmin.auth.admin.listUsers({
        page,
        perPage: PAGE_SIZE,
      });

      if (error) {
        console.error("Failed to list users:", error);
        return Response.json({ message: "Unable to list users." }, { status: 500 });
      }

      for (const user of data.users) {
        users.push({
          id: user.id,
          name: typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null,
          email: user.email ?? null,
          role: user.app_metadata?.role === "admin" ? "admin" : "user",
          status: user.app_metadata?.account_status === "active" ? "active" : "pending",
          createdAt: user.created_at,
          lastSignInAt: user.last_sign_in_at ?? null,
        });
      }

      if (data.users.length < PAGE_SIZE) break;
      page += 1;
    }

    return Response.json({ users }, { status: 200 });
  }),
};
