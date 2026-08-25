import { randomUUID } from "node:crypto";

import {
  getUserById,
  createUser,
} from "../repositories/user.repository.js";

import {
  createOrganization,
} from "../repositories/organization.repository.js";

import {
  getPendingInvitationByEmail,
} from "../repositories/invitation.repository.js";

import { User } from "../types/user.js";

export async function getOrCreateUser(
  id: string,
  email: string
): Promise<User> {
  let user = await getUserById(id);

  if (user) {
    return user;
  }

  const normalizedEmail =
    email.trim().toLowerCase();

  /*
   * Si existe una invitación pendiente
   * para este email, no debemos crear
   * automáticamente una organización
   * ni convertir al usuario en OWNER.
   *
   * El usuario debe aceptar primero
   * la invitación mediante:
   *
   * POST /invitations/accept
   */
  const pendingInvitation =
    await getPendingInvitationByEmail(
      normalizedEmail
    );

  if (pendingInvitation) {
    throw new Error(
      "Pending invitation must be accepted"
    );
  }

  /*
   * Usuario nuevo sin invitación:
   * este es el flujo normal de registro.
   *
   * Se crea una organización nueva
   * y el usuario se convierte en OWNER.
   */
  const now =
    new Date().toISOString();

  const organization =
    await createOrganization({
      id: randomUUID(),
      name: `${normalizedEmail}'s Organization`,
      ownerId: id,
      createdAt: now,
    });

  user = await createUser({
    id,
    email: normalizedEmail,
    plan: "free",
    organizationId:
      organization.id,
    role: "OWNER",
    createdAt: now,
  });

  return user;
}
