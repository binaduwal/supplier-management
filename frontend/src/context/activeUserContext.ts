import { createContext } from "react";
import type { User } from "../types/user";

export interface ActiveUserContextValue {
  users: User[];
  activeUser: User;
  setActiveUserId: (userId: string) => void;
}

export const ActiveUserContext = createContext<ActiveUserContextValue | null>(
  null,
);
