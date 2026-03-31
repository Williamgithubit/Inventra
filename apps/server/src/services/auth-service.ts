import { compare, hash } from "bcryptjs";
import { sign } from "hono/jwt";

import type { AuthSession, AuthUser, LoginInput, RegisterInput } from "@inventra/types";
import { mapUser } from "../lib/mappers";

import { env } from "../env";
import { AppError } from "../lib/errors";
import { supabase } from "../lib/supabase";

function buildTokenPayload(user: AuthUser) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60 * 24 * 7;

  return {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    shopId: user.shopId ?? null,
    iat,
    exp
  };
}

export async function issueSession(user: AuthUser): Promise<AuthSession> {
  const accessToken = await sign(buildTokenPayload(user), env.JWT_SECRET);

  return {
    accessToken,
    user
  };
}

export async function registerShopOwner(input: RegisterInput) {
  const normalizedEmail = input.email.trim().toLowerCase();

  const existingUserQuery = await supabase
    .from("users")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existingUserQuery.error) {
    throw new AppError(existingUserQuery.error.message, 500);
  }

  if (existingUserQuery.data) {
    throw new AppError("An account with that email already exists", 409);
  }

  const password = await hash(input.password, 10);

  const userInsert = await supabase
    .from("users")
    .insert({
      name: input.name,
      email: normalizedEmail,
      password,
      role: "SHOP_OWNER"
    })
    .select("*")
    .single();

  if (userInsert.error || !userInsert.data) {
    throw new AppError(userInsert.error?.message ?? "Unable to create user", 500);
  }

  const user = mapUser(userInsert.data);

  const shopInsert = await supabase
    .from("shops")
    .insert({
      name: input.shopName,
      owner_id: user.id
    })
    .select("*")
    .single();

  if (shopInsert.error || !shopInsert.data) {
    throw new AppError(shopInsert.error?.message ?? "Unable to create shop", 500);
  }

  const shopId = String(shopInsert.data.id);

  const subscriptionInsert = await supabase.from("subscriptions").insert({
    shop_id: shopId,
    status: "TRIAL"
  });

  if (subscriptionInsert.error) {
    throw new AppError(subscriptionInsert.error.message, 500);
  }

  return issueSession({
    ...user,
    shopId
  });
}

export async function login(input: LoginInput) {
  const normalizedEmail = input.email.trim().toLowerCase();

  const userQuery = await supabase
    .from("users")
    .select("*")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (userQuery.error) {
    throw new AppError(userQuery.error.message, 500);
  }

  if (!userQuery.data?.password) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatches = await compare(input.password, String(userQuery.data.password));

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  const user = mapUser(userQuery.data);
  let shopId: string | null = null;

  if (user.role === "SHOP_OWNER") {
    const shopQuery = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (shopQuery.error) {
      throw new AppError(shopQuery.error.message, 500);
    }

    shopId = shopQuery.data ? String(shopQuery.data.id) : null;
  }

  return issueSession({
    ...user,
    shopId
  });
}
