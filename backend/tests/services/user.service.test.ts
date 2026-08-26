import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const repositoryMocks = vi.hoisted(() => ({
  getUserById: vi.fn(),
  createUser: vi.fn(),
  createOrganization: vi.fn(),
  getPendingInvitationByEmail: vi.fn(),
}));

vi.mock(
  "../../src/repositories/user.repository.js",
  () => ({
    getUserById:
      repositoryMocks.getUserById,

    createUser:
      repositoryMocks.createUser,
  }),
);

vi.mock(
  "../../src/repositories/organization.repository.js",
  () => ({
    createOrganization:
      repositoryMocks.createOrganization,
  }),
);

vi.mock(
  "../../src/repositories/invitation.repository.js",
  () => ({
    getPendingInvitationByEmail:
      repositoryMocks.getPendingInvitationByEmail,
  }),
);

import { getOrCreateUser } from "../../src/services/user.service.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getOrCreateUser", () => {
  it("returns an existing user without creating anything", async () => {
    const existingUser = {
      id: "user-1",
      email: "user@example.com",
      organizationId:
        "organization-1",
      role: "MEMBER" as const,
      plan: "free",
      createdAt:
        "2026-01-01T00:00:00.000Z",
    };

    repositoryMocks.getUserById.mockResolvedValue(
      existingUser,
    );

    const result = await getOrCreateUser(
      "user-1",
      "user@example.com",
    );

    expect(result).toEqual(
      existingUser,
    );

    expect(
      repositoryMocks.getUserById,
    ).toHaveBeenCalledWith(
      "user-1",
    );

    expect(
      repositoryMocks.getPendingInvitationByEmail,
    ).not.toHaveBeenCalled();

    expect(
      repositoryMocks.createOrganization,
    ).not.toHaveBeenCalled();

    expect(
      repositoryMocks.createUser,
    ).not.toHaveBeenCalled();
  });

  it("rejects a new user with a pending invitation", async () => {
    repositoryMocks.getUserById.mockResolvedValue(
      null,
    );

    repositoryMocks.getPendingInvitationByEmail.mockResolvedValue(
      {
        id: "invitation-1",
        email: "user@example.com",
        organizationId:
          "organization-1",
        role: "MEMBER" as const,
        status: "PENDING" as const,
        createdAt:
          "2026-01-01T00:00:00.000Z",
        expiresAt:
          "2099-01-01T00:00:00.000Z",
      },
    );

    await expect(
      getOrCreateUser(
        "user-1",
        " USER@EXAMPLE.COM ",
      ),
    ).rejects.toThrow(
      "Pending invitation must be accepted",
    );

    expect(
      repositoryMocks.getPendingInvitationByEmail,
    ).toHaveBeenCalledWith(
      "user@example.com",
    );

    expect(
      repositoryMocks.createOrganization,
    ).not.toHaveBeenCalled();

    expect(
      repositoryMocks.createUser,
    ).not.toHaveBeenCalled();
  });

  it("creates an organization and OWNER user for a new user", async () => {
    repositoryMocks.getUserById.mockResolvedValue(
      null,
    );

    repositoryMocks.getPendingInvitationByEmail.mockResolvedValue(
      null,
    );

    repositoryMocks.createOrganization.mockImplementation(
      async (organization) =>
        organization,
    );

    repositoryMocks.createUser.mockImplementation(
      async (user) => user,
    );

    const result = await getOrCreateUser(
      "user-1",
      " USER@EXAMPLE.COM ",
    );

    expect(
      repositoryMocks.getUserById,
    ).toHaveBeenCalledWith(
      "user-1",
    );

    expect(
      repositoryMocks.getPendingInvitationByEmail,
    ).toHaveBeenCalledWith(
      "user@example.com",
    );

    expect(
      repositoryMocks.createOrganization,
    ).toHaveBeenCalledTimes(1);

    const organization =
      repositoryMocks.createOrganization.mock
        .calls[0][0];

    expect(organization.id).toEqual(
      expect.any(String),
    );

    expect(organization.name).toBe(
      "user@example.com's Organization",
    );

    expect(organization.ownerId).toBe(
      "user-1",
    );

    expect(organization.createdAt).toEqual(
      expect.any(String),
    );

    expect(
      repositoryMocks.createUser,
    ).toHaveBeenCalledTimes(1);

    const user =
      repositoryMocks.createUser.mock
        .calls[0][0];

    expect(user).toEqual({
      id: "user-1",
      email: "user@example.com",
      plan: "free",
      organizationId:
        organization.id,
      role: "OWNER",
      createdAt:
        organization.createdAt,
    });

    expect(result).toEqual(
      user,
    );
  });

  it("normalizes the email before creating the user", async () => {
    repositoryMocks.getUserById.mockResolvedValue(
      null,
    );

    repositoryMocks.getPendingInvitationByEmail.mockResolvedValue(
      null,
    );

    repositoryMocks.createOrganization.mockImplementation(
      async (organization) =>
        organization,
    );

    repositoryMocks.createUser.mockImplementation(
      async (user) => user,
    );

    const result = await getOrCreateUser(
      "user-2",
      "  ADMIN@Example.COM  ",
    );

    expect(result.email).toBe(
      "admin@example.com",
    );

    expect(
      repositoryMocks.getPendingInvitationByEmail,
    ).toHaveBeenCalledWith(
      "admin@example.com",
    );

    const organization =
      repositoryMocks.createOrganization.mock
        .calls[0][0];

    expect(organization.name).toBe(
      "admin@example.com's Organization",
    );
  });

  it("propagates organization creation errors", async () => {
    repositoryMocks.getUserById.mockResolvedValue(
      null,
    );

    repositoryMocks.getPendingInvitationByEmail.mockResolvedValue(
      null,
    );

    repositoryMocks.createOrganization.mockRejectedValue(
      new Error(
        "Organization creation failed",
      ),
    );

    await expect(
      getOrCreateUser(
        "user-1",
        "user@example.com",
      ),
    ).rejects.toThrow(
      "Organization creation failed",
    );

    expect(
      repositoryMocks.createUser,
    ).not.toHaveBeenCalled();
  });

  it("propagates user creation errors", async () => {
    repositoryMocks.getUserById.mockResolvedValue(
      null,
    );

    repositoryMocks.getPendingInvitationByEmail.mockResolvedValue(
      null,
    );

    repositoryMocks.createOrganization.mockImplementation(
      async (organization) =>
        organization,
    );

    repositoryMocks.createUser.mockRejectedValue(
      new Error(
        "User creation failed",
      ),
    );

    await expect(
      getOrCreateUser(
        "user-1",
        "user@example.com",
      ),
    ).rejects.toThrow(
      "User creation failed",
    );

    expect(
      repositoryMocks.createOrganization,
    ).toHaveBeenCalledTimes(1);

    expect(
      repositoryMocks.createUser,
    ).toHaveBeenCalledTimes(1);
  });
});
