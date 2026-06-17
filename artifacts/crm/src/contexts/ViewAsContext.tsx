import { createContext, useContext, useState, type ReactNode } from "react";
import type { MockTeamMember } from "../lib/enterpriseData";

export interface ViewAsEntry {
  member: MockTeamMember;
  startedAt: string;
}

interface ViewAsContextType {
  viewAs: ViewAsEntry | null;
  startViewAs: (m: MockTeamMember) => void;
  stopViewAs: () => void;
}

const Ctx = createContext<ViewAsContextType>({
  viewAs: null,
  startViewAs: () => {},
  stopViewAs: () => {},
});

export function ViewAsProvider({ children }: { children: ReactNode }) {
  const [viewAs, setViewAs] = useState<ViewAsEntry | null>(null);
  return (
    <Ctx.Provider value={{
      viewAs,
      startViewAs: (m) => setViewAs({ member: m, startedAt: new Date().toISOString() }),
      stopViewAs: () => setViewAs(null),
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useViewAs() {
  return useContext(Ctx);
}
