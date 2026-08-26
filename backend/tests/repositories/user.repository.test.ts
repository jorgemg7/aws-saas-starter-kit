import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const dynamoMock = vi.hoisted(() => ({
  send: vi.fn(),
}));

const envMock = vi.hoisted(() => ({
  env: {
    usersTable: "users-table",
    invitationsTable: "invitations-table",
    awsRegion: "eu-west-1",
    environment: "test",
  },
}));

vi.mock(
  "../../src/config/aws.js",
  () => ({
    dynamo: dynamoMock,
  }),
);

vi.mock(
  "../../src/config/env.js",
  () => envMock,
);

import {
  getUserById,
  getUserByEmail,
  createUser,
  getUsersByOrganizationId,
  updateUserRole,
} from "../../src/repositories/user.repository.js";

const user = {
  id: "user-1",
  email: "user@example.com",
  createdAt:
    "2026-01-01T00:00:00.000Z",
  plan: "free",
  organizationId:
    "organization-1",
  role: "MEMBER" as const,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("user.repository", () => {
  it("gets a user by id", async () => {
    dynamoMock.send.mockResolvedValue({
      Item: user,
    });

    const result =
      await getUserById("user-1");

    expect(result).toEqual(user);

    const command =
      dynamoMock.send.mock.calls[0][0];

    expect(command.input).toEqual({
      TableName: "users-table",
      Key: {
        id: "user-1",
      },
    });
  });

  it("returns null when user by id does not exist", async () => {
    dynamoMock.send.mockResolvedValue({
      Item: undefined,
    });

    const result =
      await getUserById("missing");

    expect(result).toBeNull();
  });

  it("gets a user by email using email-index", async () => {
    dynamoMock.send.mockResolvedValue({
      Items: [user],
    });

    const result =
      await getUserByEmail(
        "user@example.com",
      );

    expect(result).toEqual(user);

    const command =
      dynamoMock.send.mock.calls[0][0];

    expect(command.input).toEqual({
      TableName: "users-table",
      IndexName: "email-index",
      KeyConditionExpression:
        "email = :email",
      ExpressionAttributeValues: {
        ":email": "user@example.com",
      },
      Limit: 1,
    });
  });

  it("returns null when email query has no results", async () => {
    dynamoMock.send.mockResolvedValue({
      Items: [],
    });

    const result =
      await getUserByEmail(
        "missing@example.com",
      );

    expect(result).toBeNull();
  });

  it("creates a user", async () => {
    dynamoMock.send.mockResolvedValue({});

    const result =
      await createUser(user);

    expect(result).toEqual(user);

    const command =
      dynamoMock.send.mock.calls[0][0];

    expect(command.input).toEqual({
      TableName: "users-table",
      Item: user,
    });
  });

  it("gets users by organization id", async () => {
    dynamoMock.send.mockResolvedValue({
      Items: [user],
    });

    const result =
      await getUsersByOrganizationId(
        "organization-1",
      );

    expect(result).toEqual([user]);

    const command =
      dynamoMock.send.mock.calls[0][0];

    expect(command.input).toEqual({
      TableName: "users-table",
      IndexName: "organization-index",
      KeyConditionExpression:
        "organizationId = :organizationId",
      ExpressionAttributeValues: {
        ":organizationId":
          "organization-1",
      },
    });
  });

  it("returns an empty array when organization has no users", async () => {
    dynamoMock.send.mockResolvedValue({
      Items: undefined,
    });

    const result =
      await getUsersByOrganizationId(
        "organization-1",
      );

    expect(result).toEqual([]);
  });

  it("updates a user role", async () => {
    const updatedUser = {
      ...user,
      role: "ADMIN" as const,
    };

    dynamoMock.send.mockResolvedValue({
      Attributes: updatedUser,
    });

    const result =
      await updateUserRole(
        "user-1",
        "ADMIN",
      );

    expect(result).toEqual(
      updatedUser,
    );

    const command =
      dynamoMock.send.mock.calls[0][0];

    expect(command.input).toEqual({
      TableName: "users-table",
      Key: {
        id: "user-1",
      },
      UpdateExpression:
        "SET #role = :role",
      ExpressionAttributeNames: {
        "#role": "role",
      },
      ExpressionAttributeValues: {
        ":role": "ADMIN",
      },
      ReturnValues: "ALL_NEW",
    });
  });

  it("returns null when role update returns no attributes", async () => {
    dynamoMock.send.mockResolvedValue({
      Attributes: undefined,
    });

    const result =
      await updateUserRole(
        "user-1",
        "MEMBER",
      );

    expect(result).toBeNull();
  });
});
