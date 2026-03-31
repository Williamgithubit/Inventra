import type { AuthUser, UserRole } from "@inventra/types";

export interface JwtClaims {
  sub: string;
  name: string;
  email: string;
  role: UserRole;
  shopId?: string | null;
  exp: number;
  iat: number;
}

export interface AppBindings {
  Variables: {
    authUser: AuthUser;
  };
}
