import {
  getOrganizationById,
} from "../repositories/organization.repository.js";

import {
  getUserById,
} from "../repositories/user.repository.js";

import { Organization } from "../types/organization.js";

export async function getOrganizationForUser(
  userId: string
): Promise<Organization | null> {
  const user = await getUserById(userId);

  if (!user) {
    return null;
  }

  return await getOrganizationById(
    user.organizationId
  );
}
