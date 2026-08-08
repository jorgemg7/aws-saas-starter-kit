import { ok } from "../http/ok.js";
import { MESSAGES } from "../constants/messages.js";
import { getOrCreateUser } from "../services/user.service.js";

export async function meRoute(
  id: string,
  email: string
) {

  const user =
    await getOrCreateUser(id, email);

  return ok({
    message: MESSAGES.BACKEND_OK,
    user,
  });

}
