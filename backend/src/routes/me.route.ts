import { ok } from "../http/ok.js";
import { HTTP } from "../constants/http.js";
import { HEADERS } from "../constants/headers.js";
import { MESSAGES } from "../constants/messages.js";
import { getOrCreateUser } from "../services/user.service.js";

export async function meRoute(
  id: string,
  email: string
) {
  try {
    const user =
      await getOrCreateUser(
        id,
        email
      );

    return ok({
      message:
        MESSAGES.BACKEND_OK,
      user,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "Pending invitation must be accepted"
    ) {
      return {
        statusCode:
          HTTP.BAD_REQUEST,
        headers: HEADERS.JSON,
        body: JSON.stringify({
          message:
            "Pending invitation must be accepted",
        }),
      };
    }

    throw error;
  }
}
