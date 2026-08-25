import { ok } from "../http/ok.js";
import { HTTP } from "../constants/http.js";
import { HEADERS } from "../constants/headers.js";
import { MESSAGES } from "../constants/messages.js";

import {
  getOrganizationMembers,
  addOrganizationMember,
  updateOrganizationMemberRole,
} from "../services/member.service.js";

export async function membersRoute(
  organizationId: string
) {
  const members =
    await getOrganizationMembers(
      organizationId
    );

  return ok({
    message: MESSAGES.BACKEND_OK,
    members,
  });
}

export async function addMemberRoute(
  organizationId: string,
  email: string
) {
  try {
    await addOrganizationMember(
      organizationId,
      email
    );

    return ok({
      message:
        "Invitation created",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "User already exists"
    ) {
      return {
        statusCode:
          HTTP.BAD_REQUEST,
        headers: HEADERS.JSON,
        body: JSON.stringify({
          message:
            "User already exists",
        }),
      };
    }

    if (
      error instanceof Error &&
      error.message ===
        "Invitation already exists"
    ) {
      return {
        statusCode:
          HTTP.BAD_REQUEST,
        headers: HEADERS.JSON,
        body: JSON.stringify({
          message:
            "Invitation already exists",
        }),
      };
    }

    if (
      error instanceof Error &&
      error.message ===
        "INVITATION_CREATED"
    ) {
      return ok({
        message:
          "Invitation created",
      });
    }

    throw error;
  }
}

export async function updateMemberRoleRoute(
  organizationId: string,
  memberId: string,
  role: "ADMIN" | "MEMBER"
) {
  try {
    const member =
      await updateOrganizationMemberRole(
        organizationId,
        memberId,
        role
      );

    return ok({
      message: MESSAGES.BACKEND_OK,
      member,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message ===
        "User not found"
      ) {
        return {
          statusCode:
            HTTP.BAD_REQUEST,
          headers: HEADERS.JSON,
          body: JSON.stringify({
            message:
              "User not found",
          }),
        };
      }

      if (
        error.message ===
        "User does not belong to organization"
      ) {
        return {
          statusCode:
            HTTP.BAD_REQUEST,
          headers: HEADERS.JSON,
          body: JSON.stringify({
            message:
              "User does not belong to organization",
          }),
        };
      }

      if (
        error.message ===
        "Cannot change owner role"
      ) {
        return {
          statusCode:
            HTTP.BAD_REQUEST,
          headers: HEADERS.JSON,
          body: JSON.stringify({
            message:
              "Cannot change owner role",
          }),
        };
      }
    }

    throw error;
  }
}
