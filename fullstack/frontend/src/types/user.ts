export type UserRole = "REQUESTER" | "APPROVER";

export interface User {
  id: "anna" | "max";
  name: string;
  role: UserRole;
}
