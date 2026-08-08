export const env = {
  environment:
    process.env.ENVIRONMENT ?? "dev",

  usersTable:
    process.env.USERS_TABLE ?? "",

  awsRegion:
    process.env.AWS_REGION ?? "eu-west-1",
};
