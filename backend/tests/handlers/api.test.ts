import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const routeMocks = vi.hoisted(() => ({
  meRoute: vi.fn(),
  organizationRoute: vi.fn(),
  membersRoute: vi.fn(),
  addMemberRoute: vi.fn(),
  updateMemberRoleRoute: vi.fn(),
  invitationsRoute: vi.fn(),
  acceptInvitationRoute: vi.fn(),
}));

vi.mock(
  "../../src/routes/me.route.js",
  () => ({
    meRoute: routeMocks.meRoute,
  }),
);

vi.mock(
  "../../src/routes/organization.route.js",
  () => ({
    organizationRoute:
      routeMocks.organizationRoute,
  }),
);

vi.mock(
  "../../src/routes/members.route.js",
  () => ({
    membersRoute:
      routeMocks.membersRoute,
    addMemberRoute:
      routeMocks.addMemberRoute,
    updateMemberRoleRoute:
      routeMocks.updateMemberRoleRoute,
  }),
);

vi.mock(
  "../../src/routes/invitation.route.js",
  () => ({
    invitationsRoute:
      routeMocks.invitationsRoute,
    acceptInvitationRoute:
      routeMocks.acceptInvitationRoute,
  }),
);

import { handler } from "../../src/handlers/api.js";

function createEvent(
  overrides: Record<string, unknown> = {},
) {
  return {
    rawPath: "/members",
    body: undefined,
    requestContext: {
      http: {
        method: "GET",
      },
      authorizer: {
        jwt: {
          claims: {
            sub: "user-1",
            email: "user@example.com",
          },
        },
      },
    },
    ...overrides,
  };
}

function createUser(
  role: "OWNER" | "ADMIN" | "MEMBER" = "OWNER",
) {
  return {
    id: "user-1",
    email: "user@example.com",
    organizationId: "organization-1",
    role,
    plan: "free",
    createdAt:
      "2026-01-01T00:00:00.000Z",
  };
}

beforeEach(() => {
  vi.clearAllMocks();

  routeMocks.meRoute.mockResolvedValue({
    statusCode: 200,
    headers: {
      "Content-Type":
        "application/json",
    },
    body: JSON.stringify({
      user: createUser(),
    }),
  });
});

describe("handler authentication", () => {
  it("returns 401 when Cognito claims are missing", async () => {
    const event = createEvent({
      requestContext: {
        http: {
          method: "GET",
        },
        authorizer: {
          jwt: {
            claims: {},
          },
        },
      },
    });

    const response =
      await handler(event);

    expect(response.statusCode).toBe(401);

    expect(
      routeMocks.meRoute,
    ).not.toHaveBeenCalled();
  });

  it("returns 401 when the email claim is missing", async () => {
    const event = createEvent({
      requestContext: {
        http: {
          method: "GET",
        },
        authorizer: {
          jwt: {
            claims: {
              sub: "user-1",
            },
          },
        },
      },
    });

    const response =
      await handler(event);

    expect(response.statusCode).toBe(401);

    expect(
      routeMocks.meRoute,
    ).not.toHaveBeenCalled();
  });
});

describe("GET /invitations", () => {
  it("does not require an existing user in DynamoDB", async () => {
    routeMocks.invitationsRoute.mockResolvedValue({
      statusCode: 200,
      body: JSON.stringify({
        invitations: [],
      }),
    });

    const event = createEvent({
      rawPath: "/invitations",
      requestContext: {
        http: {
          method: "GET",
        },
        authorizer: {
          jwt: {
            claims: {
              sub: "user-1",
              email: "user@example.com",
            },
          },
        },
      },
    });

    const response =
      await handler(event);

    expect(
      routeMocks.invitationsRoute,
    ).toHaveBeenCalledWith(
      "user@example.com",
    );

    expect(
      routeMocks.meRoute,
    ).not.toHaveBeenCalled();

    expect(response.statusCode).toBe(200);
  });
});

describe("POST /invitations/accept", () => {
  it("returns 400 for invalid JSON", async () => {
    const event = createEvent({
      rawPath:
        "/invitations/accept",
      body: "{invalid-json",
      requestContext: {
        http: {
          method: "POST",
        },
        authorizer: {
          jwt: {
            claims: {
              sub: "user-1",
              email: "user@example.com",
            },
          },
        },
      },
    });

    const response =
      await handler(event);

    expect(response.statusCode).toBe(400);

    expect(
      routeMocks.acceptInvitationRoute,
    ).not.toHaveBeenCalled();
  });

  it("returns 400 when invitationId is missing", async () => {
    const event = createEvent({
      rawPath:
        "/invitations/accept",
      body: JSON.stringify({}),
      requestContext: {
        http: {
          method: "POST",
        },
        authorizer: {
          jwt: {
            claims: {
              sub: "user-1",
              email: "user@example.com",
            },
          },
        },
      },
    });

    const response =
      await handler(event);

    expect(response.statusCode).toBe(400);

    expect(
      routeMocks.acceptInvitationRoute,
    ).not.toHaveBeenCalled();
  });

  it("accepts a valid invitation request", async () => {
    routeMocks.acceptInvitationRoute.mockResolvedValue({
      statusCode: 200,
      body: JSON.stringify({
        message:
          "Invitation accepted",
      }),
    });

    const event = createEvent({
      rawPath:
        "/invitations/accept",
      body: JSON.stringify({
        invitationId:
          "invitation-1",
      }),
      requestContext: {
        http: {
          method: "POST",
        },
        authorizer: {
          jwt: {
            claims: {
              sub: "user-1",
              email: "user@example.com",
            },
          },
        },
      },
    });

    const response =
      await handler(event);

    expect(
      routeMocks.acceptInvitationRoute,
    ).toHaveBeenCalledWith(
      "invitation-1",
      "user@example.com",
    );

    expect(response.statusCode).toBe(200);
  });
});

describe("GET /members", () => {
  it("allows OWNER to read members", async () => {
    routeMocks.membersRoute.mockResolvedValue({
      statusCode: 200,
      body: JSON.stringify({
        members: [],
      }),
    });

    const event = createEvent({
      rawPath: "/members",
    });

    const response =
      await handler(event);

    expect(
      routeMocks.membersRoute,
    ).toHaveBeenCalledWith(
      "organization-1",
    );

    expect(response.statusCode).toBe(200);
  });

  it("allows MEMBER to read members", async () => {
    routeMocks.meRoute.mockResolvedValue({
      statusCode: 200,
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        user: createUser("MEMBER"),
      }),
    });

    routeMocks.membersRoute.mockResolvedValue({
      statusCode: 200,
      body: JSON.stringify({
        members: [],
      }),
    });

    const event = createEvent({
      rawPath: "/members",
    });

    const response =
      await handler(event);

    expect(
      routeMocks.membersRoute,
    ).toHaveBeenCalledWith(
      "organization-1",
    );

    expect(response.statusCode).toBe(200);
  });
});

describe("GET /organization", () => {
  it("passes the authenticated user to organizationRoute", async () => {
    routeMocks.organizationRoute.mockResolvedValue({
      statusCode: 200,
      body: JSON.stringify({
        organization: {
          id: "organization-1",
        },
      }),
    });

    const event = createEvent({
      rawPath: "/organization",
    });

    const response =
      await handler(event);

    expect(
      routeMocks.organizationRoute,
    ).toHaveBeenCalledWith(
      createUser("OWNER"),
    );

    expect(response.statusCode).toBe(200);
  });
});

describe("POST /members", () => {
  it("returns 400 for invalid JSON", async () => {
    const event = createEvent({
      rawPath: "/members",
      body: "{invalid",
      requestContext: {
        http: {
          method: "POST",
        },
        authorizer: {
          jwt: {
            claims: {
              sub: "user-1",
              email: "user@example.com",
            },
          },
        },
      },
    });

    const response =
      await handler(event);

    expect(response.statusCode).toBe(400);

    expect(
      routeMocks.addMemberRoute,
    ).not.toHaveBeenCalled();
  });

  it("returns 400 when email is missing", async () => {
    const event = createEvent({
      rawPath: "/members",
      body: JSON.stringify({}),
      requestContext: {
        http: {
          method: "POST",
        },
        authorizer: {
          jwt: {
            claims: {
              sub: "user-1",
              email: "user@example.com",
            },
          },
        },
      },
    });

    const response =
      await handler(event);

    expect(response.statusCode).toBe(400);

    expect(
      routeMocks.addMemberRoute,
    ).not.toHaveBeenCalled();
  });

  it("allows OWNER to add a member", async () => {
    routeMocks.addMemberRoute.mockResolvedValue({
      statusCode: 200,
      body: JSON.stringify({
        message:
          "Invitation created",
      }),
    });

    const event = createEvent({
      rawPath: "/members",
      body: JSON.stringify({
        email:
          "new@example.com",
      }),
      requestContext: {
        http: {
          method: "POST",
        },
        authorizer: {
          jwt: {
            claims: {
              sub: "user-1",
              email: "user@example.com",
            },
          },
        },
      },
    });

    const response =
      await handler(event);

    expect(
      routeMocks.addMemberRoute,
    ).toHaveBeenCalledWith(
      "organization-1",
      "new@example.com",
    );

    expect(response.statusCode).toBe(200);
  });

  it("rejects MEMBER from adding a member", async () => {
    routeMocks.meRoute.mockResolvedValue({
      statusCode: 200,
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        user: createUser("MEMBER"),
      }),
    });

    const event = createEvent({
      rawPath: "/members",
      body: JSON.stringify({
        email:
          "new@example.com",
      }),
      requestContext: {
        http: {
          method: "POST",
        },
        authorizer: {
          jwt: {
            claims: {
              sub: "user-1",
              email: "user@example.com",
            },
          },
        },
      },
    });

    const response =
      await handler(event);

    expect(response.statusCode).toBe(401);

    expect(
      routeMocks.addMemberRoute,
    ).not.toHaveBeenCalled();
  });
});

describe("POST /members/:id/role", () => {
  it("returns 400 for an invalid role", async () => {
    const event = createEvent({
      rawPath:
        "/members/user-2/role",
      body: JSON.stringify({
        role: "OWNER",
      }),
      requestContext: {
        http: {
          method: "POST",
        },
        authorizer: {
          jwt: {
            claims: {
              sub: "user-1",
              email: "user@example.com",
            },
          },
        },
      },
    });

    const response =
      await handler(event);

    expect(response.statusCode).toBe(400);

    expect(
      routeMocks.updateMemberRoleRoute,
    ).not.toHaveBeenCalled();
  });

  it("allows OWNER to update a member role", async () => {
    routeMocks.updateMemberRoleRoute.mockResolvedValue({
      statusCode: 200,
      body: JSON.stringify({
        message:
          "Backend connected",
      }),
    });

    const event = createEvent({
      rawPath:
        "/members/user-2/role",
      body: JSON.stringify({
        role: "ADMIN",
      }),
      requestContext: {
        http: {
          method: "POST",
        },
        authorizer: {
          jwt: {
            claims: {
              sub: "user-1",
              email: "user@example.com",
            },
          },
        },
      },
    });

    const response =
      await handler(event);

    expect(
      routeMocks.updateMemberRoleRoute,
    ).toHaveBeenCalledWith(
      "organization-1",
      "user-2",
      "ADMIN",
    );

    expect(response.statusCode).toBe(200);
  });

  it("rejects MEMBER from updating roles", async () => {
    routeMocks.meRoute.mockResolvedValue({
      statusCode: 200,
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        user: createUser("MEMBER"),
      }),
    });

    const event = createEvent({
      rawPath:
        "/members/user-2/role",
      body: JSON.stringify({
        role: "ADMIN",
      }),
      requestContext: {
        http: {
          method: "POST",
        },
        authorizer: {
          jwt: {
            claims: {
              sub: "user-1",
              email: "user@example.com",
            },
          },
        },
      },
    });

    const response =
      await handler(event);

    expect(response.statusCode).toBe(401);

    expect(
      routeMocks.updateMemberRoleRoute,
    ).not.toHaveBeenCalled();
  });
});
