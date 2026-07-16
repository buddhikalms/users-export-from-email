export const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "SUPPORT_ADMIN",
  "BILLING_ADMIN",
  "OPERATIONS_ADMIN",
  "SECURITY_ADMIN",
  "READ_ONLY_ADMIN",
] as const;

export type AdminRoleName = (typeof ADMIN_ROLES)[number];

export type AdminPermission =
  | "admin:view"
  | "users:manage"
  | "workspaces:manage"
  | "billing:manage"
  | "licences:manage"
  | "queues:manage"
  | "workers:manage"
  | "jobs:manage"
  | "integrations:manage"
  | "logs:view"
  | "security:manage"
  | "settings:manage";

const ROLE_PERMISSIONS: Record<AdminRoleName, AdminPermission[]> = {
  SUPER_ADMIN: [
    "admin:view",
    "users:manage",
    "workspaces:manage",
    "billing:manage",
    "licences:manage",
    "queues:manage",
    "workers:manage",
    "jobs:manage",
    "integrations:manage",
    "logs:view",
    "security:manage",
    "settings:manage",
  ],
  ADMIN: [
    "admin:view",
    "users:manage",
    "workspaces:manage",
    "billing:manage",
    "licences:manage",
    "queues:manage",
    "workers:manage",
    "jobs:manage",
    "integrations:manage",
    "logs:view",
    "security:manage",
    "settings:manage",
  ],
  SUPPORT_ADMIN: ["admin:view", "users:manage", "workspaces:manage", "jobs:manage", "logs:view"],
  BILLING_ADMIN: ["admin:view", "billing:manage", "licences:manage", "logs:view"],
  OPERATIONS_ADMIN: ["admin:view", "queues:manage", "workers:manage", "jobs:manage", "logs:view"],
  SECURITY_ADMIN: ["admin:view", "security:manage", "logs:view", "users:manage"],
  READ_ONLY_ADMIN: ["admin:view", "logs:view"],
};

export function normalizeAdminRole(role?: string | null): AdminRoleName | null {
  if (!role) {
    return null;
  }

  if (role === "ADMIN") {
    return "ADMIN";
  }

  return ADMIN_ROLES.includes(role as AdminRoleName) ? (role as AdminRoleName) : null;
}

export function hasAdminPermission(role: string | null | undefined, permission: AdminPermission) {
  const adminRole = normalizeAdminRole(role);
  if (!adminRole) {
    return false;
  }

  return ROLE_PERMISSIONS[adminRole].includes(permission);
}

export function getAdminPermissions(role: string | null | undefined) {
  const adminRole = normalizeAdminRole(role);
  return adminRole ? ROLE_PERMISSIONS[adminRole] : [];
}
