import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import { dynamo } from "../config/aws.js";
import { env } from "../config/env.js";

export interface Invitation {
  id: string;
  email: string;
  organizationId: string;
  role: "ADMIN" | "MEMBER";
  status: "PENDING" | "ACCEPTED" | "EXPIRED";
  createdAt: string;
  expiresAt: string;
}

export async function createInvitation(
  invitation: Invitation
): Promise<Invitation> {
  await dynamo.send(
    new PutCommand({
      TableName: env.invitationsTable,
      Item: invitation,
    })
  );

  return invitation;
}

export async function getInvitationById(
  id: string
): Promise<Invitation | null> {
  const result = await dynamo.send(
    new GetCommand({
      TableName: env.invitationsTable,
      Key: { id },
    })
  );

  return (result.Item as Invitation) ?? null;
}

export async function getPendingInvitationByEmail(
  email: string
): Promise<Invitation | null> {
  const result = await dynamo.send(
    new QueryCommand({
      TableName: env.invitationsTable,
      IndexName: "email-index",
      KeyConditionExpression:
        "email = :email",
      FilterExpression:
        "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":email": email,
        ":status": "PENDING",
      },
      Limit: 1,
    })
  );

  return (
    (result.Items?.[0] as Invitation) ??
    null
  );
}

export async function getPendingInvitationsByEmail(
  email: string
): Promise<Invitation[]> {
  const result = await dynamo.send(
    new QueryCommand({
      TableName: env.invitationsTable,
      IndexName: "email-index",
      KeyConditionExpression:
        "email = :email",
      FilterExpression:
        "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":email": email,
        ":status": "PENDING",
      },
    })
  );

  return (
    (result.Items as Invitation[]) ?? []
  );
}

export async function updateInvitationStatus(
  id: string,
  status: Invitation["status"]
): Promise<Invitation | null> {
  const result = await dynamo.send(
    new UpdateCommand({
      TableName: env.invitationsTable,
      Key: { id },

      UpdateExpression:
        "SET #status = :status",

      ExpressionAttributeNames: {
        "#status": "status",
      },

      ExpressionAttributeValues: {
        ":status": status,
      },

      ReturnValues: "ALL_NEW",
    })
  );

  return (
    (result.Attributes as Invitation) ??
    null
  );
}
