// src/context/GlobalContext.js
import { createContext, useContext, useState, ReactNode } from "react";

type UserType = { id: string; email: string } | null;

const GlobalContext = createContext<{ user: UserType; setUser: (user: UserType) => void } | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType>(null);

  return (
    <GlobalContext.Provider value={{ user, setUser }}>
      {children}
    </GlobalContext.Provider>
  );
}

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobal must be used within GlobalProvider");
  }
  return context;
};
