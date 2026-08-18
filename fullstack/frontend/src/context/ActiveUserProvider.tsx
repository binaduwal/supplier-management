import { useEffect, useMemo, useState, type ReactNode } from "react";
import { setHttpUserId } from "../api/http";
import { USERS } from "../data/users";
import {
  ActiveUserContext,
  type ActiveUserContextValue,
} from "./activeUserContext";

export function ActiveUserProvider({ children }: { children: ReactNode }) {
  const [activeUserId, setActiveUserIdState] = useState(USERS[0].id);

  useEffect(() => {
    setHttpUserId(activeUserId);
  }, [activeUserId]);

  const value = useMemo<ActiveUserContextValue>(() => {
    const activeUser =
      USERS.find((user) => user.id === activeUserId) ?? USERS[0];

    return {
      users: USERS,
      activeUser,
      setActiveUserId: (userId: string) => {
        const next = USERS.find((user) => user.id === userId);
        if (!next) {
          return;
        }
        setActiveUserIdState(next.id);
      },
    };
  }, [activeUserId]);

  return (
    <ActiveUserContext.Provider value={value}>
      {children}
    </ActiveUserContext.Provider>
  );
}
