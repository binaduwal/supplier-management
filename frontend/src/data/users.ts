import type { User } from "../types/user";

export const USERS: User[] = [
  { id: "anna", name: "Anna Requester", roles: ["REQUESTER", "APPROVER"] },
  { id: "max", name: "Max Approver", roles: ["APPROVER"] },
];

export function getUserName(userId: string): string {
  return USERS.find((user) => user.id === userId)?.name ?? userId;
}
