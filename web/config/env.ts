export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL!,
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
  userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
};

if (!env.apiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL no está definida");
}

if (!env.region) {
  throw new Error("NEXT_PUBLIC_AWS_REGION no está definida");
}

if (!env.userPoolId) {
  throw new Error("NEXT_PUBLIC_COGNITO_USER_POOL_ID no está definida");
}

if (!env.userPoolClientId) {
  throw new Error("NEXT_PUBLIC_COGNITO_CLIENT_ID no está definida");
}
