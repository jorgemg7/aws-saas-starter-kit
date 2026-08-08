import { unauthorized } from "../http/unauthorized.js";
import { meRoute } from "../routes/me.route.js";
import type { ApiEvent } from "../types/api.js";

export async function handler(
  event: ApiEvent
) {

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

  return await meRoute(id, email);

}
