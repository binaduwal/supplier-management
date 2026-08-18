export const USERS = [
  { id: "anna", name: "Anna", role: "REQUESTER" },
  { id: "max", name: "Max", role: "APPROVER" },
] as const;

export type UserId = (typeof USERS)[number]["id"];

const USER_IDS = new Set<string>(USERS.map((user) => user.id));

export function isKnownUserId(userId: string): userId is UserId {
  return USER_IDS.has(userId);
}
