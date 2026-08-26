import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const repositoryMocks = vi.hoisted(() => ({
  getOrganizationById: vi.fn(),
}));

const authMocks = vi.hoisted(() => ({
  hasPermission: vi.fn(),
}));

vi.mock(
  "../../src/repositories/organization.repository.js",
  () => ({
    getOrganizationById:
      repositoryMocks.getOrganizationById,
  }),
);

vi.mock(
  "../../src/auth/authorize.js",
  () => ({
    hasPermission:
      authMocks.hasPermission,
  }),
);

import { getOrganizationForUser } from "../../src/services/organization.service.js";

beforeEach(() => {
  vi.clearAllMocks();
});

function createUser(
  role:
    | "OWNER"
    | "ADMIN"
    | "MEMBER" = "OWNER",
) {
  return {
    id: "user-1",
    email: "user@example.com",
    createdAt:
      "2026-01-01T00:00:00.000Z",
    plan: "free",
    organizationId:
      "organization-1",
    role,
  };
}

function createOrganization() {
  return {
    id: "organization-1",
    name: "Example Organization",
    ownerId: "user-1",
    createdAt:
      "2026-01-01T00:00:00.000Z",
  };
}

describe("getOrganizationForUser", () => {
  it("returns the user's organization when the user has permission", async () => {
    const user = createUser();
    const organization =
      createOrganization();

    authMocks.hasPermission.mockReturnValue(
      true,
    );

    repositoryMocks.getOrganizationById.mockResolvedValue(
      organization,
    );

    const result =
      await getOrganizationForUser(
        user,
      );

    expect(
      authMocks.hasPermission,
    ).toHaveBeenCalledWith(
      user,
      "organization:read",
    );

    expect(
      repositoryMocks.getOrganizationById,
    ).toHaveBeenCalledWith(
      "organization-1",
    );

    expect(result).toEqual(
      organization,
    );
  });

  it("returns null when the user does not have permission", async () => {
    const user = createUser(
      "MEMBER",
    );

    authMocks.hasPermission.mockReturnValue(
      false,
    );

    const result =
      await getOrganizationForUser(
        user,
      );

    expect(result).toBeNull();

    expect(
      authMocks.hasPermission,
    ).toHaveBeenCalledWith(
      user,
      "organization:read",
    );

    expect(
      repositoryMocks.getOrganizationById,
    ).not.toHaveBeenCalled();
  });

  it("returns null when the organization does not exist", async () => {
    const user = createUser();

    authMocks.hasPermission.mockReturnValue(
      true,
    );

    repositoryMocks.getOrganizationById.mockResolvedValue(
      null,
    );

    const result =
      await getOrganizationForUser(
        user,
      );

    expect(result).toBeNull();

    expect(
      repositoryMocks.getOrganizationById,
    ).toHaveBeenCalledWith(
      "organization-1",
    );
  });

  it("returns null when the organization belongs to another organization", async () => {
    const user = createUser();

    authMocks.hasPermission.mockReturnValue(
      true,
    );

    repositoryMocks.getOrganizationById.mockResolvedValue(
      {
        ...createOrganization(),
        id: "organization-2",
      },
    );

    const result =
      await getOrganizationForUser(
        user,
      );

    expect(result).toBeNull();

    expect(
      repositoryMocks.getOrganizationById,
    ).toHaveBeenCalledWith(
      "organization-1",
    );
  });

  it("propagates repository errors", async () => {
    const user = createUser();

    authMocks.hasPermission.mockReturnValue(
      true,
    );

    repositoryMocks.getOrganizationById.mockRejectedValue(
      new Error(
        "Database unavailable",
      ),
    );

    await expect(
      getOrganizationForUser(
        user,
      ),
    ).rejects.toThrow(
      "Database unavailable",
    );
  });
});
