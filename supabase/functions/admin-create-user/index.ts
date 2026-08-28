import "@supabase/functions-js/edge-runtime.d.ts";

import { withSupabase } from "@supabase/server";

type UserRole = "user" | "admin";

type CreateUserRequest = {
  name: string;
  email: string;
  role: UserRole;
};

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    // --------------------------------------------------
    // 1. Apenas administradores podem criar usuários
    // --------------------------------------------------

    const role = ctx.jwtClaims?.app_metadata?.role;

    const accountStatus = ctx.jwtClaims?.app_metadata?.account_status;

    if (role !== "admin" || accountStatus !== "active") {
      return Response.json(
        {
          message: "Administrator access is required.",
        },
        {
          status: 403,
        },
      );
    }

    // --------------------------------------------------
    // 2. Apenas POST
    // --------------------------------------------------

    if (req.method !== "POST") {
      return Response.json(
        {
          message: "Method not allowed.",
        },
        {
          status: 405,
        },
      );
    }

    // --------------------------------------------------
    // 3. Ler JSON
    // --------------------------------------------------

    let body: CreateUserRequest;

    try {
      body = await req.json();
    } catch {
      return Response.json(
        {
          message: "Invalid JSON body.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------------------
    // 4. Validar dados
    // --------------------------------------------------

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const newUserRole = body.role;

    if (!name) {
      return Response.json(
        {
          message: "Name is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!email) {
      return Response.json(
        {
          message: "Email is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        {
          message: "Invalid email address.",
        },
        {
          status: 400,
        },
      );
    }

    if (newUserRole !== "user" && newUserRole !== "admin") {
      return Response.json(
        {
          message: "Invalid user role.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------------------
    // 5. Criar convite
    // --------------------------------------------------

    const { data, error: inviteError } =
      await ctx.supabaseAdmin.auth.admin.inviteUserByEmail(
        email,
        {
          data: {
            name,
          },
        },
      );

    if (inviteError) {
      console.error("Failed to send invitation:", inviteError);

      return Response.json(
        {
          message: inviteError.message,
        },
        {
          status: 400,
        },
      );
    }

    const { error: updateError } =
      await ctx.supabaseAdmin.auth.admin.updateUserById(data.user.id, {
        app_metadata: {
          ...(data.user.app_metadata ?? {}),
          role: newUserRole,
          account_status: "pending",
        },
      });

    if (updateError) {
      console.error("Failed to assign user role:", updateError);

      return Response.json(
        {
          message: "User was invited, but the role could not be assigned.",
          user: {
            id: data.user.id,
            email: data.user.email,
          },
        },
        {
          status: 500,
        },
      );
    }

    // --------------------------------------------------
    // 6. Sucesso
    // --------------------------------------------------

    return Response.json(
      {
        message: "User created and invitation sent successfully.",
        user: {
          id: data.user.id,
          email: data.user.email,
          role: newUserRole,
        },
      },
      {
        status: 201,
      },
    );
  }),
};
