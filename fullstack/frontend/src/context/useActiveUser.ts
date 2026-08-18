import { useContext } from "react";
import { ActiveUserContext } from "./activeUserContext";

export function useActiveUser() {
  const value = useContext(ActiveUserContext);
  if (!value) {
    throw new Error("useActiveUser must be used within ActiveUserProvider");
  }
  return value;
}
