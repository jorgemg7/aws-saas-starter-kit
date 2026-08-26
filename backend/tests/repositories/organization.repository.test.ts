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
    organizationsTable:
      "organizations-table",
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
  getOrganizationById,
  createOrganization,
} from "../../src/repositories/organization.repository.js";

const organization = {
  id: "organization-1",
  name: "Example Organization",
  ownerId: "user-1",
  createdAt:
    "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("organization.repository", () => {
  it("gets an organization by id", async () => {
    dynamoMock.send.mockResolvedValue({
      Item: organization,
    });

    const result =
      await getOrganizationById(
        "organization-1",
      );

    expect(result).toEqual(
      organization,
    );

    expect(
      dynamoMock.send,
    ).toHaveBeenCalledTimes(1);

    const command =
      dynamoMock.send.mock.calls[0][0];

    expect(command.input).toEqual({
      TableName:
        "organizations-table",
      Key: {
        id: "organization-1",
      },
    });
  });

  it("returns null when organization does not exist", async () => {
    dynamoMock.send.mockResolvedValue({
      Item: undefined,
    });

    const result =
      await getOrganizationById(
        "missing",
      );

    expect(result).toBeNull();
  });

  it("creates an organization", async () => {
    dynamoMock.send.mockResolvedValue({});

    const result =
      await createOrganization(
        organization,
      );

    expect(result).toEqual(
      organization,
    );

    const command =
      dynamoMock.send.mock.calls[0][0];

    expect(command.input).toEqual({
      TableName:
        "organizations-table",
      Item: organization,
    });
  });
});
