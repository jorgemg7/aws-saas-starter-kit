import { ok } from "../http/ok.js";
import { HTTP } from "../constants/http.js";
import { HEADERS } from "../constants/headers.js";
import { MESSAGES } from "../constants/messages.js";

import { getOrganization } from "../services/organization.service.js";

export async function organizationRoute(
  organizationId: string
) {

  const organization =
    await getOrganization(organizationId);

  if (!organization) {

    return {
      statusCode: HTTP.NOT_FOUND,
      headers: HEADERS.JSON,
      body: JSON.stringify({
        message: "Organization not found",
      }),
    };

  }

  return ok({
    message: MESSAGES.BACKEND_OK,
    organization,
  });

}
