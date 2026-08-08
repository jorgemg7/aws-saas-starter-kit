export interface User {
  id: string;
  email: string;
  createdAt: string;
  plan: string;
  organizationId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
}
