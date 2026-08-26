import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type { Invitation } from "../../src/repositories/invitation.repository.js";
import type { User } from "../../src/types/user.js";

const userRepositoryMocks = vi.hoisted(() => ({
  getUserByEmail: vi.fn(),
  getUserById: vi.fn(),
  getUsersByOrganizationId: vi.fn(),
  updateUserRole: vi.fn(),
}));

const invitationServiceMocks = vi.hoisted(() => ({
  createOrganizationInvitation: vi.fn(),
}));

vi.mock(
  "../../src/repositories/user.repository.js",
  () => userRepositoryMocks,
);

vi.mock(
  "../../src/services/invitation.service.js",
  () => invitationServiceMocks,
);

import {
  getOrganizationMembers,
  addOrganizationMember,
  updateOrganizationMemberRole,
} from "../../src/services/member.service.js";

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

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getOrganizationMembers", () => {
  it("returns the members of the organization", async () => {
    const members = [
      createUser({
        id: "user-1",
        email: "one@example.com",
      }),
      createUser({
        id: "user-2",
        email: "two@example.com",
      }),
    ];

    userRepositoryMocks.getUsersByOrganizationId.mockResolvedValue(
      members,
    );

    const result =
      await getOrganizationMembers(
        "organization-1",
      );

    expect(
      userRepositoryMocks.getUsersByOrganizationId,
    ).toHaveBeenCalledWith(
      "organization-1",
    );

    expect(result).toEqual(members);
  });

  it("returns an empty list when the repository returns no members", async () => {
    userRepositoryMocks.getUsersByOrganizationId.mockResolvedValue(
      [],
    );

    const result =
      await getOrganizationMembers(
        "organization-1",
      );

    expect(result).toEqual([]);
  });
});

describe("addOrganizationMember", () => {
  it("normalizes the email before checking the existing user", async () => {
    userRepositoryMocks.getUserByEmail.mockResolvedValue(
      null,
    );

    const invitation =
      createInvitation();

    invitationServiceMocks.createOrganizationInvitation.mockResolvedValue(
      invitation,
    );

    const result =
      await addOrganizationMember(
        "organization-1",
        "  USER@Example.COM  ",
      );

    expect(
      userRepositoryMocks.getUserByEmail,
    ).toHaveBeenCalledWith(
      "user@example.com",
    );

    expect(
      invitationServiceMocks.createOrganizationInvitation,
    ).toHaveBeenCalledWith(
      "organization-1",
      "user@example.com",
      "MEMBER",
    );

    expect(result).toEqual(
      invitation,
    );
  });

  it("rejects an existing user", async () => {
    const existingUser =
      createUser();

    userRepositoryMocks.getUserByEmail.mockResolvedValue(
      existingUser,
    );

    await expect(
      addOrganizationMember(
        "organization-1",
        "user@example.com",
      ),
    ).rejects.toThrow(
      "User already exists",
    );

    expect(
      invitationServiceMocks.createOrganizationInvitation,
    ).not.toHaveBeenCalled();
  });
});

describe("updateOrganizationMemberRole", () => {
  it("rejects a user that does not exist", async () => {
    userRepositoryMocks.getUserById.mockResolvedValue(
      null,
    );

    await expect(
      updateOrganizationMemberRole(
        "organization-1",
        "missing-user",
        "ADMIN",
      ),
    ).rejects.toThrow(
      "User not found",
    );

    expect(
      userRepositoryMocks.updateUserRole,
    ).not.toHaveBeenCalled();
  });

  it("rejects a user from another organization", async () => {
    userRepositoryMocks.getUserById.mockResolvedValue(
      createUser({
        organizationId: "other-organization",
      }),
    );

    await expect(
      updateOrganizationMemberRole(
        "organization-1",
        "user-1",
        "ADMIN",
      ),
    ).rejects.toThrow(
      "User does not belong to organization",
    );

    expect(
      userRepositoryMocks.updateUserRole,
    ).not.toHaveBeenCalled();
  });

  it("does not allow changing the OWNER role", async () => {
    userRepositoryMocks.getUserById.mockResolvedValue(
      createUser({
        role: "OWNER",
      }),
    );

    await expect(
      updateOrganizationMemberRole(
        "organization-1",
        "user-1",
        "MEMBER",
      ),
    ).rejects.toThrow(
      "Cannot change owner role",
    );

    expect(
      userRepositoryMocks.updateUserRole,
    ).not.toHaveBeenCalled();
  });

  it("updates a MEMBER to ADMIN", async () => {
    const member = createUser({
      role: "MEMBER",
    });

    const updatedMember =
      createUser({
        role: "ADMIN",
      });

    userRepositoryMocks.getUserById.mockResolvedValue(
      member,
    );

    userRepositoryMocks.updateUserRole.mockResolvedValue(
      updatedMember,
    );

    const result =
      await updateOrganizationMemberRole(
        "organization-1",
        "user-1",
        "ADMIN",
      );

    expect(
      userRepositoryMocks.updateUserRole,
    ).toHaveBeenCalledWith(
      "user-1",
      "ADMIN",
    );

    expect(result).toEqual(
      updatedMember,
    );
  });

  it("updates an ADMIN to MEMBER", async () => {
    const admin = createUser({
      role: "ADMIN",
    });

    const updatedMember =
      createUser({
        role: "MEMBER",
      });

    userRepositoryMocks.getUserById.mockResolvedValue(
      admin,
    );

    userRepositoryMocks.updateUserRole.mockResolvedValue(
      updatedMember,
    );

    const result =
      await updateOrganizationMemberRole(
        "organization-1",
        "user-1",
        "MEMBER",
      );

    expect(
      userRepositoryMocks.updateUserRole,
    ).toHaveBeenCalledWith(
      "user-1",
      "MEMBER",
    );

    expect(result).toEqual(
      updatedMember,
    );
  });

  it("rejects when the repository cannot update the role", async () => {
    userRepositoryMocks.getUserById.mockResolvedValue(
      createUser({
        role: "MEMBER",
      }),
    );

    userRepositoryMocks.updateUserRole.mockResolvedValue(
      null,
    );

    await expect(
      updateOrganizationMemberRole(
        "organization-1",
        "user-1",
        "ADMIN",
      ),
    ).rejects.toThrow(
      "Unable to update user role",
    );
  });
});
