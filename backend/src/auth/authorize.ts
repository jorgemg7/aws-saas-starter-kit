import {
  ROLE_PERMISSIONS,
  type Permission,
} from "./permissions.js";

import type { User } from "../types/user.js";

export function hasPermission(
  user: User,
  permission: Permission,
): boolean {
  return ROLE_PERMISSIONS[user.role].includes(permission);
}
