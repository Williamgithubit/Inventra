import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { z } from "zod";

const currentDir = dirname(fileURLToPath(import.meta.url));
const serverRoot = resolve(currentDir, "..");
const repoRoot = resolve(serverRoot, "../..");

const candidateEnvFiles = [
  resolve(repoRoot, ".env"),
  resolve(repoRoot, ".env.local"),
  resolve(serverRoot, ".env"),
  resolve(serverRoot, ".env.local")
];

function loadEnvFiles() {
  const loadedFiles: string[] = [];

  for (const envPath of candidateEnvFiles) {
    if (!existsSync(envPath)) {
      continue;
    }

    process.loadEnvFile(envPath);
    loadedFiles.push(envPath);
  }

  return loadedFiles;
}

const nonEmptyString = z.string().trim().min(1);

export const loadedEnvFiles = loadEnvFiles();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: nonEmptyString.default("http://localhost:3000"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: nonEmptyString,
  SUPABASE_JWT_SECRET: nonEmptyString.optional(),
  JWT_SECRET: z.string().min(16),
  LOW_STOCK_THRESHOLD: z.coerce.number().int().positive().default(5),
  SUPER_ADMIN_NAME: nonEmptyString.default("Platform Admin"),
  SUPER_ADMIN_EMAIL: z.string().email().default("admin@inventra.app"),
  SUPER_ADMIN_PHONE: nonEmptyString.default("N/A"),
  SUPER_ADMIN_PASSWORD: z.string().min(8),
  SUPER_ADMIN_SETUP_SECRET: nonEmptyString,
  RESEND_API_KEY: nonEmptyString.optional(),
  RESEND_FROM_EMAIL: nonEmptyString.default("Inventra <onboarding@resend.dev>"),
  RESEND_FALLBACK_FROM_EMAIL: nonEmptyString.default("Inventra <onboarding@resend.dev>"),
  RESEND_TEST_EMAIL: z.string().email().optional(),
  ACTIVATION_TOKEN_EXPIRY_HOURS: z.coerce.number().int().positive().default(24),
  CLOUDINARY_CLOUD_NAME: nonEmptyString.optional(),
  CLOUDINARY_API_KEY: nonEmptyString.optional(),
  CLOUDINARY_API_SECRET: nonEmptyString.optional(),
  CLOUDINARY_UPLOAD_FOLDER: nonEmptyString.default("inventra/uploads")
});

export const env = envSchema.parse(process.env);
