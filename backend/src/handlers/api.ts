import { unauthorized } from "../http/unauthorized.js";
import { meRoute } from "../routes/me.route.js";
import { organizationRoute } from "../routes/organization.route.js";

import { getOrCreateUser } from "../services/user.service.js";

import type { ApiEvent } from "../types/api.js";

export async function handler(event: ApiEvent) {
  console.log(JSON.stringify(event));

  const claims =
    event.requestContext?.authorizer?.jwt?.claims ??
    event.requestContext?.authorizer?.claims ??
    {};

  const id = claims.sub;
  const email = claims.email;

  if (!id || !email) {
    return unauthorized();
  }

  if (event.rawPath === "/organization") {
    const user = await getOrCreateUser(id, email);

    return await organizationRoute(user.organizationId);
  }

  return await meRoute(id, email);
}
