import { useContext } from "react";
import { AuthContext } from "../contexts/auth";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context)
    throw new Error("You must be use this hook inside of AuthProvider");

  return context;
};
