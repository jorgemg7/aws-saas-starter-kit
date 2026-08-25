import { unauthorized } from "../http/unauthorized.js";

import {
  meRoute,
} from "../routes/me.route.js";

import {
  organizationRoute,
} from "../routes/organization.route.js";

import {
  membersRoute,
  addMemberRoute,
  updateMemberRoleRoute,
} from "../routes/members.route.js";

import {
  acceptInvitationRoute,
  invitationsRoute,
} from "../routes/invitation.route.js";

import {
  hasPermission,
} from "../auth/authorize.js";

import {
  PERMISSIONS,
} from "../auth/permissions.js";

import type { ApiEvent } from "../types/api.js";

export async function handler(
  event: ApiEvent
) {
  console.log(
    JSON.stringify(event)
  );

  const claims =
    event.requestContext
      ?.authorizer
      ?.jwt
      ?.claims ??
    event.requestContext
      ?.authorizer
      ?.claims ??
    {};

  const id = claims.sub;
  const email = claims.email;

  if (!id || !email) {
    return unauthorized();
  }

  const path =
    event.rawPath;

  /*
   * GET /invitations
   *
   * Esta ruta debe procesarse antes
   * de /me porque un usuario con una
   * invitación pendiente todavía puede
   * no existir en DynamoDB.
   */
  if (
    path === "/invitations"
  ) {
    const method =
      event.requestContext
        ?.http
        ?.method;

    if (method === "GET") {
      return await invitationsRoute(
        email
      );
    }
  }

  /*
   * POST /invitations/accept
   *
   * También debe procesarse antes
   * de /me.
   *
   * acceptOrganizationInvitation()
   * será quien cree al usuario con
   * el rol indicado por la invitación.
   */
  if (
    path ===
    "/invitations/accept"
  ) {
    const method =
      event.requestContext
        ?.http
        ?.method;

    if (method === "POST") {
      let body: {
        invitationId?: string;
      } = {};

      try {
        body = event.body
          ? JSON.parse(event.body)
          : {};
      } catch {
        return {
          statusCode: 400,
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            message:
              "Invalid request body",
          }),
        };
      }

      if (
        !body.invitationId ||
        typeof body.invitationId !==
          "string"
      ) {
        return {
          statusCode: 400,
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            message:
              "Invitation ID is required",
          }),
        };
      }

      return await acceptInvitationRoute(
        body.invitationId,
        email
      );
    }
  }

  /*
   * Para el resto de endpoints sí
   * necesitamos que el usuario exista
   * en DynamoDB.
   */
  const userResponse =
    await meRoute(id, email);

  if (
    userResponse.statusCode !== 200 ||
    !userResponse.body
  ) {
    return userResponse;
  }

  const user =
    JSON.parse(
      userResponse.body
    ).user;

  /*
   * GET /organization
   */
  if (
    path === "/organization"
  ) {
    return await organizationRoute(
      user
    );
  }

  /*
   * /members
   */
  if (
    path === "/members"
  ) {
    const method =
      event.requestContext
        ?.http
        ?.method;

    /*
     * POST /members
     */
    if (method === "POST") {
      if (
        !hasPermission(
          user,
          PERMISSIONS.MEMBERS_ROLE_UPDATE
        )
      ) {
        return unauthorized();
      }

      let body: {
        email?: string;
      } = {};

      try {
        body = event.body
          ? JSON.parse(event.body)
          : {};
      } catch {
        return {
          statusCode: 400,
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            message:
              "Invalid request body",
          }),
        };
      }

      if (
        !body.email ||
        typeof body.email !==
          "string"
      ) {
        return {
          statusCode: 400,
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            message:
              "Email is required",
          }),
        };
      }

      return await addMemberRoute(
        user.organizationId,
        body.email
      );
    }

    /*
     * GET /members
     */
    if (
      hasPermission(
        user,
        PERMISSIONS.MEMBERS_READ
      )
    ) {
      return await membersRoute(
        user.organizationId
      );
    }

    return unauthorized();
  }

  /*
   * POST /members/:id/role
   */
  const roleMatch =
    path?.match(
      /^\/members\/([^/]+)\/role$/
    );

  if (roleMatch) {
    if (
      !hasPermission(
        user,
        PERMISSIONS.MEMBERS_MANAGE
      )
    ) {
      return unauthorized();
    }

    const memberId =
      roleMatch[1];

    let body: {
      role?: string;
    } = {};

    try {
      body = event.body
        ? JSON.parse(event.body)
        : {};
    } catch {
      return {
        statusCode: 400,
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          message:
            "Invalid request body",
        }),
      };
    }

    if (
      body.role !== "ADMIN" &&
      body.role !== "MEMBER"
    ) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          message:
            "Role must be ADMIN or MEMBER",
        }),
      };
    }

    return await updateMemberRoleRoute(
      user.organizationId,
      memberId,
      body.role
    );
  }

  return userResponse;
}
