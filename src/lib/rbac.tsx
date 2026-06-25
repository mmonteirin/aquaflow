import React, { createContext, useContext, useState } from "react";

export type Role =
  | "Super Admin"
  | "Confederação"
  | "Federação"
  | "Clube"
  | "Árbitro"
  | "Técnico"
  | "Atleta"
  | "Público";

interface RBACContextType {
  role: Role;
  setRole: (role: Role) => void;
  // Permissions helpers
  canManageCompetitions: boolean;
  canRegisterAthletes: boolean;
  canEnterResults: boolean;
  canHomologateRecords: boolean;
  canFileProtests: boolean;
  canJudgeProtests: boolean;
  canViewFinances: boolean;
  canExportReports: boolean;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export const RBACProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aquaflow_role");
      return (saved as Role) || "Super Admin"; // Default to Super Admin for demo purposes
    }
    return "Super Admin";
  });

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (typeof window !== "undefined") {
      localStorage.setItem("aquaflow_role", newRole);
    }
  };

  // Define capability flags for each role
  const isSuperAdmin = role === "Super Admin";
  const isConfederation = role === "Confederação";
  const isFederation = role === "Federação";
  const isClub = role === "Clube";
  const isReferee = role === "Árbitro";
  const isCoach = role === "Técnico";
  const isAthlete = role === "Atleta";

  const canManageCompetitions = isSuperAdmin || isConfederation || isFederation;
  const canRegisterAthletes = isSuperAdmin || isConfederation || isFederation || isClub;
  const canEnterResults = isSuperAdmin || isReferee || isFederation;
  const canHomologateRecords = isSuperAdmin || isConfederation;
  const canFileProtests = isSuperAdmin || isClub || isCoach;
  const canJudgeProtests = isSuperAdmin || isReferee;
  const canViewFinances = isSuperAdmin || isConfederation || isFederation || isClub;
  const canExportReports = role !== "Público";

  return (
    <RBACContext.Provider
      value={{
        role,
        setRole,
        canManageCompetitions,
        canRegisterAthletes,
        canEnterResults,
        canHomologateRecords,
        canFileProtests,
        canJudgeProtests,
        canViewFinances,
        canExportReports,
      }}
    >
      {children}
    </RBACContext.Provider>
  );
};

export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error("useRBAC must be used within an RBACProvider");
  }
  return context;
};
