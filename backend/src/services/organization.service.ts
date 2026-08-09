import {
  getOrganizationById,
} from "../repositories/organization.repository.js";

import type { Organization } from "../types/organization.js";
import type { User } from "../types/user.js";

import {
  hasPermission,
} from "../auth/authorize.js";

import {
  PERMISSIONS,
} from "../auth/permissions.js";

export async function getOrganizationForUser(
  user: User,
): Promise<Organization | null> {

  if (
    !hasPermission(
      user,
      PERMISSIONS.ORGANIZATION_READ,
    )
  ) {
    return null;
  }

  const organization =
    await getOrganizationById(
      user.organizationId,
    );

  if (!organization) {
    return null;
  }

  if (
    organization.id !==
    user.organizationId
  ) {
    return null;
  }

  return organization;
}
