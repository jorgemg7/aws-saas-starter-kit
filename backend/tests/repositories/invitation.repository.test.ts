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
    invitationsTable:
      "invitations-table",
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
  createInvitation,
  getInvitationById,
  getPendingInvitationByEmail,
  getPendingInvitationsByEmail,
  updateInvitationStatus,
} from "../../src/repositories/invitation.repository.js";

const invitation = {
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
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("invitation.repository", () => {
  it("creates an invitation", async () => {
    dynamoMock.send.mockResolvedValue({});

    const result =
      await createInvitation(
        invitation,
      );

    expect(result).toEqual(
      invitation,
    );

    const command =
      dynamoMock.send.mock.calls[0][0];

    expect(command.input).toEqual({
      TableName:
        "invitations-table",
      Item: invitation,
    });
  });

  it("gets an invitation by id", async () => {
    dynamoMock.send.mockResolvedValue({
      Item: invitation,
    });

    const result =
      await getInvitationById(
        "invitation-1",
      );

    expect(result).toEqual(
      invitation,
    );

    const command =
      dynamoMock.send.mock.calls[0][0];

    expect(command.input).toEqual({
      TableName:
        "invitations-table",
      Key: {
        id: "invitation-1",
      },
    });
  });

  it("returns null when invitation does not exist", async () => {
    dynamoMock.send.mockResolvedValue({
      Item: undefined,
    });

    const result =
      await getInvitationById(
        "missing",
      );

    expect(result).toBeNull();
  });

  it("gets one pending invitation by email", async () => {
    dynamoMock.send.mockResolvedValue({
      Items: [invitation],
    });

    const result =
      await getPendingInvitationByEmail(
        "user@example.com",
      );

    expect(result).toEqual(
      invitation,
    );

    const command =
      dynamoMock.send.mock.calls[0][0];

    expect(command.input).toEqual({
      TableName:
        "invitations-table",
      IndexName: "email-index",
      KeyConditionExpression:
        "email = :email",
      FilterExpression:
        "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":email":
          "user@example.com",
        ":status": "PENDING",
      },
      Limit: 1,
    });
  });

  it("returns null when no pending invitation exists", async () => {
    dynamoMock.send.mockResolvedValue({
      Items: [],
    });

    const result =
      await getPendingInvitationByEmail(
        "missing@example.com",
      );

    expect(result).toBeNull();
  });

  it("gets all pending invitations by email", async () => {
    dynamoMock.send.mockResolvedValue({
      Items: [invitation],
    });

    const result =
      await getPendingInvitationsByEmail(
        "user@example.com",
      );

    expect(result).toEqual([
      invitation,
    ]);

    const command =
      dynamoMock.send.mock.calls[0][0];

    expect(command.input).toEqual({
      TableName:
        "invitations-table",
      IndexName: "email-index",
      KeyConditionExpression:
        "email = :email",
      FilterExpression:
        "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":email":
          "user@example.com",
        ":status": "PENDING",
      },
    });
  });

  it("returns an empty array when there are no pending invitations", async () => {
    dynamoMock.send.mockResolvedValue({
      Items: undefined,
    });

    const result =
      await getPendingInvitationsByEmail(
        "user@example.com",
      );

    expect(result).toEqual([]);
  });

  it("updates invitation status", async () => {
    const updatedInvitation = {
      ...invitation,
      status: "ACCEPTED" as const,
    };

    dynamoMock.send.mockResolvedValue({
      Attributes:
        updatedInvitation,
    });

    const result =
      await updateInvitationStatus(
        "invitation-1",
        "ACCEPTED",
      );

    expect(result).toEqual(
      updatedInvitation,
    );

    const command =
      dynamoMock.send.mock.calls[0][0];

    expect(command.input).toEqual({
      TableName:
        "invitations-table",
      Key: {
        id: "invitation-1",
      },
      UpdateExpression:
        "SET #status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": "ACCEPTED",
      },
      ReturnValues: "ALL_NEW",
    });
  });

  it("returns null when invitation update returns no attributes", async () => {
    dynamoMock.send.mockResolvedValue({
      Attributes: undefined,
    });

    const result =
      await updateInvitationStatus(
        "invitation-1",
        "EXPIRED",
      );

    expect(result).toBeNull();
  });
});
