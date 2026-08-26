import { describe, expect, it } from "vitest";

import { hasPermission } from "../../src/auth/authorize.js";
import { PERMISSIONS } from "../../src/auth/permissions.js";
import type { User } from "../../src/types/user.js";

function createUser(
  role: User["role"],
): User {
  return {
    id: "test-user-id",
    email: "test@example.com",
    organizationId: "test-organization-id",
    role,
    plan: "free",
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("hasPermission", () => {
  it("allows OWNER to manage members", () => {
    const user = createUser("OWNER");

    expect(
      hasPermission(
        user,
        PERMISSIONS.MEMBERS_MANAGE,
      ),
    ).toBe(true);
  });

  it("allows ADMIN to manage members", () => {
    const user = createUser("ADMIN");

    expect(
      hasPermission(
        user,
        PERMISSIONS.MEMBERS_MANAGE,
      ),
    ).toBe(true);
  });

  it("does not allow MEMBER to manage members", () => {
    const user = createUser("MEMBER");

    expect(
      hasPermission(
        user,
        PERMISSIONS.MEMBERS_MANAGE,
      ),
    ).toBe(false);
  });

  it("allows OWNER to delete the organization", () => {
    const user = createUser("OWNER");

    expect(
      hasPermission(
        user,
        PERMISSIONS.ORGANIZATION_DELETE,
      ),
    ).toBe(true);
  });

  it("does not allow ADMIN to delete the organization", () => {
    const user = createUser("ADMIN");

    expect(
      hasPermission(
        user,
        PERMISSIONS.ORGANIZATION_DELETE,
      ),
    ).toBe(false);
  });

  it("does not allow MEMBER to delete the organization", () => {
    const user = createUser("MEMBER");

    expect(
      hasPermission(
        user,
        PERMISSIONS.ORGANIZATION_DELETE,
      ),
    ).toBe(false);
  });

  it("allows MEMBER to read members", () => {
    const user = createUser("MEMBER");

    expect(
      hasPermission(
        user,
        PERMISSIONS.MEMBERS_READ,
      ),
    ).toBe(true);
  });
});
