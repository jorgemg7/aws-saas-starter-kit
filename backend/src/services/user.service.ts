import { randomUUID } from "node:crypto";

import {
  getUserById,
  createUser,
} from "../repositories/user.repository.js";

import {
  createOrganization,
} from "../repositories/organization.repository.js";

import { User } from "../types/user.js";

export async function getOrCreateUser(
  id: string,
  email: string
): Promise<User> {

  let user = await getUserById(id);

  if (user) {
    return user;
  }

  const now = new Date().toISOString();

  const organization = await createOrganization({
    id: randomUUID(),
    name: `${email}'s Organization`,
    ownerId: id,
    createdAt: now,
  });

  user = await createUser({
    id,
    email,
    plan: "free",
    organizationId: organization.id,
    role: "OWNER",
    createdAt: now,
  });

  return user;
}
