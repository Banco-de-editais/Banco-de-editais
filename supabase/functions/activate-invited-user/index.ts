import "@supabase/functions-js/edge-runtime.d.ts";

import { withSupabase } from "@supabase/server";

type ActivateAccountRequest = {
  password: string;
};

function isStrongPassword(password: string): boolean {
  return password.length >= 12 &&
    password.length <= 128 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password);
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return Response.json({ message: "Method not allowed." }, { status: 405 });
    }

    const userId = ctx.jwtClaims?.sub;
    if (!userId) {
      return Response.json({ message: "Authentication is required." }, { status: 401 });
    }

    let body: ActivateAccountRequest;

    try {
      body = await req.json();
    } catch {
      return Response.json({ message: "Invalid JSON body." }, { status: 400 });
    }

    const password = typeof body.password === "string" ? body.password : "";

    if (!isStrongPassword(password)) {
      return Response.json(
        { message: "Password must be 12 to 128 characters and include upper-case, lower-case, and numeric characters." },
        { status: 400 },
      );
    }

    // Read the current metadata from Auth rather than trusting a potentially
    // stale JWT. Only the server can move an account out of the pending state.
    const { data: userData, error: userError } =
      await ctx.supabaseAdmin.auth.admin.getUserById(userId);

    if (userError || !userData.user) {
      console.error("Failed to read invited user:", userError);
      return Response.json({ message: "Unable to validate the invitation." }, { status: 401 });
    }

    const appMetadata = userData.user.app_metadata ?? {};

    if (appMetadata.account_status !== "pending") {
      return Response.json(
        { message: "This invitation has already been used or is no longer valid." },
        { status: 409 },
      );
    }

    // Password and activation state are updated in the same Auth operation.
    // A caller cannot activate an account without submitting the new password.
    const { error: updateError } = await ctx.supabaseAdmin.auth.admin.updateUserById(userId, {
      password,
      app_metadata: {
        ...appMetadata,
        account_status: "active",
      },
    });

    if (updateError) {
      console.error("Failed to activate invited user:", updateError);
      return Response.json({ message: "Unable to activate the account." }, { status: 500 });
    }

    return Response.json({ message: "Account activated." }, { status: 200 });
  }),
};
