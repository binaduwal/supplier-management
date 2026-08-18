import { useContext } from "react";
import { ActiveUserContext } from "./activeUserContext";

export function useActiveUser() {
  const context = useContext(ActiveUserContext);
  if (!context) {
    throw new Error("useActiveUser must be used within ActiveUserProvider");
  }
  return context;
}
