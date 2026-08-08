import {
  getOrganizationById,
} from "../repositories/organization.repository.js";

import { Organization } from "../types/organization.js";

export async function getOrganization(
  organizationId: string
): Promise<Organization | null> {

  return await getOrganizationById(organizationId);

}
