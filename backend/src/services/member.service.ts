import {
  getUserByEmail,
  getUserById,
  getUsersByOrganizationId,
  updateUserRole,
} from "../repositories/user.repository.js";

import {
  createOrganizationInvitation,
} from "./invitation.service.js";

import { User } from "../types/user.js";

export async function getOrganizationMembers(
  organizationId: string
): Promise<User[]> {
  return await getUsersByOrganizationId(
    organizationId
  );
}

export async function addOrganizationMember(
  organizationId: string,
  email: string
): Promise<{
  id: string;
  email: string;
  organizationId: string;
  role: "MEMBER";
  status: "PENDING";
  createdAt: string;
  expiresAt: string;
}> {
  const normalizedEmail =
    email.trim().toLowerCase();

  const existingUser =
    await getUserByEmail(
      normalizedEmail
    );

  if (existingUser) {
    throw new Error(
      "User already exists"
    );
  }

  return await createOrganizationInvitation(
    organizationId,
    normalizedEmail,
    "MEMBER"
  );
}

export async function updateOrganizationMemberRole(
  organizationId: string,
  memberId: string,
  role: "ADMIN" | "MEMBER"
): Promise<User> {
  const member =
    await getUserById(memberId);

  if (!member) {
    throw new Error(
      "User not found"
    );
  }

  if (
    member.organizationId !==
    organizationId
  ) {
    throw new Error(
      "User does not belong to organization"
    );
  }

  if (
    member.role === "OWNER"
  ) {
    throw new Error(
      "Cannot change owner role"
    );
  }

  const updated =
    await updateUserRole(
      memberId,
      role
    );

  if (!updated) {
    throw new Error(
      "Unable to update user role"
    );
  }

  return updated;
}
