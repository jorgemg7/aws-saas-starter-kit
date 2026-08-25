import { randomUUID } from "node:crypto";

import {
  createInvitation,
  getPendingInvitationByEmail,
  getPendingInvitationsByEmail,
  getInvitationById,
  updateInvitationStatus,
} from "../repositories/invitation.repository.js";

import {
  getUserByEmail,
  createUser,
} from "../repositories/user.repository.js";

import { Invitation } from "../repositories/invitation.repository.js";
import { User } from "../types/user.js";

export async function createOrganizationInvitation(
  organizationId: string,
  email: string,
  role: "ADMIN" | "MEMBER"
): Promise<Invitation> {
  const normalizedEmail =
    email.trim().toLowerCase();

  const existingInvitation =
    await getPendingInvitationByEmail(
      normalizedEmail
    );

  if (existingInvitation) {
    throw new Error(
      "Invitation already exists"
    );
  }

  const now = new Date();

  const expiresAt =
    new Date(
      now.getTime() +
        7 * 24 * 60 * 60 * 1000
    );

  const invitation: Invitation = {
    id: randomUUID(),
    email: normalizedEmail,
    organizationId,
    role,
    status: "PENDING",
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  return await createInvitation(
    invitation
  );
}

export async function getOrganizationInvitations(
  email: string
): Promise<Invitation[]> {
  const normalizedEmail =
    email.trim().toLowerCase();

  return await getPendingInvitationsByEmail(
    normalizedEmail
  );
}

export async function acceptOrganizationInvitation(
  invitationId: string,
  email: string
): Promise<User> {
  const invitation =
    await getInvitationById(
      invitationId
    );

  if (!invitation) {
    throw new Error(
      "Invitation not found"
    );
  }

  if (
    invitation.status !==
    "PENDING"
  ) {
    throw new Error(
      "Invitation is not pending"
    );
  }

  const normalizedEmail =
    email.trim().toLowerCase();

  if (
    invitation.email !==
    normalizedEmail
  ) {
    throw new Error(
      "Invitation email does not match"
    );
  }

  const now = new Date();

  const expiresAt =
    new Date(
      invitation.expiresAt
    );

  if (
    expiresAt.getTime() <=
    now.getTime()
  ) {
    await updateInvitationStatus(
      invitation.id,
      "EXPIRED"
    );

    throw new Error(
      "Invitation has expired"
    );
  }

  const existingUser =
    await getUserByEmail(
      normalizedEmail
    );

  if (existingUser) {
    throw new Error(
      "User already exists"
    );
  }

  const user: User = {
    id: randomUUID(),
    email: normalizedEmail,
    organizationId:
      invitation.organizationId,
    role: invitation.role,
    plan: "free",
    createdAt:
      now.toISOString(),
  };

  const createdUser =
    await createUser(user);

  const updatedInvitation =
    await updateInvitationStatus(
      invitation.id,
      "ACCEPTED"
    );

  if (!updatedInvitation) {
    throw new Error(
      "Unable to update invitation"
    );
  }

  return createdUser;
}
