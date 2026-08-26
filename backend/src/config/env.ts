export const env = {
  environment:
    process.env.ENVIRONMENT ?? "dev",

  usersTable:
    process.env.USERS_TABLE ?? "",

  invitationsTable:
    process.env.INVITATIONS_TABLE ?? "",

  organizationsTable:
    process.env.ORGANIZATIONS_TABLE ?? "",

  awsRegion:
    process.env.AWS_REGION ?? "eu-west-1",
};
