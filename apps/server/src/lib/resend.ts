import https from "node:https";

import { env } from "../env";
import { AppError } from "./errors";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
}

interface ResendApiResponse {
  id?: string;
  message?: string;
  name?: string;
}

function postToResend(body: string) {
  return new Promise<{ statusCode: number; body: string }>((resolve, reject) => {
    const request = https.request(
      "https://api.resend.com/emails",
      {
        method: "POST",
        family: 4,
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body)
        }
      },
      (response) => {
        let responseBody = "";

        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          responseBody += chunk;
        });
        response.on("end", () => {
          resolve({
            statusCode: response.statusCode ?? 500,
            body: responseBody
          });
        });
      }
    );

    request.setTimeout(10_000, () => {
      request.destroy(new Error("Resend request timed out"));
    });

    request.on("error", (error) => {
      reject(error);
    });

    request.write(body);
    request.end();
  });
}

export function isResendConfigured() {
  return Boolean(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL);
}

export async function sendEmail(options: SendEmailOptions) {
  if (!isResendConfigured()) {
    throw new AppError("Resend is not configured", 500);
  }

  const payload = JSON.stringify({
    from: options.from ?? env.RESEND_FROM_EMAIL,
    to: [options.to],
    subject: options.subject,
    html: options.html,
    text: options.text
  });

  try {
    const response = await postToResend(payload);
    const data = (response.body ? JSON.parse(response.body) : {}) as ResendApiResponse;

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw new AppError(data.message ?? data.name ?? "Unable to send email with Resend", 502);
    }

    return {
      id: data.id ?? null
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(error instanceof Error ? error.message : "Unable to send email with Resend", 502);
  }
}
