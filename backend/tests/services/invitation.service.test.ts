import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Invitation } from "../../src/repositories/invitation.repository.js";
import type { User } from "../../src/types/user.js";

const repositoryMocks = vi.hoisted(() => ({
  createInvitation: vi.fn(),
  getPendingInvitationByEmail: vi.fn(),
  getPendingInvitationsByEmail: vi.fn(),
  getInvitationById: vi.fn(),
  updateInvitationStatus: vi.fn(),
}));

const userRepositoryMocks = vi.hoisted(() => ({
  getUserByEmail: vi.fn(),
  createUser: vi.fn(),
}));

vi.mock(
  "../../src/repositories/invitation.repository.js",
  () => repositoryMocks,
);

vi.mock(
  "../../src/repositories/user.repository.js",
  () => userRepositoryMocks,
);

import {
  createOrganizationInvitation,
  getOrganizationInvitations,
  acceptOrganizationInvitation,
} from "../../src/services/invitation.service.js";

function createInvitation(
  overrides: Partial<Invitation> = {},
): Invitation {
  return {
    id: "invitation-1",
    email: "user@example.com",
    organizationId: "organization-1",
    role: "MEMBER",
    status: "PENDING",
    createdAt: "2026-01-01T00:00:00.000Z",
    expiresAt: "2099-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function createUser(
  overrides: Partial<User> = {},
): User {
  return {
    id: "user-1",
    email: "user@example.com",
    organizationId: "organization-1",
    role: "MEMBER",
    plan: "free",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createOrganizationInvitation", () => {
  it("normalizes the email before creating the invitation", async () => {
    repositoryMocks.getPendingInvitationByEmail.mockResolvedValue(
      null,
    );

    repositoryMocks.createInvitation.mockImplementation(
      async (invitation: Invitation) =>
        invitation,
    );

    const result =
      await createOrganizationInvitation(
        "organization-1",
        "  USER@Example.COM  ",
        "MEMBER",
      );

    expect(
      repositoryMocks.getPendingInvitationByEmail,
    ).toHaveBeenCalledWith(
      "user@example.com",
    );

    expect(
      repositoryMocks.createInvitation,
    ).toHaveBeenCalledOnce();

    expect(result.email).toBe(
      "user@example.com",
    );

    expect(result.organizationId).toBe(
      "organization-1",
    );

    expect(result.role).toBe("MEMBER");
    expect(result.status).toBe("PENDING");
  });

  it("rejects a duplicate pending invitation", async () => {
    repositoryMocks.getPendingInvitationByEmail.mockResolvedValue(
      createInvitation(),
    );

    await expect(
      createOrganizationInvitation(
        "organization-1",
        "user@example.com",
        "MEMBER",
      ),
    ).rejects.toThrow(
      "Invitation already exists",
    );

    expect(
      repositoryMocks.createInvitation,
    ).not.toHaveBeenCalled();
  });
});

describe("getOrganizationInvitations", () => {
  it("normalizes the email before querying invitations", async () => {
    const invitations = [
      createInvitation(),
    ];

    repositoryMocks.getPendingInvitationsByEmail.mockResolvedValue(
      invitations,
    );

    const result =
      await getOrganizationInvitations(
        "  USER@Example.COM ",
      );

    expect(
      repositoryMocks.getPendingInvitationsByEmail,
    ).toHaveBeenCalledWith(
      "user@example.com",
    );

    expect(result).toEqual(
      invitations,
    );
  });
});

describe("acceptOrganizationInvitation", () => {
  it("rejects an invitation that does not exist", async () => {
    repositoryMocks.getInvitationById.mockResolvedValue(
      null,
    );

    await expect(
      acceptOrganizationInvitation(
        "missing-invitation",
        "user@example.com",
      ),
    ).rejects.toThrow(
      "Invitation not found",
    );
  });

  it("rejects an invitation that is not pending", async () => {
    repositoryMocks.getInvitationById.mockResolvedValue(
      createInvitation({
        status: "ACCEPTED",
      }),
    );

    await expect(
      acceptOrganizationInvitation(
        "invitation-1",
        "user@example.com",
      ),
    ).rejects.toThrow(
      "Invitation is not pending",
    );
  });

  it("rejects an invitation for a different email", async () => {
    repositoryMocks.getInvitationById.mockResolvedValue(
      createInvitation({
        email: "owner@example.com",
      }),
    );

    await expect(
      acceptOrganizationInvitation(
        "invitation-1",
        "another@example.com",
      ),
    ).rejects.toThrow(
      "Invitation email does not match",
    );
  });

  it("expires an invitation when its expiration date has passed", async () => {
    repositoryMocks.getInvitationById.mockResolvedValue(
      createInvitation({
        expiresAt:
          "2020-01-01T00:00:00.000Z",
      }),
    );

    repositoryMocks.updateInvitationStatus.mockResolvedValue(
      createInvitation({
        status: "EXPIRED",
      }),
    );

    await expect(
      acceptOrganizationInvitation(
        "invitation-1",
        "user@example.com",
      ),
    ).rejects.toThrow(
      "Invitation has expired",
    );

    expect(
      repositoryMocks.updateInvitationStatus,
    ).toHaveBeenCalledWith(
      "invitation-1",
      "EXPIRED",
    );
  });

  it("rejects acceptance when the user already exists", async () => {
    repositoryMocks.getInvitationById.mockResolvedValue(
      createInvitation(),
    );

    userRepositoryMocks.getUserByEmail.mockResolvedValue(
      createUser(),
    );

    await expect(
      acceptOrganizationInvitation(
        "invitation-1",
        "user@example.com",
      ),
    ).rejects.toThrow(
      "User already exists",
    );

    expect(
      userRepositoryMocks.createUser,
    ).not.toHaveBeenCalled();

    expect(
      repositoryMocks.updateInvitationStatus,
    ).not.toHaveBeenCalled();
  });

  it("creates the user and accepts the invitation", async () => {
    const invitation = createInvitation();

    repositoryMocks.getInvitationById.mockResolvedValue(
      invitation,
    );

    userRepositoryMocks.getUserByEmail.mockResolvedValue(
      null,
    );

    userRepositoryMocks.createUser.mockImplementation(
      async (user: User) => user,
    );

    repositoryMocks.updateInvitationStatus.mockResolvedValue(
      createInvitation({
        status: "ACCEPTED",
      }),
    );

    const result =
      await acceptOrganizationInvitation(
        "invitation-1",
        " USER@Example.COM ",
      );

    expect(
      userRepositoryMocks.getUserByEmail,
    ).toHaveBeenCalledWith(
      "user@example.com",
    );

    expect(
      userRepositoryMocks.createUser,
    ).toHaveBeenCalledOnce();

    const createdUser =
      userRepositoryMocks.createUser.mock
        .calls[0][0] as User;

    expect(createdUser.email).toBe(
      "user@example.com",
    );

    expect(
      createdUser.organizationId,
    ).toBe("organization-1");

    expect(createdUser.role).toBe(
      "MEMBER",
    );

    expect(createdUser.plan).toBe(
      "free",
    );

    expect(
      repositoryMocks.updateInvitationStatus,
    ).toHaveBeenCalledWith(
      "invitation-1",
      "ACCEPTED",
    );

    expect(result).toEqual(
      createdUser,
    );
  });
});
