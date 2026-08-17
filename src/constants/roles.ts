import type { UserRole } from "@/types/database";

export const USER_ROLE = {
  CUSTOMER: "customer",
  STAFF: "staff",
  ADMIN: "admin",
} as const satisfies Record<string, UserRole>;

/** Routes that require authentication + the matching role(s). */
export const PROTECTED_ROUTE_ROLES: { prefix: string; roles: UserRole[] }[] = [
  { prefix: "/staff", roles: ["staff", "admin"] },
  { prefix: "/admin", roles: ["admin"] },
];
