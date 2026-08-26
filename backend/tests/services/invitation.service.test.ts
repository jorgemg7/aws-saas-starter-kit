import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const repositoryMocks = vi.hoisted(() => ({
  createInvitation: vi.fn(),
  getPendingInvitationByEmail: vi.fn(),
  getPendingInvitationsByEmail: vi.fn(),
  getInvitationById: vi.fn(),
  updateInvitationStatus: vi.fn(),
  getUserByEmail: vi.fn(),
  createUser: vi.fn(),
}));

vi.mock(
  "../../src/repositories/invitation.repository.js",
  () => ({
    createInvitation:
      repositoryMocks.createInvitation,

    getPendingInvitationByEmail:
      repositoryMocks.getPendingInvitationByEmail,

    getPendingInvitationsByEmail:
      repositoryMocks.getPendingInvitationsByEmail,

    getInvitationById:
      repositoryMocks.getInvitationById,

    updateInvitationStatus:
      repositoryMocks.updateInvitationStatus,
  }),
);

vi.mock(
  "../../src/repositories/user.repository.js",
  () => ({
    getUserByEmail:
      repositoryMocks.getUserByEmail,

    createUser:
      repositoryMocks.createUser,
  }),
);

import {
  createOrganizationInvitation,
  getOrganizationInvitations,
  acceptOrganizationInvitation,
} from "../../src/services/invitation.service.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createOrganizationInvitation", () => {
  it("creates a normalized pending invitation", async () => {
    repositoryMocks.getPendingInvitationByEmail.mockResolvedValue(
      null,
    );

    repositoryMocks.createInvitation.mockImplementation(
      async (invitation) => invitation,
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
    ).toHaveBeenCalledTimes(1);

    expect(result.email).toBe(
      "user@example.com",
    );

    expect(result.organizationId).toBe(
      "organization-1",
    );

    expect(result.role).toBe("MEMBER");
    expect(result.status).toBe("PENDING");

    expect(result.id).toEqual(
      expect.any(String),
    );

    expect(
      new Date(result.expiresAt).getTime(),
    ).toBeGreaterThan(
      new Date(result.createdAt).getTime(),
    );
  });

  it("rejects when a pending invitation already exists", async () => {
    repositoryMocks.getPendingInvitationByEmail.mockResolvedValue(
      {
        id: "invitation-1",
        email: "user@example.com",
        organizationId:
          "organization-1",
        role: "MEMBER",
        status: "PENDING",
        createdAt:
          "2026-01-01T00:00:00.000Z",
        expiresAt:
          "2026-01-08T00:00:00.000Z",
      },
    );

    await expect(
      createOrganizationInvitation(
        "organization-1",
        "USER@example.com",
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
  it("normalizes the email before querying", async () => {
    const invitations = [
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
          "2026-01-08T00:00:00.000Z",
      },
    ];

    repositoryMocks.getPendingInvitationsByEmail.mockResolvedValue(
      invitations,
    );

    const result =
      await getOrganizationInvitations(
        " USER@EXAMPLE.COM ",
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
  const pendingInvitation = {
    id: "invitation-1",
    email: "user@example.com",
    organizationId:
      "organization-1",
    role: "MEMBER" as const,
    status: "PENDING" as const,
    createdAt:
      "2026-01-01T00:00:00.000Z",
    expiresAt:
      "2099-01-08T00:00:00.000Z",
  };

  it("accepts a valid invitation and creates the user", async () => {
    repositoryMocks.getInvitationById.mockResolvedValue(
      pendingInvitation,
    );

    repositoryMocks.getUserByEmail.mockResolvedValue(
      null,
    );

    repositoryMocks.createUser.mockImplementation(
      async (user) => user,
    );

    repositoryMocks.updateInvitationStatus.mockResolvedValue(
      {
        ...pendingInvitation,
        status: "ACCEPTED",
      },
    );

    const result =
      await acceptOrganizationInvitation(
        "invitation-1",
        " USER@EXAMPLE.COM ",
      );

    expect(
      repositoryMocks.getInvitationById,
    ).toHaveBeenCalledWith(
      "invitation-1",
    );

    expect(
      repositoryMocks.getUserByEmail,
    ).toHaveBeenCalledWith(
      "user@example.com",
    );

    expect(
      repositoryMocks.createUser,
    ).toHaveBeenCalledTimes(1);

    expect(result.email).toBe(
      "user@example.com",
    );

    expect(result.organizationId).toBe(
      "organization-1",
    );

    expect(result.role).toBe("MEMBER");
    expect(result.plan).toBe("free");

    expect(
      repositoryMocks.updateInvitationStatus,
    ).toHaveBeenCalledWith(
      "invitation-1",
      "ACCEPTED",
    );
  });

  it("rejects when the invitation does not exist", async () => {
    repositoryMocks.getInvitationById.mockResolvedValue(
      null,
    );

    await expect(
      acceptOrganizationInvitation(
        "missing",
        "user@example.com",
      ),
    ).rejects.toThrow(
      "Invitation not found",
    );
  });

  it("rejects when the invitation is not pending", async () => {
    repositoryMocks.getInvitationById.mockResolvedValue(
      {
        ...pendingInvitation,
        status: "ACCEPTED",
      },
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

  it("rejects when the email does not match", async () => {
    repositoryMocks.getInvitationById.mockResolvedValue(
      pendingInvitation,
    );

    await expect(
      acceptOrganizationInvitation(
        "invitation-1",
        "other@example.com",
      ),
    ).rejects.toThrow(
      "Invitation email does not match",
    );

    expect(
      repositoryMocks.getUserByEmail,
    ).not.toHaveBeenCalled();
  });

  it("expires an expired invitation", async () => {
    repositoryMocks.getInvitationById.mockResolvedValue(
      {
        ...pendingInvitation,
        expiresAt:
          "2020-01-01T00:00:00.000Z",
      },
    );

    repositoryMocks.updateInvitationStatus.mockResolvedValue(
      {
        ...pendingInvitation,
        status: "EXPIRED",
      },
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

    expect(
      repositoryMocks.getUserByEmail,
    ).not.toHaveBeenCalled();

    expect(
      repositoryMocks.createUser,
    ).not.toHaveBeenCalled();
  });

  it("rejects when the user already exists", async () => {
    repositoryMocks.getInvitationById.mockResolvedValue(
      pendingInvitation,
    );

    repositoryMocks.getUserByEmail.mockResolvedValue(
      {
        id: "existing-user",
        email: "user@example.com",
        organizationId:
          "organization-2",
        role: "MEMBER" as const,
        plan: "free",
        createdAt:
          "2026-01-01T00:00:00.000Z",
      },
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
      repositoryMocks.createUser,
    ).not.toHaveBeenCalled();

    expect(
      repositoryMocks.updateInvitationStatus,
    ).not.toHaveBeenCalled();
  });

  it("rejects when the invitation cannot be updated", async () => {
    repositoryMocks.getInvitationById.mockResolvedValue(
      pendingInvitation,
    );

    repositoryMocks.getUserByEmail.mockResolvedValue(
      null,
    );

    repositoryMocks.createUser.mockImplementation(
      async (user) => user,
    );

    repositoryMocks.updateInvitationStatus.mockResolvedValue(
      null,
    );

    await expect(
      acceptOrganizationInvitation(
        "invitation-1",
        "user@example.com",
      ),
    ).rejects.toThrow(
      "Unable to update invitation",
    );

    expect(
      repositoryMocks.createUser,
    ).toHaveBeenCalledTimes(1);

    expect(
      repositoryMocks.updateInvitationStatus,
    ).toHaveBeenCalledWith(
      "invitation-1",
      "ACCEPTED",
    );
  });
});
