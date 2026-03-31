import type { UserRole } from "@inventra/types";

export interface NavItem {
  label: string;
  href: string;
}

export const ownerNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Products", href: "/products" },
  { label: "POS", href: "/pos" },
  { label: "Sales", href: "/sales" }
];

export const adminNav: NavItem[] = [
  { label: "Admin", href: "/admin" },
  { label: "Users", href: "/admin/users" },
  { label: "Shops", href: "/admin/shops" }
];

export function getDefaultRoute(role?: UserRole | null) {
  if (role === "SUPER_ADMIN") {
    return "/admin";
  }

  return "/dashboard";
}
