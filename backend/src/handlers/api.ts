import { unauthorized } from "../http/unauthorized.js";
import { meRoute } from "../routes/me.route.js";
import { organizationRoute } from "../routes/organization.route.js";

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

  const user = await meRoute(id, email);

  if (event.rawPath === "/organization") {

    if (user.statusCode !== 200 || !user.body) {
      return user;
    }

    const userData = JSON.parse(user.body).user;

    return await organizationRoute(userData);
  }

  return user;
}
