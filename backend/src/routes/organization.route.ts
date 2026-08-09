import { ok } from "../http/ok.js";
import { HTTP } from "../constants/http.js";
import { HEADERS } from "../constants/headers.js";
import { MESSAGES } from "../constants/messages.js";

import {
  getOrganizationForUser,
} from "../services/organization.service.js";

import type { User } from "../types/user.js";

export async function organizationRoute(
  user: User,
) {

  const organization =
    await getOrganizationForUser(user);

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
