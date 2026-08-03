import {
  canAccessPageByRoles,
  getInitialPageForRoles,
  type UserRole,
} from "@/lib/access-control";

export type { UserRole };

export function getInitialPage(userRole: UserRole, scope: string | undefined) {
  return getInitialPageForRoles(userRole, scope);
}

export function canAccessPage(userRole: UserRole, pagePath: string): boolean {
  return canAccessPageByRoles(userRole, pagePath);
}
