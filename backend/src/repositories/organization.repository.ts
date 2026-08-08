import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

import { Organization } from "../types/organization.js";

const client = new DynamoDBClient({});

const dynamo =
  DynamoDBDocumentClient.from(client);

const TABLE_NAME =
  process.env.ORGANIZATIONS_TABLE!;

export async function getOrganizationById(
  id: string
): Promise<Organization | null> {

  const result =
    await dynamo.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          id,
        },
      })
    );

  return (
    result.Item as Organization
  ) ?? null;
}

export async function createOrganization(
  organization: Organization
): Promise<Organization> {

  await dynamo.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: organization,
    })
  );

  return organization;
}
