import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import { dynamo } from "../config/aws.js";
import { env } from "../config/env.js";
import { User } from "../types/user.js";

export async function getUserById(
  id: string
): Promise<User | null> {
  const result = await dynamo.send(
    new GetCommand({
      TableName: env.usersTable,
      Key: { id },
    })
  );

  return (result.Item as User) ?? null;
}

export async function getUserByEmail(
  email: string
): Promise<User | null> {
  const result = await dynamo.send(
    new QueryCommand({
      TableName: env.usersTable,
      IndexName: "email-index",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
      Limit: 1,
    })
  );

  return (result.Items?.[0] as User) ?? null;
}

export async function createUser(
  user: User
): Promise<User> {
  await dynamo.send(
    new PutCommand({
      TableName: env.usersTable,
      Item: user,
    })
  );

  return user;
}

export async function getUsersByOrganizationId(
  organizationId: string
): Promise<User[]> {
  const result = await dynamo.send(
    new QueryCommand({
      TableName: env.usersTable,
      IndexName: "organization-index",
      KeyConditionExpression:
        "organizationId = :organizationId",
      ExpressionAttributeValues: {
        ":organizationId": organizationId,
      },
    })
  );

  return (result.Items as User[]) ?? [];
}

export async function updateUserRole(
  id: string,
  role: User["role"]
): Promise<User | null> {
  const result = await dynamo.send(
    new UpdateCommand({
      TableName: env.usersTable,
      Key: { id },

      UpdateExpression: "SET #role = :role",

      ExpressionAttributeNames: {
        "#role": "role",
      },

      ExpressionAttributeValues: {
        ":role": role,
      },

      ReturnValues: "ALL_NEW",
    })
  );

  return (result.Attributes as User) ?? null;
}
