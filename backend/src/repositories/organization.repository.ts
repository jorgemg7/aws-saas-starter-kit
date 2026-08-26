import {
  PutCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

import { dynamo } from "../config/aws.js";
import { env } from "../config/env.js";

import type { Organization } from "../types/organization.js";

export async function getOrganizationById(
  id: string,
): Promise<Organization | null> {
  const result = await dynamo.send(
    new GetCommand({
      TableName: env.organizationsTable,
      Key: {
        id,
      },
    }),
  );

  return (
    (result.Item as Organization) ??
    null
  );
}

export async function createOrganization(
  organization: Organization,
): Promise<Organization> {
  await dynamo.send(
    new PutCommand({
      TableName: env.organizationsTable,
      Item: organization,
    }),
  );

  return organization;
}
