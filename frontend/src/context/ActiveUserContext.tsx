import { useMemo, useState, type ReactNode } from "react";
import { USERS } from "../data/users";
import {
  ActiveUserContext,
  type ActiveUserContextValue,
} from "./activeUserContext";

const ACTIVE_USER_STORAGE_KEY = "supplier-management.activeUserId";

function readStoredUserId(): string {
  try {
    const storedId = localStorage.getItem(ACTIVE_USER_STORAGE_KEY);
    if (storedId && USERS.some((user) => user.id === storedId)) {
      return storedId;
    }
  } catch {
  }
  return USERS[0].id;
}

export function ActiveUserProvider({ children }: { children: ReactNode }) {
  const [activeUserId, setActiveUserIdState] = useState(readStoredUserId);

  const value = useMemo<ActiveUserContextValue>(() => {
    const activeUser =
      USERS.find((user) => user.id === activeUserId) ?? USERS[0];

    return {
      users: USERS,
      activeUser,
      setActiveUserId: (userId: string) => {
        if (!USERS.some((user) => user.id === userId)) {
          return;
        }
        setActiveUserIdState(userId);
        try {
          localStorage.setItem(ACTIVE_USER_STORAGE_KEY, userId);
        } catch {
        }
      },
    };
  }, [activeUserId]);

  return (
    <ActiveUserContext.Provider value={value}>
      {children}
    </ActiveUserContext.Provider>
  );
}
