import { hash } from "bcryptjs";

import type { SuperAdminSetupInput, SuperAdminSetupResult } from "@inventra/types";
import { mapUser } from "../lib/mappers";

import { env } from "../env";
import { AppError } from "../lib/errors";
import { sendEmail } from "../lib/resend";
import { uploadImage } from "../lib/cloudinary";
import { supabase } from "../lib/supabase";
import { issueSession } from "./auth-service";

async function getExistingSuperAdmin() {
  const adminQuery = await supabase
    .from("users")
    .select("*")
    .eq("role", "SUPER_ADMIN")
    .order("created_at", { ascending: true })
    .limit(1);

  if (adminQuery.error) {
    throw new AppError(adminQuery.error.message, 500);
  }

  return adminQuery.data?.[0] ?? null;
}

async function getUserByEmail(email: string) {
  const userQuery = await supabase.from("users").select("*").eq("email", email).maybeSingle();

  if (userQuery.error) {
    throw new AppError(userQuery.error.message, 500);
  }

  return userQuery.data ?? null;
}

function resolveInput(input: SuperAdminSetupInput) {
  return {
    name: input.name?.trim() || env.SUPER_ADMIN_NAME,
    email: input.email?.trim().toLowerCase() || env.SUPER_ADMIN_EMAIL.trim().toLowerCase(),
    phone: input.phone?.trim() || env.SUPER_ADMIN_PHONE,
    password: input.password || env.SUPER_ADMIN_PASSWORD,
    sendWelcomeEmail: input.sendWelcomeEmail,
    avatar: input.avatar,
    avatarPublicId: input.avatarPublicId
  };
}

async function sendWelcomeEmail(name: string, email: string) {
  const loginUrl = `${env.CORS_ORIGIN.replace(/\/$/, "")}/login`;

  return sendEmail({
    to: email,
    subject: "Your Inventra super admin account is ready",
    text: [
      `Hello ${name},`,
      "",
      "Your Inventra super admin account is ready.",
      `Email: ${email}`,
      `Login: ${loginUrl}`,
      "Use the password that was configured during the admin setup request.",
      `Please sign in within ${env.ACTIVATION_TOKEN_EXPIRY_HOURS} hours and change your password after the first login.`
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h2>Inventra super admin account</h2>
        <p>Hello ${name},</p>
        <p>Your Inventra super admin account is ready.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p>
          <a href="${loginUrl}" style="color: #2563eb;">Sign in to Inventra</a>
        </p>
        <p>Use the password that was configured during the admin setup request.</p>
        <p>
          Please sign in within ${env.ACTIVATION_TOKEN_EXPIRY_HOURS} hours and change your password
          after the first login.
        </p>
      </div>
    `
  });
}

export async function setupSuperAdmin(input: SuperAdminSetupInput): Promise<SuperAdminSetupResult> {
  if (input.setupSecret !== env.SUPER_ADMIN_SETUP_SECRET) {
    throw new AppError("Invalid super admin setup secret", 403);
  }

  const resolvedInput = resolveInput(input);
  const existingSuperAdmin = await getExistingSuperAdmin();
  const existingEmailUser = await getUserByEmail(resolvedInput.email);

  if (existingEmailUser && existingEmailUser.role !== "SUPER_ADMIN" && existingEmailUser.id !== existingSuperAdmin?.id) {
    throw new AppError("That email is already in use by another account", 409);
  }

  const password = await hash(resolvedInput.password, 10);
  let created = false;
  let userRow: Record<string, unknown> | null = null;

  if (existingSuperAdmin) {
    const updateQuery = await supabase
      .from("users")
      .update({
        name: resolvedInput.name,
        email: resolvedInput.email,
        password,
        role: "SUPER_ADMIN"
      })
      .eq("id", existingSuperAdmin.id)
      .select("*")
      .single();

    if (updateQuery.error || !updateQuery.data) {
      throw new AppError(updateQuery.error?.message ?? "Unable to update the super admin account", 500);
    }

    userRow = updateQuery.data;
  } else {
    const insertQuery = await supabase
      .from("users")
      .insert({
        name: resolvedInput.name,
        email: resolvedInput.email,
        password,
        role: "SUPER_ADMIN"
      })
      .select("*")
      .single();

    if (insertQuery.error || !insertQuery.data) {
      throw new AppError(insertQuery.error?.message ?? "Unable to create the super admin account", 500);
    }

    created = true;
    userRow = insertQuery.data;
  }

  if (!userRow) {
    throw new AppError("Unable to resolve the persisted super admin account", 500);
  }

  const user = mapUser(userRow);
  const session = await issueSession({
    ...user,
    shopId: null
  });

  let avatarUpload = null;

  if (resolvedInput.avatar) {
    avatarUpload = await uploadImage({
      file: resolvedInput.avatar,
      publicId: resolvedInput.avatarPublicId
    });
  }

  let emailDelivery: SuperAdminSetupResult["emailDelivery"] = {
    attempted: resolvedInput.sendWelcomeEmail,
    status: resolvedInput.sendWelcomeEmail ? "failed" : "skipped",
    recipient: resolvedInput.email,
    providerMessageId: null
  };

  if (resolvedInput.sendWelcomeEmail) {
    try {
      const emailResult = await sendWelcomeEmail(
        resolvedInput.name,
        resolvedInput.email
      );

      emailDelivery = {
        attempted: true,
        status: "sent",
        recipient: resolvedInput.email,
        providerMessageId: emailResult.id
      };
    } catch (error) {
      emailDelivery = {
        attempted: true,
        status: "failed",
        recipient: resolvedInput.email,
        providerMessageId: null,
        error: error instanceof Error ? error.message : "Unable to send the welcome email"
      };
    }
  }

  return {
    created,
    phone: resolvedInput.phone,
    session,
    emailDelivery,
    avatarUpload
  };
}
