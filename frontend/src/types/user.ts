export type Role = "REQUESTER" | "APPROVER";

export interface User {
  id: string;
  name: string;
  roles: Role[];
}

export function hasRole(user: User, role: Role): boolean {
  return user.roles.includes(role);
}

export function formatRoles(user: User): string {
  return user.roles
    .map((role) => (role === "REQUESTER" ? "Requester" : "Approver"))
    .join(", ");
}
