import type { User } from "../types/user";

export const USERS: User[] = [
  { id: "anna", name: "Anna", role: "REQUESTER" },
  { id: "max", name: "Max", role: "APPROVER" },
];

export function getUserName(userId: string): string {
  return USERS.find((user) => user.id === userId)?.name ?? userId;
}

export function formatRole(user: User): string {
  return user.role === "REQUESTER" ? "Requester" : "Approver";
}
