import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const serviceMocks = vi.hoisted(() => ({
  getOrganizationInvitations: vi.fn(),
  acceptOrganizationInvitation: vi.fn(),
}));

vi.mock(
  "../../src/services/invitation.service.js",
  () => ({
    getOrganizationInvitations:
      serviceMocks.getOrganizationInvitations,

    acceptOrganizationInvitation:
      serviceMocks.acceptOrganizationInvitation,
  }),
);

import {
  invitationsRoute,
  acceptInvitationRoute,
} from "../../src/routes/invitation.route.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("invitationsRoute", () => {
  it("returns pending invitations", async () => {
    const invitations = [
      {
        id: "invitation-1",
        email: "user@example.com",
        organizationId: "organization-1",
        role: "MEMBER" as const,
        status: "PENDING" as const,
        createdAt:
          "2026-01-01T00:00:00.000Z",
        expiresAt:
          "2026-01-08T00:00:00.000Z",
      },
    ];

    serviceMocks.getOrganizationInvitations.mockResolvedValue(
      invitations,
    );

    const response =
      await invitationsRoute(
        "user@example.com",
      );

    expect(
      serviceMocks.getOrganizationInvitations,
    ).toHaveBeenCalledWith(
      "user@example.com",
    );

    expect(response.statusCode).toBe(200);

    expect(
      JSON.parse(response.body),
    ).toEqual({
      message: "Backend funcionando 🚀",
      invitations,
    });
  });

  it("propagates unexpected service errors", async () => {
    serviceMocks.getOrganizationInvitations.mockRejectedValue(
      new Error("Database unavailable"),
    );

    await expect(
      invitationsRoute(
        "user@example.com",
      ),
    ).rejects.toThrow(
      "Database unavailable",
    );
  });
});

describe("acceptInvitationRoute", () => {
  it("accepts a valid invitation", async () => {
    const user = {
      id: "user-1",
      email: "user@example.com",
      organizationId:
        "organization-1",
      role: "MEMBER" as const,
      plan: "free",
      createdAt:
        "2026-01-01T00:00:00.000Z",
    };

    serviceMocks.acceptOrganizationInvitation.mockResolvedValue(
      user,
    );

    const response =
      await acceptInvitationRoute(
        "invitation-1",
        "user@example.com",
      );

    expect(
      serviceMocks.acceptOrganizationInvitation,
    ).toHaveBeenCalledWith(
      "invitation-1",
      "user@example.com",
    );

    expect(response.statusCode).toBe(200);

    expect(
      JSON.parse(response.body),
    ).toEqual({
      message: "Backend funcionando 🚀",
      user,
    });
  });

  it.each([
    "Invitation not found",
    "Invitation is not pending",
    "Invitation email does not match",
    "Invitation has expired",
    "User already exists",
    "Unable to update invitation",
  ])(
    "returns 400 for service error: %s",
    async (message) => {
      serviceMocks.acceptOrganizationInvitation.mockRejectedValue(
        new Error(message),
      );

      const response =
        await acceptInvitationRoute(
          "invitation-1",
          "user@example.com",
        );

      expect(
        response.statusCode,
      ).toBe(400);

      expect(
        JSON.parse(response.body),
      ).toEqual({
        message,
      });
    },
  );

  it("propagates unexpected errors", async () => {
    serviceMocks.acceptOrganizationInvitation.mockRejectedValue(
      new Error("Database unavailable"),
    );

    await expect(
      acceptInvitationRoute(
        "invitation-1",
        "user@example.com",
      ),
    ).rejects.toThrow(
      "Database unavailable",
    );
  });
});
