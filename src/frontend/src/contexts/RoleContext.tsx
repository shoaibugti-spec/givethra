// src/frontend/src/contexts/RoleContext.tsx
// Givethra - Role Selection Context (in-memory only)

import React, { createContext, useContext, useState, ReactNode } from "react";

export type Role = "hero" | "requester" | null;

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  clearRole: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => {
    try {
      const stored = window.localStorage.getItem("givethra_role");
      return stored === "hero" || stored === "help_seeker" || stored === "requester" ? stored === "help_seeker" ? "requester" : stored : null;
    } catch {
      return null;
    }
  });

  const setRole = (nextRole: Role) => {
    setRoleState(nextRole);
    try {
      if (nextRole) window.localStorage.setItem("givethra_role", nextRole === "requester" ? "help_seeker" : nextRole);
      else window.localStorage.removeItem("givethra_role");
    } catch {
      // Storage restrictions must never block role switching.
    }
  };

  const clearRole = () => setRole(null);

  return (
    <RoleContext.Provider value={{ role, setRole, clearRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
