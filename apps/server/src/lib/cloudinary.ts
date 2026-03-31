import { createHash, randomUUID } from "node:crypto";

import type { CloudinaryAsset } from "@inventra/types";

import { env } from "../env";
import { AppError } from "./errors";

interface UploadImageOptions {
  file: string;
  publicId?: string;
  folder?: string;
}

interface CloudinaryResponse {
  public_id?: string;
  secure_url?: string;
  bytes?: number;
  format?: string;
  width?: number;
  height?: number;
  error?: {
    message?: string;
  };
}

export function isCloudinaryConfigured() {
  return Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
}

function buildSignature(params: Record<string, string | number | undefined>) {
  const serializedParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1")
    .update(`${serializedParams}${env.CLOUDINARY_API_SECRET}`)
    .digest("hex");
}

export async function uploadImage(options: UploadImageOptions): Promise<CloudinaryAsset> {
  if (!isCloudinaryConfigured()) {
    throw new AppError("Cloudinary is not configured", 500);
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = options.folder ?? env.CLOUDINARY_UPLOAD_FOLDER;
  const publicId = options.publicId ?? randomUUID();
  const signature = buildSignature({
    folder,
    public_id: publicId,
    timestamp
  });

  const formData = new FormData();
  formData.set("file", options.file);
  formData.set("api_key", env.CLOUDINARY_API_KEY ?? "");
  formData.set("timestamp", String(timestamp));
  formData.set("signature", signature);
  formData.set("folder", folder);
  formData.set("public_id", publicId);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData
    }
  );

  const data = (await response.json()) as CloudinaryResponse;

  if (!response.ok || data.error) {
    throw new AppError(data.error?.message ?? "Unable to upload image to Cloudinary", 502);
  }

  if (!data.public_id || !data.secure_url) {
    throw new AppError("Cloudinary upload did not return the uploaded asset metadata", 502);
  }

  return {
    publicId: data.public_id,
    secureUrl: data.secure_url,
    bytes: data.bytes ?? 0,
    format: data.format ?? null,
    width: data.width ?? null,
    height: data.height ?? null
  };
}
