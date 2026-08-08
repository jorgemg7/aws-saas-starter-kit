import {
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

import { dynamo } from "../config/aws.js";
import { env } from "../config/env.js";
import { User } from "../types/user.js";

export async function getUserById(
  id: string
): Promise<User | null> {

  const result =
    await dynamo.send(
      new GetCommand({
        TableName: env.usersTable,
        Key: { id },
      })
    );

  return (result.Item as User) ?? null;

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
