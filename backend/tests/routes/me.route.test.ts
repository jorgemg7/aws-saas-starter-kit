import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const serviceMocks = vi.hoisted(() => ({
  getOrCreateUser: vi.fn(),
}));

vi.mock(
  "../../src/services/user.service.js",
  () => ({
    getOrCreateUser:
      serviceMocks.getOrCreateUser,
  }),
);

import { meRoute } from "../../src/routes/me.route.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("meRoute", () => {
  it("returns the authenticated user", async () => {
    const user = {
      id: "user-1",
      email: "user@example.com",
      organizationId:
        "organization-1",
      role: "OWNER" as const,
      plan: "free",
      createdAt:
        "2026-01-01T00:00:00.000Z",
    };

    serviceMocks.getOrCreateUser.mockResolvedValue(
      user,
    );

    const response = await meRoute(
      "user-1",
      "user@example.com",
    );

    expect(
      serviceMocks.getOrCreateUser,
    ).toHaveBeenCalledWith(
      "user-1",
      "user@example.com",
    );

    expect(response.statusCode).toBe(200);

    expect(
      JSON.parse(response.body),
    ).toEqual({
      message:
        "Backend funcionando 🚀",
      user,
    });
  });

  it("returns 400 when a pending invitation must be accepted", async () => {
    serviceMocks.getOrCreateUser.mockRejectedValue(
      new Error(
        "Pending invitation must be accepted",
      ),
    );

    const response = await meRoute(
      "user-1",
      "user@example.com",
    );

    expect(response.statusCode).toBe(400);

    expect(
      JSON.parse(response.body),
    ).toEqual({
      message:
        "Pending invitation must be accepted",
    });
  });

  it("propagates unexpected errors", async () => {
    serviceMocks.getOrCreateUser.mockRejectedValue(
      new Error("Database unavailable"),
    );

    await expect(
      meRoute(
        "user-1",
        "user@example.com",
      ),
    ).rejects.toThrow(
      "Database unavailable",
    );
  });
});
