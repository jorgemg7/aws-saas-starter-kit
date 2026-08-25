import { ok } from "../http/ok.js";
import { HTTP } from "../constants/http.js";
import { HEADERS } from "../constants/headers.js";
import { MESSAGES } from "../constants/messages.js";

import {
  acceptOrganizationInvitation,
  getOrganizationInvitations,
} from "../services/invitation.service.js";

export async function invitationsRoute(
  email: string
) {
  const invitations =
    await getOrganizationInvitations(
      email
    );

  return ok({
    message: MESSAGES.BACKEND_OK,
    invitations,
  });
}

export async function acceptInvitationRoute(
  invitationId: string,
  email: string
) {
  try {
    const user =
      await acceptOrganizationInvitation(
        invitationId,
        email
      );

    return ok({
      message: MESSAGES.BACKEND_OK,
      user,
    });
  } catch (error) {
    if (error instanceof Error) {
      const messages = [
        "Invitation not found",
        "Invitation is not pending",
        "Invitation email does not match",
        "Invitation has expired",
        "User already exists",
        "Unable to update invitation",
      ];

      if (
        messages.includes(
          error.message
        )
      ) {
        return {
          statusCode: HTTP.BAD_REQUEST,
          headers: HEADERS.JSON,
          body: JSON.stringify({
            message: error.message,
          }),
        };
      }
    }

    throw error;
  }
}
