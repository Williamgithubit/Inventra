import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const APP_NAME = "Inventra";
export const AUTH_COOKIE_NAME = "inventra_auth";
export const AUTH_STORAGE_KEY = "inventra.session";
export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatDateTime(value: string | number | Date, locale = "en-US") {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function isLowStock(quantity: number, threshold = DEFAULT_LOW_STOCK_THRESHOLD) {
  return quantity <= threshold;
}

export function buildReceiptNumber(id: string) {
  return `INV-${id.slice(0, 8).toUpperCase()}`;
}

export function formatRoleLabel(role: string) {
  return role
    .toLowerCase()
    .split("_")
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
